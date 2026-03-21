// src/components/layout/MetaCard.jsx
// Card de una meta de ahorro.
// Usada en pages/Metas y en el widget del Dashboard.

export function MetaCard({ meta, onClick }) {
  const {
    nombre, icono, color,
    monto_objetivo, monto_actual,
    fecha_limite, estado, prioridad,
  } = meta

  const pct      = Math.min((monto_actual / monto_objetivo) * 100, 100)
  const falta    = monto_objetivo - monto_actual
  const completa = estado === 'completada'

  const fechaFmt = fecha_limite
    ? new Date(fecha_limite + 'T00:00:00').toLocaleDateString('es-AR', {
        day: 'numeric', month: 'short', year: 'numeric',
      })
    : null

  return (
    <div
      onClick={onClick}
      className="
        flex flex-col gap-3 p-4
        bg-white dark:bg-zinc-900
        border border-zinc-100 dark:border-zinc-800
        rounded-2xl cursor-pointer
        hover:border-zinc-200 dark:hover:border-zinc-700
        transition-colors
      "
    >
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2.5">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ background: color + '22' }}
          >
            <span style={{ fontSize: 20, lineHeight: 1 }}>{icono}</span>
          </div>
          <div>
            <p className="text-sm font-medium">{nombre}</p>
            {fechaFmt && !completa && (
              <p className="text-xs text-zinc-400">Hasta {fechaFmt}</p>
            )}
          </div>
        </div>
        {completa && (
          <span className="text-lg" title="Completada">✅</span>
        )}
      </div>

      {/* Barra de progreso */}
      <div className="h-2 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${pct}%`, background: color }}
        />
      </div>

      {/* Montos */}
      <div className="flex items-center justify-between">
        <span className="text-xs text-zinc-400">
          {completa
            ? '¡Meta alcanzada!'
            : `Falta $${Number(falta).toLocaleString('es-AR')}`
          }
        </span>
        <span className="text-xs font-medium">
          ${Number(monto_actual).toLocaleString('es-AR')}
          <span className="text-zinc-400 font-normal">
            {' '}/ ${Number(monto_objetivo).toLocaleString('es-AR')}
          </span>
        </span>
      </div>
    </div>
  )
}