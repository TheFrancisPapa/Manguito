import { Link, useLocation } from 'react-router-dom'

const LINKS = [
  { a: '/dashboard',     icono: '🏠', label: 'Inicio'     },
  { a: '/movimientos',   icono: '💸', label: 'Movs'       },
  { a: '/chat',          icono: '🤖', label: 'IA',        central: true },
  { a: '/cotizaciones',  icono: '💱', label: 'Divisas'    },
  { a: '/configuracion', icono: '👤', label: 'Perfil'     },
]

export function BottomNav() {
  const { pathname } = useLocation()
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/90 dark:bg-zinc-900/90
      backdrop-blur-xl border-t border-[var(--mango)]/10 dark:border-zinc-800
      flex items-center justify-around h-16 px-2 md:hidden">
      {LINKS.map(({ a, icono, label, central }) => {
        const activo = pathname === a
        if (central) {
          return (
            <Link key={a} to={a} className="relative -top-4">
              <div className={`w-14 h-14 rounded-full flex items-center justify-center text-2xl
                shadow-lg border-4 border-white dark:border-zinc-900 transition-all active:scale-95
                ${activo
                  ? 'bg-gradient-to-br from-[var(--mango)] to-[var(--mango-dark)] text-[var(--charcoal)] shadow-[var(--mango)]/40'
                  : 'bg-[var(--mango)] text-[var(--charcoal)] shadow-[var(--mango)]/30 hover:bg-[var(--mango-dark)]'
                }`}>
                {icono}
              </div>
            </Link>
          )
        }
        return (
          <Link key={a} to={a}
            className={`flex flex-col items-center gap-0.5 px-3 py-2 rounded-xl transition-colors
              ${activo ? 'text-[var(--mango-dark)]' : 'text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300'}`}>
            <span style={{ fontSize: 20, lineHeight: 1 }}
              className={activo ? 'scale-110 transition-transform' : ''}>{icono}</span>
            <span className={`text-[10px] ${activo ? 'font-semibold' : ''}`}>{label}</span>
          </Link>
        )
      })}
    </nav>
  )
}