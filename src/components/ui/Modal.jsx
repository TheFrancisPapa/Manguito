import { useEffect } from 'react'
import { createPortal } from 'react-dom'

export function Modal({ abierto, onCerrar, titulo, children, ancho = 'max-w-md' }) {
  useEffect(() => {
    if (abierto) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [abierto])

  useEffect(() => {
    const fn = (e) => { if (e.key === 'Escape') onCerrar() }
    window.addEventListener('keydown', fn)
    return () => window.removeEventListener('keydown', fn)
  }, [onCerrar])

  if (!abierto) return null

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-3 sm:p-4"
      onClick={onCerrar}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200" />

      {/* Panel */}
      <div
        className={`relative w-full ${ancho}
          bg-white dark:bg-[var(--dark-card)]
          rounded-3xl shadow-2xl
          border border-zinc-100/80 dark:border-[var(--dark-border)]
          overflow-hidden
          max-h-[92vh] flex flex-col
          animate-in slide-in-from-bottom-4 fade-in duration-300`}
        onClick={e => e.stopPropagation()}
      >
        {/* Accent line */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-14 h-1
          bg-gradient-to-r from-[var(--mango)] to-[var(--mango-dark)]
          rounded-full" />

        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-5 pb-3 flex-shrink-0">
          <h2 className="text-base font-bold font-display text-zinc-900 dark:text-white">
            {titulo}
          </h2>
          <button
            onClick={onCerrar}
            className="w-7 h-7 flex items-center justify-center rounded-xl text-zinc-400
              hover:text-zinc-700 dark:hover:text-zinc-200
              hover:bg-zinc-100 dark:hover:bg-zinc-700/60
              transition-all text-sm cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Content - scrollable, no x overflow */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden px-5 pb-5 min-h-0">
          {children}
        </div>
      </div>
    </div>,
    document.body
  )
}