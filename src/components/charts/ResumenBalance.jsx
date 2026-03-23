export function ResumenBalance({ balance, moneda = 'ARS', cargando = false }) {
  const fmt = (n) => Number(n ?? 0).toLocaleString('es-AR', { style: 'currency', currency: moneda, maximumFractionDigits: 0 })
  const saldo    = (balance?.total_ingresos ?? 0) - (balance?.total_gastos ?? 0)
  const positivo = saldo >= 0
  if (cargando) return (
    <div className="grid grid-cols-3 gap-3">
      {[0,1,2].map(i => <div key={i} className="bg-zinc-100 dark:bg-zinc-800 rounded-2xl h-20 animate-pulse" />)}
    </div>
  )
  return (
    <div className="grid grid-cols-3 gap-3">
      <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-2xl p-3">
        <p className="text-xs text-emerald-700 dark:text-emerald-400 font-medium mb-1">Ingresos</p>
        <p className="text-base font-semibold text-emerald-800 dark:text-emerald-300 truncate">{fmt(balance?.total_ingresos)}</p>
      </div>
      <div className="bg-red-50 dark:bg-red-900/20 rounded-2xl p-3">
        <p className="text-xs text-red-600 dark:text-red-400 font-medium mb-1">Gastos</p>
        <p className="text-base font-semibold text-red-700 dark:text-red-300 truncate">{fmt(balance?.total_gastos)}</p>
      </div>
      <div className={`rounded-2xl p-3 ${positivo ? 'bg-blue-50 dark:bg-blue-900/20' : 'bg-orange-50 dark:bg-orange-900/20'}`}>
        <p className={`text-xs font-medium mb-1 ${positivo ? 'text-blue-700 dark:text-blue-400' : 'text-orange-600 dark:text-orange-400'}`}>Saldo</p>
        <p className={`text-base font-semibold truncate ${positivo ? 'text-blue-800 dark:text-blue-300' : 'text-orange-700 dark:text-orange-300'}`}>
          {positivo ? '+' : ''}{fmt(saldo)}
        </p>
      </div>
    </div>
  )
}