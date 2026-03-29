export function Input({ label, error, className = '', prefijo = null, ...props }) {
  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      {label && (
        <label className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 tracking-wide">
          {label}
        </label>
      )}
      <div className="relative flex items-center">
        {prefijo && (
          <span className="absolute left-3.5 text-zinc-400 text-sm font-medium pointer-events-none">
            {prefijo}
          </span>
        )}
        <input
          className={`w-full bg-zinc-50/80 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700/60
            rounded-xl px-3.5 py-2.5 text-sm font-medium
            focus:outline-none focus:ring-2 focus:ring-[var(--mango)]/30 focus:border-[var(--mango)]/60
            dark:focus:ring-[var(--mango)]/20 dark:focus:border-[var(--mango)]/40
            transition-all duration-150
            text-zinc-900 dark:text-white placeholder:text-zinc-400 dark:placeholder:text-zinc-500
            placeholder:font-normal
            ${prefijo ? 'pl-9' : ''}
            ${error ? 'border-red-400 focus:ring-red-400/30 focus:border-red-400' : ''}`}
          {...props}
        />
      </div>
      {error && (
        <span className="text-xs text-red-500 font-medium flex items-center gap-1">
          <span>⚠</span> {error}
        </span>
      )}
    </div>
  )
}

export function Select({ label, error, className = '', children, ...props }) {
  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      {label && (
        <label className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 tracking-wide">
          {label}
        </label>
      )}
      <div className="relative">
        <select
          className={`w-full bg-zinc-50/80 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700/60
            rounded-xl px-3.5 py-2.5 pr-9 text-sm font-medium
            focus:outline-none focus:ring-2 focus:ring-[var(--mango)]/30 focus:border-[var(--mango)]/60
            transition-all duration-150 appearance-none cursor-pointer
            text-zinc-900 dark:text-white
            ${error ? 'border-red-400 focus:ring-red-400/30' : ''}`}
          {...props}
        >
          {children}
        </select>
        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-zinc-400">
          <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor">
            <path d="M6 8L1 3h10L6 8z"/>
          </svg>
        </div>
      </div>
      {error && (
        <span className="text-xs text-red-500 font-medium">{error}</span>
      )}
    </div>
  )
}