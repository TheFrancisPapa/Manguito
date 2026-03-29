// src/components/layout/MobileDrawer.jsx
import { Link, useLocation } from 'react-router-dom'
import { useTheme } from '../../hooks/useTheme'
import { useAuthContext } from '../../context/AuthContext'
import { logout } from '../../api/auth'
import { useNavigate } from 'react-router-dom'

const MENU_ITEMS = [
  { path: '/dashboard',     label: 'Panel Principal',     icono: '🏠', grupo: 'principal' },
  { path: '/movimientos',   label: 'Movimientos',         icono: '💸', grupo: 'principal' },
  { path: '/presupuestos',  label: 'Presupuestos',        icono: '📊', grupo: 'principal' },
  { path: '/metas',         label: 'Metas de Ahorro',     icono: '🎯', grupo: 'principal' },
  { path: '/inversiones',   label: 'Inversiones',         icono: '📈', grupo: 'principal' },
  { path: '/vencimientos',  label: 'Agenda de Pagos',     icono: '📅', grupo: 'finanzas'  },
  { path: '/suscripciones', label: 'Suscripciones',       icono: '📱', grupo: 'finanzas'  },
  { path: '/cotizaciones',  label: 'Cotizaciones',        icono: '💱', grupo: 'herramientas' },
  { path: '/nafta',         label: 'Precios de Nafta',    icono: '⛽', grupo: 'herramientas' },
  { path: '/calculadora',   label: 'Calculadoras',        icono: '🧮', grupo: 'herramientas' },
  { path: '/chat',          label: 'ManguitoAI',          icono: '🤖', grupo: 'herramientas', badge: 'Pronto' },
  { path: '/recursos',      label: 'Recursos',            icono: '📚', grupo: 'aprender'  },
  { path: '/configuracion', label: 'Mi Perfil',           icono: '⚙️', grupo: 'cuenta'    },
]

const GRUPOS = { principal: 'Principal', finanzas: 'Finanzas', herramientas: 'Herramientas', aprender: 'Aprender', cuenta: 'Cuenta' }

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

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 z-40 bg-black/40 backdrop-blur-sm
          transition-opacity duration-300 ${abierto ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={onCerrar}
      />

      {/* Drawer */}
      <aside
        className={`fixed top-0 right-0 z-50 w-72 h-full flex flex-col
          bg-white dark:bg-[var(--dark-card)]
          shadow-[var(--shadow-lg)]
          transform transition-transform duration-300 ease-in-out
          ${abierto ? 'translate-x-0' : 'translate-x-full'}`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-zinc-100 dark:border-[var(--dark-border)]">
          <div className="flex items-center gap-2.5">
            <div className="relative">
              <div className="absolute inset-0 bg-[var(--mango)] blur-md opacity-30 rounded-full" />
              <img src="/Mango.png" alt="Logo" className="relative w-7 h-7 object-contain" />
            </div>
            <span className="font-black font-display text-lg text-gradient-mango">Manguito</span>
          </div>
          <button
            onClick={onCerrar}
            className="w-8 h-8 flex items-center justify-center
              bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400
              rounded-xl text-sm active:scale-90 transition-all"
          >
            ✕
          </button>
        </div>

        {/* User pill */}
        {usuario && (
          <div className="px-3 py-2 border-b border-zinc-100 dark:border-[var(--dark-border)]">
            <div className="flex items-center gap-2.5 px-2 py-2 bg-zinc-50 dark:bg-zinc-800/60 rounded-2xl">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[var(--mango)] to-[var(--mango-dark)]
                flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                {usuario.nombre?.[0]?.toUpperCase() ?? '🥭'}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-zinc-900 dark:text-white truncate">{usuario.nombre}</p>
                <p className="text-[10px] text-[var(--mango-dark)] dark:text-[var(--mango)] font-semibold capitalize">
                  Plan {usuario.plan || 'Básico'}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto p-3 flex flex-col gap-0.5">
          {Object.entries(itemsPorGrupo).map(([grupo, items]) => (
            <div key={grupo}>
              <p className="text-[9px] font-black uppercase tracking-[0.12em] text-zinc-400 dark:text-zinc-600 px-3 py-2 mt-2">
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
                      transition-all active:scale-[0.98] ${
                      activo
                        ? 'bg-[var(--mango)]/10 dark:bg-[var(--mango)]/8 text-[var(--mango-dark)] dark:text-[var(--mango)] font-bold border border-[var(--mango)]/15'
                        : 'text-zinc-600 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 font-medium'}`}
                  >
                    <span className="text-lg flex-shrink-0">{item.icono}</span>
                    <span className="text-sm flex-1">{item.label}</span>
                    {item.badge && (
                      <span className="text-[9px] font-black bg-amber-100 dark:bg-amber-900/30
                        text-amber-700 dark:text-amber-400 px-1.5 py-0.5 rounded-full">
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
        <div className="p-3 flex flex-col gap-2 border-t border-zinc-100 dark:border-[var(--dark-border)]">
          <button
            onClick={() => { toggleTheme(); onCerrar() }}
            className="flex items-center justify-center gap-2 p-3 rounded-2xl
              bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700/60
              text-xs font-semibold text-zinc-700 dark:text-zinc-300
              hover:bg-zinc-100 dark:hover:bg-zinc-800 active:scale-95 transition-all"
          >
            {theme === 'dark' ? '☀️ Modo claro' : '🌙 Modo oscuro'}
          </button>
          <button
            onClick={handleLogout}
            className="flex items-center justify-center gap-2 p-3 rounded-2xl
              bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800/30
              text-xs font-semibold text-red-600 dark:text-red-400
              hover:bg-red-100 dark:hover:bg-red-900/30 active:scale-95 transition-all"
          >
            🚪 Cerrar sesión
          </button>
        </div>
      </aside>
    </>
  )
}