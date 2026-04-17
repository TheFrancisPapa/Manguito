// src/components/ui/Card.jsx — Premium Depth Edition
export function Card({ children, className = '', onClick }) {
  const isClickable = !!onClick

  return (
    <div
      className={`
        card-premium
        bg-white dark:bg-[var(--dark-card)]
        border border-zinc-100/70 dark:border-[var(--dark-border)]
        rounded-[20px] p-5 w-full
        ${isClickable ? 'card-interactive cursor-pointer' : ''}
        ${className}
      `}
      onClick={onClick}
    >
      {/* Inner highlight line at top — rendered via CSS ::before */}
      {children}
    </div>
  )
}

export function CardHeader({ titulo, subtitulo = null, accion = null }) {
  return (
    <div className="flex items-start justify-between gap-2 mb-3">
      <div className="flex-1 min-w-0">
        <h2 className="text-[10px] uppercase font-extrabold tracking-[0.12em] text-zinc-400 dark:text-zinc-500 mb-1 leading-tight">
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