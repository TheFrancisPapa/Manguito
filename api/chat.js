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

  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) {
    console.error('[chat] Falta GEMINI_API_KEY')
    return res.status(500).json({ error: 'El servidor no está configurado correctamente' })
  }

  try {
    const contents = messages.map(m => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }],
    }))

    const body = {
      system_instruction: system ? { parts: [{ text: system }] } : undefined,
      contents,
      generationConfig: {
        maxOutputTokens: tokensLimitados,
        temperature: 0.7,
      },
    }

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-lite:generateContent?key=${apiKey}`
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      console.error('[chat] Error de Gemini:', response.status, errorData)
      return res.status(response.status).json({
        error: `Error al contactar la IA: ${errorData.error?.message || response.statusText}`,
      })
    }

    const data = await response.json()
    const text = data.candidates?.[0]?.content?.parts?.map(p => p.text).join('\n') || ''

    if (!text) {
      const blockReason = data.candidates?.[0]?.finishReason
      console.warn('[chat] Respuesta vacía de Gemini, motivo:', blockReason)
      return res.status(200).json({
        text: 'No pude generar una respuesta para eso. Probá reformulando la pregunta.',
      })
    }

    res.setHeader('Cache-Control', 'no-store')
    return res.status(200).json({ text })

  } catch (error) {
    console.error('[chat] Error interno:', error.message)
    return res.status(500).json({ error: 'Error interno del servidor. Intentá de nuevo.' })
  }
}