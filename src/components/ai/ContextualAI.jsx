// src/components/ai/ContextualAI.jsx
// Widget de IA contextual que se incrusta en cualquier página.
// Recibe un "contexto" con datos de la sección y muestra insights específicos.

import { useState, useCallback } from 'react'
import { useAI } from '../../hooks/useAI'
import { Spinner } from '../ui'

// ── Íconos por tipo de insight ────────────────────────────────
const TIPO_META = {
  positivo: { emoji: '📈', color: 'text-emerald-700 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-900/20' },
  negativo: { emoji: '⚠️', color: 'text-red-600 dark:text-red-400',         bg: 'bg-red-50 dark:bg-red-900/15'         },
  consejo:  { emoji: '💡', color: 'text-amber-700 dark:text-amber-400',      bg: 'bg-amber-50 dark:bg-amber-900/15'     },
  accion:   { emoji: '🎯', color: 'text-blue-700 dark:text-blue-400',        bg: 'bg-blue-50 dark:bg-blue-900/15'       },
  alerta:   { emoji: '🔔', color: 'text-orange-700 dark:text-orange-400',    bg: 'bg-orange-50 dark:bg-orange-900/15'   },
  ahorro:   { emoji: '💰', color: 'text-emerald-700 dark:text-emerald-400',  bg: 'bg-emerald-50 dark:bg-emerald-900/15' },
  inversion:{ emoji: '📊', color: 'text-purple-700 dark:text-purple-400',    bg: 'bg-purple-50 dark:bg-purple-900/15'   },
}

// ── Gradiente de salud ────────────────────────────────────────
const SALUD_META = {
  excellent: { label: '💪 Excelente',  color: '#10B981', bg: 'from-emerald-500/10 to-emerald-500/5',  borde: 'border-emerald-200 dark:border-emerald-800/40' },
  good:      { label: '✅ Bien',        color: '#3B82F6', bg: 'from-blue-500/10 to-blue-500/5',        borde: 'border-blue-200 dark:border-blue-800/40'       },
  warning:   { label: '⚠️ Atención',   color: '#F59E0B', bg: 'from-amber-500/10 to-amber-500/5',      borde: 'border-amber-200 dark:border-amber-800/40'     },
  critical:  { label: '🚨 Crítico',    color: '#EF4444', bg: 'from-red-500/10 to-red-500/5',          borde: 'border-red-200 dark:border-red-800/40'         },
}

// ── Insight individual ────────────────────────────────────────
function InsightItem({ insight, animDelay = 0 }) {
  const meta = TIPO_META[insight.tipo] ?? TIPO_META.consejo
  return (
    <div
      className={`flex items-start gap-3 px-3 py-2.5 rounded-2xl ${meta.bg}
        animate-stagger opacity-0`}
      style={{ animationDelay: `${animDelay}ms`, animationFillMode: 'forwards' }}
    >
      <span className="text-base flex-shrink-0 mt-0.5 leading-none">{meta.emoji}</span>
      <div className="min-w-0">
        {insight.titulo && (
          <p className={`text-xs font-bold leading-tight mb-0.5 ${meta.color}`}>
            {insight.titulo}
          </p>
        )}
        <p className="text-xs text-zinc-600 dark:text-zinc-300 leading-relaxed">
          {insight.texto}
        </p>
      </div>
    </div>
  )
}

// ── Placeholder antes de analizar ────────────────────────────
function PlaceholderState({ label, onAnalizar, variant = 'default' }) {
  const isCompact = variant === 'compact'
  return (
    <div
      onClick={onAnalizar}
      className={`flex items-center gap-3 cursor-pointer rounded-2xl
        bg-gradient-to-r from-[var(--mango)]/6 to-[var(--mango)]/3
        border border-dashed border-[var(--mango)]/25
        hover:border-[var(--mango)]/50 hover:from-[var(--mango)]/10
        hover:to-[var(--mango)]/5 transition-all group
        ${isCompact ? 'px-3 py-2.5' : 'px-4 py-4'}`}
    >
      <div className={`flex-shrink-0 rounded-xl flex items-center justify-center
        bg-[var(--mango)]/15 group-hover:bg-[var(--mango)]/25 transition-colors
        ${isCompact ? 'w-8 h-8 text-sm' : 'w-10 h-10 text-lg'}`}>
        ✨
      </div>
      <div className="flex-1 min-w-0">
        <p className={`font-bold text-[var(--mango-dark)] dark:text-[var(--mango)] leading-tight ${isCompact ? 'text-xs' : 'text-sm'}`}>
          {label ?? 'Analizar con IA'}
        </p>
        {!isCompact && (
          <p className="text-[10px] text-zinc-400 mt-0.5">
            ManguitoAI analiza tus datos en segundos
          </p>
        )}
      </div>
      <span className={`text-[var(--mango-dark)] dark:text-[var(--mango)] opacity-60
        group-hover:opacity-100 group-hover:translate-x-0.5 transition-all
        ${isCompact ? 'text-xs' : 'text-sm'}`}>→</span>
    </div>
  )
}

