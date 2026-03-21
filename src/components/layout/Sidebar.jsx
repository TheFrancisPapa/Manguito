// src/components/layout/Sidebar.jsx
// Navegación lateral para desktop (md+). Se oculta en mobile.

import { Link, useLocation } from 'react-router-dom'
import { logout }            from '../../api/auth'

const LINKS = [
  { a: '/dashboard',    icono: '🏠', label: 'Inicio'       },
  { a: '/movimientos',  icono: '💸', label: 'Movimientos'  },
  { a: '/presupuestos', icono: '📊', label: 'Presupuestos' },
  { a: '/metas',        icono: '🎯', label: 'Metas'        },
]

export function Sidebar({ usuario }) {
  const { pathname } = useLocation()

  async function handleLogout() {
    await logout()
    window.location.href = '/login'
  }

  return (
    <aside className="
      hidden md:flex flex-col
      fixed top-0 left-0 bottom-0
      w-56 z-40
      bg-white dark:bg-zinc-900
      border-r border-zinc-100 dark:border-zinc-800
      p-4
    ">
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-2 py-3 mb-4">
        <span style={{ fontSize: 26, lineHeight: 1 }}>🥭</span>
        <span className="text-lg font-semibold">Manguito</span>
      </div>

      {/* Links principales */}
      <nav className="flex flex-col gap-1 flex-1">
        {LINKS.map(({ a, icono, label }) => {
          const activo = pathname === a
          return (
            <Link
              key={a}
              to={a}
              className={`
                flex items-center gap-3
                px-3 py-2.5 rounded-xl text-sm
                transition-colors
                ${activo
                  ? 'bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 font-medium'
                  : 'text-zinc-500 hover:bg-zinc-50 dark:hover:bg-zinc-800 hover:text-zinc-800 dark:hover:text-zinc-200'
                }
              `}
            >
              <span style={{ fontSize: 18, lineHeight: 1 }}>{icono}</span>
              {label}
            </Link>
          )
        })}
      </nav>

      {/* Footer: perfil + logout */}
      {usuario && (
        <div className="border-t border-zinc-100 dark:border-zinc-800 pt-3 mt-3">
          <Link
            to="/configuracion"
            className="flex items-center gap-2.5 px-2 py-2 rounded-xl
                       hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
          >
            {usuario.avatar_url ? (
              <img
                src={usuario.avatar_url}
                className="w-8 h-8 rounded-full object-cover"
                alt=""
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-amber-100 dark:bg-amber-900/40
                              flex items-center justify-center text-sm font-medium
                              text-amber-700 dark:text-amber-400">
                {usuario.nombre?.[0]?.toUpperCase() ?? '?'}
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium truncate">{usuario.nombre}</p>
              <p className="text-xs text-zinc-400 truncate">{usuario.moneda}</p>
            </div>
          </Link>

          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2.5 px-3 py-2 mt-1
                       text-xs text-zinc-400 hover:text-red-500
                       hover:bg-red-50 dark:hover:bg-red-900/20
                       rounded-xl transition-colors"
          >
            <span style={{ fontSize: 14 }}>🚪</span>
            Cerrar sesión
          </button>
        </div>
      )}
    </aside>
  )
}