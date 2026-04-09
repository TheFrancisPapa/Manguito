// src/components/charts/BarraMeta.jsx
// Enhanced: green glow near completion, confetti when done

export function BarraMeta({ meta, moneda = 'ARS', onAportar }) {
  const { nombre, icono, color, monto_objetivo, monto_actual, fecha_limite, estado } = meta
  const pct      = Math.min((monto_actual / monto_objetivo) * 100, 100)
  const falta    = monto_objetivo - monto_actual
  const completa = estado === 'completada'
  const cercana  = pct >= 80 && !completa
  const fmt      = (n) => Number(n).toLocaleString('es-AR', { style: 'currency', currency: moneda, maximumFractionDigits: 0 })
  const diasRestantes = fecha_limite
    ? Math.ceil((new Date(fecha_limite + 'T00:00:00') - new Date()) / 86_400_000) : null

  // Color de barra dinámico según estado
  const barColor = completa ? '#10B981' : cercana ? '#10B981' : color
  const barGlow  = completa
    ? '0 0 16px rgba(16,185,129,0.5)'
    : cercana
      ? '0 0 12px rgba(16,185,129,0.4)'
      : 'none'

  return (
    <div className={`
      rounded-[20px] p-5 transition-all duration-300
      ${completa
        ? 'bg-emerald-50 dark:bg-emerald-900/10 border-2 border-emerald-200/60 dark:border-emerald-800/30'
        : cercana
          ? 'bg-white dark:bg-[var(--dark-card)] border-2 border-emerald-200/60 dark:border-emerald-800/30'
          : 'bg-white dark:bg-[var(--dark-card)] border border-zinc-100 dark:border-[var(--dark-border)]'
      }
      shadow-[var(--shadow-xs)]
    `}>
      <div className="flex items-center gap-3 mb-4">
        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center relative
          ${completa ? 'bg-emerald-100 dark:bg-emerald-900/20' : ''}`}
          style={!completa ? { background: color + '22' } : {}}>
          <span style={{ fontSize: 24, lineHeight: 1 }}>{icono}</span>
          {completa && (
            <span className="absolute -top-1 -right-1 text-sm">🎉</span>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className="font-bold truncate text-zinc-800 dark:text-white font-display">{nombre}</p>
            {/* Badges */}
            {completa && (
              <span className="text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-full
                bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400
                tracking-wider">
                ¡LISTA!
              </span>
            )}
            {cercana && !completa && (
              <span className="text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-full
                bg-emerald-100 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400
                tracking-wider animate-pulse-subtle">
                ¡CASI!
              </span>
            )}
          </div>
          <p className="text-sm text-zinc-400 dark:text-zinc-500">
            {completa ? '¡Meta alcanzada! 🎉' : `Faltan ${fmt(falta)}`}
          </p>
        </div>
        {!completa && onAportar && (
          <button onClick={onAportar}
            className="text-xs font-bold px-3.5 py-2 rounded-[14px]
              bg-[var(--mango)]/10 dark:bg-[var(--mango)]/15
              text-[var(--mango-dark)] dark:text-[var(--mango)]
              hover:bg-[var(--mango)]/20 dark:hover:bg-[var(--mango)]/25
              transition-colors press-scale border border-[var(--mango)]/20">
            + Aportar
          </button>
        )}
      </div>

      {/* Progress bar with conditional glow */}
      <div className="h-2.5 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden mb-3">
        <div className={`h-full rounded-full transition-all duration-700
          ${cercana || completa ? 'animate-pulse-subtle' : ''}
          shadow-[inset_0_-2px_4px_rgba(0,0,0,0.15)]`}
          style={{
            width: `${pct}%`,
            background: barColor,
            boxShadow: barGlow,
          }}
        />
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className={`text-sm font-bold font-mono-num ${
            completa
              ? 'text-emerald-600 dark:text-emerald-400'
              : cercana
                ? 'text-emerald-600 dark:text-emerald-400'
                : 'text-zinc-800 dark:text-white'
          }`}>
            {fmt(monto_actual)}
          </span>
          <span className={`text-xs font-bold px-1.5 py-0.5 rounded-md ${
            completa
              ? 'bg-emerald-100/80 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400'
              : cercana
                ? 'bg-emerald-100/80 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400'
                : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400'
          }`}>
            {pct.toFixed(0)}%
          </span>
        </div>
        <div className="text-right">
          <span className="text-sm text-zinc-400 dark:text-zinc-500">de {fmt(monto_objetivo)}</span>
          {diasRestantes !== null && !completa && (
            <p className={`text-[10px] mt-0.5 font-medium ${
              diasRestantes <= 7
                ? 'text-red-500 dark:text-red-400'
                : diasRestantes <= 30
                  ? 'text-amber-500 dark:text-amber-400'
                  : 'text-zinc-400 dark:text-zinc-500'
            }`}>
              {diasRestantes > 0 ? `${diasRestantes} días restantes` : '⏰ Vencida'}
            </p>
          )}
        </div>
      </div>
    </div>
  )
}