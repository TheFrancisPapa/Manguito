import { Link, useLocation } from 'react-router-dom'

const LINKS = [
  { a: '/dashboard',    icono: '🏠', label: 'Inicio'      },
  { a: '/movimientos',  icono: '💸', label: 'Movimientos' },
  { a: '/presupuestos', icono: '📊', label: 'Límites'     },
  { a: '/metas',        icono: '🎯', label: 'Metas'       },
  { a: '/chat',         icono: '🤖', label: 'IA'          },
]

export function BottomNav() {
  const { pathname } = useLocation()
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-lg border-t border-zinc-100/50 dark:border-zinc-800/50 flex items-center justify-around h-16 px-2 md:hidden">
      {LINKS.map(({ a, icono, label }) => {
        const activo = pathname === a
        return (
          <Link key={a} to={a}
            className={`flex flex-col items-center gap-0.5 px-3 py-2 rounded-xl transition-colors
              ${activo ? 'text-amber-500' : 'text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300'}`}>
            <span style={{ fontSize: 20, lineHeight: 1 }}>{icono}</span>
            <span className={`text-[10px] ${activo ? 'font-medium' : ''}`}>{label}</span>
          </Link>
        )
      })}
    </nav>
  )
}