export function Card({ children, className = '', onClick }) {
  const clickable = onClick 
    ? 'cursor-pointer hover:border-[var(--mango)]/50 hover:shadow-xl hover:scale-[1.01] active:scale-[0.99] transition-all duration-300' 
    : ''
  return (
    <div className={`bg-white dark:bg-zinc-900 shadow-lg dark:shadow-none 
      border border-zinc-100 dark:border-zinc-800 
      rounded-3xl p-6 md:p-8 ${clickable} ${className}`} onClick={onClick}>
      {children}
    </div>
  )
}

export function CardHeader({ titulo, subtitulo = null, accion = null }) {
  return (
    <div className="flex items-start justify-between mb-4">
      <div>
        <h2 className="text-[10px] uppercase font-black tracking-widest text-[var(--mango-dark)] dark:text-[var(--mango)] opacity-70 mb-1">{titulo}</h2>
        {subtitulo && <p className="text-2xl font-black text-[var(--charcoal)] dark:text-white leading-tight">{subtitulo}</p>}
      </div>
      {accion && <div className="ml-4">{accion}</div>}
    </div>
  )
}