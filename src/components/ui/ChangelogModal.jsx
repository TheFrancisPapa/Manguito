// ══════════════════════════════════════════════
//  src/components/ui/ChangelogModal.jsx
//  Modal de novedades que aparece automáticamente
//  cuando hay una nueva versión disponible.
// ══════════════════════════════════════════════
import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { hayNovedades, marcarComoVisto, getCambiosNuevos } from '../../lib/changelog'

const ICONO_TIPO = {
  nuevo:   { emoji: '✨', color: 'text-emerald-600 dark:text-emerald-400',  bg: 'bg-emerald-50 dark:bg-emerald-900/20'  },
  mejora:  { emoji: '⚡', color: 'text-[var(--mango-dark)] dark:text-[var(--mango)]', bg: 'bg-[var(--mango)]/8 dark:bg-[var(--mango)]/10' },
  fix:     { emoji: '🔧', color: 'text-blue-600 dark:text-blue-400',        bg: 'bg-blue-50 dark:bg-blue-900/20'         },
}

const LABEL_TIPO = {
  nuevo:  'Nuevo',
  mejora: 'Mejora',
  fix:    'Fix',
}

export function ChangelogModal() {
  const [abierto, setAbierto] = useState(false)
  const [versiones, setVersiones] = useState([])

  useEffect(() => {
    // Solo mostramos si hay novedades y el usuario está en una ruta privada
    async function checkNovedades() {
      try {
        const hasNew = await hayNovedades()
        if (hasNew) {
          const list = await getCambiosNuevos()
          setVersiones(list)
          // Pequeño delay para que no aparezca antes de que cargue la página
          setTimeout(() => setAbierto(true), 1200)
        }
      } catch (err) {
        console.error('[ChangelogModal] error:', err)
      }
    }
    checkNovedades()
  }, [])

  async function cerrar() {
    await marcarComoVisto()
    setAbierto(false)
  }

  if (!abierto) return null

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4"
      onClick={cerrar}
    >
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-in fade-in duration-300" />

      {/* Panel */}
      <div
        className="relative w-full max-w-md bg-white dark:bg-zinc-900 rounded-3xl
          border border-[var(--mango)]/20 dark:border-zinc-800 shadow-2xl
          animate-in slide-in-from-bottom-6 fade-in duration-400 max-h-[85vh] flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        {/* Línea decorativa superior */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-16 h-1
          bg-gradient-to-r from-[var(--mango)] to-[var(--mango-dark)] rounded-full -mt-0.5" />

        {/* Header */}
        <div className="flex items-start justify-between p-6 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-[var(--mango)]/15 dark:bg-[var(--mango)]/10
              flex items-center justify-center text-2xl flex-shrink-0">
              🥭
            </div>
            <div>
              <h2 className="text-base font-bold text-zinc-900 dark:text-white">
                ¡Novedades en Manguito!
              </h2>
              <p className="text-xs text-zinc-400 mt-0.5">
                {versiones.length > 1
                  ? `${versiones.length} actualizaciones nuevas`
                  : `Versión ${versiones[0]?.version}`}
              </p>
            </div>
          </div>
          <button
            onClick={cerrar}
            className="w-7 h-7 flex items-center justify-center rounded-lg text-zinc-400
              hover:text-[var(--mango-dark)] hover:bg-[var(--cream)] dark:hover:bg-zinc-800
              transition-colors text-sm flex-shrink-0 mt-0.5 cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Contenido scrolleable */}
        <div className="overflow-y-auto px-6 pb-2 flex-1">
          {versiones.map((version, vi) => (
            <div key={version.version} className={vi > 0 ? 'mt-5 pt-5 border-t border-zinc-100 dark:border-zinc-800' : ''}>

              {/* Encabezado de versión */}
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-bold text-zinc-900 dark:text-white leading-tight">
                  {version.titulo}
                </h3>
                <span className="text-[10px] text-zinc-400 flex-shrink-0 ml-3">
                  {new Date(version.fecha + 'T12:00:00').toLocaleDateString('es-AR', {
                    day: 'numeric', month: 'short', year: 'numeric'
                  })}
                </span>
              </div>

              {/* Lista de cambios */}
              <div className="flex flex-col gap-2">
                {version.cambios.map((cambio, ci) => {
                  const meta = ICONO_TIPO[cambio.tipo] ?? ICONO_TIPO.mejora
                  return (
                    <div key={ci} className="flex items-start gap-2.5">
                      <span
                        className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md
                          text-[10px] font-semibold flex-shrink-0 mt-0.5 ${meta.bg} ${meta.color}`}
                      >
                        {meta.emoji} {LABEL_TIPO[cambio.tipo]}
                      </span>
                      <p className="text-xs text-zinc-600 dark:text-zinc-300 leading-relaxed">
                        {cambio.texto}
                      </p>
                    </div>
                  )
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="p-6 pt-4">
          <button
            onClick={cerrar}
            className="w-full py-3 rounded-2xl text-sm font-semibold
              bg-gradient-to-r from-[var(--mango)] to-[var(--mango-dark)]
              hover:from-[var(--mango-dark)] hover:to-[#D4920F]
              text-[var(--charcoal)] shadow-lg shadow-[var(--mango)]/25
              border border-[var(--mango-dark)]/20
              transition-all active:scale-[0.98] cursor-pointer"
          >
            ¡Genial, entendido! 🚀
          </button>
          <p className="text-[10px] text-zinc-400 text-center mt-2">
            Podés ver el historial completo en el menú de configuración.
          </p>
        </div>
      </div>
    </div>,
    document.body
  )
}