import { useState, useEffect } from 'react'
import { getUsuarioActual, getPerfil, onCambioSesion,
         login, loginConGoogle, logout, registrar, recuperarPassword } from '../api/auth'

export function useAuth() {
  const [usuario,  setUsuario]  = useState(null)
  const [sesion,   setSesion]   = useState(null)
  const [cargando, setCargando] = useState(true)
  const [error,    setError]    = useState(null)

  useEffect(() => {
    cargarSesion()
    const limpiar = onCambioSesion(async (userAuth) => {
      setSesion(userAuth)
      if (userAuth) { const perfil = await getPerfil(); setUsuario(perfil) }
      else setUsuario(null)
      setCargando(false)
    })
    return limpiar
  }, [])

  async function cargarSesion() {
    try {
      const userAuth = await getUsuarioActual()
      setSesion(userAuth)
      if (userAuth) { const perfil = await getPerfil(); setUsuario(perfil) }
    } catch (e) { setError(e.message) }
    finally { setCargando(false) }
  }

  async function handleLogin(datos) {
    setError(null)
    try { await login(datos) }
    catch (e) { setError(e.message); throw e }
  }

  async function handleRegistrar(datos) {
    setError(null)
    try { await registrar(datos) }
    catch (e) { setError(e.message); throw e }
  }

  async function handleLogout() {
    await logout()
    setUsuario(null); setSesion(null)
  }

  return {
    usuario, sesion, cargando, error,
    estaLogueado: !!sesion,
    onboardingOk: usuario?.onboarding_ok ?? false,
    login: handleLogin, loginConGoogle,
    registrar: handleRegistrar, logout: handleLogout,
    recuperarPassword, recargarPerfil: cargarSesion,
  }
}