import { Outlet } from 'react-router-dom'
import { Sidebar } from './Sidebar'
import { BottomNav } from './BottomNav'
import { useAuthContext } from '../../context/AuthContext'

export function AppLayout() {
  const { usuario } = useAuthContext()

  return (
    <div className="flex bg-[var(--cream-soft)] dark:bg-[var(--dark-bg)] min-h-screen">
      {/* ── Desktop Sidebar ── */}
      <Sidebar usuario={usuario} />

      {/* ── Main Content Area ── 
          En desktop (md), el margen izquierdo empuja el contenido hacia la derecha 
          haciendo espacio para el sidebar encogido (w-[72px]). 
      */}
      <div className="flex-1 flex flex-col min-w-0 md:ml-[72px]">
        <Outlet />
      </div>

      {/* ── Mobile Bottom Navigation ── */}
      <BottomNav />
    </div>
  )
}
