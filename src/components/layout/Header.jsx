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
          <div className="flex items-center gap-3">
            {/* Avatar with gold ring — like mockup */}
            <div className="relative flex-shrink-0">
              <div className="w-10 h-10 rounded-full overflow-hidden
                border-[2.5px] border-[var(--mango)]
                flex items-center justify-center shadow-sm
                bg-gradient-to-br from-[var(--mango)] to-[var(--mango-dark)]">
                {usuario?.avatar_url ? (
                  <img src={usuario.avatar_url} alt="" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-sm font-bold text-white">{inicial}</span>
                )}
              </div>
            </div>
            <div>
              <p className="text-[9px] text-[var(--mango-dark)] dark:text-[var(--mango)] font-extrabold leading-none tracking-[0.12em] uppercase">
                Manguito
              </p>
              <p className="text-[14px] font-bold font-display text-zinc-900 dark:text-white leading-tight mt-0.5">
                ¡{saludo}!
              </p>
            </div>
          </div>

          {/* Right side: hamburger */}
          <div className="flex items-center">
            <button
              onClick={() => setMenuAbierto(true)}
              className="p-2 -mr-2 rounded-xl text-zinc-500 dark:text-zinc-400
                hover:bg-black/[0.04] dark:hover:bg-white/[0.06]
                active:scale-95 transition-all duration-150"
              aria-label="Abrir menú"
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
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