// src/components/layout/MovCard.jsx
// Fila de un movimiento. Usada en:
//   - pages/Movimientos (lista completa)
//   - pages/Dashboard   (widget de últimos movimientos)

export function MovCard({ movimiento, onClick }) {
  const { tipo, monto, descripcion, fecha, categorias: cat, es_recurrente } = movimiento

  const esIngreso  = tipo === 'ingreso'
  const signo      = esIngreso ? '+' : '-'
  const colorMonto = esIngreso
    ? 'text-emerald-600 dark:text-emerald-400'
    : 'text-red-500 dark:text-red-400'

  const fechaFmt = new Date(fecha + 'T00:00:00').toLocaleDateString('es-AR', {
    day: 'numeric', month: 'short',
  })

  return (
    <div
      onClick={onClick}
      className="
        flex items-center gap-3 py-3 px-2 -mx-2
        border-b border-zinc-100 dark:border-zinc-800 last:border-0
        rounded-xl cursor-pointer
        hover:bg-zinc-50 dark:hover:bg-zinc-800/40
        transition-colors
      "
    >
      {/* Ícono con fondo del color de la categoría */}
      <div
        className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
        style={{ background: (cat?.color ?? '#6B7280') + '22' }}
      >
        <span style={{ fontSize: 19, lineHeight: 1 }}>{cat?.icono ?? '📦'}</span>
      </div>

      {/* Descripción */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">
          {descripcion || cat?.nombre}
        </p>
        <div className="flex items-center gap-1.5 mt-0.5">
          <span className="text-xs text-zinc-400">{cat?.nombre}</span>
          {es_recurrente && (
            <span className="text-xs text-zinc-300 dark:text-zinc-600">· 🔁</span>
          )}
        </div>
      </div>

      {/* Monto + fecha */}
      <div className="text-right flex-shrink-0">
        <p className={`text-sm font-semibold ${colorMonto}`}>
          {signo} ${Number(monto).toLocaleString('es-AR')}
        </p>
        <p className="text-xs text-zinc-400 mt-0.5">{fechaFmt}</p>
      </div>
    </div>
  )
}