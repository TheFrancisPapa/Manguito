import { Link, useLocation } from 'react-router-dom'

export function Sidebar({ usuario }) {
  const location = useLocation()
  
  const menu = [
    { path: '/dashboard', icono: '🏠', label: 'Panel' },
    { path: '/movimientos', icono: '💸', label: 'Movimientos' },
    { path: '/presupuestos', icono: '📊', label: 'Límites' },
    { path: '/metas', icono: '🎯', label: 'Metas' },
    { path: '/chat', icono: '🤖', label: 'Asesor IA' },
    { path: '/configuracion', icono: '⚙️', label: 'Perfil' },
  ]

  return (
    <aside className="hidden md:flex flex-col w-64 h-screen fixed border-r border-[var(--mango)]/10 dark:border-zinc-800 bg-white/90 dark:bg-zinc-950/90 backdrop-blur-2xl z-40">
      <div className="p-6">
        {/* Logo Manguito */}
        <div className="flex items-center gap-3 mb-10">
          <div className="relative">
            <div className="absolute inset-0 bg-[var(--mango)] blur-md opacity-30 rounded-full animate-pulse"></div>
            <img 
              src="/Mango.jpg" 
              alt="Logo Manguito" 
              className="relative w-12 h-12 rounded-2xl object-cover shadow-sm border-2 border-white dark:border-zinc-800" 
            />
          </div>
          <span className="text-3xl font-extrabold bg-gradient-to-br from-[var(--mango)] to-[var(--mango-dark)] bg-clip-text text-transparent tracking-tight">
            Manguito
          </span>
        </div>

        <nav className="flex flex-col gap-1.5">
          {menu.map(item => {
            const activo = location.pathname === item.path
            return (
              <Link 
                key={item.path} 
                to={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-2xl font-medium transition-all duration-200 ${
                  activo 
                    ? 'bg-[var(--mango)]/10 dark:bg-[var(--mango)]/10 text-[var(--mango-dark)] dark:text-[var(--mango)] shadow-sm border border-[var(--mango)]/15 dark:border-[var(--mango)]/20' 
                    : 'text-zinc-500 hover:text-[var(--mango-dark)] hover:bg-[var(--cream)] dark:hover:bg-[var(--mango)]/5'
                }`}
              >
                <span className={`text-xl transition-transform ${activo ? 'scale-110' : ''}`}>{item.icono}</span>
                {item.label}
              </Link>
            )
          })}
        </nav>
      </div>

      {/* Mini perfil inferior */}
      <div className="mt-auto p-4 border-t border-[var(--mango)]/10 dark:border-zinc-800/50 m-4 bg-[var(--cream)]/50 dark:bg-zinc-900/30 rounded-2xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[var(--mango)] to-[var(--mango-dark)] overflow-hidden flex items-center justify-center text-[var(--charcoal)] font-bold shadow-md">
            {usuario?.avatar_url ? (
              <img src={usuario.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
            ) : (
              usuario?.nombre?.[0]?.toUpperCase() ?? '🥭'
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-zinc-900 dark:text-white truncate">{usuario?.nombre}</p>
            <p className="text-xs text-[var(--mango-dark)] dark:text-[var(--mango)] truncate">Plan Gratuito</p>
          </div>
        </div>
      </div>
    </aside>
  )
}