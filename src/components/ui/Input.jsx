export function Input({ label, error, className = '', prefijo = null, ...props }) {
  return (
    <div className={`flex flex-col gap-1 ${className}`}>
      {label && <label className="text-xs font-medium text-zinc-500 dark:text-zinc-400">{label}</label>}
      <div className="relative flex items-center">
        {prefijo && <span className="absolute left-3 text-zinc-400">{prefijo}</span>}
        <input
          className={`w-full bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 
            rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--mango)]/40 
            dark:focus:ring-[var(--mango)]/30 focus:border-[var(--mango)]/50
            transition-shadow text-zinc-900 dark:text-white placeholder:text-zinc-400 dark:placeholder:text-zinc-500
            ${prefijo ? 'pl-8' : ''} 
            ${error ? 'border-red-300 focus:ring-red-400/50' : ''}`}
          {...props}
        />
      </div>
      {error && <span className="text-xs text-red-500">{error}</span>}
    </div>
  )
}

export function Select({ label, error, className = '', children, ...props }) {
  return (
    <div className={`flex flex-col gap-1 ${className}`}>
      {label && <label className="text-xs font-medium text-zinc-500 dark:text-zinc-400">{label}</label>}
      <select
        className={`w-full bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 
          rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--mango)]/40 
          dark:focus:ring-[var(--mango)]/30 focus:border-[var(--mango)]/50
          transition-shadow appearance-none cursor-pointer text-zinc-900 dark:text-white
          ${error ? 'border-red-300 focus:ring-red-400/50' : ''}`}
        {...props}
      >
        {children}
      </select>
      {error && <span className="text-xs text-red-500">{error}</span>}
    </div>
  )
}