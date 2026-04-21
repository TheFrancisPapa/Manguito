// src/pages/Dashboard/components/BentoGastos.jsx
import { BentoCell, BentoHeader } from '../../../components/bento/BentoCell'

const GRADIENTES_BARRA = [
  'bg-gradient-to-r from-amber-400 to-orange-500 shadow-[0_2px_8px_rgba(245,158,11,0.25)]',
  'bg-gradient-to-r from-indigo-400 to-violet-500 shadow-[0_2px_8px_rgba(99,102,241,0.2)]',
  'bg-gradient-to-r from-sky-400 to-blue-500 shadow-[0_2px_8px_rgba(14,165,233,0.2)]',
  'bg-gradient-to-r from-rose-400 to-pink-500 shadow-[0_2px_8px_rgba(244,63,94,0.2)]',
  'bg-gradient-to-r from-emerald-400 to-teal-500 shadow-[0_2px_8px_rgba(16,185,129,0.2)]'
]

function fmtAbrev(n) {
  const abs = Math.abs(n)
  if (abs >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`
  if (abs >= 1_000)     return `$${(n / 1_000).toFixed(0)}K`
  return `$${Number(n).toLocaleString('es-AR', { maximumFractionDigits: 0 })}`
}

export function BentoGastos({ gastos = [], cargando = false, className = '' }) {
  // gastos viene de useGastosXCategoria → array de { nombre, monto, icono, color }
  const top3 = [...gastos]
    .sort((a, b) => b.monto - a.monto)
    .slice(0, 3)

  const maximo = top3[0]?.monto ?? 1

  if (cargando) {
    return (
      <BentoCell className={`col-span-12 md:col-span-8 flex justify-between gap-4 ${className}`}>
        <div className="flex flex-col justify-between w-1/3 gap-2">
          <div className="h-3 w-24 bg-zinc-100 dark:bg-zinc-800 rounded-full animate-pulse" />
          <div className="h-5 w-20 bg-zinc-100 dark:bg-zinc-800 rounded-full animate-pulse" />
          <div className="w-10 h-10 rounded-[14px] bg-zinc-100 dark:bg-zinc-800 animate-pulse" />
        </div>
        <div className="w-2/3 flex flex-col justify-end gap-3">
          {[100, 55, 35].map((w, i) => (
            <div key={i} className="flex items-center gap-2">
              <div className="h-4 bg-zinc-100 dark:bg-zinc-800 rounded-full animate-pulse" style={{ width: `${w}%` }} />
              <div className="h-3 w-8 bg-zinc-100 dark:bg-zinc-800 rounded-full animate-pulse" />
            </div>
          ))}
        </div>
      </BentoCell>
    )
  }

  if (!top3.length) {
    return (
      <BentoCell className="col-span-12 md:col-span-8 flex items-center justify-center">
        <div className="text-center py-4 bg-zinc-50/50 dark:bg-zinc-900/30 w-full rounded-2xl border border-dashed border-zinc-200 dark:border-zinc-800">
          <span className="text-3xl block mb-2 opacity-40">📊</span>
          <p className="text-xs text-zinc-400 font-medium">Sin gastos registrados este mes</p>
        </div>
      </BentoCell>
    )
  }

  const top1 = top3[0]

  return (
    <BentoCell className={`col-span-12 md:col-span-8 flex justify-between gap-4 group ${className}`}>
      <div className="flex flex-col justify-between w-1/3 py-0.5">
        <div>
          <p className="text-[10px] font-extrabold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest mb-1">
            Top Gasto
          </p>
          <p className="text-[15px] font-black text-zinc-900 dark:text-white leading-tight truncate">
            {top1.nombre}
          </p>
        </div>
        <div
          className="w-12 h-12 rounded-[18px] flex items-center justify-center text-2xl mt-3 transition-transform group-hover:scale-110 duration-500"
          style={{ 
            background: (top1.color ?? '#F5A623') + '15',
            border: `1px solid ${top1.color ?? '#F5A623'}22`,
            boxShadow: `0 8px 16px -4px ${(top1.color ?? '#F5A623')}15`
          }}
        >
          {top1.icono ?? '📦'}
        </div>
      </div>

      <div className="w-2/3 flex flex-col justify-end">
        <div className="space-y-2.5">
          {top3.map((cat, i) => {
            const pct = Math.max((cat.monto / maximo) * 100, 8)
            return (
              <div key={cat.nombre} className="flex items-center gap-2.5">
                <div className="flex-1 h-3.5 bg-zinc-50 dark:bg-zinc-900/50 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${GRADIENTES_BARRA[i]} rounded-full transition-all duration-1000 ease-out`}
                    style={{ width: `${pct}%` }}
                    title={cat.nombre}
                  />
                </div>
                <span className="text-[11px] font-bold text-zinc-500 dark:text-zinc-400 font-mono-num tabular-nums flex-shrink-0 w-10 text-right">
                  {fmtAbrev(cat.monto)}
                </span>
              </div>
            )
          })}
        </div>

        {/* Leyenda de categorías */}
        <div className="flex flex-col gap-1 mt-3">
          {top3.map((cat, i) => (
            <p key={cat.nombre} className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 flex items-center gap-1.5 opacity-80">
              <span
                className={`w-1.5 h-1.5 rounded-full inline-block flex-shrink-0 ${GRADIENTES_BARRA[i].split(' ')[1]}`}
              />
              {cat.nombre}
            </p>
          ))}
        </div>
      </div>
    </BentoCell>
  )
}