export function Input({ label, error, className = '', prefijo = null, sufijo = null, ...props }) {
  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      {label && (
        <label className="text-[11px] font-bold uppercase tracking-widest text-zinc-400 dark:text-zinc-500 pl-1">
          {label}
        </label>
      )}
      <div className="relative flex items-center">
        {prefijo && (
          <span className="absolute left-3.5 text-zinc-400 text-sm font-semibold pointer-events-none select-none z-10">
            {prefijo}
          </span>
        )}
        <input
          className={`
            field-base
            ${prefijo ? 'pl-8' : 'pl-4'}
            ${sufijo ? 'pr-10' : 'pr-4'}
            ${error ? 'field-error' : ''}
          `}
          {...props}
        />
        {sufijo && (
          <span className="absolute right-3.5 text-zinc-400 text-sm pointer-events-none select-none">
            {sufijo}
          </span>
        )}
      </div>
      {error && (
        <span className="text-[11px] text-red-500 font-semibold pl-1 flex items-center gap-1">
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
        <label className="text-[11px] font-bold uppercase tracking-widest text-zinc-400 dark:text-zinc-500 pl-1">
          {label}
        </label>
      )}
      <div className="relative">
        <select
          className={`field-base field-select ${error ? 'field-error' : ''}`}
          {...props}
        >
          {children}
        </select>
        {/* Chevron personalizado */}
        <div className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 flex items-center justify-center w-5 h-5 rounded-md bg-zinc-100 dark:bg-zinc-700/80">
          <svg width="10" height="6" viewBox="0 0 10 6" fill="none">
            <path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="text-zinc-500 dark:text-zinc-400"/>
          </svg>
        </div>
      </div>
      {error && (
        <span className="text-[11px] text-red-500 font-semibold pl-1">⚠ {error}</span>
      )}
    </div>
  )
}