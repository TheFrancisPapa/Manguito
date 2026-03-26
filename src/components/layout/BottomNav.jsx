// src/components/layout/BottomNav.jsx
import { Link, useLocation } from 'react-router-dom'

const IconHome = ({ active }) => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? 2.2 : 1.8} strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 9.5L12 3l9 6.5V20a1 1 0 01-1 1H4a1 1 0 01-1-1V9.5z" fill={active ? 'currentColor' : 'none'} fillOpacity={0.15} />
    <path d="M9 21V12h6v9" />
  </svg>
)

const IconMovs = ({ active }) => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? 2.2 : 1.8} strokeLinecap="round" strokeLinejoin="round">
    <path d="M7 16V4m0 0L3 8m4-4l4 4" />
    <path d="M17 8v12m0 0l4-4m-4 4l-4-4" />
  </svg>
)

const IconBot = () => (
  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="7" width="20" height="14" rx="3" fill="currentColor" fillOpacity={0.15} />
    <path d="M8 7V5a4 4 0 018 0v2" />
    <circle cx="9" cy="13" r="1.5" fill="currentColor" />
    <circle cx="15" cy="13" r="1.5" fill="currentColor" />
    <path d="M9 17h6" />
  </svg>
)

const IconDivisas = ({ active }) => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? 2.2 : 1.8} strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="9" fill={active ? 'currentColor' : 'none'} fillOpacity={0.1} />
    <path d="M12 3v18M3 12h18" opacity={0.5} />
    <path d="M8.5 8.5C8.5 7 10 6 12 6s3.5 1 3.5 2.5C15.5 11 8.5 11 8.5 13.5 8.5 15 10 16.5 12 16.5s3.5-1.5 3.5-3" />
  </svg>
)

const IconPerfil = ({ active }) => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? 2.2 : 1.8} strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="8" r="4" fill={active ? 'currentColor' : 'none'} fillOpacity={0.15} />
    <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
  </svg>
)

const LINKS = [
  { a: '/dashboard',    label: 'Inicio',   Icon: IconHome    },
  { a: '/movimientos',  label: 'Movs',     Icon: IconMovs    },
  { a: '/chat',         label: 'IA',       Icon: IconBot,    central: true },
  { a: '/cotizaciones', label: 'Divisas',  Icon: IconDivisas },
  { a: '/configuracion',label: 'Perfil',   Icon: IconPerfil  },
]

export function BottomNav() {
  const { pathname } = useLocation()

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 md:hidden"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
      {/* Borde superior sutil */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-amber-200/50 dark:via-amber-800/30 to-transparent" />
      
      <div className="bg-white/95 dark:bg-zinc-900/95 backdrop-blur-xl flex items-center justify-around h-16 px-1">
        {LINKS.map(({ a, label, Icon, central }) => {
          const activo = pathname === a

          if (central) {
            return (
              <Link key={a} to={a} className="relative -top-5 flex-shrink-0">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center
                  shadow-lg transition-all duration-200 active:scale-95
                  ${activo
                    ? 'bg-amber-500 shadow-amber-400/40'
                    : 'bg-gradient-to-br from-amber-400 to-amber-500 shadow-amber-400/30'
                  }`}
                  style={{ boxShadow: '0 4px 14px rgba(245,200,66,0.45)' }}>
                  <span className={activo ? 'text-amber-900' : 'text-amber-900'}>
                    <Icon />
                  </span>
                </div>
                <p className="text-[10px] text-center mt-1 font-semibold text-amber-600 dark:text-amber-400">
                  {label}
                </p>
              </Link>
            )
          }

          return (
            <Link key={a} to={a}
              className="flex flex-col items-center justify-center gap-1 flex-1 py-2 min-h-[56px]
                transition-all duration-150 active:scale-95">
              <span className={`transition-colors duration-150 ${
                activo
                  ? 'text-amber-500 dark:text-amber-400'
                  : 'text-zinc-400 dark:text-zinc-500'
              }`}>
                <Icon active={activo} />
              </span>
              <span className={`text-[10px] font-semibold leading-none transition-colors duration-150 ${
                activo
                  ? 'text-amber-600 dark:text-amber-400'
                  : 'text-zinc-400 dark:text-zinc-500'
              }`}>
                {label}
              </span>
              {/* Punto indicador activo */}
              {activo && (
                <span className="absolute bottom-1.5 w-1 h-1 rounded-full bg-amber-500" />
              )}
            </Link>
          )
        })}
      </div>
    </nav>
  )
}