// src/components/ai/AnomaliasBanner.jsx
// Detección proactiva de anomalías financieras — mejora del doc estratégico
// "Del Chat a la Ejecución: Agentes IA"
// Muestra alertas sobre: cobros duplicados, aumentos en suscripciones, saldos ociosos

import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'

/**
 * AnomaliasBanner
 * Se monta en la página de Chat / Dashboard para mostrar alertas proactivas.
 * El usuario puede descartar individualmente cada alerta.
 */
export function AnomaliasBanner({ className = '' }) {
  const [anomalias, setAnomalias]   = useState([])
  const [cargando, setCargando]     = useState(true)
  const [descartadas, setDescartadas] = useState(() => {
    try { return new Set(JSON.parse(localStorage.getItem('manguito_anomalias_vistas') || '[]')) }
    catch { return new Set() }
  })

  useEffect(() => {
    async function fetchAnomalias() {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        if (!session) return

        const res = await fetch('/api/chat', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({ _action: 'anomalias' }),
        })

        if (res.ok) {
          const data = await res.json()
          setAnomalias(data.anomalias || [])
        }
      } catch {
        // Silencioso — las anomalías son opcionales
      } finally {
        setCargando(false)
      }
    }
    fetchAnomalias()
  }, [])

  const descartar = (idx) => {
    const nuevas = new Set([...descartadas, idx])
    setDescartadas(nuevas)
    localStorage.setItem('manguito_anomalias_vistas', JSON.stringify([...nuevas]))
  }

  const visibles = anomalias.filter((_, i) => !descartadas.has(i))

  if (cargando || visibles.length === 0) return null

  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      <p className="text-[10px] font-extrabold uppercase tracking-widest text-amber-700 dark:text-amber-400 px-1">
        🤖 Alertas detectadas por IA
      </p>
      {visibles.map((a, i) => (
        <div key={i}
          className="flex items-start gap-3 px-4 py-3 rounded-2xl
            bg-amber-50 dark:bg-amber-900/15
            border border-amber-200 dark:border-amber-800/40
            animate-in fade-in slide-in-from-top-2 duration-300">
          <span className="text-xl flex-shrink-0 mt-0.5">{a.emoji}</span>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold text-amber-800 dark:text-amber-300 leading-tight">
              {a.titulo}
            </p>
            <p className="text-[11px] text-amber-700/80 dark:text-amber-400/70 mt-0.5 leading-relaxed">
              {a.descripcion}
            </p>
          </div>
          <button
            onClick={() => descartar(anomalias.indexOf(a))}
            className="text-amber-400 hover:text-amber-600 dark:hover:text-amber-200
              text-[10px] flex-shrink-0 transition-colors"
          >
            ✕
          </button>
        </div>
      ))}
    </div>
  )
}