// ── Estado de carga ───────────────────────────────────────────
function LoadingState({ mensaje = 'Analizando tus datos...' }) {
  return (
    <div className="flex flex-col items-center gap-3 py-6
      bg-zinc-50 dark:bg-zinc-800/30 rounded-2xl
      border border-zinc-100 dark:border-zinc-800">
      <div className="relative">
        <Spinner size={28} />
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-xs">🥭</span>
        </div>
      </div>
      <p className="text-xs text-zinc-400 animate-pulse font-medium text-center">
        {mensaje}
      </p>
    </div>
  )
}

// ── Barra de puntaje ──────────────────────────────────────────
function ScoreBar({ puntaje, salud }) {
  const meta = SALUD_META[salud] ?? SALUD_META.good
  return (
    <div className={`rounded-2xl border bg-gradient-to-r ${meta.bg} ${meta.borde} px-4 py-3 mb-3`}>
      <div className="flex items-center justify-between mb-1.5">
        <p className="text-xs font-bold text-zinc-700 dark:text-zinc-200">
          {meta.label}
        </p>
        <span className="text-sm font-black" style={{ color: meta.color }}>
          {puntaje}/100
        </span>
      </div>
      <div className="h-1.5 bg-zinc-200 dark:bg-zinc-700 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-1000"
          style={{ width: `${puntaje}%`, backgroundColor: meta.color }}
        />
      </div>
    </div>
  )
}

// ── Componente principal ──────────────────────────────────────

/**
 * ContextualAI — widget de IA embebible en cualquier sección.
 *
 * Props:
 *   titulo       — nombre del análisis (ej: "Diagnóstico Financiero")
 *   label        — texto del botón cuando está colapsado
 *   systemPrompt — prompt de sistema específico para este contexto
 *   buildPrompt  — función que construye el prompt con los datos actuales
 *   mensajeCarga — texto mientras carga
 *   variant      — 'default' | 'compact' | 'card'
 *   className    — clases extra
 */
