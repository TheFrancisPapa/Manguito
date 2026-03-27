// src/components/layout/MovCard.jsx
import { formatMoneda } from '../../lib/utils.js'

export function MovCard({ movimiento, onClick, compact = false }) {
  const { tipo, monto, descripcion, fecha, categorias: cat, es_recurrente } = movimiento
  const esIngreso  = tipo === 'ingreso'
  const fechaFmt   = new Date(fecha + 'T00:00:00').toLocaleDateString('es-AR', {
    day: 'numeric', month: 'short'
  })

  // Abreviar montos grandes para mobile
  const montoAbs = Math.abs(Number(monto))
  let montoDisplay
  if (montoAbs >= 1_000_000) {
    montoDisplay = `$${(montoAbs / 1_000_000).toFixed(1)}M`
  } else if (montoAbs >= 100_000) {
    montoDisplay = `$${(montoAbs / 1_000).toFixed(0)}K`
  } else {
    montoDisplay = formatMoneda(monto, 'ARS', false)
  }

  const baseStyles = "flex items-center gap-3 cursor-pointer text-zinc-800 dark:text-zinc-100 hover:bg-zinc-50 dark:hover:bg-zinc-800/40 active:bg-zinc-100 dark:active:bg-zinc-800 transition-colors duration-100"
  const compactStyles = "py-1 px-1"
  const fullStyles = "py-3 px-1 border-b border-zinc-100 dark:border-zinc-800/60 last:border-0"

  return (
    <div onClick={onClick} className={`${baseStyles} ${compact ? compactStyles : fullStyles}`}>

      {/* Ícono categoría */}
      <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 text-[18px]"
        style={{ background: (cat?.color ?? '#6B7280') + '20' }}>
        {cat?.icono ?? '📦'}
      </div>

      {/* Texto */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold truncate text-zinc-800 dark:text-zinc-100 leading-tight">
          {descripcion || cat?.nombre}
        </p>
        <div className="flex items-center gap-1.5 mt-0.5">
          <span className="text-xs text-zinc-400 dark:text-zinc-500 truncate">
            {cat?.nombre}
          </span>
          <span className="text-zinc-300 dark:text-zinc-700 text-[10px]">·</span>
          <span className="text-xs text-zinc-400 dark:text-zinc-500 flex-shrink-0">
            {fechaFmt}
          </span>
          {es_recurrente && (
            <span className="text-[10px] text-purple-500 dark:text-purple-400 bg-purple-50 dark:bg-purple-900/20
              px-1.5 py-0.5 rounded-full font-medium flex-shrink-0">
              ↻
            </span>
          )}
        </div>
      </div>

      {/* Monto */}
      <div className="flex flex-col items-end flex-shrink-0 ml-1">
        <span className={`text-sm font-black tabular-nums ${
          esIngreso
            ? 'text-emerald-600 dark:text-emerald-400'
            : 'text-red-600 dark:text-red-400'
        }`}>
          {esIngreso ? '+' : '-'}{montoDisplay}
        </span>
        {/* Monto completo debajo si está abreviado */}
        {montoAbs >= 100_000 && (
          <span className="text-[10px] text-zinc-400 dark:text-zinc-600 tabular-nums">
            {Number(monto).toLocaleString('es-AR', { maximumFractionDigits: 0 })}
          </span>
        )}
      </div>
    </div>
  )
}