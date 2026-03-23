import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuthContext } from '../context/AuthContext'
import { Spinner } from '../components/ui'

function LoadingScreen() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-50 dark:bg-zinc-950">
      <Spinner size={40} className="text-amber-500" />
    </div>
  )
}

// Rutas que requieren estar logueado
export function PrivateRoute({ children }) {
  const { estaLogueado, cargando } = useAuthContext()  // ← sesion, no session
  const location = useLocation()
  if (cargando) return <LoadingScreen />
  if (!estaLogueado) return <Navigate to="/login" state={{ from: location }} replace />
  return children ?? <Outlet />
}

// Rutas solo para no logueados (login, registro)
export function PublicRoute({ children }) {
  const { estaLogueado, cargando } = useAuthContext()
  const location = useLocation()
  if (cargando) return <LoadingScreen />
  if (estaLogueado) {
    const destino = location.state?.from?.pathname || '/dashboard'
    return <Navigate to={destino} replace />
  }
  return children ?? <Outlet />
}

// Alias para compatibilidad — mismo comportamiento que PrivateRoute
export const ProtectedRoute = PrivateRoute