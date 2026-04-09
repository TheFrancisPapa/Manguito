// src/components/layout/BottomNav.jsx — iOS Tab Bar
import { Link, useLocation } from 'react-router-dom'

const IconHome = ({ active }) => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill={active ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth={active ? 0 : 1.6} strokeLinecap="round" strokeLinejoin="round">
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
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? 2.2 : 1.6} strokeLinecap="round" strokeLinejoin="round">
    <path d="M7 16V4m0 0L3 8m4-4l4 4" />
    <path d="M17 8v12m0 0l4-4m-4 4l-4-4" />
  </svg>
)

const IconBot = ({ active }) => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill={active ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth={active ? 0 : 1.6} strokeLinecap="round" strokeLinejoin="round">
    {active ? (
      <>
        <rect x="2" y="7" width="20" height="14" rx="3" />
        <path d="M8 7V5a4 4 0 018 0v2" stroke="currentColor" strokeWidth="1.6" fill="none" />
        <circle cx="9" cy="13" r="1.5" fill="white" />
        <circle cx="15" cy="13" r="1.5" fill="white" />
        <path d="M9 17h6" stroke="white" strokeWidth="1.6" />
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

const IconDivisas = ({ active }) => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? 2.2 : 1.6} strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="9" fill={active ? 'currentColor' : 'none'} fillOpacity={active ? 0.15 : 0} />
    <path d="M12 3v18M3 12h18" opacity={0.3} />
    <path d="M8.5 8.5C8.5 7 10 6 12 6s3.5 1 3.5 2.5C15.5 11 8.5 11 8.5 13.5 8.5 15 10 16.5 12 16.5s3.5-1.5 3.5-3" />
  </svg>
)

const IconPerfil = ({ active }) => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill={active ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth={active ? 0 : 1.6} strokeLinecap="round" strokeLinejoin="round">
    {active ? (
      <>
        <circle cx="12" cy="8" r="4" />
        <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
      </>
    ) : (
      <>
        <circle cx="12" cy="8" r="4" />
        <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
      </>
    )}
  </svg>
)

const LINKS = [
  { a: '/dashboard',     label: 'Inicio',  Icon: IconHome    },
  { a: '/movimientos',   label: 'Movs',    Icon: IconMovs    },
  { a: '/chat',          label: 'IA',      Icon: IconBot,    central: true },
  { a: '/cotizaciones',  label: 'Divisas', Icon: IconDivisas },
  { a: '/configuracion', label: 'Perfil',  Icon: IconPerfil  },
]

export function BottomNav() {
  const { pathname } = useLocation()

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-40 md:hidden"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      {/* Top border — ultra subtle gradient */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-black/[0.06] dark:via-white/[0.06] to-transparent" />

      <div className="glass dark:glass-dark flex items-center justify-around px-1"
        style={{ height: '52px' }}>
        {LINKS.map(({ a, label, Icon, central }) => {
          const activo = pathname === a || (a !== '/dashboard' && pathname.startsWith(a))

          if (central) {
            return (
              <Link key={a} to={a} className="relative flex-shrink-0 -mt-5">
                <div
                  className={`w-[52px] h-[52px] rounded-[18px] flex items-center justify-center
                    shadow-lg transition-all duration-200 press-scale
                    ${activo ? 'scale-105' : ''}`}
                  style={{
                    background: 'var(--gradient-mango)',
                    boxShadow: '0 6px 20px rgba(245,166,35,0.45)',
                  }}
                >
                  <span className="text-white">
                    <Icon active={activo} />
                  </span>
                </div>
                <p className="text-[9px] text-center mt-1 font-bold text-[var(--mango-dark)] dark:text-[var(--mango)]">
                  {label}
                </p>
              </Link>
            )
          }

          return (
            <Link
              key={a}
              to={a}
              className="relative flex flex-col items-center justify-center gap-0.5 flex-1 min-h-[44px]
                transition-all duration-200 press-scale"
            >
              <span className={`transition-colors duration-200 ${
                activo
                  ? 'text-[var(--mango-dark)] dark:text-[var(--mango)]'
                  : 'text-zinc-400 dark:text-zinc-500'
              }`}>
                <Icon active={activo} />
              </span>
              <span className={`text-[9px] font-semibold leading-none transition-colors duration-200 ${
                activo
                  ? 'text-[var(--mango-dark)] dark:text-[var(--mango)]'
                  : 'text-zinc-400 dark:text-zinc-500'
              }`}>
                {label}
              </span>
              {activo && (
                <span className="absolute -bottom-0.5 w-4 h-[3px] rounded-full bg-[var(--mango)]" />
              )}
            </Link>
          )
        })}
      </div>
    </nav>
  )
}