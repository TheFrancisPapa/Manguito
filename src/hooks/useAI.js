// src/hooks/useAI.js
// Hook reutilizable para llamar a la IA desde cualquier componente.
// Maneja auth, loading, error y cache de respuestas.

import { useState, useCallback, useRef } from 'react'
import { supabase } from '../lib/supabase'

/**
 * useAI — hook para llamadas contextuales a la IA de Manguito.
 *
 * @param {Object} opciones
 * @param {string} opciones.systemPrompt  — instrucción de sistema base para este contexto
 * @param {number} opciones.maxTokens     — límite de tokens (default: 800)
 * @returns {{ analizar, resultado, cargando, error, limpiar }}
 */
export function useAI({ systemPrompt = '', maxTokens = 800 } = {}) {
  const [resultado, setResultado] = useState(null)
  const [cargando, setCargando]   = useState(false)
  const [error, setError]         = useState(null)
  const abortRef                  = useRef(null)

  const analizar = useCallback(async (prompt, opciones = {}) => {
    // Cancelar petición anterior si existe
    abortRef.current?.abort()
    abortRef.current = new AbortController()

    setCargando(true)
    setError(null)

    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) throw new Error('Sesión no encontrada. Iniciá sesión para usar la IA.')

      const response = await fetch('/api/chat', {
        method:  'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          system:     opciones.systemPrompt ?? systemPrompt,
          messages:   [{ role: 'user', content: prompt }],
          max_tokens: opciones.maxTokens ?? maxTokens,
        }),
        signal: abortRef.current.signal,
      })

      if (!response.ok) {
        const err = await response.json().catch(() => ({}))
        throw new Error(err.error || `Error ${response.status} al contactar la IA`)
      }

      const data = await response.json()
      const texto = data.text ?? ''

      // Si el resultado es JSON, intentamos parsearlo
      if (texto.trim().startsWith('{') || texto.trim().startsWith('[')) {
        try {
          const parsed = JSON.parse(texto.replace(/```json|```/g, '').trim())
          setResultado(parsed)
          return parsed
        } catch {
          // No es JSON válido, devolver como texto
        }
      }

      setResultado(texto)
      return texto
    } catch (err) {
      if (err.name === 'AbortError') return null
      setError(err.message || 'Error al conectar con la IA. Intentá de nuevo.')
      return null
    } finally {
      setCargando(false)
    }
  }, [systemPrompt, maxTokens])

  const limpiar = useCallback(() => {
    abortRef.current?.abort()
    setResultado(null)
    setError(null)
  }, [])

  return { analizar, resultado, cargando, error, limpiar }
}