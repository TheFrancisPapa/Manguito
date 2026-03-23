import { createContext, useContext } from 'react'
import { useAuth } from '../hooks/useAuth'
import { PageLoader } from '../components/ui'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const auth = useAuth()
  if (auth.cargando) return <PageLoader />
  return <AuthContext.Provider value={auth}>{children}</AuthContext.Provider>
}

export function useAuthContext() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuthContext debe usarse dentro de <AuthProvider>')
  return ctx
}