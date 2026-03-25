import { Link, useLocation } from 'react-router-dom'

export function BottomNav() {
  const location = useLocation()
  
  const menu = [
    { path: '/dashboard', icono: '📊', label: 'Panel' },
    { path: '/movimientos', icono: '💸', label: 'Movs' },
    // El botón central flotante para "Nuevo Gasto" o el chat de IA
    { path: '/chat', icono: '🤖', label: 'Asesor', central: true }, 
    { path: '/presupuestos', icono: '🚧', label: 'Límites' },
    { path: '/metas', icono: '🎯', label: 'Metas' },
  ]

  return (
    <nav className="md:hidden fixed bottom-0 w-full bg-white/80 dark:bg-zinc-950/80 backdrop-blur-xl border-t border-orange-100 dark:border-zinc-800 pb-safe z-40">
      <div className="flex justify-around items-center h-16 px-2">
        {menu.map(item => {
          const activo = location.pathname === item.path
          
          if (item.central) {
            return (
              <Link key={item.path} to={item.path} className="relative -top-5">
                <div className={`w-14 h-14 rounded-full flex items-center justify-center text-2xl shadow-lg border-4 border-white dark:border-zinc-950 transition-transform active:scale-95 ${
                  activo 
                    ? 'bg-gradient-to-br from-orange-500 to-amber-400 text-white shadow-orange-500/40' 
                    : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400'
                }`}>
                  {item.icono}
                </div>
              </Link>
            )
          }

          return (
            <Link 
              key={item.path} 
              to={item.path}
              className={`flex flex-col items-center justify-center w-16 h-full transition-colors ${
                activo ? 'text-orange-600 dark:text-orange-400' : 'text-zinc-400 hover:text-orange-500'
              }`}
            >
              <span className={`text-xl mb-0.5 transition-transform ${activo ? 'scale-110' : ''}`}>{item.icono}</span>
              <span className="text-[10px] font-medium">{item.label}</span>
              {/* Puntito indicador naranja */}
              {activo && <span className="absolute bottom-1 w-1 h-1 rounded-full bg-orange-500" />}
            </Link>
          )
        })}
      </div>
    </nav>
  )
}