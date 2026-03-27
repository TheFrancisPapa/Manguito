// src/components/layout/Header.jsx
import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useTheme } from '../../hooks/useTheme'
import { useAuthContext } from '../../context/AuthContext'

function obtenerSaludo(nombre) {
  const hora = new Date().getHours()
  const primerNombre = nombre?.split(' ')[0] || ''
  if (hora >= 5 && hora < 12)  return `Buenos días, ${primerNombre}`
  if (hora >= 12 && hora < 20) return `Buenas tardes, ${primerNombre}`
  return `Buenas noches, ${primerNombre}`
}

export function Header() {
  const { toggleTheme } = useTheme()
  const { usuario } = useAuthContext()
  const location = useLocation()
  const [menuAbierto, setMenuAbierto] = useState(false)

  const saludo = obtenerSaludo(usuario?.nombre)

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
      <header className="sticky top-0 z-30 w-full bg-[var(--cream-soft)]/90 dark:bg-[var(--dark-bg)]/90 backdrop-blur-md border-b border-zinc-200 dark:border-zinc-800">
        <div className="px-4 h-16 flex items-center justify-between max-w-xl mx-auto md:max-w-4xl">
          
          {/* Izquierda: Logo + Saludo */}
          <div className="flex items-center gap-2">
            <img src="/Mango.png" alt="Logo" className="w-8 h-8 object-contain" />
            <div>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">{saludo}</p>
              <p className="text-sm font-bold text-zinc-900 dark:text-white leading-none">Manguito</p>
            </div>
          </div>

          {/* Derecha: Menú Hamburguesa */}
          <button 
            onClick={() => setMenuAbierto(true)}
            className="p-2 -mr-2 text-zinc-700 dark:text-zinc-300 active:scale-95 transition-transform"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-7 h-7">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
            </svg>
          </button>
        </div>
      </header>

      {/* Menú Desplegable (Drawer) */}
      {menuAbierto && (
        <div className="fixed inset-0 z-50 flex justify-end animate-in fade-in duration-200">
          {/* Fondo oscuro transparente */}
          <div className="absolute inset-0 bg-black/50" onClick={() => setMenuAbierto(false)} />
          
          {/* Panel del menú */}
          <div className="relative w-64 h-full bg-white dark:bg-[var(--dark-bg)] shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
            <div className="p-4 flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800">
              <span className="font-bold text-lg">Menú</span>
              <button onClick={() => setMenuAbierto(false)} className="p-2 bg-zinc-100 dark:bg-zinc-800 rounded-full">
                ✕
              </button>
            </div>
            
            <nav className="flex-1 overflow-y-auto p-4 flex flex-col gap-2">
              {menuItems.map(item => (
                <Link 
                  key={item.path} 
                  to={item.path}
                  onClick={() => setMenuAbierto(false)}
                  className={`flex items-center gap-3 p-3 rounded-xl transition-colors ${location.pathname === item.path ? 'bg-[var(--mango)]/10 text-[var(--mango-dark)] font-bold' : 'text-zinc-600 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800/50'}`}
                >
                  <span className="text-xl">{item.icono}</span>
                  {item.label}
                </Link>
              ))}
            </nav>

            <div className="p-4 border-t border-zinc-100 dark:border-zinc-800">
              <button onClick={toggleTheme} className="w-full flex items-center justify-center gap-2 p-3 rounded-xl border border-zinc-200 dark:border-zinc-700 text-sm font-semibold">
                Cambiar Modo (Día/Noche)
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
