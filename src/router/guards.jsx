import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuthContext } from '../context/AuthContext'
import { Spinner } from '../components/ui'

export function PrivateRoute({ children }) {
  const { session, cargando } = useAuthContext()
  const location = useLocation()

  // Mientras chequea si hay sesión, mostramos un spinner centrado
  if (cargando) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-50 dark:bg-zinc-950">
        <Spinner size={40} className="text-amber-500" />
      </div>
    )
  }

  // Si no hay sesión, lo pateamos al login y guardamos a dónde quería ir
  if (!session) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  // Si está todo bien, lo dejamos pasar
  return children
}

export function ProtectedRoute() {
  const { estaLogueado, onboardingOk } = useAuthContext()
  const { pathname } = useLocation()
  if (!estaLogueado) return <Navigate to="/login" replace />
  if (!onboardingOk && pathname !== '/onboarding') return <Navigate to="/onboarding" replace />
  return <Outlet />
}

export function PublicRoute({ children }) {
  const { session, cargando } = useAuthContext()
  const location = useLocation()

  if (cargando) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-50 dark:bg-zinc-950">
        <Spinner size={40} className="text-amber-500" />
      </div>
    )
  }

  // Si ya está logueado y trata de ir al login/registro, lo mandamos al dashboard
  // (o a donde intentaba ir antes de que lo patee el PrivateRoute)
  if (session) {
    const destino = location.state?.from?.pathname || '/dashboard'
    return <Navigate to={destino} replace />
  }

  return children
}