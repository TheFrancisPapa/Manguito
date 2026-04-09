// src/components/ui/Modal.jsx — iOS Bottom Sheet Modal
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
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center"
      onClick={onCerrar}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/35 backdrop-blur-[6px]
        transition-opacity duration-200" />

      {/* Panel — slides up from bottom on mobile, centered on desktop */}
      <div
        className={`relative w-full ${ancho}
          bg-white dark:bg-[var(--dark-card)]
          rounded-t-[28px] sm:rounded-[24px]
          shadow-[0_-8px_40px_rgba(0,0,0,0.15)]
          dark:shadow-[0_-8px_40px_rgba(0,0,0,0.4)]
          border-0 sm:border sm:border-zinc-100/60 dark:sm:border-zinc-800/60
          overflow-hidden
          max-h-[92vh] flex flex-col
          animate-spring-up sm:animate-scale-in`}
        onClick={e => e.stopPropagation()}
      >
        {/* Grab handle — mobile only */}
        <div className="flex justify-center pt-3 pb-0 sm:hidden">
          <div className="sheet-handle" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-4 pb-3 flex-shrink-0">
          <h2 className="text-[15px] font-bold font-display text-zinc-900 dark:text-white">
            {titulo}
          </h2>
          <button
            onClick={onCerrar}
            className="w-7 h-7 flex items-center justify-center rounded-full text-zinc-400
              bg-zinc-100 dark:bg-zinc-800
              hover:text-zinc-600 dark:hover:text-zinc-200
              active:scale-90 transition-all text-[11px] cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Separator */}
        <div className="mx-5 h-px bg-zinc-100 dark:bg-zinc-800/60" />

        {/* Content - scrollable */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden px-5 py-4 min-h-0">
          {children}
        </div>
      </div>
    </div>,
    document.body
  )
}