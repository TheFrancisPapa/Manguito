import { useState, useEffect } from 'react'
import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuthContext } from '../context/AuthContext'
import { Spinner } from '../components/ui'

const LoadingScreen = () => {
  const [timeoutAlcanzado, setTimeoutAlcanzado] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setTimeoutAlcanzado(true), 6000)
    return () => clearTimeout(timer)
  }, [])

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-zinc-50 dark:bg-zinc-950 animate-in fade-in duration-500 relative">
      <div className="animate-float mb-4 relative">
        <div className="absolute inset-0 bg-[var(--mango)] blur-xl opacity-20 rounded-full animate-pulse"></div>
        <img 
          src="/Mango.png" 
          alt="Cargando Manguito" 
          className="relative w-20 h-20 object-contain" 
        />
      </div>
      <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400 animate-pulse tracking-wide z-10">
        Acomodando los números...
      </p>

      {timeoutAlcanzado && (
        <div className="absolute bottom-10 px-6 py-4 bg-red-50 dark:bg-red-900/10 text-red-600 dark:text-red-400 rounded-2xl max-w-sm text-center border border-red-200 dark:border-red-900/30 shadow-lg text-sm animate-in slide-in-from-bottom-5">
          <p className="font-semibold mb-1">¡La red está tardando demasiado!</p>
          <p>Puede que un bloqueador de anuncios (AdBlock), firewall, o un VPN esté deteniendo la conexión a Supabase.</p>
          <button onClick={() => window.location.reload()} className="mt-3 cursor-pointer underline font-bold">Recargar página</button>
        </div>
      )}
    </div>
  )
}

// Rutas que requieren estar logueado
export function PrivateRoute({ children }) {
  const { session, cargando } = useAuthContext()
  const location = useLocation()

  if (cargando) return <LoadingScreen />

  if (!session) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  return children
}

// Rutas solo para no logueados (login, registro)
export function PublicRoute({ children }) {
  const { session, cargando } = useAuthContext()
  const location = useLocation()

  if (cargando) return <LoadingScreen />

  if (session) {
    const destino = location.state?.from?.pathname || '/dashboard'
    return <Navigate to={destino} replace />
  }

  return children
}

// Alias para compatibilidad — mismo comportamiento que PrivateRoute
export const ProtectedRoute = PrivateRoute