// src/components/ui/IOSInstallPrompt.jsx
// Onboarding de instalación para iOS Safari.
// Muestra un bottom sheet con instrucciones visuales paso a paso.
// Diseño alineado al design system de Manguito.

import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { useIOSInstall } from '../../hooks/useIOSInstall'

// ── Ícono "Compartir" de iOS (SVG) ─────────────────────────
function IconShare() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M4 12v8a2 2 0 002 2h12a2 2 0 002-2v-8" />
      <polyline points="16 6 12 2 8 6" />
      <line x1="12" y1="2" x2="12" y2="15" />
    </svg>
  )
}

// ── Pasos del tutorial ──────────────────────────────────────
const PASOS = [
  {
    numero: 1,
    icono: <IconShare />,
    titulo: 'Tocá el botón Compartir',
    desc: 'Es el ícono de la flecha hacia arriba en la barra inferior de Safari.',
    color: '#007AFF',
    bg: 'rgba(0,122,255,0.10)',
  },
  {
    numero: 2,
    icono: <span className="text-xl leading-none">＋</span>,
    titulo: 'Tocá "Agregar a inicio"',
    desc: 'Deslizá el menú hacia abajo y buscá la opción "Agregar a pantalla de inicio".',
    color: '#F5A623',
    bg: 'rgba(245,166,35,0.10)',
  },
  {
    numero: 3,
    icono: <span className="text-xl leading-none">✓</span>,
    titulo: 'Confirmá con "Agregar"',
    desc: '¡Listo! Manguito aparecerá en tu pantalla de inicio como una app nativa.',
    color: '#10B981',
    bg: 'rgba(16,185,129,0.10)',
  },
]

// ── Animación de flecha apuntando a la barra de Safari ─────
function FlechaSafari() {
  return (
    <div
      className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-full
        flex flex-col items-center gap-1 pointer-events-none"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      <div
        className="w-[2px] bg-[var(--mango)] rounded-full"
        style={{
          height: '28px',
          animation: 'arrowPulse 1.2s ease-in-out infinite',
        }}
      />
      <svg
        width="14"
        height="10"
        viewBox="0 0 14 10"
        fill="var(--mango)"
        style={{ animation: 'arrowPulse 1.2s ease-in-out infinite' }}
      >
        <path d="M7 10L0 0h14z" />
      </svg>
    </div>
  )
}