export function ContextualAI({
  titulo       = 'Análisis IA',
  label        = 'Analizar con IA',
  systemPrompt = '',
  buildPrompt  = () => 'Analizá mis finanzas.',
  mensajeCarga = 'Analizando tus datos...',
  variant      = 'default',
  className    = '',
}) {
  const [expandido, setExpandido] = useState(false)
  const { analizar, resultado, cargando, error, limpiar } = useAI({
    systemPrompt,
    maxTokens: 700,
  })

  const handleAnalizar = useCallback(async () => {
    setExpandido(true)
    const prompt = buildPrompt()
    await analizar(prompt)
  }, [analizar, buildPrompt])

  const handleReset = useCallback(() => {
    limpiar()
    setExpandido(false)
  }, [limpiar])

  // ── Estado: no analizado ──────────────────────────────────
  if (!expandido) {
    return (
      <div className={className}>
        <PlaceholderState
          label={label}
          onAnalizar={handleAnalizar}
          variant={variant === 'compact' ? 'compact' : 'default'}
        />
      </div>
    )
  }

  // ── Estado: cargando ─────────────────────────────────────
  if (cargando) {
    return (
      <div className={className}>
        <LoadingState mensaje={mensajeCarga} />
      </div>
    )
  }

  // ── Estado: error ────────────────────────────────────────
  if (error) {
    return (
      <div className={className}>
        <div className="px-4 py-3 bg-red-50 dark:bg-red-900/15 border border-red-200 dark:border-red-800/40 rounded-2xl">
          <p className="text-xs text-red-600 dark:text-red-400 font-medium">{error}</p>
          <div className="flex gap-3 mt-2">
            <button onClick={handleAnalizar}
              className="text-[10px] font-bold text-red-500 hover:underline">
              Reintentar
            </button>
            <button onClick={handleReset}
              className="text-[10px] font-bold text-zinc-400 hover:underline">
              Cancelar
            </button>
          </div>
        </div>
      </div>
    )
  }

  // ── Estado: resultado ────────────────────────────────────
  if (resultado) {
    const esJSON = typeof resultado === 'object'

    return (
      <div className={className}>
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-[var(--mango)] to-[var(--mango-dark)]
              flex items-center justify-center text-[10px] flex-shrink-0">
              ✨
            </div>
            <p className="text-xs font-extrabold uppercase tracking-wider text-[var(--mango-dark)] dark:text-[var(--mango)]">
              {titulo}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleAnalizar}
              className="text-[10px] text-zinc-400 hover:text-[var(--mango)] transition-colors font-semibold"
            >
              🔄 Actualizar
            </button>
            <button
              onClick={handleReset}
              className="w-5 h-5 rounded-full bg-zinc-100 dark:bg-zinc-800
                text-zinc-400 hover:text-zinc-600 flex items-center justify-center text-[9px]"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Contenido estructurado (JSON) */}
        {esJSON && (
          <div className="flex flex-col gap-2">
            {/* Score */}
            {resultado.puntaje != null && (
              <ScoreBar puntaje={resultado.puntaje} salud={resultado.salud} />
            )}

            {/* Resumen */}
            {resultado.resumen && (
              <p className="text-xs text-zinc-600 dark:text-zinc-300 leading-relaxed px-1 mb-1">
                {resultado.resumen}
              </p>
            )}

            {/* Insights */}
            {Array.isArray(resultado.insights) && resultado.insights.map((ins, i) => (
              <InsightItem key={i} insight={ins} animDelay={i * 60} />
            ))}

            {/* Consejo principal */}
            {resultado.consejo_principal && (
              <div className="mt-1 px-3 py-2.5 rounded-2xl
                bg-[var(--mango)]/8 dark:bg-[var(--mango)]/5
                border border-[var(--mango)]/20">
                <p className="text-[10px] font-bold text-[var(--mango-dark)] dark:text-[var(--mango)] uppercase tracking-wide mb-1">
                  🎯 Consejo principal
                </p>
                <p className="text-xs text-zinc-700 dark:text-zinc-300 leading-relaxed">
                  {resultado.consejo_principal}
                </p>
              </div>
            )}

            {/* Lista simple */}
            {Array.isArray(resultado) && resultado.map((item, i) => (
              <InsightItem
                key={i}
                insight={typeof item === 'string' ? { tipo: 'consejo', texto: item } : item}
                animDelay={i * 60}
              />
            ))}
          </div>
        )}

        {/* Contenido texto plano */}
        {!esJSON && typeof resultado === 'string' && (
          <div className="text-xs text-zinc-700 dark:text-zinc-300 leading-relaxed
            bg-zinc-50 dark:bg-zinc-800/50 rounded-2xl px-4 py-3
            border border-zinc-100 dark:border-zinc-800 whitespace-pre-line">
            {resultado}
          </div>
        )}

        {/* Footer */}
        <p className="text-[9px] text-zinc-400 text-center mt-2">
          Generado por ManguitoAI · Solo orientativo, no es asesoramiento financiero
        </p>
      </div>
    )
  }

  return null
}

// ── Variante "flotante" para usar sobre una card ──────────────

/**
 * AIButton — botón compacto que abre un modal/dropdown con el análisis.
 * Útil para incrustar en headers de secciones.
 */
export function AIButton({
  label       = '✨ IA',
  titulo      = 'Análisis IA',
  systemPrompt = '',
  buildPrompt  = () => '',
  mensajeCarga = 'Analizando...',
  className    = '',
}) {
  const [abierto, setAbierto] = useState(false)

  return (
    <div className={`relative ${className}`}>
      <button
        onClick={() => setAbierto(v => !v)}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold
          border transition-all
          ${abierto
            ? 'bg-[var(--mango)]/15 border-[var(--mango)]/40 text-[var(--mango-dark)] dark:text-[var(--mango)]'
            : 'bg-[var(--mango)]/8 border-[var(--mango)]/20 text-[var(--mango-dark)] dark:text-[var(--mango)] hover:bg-[var(--mango)]/15'
          }`}
      >
        {label}
      </button>

      {abierto && (
        <div className="absolute right-0 top-full mt-2 w-80 z-30
          bg-white dark:bg-[var(--dark-card)] rounded-2xl shadow-xl
          border border-zinc-100 dark:border-zinc-800 p-4
          animate-in slide-in-from-top-2 fade-in duration-200">
          <ContextualAI
            titulo={titulo}
            label={`Analizar ${titulo}`}
            systemPrompt={systemPrompt}
            buildPrompt={buildPrompt}
            mensajeCarga={mensajeCarga}
          />
        </div>
      )}

      {/* Cierre click-fuera */}
      {abierto && (
        <div className="fixed inset-0 z-20" onClick={() => setAbierto(false)} />
      )}
    </div>
  )
}