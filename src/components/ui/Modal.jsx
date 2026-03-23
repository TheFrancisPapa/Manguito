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
      <div className="absolute inset-0 bg-black/40" />
      <div className={`relative w-full ${ancho} bg-white dark:bg-zinc-900 rounded-2xl p-6
        border border-zinc-100 dark:border-zinc-800`}
        onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-base font-semibold">{titulo}</h2>
          <button onClick={onCerrar}
            className="w-7 h-7 flex items-center justify-center rounded-lg text-zinc-400
              hover:text-zinc-600 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors text-sm">
            ✕
          </button>
        </div>
        {children}
      </div>
    </div>,
    document.body
  )
}