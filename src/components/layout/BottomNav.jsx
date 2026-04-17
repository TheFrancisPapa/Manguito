// src/components/layout/BottomNav.jsx — Premium iOS Tab Bar
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

const IconBot = ({ active }) => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill={active ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth={active ? 0 : 1.8} strokeLinecap="round" strokeLinejoin="round">
    {active ? (
      <>
        <rect x="2" y="7" width="20" height="14" rx="3" />
        <path d="M8 7V5a4 4 0 018 0v2" stroke="currentColor" strokeWidth="1.8" fill="none" />
        <circle cx="9" cy="13" r="1.5" fill="white" />
        <circle cx="15" cy="13" r="1.5" fill="white" />
        <path d="M9 17h6" stroke="white" strokeWidth="1.8" />
      </>
    ) : (
      <>
        <rect x="2" y="7" width="20" height="14" rx="3" />
        <path d="M8 7V5a4 4 0 018 0v2" />
        <circle cx="9" cy="13" r="1.5" fill="currentColor" />
        <circle cx="15" cy="13" r="1.5" fill="currentColor" />
        <path d="M9 17h6" />
      </>
    )}
  </svg>
)

const IconPlan = ({ active }) => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? 2.4 : 1.8} strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 20V10M18 20V4M6 20v-4" />
  </svg>
)

const IconPerfil = ({ active }) => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill={active ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth={active ? 0 : 1.8} strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="8" r="4" />
    <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
  </svg>
)

const LINKS = [
  { a: '/dashboard',     label: 'Inicio',  Icon: IconHome    },
  { a: '/movimientos',   label: 'Movs',    Icon: IconMovs    },
  { a: '/chat',          label: 'IA',      Icon: IconBot,    central: true },
  { a: '/planificacion', label: 'Plan',    Icon: IconPlan    },
  { a: '/configuracion', label: 'Perfil',  Icon: IconPerfil  },
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
                    opacity: 0.35,
                    filter: 'blur(8px)',
                    transform: 'scale(1.1)',
                  }}
                />
                <div
                  className={`
                    relative w-[54px] h-[54px] rounded-[18px]
                    flex items-center justify-center
                    transition-all duration-300
                    ${activo
                      ? 'scale-[1.06]'
                      : 'hover:scale-105 active:scale-95'
                    }
                  `}
                  style={{
                    background: 'var(--gradient-mango)',
                    boxShadow: activo
                      ? '0 8px 24px rgba(245,166,35,0.55), 0 2px 8px rgba(0,0,0,0.15), inset 0 1px 0 rgba(255,255,255,0.2)'
                      : '0 6px 20px rgba(245,166,35,0.45), 0 2px 6px rgba(0,0,0,0.12), inset 0 1px 0 rgba(255,255,255,0.2)',
                  }}
                >
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

              {/* Icon with spring scale */}
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
                style={{
                  color: activo ? 'var(--mango-dark)' : 'rgb(161,161,170)',
                  transform: activo ? 'translateY(0px)' : 'translateY(0px)',
                }}
              >
                {label}
              </span>

              {/* Bottom indicator dot — fades in on active */}
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

      {/* Dark mode version */}
      <style>{`
        @media (prefers-color-scheme: dark) {
          .dark nav > div {
            background: rgba(15,15,15,0.88) !important;
          }
        }
        .dark nav > div {
          background: rgba(15,15,15,0.88) !important;
        }
      `}</style>
    </nav>
  )
}