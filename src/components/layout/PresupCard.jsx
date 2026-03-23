const ESTADO = {
  sin_datos: { barra: '#D1D5DB', etiqueta: 'Sin gastos',   texto: 'text-zinc-400' },
  holgado:   { barra: '#10B981', etiqueta: 'Bajo control', texto: 'text-emerald-600 dark:text-emerald-400' },
  alerta:    { barra: '#F59E0B', etiqueta: 'Cuidado',      texto: 'text-amber-600 dark:text-amber-400' },
  excedido:  { barra: '#EF4444', etiqueta: 'Excedido',     texto: 'text-red-500 dark:text-red-400' },
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
    <div onClick={onClick}
      className="flex flex-col gap-2 py-3 px-2 -mx-2 rounded-xl cursor-pointer
        hover:bg-zinc-50 dark:hover:bg-zinc-800/40 border-b border-zinc-100 dark:border-zinc-800
        last:border-0 transition-colors">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span style={{ fontSize: 18, lineHeight: 1 }}>{categoria_icono}</span>
          <span className="text-sm font-medium">{categoria_nombre}</span>
        </div>
        <div className="text-right">
          <span className="text-sm font-semibold">${Number(gastado ?? 0).toLocaleString('es-AR')}</span>
          <span className="text-xs text-zinc-400 ml-1">/ ${Number(limite_monto).toLocaleString('es-AR')}</span>
        </div>
      </div>
      <div className="h-1.5 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
        <div className="h-full rounded-full transition-all duration-700 shadow-[inset_0_-2px_4px_rgba(0,0,0,0.15)]" style={{ width: `${pctUI}%`, background: cfg.barra }} />
      </div>
      <div className="flex items-center justify-between">
        <span className={`text-xs ${cfg.texto}`}>{cfg.etiqueta}</span>
        <span className="text-xs text-zinc-400">
          {(porcentaje ?? 0).toFixed(0)}%
          {estado === 'alerta'   && ' ⚠️'}
          {estado === 'excedido' && ' 🚨'}
        </span>
      </div>
    </div>
  )
}