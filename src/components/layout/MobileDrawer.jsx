import { Link, useLocation } from 'react-router-dom'
import { useTheme } from '../../hooks/useTheme'

export function MobileDrawer({ abierto, onCerrar }) {
  const { toggleTheme } = useTheme()
  const location = useLocation()

  const menuItems = [
    { path: '/dashboard', label: 'Panel Principal', icono: '🏠' },
    { path: '/movimientos', label: 'Movimientos', icono: '💸' },
    { path: '/presupuestos', label: 'Presupuestos', icono: '📊' },
    { path: '/metas', label: 'Metas', icono: '🎯' },
    { path: '/inversiones', label: 'Inversiones', icono: '📈' },
    { path: '/cotizaciones', label: 'Cotizaciones', icono: '💱' },
    { path: '/chat', label: 'Chat IA', icono: '🤖' },
    { path: '/configuracion', label: 'Mi Perfil', icono: '⚙️' },
  ]

  return (
    <>
      {/* 1. Fondo oscuro con desenfoque (backdrop-blur) */}
      <div 
        className={`fixed inset-0 z-40 bg-zinc-900/50 backdrop-blur-sm transition-opacity duration-300 ease-in-out ${abierto ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} 
        onClick={onCerrar} 
      />
      
      {/* 2. El panel lateral que entra desde la derecha */}
      <div 
        className={`fixed top-0 right-0 z-50 w-64 h-full bg-white dark:bg-[var(--dark-bg)] shadow-2xl flex flex-col transform transition-transform duration-300 cubic-bezier(0.4, 0, 0.2, 1) ${abierto ? 'translate-x-0' : 'translate-x-full'}`}
      >
        {/* Encabezado del menú */}
        <div className="p-4 flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800">
          <span className="font-bold text-lg text-zinc-900 dark:text-white">Menú</span>
          <button 
            onClick={onCerrar} 
            className="w-8 h-8 flex items-center justify-center bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 rounded-full active:scale-90 transition-transform"
          >
            ✕
          </button>
        </div>
        
        {/* Links de navegación */}
        <nav className="flex-1 overflow-y-auto p-4 flex flex-col gap-1.5">
          {menuItems.map(item => (
            <Link 
              key={item.path} 
              to={item.path}
              onClick={onCerrar}
              className={`flex items-center gap-3 p-3 rounded-2xl transition-all active:scale-[0.98] ${
                location.pathname === item.path 
                  ? 'bg-[var(--mango)]/10 text-[var(--mango-dark)] font-bold' 
                  : 'text-zinc-600 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 font-medium'
              }`}
            >
              <span className="text-xl flex-shrink-0">{item.icono}</span>
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Botón inferior (Modo oscuro) */}
        <div className="p-4 border-t border-zinc-100 dark:border-zinc-800 pb-safe">
          <button 
            onClick={() => { toggleTheme(); onCerrar(); }} 
            className="w-full flex items-center justify-center gap-2 p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-sm font-semibold text-zinc-700 dark:text-zinc-300 active:scale-95 transition-all shadow-sm"
          >
            Cambiar Modo (Día/Noche)
          </button>
        </div>
      </div>
    </>
  )
}
