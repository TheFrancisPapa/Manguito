// src/router/guards.jsx
import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuthContext } from '../context/AuthContext'

export function ProtectedRoute() {
  const { estaLogueado, onboardingOk } = useAuthContext()
  const { pathname } = useLocation()   // ← hook correcto

  if (!estaLogueado) return <Navigate to="/login" replace />

  if (!onboardingOk && pathname !== '/onboarding') {
    return <Navigate to="/onboarding" replace />
  }

  return <Outlet />
}

export function PublicRoute() {
  const { estaLogueado } = useAuthContext()
  return estaLogueado
    ? <Navigate to="/dashboard" replace />
    : <Outlet />
}