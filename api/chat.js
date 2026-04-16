// api/chat.js
import { createClient } from '@supabase/supabase-js'

// ── Configuración ────────────────────────────────────────────────
const DAILY_MESSAGE_LIMIT = 20 // Máximo de mensajes por usuario por día

// Crea un cliente Supabase con service-role (nunca expuesto al front).
function getSupabaseAdmin() {
  return createClient(
    process.env.VITE_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
  )
}

// Verifica que el Bearer token pertenece a un usuario real de Supabase.
// Devuelve el user object o null.
async function getAuthUser(req, supabase) {
  const authHeader = req.headers.authorization ?? ''
  if (!authHeader.startsWith('Bearer ')) return null

  const token = authHeader.slice(7).trim()
  if (!token) return null

  const { data: { user }, error } = await supabase.auth.getUser(token)
  if (error || !user) return null
  return user
}

// Cuenta cuántos mensajes envió el usuario hoy y valida el límite.
// Devuelve { allowed: boolean, used: number, limit: number }
async function checkRateLimit(userId, supabase) {
  const todayStart = new Date()
  todayStart.setHours(0, 0, 0, 0)

  const { count, error } = await supabase
    .from('ai_usage')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .gte('created_at', todayStart.toISOString())

  if (error) {
    console.error('[chat] Error al verificar uso:', error.message)
    // En caso de error de BD, dejamos pasar para no bloquear al usuario
    return { allowed: true, used: 0, limit: DAILY_MESSAGE_LIMIT }
  }

  return {
    allowed: (count || 0) < DAILY_MESSAGE_LIMIT,
    used: count || 0,
    limit: DAILY_MESSAGE_LIMIT,
  }
}

// Registra un uso del asistente IA
async function recordUsage(userId, supabase) {
  const { error } = await supabase
    .from('ai_usage')
    .insert({ user_id: userId })

  if (error) {
    console.error('[chat] Error al registrar uso:', error.message)
  }
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' })
  }

  const supabase = getSupabaseAdmin()

  // ── Autenticación obligatoria ────────────────────────────────
  const user = await getAuthUser(req, supabase)
  if (!user) {
    return res.status(401).json({ error: 'No autorizado. Iniciá sesión para usar el asistente.' })
  }

  // ── Límite de mensajes diarios ───────────────────────────────
  const rateLimit = await checkRateLimit(user.id, supabase)
  if (!rateLimit.allowed) {
    return res.status(429).json({
      error: `Alcanzaste el límite de ${rateLimit.limit} mensajes por día. Volvé a intentar mañana.`,
      usage: { used: rateLimit.used, limit: rateLimit.limit },
    })
  }
  // ─────────────────────────────────────────────────────────────

  const { system, messages, max_tokens = 1000 } = req.body

  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ error: 'Se requiere el campo "messages" (array)' })
  }

  // Limitamos max_tokens server-side sin importar lo que mande el cliente
  const tokensLimitados = Math.min(Number(max_tokens) || 600, 800)

  const apiKey = process.env.GROQ_API_KEY
  if (!apiKey) {
    console.error('[chat] Falta GROQ_API_KEY')
    return res.status(500).json({ error: 'El servidor no está configurado correctamente' })
  }

  try {
    const url = 'https://api.groq.com/openai/v1/chat/completions'

    const body = {
      model: 'llama-3.3-70b-versatile',
      messages: [
        ...(system ? [{ role: 'system', content: system }] : []),
        ...messages
      ],
      max_tokens: tokensLimitados,
      temperature: 0.7,
    }

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify(body),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      console.error('[chat] Error de Groq:', response.status, errorData)
      return res.status(response.status).json({
        error: `Error al contactar la IA: ${errorData.error?.message || response.statusText}`,
      })
    }

    const data = await response.json()
    const text = data.choices?.[0]?.message?.content || ''

    if (!text) {
      console.warn('[chat] Respuesta vacía de Groq')
      return res.status(200).json({
        text: 'No pude generar una respuesta. Por favor, intentá de nuevo.',
      })
    }

    // ── Registrar uso SOLO si la respuesta fue exitosa ──────────
    await recordUsage(user.id, supabase)
    // ────────────────────────────────────────────────────────────

    res.setHeader('Cache-Control', 'no-store')
    return res.status(200).json({
      text,
      usage: { used: rateLimit.used + 1, limit: rateLimit.limit },
    })

  } catch (error) {
    console.error('[chat] Error interno:', error.message)
    return res.status(500).json({ error: 'Error interno del servidor. Intentá de nuevo.' })
  }
}