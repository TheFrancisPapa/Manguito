import { useAuthContext } from '../context/AuthContext'
import { login, loginConGoogle, logout, registrar, recuperarPassword } from '../api/auth'

/**
 * useAuth() - Thin wrapper around useAuthContext for backward compatibility.
 * Use useAuthContext() directly for a cleaner API in new components.
 */
export function useAuth() {
  const { session, usuario, cargando, recargarPerfil } = useAuthContext()

  return {
    usuario, 
    sesion: session, // useAuth uses 'sesion'
    cargando,
    estaLogueado: !!session,
    onboardingOk: usuario?.onboarding_ok ?? false,
    login, 
    loginConGoogle,
    registrar, 
    logout, 
    recuperarPassword, 
    recargarPerfil,
  }
}