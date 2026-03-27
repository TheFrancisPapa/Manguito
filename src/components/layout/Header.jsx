// src/components/layout/Header.jsx
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

      <MobileDrawer abierto={menuAbierto} onCerrar={() => setMenuAbierto(false)} />
    </>
  )
}
