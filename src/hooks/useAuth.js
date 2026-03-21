// src/hooks/useAuth.js
// El hook más importante — sabe si hay sesión activa
// y expone el perfil del usuario a toda la app.
// Se usa en AuthContext para compartirlo globalmente.

import { useState, useEffect } from 'react'
import {
  getUsuarioActual, getPerfil,
  onCambioSesion, login, loginConGoogle,
  logout, registrar, recuperarPassword,
} from '../api/auth'

export function useAuth() {
  const [usuario, setUsuario]   = useState(null)   // perfil de public.usuarios
  const [sesion,  setSesion]    = useState(null)   // user de auth.users
  const [cargando, setCargando] = useState(true)
  const [error, setError]       = useState(null)

  useEffect(() => {
    // Carga inicial
    cargarSesion()

    // Escucha cambios (login, logout, expiración de token)
    const limpiar = onCambioSesion(async (userAuth) => {
      setSesion(userAuth)
      if (userAuth) {
        const perfil = await getPerfil()
        setUsuario(perfil)
      } else {
        setUsuario(null)
      }
      setCargando(false)
    })

    return limpiar
  }, [])

  async function cargarSesion() {
    try {
      const userAuth = await getUsuarioActual()
      setSesion(userAuth)
      if (userAuth) {
        const perfil = await getPerfil()
        setUsuario(perfil)
      }
    } catch (e) {
      setError(e.message)
    } finally {
      setCargando(false)
    }
  }

  async function handleLogin(datos) {
    setError(null)
    try {
      await login(datos)
      // onCambioSesion dispara automáticamente
    } catch (e) {
      setError(e.message)
      throw e
    }
  }

  async function handleRegistrar(datos) {
    setError(null)
    try {
      await registrar(datos)
    } catch (e) {
      setError(e.message)
      throw e
    }
  }

  async function handleLogout() {
    await logout()
    setUsuario(null)
    setSesion(null)
  }

  const estaLogueado  = !!sesion
  const onboardingOk  = usuario?.onboarding_ok ?? false

  return {
    usuario,        // perfil completo de public.usuarios
    sesion,         // user de auth.users
    cargando,
    error,
    estaLogueado,
    onboardingOk,
    login:           handleLogin,
    loginConGoogle,
    registrar:       handleRegistrar,
    logout:          handleLogout,
    recuperarPassword,
    recargarPerfil:  cargarSesion,
  }
}