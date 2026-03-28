// src/components/ui/TipFinanciero.jsx
import { useState } from 'react'
import { getTipDelDia, getTipsAleatorios } from '../../lib/tips'

/**
 * TipFinanciero — muestra el tip del día para la sección indicada.
 * Usa el día del año como índice de rotación (cambia cada 24hs automáticamente).
 *
 * Props:
 *   seccion  — 'presupuestos' | 'metas' | 'inversiones' | 'movimientos' | 'general'
 *   className — clases adicionales
 */
export function TipFinanciero({ seccion = 'general', className = '' }) {
  const [tip, setTip] = useState(() => getTipDelDia(seccion))
  const [visible, setVisible] = useState(true)

  const handleNuevoTip = () => {
    const [nuevo] = getTipsAleatorios(seccion, 1)
    setVisible(false)
    setTimeout(() => {
      setTip(nuevo)
      setVisible(true)
    }, 200)
  }

  return (
    <div className={`
      relative overflow-hidden rounded-2xl border
      bg-amber-50/60 dark:bg-amber-900/10
      border-amber-200/60 dark:border-amber-800/30
      px-4 py-3 ${className}
    `}>
      {/* Fondo decorativo */}
      <div className="absolute top-0 right-0 text-[72px] leading-none opacity-[0.06] select-none pointer-events-none -mt-2 -mr-2">
        💡
      </div>

      <div className={`flex items-start gap-3 transition-opacity duration-200 ${visible ? 'opacity-100' : 'opacity-0'}`}>
        {/* Emoji del tip */}
        <span className="text-xl flex-shrink-0 mt-0.5">{tip.emoji}</span>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 mb-0.5">
            <span className="text-[9px] font-black uppercase tracking-widest text-amber-700 dark:text-amber-400">
              💡 Tip del día
            </span>
          </div>
          <p className="text-xs text-zinc-700 dark:text-zinc-300 leading-relaxed">
            {tip.texto}
          </p>
        </div>

        {/* Botón para ver otro tip */}
        <button
          onClick={handleNuevoTip}
          title="Ver otro tip"
          className="flex-shrink-0 w-7 h-7 flex items-center justify-center rounded-lg
            text-amber-600 dark:text-amber-400
            hover:bg-amber-100 dark:hover:bg-amber-900/30
            transition-colors text-sm"
        >
          🔄
        </button>
      </div>
    </div>
  )
}