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
      {/* Ingresos — verde hoja del logo */}
      <div className="bg-[var(--leaf)]/8 dark:bg-[var(--leaf)]/10 rounded-2xl p-3 border border-[var(--leaf)]/10">
        <p className="text-xs text-[var(--leaf-dark)] dark:text-[var(--leaf)] font-medium mb-1">Ingresos</p>
        <p className="text-base font-bold text-[var(--leaf-dark)] dark:text-[var(--leaf)] truncate">{fmt(balance?.total_ingresos)}</p>
      </div>
      {/* Gastos — rojo suave */}
      <div className="bg-red-50 dark:bg-red-900/15 rounded-2xl p-3 border border-red-100 dark:border-red-900/20">
        <p className="text-xs text-red-600 dark:text-red-400 font-medium mb-1">Gastos</p>
        <p className="text-base font-bold text-red-700 dark:text-red-300 truncate">{fmt(balance?.total_gastos)}</p>
      </div>
      {/* Saldo — mango dorado (positivo) / rojo (negativo) */}
      <div className={`rounded-2xl p-3 border ${
        positivo 
          ? 'bg-[var(--mango)]/8 dark:bg-[var(--mango)]/10 border-[var(--mango)]/15' 
          : 'bg-red-50 dark:bg-red-900/15 border-red-100 dark:border-red-900/20'
      }`}>
        <p className={`text-xs font-medium mb-1 ${positivo ? 'text-[var(--mango-dark)] dark:text-[var(--mango)]' : 'text-red-600 dark:text-red-400'}`}>Saldo</p>
        <p className={`text-base font-bold truncate ${positivo ? 'text-[var(--mango-dark)] dark:text-[var(--mango)]' : 'text-red-700 dark:text-red-300'}`}>
          {positivo ? '+' : ''}{fmt(saldo)}
        </p>
      </div>
    </div>
  )
}