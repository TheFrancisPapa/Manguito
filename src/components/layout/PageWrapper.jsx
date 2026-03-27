// src/components/layout/PageWrapper.jsx
import { Header } from './Header'

export function PageWrapper({ children, className = '' }) {
  return (
    <>
      <Header />
      <main
        className={`
          min-h-screen
          bg-[var(--cream-soft)] dark:bg-[var(--dark-bg)]
          px-4 pt-5
          pb-24 md:pb-8
          ${className}
        `}
        style={{ paddingBottom: 'calc(env(safe-area-inset-bottom) + 80px)' }}
      >
        <div className="max-w-xl mx-auto md:max-w-4xl">
          {children}
        </div>
      </main>
    </>
  )
}

export function PageHeader({ titulo, subtitulo = null, accion = null }) {
  return (
    <div className="flex flex-col gap-2 mb-5 sm:flex-row sm:items-start sm:justify-between sm:gap-3">
      {/* Título siempre visible, sin truncar */}
      <div className="flex-1 min-w-0">
        <h1 className="text-xl font-bold text-zinc-900 dark:text-white leading-tight">
          {titulo}
        </h1>
        {subtitulo && (
          <p className="text-sm text-zinc-400 dark:text-zinc-500 mt-0.5 leading-snug">
            {subtitulo}
          </p>
        )}
      </div>
      {/* Botones alineados a la derecha en sm+, o al final en mobile */}
      {accion && (
        <div className="flex-shrink-0 self-start">
          {accion}
        </div>
      )}
    </div>
  )
}