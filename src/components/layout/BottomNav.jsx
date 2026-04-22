// src/components/layout/BottomNav.jsx — Premium iOS Tab Bar v2
// Cambios:
//   - Ícono IA: sparks + ondas, claramente "IA" no un candado
//   - "Plan" → "Organizar" para no confundir con planes de pago
import { Link, useLocation } from 'react-router-dom'

const IconHome = ({ active }) => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill={active ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth={active ? 0 : 1.8} strokeLinecap="round" strokeLinejoin="round">
    {active ? (
      <path d="M3 9.5L12 3l9 6.5V20a2 2 0 01-2 2H5a2 2 0 01-2-2V9.5z" />
    ) : (
      <>
        <path d="M3 9.5L12 3l9 6.5V20a1 1 0 01-1 1H4a1 1 0 01-1-1V9.5z" />
        <path d="M9 21V12h6v9" />
      </>
    )}
  </svg>
)

const IconMovs = ({ active }) => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? 2.4 : 1.8} strokeLinecap="round" strokeLinejoin="round">
    <path d="M7 16V4m0 0L3 8m4-4l4 4" />
    <path d="M17 8v12m0 0l4-4m-4 4l-4-4" />
  </svg>
)

// ── Nuevo ícono de IA: chispas + ondas cerebrales ─────────────
const IconAI = ({ active }) => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.9} strokeLinecap="round" strokeLinejoin="round">
    {/* Ondas de "pensamiento" */}
    <path d="M9.5 2C6.46 2 4 4.46 4 7.5c0 1.47.58 2.8 1.52 3.78C4.57 12.3 4 13.6 4 15a5 5 0 004.5 4.97V21h3v-1.03A5 5 0 0016 15c0-1.4-.57-2.7-1.52-3.72A5.49 5.49 0 0016 7.5C16 4.46 13.54 2 10.5 2H9.5z" strokeWidth="1.7"/>
    {/* Destellos / chispas arriba */}
    <path d="M17.5 3l.5 1.5 1.5.5-1.5.5L17.5 7l-.5-1.5L15.5 5l1.5-.5L17.5 3z" fill={active ? 'currentColor' : 'none'} strokeWidth="1.2"/>
    {/* Pequeña chispa */}
    <path d="M20 8l.3.9.9.3-.9.3L20 10.5l-.3-.9-.9-.3.9-.3L20 8z" fill={active ? 'currentColor' : 'none'} strokeWidth="1"/>
    {/* Punto central */}
    <circle cx="10" cy="11" r="1.2" fill="currentColor"/>
  </svg>
)

// ícono alternativo más reconocible como IA (circuito + destello)
const IconAIv2 = ({ active }) => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
    {/* Estrella/destello central — símbolo universal de IA */}
    <path
      d="M12 2l1.8 5.4L19.2 9l-5.4 1.8L12 16.2l-1.8-5.4L4.8 9l5.4-1.8L12 2z"
      fill={active ? 'currentColor' : 'none'}
      stroke="currentColor"
      strokeWidth="1.7"
    />
    {/* Puntos orbitales */}
    <circle cx="19.5" cy="5" r="1.2" fill="currentColor" stroke="none"/>
    <circle cx="4.5" cy="19" r="1" fill="currentColor" stroke="none"/>
    {/* Onditas abajo */}
    <path d="M8 20c0-2.2 1.8-4 4-4s4 1.8 4 4" strokeWidth="1.6" stroke="currentColor" fill="none"/>
  </svg>
)

const IconOrganizar = ({ active }) => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? 2.3 : 1.8} strokeLinecap="round" strokeLinejoin="round">
    {/* Gráfico de barras con target/meta encima */}
    <path d="M3 20h18" />
    <path d="M7 20v-8" strokeWidth={active ? 2.5 : 1.8}/>
    <path d="M12 20v-14" strokeWidth={active ? 2.5 : 1.8}/>
    <path d="M17 20v-5" strokeWidth={active ? 2.5 : 1.8}/>
    {active && <circle cx="12" cy="4.5" r="1.5" fill="currentColor" stroke="none"/>}
  </svg>
)

const IconPerfil = ({ active }) => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill={active ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth={active ? 0 : 1.8} strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="8" r="4" />
    <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
  </svg>
)

const LINKS = [
  { a: '/dashboard',     label: 'Inicio',    Icon: IconHome      },
  { a: '/movimientos',   label: 'Movs',      Icon: IconMovs      },
  { a: '/chat',          label: 'IA',        Icon: IconAIv2, central: true },
  { a: '/planificacion', label: 'Organizar', Icon: IconOrganizar },
  { a: '/configuracion', label: 'Perfil',    Icon: IconPerfil    },
]

