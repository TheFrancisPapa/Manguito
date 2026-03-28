// src/components/layout/Sidebar.jsx — ACTUALIZADO con nuevas secciones
import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'

const MENU = [
  { path: '/dashboard',    icono: '🏠', label: 'Panel',        grupo: 'Principal' },
  { path: '/movimientos',  icono: '💸', label: 'Movimientos',  grupo: 'Principal' },
  { path: '/presupuestos', icono: '📊', label: 'Límites',      grupo: 'Principal' },
  { path: '/metas',        icono: '🎯', label: 'Metas',        grupo: 'Principal' },
  { path: '/inversiones',  icono: '📈', label: 'Inversiones',  grupo: 'Principal' },
  // Finanzas
  { path: '/vencimientos', icono: '📅', label: 'Pagos',        grupo: 'Finanzas' },
  { path: '/suscripciones',icono: '📱', label: 'Suscripciones',grupo: 'Finanzas' },
  // Herramientas
  { path: '/cotizaciones', icono: '💱', label: 'Cotizaciones', grupo: 'Herramientas' },
  { path: '/nafta',        icono: '⛽', label: 'Nafta',        grupo: 'Herramientas' },
  { path: '/calculadora',  icono: '🧮', label: 'Calculadora',  grupo: 'Herramientas' },
  { path: '/chat',         icono: '🤖', label: 'Asesor IA',    grupo: 'Herramientas', badge: '🛠️' },
  { path: '/recursos',     icono: '📚', label: 'Recursos',     grupo: 'Aprender' },
  { path: '/configuracion',icono: '⚙️', label: 'Perfil',       grupo: 'Cuenta' },
]

const GRUPOS_ORDEN = ['Principal', 'Finanzas', 'Herramientas', 'Aprender', 'Cuenta']

export function Sidebar({ usuario }) {
  const location = useLocation()
  const [expandido, setExpandido] = useState(false)

  const menuPorGrupo = MENU.reduce((acc, item) => {
    if (!acc[item.grupo]) acc[item.grupo] = []
    acc[item.grupo].push(item)
    return acc
  }, {})

  return (
    <aside
      onMouseEnter={() => setExpandido(true)}
      onMouseLeave={() => setExpandido(false)}
      className={`hidden md:flex flex-col h-screen fixed z-40 overflow-hidden
        border-r border-[var(--mango)]/10 dark:border-zinc-800
        bg-white/90 dark:bg-zinc-950/90 backdrop-blur-2xl
        transition-[width] duration-300 ease-in-out
        ${expandido ? 'w-64' : 'w-[72px]'}`}
    >
      <div className="p-4 flex flex-col h-full w-64">
        {/* Logo */}
        <div className="flex items-center gap-3 mb-6 px-2 flex-shrink-0">
          <div className="relative flex-shrink-0">
            <div className="absolute inset-0 bg-[var(--mango)] blur-md opacity-30 rounded-full animate-pulse" />
            <img src="/Mango.png" alt="Logo Manguito" className="relative w-10 h-10 object-contain" />
          </div>
          <span className={`text-2xl font-extrabold bg-gradient-to-br from-[var(--mango)] to-[var(--mango-dark)]
            bg-clip-text text-transparent tracking-tight whitespace-nowrap
            transition-opacity duration-300 ${expandido ? 'opacity-100' : 'opacity-0'}`}>
            Manguito
          </span>
        </div>

        {/* Navegación */}
        <nav className="flex flex-col flex-1 overflow-y-auto gap-0.5 overflow-x-hidden">
          {GRUPOS_ORDEN.map(grupo => {
            const items = menuPorGrupo[grupo]
            if (!items) return null
            return (
              <div key={grupo}>
                <div className={`px-3 pt-3 pb-1 transition-opacity duration-300 ${
                  expandido ? 'opacity-100' : 'opacity-0 pointer-events-none h-0 overflow-hidden py-0'}`}>
                  <p className="text-[9px] font-black uppercase tracking-widest text-zinc-400 dark:text-zinc-600 whitespace-nowrap">
                    {grupo}
                  </p>
                </div>

                {items.map(item => {
                  const activo = location.pathname === item.path
                  return (
                    <Link key={item.path} to={item.path}
                      title={!expandido ? item.label : undefined}
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium
                        transition-all duration-200 whitespace-nowrap
                        ${activo
                          ? 'bg-[var(--mango)]/10 dark:bg-[var(--mango)]/10 text-[var(--mango-dark)] dark:text-[var(--mango)] shadow-sm border border-[var(--mango)]/15 dark:border-[var(--mango)]/20'
                          : 'text-zinc-500 hover:text-[var(--mango-dark)] hover:bg-[var(--cream)] dark:hover:bg-[var(--mango)]/5'}`}>
                      <span className={`text-xl flex-shrink-0 transition-transform ${activo ? 'scale-110' : ''}`}>
                        {item.icono}
                      </span>
                      <span className={`text-sm flex-1 transition-opacity duration-300 ${expandido ? 'opacity-100' : 'opacity-0'}`}>
                        {item.label}
                      </span>
                      {item.badge && expandido && (
                        <span className="text-[9px] font-black bg-amber-100 dark:bg-amber-900/30
                          text-amber-700 dark:text-amber-400 px-1.5 py-0.5 rounded-full flex-shrink-0">
                          {item.badge}
                        </span>
                      )}
                    </Link>
                  )
                })}
              </div>
            )
          })}
        </nav>

        {/* Mini perfil */}
        <div className="mt-auto border-t border-[var(--mango)]/10 dark:border-zinc-800/50 pt-3 flex-shrink-0">
          <div className="flex items-center gap-3 p-2 rounded-xl bg-[var(--cream)]/50 dark:bg-zinc-900/30">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-[var(--mango)] to-[var(--mango-dark)]
              overflow-hidden flex items-center justify-center text-[var(--charcoal)] font-bold shadow-md flex-shrink-0">
              {usuario?.avatar_url
                ? <img src={usuario.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
                : usuario?.nombre?.[0]?.toUpperCase() ?? '🥭'}
            </div>
            <div className={`flex-1 min-w-0 transition-opacity duration-300 whitespace-nowrap ${expandido ? 'opacity-100' : 'opacity-0'}`}>
              <p className="text-sm font-bold text-zinc-900 dark:text-white truncate">{usuario?.nombre}</p>
              <p className="text-xs text-[var(--mango-dark)] dark:text-[var(--mango)] truncate capitalize">
                Plan {usuario?.plan || 'Básico'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </aside>
  )
}