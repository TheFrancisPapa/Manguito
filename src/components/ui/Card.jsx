export function Card({ children, className = '', onClick }) {
  const clickable = onClick
    ? 'cursor-pointer hover:shadow-md hover:border-[var(--mango)]/20 active:scale-[0.99] transition-all duration-200'
    : ''

  return (
    <div
      className={`bg-white dark:bg-[var(--dark-card)] shadow-[var(--shadow-sm)] border border-zinc-100/80 dark:border-[var(--dark-border)] rounded-2xl p-4 w-full ${clickable} ${className}`}
      onClick={onClick}
    >
      {children}
    </div>
  )
}

export function CardHeader({ titulo, subtitulo = null, accion = null }) {
  return (
    <div className="flex items-start justify-between gap-2 mb-3">
      <div className="flex-1 min-w-0">
        <h2 className="text-[10px] uppercase font-bold tracking-[0.08em] text-zinc-400 dark:text-zinc-500 mb-1 leading-tight">
          {titulo}
        </h2>
        {subtitulo && (
          <p className="text-xl sm:text-2xl font-bold font-display text-zinc-900 dark:text-white leading-tight truncate">
            {subtitulo}
          </p>
        )}
      </div>
      {accion && <div className="shrink-0">{accion}</div>}
    </div>
  )
}