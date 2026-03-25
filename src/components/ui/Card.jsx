export function Card({ children, className = '', onClick }) {
  const clickable = onClick 
    ? 'cursor-pointer hover:border-[var(--mango)]/30 hover:shadow-md active:scale-[0.99] transition-all duration-200' 
    : ''
  return (
    <div className={`bg-white dark:bg-zinc-900 shadow-sm dark:shadow-none 
      border border-[var(--mango)]/8 dark:border-zinc-800 
      rounded-2xl p-4 md:p-5 ${clickable} ${className}`} onClick={onClick}>
      {children}
    </div>
  )
}

export function CardHeader({ titulo, subtitulo = null, accion = null }) {
  return (
    <div className="flex items-start justify-between mb-3">
      <div>
        <h2 className="text-xs font-semibold text-[var(--mango-dark)] dark:text-[var(--mango)] uppercase tracking-wider">{titulo}</h2>
        {subtitulo && <p className="text-xl font-semibold mt-0.5">{subtitulo}</p>}
      </div>
      {accion && <div>{accion}</div>}
    </div>
  )
}