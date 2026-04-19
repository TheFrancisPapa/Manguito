// src/components/layout/PageWrapper.jsx
import { Header } from './Header'

export function PageWrapper({ children, className = '' }) {
  return (
    <>
      <Header />
      <main
        className={`min-h-screen px-4 pt-5 pb-24 md:pb-12 ${className.includes('!bg-transparent') ? '' : 'bg-transparent'} ${className}`}
      >
        <div className="max-w-md mx-auto md:max-w-[600px]">
          {children}
        </div>
      </main>
    </>
  )
}

export function PageHeader({ titulo, subtitulo = null, accion = null }) {
  return (
    <div className="flex flex-col gap-2 mb-6 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
      <div className="flex-1 min-w-0">
        <h1 className="text-2xl font-bold font-display text-zinc-900 dark:text-white leading-tight tracking-tight">
          {titulo}
        </h1>
        {subtitulo && (
          <p className="text-sm text-zinc-400 dark:text-zinc-500 mt-1 leading-snug font-medium">
            {subtitulo}
          </p>
        )}
      </div>
      {accion && (
        <div className="flex-shrink-0 self-start">
          {accion}
        </div>
      )}
    </div>
  )
}