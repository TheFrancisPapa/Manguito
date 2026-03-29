export function Spinner({ size = 24, className = '', colorClass = 'text-[var(--mango)]' }) {
  return (
    <svg
      className={`animate-spin ${colorClass} ${className}`}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      style={{ width: size, height: size }}
    >
      <circle className="opacity-20" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
      <path className="opacity-90" fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
    </svg>
  )
}

export function PageLoader() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-4
      bg-[var(--cream-soft)] dark:bg-[var(--dark-bg)]">
      <div className="relative">
        <div className="absolute inset-0 bg-[var(--mango)] blur-2xl opacity-25 rounded-full animate-pulse scale-150" />
        <img src="/Mango.png" alt="Manguito" className="relative w-14 h-14 object-contain animate-float" />
      </div>
      <Spinner size={22} />
      <p className="text-sm text-zinc-400 font-medium animate-pulse">Cargando…</p>
    </div>
  )
}