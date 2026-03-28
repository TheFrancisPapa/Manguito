// src/components/layout/MobileDrawer.jsx
import { Link, useLocation } from 'react-router-dom'
import { useTheme } from '../../hooks/useTheme'

const MENU_ITEMS = [
  // ── Principal
  { path: '/dashboard',     label: 'Panel Principal',   icono: '🏠', grupo: 'principal' },
  { path: '/movimientos',   label: 'Movimientos',       icono: '💸', grupo: 'principal' },
  { path: '/presupuestos',  label: 'Presupuestos',      icono: '📊', grupo: 'principal' },
  { path: '/metas',         label: 'Metas',             icono: '🎯', grupo: 'principal' },
  { path: '/inversiones',   label: 'Inversiones',       icono: '📈', grupo: 'principal' },
  // ── Herramientas
  { path: '/cotizaciones',  label: 'Cotizaciones',      icono: '💱', grupo: 'herramientas' },
  { path: '/nafta',         label: 'Precios de Nafta',  icono: '⛽', grupo: 'herramientas' },
  { path: '/calculadora',   label: 'Cuotas o Contado',  icono: '🧮', grupo: 'herramientas' },
  { path: '/chat',          label: 'ManguitoAI',        icono: '🤖', grupo: 'herramientas', badge: 'Pronto' },
  // ── Aprender
  { path: '/recursos',      label: 'Recursos',          icono: '📚', grupo: 'aprender' },
  // ── Cuenta
  { path: '/configuracion', label: 'Mi Perfil',         icono: '⚙️', grupo: 'cuenta' },
]

const GRUPOS = {
  principal:    'Principal',
  herramientas: 'Herramientas',
  aprender:     'Aprender',
  cuenta:       'Cuenta',
}

export function MobileDrawer({ abierto, onCerrar }) {
  const { toggleTheme } = useTheme()
  const location = useLocation()

  // Agrupar items
  const itemsPorGrupo = MENU_ITEMS.reduce((acc, item) => {
    if (!acc[item.grupo]) acc[item.grupo] = []
    acc[item.grupo].push(item)
    return acc
  }, {})

  return (
    <>
      {/* Fondo oscuro */}
      <div
        className={`fixed inset-0 z-40 bg-zinc-900/50 backdrop-blur-sm
          transition-opacity duration-300 ease-in-out
          ${abierto ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={onCerrar}
      />

      {/* Panel lateral */}
      <div
        className={`fixed top-0 right-0 z-50 w-72 h-full
          bg-white dark:bg-[var(--dark-bg)] shadow-2xl flex flex-col
          transform transition-transform duration-300 ease-in-out
          ${abierto ? 'translate-x-0' : 'translate-x-full'}`}
      >
        {/* Encabezado */}
        <div className="p-4 flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800">
          <div className="flex items-center gap-2">
            <img src="/Mango.png" alt="Logo" className="w-7 h-7 object-contain" />
            <span className="font-black text-lg bg-gradient-to-br from-[var(--mango)] to-[var(--mango-dark)] bg-clip-text text-transparent">
              Manguito
            </span>
          </div>
          <button
            onClick={onCerrar}
            className="w-8 h-8 flex items-center justify-center
              bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400
              rounded-full active:scale-90 transition-transform text-sm"
          >
            ✕
          </button>
        </div>

        {/* Navegación agrupada */}
        <nav className="flex-1 overflow-y-auto p-3 flex flex-col gap-1">
          {Object.entries(itemsPorGrupo).map(([grupo, items]) => (
            <div key={grupo}>
              <p className="text-[9px] font-black uppercase tracking-widest text-zinc-400
                dark:text-zinc-600 px-3 py-2 mt-2">
                {GRUPOS[grupo]}
              </p>
              {items.map(item => (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={onCerrar}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-2xl
                    transition-all active:scale-[0.98] ${
                    location.pathname === item.path
                      ? 'bg-[var(--mango)]/10 text-[var(--mango-dark)] dark:text-[var(--mango)] font-bold'
                      : 'text-zinc-600 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 font-medium'
                  }`}
                >
                  <span className="text-xl flex-shrink-0">{item.icono}</span>
                  <span className="text-sm flex-1">{item.label}</span>
                  {item.badge && (
                    <span className="text-[9px] font-black bg-amber-100 dark:bg-amber-900/30
                      text-amber-700 dark:text-amber-400 px-1.5 py-0.5 rounded-full">
                      {item.badge}
                    </span>
                  )}
                  {location.pathname === item.path && (
                    <span className="w-1.5 h-1.5 rounded-full bg-[var(--mango)] flex-shrink-0" />
                  )}
                </Link>
              ))}
            </div>
          ))}
        </nav>

        {/* Botón tema */}
        <div className="p-4 border-t border-zinc-100 dark:border-zinc-800">
          <button
            onClick={() => { toggleTheme(); onCerrar() }}
            className="w-full flex items-center justify-center gap-2 p-3.5 rounded-2xl
              bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800
              text-sm font-semibold text-zinc-700 dark:text-zinc-300
              active:scale-95 transition-all shadow-sm"
          >
            🌗 Cambiar Modo (Día/Noche)
          </button>
        </div>
      </div>
    </>
  )
}