export function BottomNav() {
  const { pathname } = useLocation()

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-40 md:hidden"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      {/* Gradient separator */}
      <div className="absolute top-0 left-0 right-0 h-px"
        style={{
          background: 'linear-gradient(90deg, transparent 0%, rgba(245,166,35,0.15) 25%, rgba(245,166,35,0.25) 50%, rgba(245,166,35,0.15) 75%, transparent 100%)'
        }}
      />

      <div
        className="flex items-center justify-around px-2"
        style={{
          height: '58px',
          background: 'rgba(254,250,244,0.88)',
          backdropFilter: 'blur(28px) saturate(190%)',
          WebkitBackdropFilter: 'blur(28px) saturate(190%)',
        }}
      >
        {LINKS.map(({ a, label, Icon, central }) => {
          const activo = pathname === a || (a !== '/dashboard' && pathname.startsWith(a))

          if (central) {
            return (
              <Link key={a} to={a} className="relative flex flex-col items-center flex-shrink-0 -mt-5">
                {/* Outer glow ring */}
                <div
                  className="absolute inset-0 rounded-[20px] -m-0.5"
                  style={{
                    background: 'var(--gradient-mango)',
                    opacity: activo ? 0.45 : 0.30,
                    filter: 'blur(10px)',
                    transform: 'scale(1.15)',
                  }}
                />
                <div
                  className={`
                    relative w-[54px] h-[54px] rounded-[18px]
                    flex items-center justify-center
                    transition-all duration-300
                    ${activo ? 'scale-[1.06]' : 'hover:scale-105 active:scale-95'}
                  `}
                  style={{
                    background: 'var(--gradient-mango)',
                    boxShadow: activo
                      ? '0 8px 24px rgba(245,166,35,0.6), 0 2px 8px rgba(0,0,0,0.15), inset 0 1px 0 rgba(255,255,255,0.25)'
                      : '0 6px 20px rgba(245,166,35,0.45), 0 2px 6px rgba(0,0,0,0.12), inset 0 1px 0 rgba(255,255,255,0.2)',
                  }}
                >
                  {/* Chispa decorativa top-right */}
                  <span
                    className="absolute -top-1.5 -right-1.5 text-[10px] leading-none"
                    style={{ filter: 'drop-shadow(0 0 3px rgba(255,255,255,0.8))' }}
                  >
                    ✦
                  </span>
                  <span className="text-white">
                    <Icon active={activo} />
                  </span>
                </div>
                <p
                  className="text-[9px] text-center mt-1.5 font-bold"
                  style={{ color: 'var(--mango-dark)' }}
                >
                  {label}
                </p>
              </Link>
            )
          }

          return (
            <Link
              key={a}
              to={a}
              className="relative flex flex-col items-center justify-center gap-0.5 flex-1 min-h-[50px] group"
              style={{ WebkitTapHighlightColor: 'transparent' }}
            >
              {/* Pill background for active state */}
              <div
                className="absolute inset-x-1 rounded-xl transition-all duration-300"
                style={{
                  top: '6px',
                  bottom: '18px',
                  background: activo ? 'rgba(245,166,35,0.10)' : 'transparent',
                  transform: activo ? 'scale(1)' : 'scale(0.85)',
                  opacity: activo ? 1 : 0,
                }}
              />

              {/* Icon */}
              <span
                className="relative z-10 transition-all duration-300"
                style={{
                  color: activo ? 'var(--mango-dark)' : 'rgb(161,161,170)',
                  transform: activo ? 'scale(1.12) translateY(-1px)' : 'scale(1)',
                  filter: activo ? 'drop-shadow(0 2px 4px rgba(245,166,35,0.3))' : 'none',
                }}
              >
                <Icon active={activo} />
              </span>

              {/* Label */}
              <span
                className="relative z-10 text-[9px] font-bold leading-none transition-all duration-300"
                style={{ color: activo ? 'var(--mango-dark)' : 'rgb(161,161,170)' }}
              >
                {label}
              </span>

              {/* Bottom indicator dot */}
              <span
                className="absolute transition-all duration-300"
                style={{
                  bottom: '4px',
                  width: activo ? '18px' : '6px',
                  height: '3px',
                  borderRadius: '2px',
                  background: 'var(--mango)',
                  opacity: activo ? 1 : 0,
                  boxShadow: activo ? '0 0 6px rgba(245,166,35,0.5)' : 'none',
                }}
              />
            </Link>
          )
        })}
      </div>

      {/* Dark mode override */}
      <style>{`
        .dark nav > div {
          background: rgba(15,15,15,0.88) !important;
        }
      `}</style>
    </nav>
  )
}