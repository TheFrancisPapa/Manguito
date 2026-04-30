import { useState, useEffect } from 'react'
import { getRandomTip } from '../../data/tipsFinancieros'

export function TipContextual({ seccion, className = '' }) {
  const [tip, setTip] = useState('')
  const [animating, setAnimating] = useState(false)

  const cargarNuevoTip = () => {
    setAnimating(true)
    setTimeout(() => {
      let nuevoTip = getRandomTip(seccion)
      // Evitar que toque el mismo tip seguido si es posible
      while (nuevoTip === tip && nuevoTip !== '') {
        nuevoTip = getRandomTip(seccion)
      }
      setTip(nuevoTip)
      setAnimating(false)
    }, 300) // Duración del fade-out
  }

  useEffect(() => {
    setTip(getRandomTip(seccion))
  }, [seccion])

  if (!tip) return null

  return (
    <div className={`p-4 rounded-2xl bg-gradient-to-br from-[var(--mango)]/10 to-orange-500/5 
      border border-[var(--mango)]/20 shadow-sm relative overflow-hidden group ${className}`}>
      
      <div className="absolute -right-4 -top-4 text-6xl opacity-10 transform group-hover:scale-110 group-hover:rotate-12 transition-all duration-500">
        💡
      </div>

      <div className="relative z-10">
        <div className="flex items-center justify-between mb-2">
          <h4 className="text-xs font-black uppercase tracking-widest text-[var(--mango-dark)] dark:text-[var(--mango)] flex items-center gap-2">
            <span>Píldora Financiera</span>
          </h4>
          <button 
            onClick={cargarNuevoTip}
            className="text-[var(--mango-dark)] dark:text-[var(--mango)] opacity-50 hover:opacity-100 hover:rotate-180 transition-all duration-500 p-1 rounded-full hover:bg-[var(--mango)]/10"
            title="Ver otro tip"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/>
              <path d="M3 3v5h5"/>
            </svg>
          </button>
        </div>
        <p className={`text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed font-medium transition-opacity duration-300 ${animating ? 'opacity-0' : 'opacity-100'}`}>
          {tip}
        </p>
      </div>
    </div>
  )
}
