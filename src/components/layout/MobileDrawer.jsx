// src/components/layout/MobileDrawer.jsx — iOS Bottom Sheet Style
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useTheme } from '../../hooks/useTheme'
import { useAuthContext } from '../../context/AuthContext'
import { logout } from '../../api/auth'

const MENU_ITEMS = [
  { path: '/dashboard',     label: 'Panel Principal',     icono: '🏠', grupo: 'dinero' },
  { path: '/movimientos',   label: 'Movimientos',         icono: '💸', grupo: 'dinero' },
  { path: '/inversiones',   label: 'Inversiones',         icono: '📈', grupo: 'dinero' },
  { path: '/planificacion', label: 'Organizar',           icono: '📊', grupo: 'organizacion' },
  { path: '/agenda',        label: 'Agenda de Pagos',     icono: '📅', grupo: 'organizacion'  },
  { path: '/chat',          label: 'ManguitoAI',          icono: '🤖', grupo: 'herramientas', badge: 'Pronto' },
  { path: '/cotizaciones',  label: 'Cotizaciones',        icono: '💱', grupo: 'herramientas' },
  { path: '/nafta',         label: 'Precios de Nafta',    icono: '⛽', grupo: 'herramientas' },
  { path: '/calculadora',   label: 'Calculadoras',        icono: '🧮', grupo: 'herramientas' },
  { path: '/comunidad',    label: 'Comunidad',           icono: '🌐', grupo: 'mas'  },
  { path: '/recursos',     label: 'Recursos',            icono: '📚', grupo: 'mas'  },
  { path: '/configuracion', label: 'Mi Cuenta',           icono: '⚙️', grupo: 'mas'    },
]

const GRUPOS = {
  dinero: 'Mi Dinero',
  organizacion: 'Organización',
  herramientas: 'Herramientas',
  mas: 'Más',
}

export function MobileDrawer({ abierto, onCerrar }) {
  const { toggleTheme, theme } = useTheme()
  const location = useLocation()
  const { usuario } = useAuthContext()
  const navigate = useNavigate()

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  const itemsPorGrupo = MENU_ITEMS.reduce((acc, item) => {
    if (!acc[item.grupo]) acc[item.grupo] = []
    acc[item.grupo].push(item)
    return acc
  }, {})

  const inicial = usuario?.nombre?.[0]?.toUpperCase() ?? '🥭'

  return (
    <>
      {/* Backdrop with blur */}
      <div
        className={`fixed inset-0 z-40 bg-black/30 backdrop-blur-[6px]
          transition-opacity duration-300 ${abierto ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={onCerrar}
      />

      {/* Bottom Sheet — iOS style */}
      <div
        className={`fixed inset-x-0 bottom-0 z-50 flex flex-col
          bg-white dark:bg-[var(--dark-card)]
          rounded-t-[28px] shadow-[0_-8px_40px_rgba(0,0,0,0.12)]
          transform transition-transform duration-[400ms] ease-[cubic-bezier(0.32,0.72,0,1)]
          ${abierto ? 'translate-y-0' : 'translate-y-full'}`}
        style={{ maxHeight: '85vh' }}
      >
        {/* Grab handle */}
        <div className="flex justify-center pt-3 pb-1 flex-shrink-0">
          <div className="sheet-handle" />
        </div>

        {/* User profile header */}
        <div className="px-5 pb-4 pt-2 flex items-center gap-4 border-b border-zinc-100 dark:border-zinc-800/60">
          {/* Avatar */}
          <div className="w-14 h-14 rounded-2xl overflow-hidden flex-shrink-0
            bg-gradient-to-br from-[var(--mango)] to-[var(--mango-dark)]
            flex items-center justify-center shadow-md
            border-2 border-white/90 dark:border-zinc-800/90">
            {usuario?.avatar_url ? (
              <img src={usuario.avatar_url} alt="" className="w-full h-full object-cover" />
            ) : (
              <span className="text-xl font-bold text-white">{inicial}</span>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-base font-bold text-zinc-900 dark:text-white truncate font-display">
              {usuario?.nombre || 'Usuario'}
            </p>
            <p className="text-xs text-[var(--mango-dark)] dark:text-[var(--mango)] font-semibold capitalize mt-0.5">
              Plan {usuario?.plan || 'Básico'}
            </p>
          </div>
          <button
            onClick={onCerrar}
            className="w-8 h-8 flex items-center justify-center
              bg-zinc-100 dark:bg-zinc-800 text-zinc-400 dark:text-zinc-500
              rounded-full text-xs active:scale-90 transition-all"
          >
            ✕
          </button>
        </div>

        {/* Navigation — scrollable */}
        <nav className="flex-1 overflow-y-auto px-4 py-3 flex flex-col gap-0.5 scrollbar-hide">
          {Object.entries(itemsPorGrupo).map(([grupo, items]) => (
            <div key={grupo}>
              <p className="text-[9px] font-extrabold uppercase tracking-[0.14em] text-zinc-400 dark:text-zinc-600 px-3 pt-3 pb-1.5">
                {GRUPOS[grupo]}
              </p>
              {items.map(item => {
                const activo = location.pathname === item.path
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={onCerrar}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-2xl
                      transition-all duration-150 press-scale ${
                      activo
                        ? 'bg-[var(--mango)]/10 dark:bg-[var(--mango)]/8 font-bold'
                        : 'font-medium hover:bg-zinc-50 dark:hover:bg-zinc-800/40'}`}
                  >
                    <span className={`text-lg flex-shrink-0 transition-transform duration-150
                      ${activo ? 'scale-110' : ''}`}>
                      {item.icono}
                    </span>
                    <span className={`text-[13px] flex-1 ${
                      activo
                        ? 'text-[var(--mango-dark)] dark:text-[var(--mango)]'
                        : 'text-zinc-600 dark:text-zinc-300'
                    }`}>
                      {item.label}
                    </span>
                    {item.badge && (
                      <span className="text-[8px] font-extrabold bg-amber-100 dark:bg-amber-900/30
                        text-amber-700 dark:text-amber-400 px-1.5 py-0.5 rounded-full uppercase tracking-wide">
                        {item.badge}
                      </span>
                    )}
                    {activo && <span className="w-1.5 h-1.5 rounded-full bg-[var(--mango)] flex-shrink-0" />}
                  </Link>
                )
              })}
            </div>
          ))}
        </nav>

        {/* Footer actions */}
        <div className="p-4 flex gap-2 border-t border-zinc-100 dark:border-zinc-800/60"
          style={{ paddingBottom: 'calc(env(safe-area-inset-bottom) + 16px)' }}>
          <button
            onClick={() => { toggleTheme(); onCerrar() }}
            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl
              bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200/60 dark:border-zinc-700/40
              text-xs font-semibold text-zinc-600 dark:text-zinc-300
              active:scale-[0.97] transition-all"
          >
            {theme === 'dark' ? '☀️ Claro' : '🌙 Oscuro'}
          </button>
          <button
            onClick={handleLogout}
            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl
              bg-red-50 dark:bg-red-900/15 border border-red-100 dark:border-red-800/30
              text-xs font-semibold text-red-500 dark:text-red-400
              active:scale-[0.97] transition-all"
          >
            🚪 Salir
          </button>
        </div>
      </div>
    </>
  )
}