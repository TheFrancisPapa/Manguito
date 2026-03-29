// src/components/layout/MovCard.jsx
import { formatMoneda } from '../../lib/utils.js'

export function MovCard({ movimiento, onClick, compact = false }) {
  const { tipo, monto, descripcion, fecha, categorias: cat, es_recurrente } = movimiento
  const esIngreso = tipo === 'ingreso'
  const fechaFmt  = new Date(fecha + 'T00:00:00').toLocaleDateString('es-AR', { day: 'numeric', month: 'short' })

  const montoAbs = Math.abs(Number(monto))
  let montoDisplay
  if (montoAbs >= 1_000_000) {
    montoDisplay = `$${(montoAbs / 1_000_000).toFixed(1)}M`
  } else if (montoAbs >= 100_000) {
    montoDisplay = `$${(montoAbs / 1_000).toFixed(0)}K`
  } else {
    montoDisplay = formatMoneda(monto, 'ARS', false)
  }

  return (
    <div
      onClick={onClick}
      className={`flex items-center gap-3 cursor-pointer
        hover:bg-zinc-50/80 dark:hover:bg-zinc-800/40
        active:bg-zinc-100/80 dark:active:bg-zinc-800/60
        transition-colors duration-100
        ${compact ? 'py-2 px-4' : 'py-3.5 px-4'}`}
    >
      {/* Icon */}
      <div
        className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 text-lg shadow-sm"
        style={{ background: (cat?.color ?? '#6B7280') + '18' }}
      >
        {cat?.icono ?? '📦'}
      </div>

      {/* Text */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold truncate text-zinc-800 dark:text-zinc-100 leading-tight">
          {descripcion || cat?.nombre}
        </p>
        <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
          {descripcion && (
            <>
              <span className="text-xs text-zinc-400 truncate">{cat?.nombre}</span>
              <span className="text-zinc-300 dark:text-zinc-700 text-[10px]">·</span>
            </>
          )}
          <span className="text-xs text-zinc-400 flex-shrink-0">{fechaFmt}</span>
          {es_recurrente && (
            <span className="text-[9px] text-purple-500 dark:text-purple-400 bg-purple-50 dark:bg-purple-900/20
              px-1.5 py-0.5 rounded-full font-bold flex-shrink-0">
              ↻ Recurrente
            </span>
          )}
        </div>
      </div>

      {/* Amount */}
      <div className="flex flex-col items-end flex-shrink-0 ml-1">
        <span className={`text-sm font-black tabular-nums ${
          esIngreso ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'
        }`}>
          {esIngreso ? '+' : '-'}{montoDisplay}
        </span>
        {montoAbs >= 100_000 && (
          <span className="text-[9px] text-zinc-400 tabular-nums mt-0.5">
            {Number(monto).toLocaleString('es-AR', { maximumFractionDigits: 0 })}
          </span>
        )}
      </div>
    </div>
  )
}