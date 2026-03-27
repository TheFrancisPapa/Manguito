export function Card({ children, className = '', onClick }) {
  const clickable = onClick
    ? 'cursor-pointer hover:border-[var(--mango)]/50 hover:shadow-md active:scale-[0.98] transition-all duration-200'
    : ''

  return (
    <div
      className={`bg-white dark:bg-zinc-900 shadow-sm border border-zinc-200 dark:border-zinc-800 rounded-2xl p-4 w-full ${clickable} ${className}`}
      onClick={onClick}
    >
      {children}
    </div>
  )
}

export function CardHeader({ titulo, subtitulo = null, accion = null }) {
  return (
    <div className="flex items-start justify-between gap-2 mb-3">
      <div className="flex-1 min-w-0"> {/* min-w-0 evita que textos largos empujen el layout */}
        <h2 className="text-xs uppercase font-bold tracking-wider text-zinc-500 dark:text-zinc-400 mb-1 truncate">
          {titulo}
        </h2>
        {subtitulo && (
          <p className="text-xl sm:text-2xl font-bold text-[var(--charcoal)] dark:text-white leading-tight truncate">
            {subtitulo}
          </p>
        )}
      </div>
      {accion && <div className="shrink-0">{accion}</div>}
    </div>
  )
}