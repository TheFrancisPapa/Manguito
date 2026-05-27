// src/hooks/useNoticias.js
// Hook para el feed de noticias financieras.
// Maneja fetch de noticias, filtrado por categoría y resúmenes con IA.

import { useState, useCallback, useEffect, useRef } from 'react'
import { supabase } from '../lib/supabase'

/**
 * useNoticias — hook para el feed de noticias financieras.
 *
 * @returns {{
 *   noticias: Array,
 *   cargando: boolean,
 *   cargandoResumen: boolean,
 *   error: string|null,
 *   resumen: string|null,
 *   categoriaActiva: string|null,
 *   setCategoriaActiva: (cat: string|null) => void,
 *   resumir: (articulo: Object) => Promise<void>,
 *   refrescar: () => Promise<void>,
 *   limpiarResumen: () => void,
 * }}
 */
export function useNoticias() {
  const [noticias, setNoticias]               = useState([])
  const [cargando, setCargando]               = useState(true)
  const [cargandoResumen, setCargandoResumen] = useState(false)
  const [error, setError]                     = useState(null)
  const [resumen, setResumen]                 = useState(null)
  const [categoriaActiva, _setCategoriaActiva] = useState(null)

  const abortRef     = useRef(null)
  const categoriaRef = useRef(null)

  // ── Fetch noticias ──────────────────────────────────
  const fetchNoticias = useCallback(async (categoria = null) => {
    abortRef.current?.abort()
    abortRef.current = new AbortController()

    setCargando(true)
    setError(null)

    try {
      const body = { limite: 30 }
      if (categoria) body.categoria = categoria

      const response = await fetch('/api/noticias', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
        signal: abortRef.current.signal,
      })

      if (!response.ok) {
        const err = await response.json().catch(() => ({}))
        throw new Error(err.error || `Error ${response.status} al cargar noticias`)
      }

      const data = await response.json()
      setNoticias(Array.isArray(data) ? data : data.noticias ?? [])
    } catch (err) {
      if (err.name === 'AbortError') return
      setError(err.message || 'Error al cargar noticias. Intentá de nuevo.')
    } finally {
      setCargando(false)
    }
  }, [])

  // ── Set categoría activa + re-fetch ─────────────────
  const setCategoriaActiva = useCallback((cat) => {
    categoriaRef.current = cat
    _setCategoriaActiva(cat)
    fetchNoticias(cat)
  }, [fetchNoticias])

  // ── Refrescar (re-fetch with current filter) ────────
  const refrescar = useCallback(() => {
    return fetchNoticias(categoriaRef.current)
  }, [fetchNoticias])

  // ── Resumir artículo con IA (requiere auth) ─────────
  const resumir = useCallback(async (articulo) => {
    setCargandoResumen(true)
    setResumen(null)
    setError(null)

    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) throw new Error('Sesión no encontrada. Iniciá sesión para usar la IA.')

      const response = await fetch('/api/noticias', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          _action: 'resumir',
          titulo: articulo.titulo,
          descripcion: articulo.descripcion,
          url: articulo.url,
        }),
      })

      if (!response.ok) {
        const err = await response.json().catch(() => ({}))
        throw new Error(err.error || `Error ${response.status} al generar resumen`)
      }

      const data = await response.json()
      setResumen(data.text ?? data.resumen ?? '')
    } catch (err) {
      setError(err.message || 'Error al generar el resumen. Intentá de nuevo.')
    } finally {
      setCargandoResumen(false)
    }
  }, [])

  // ── Limpiar resumen ─────────────────────────────────
  const limpiarResumen = useCallback(() => {
    setResumen(null)
    setError(null)
  }, [])

  // ── Auto-fetch on mount ─────────────────────────────
  useEffect(() => {
    fetchNoticias(null)
    return () => abortRef.current?.abort()
  }, [fetchNoticias])

  return {
    noticias,
    cargando,
    cargandoResumen,
    error,
    resumen,
    categoriaActiva,
    setCategoriaActiva,
    resumir,
    refrescar,
    limpiarResumen,
  }
}
