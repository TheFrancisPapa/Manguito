import { Link } from 'react-router-dom'

export function BentoAcciones({ onNuevoGasto, onNuevoIngreso }) {
  return (
    <div className="col-span-12 md:col-span-6 grid grid-cols-2 gap-2.5">
      <button
        onClick={onNuevoGasto}
        className="flex flex-col items-start p-5 rounded-[24px] bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/30 hover:bg-red-100 dark:hover:bg-red-900/20 active:scale-[0.98] transition-all shadow-sm group"
      >
        <div className="w-10 h-10 rounded-[14px] bg-white dark:bg-red-900/40 flex items-center justify-center text-xl shadow-sm mb-3 group-hover:scale-110 transition-transform">
          💸
        </div>
        <p className="text-[13px] font-bold text-red-900 dark:text-red-300 leading-tight">Nuevo Gasto</p>
        <p className="text-[10px] text-red-400">Registrar ahora</p>
      </button>

      <button
        onClick={onNuevoIngreso}
        className="flex flex-col items-start p-5 rounded-[24px] bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-100 dark:border-emerald-900/30 hover:bg-emerald-100 dark:hover:bg-emerald-900/20 active:scale-[0.98] transition-all shadow-sm group"
      >
        <div className="w-10 h-10 rounded-[14px] bg-white dark:bg-emerald-900/40 flex items-center justify-center text-xl shadow-sm mb-3 group-hover:scale-110 transition-transform">
          💰
        </div>
        <p className="text-[13px] font-bold text-emerald-900 dark:text-emerald-300 leading-tight">Nuevo Ingreso</p>
        <p className="text-[10px] text-emerald-400">Registrar ahora</p>
      </button>

      <Link to="/chat" className="col-span-2 relative overflow-hidden rounded-[24px] p-4 bg-zinc-900 dark:bg-zinc-800 border border-zinc-800 dark:border-zinc-700 active:scale-[0.98] transition-all group shadow-md flex items-center gap-4">
        <div className="absolute -right-6 -top-6 w-24 h-24 rounded-full" style={{ background: 'rgba(245,166,35,0.12)', filter: 'blur(20px)' }} />
        <div className="w-10 h-10 rounded-2xl flex items-center justify-center text-xl" style={{ background: 'rgba(245,166,35,0.15)' }}>
          🤖
        </div>
        <div className="flex-1">
          <p className="text-sm font-bold text-white leading-tight">ManguitoAI</p>
          <p className="text-[10px] text-zinc-400 mt-0.5">Asistente financiero</p>
        </div>
        <div className="w-7 h-7 rounded-full bg-[var(--mango)]/20 flex items-center justify-center group-hover:bg-[var(--mango)]/40 transition-colors">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--mango)" strokeWidth="2.5" strokeLinecap="round">
            <path d="M5 12h14M12 5l7 7-7 7"/>
          </svg>
        </div>
      </Link>
    </div>
  )
}
