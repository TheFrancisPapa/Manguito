export function Card({ children, className = '', onClick }) {
  const clickable = onClick ? 'cursor-pointer hover:border-zinc-200 dark:hover:border-zinc-600 transition-colors' : ''
  return (
    <div className={`bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800
      rounded-2xl p-4 ${clickable} ${className}`} onClick={onClick}>
      {children}
    </div>
  )
}

export function CardHeader({ titulo, subtitulo = null, accion = null }) {
  return (
    <div className="flex items-start justify-between mb-3">
      <div>
        <h2 className="text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">{titulo}</h2>
        {subtitulo && <p className="text-xl font-semibold mt-0.5">{subtitulo}</p>}
      </div>
      {accion && <div>{accion}</div>}
    </div>
  )
}