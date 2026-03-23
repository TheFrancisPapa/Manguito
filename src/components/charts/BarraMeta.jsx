export function BarraMeta({ meta, moneda = 'ARS', onAportar }) {
  const { nombre, icono, color, monto_objetivo, monto_actual, fecha_limite, estado } = meta
  const pct      = Math.min((monto_actual / monto_objetivo) * 100, 100)
  const falta    = monto_objetivo - monto_actual
  const completa = estado === 'completada'
  const fmt      = (n) => Number(n).toLocaleString('es-AR', { style: 'currency', currency: moneda, maximumFractionDigits: 0 })
  const diasRestantes = fecha_limite
    ? Math.ceil((new Date(fecha_limite + 'T00:00:00') - new Date()) / 86_400_000) : null
  return (
    <div className="bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-2xl p-5">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{ background: color + '22' }}>
          <span style={{ fontSize: 24, lineHeight: 1 }}>{icono}</span>
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold truncate">{nombre}</p>
          <p className="text-sm text-zinc-400">{completa ? '¡Meta alcanzada! 🎉' : `Falta ${fmt(falta)}`}</p>
        </div>
        {!completa && onAportar && (
          <button onClick={onAportar}
            className="text-xs font-medium px-3 py-1.5 rounded-xl bg-amber-50 dark:bg-amber-900/20
              text-amber-700 dark:text-amber-400 hover:bg-amber-100 dark:hover:bg-amber-900/40 transition-colors">
            + Aportar
          </button>
        )}
      </div>
      <div className="h-3 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden mb-3">
        <div className="h-full rounded-full transition-all duration-700 shadow-[inset_0_-2px_4px_rgba(0,0,0,0.15)]" style={{ width: `${pct}%`, background: color }} />
      </div>
      <div className="flex items-center justify-between text-sm">
        <span className="font-semibold">{fmt(monto_actual)}</span>
        <div className="text-right">
          <span className="text-zinc-400">de {fmt(monto_objetivo)}</span>
          {diasRestantes !== null && !completa && (
            <p className={`text-xs mt-0.5 ${diasRestantes <= 30 ? 'text-amber-500' : 'text-zinc-400'}`}>
              {diasRestantes > 0 ? `${diasRestantes} días restantes` : 'Vencida'}
            </p>
          )}
        </div>
      </div>
      <div className="mt-2 text-right">
        <span className="text-xs font-medium" style={{ color: completa ? '#10B981' : color }}>{pct.toFixed(0)}%</span>
      </div>
    </div>
  )
}