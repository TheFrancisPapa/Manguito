// src/components/layout/Header.jsx — iOS-inspired premium header
import { useState } from 'react'
import { useAuthContext } from '../../context/AuthContext'
import { MobileDrawer } from './MobileDrawer'

function obtenerSaludo(nombre) {
  const hora = new Date().getHours()
  const primerNombre = nombre?.split(' ')[0] || ''
  if (hora >= 5 && hora < 12)  return `Buenos días, ${primerNombre}`
  if (hora >= 12 && hora < 20) return `Buenas tardes, ${primerNombre}`
  return `Buenas noches, ${primerNombre}`
}

export function Header() {
  const { usuario } = useAuthContext()
  const [menuAbierto, setMenuAbierto] = useState(false)
  const saludo = obtenerSaludo(usuario?.nombre)
  const inicial = usuario?.nombre?.[0]?.toUpperCase() ?? '🥭'

  return (
    <>
      <header className="sticky top-0 z-30 w-full">
        {/* Glass backdrop — extra blur like iOS */}
        <div className="absolute inset-0 bg-[var(--cream-soft)]/85 dark:bg-[var(--dark-bg)]/85 
          backdrop-blur-2xl border-b border-black/[0.04] dark:border-white/[0.06]" />
        
        <div className="relative px-4 flex items-center justify-between max-w-xl mx-auto md:max-w-4xl"
          style={{ height: '56px' }}>
          {/* Logo + Saludo */}
          <div className="flex items-center gap-2.5">
            <div className="relative flex-shrink-0">
              <div className="absolute inset-0 bg-[var(--mango)] blur-lg opacity-25 rounded-full" />
              <img src="/Mango.png" alt="Manguito" className="relative w-7 h-7 object-contain" />
            </div>
            <div>
              <p className="text-[10px] text-zinc-400 dark:text-zinc-500 font-medium leading-none tracking-wide">
                {saludo}
              </p>
              <p className="text-[13px] font-bold font-display text-zinc-900 dark:text-white leading-tight mt-0.5">
                Manguito
              </p>
            </div>
          </div>

          {/* Right side: avatar + hamburger */}
          <div className="flex items-center gap-2">
            {/* Mini avatar */}
            <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0
              bg-gradient-to-br from-[var(--mango)] to-[var(--mango-dark)]
              flex items-center justify-center shadow-sm
              border-2 border-white/80 dark:border-zinc-800/80">
              {usuario?.avatar_url ? (
                <img src={usuario.avatar_url} alt="" className="w-full h-full object-cover" />
              ) : (
                <span className="text-[11px] font-bold text-white">{inicial}</span>
              )}
            </div>

            {/* Hamburger — minimal iOS style */}
            <button
              onClick={() => setMenuAbierto(true)}
              className="p-2 -mr-2 rounded-xl text-zinc-500 dark:text-zinc-400
                hover:bg-black/[0.04] dark:hover:bg-white/[0.06]
                active:scale-95 transition-all duration-150"
              aria-label="Abrir menú"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
                <line x1="4" y1="7" x2="20" y2="7"/>
                <line x1="4" y1="12" x2="16" y2="12"/>
                <line x1="4" y1="17" x2="12" y2="17"/>
              </svg>
            </button>
          </div>
        </div>
      </header>

      <MobileDrawer abierto={menuAbierto} onCerrar={() => setMenuAbierto(false)} />
    </>
  )
}