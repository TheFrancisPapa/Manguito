const ESTADO = {
  sin_datos: { barra: '#E5E7EB', etiqueta: 'Sin gastos',    color: 'text-zinc-400'                           },
  holgado:   { barra: '#10B981', etiqueta: 'Bajo control',  color: 'text-emerald-600 dark:text-emerald-400'  },
  alerta:    { barra: '#F5A623', etiqueta: 'Cuidado',       color: 'text-amber-600 dark:text-amber-400'      },
  excedido:  { barra: '#EF4444', etiqueta: 'Excedido',      color: 'text-red-500 dark:text-red-400'          },
}

function calcularEstado(pct, alertaPct) {
  if (pct === 0)        return 'sin_datos'
  if (pct > 100)        return 'excedido'
  if (pct >= alertaPct) return 'alerta'
  return 'holgado'
}

export function PresupCard({ presupuesto, onClick }) {
  const { categoria_nombre, categoria_icono, limite_monto, gastado, porcentaje, alerta_pct } = presupuesto
  const estado = calcularEstado(porcentaje ?? 0, alerta_pct)
  const cfg    = ESTADO[estado]
  const pctUI  = Math.min(porcentaje ?? 0, 100)

  return (
    <div
      onClick={onClick}
      className="flex flex-col gap-2.5 py-3.5 px-2 -mx-2 rounded-2xl cursor-pointer
        hover:bg-zinc-50/80 dark:hover:bg-zinc-800/40
        transition-colors group"
    >
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2.5 min-w-0">
          <span className="text-xl flex-shrink-0">{categoria_icono}</span>
          <span className="text-sm font-semibold text-zinc-800 dark:text-zinc-100 truncate">
            {categoria_nombre}
          </span>
        </div>
        <div className="text-right flex-shrink-0">
          <span className="text-sm font-bold text-zinc-800 dark:text-zinc-100 tabular-nums">
            ${Number(gastado ?? 0).toLocaleString('es-AR')}
          </span>
          <span className="text-xs text-zinc-400 ml-1">
            / ${Number(limite_monto).toLocaleString('es-AR')}
          </span>
        </div>
      </div>

      {/* Progress bar */}
      <div className="h-2 bg-zinc-100 dark:bg-zinc-700/60 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{ width: `${pctUI}%`, backgroundColor: cfg.barra }}
        />
      </div>

      <div className="flex items-center justify-between">
        <span className={`text-xs font-semibold ${cfg.color}`}>{cfg.etiqueta}</span>
        <span className="text-xs text-zinc-400 tabular-nums font-medium">
          {(porcentaje ?? 0).toFixed(0)}%
          {estado === 'alerta'   && ' ⚠️'}
          {estado === 'excedido' && ' 🚨'}
        </span>
      </div>
    </div>
  )
}