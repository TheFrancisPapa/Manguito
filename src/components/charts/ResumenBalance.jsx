// src/components/charts/ResumenBalance.jsx

function abreviarMonto(valor, moneda = 'ARS') {
  const n = Number(valor ?? 0)
  const abs = Math.abs(n)
  const sign = n < 0 ? '-' : ''

  if (abs >= 1_000_000) {
    return `${sign}$${(abs / 1_000_000).toFixed(1)}M`
  }
  if (abs >= 100_000) {
    return `${sign}$${(abs / 1_000).toFixed(0)}K`
  }
  return Number(n).toLocaleString('es-AR', {
    style: 'currency',
    currency: moneda,
    maximumFractionDigits: 0,
  })
}

export function ResumenBalance({ balance, moneda = 'ARS', cargando = false }) {
  const saldo = (balance?.total_ingresos ?? 0) - (balance?.total_gastos ?? 0)
  const positivo = saldo >= 0

  if (cargando) {
    return (
      <div className="grid grid-cols-3 gap-2">
        {[0, 1, 2].map(i => (
          <div key={i} className="bg-zinc-100 dark:bg-zinc-800 rounded-2xl h-[72px] animate-pulse" />
        ))}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-3 gap-2">
      {/* Ingresos */}
      <div className="flex flex-col gap-1 bg-emerald-50 dark:bg-emerald-900/15 rounded-2xl p-3 border border-emerald-100 dark:border-emerald-900/20">
        <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
          Ingresos
        </p>
        <p className="text-base font-black text-emerald-700 dark:text-emerald-400 leading-tight">
          {abreviarMonto(balance?.total_ingresos, moneda)}
        </p>
        <p className="text-[10px] text-emerald-600/60 dark:text-emerald-500/60 font-medium leading-none">
          {Number(balance?.total_ingresos ?? 0).toLocaleString('es-AR', {
            style: 'currency', currency: moneda, maximumFractionDigits: 0
          })}
        </p>
      </div>

      {/* Gastos */}
      <div className="flex flex-col gap-1 bg-red-50 dark:bg-red-900/15 rounded-2xl p-3 border border-red-100 dark:border-red-900/20">
        <p className="text-[10px] font-bold uppercase tracking-wider text-red-600 dark:text-red-400">
          Gastos
        </p>
        <p className="text-base font-black text-red-700 dark:text-red-300 leading-tight">
          {abreviarMonto(balance?.total_gastos, moneda)}
        </p>
        <p className="text-[10px] text-red-500/60 dark:text-red-400/60 font-medium leading-none">
          {Number(balance?.total_gastos ?? 0).toLocaleString('es-AR', {
            style: 'currency', currency: moneda, maximumFractionDigits: 0
          })}
        </p>
      </div>

      {/* Saldo */}
      <div className={`flex flex-col gap-1 rounded-2xl p-3 border ${
        positivo
          ? 'bg-amber-50 dark:bg-amber-900/15 border-amber-100 dark:border-amber-900/20'
          : 'bg-red-50 dark:bg-red-900/15 border-red-100 dark:border-red-900/20'
      }`}>
        <p className={`text-[10px] font-bold uppercase tracking-wider ${
          positivo ? 'text-amber-700 dark:text-amber-400' : 'text-red-600 dark:text-red-400'
        }`}>
          Saldo
        </p>
        <p className={`text-base font-black leading-tight ${
          positivo ? 'text-amber-700 dark:text-amber-400' : 'text-red-700 dark:text-red-300'
        }`}>
          {positivo ? '+' : ''}{abreviarMonto(saldo, moneda)}
        </p>
        <p className={`text-[10px] font-medium leading-none ${
          positivo ? 'text-amber-600/60 dark:text-amber-500/60' : 'text-red-500/60 dark:text-red-400/60'
        }`}>
          {Number(saldo).toLocaleString('es-AR', {
            style: 'currency', currency: moneda, maximumFractionDigits: 0
          })}
        </p>
      </div>
    </div>
  )
}