// ── Componente principal ────────────────────────────────────
export function IOSInstallPrompt() {
  const { visible, descartar } = useIOSInstall()
  const [montado, setMontado] = useState(false)
  const [pasoCurrent, setPasoCurrent] = useState(0)
  const [saliendo, setSaliendo] = useState(false)

  // Ciclo automático de pasos cada 2.5s
  useEffect(() => {
    if (!visible) return
    const iv = setInterval(
      () => setPasoCurrent(p => (p + 1) % PASOS.length),
      2500
    )
    return () => clearInterval(iv)
  }, [visible])

  // Montamos en document.body para el portal
  useEffect(() => { setMontado(true) }, [])

  const cerrar = (noMostrarMas = false) => {
    setSaliendo(true)
    setTimeout(() => {
      descartar(noMostrarMas)
      setSaliendo(false)
    }, 350)
  }

  if (!montado || !visible) return null

  const pasoActual = PASOS[pasoCurrent]

  return createPortal(
    <>
      {/* Keyframes inline (no dependen de Tailwind) */}
      <style>{`
        @keyframes arrowPulse {
          0%, 100% { opacity: 0.5; transform: translateY(0); }
          50%       { opacity: 1;   transform: translateY(4px); }
        }
        @keyframes slideUpPrompt {
          from { transform: translateY(100%); opacity: 0; }
          to   { transform: translateY(0);   opacity: 1; }
        }
        @keyframes slideDownPrompt {
          from { transform: translateY(0);   opacity: 1; }
          to   { transform: translateY(100%); opacity: 0; }
        }
        @keyframes stepFade {
          0%   { opacity: 0; transform: translateX(8px); }
          100% { opacity: 1; transform: translateX(0); }
        }
        .prompt-enter { animation: slideUpPrompt 0.42s cubic-bezier(0.34,1.56,0.64,1) forwards; }
        .prompt-exit  { animation: slideDownPrompt 0.32s ease-in forwards; }
        .step-anim    { animation: stepFade 0.35s ease-out forwards; }
      `}</style>

      {/* Overlay semitransparente */}
      <div
        className="fixed inset-0 z-[9990] bg-black/20 backdrop-blur-[2px]"
        onClick={() => cerrar(false)}
        aria-hidden="true"
      />

      {/* Panel principal */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Instalar Manguito en tu iPhone"
        className={`
          fixed bottom-0 left-0 right-0 z-[9991]
          ${saliendo ? 'prompt-exit' : 'prompt-enter'}
        `}
        style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
      >
        {/* Flecha apuntando a la barra de Safari */}
        <div className="relative">
          <FlechaSafari />
        </div>

        <div
          className="
            bg-white dark:bg-[var(--dark-card)]
            rounded-t-[28px]
            shadow-[0_-12px_48px_rgba(0,0,0,0.18)]
            border-t border-zinc-100/80 dark:border-zinc-800/60
            overflow-hidden
          "
        >
          {/* Grab handle */}
          <div className="flex justify-center pt-3 pb-0">
            <div className="w-9 h-[5px] rounded-full bg-zinc-200 dark:bg-zinc-700" />
          </div>

          <div className="px-5 pt-4 pb-6">
            {/* Header con logo + título */}
            <div className="flex items-center gap-3 mb-5">
              <div className="relative flex-shrink-0">
                <div className="absolute inset-0 bg-[var(--mango)] blur-lg opacity-35 rounded-2xl" />
                <div
                  className="relative w-14 h-14 rounded-2xl flex items-center justify-center
                    overflow-hidden shadow-md border border-white/20"
                  style={{ background: 'var(--gradient-mango)' }}
                >
                  <img
                    src="/Mango.png"
                    alt="Manguito"
                    className="w-10 h-10 object-contain"
                    onError={e => { e.target.style.display = 'none' }}
                  />
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="text-base font-black text-zinc-900 dark:text-white font-display leading-tight">
                  Agregá Manguito a tu inicio
                </h2>
                <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-0.5 font-medium">
                  Accedé más rápido, sin abrir Safari 🚀
                </p>
              </div>
              <button
                onClick={() => cerrar(false)}
                aria-label="Cerrar"
                className="
                  w-7 h-7 flex items-center justify-center rounded-full
                  bg-zinc-100 dark:bg-zinc-800
                  text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200
                  text-[11px] font-bold
                  active:scale-90 transition-all flex-shrink-0
                "
              >
                ✕
              </button>
            </div>

            {/* Paso actual — animado */}
            <div
              key={pasoCurrent}
              className="step-anim flex items-start gap-4 mb-5 p-4 rounded-2xl"
              style={{ background: pasoActual.bg }}
            >
              {/* Número + icono */}
              <div className="flex flex-col items-center gap-1.5 flex-shrink-0">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center font-black text-white text-sm shadow-sm"
                  style={{ background: pasoActual.color }}
                >
                  {pasoActual.icono}
                </div>
                <span
                  className="text-[9px] font-extrabold uppercase tracking-wider"
                  style={{ color: pasoActual.color }}
                >
                  Paso {pasoActual.numero}
                </span>
              </div>

              {/* Texto */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-zinc-900 dark:text-white leading-tight mb-1">
                  {pasoActual.titulo}
                </p>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
                  {pasoActual.desc}
                </p>
              </div>
            </div>

            {/* Indicadores de paso */}
            <div className="flex items-center justify-center gap-2 mb-5">
              {PASOS.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setPasoCurrent(i)}
                  aria-label={`Ir al paso ${i + 1}`}
                  className="transition-all duration-300"
                  style={{
                    width: i === pasoCurrent ? '20px' : '6px',
                    height: '6px',
                    borderRadius: '3px',
                    background: i === pasoCurrent ? 'var(--mango)' : '#D1D5DB',
                  }}
                />
              ))}
            </div>

            {/* Ventajas de instalar */}
            <div className="grid grid-cols-3 gap-2 mb-5">
              {[
                { icono: '⚡', label: 'Más rápido' },
                { icono: '📴', label: 'Sin safari' },
                { icono: '🔔', label: 'Sin pop-ups' },
              ].map(v => (
                <div
                  key={v.label}
                  className="flex flex-col items-center gap-1 p-2.5 rounded-xl
                    bg-zinc-50 dark:bg-zinc-800/50
                    border border-zinc-100 dark:border-zinc-800"
                >
                  <span className="text-lg">{v.icono}</span>
                  <span className="text-[10px] font-semibold text-zinc-500 dark:text-zinc-400 text-center">
                    {v.label}
                  </span>
                </div>
              ))}
            </div>

            {/* CTA + No mostrar más */}
            <button
              onClick={() => cerrar(true)}
              className="
                w-full py-3 rounded-2xl text-xs font-semibold
                text-zinc-400 dark:text-zinc-600
                hover:text-zinc-500 transition-colors
              "
            >
              Ya sé cómo hacerlo — no mostrar más
            </button>
          </div>
        </div>
      </div>
    </>,
    document.body
  )
}