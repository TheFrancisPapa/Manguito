// api/chat.js
// Proxy serverless para la API de Google Gemini — evita exponer la API key en el frontend.
// Se ejecuta en los servidores de Vercel (serverless function).

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' })
  }

  const { system, messages, max_tokens = 1000 } = req.body

  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ error: 'Se requiere el campo "messages" (array)' })
  }

  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) {
    console.error('[chat] Falta la variable de entorno GEMINI_API_KEY')
    return res.status(500).json({ error: 'El servidor no está configurado correctamente' })
  }

  try {
    // Gemini usa "model" en lugar de "assistant" para el rol del asistente
    const contents = messages.map(m => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }],
    }))

    const body = {
      // System prompt va aparte en Gemini
      system_instruction: system
        ? { parts: [{ text: system }] }
        : undefined,
      contents,
      generationConfig: {
        maxOutputTokens: max_tokens,
        temperature: 0.7,
      },
    }

    // gemini-2.0-flash es el modelo rápido actual de Google
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

    // Extraemos el texto de la respuesta de Gemini
    const text = data.candidates?.[0]?.content?.parts
      ?.map(p => p.text)
      .join('\n') || ''

    if (!text) {
      // Puede pasar si Gemini bloquea la respuesta por safety filters
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
    return res.status(500).json({
      error: 'Error interno del servidor. Intentá de nuevo.',
    })
  }
}