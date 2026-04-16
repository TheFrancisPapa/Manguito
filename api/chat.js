// api/chat.js
import { createClient } from '@supabase/supabase-js'

// Verifica que el Bearer token pertenece a un usuario real de Supabase.
// Devuelve el user object o null.
async function getAuthUser(req) {
  const authHeader = req.headers.authorization ?? ''
  if (!authHeader.startsWith('Bearer ')) return null

  const token = authHeader.slice(7).trim()
  if (!token) return null

  // Usamos el service-role key para validar el JWT del usuario
  // sin exponerlo al frontend.
  const supabase = createClient(
    process.env.VITE_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
  )

  const { data: { user }, error } = await supabase.auth.getUser(token)
  if (error || !user) return null
  return user
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' })
  }

  // ── NUEVO: autenticación obligatoria ──────────────────────────
  const user = await getAuthUser(req)
  if (!user) {
    return res.status(401).json({ error: 'No autorizado. Iniciá sesión para usar el asistente.' })
  }
  // ─────────────────────────────────────────────────────────────

  const { system, messages, max_tokens = 1000 } = req.body

  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ error: 'Se requiere el campo "messages" (array)' })
  }

  // Limitamos max_tokens server-side sin importar lo que mande el cliente
  const tokensLimitados = Math.min(Number(max_tokens) || 1000, 1500)

  const apiKey = process.env.GROQ_API_KEY
  if (!apiKey) {
    console.error('[chat] Falta GROQ_API_KEY')
    return res.status(500).json({ error: 'El servidor no está configurado correctamente' })
  }

  try {
    const url = 'https://api.groq.com/openai/v1/chat/completions'
    
    // Simplificamos el formato a estándar OpenAI (usado por Groq)
    const body = {
      model: 'llama3-70b-8192', // El modelo más potente disponible en Groq
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

    res.setHeader('Cache-Control', 'no-store')
    return res.status(200).json({ text })

  } catch (error) {
    console.error('[chat] Error interno:', error.message)
    return res.status(500).json({ error: 'Error interno del servidor. Intentá de nuevo.' })
  }
}