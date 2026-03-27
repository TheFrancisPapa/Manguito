import { useEffect } from 'react'
import { createPortal } from 'react-dom'

export function Modal({ abierto, onCerrar, titulo, children, ancho = 'max-w-md' }) {
  useEffect(() => {
    if (abierto) document.body.style.overflow = 'hidden'
    else         document.body.style.overflow = ''
    return () => { document.body.style.overflow = '' }
  }, [abierto])

  useEffect(() => {
    const fn = (e) => { if (e.key === 'Escape') onCerrar() }
    window.addEventListener('keydown', fn)
    return () => window.removeEventListener('keydown', fn)
  }, [onCerrar])

  if (!abierto) return null

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4"
      onClick={onCerrar}>
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
      <div className={`relative w-full ${ancho} bg-white dark:bg-zinc-900 rounded-2xl p-6
        border border-[var(--mango)]/15 dark:border-zinc-800 shadow-xl overflow-x-hidden`}
        onClick={(e) => e.stopPropagation()}>
        {/* Línea decorativa mango en el header */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-12 h-1 bg-gradient-to-r from-[var(--mango)] to-[var(--mango-dark)] rounded-full -mt-0.5" />
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-base font-bold text-[var(--charcoal)] dark:text-white">{titulo}</h2>
          <button onClick={onCerrar}
            className="w-7 h-7 flex items-center justify-center rounded-lg text-zinc-400
              hover:text-[var(--mango-dark)] hover:bg-[var(--cream)] dark:hover:bg-[var(--mango)]/10 transition-colors text-sm cursor-pointer">
            ✕
          </button>
        </div>
        {children}
      </div>
    </div>,
    document.body
  )
}