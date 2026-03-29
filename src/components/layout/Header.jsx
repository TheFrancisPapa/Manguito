// src/components/layout/Header.jsx
import { useState } from 'react'
import { useAuthContext } from '../../context/AuthContext'
import { MobileDrawer } from './MobileDrawer'

function obtenerSaludo(nombre) {
  const hora = new Date().getHours()
  const primerNombre = nombre?.split(' ')[0] || ''
  if (hora >= 5 && hora < 12)  return `Buenos días, ${primerNombre} ☀️`
  if (hora >= 12 && hora < 20) return `Buenas tardes, ${primerNombre} 🌤️`
  return `Buenas noches, ${primerNombre} 🌙`
}

export function Header() {
  const { usuario } = useAuthContext()
  const [menuAbierto, setMenuAbierto] = useState(false)
  const saludo = obtenerSaludo(usuario?.nombre)

  return (
    <>
      <header className="sticky top-0 z-30 w-full">
        {/* Glass effect */}
        <div className="absolute inset-0 bg-[var(--cream-soft)]/90 dark:bg-[var(--dark-surface)]/90 backdrop-blur-xl border-b border-zinc-200/60 dark:border-[var(--dark-border)]" />
        
        <div className="relative px-4 h-15 flex items-center justify-between max-w-xl mx-auto md:max-w-4xl" style={{height: '60px'}}>
          {/* Logo + Saludo */}
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="absolute inset-0 bg-[var(--mango)] blur-lg opacity-30 rounded-full animate-pulse" />
              <img src="/Mango.png" alt="Manguito" className="relative w-8 h-8 object-contain" />
            </div>
            <div>
              <p className="text-[11px] text-zinc-500 dark:text-zinc-400 font-medium leading-none mb-0.5">
                {saludo}
              </p>
              <p className="text-sm font-bold font-display text-zinc-900 dark:text-white leading-none">
                Manguito
              </p>
            </div>
          </div>

          {/* Hamburger */}
          <button
            onClick={() => setMenuAbierto(true)}
            className="p-2 -mr-2 rounded-xl text-zinc-600 dark:text-zinc-300
              hover:bg-zinc-100/80 dark:hover:bg-zinc-800/60
              active:scale-95 transition-all duration-150"
            aria-label="Abrir menú"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <line x1="4" y1="6" x2="20" y2="6"/>
              <line x1="4" y1="12" x2="16" y2="12"/>
              <line x1="4" y1="18" x2="12" y2="18"/>
            </svg>
          </button>
        </div>
      </header>

      <MobileDrawer abierto={menuAbierto} onCerrar={() => setMenuAbierto(false)} />
    </>
  )
}