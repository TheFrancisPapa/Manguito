// src/router/guards.jsx
// Dos guardas de ruta que leen el contexto de auth.

import { Navigate, Outlet } from 'react-router-dom'
import { useAuthContext }   from '../context/AuthContext'

// Solo para usuarios logueados
// Si no hay sesión → /login
// Si hay sesión pero no hizo onboarding → /onboarding
export function ProtectedRoute() {
  const { estaLogueado, onboardingOk } = useAuthContext()

  if (!estaLogueado) return <Navigate to="/login" replace />

  // Redirigir al onboarding si nunca lo completó
  // pero solo si no estamos ya en /onboarding
  if (!onboardingOk && location.pathname !== '/onboarding') {
    return <Navigate to="/onboarding" replace />
  }

  return <Outlet />
}

// Solo para usuarios NO logueados (login, registro)
// Si ya hay sesión → /dashboard
export function PublicRoute() {
  const { estaLogueado } = useAuthContext()
  return estaLogueado
    ? <Navigate to="/dashboard" replace />
    : <Outlet />
}