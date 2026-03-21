// src/context/AuthContext.jsx
// Hace disponible el usuario en toda la app sin pasar props.
// Uso: const { usuario, logout } = useAuthContext()

import { createContext, useContext } from 'react'
import { useAuth } from '../hooks/useAuth'
import { PageLoader } from '../components/ui'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const auth = useAuth()

  // Mientras verifica la sesión, mostrar loader
  // para que las páginas no hagan flash de contenido incorrecto
  if (auth.cargando) return <PageLoader />

  return (
    <AuthContext.Provider value={auth}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuthContext() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuthContext debe usarse dentro de <AuthProvider>')
  return ctx
}