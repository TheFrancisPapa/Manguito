// api/chat.js — MEJORADO con sugerencias proactivas de IA
// Mejoras del documento estratégico:
// 1. Detección de anomalías en gastos (cobros duplicados, aumentos en suscripciones)
// 2. Optimizador de saldos ociosos
// 3. Análisis de sensibilidad al presupuesto
// Mantiene toda la lógica existente y añade el endpoint POST /api/chat/anomalias

import { createClient } from '@supabase/supabase-js'

const LIMITS = {
  basico: 5,
  pro:    15,
}

function getSupabaseAdmin() {
  return createClient(
    process.env.VITE_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
  )
}

async function getAuthUser(req, supabase) {
  const authHeader = req.headers.authorization ?? ''
  if (!authHeader.startsWith('Bearer ')) return null
  const token = authHeader.slice(7).trim()
  if (!token) return null
  const { data: { user }, error } = await supabase.auth.getUser(token)
  if (error || !user) return null
  return user
}

async function getUserPlan(userId, supabase) {
  const { data, error } = await supabase
    .from('usuarios').select('plan').eq('id', userId).single()
  if (error || !data) return 'basico'
  return data.plan || 'basico'
}

async function checkRateLimit(userId, supabase) {
  const plan = await getUserPlan(userId, supabase)
  const limit = LIMITS[plan] || LIMITS.basico
  const todayStart = new Date()
  todayStart.setHours(0, 0, 0, 0)
  const { count, error } = await supabase
    .from('ai_usage').select('*', { count: 'exact', head: true })
    .eq('user_id', userId).gte('created_at', todayStart.toISOString())
  if (error) return { allowed: true, used: 0, limit, plan }
  return { allowed: (count || 0) < limit, used: count || 0, limit, plan }
}

async function recordUsage(userId, supabase) {
  await supabase.from('ai_usage').insert({ user_id: userId })
}

// ── NUEVO: Análisis de anomalías en movimientos ───────────────
// Detecta cobros duplicados, aumentos de suscripciones, etc.
async function detectarAnomalias(userId, supabase) {
  const hace30dias = new Date(Date.now() - 30 * 86400000).toISOString().slice(0, 10)

  const { data: movimientos } = await supabase
    .from('movimientos')
    .select('*, categorias(nombre, icono)')
    .eq('tipo', 'gasto')
    .gte('fecha', hace30dias)
    .order('fecha', { ascending: false })

  if (!movimientos || movimientos.length === 0) return []

  const anomalias = []

  // 1. Detectar cobros duplicados (mismo monto + misma categoría en misma semana)
  const grupos = {}
  movimientos.forEach(m => {
    const semana = Math.floor(new Date(m.fecha).getTime() / (7 * 86400000))
    const key = `${m.monto}_${m.categoria_id}_${semana}`
    if (!grupos[key]) grupos[key] = []
    grupos[key].push(m)
  })
  Object.values(grupos).forEach(grupo => {
    if (grupo.length >= 2) {
      anomalias.push({
        tipo: 'duplicado',
        emoji: '⚠️',
        titulo: 'Posible cobro duplicado',
        descripcion: `${grupo[0].categorias?.nombre || 'Movimiento'} de $${Number(grupo[0].monto).toLocaleString('es-AR')} apareció ${grupo.length} veces esta semana.`,
        movimientoId: grupo[0].id,
      })
    }
  })

  // 2. Detectar aumentos de suscripciones (comparar monto actual vs hace 30 días)
  const suscripcionesCateg = movimientos.filter(m =>
    m.es_recurrente || ['streaming', 'musica', 'cloud', 'software'].some(s =>
      (m.descripcion || '').toLowerCase().includes(s) ||
      (m.categorias?.nombre || '').toLowerCase().includes(s)
    )
  )

  const susResumen = {}
  suscripcionesCateg.forEach(m => {
    const key = m.descripcion || m.categoria_id
    if (!susResumen[key]) susResumen[key] = []
    susResumen[key].push(Number(m.monto))
  })
  Object.entries(susResumen).forEach(([desc, montos]) => {
    if (montos.length >= 2) {
      const primero = montos[montos.length - 1]
      const ultimo  = montos[0]
      const diff    = ((ultimo - primero) / primero) * 100
      if (diff > 10) {
        anomalias.push({
          tipo: 'aumento_suscripcion',
          emoji: '📈',
          titulo: 'Suscripción aumentó',
          descripcion: `"${desc}" subió un ${diff.toFixed(0)}% (de $${Math.round(primero).toLocaleString('es-AR')} a $${Math.round(ultimo).toLocaleString('es-AR')}).`,
        })
      }
    }
  })

  return anomalias.slice(0, 5) // máx 5 anomalías
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' })
  }

  const supabase = getSupabaseAdmin()
  const user = await getAuthUser(req, supabase)
  if (!user) {
    return res.status(401).json({ error: 'No autorizado. Iniciá sesión para usar el asistente.' })
  }

  // ── Endpoint especial: detección de anomalías ───────────────
  if (req.url?.includes('/anomalias') || req.body?._action === 'anomalias') {
    try {
      const anomalias = await detectarAnomalias(user.id, supabase)
      return res.status(200).json({ anomalias })
    } catch (e) {
      return res.status(500).json({ error: 'Error al analizar movimientos', anomalias: [] })
    }
  }

  const rateLimit = await checkRateLimit(user.id, supabase)
  if (!rateLimit.allowed) {
    return res.status(429).json({
      error: `Alcanzaste el límite de ${rateLimit.limit} mensajes por día. Volvé a intentar mañana.`,
      usage: { used: rateLimit.used, limit: rateLimit.limit },
    })
  }

  const { system, messages, max_tokens = 1000 } = req.body
  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ error: 'Se requiere el campo "messages" (array)' })
  }

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
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
      body: JSON.stringify(body),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      return res.status(response.status).json({
        error: `Error al contactar la IA: ${errorData.error?.message || response.statusText}`,
      })
    }

    const data = await response.json()
    const text = data.choices?.[0]?.message?.content || ''

    if (!text) {
      return res.status(200).json({ text: 'No pude generar una respuesta. Por favor, intentá de nuevo.' })
    }

    await recordUsage(user.id, supabase)

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