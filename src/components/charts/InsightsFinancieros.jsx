// src/components/charts/InsightsFinancieros.jsx
// Genera insights de salud financiera usando IA.
// Llama al proxy /api/chat con los datos del usuario.

import { useState, useCallback } from 'react'
import { Spinner } from '../ui'

const EMOJIS_INSIGHT = {
  positivo: '📈',
  negativo: '⚠️',
  neutro:   '💡',
  meta:     '🎯',
  ahorro:   '💰',
  gasto:    '💸',
}

/**
 * InsightsFinancieros
 * 
 * Props:
 *   balance      — { total_ingresos, total_gastos, saldo_neto }
 *   movimientos  — array de movimientos del mes
 *   presupuestos — array con presupuestos del mes
 *   metas        — array de metas activas
 *   moneda       — 'ARS' | 'USD'
 */
export function InsightsFinancieros({ balance, movimientos = [], presupuestos = [], metas = [], moneda = 'ARS' }) {
  const [insights, setInsights]   = useState(null)
  const [cargando, setCargando]   = useState(false)
  const [error, setError]         = useState(null)
  const [generado, setGenerado]   = useState(false)

  const generarInsights = useCallback(async () => {
    if (!balance) return
    setCargando(true)
    setError(null)

    try {
      // Preparar resumen de datos para la IA
      const gastosXCategoria = movimientos
        .filter(m => m.tipo === 'gasto')
        .reduce((acc, m) => {
          const cat = m.categorias?.nombre || 'Otros'
          acc[cat] = (acc[cat] || 0) + Number(m.monto)
          return acc
        }, {})

      const topGastos = Object.entries(gastosXCategoria)
        .sort(([,a],[,b]) => b - a)
        .slice(0, 5)
        .map(([cat, monto]) => `${cat}: $${Math.round(monto).toLocaleString('es-AR')}`)
        .join(', ')

      const presupuestosResumen = presupuestos
        .slice(0, 5)
        .map(p => `${p.categoria_nombre}: ${p.porcentaje?.toFixed(0)}% usado ($${Math.round(p.gastado).toLocaleString('es-AR')} de $${Math.round(p.limite_monto).toLocaleString('es-AR')}`)
        .join('; ')

      const metasResumen = metas
        .filter(m => m.estado === 'activa')
        .slice(0, 3)
        .map(m => {
          const pct = ((m.monto_actual / m.monto_objetivo) * 100).toFixed(0)
          return `${m.nombre}: ${pct}% ($${Math.round(m.monto_actual).toLocaleString('es-AR')} de $${Math.round(m.monto_objetivo).toLocaleString('es-AR')})`
        })
        .join('; ')

      const ingresos = Number(balance.total_ingresos || 0)
      const gastos   = Number(balance.total_gastos   || 0)
      const saldo    = ingresos - gastos
      const tasaAhorro = ingresos > 0 ? ((saldo / ingresos) * 100).toFixed(1) : 0

      const contexto = `
Usuario argentino. Moneda: ${moneda}. Mes actual.
- Ingresos: $${Math.round(ingresos).toLocaleString('es-AR')}
- Gastos: $${Math.round(gastos).toLocaleString('es-AR')}
- Saldo neto: $${Math.round(saldo).toLocaleString('es-AR')}
- Tasa de ahorro: ${tasaAhorro}%
- Top gastos por categoría: ${topGastos || 'sin datos'}
- Presupuestos: ${presupuestosResumen || 'sin presupuestos'}
- Metas de ahorro: ${metasResumen || 'sin metas'}
      `.trim()

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          system: `Sos ManguitoAI, un asesor financiero personal para argentinos. 
Analizás los datos financieros del usuario y generás 4-5 insights CONCRETOS y ACCIONABLES.
Cada insight debe ser una oración directa, sin rodeos, con datos específicos cuando sea posible.
Respondé SOLO con JSON válido, sin texto adicional, sin backticks, sin markdown:
{
  "salud": "excellent" | "good" | "warning" | "critical",
  "puntaje": número del 0 al 100,
  "resumen": "Una oración de resumen del estado financiero",
  "insights": [
    {
      "tipo": "positivo" | "negativo" | "neutro" | "meta" | "ahorro" | "gasto",
      "titulo": "Título corto (máx 40 chars)",
      "texto": "Insight concreto y accionable (máx 120 chars)"
    }
  ],
  "consejo_principal": "El consejo más importante para este mes (máx 150 chars)"
}`,
          messages: [{
            role: 'user',
            content: `Analizá mis finanzas del mes:\n\n${contexto}\n\nGenerá insights concretos basados en estos datos reales.`,
          }],
          max_tokens: 600,
        }),
      })

      if (!response.ok) throw new Error('Error al contactar la IA')

      const data = await response.json()
      const texto = data.text || ''

      // Parse robusto del JSON
      const jsonMatch = texto.match(/\{[\s\S]*\}/)
      if (!jsonMatch) throw new Error('Respuesta inválida de la IA')

      const parsed = JSON.parse(jsonMatch[0])
      setInsights(parsed)
      setGenerado(true)
    } catch (err) {
      console.error('Error generando insights:', err)
      setError('No se pudieron generar los insights. Intentá de nuevo.')
    } finally {
      setCargando(false)
    }
  }, [balance, movimientos, presupuestos, metas, moneda])

  // ── Colores por salud ─────────────────────────────────────
  const colorSalud = {
    excellent: { bg: 'bg-emerald-50 dark:bg-emerald-900/15', borde: 'border-emerald-200 dark:border-emerald-800/40', texto: 'text-emerald-700 dark:text-emerald-400', label: '💪 Excelente' },
    good:      { bg: 'bg-blue-50 dark:bg-blue-900/15',       borde: 'border-blue-200 dark:border-blue-800/40',       texto: 'text-blue-700 dark:text-blue-400',       label: '✅ Bien' },
    warning:   { bg: 'bg-amber-50 dark:bg-amber-900/15',     borde: 'border-amber-200 dark:border-amber-800/40',     texto: 'text-amber-700 dark:text-amber-400',     label: '⚠️ Atención' },
    critical:  { bg: 'bg-red-50 dark:bg-red-900/15',         borde: 'border-red-200 dark:border-red-800/40',         texto: 'text-red-700 dark:text-red-400',         label: '🚨 Crítico' },
  }

  const colorInsight = {
    positivo: 'text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20',
    negativo: 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20',
    neutro:   'text-zinc-600 dark:text-zinc-300 bg-zinc-50 dark:bg-zinc-800/50',
    meta:     'text-blue-700 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20',
    ahorro:   'text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20',
    gasto:    'text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20',
  }

  if (!balance) return null

  return (
    <div className="flex flex-col gap-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-sm font-bold text-zinc-800 dark:text-zinc-200">
            🧠 Salud Financiera
          </h2>
          <p className="text-xs text-zinc-400">Análisis inteligente de tu mes</p>
        </div>
        {!cargando && (
          <button
            onClick={generarInsights}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold
              bg-[var(--mango)]/10 dark:bg-[var(--mango)]/10
              text-[var(--mango-dark)] dark:text-[var(--mango)]
              border border-[var(--mango)]/20
              hover:bg-[var(--mango)]/20 transition-colors"
          >
            {generado ? '🔄 Actualizar' : '✨ Analizar'}
          </button>
        )}
      </div>

      {/* Estado de carga */}
      {cargando && (
        <div className="flex flex-col items-center justify-center gap-3 py-8
          bg-zinc-50 dark:bg-zinc-800/30 rounded-2xl border border-zinc-100 dark:border-zinc-800">
          <Spinner size={28} />
          <p className="text-xs text-zinc-400 animate-pulse">
            ManguitoAI está analizando tus finanzas...
          </p>
        </div>
      )}

      {/* Error */}
      {error && !cargando && (
        <div className="px-4 py-3 bg-red-50 dark:bg-red-900/15 border border-red-200 dark:border-red-800/40
          rounded-2xl text-xs text-red-600 dark:text-red-400">
          {error}
          <button onClick={generarInsights} className="ml-2 underline font-semibold">
            Reintentar
          </button>
        </div>
      )}

      {/* Insights generados */}
      {insights && !cargando && (
        <>
          {/* Puntaje de salud */}
          <div className={`rounded-2xl border p-4 ${colorSalud[insights.salud]?.bg} ${colorSalud[insights.salud]?.borde}`}>
            <div className="flex items-center justify-between mb-2">
              <p className={`text-sm font-bold ${colorSalud[insights.salud]?.texto}`}>
                {colorSalud[insights.salud]?.label}
              </p>
              <div className="flex items-center gap-2">
                <div className="w-24 h-2 bg-zinc-200 dark:bg-zinc-700 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-700"
                    style={{
                      width: `${insights.puntaje}%`,
                      background: insights.salud === 'excellent' ? '#10B981' :
                                  insights.salud === 'good' ? '#3B82F6' :
                                  insights.salud === 'warning' ? '#F59E0B' : '#EF4444'
                    }}
                  />
                </div>
                <span className={`text-sm font-black tabular-nums ${colorSalud[insights.salud]?.texto}`}>
                  {insights.puntaje}
                </span>
              </div>
            </div>
            <p className={`text-xs leading-relaxed ${colorSalud[insights.salud]?.texto} opacity-80`}>
              {insights.resumen}
            </p>
          </div>

          {/* Lista de insights */}
          <div className="flex flex-col gap-2">
            {(insights.insights || []).map((ins, i) => (
              <div key={i} className={`flex items-start gap-3 px-3 py-2.5 rounded-xl ${colorInsight[ins.tipo]}`}>
                <span className="text-base flex-shrink-0 mt-0.5">
                  {EMOJIS_INSIGHT[ins.tipo] || '💡'}
                </span>
                <div className="min-w-0">
                  <p className="text-xs font-bold leading-tight">{ins.titulo}</p>
                  <p className="text-xs mt-0.5 opacity-80 leading-relaxed">{ins.texto}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Consejo principal */}
          {insights.consejo_principal && (
            <div className="px-4 py-3 bg-[var(--mango)]/8 dark:bg-[var(--mango)]/5
              border border-[var(--mango)]/20 rounded-2xl">
              <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--mango-dark)] dark:text-[var(--mango)] mb-1">
                🎯 Consejo del mes
              </p>
              <p className="text-xs text-zinc-700 dark:text-zinc-300 leading-relaxed">
                {insights.consejo_principal}
              </p>
            </div>
          )}
        </>
      )}

      {/* Estado inicial (sin generar) */}
      {!insights && !cargando && !error && (
        <div
          onClick={generarInsights}
          className="flex flex-col items-center justify-center gap-2 py-6
            bg-zinc-50 dark:bg-zinc-800/30 rounded-2xl border border-dashed
            border-zinc-200 dark:border-zinc-700 cursor-pointer
            hover:border-[var(--mango)]/40 hover:bg-[var(--mango)]/5 transition-all"
        >
          <span className="text-3xl">🧠</span>
          <p className="text-sm font-semibold text-zinc-600 dark:text-zinc-400">
            Analizá tu salud financiera
          </p>
          <p className="text-xs text-zinc-400 text-center max-w-[200px]">
            ManguitoAI revisa tus datos y te da consejos personalizados
          </p>
          <span className="text-xs font-bold text-[var(--mango-dark)] dark:text-[var(--mango)] mt-1">
            Tap para analizar →
          </span>
        </div>
      )}
    </div>
  )
}