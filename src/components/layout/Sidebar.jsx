import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'

export function Sidebar({ usuario }) {
  const location = useLocation()
  const [expandido, setExpandido] = useState(false)
  
  const menu = [
    { path: '/dashboard', icono: '🏠', label: 'Panel' },
    { path: '/movimientos', icono: '💸', label: 'Movimientos' },
    { path: '/presupuestos', icono: '📊', label: 'Límites' },
    { path: '/metas', icono: '🎯', label: 'Metas' },
    { path: '/cotizaciones', icono: '💱', label: 'Cotizaciones' },
    { path: '/chat', icono: '🤖', label: 'Asesor IA' },
    { path: '/configuracion', icono: '⚙️', label: 'Perfil' },
  ]

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
        {/* Logo Manguito */}
        <div className="flex items-center gap-3 mb-8 px-2">
          <div className="relative flex-shrink-0">
            <div className="absolute inset-0 bg-[var(--mango)] blur-md opacity-30 rounded-full animate-pulse"></div>
            <img 
              src="/Mango.png" 
              alt="Logo Manguito" 
              className="relative w-10 h-10 object-contain" 
            />
          </div>
          <span className={`text-2xl font-extrabold bg-gradient-to-br from-[var(--mango)] to-[var(--mango-dark)] bg-clip-text text-transparent tracking-tight 
            transition-opacity duration-300 whitespace-nowrap
            ${expandido ? 'opacity-100' : 'opacity-0'}`}>
            Manguito
          </span>
        </div>

        <nav className="flex flex-col gap-1.5 flex-1">
          {menu.map(item => {
            const activo = location.pathname === item.path
            return (
              <Link 
                key={item.path} 
                to={item.path}
                title={item.label}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium transition-all duration-200 whitespace-nowrap
                  ${activo 
                    ? 'bg-[var(--mango)]/10 dark:bg-[var(--mango)]/10 text-[var(--mango-dark)] dark:text-[var(--mango)] shadow-sm border border-[var(--mango)]/15 dark:border-[var(--mango)]/20' 
                    : 'text-zinc-500 hover:text-[var(--mango-dark)] hover:bg-[var(--cream)] dark:hover:bg-[var(--mango)]/5'
                  }`}
              >
                <span className={`text-xl flex-shrink-0 transition-transform ${activo ? 'scale-110' : ''}`}>{item.icono}</span>
                <span className={`text-sm transition-opacity duration-300 ${expandido ? 'opacity-100' : 'opacity-0'}`}>
                  {item.label}
                </span>
              </Link>
            )
          })}
        </nav>

        {/* Mini perfil inferior */}
        <div className="mt-auto border-t border-[var(--mango)]/10 dark:border-zinc-800/50 pt-3">
          <div className="flex items-center gap-3 p-2 rounded-xl bg-[var(--cream)]/50 dark:bg-zinc-900/30">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-[var(--mango)] to-[var(--mango-dark)] overflow-hidden flex items-center justify-center text-[var(--charcoal)] font-bold shadow-md flex-shrink-0">
              {usuario?.avatar_url ? (
                <img src={usuario.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                usuario?.nombre?.[0]?.toUpperCase() ?? '🥭'
              )}
            </div>
            <div className={`flex-1 min-w-0 transition-opacity duration-300 whitespace-nowrap
              ${expandido ? 'opacity-100' : 'opacity-0'}`}>
              <p className="text-sm font-bold text-zinc-900 dark:text-white truncate">{usuario?.nombre}</p>
              <p className="text-xs text-[var(--mango-dark)] dark:text-[var(--mango)] truncate">Plan Gratuito</p>
            </div>
          </div>
        </div>
      </div>
    </aside>
  )
}