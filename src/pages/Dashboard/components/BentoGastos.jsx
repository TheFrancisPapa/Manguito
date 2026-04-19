import { BentoCell, BentoHeader } from '../../../components/bento/BentoCell'

export function BentoGastos() {
  return (
    <BentoCell className="col-span-12 md:col-span-8 flex justify-between gap-4">
      <div className="flex flex-col justify-between w-1/3">
        <div>
          <p className="text-[10px] font-extrabold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider mb-0.5">Top Gasto</p>
          <p className="text-[14px] font-bold text-zinc-800 dark:text-white leading-tight">Supermercado</p>
        </div>
        <div className="w-10 h-10 rounded-[14px] bg-amber-50 dark:bg-amber-900/20 flex items-center justify-center text-xl mt-2 text-amber-600">
          🛒
        </div>
      </div>
      <div className="w-2/3 flex flex-col justify-end">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <div className="h-4 bg-amber-400 rounded-full" style={{ width: '100%' }} />
            <span className="text-[10px] text-zinc-400 font-mono-num tabular-nums">$45K</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-4 bg-indigo-400 rounded-full" style={{ width: '40%' }} />
            <span className="text-[10px] text-zinc-400 font-mono-num tabular-nums">$18K</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-4 bg-sky-400 rounded-full" style={{ width: '25%' }} />
            <span className="text-[10px] text-zinc-400 font-mono-num tabular-nums">$11K</span>
          </div>
        </div>
      </div>
    </BentoCell>
  )
}
