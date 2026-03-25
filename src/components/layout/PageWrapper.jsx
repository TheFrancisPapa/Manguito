export function PageWrapper({ children, className = '' }) {
  return (
    <main className={`min-h-screen bg-[var(--cream-soft)] dark:bg-zinc-950 px-4 pt-6 pb-24 md:pb-6 md:pl-[88px] ${className}`}>
      <div className="max-w-2xl mx-auto md:max-w-4xl">{children}</div>
    </main>
  )
}

export function PageHeader({ titulo, subtitulo = null, accion = null }) {
  return (
    <div className="flex items-center justify-between mb-6">
      <div>
        <h1 className="text-xl font-bold text-[var(--charcoal)] dark:text-white">{titulo}</h1>
        {subtitulo && <p className="text-sm text-zinc-400 mt-0.5">{subtitulo}</p>}
      </div>
      {accion && <div>{accion}</div>}
    </div>
  )
}