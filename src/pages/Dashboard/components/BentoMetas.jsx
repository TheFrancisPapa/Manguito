import { BentoCell, BentoHeader } from '../../../components/bento/BentoCell'

export function BentoMetas() {
  return (
    <BentoCell className="col-span-12 md:col-span-6 bg-indigo-50 dark:bg-indigo-900/10 border-indigo-100 dark:border-indigo-900/30 flex flex-col justify-between relative">
      <div className="absolute -right-4 -bottom-4 opacity-5 text-8xl" style={{ filter: 'blur(2px)' }}>
        🎯
      </div>
      <BentoHeader icon="🎯" title="Metas" className="relative z-10 [&_p]:text-indigo-900 [&_p]:dark:text-indigo-300" />
      <div className="relative z-10">
        <p className="text-[13px] font-bold text-indigo-900 dark:text-indigo-200 leading-tight mb-1">
          Viaje a Brasil
        </p>
        <p className="text-[10px] font-semibold text-indigo-400 mb-2">Faltan $450.000</p>
        <div className="h-1.5 w-full bg-indigo-200 dark:bg-indigo-900/50 rounded-full overflow-hidden">
          <div className="h-full bg-indigo-500 rounded-full" style={{ width: '40%' }} />
        </div>
      </div>
    </BentoCell>
  )
}
