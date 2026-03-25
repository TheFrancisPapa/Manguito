import { Link, useLocation } from 'react-router-dom'

export function Sidebar({ usuario }) {
  const location = useLocation()
  
  const menu = [
    { path: '/dashboard', icono: '📊', label: 'Panel' },
    { path: '/movimientos', icono: '💸', label: 'Movimientos' },
    { path: '/presupuestos', icono: '🚧', label: 'Límites' },
    { path: '/metas', icono: '🎯', label: 'Metas' },
    { path: '/chat', icono: '🤖', label: 'Asesor IA' }, // Agrego tu nueva ruta del chat!
    { path: '/configuracion', icono: '⚙️', label: 'Perfil' },
  ]

  return (
    <aside className="hidden md:flex flex-col w-64 h-screen fixed border-r border-orange-100 dark:border-zinc-800 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-2xl z-40">
      <div className="p-6">
        {/* Logo Manguito Premium */}
        <div className="flex items-center gap-3 mb-10">
          <div className="relative">
            <div className="absolute inset-0 bg-orange-400 blur-md opacity-40 rounded-full animate-pulse"></div>
            <img 
              src="/Mango.jpg" 
              alt="Logo Manguito" 
              className="relative w-12 h-12 rounded-2xl object-cover shadow-sm border-2 border-white dark:border-zinc-800" 
            />
          </div>
          <span className="text-3xl font-extrabold bg-gradient-to-br from-orange-500 to-amber-400 bg-clip-text text-transparent tracking-tight">
            Manguito
          </span>
        </div>

        <nav className="flex flex-col gap-2">
          {menu.map(item => {
            const activo = location.pathname === item.path
            return (
              <Link 
                key={item.path} 
                to={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-2xl font-medium transition-all duration-200 ${
                  activo 
                    ? 'bg-gradient-to-r from-orange-50 to-amber-50 dark:from-orange-500/10 dark:to-amber-500/5 text-orange-600 dark:text-orange-400 shadow-sm border border-orange-100 dark:border-orange-500/20' 
                    : 'text-zinc-500 hover:text-orange-500 hover:bg-orange-50/50 dark:hover:bg-zinc-900/50'
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
      <div className="mt-auto p-4 border-t border-orange-50 dark:border-zinc-800/50 m-4 bg-orange-50/50 dark:bg-zinc-900/30 rounded-2xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-400 to-amber-500 flex items-center justify-center text-white font-bold shadow-md">
            {usuario?.nombre?.[0]?.toUpperCase() ?? '🥭'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-zinc-900 dark:text-white truncate">{usuario?.nombre}</p>
            <p className="text-xs text-orange-600/80 dark:text-orange-400/80 truncate">Plan Gratuito</p>
          </div>
        </div>
      </div>
    </aside>
  )
}