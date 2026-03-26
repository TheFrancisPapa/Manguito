import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { supabase } from '../lib/supabase.js'
import { getPerfil } from '../api/auth.js'

const AuthContext = createContext({})

export const AuthProvider = ({ children }) => {
  const [session, setSession] = useState(null)
  const [usuario, setUsuario] = useState(null)
  const [cargando, setCargando] = useState(true)

  const cargarPerfil = useCallback(async (currentSession) => {
    if (!currentSession) {
      setUsuario(null)
      return
    }
    try {
      let perfil = await getPerfil()
      // Forzamos plan PRO para la cuenta del desarrollador
      if (perfil?.email === 'urielrt2095@gmail.com') {
        perfil.plan = 'pro'
      }
      setUsuario(perfil)
    } catch (err) {
      console.error("Error cargando perfil desde DB:", err)
      // Fallback a los metadatos de sesión si falla la DB
      const dataFallback = {
        id: currentSession.user.id,
        email: currentSession.user.email,
        ...currentSession.user.user_metadata
      }
      // También aplicamos el forzado en el fallback
      if (dataFallback.email === 'urielrt2095@gmail.com') {
        dataFallback.plan = 'pro'
      }
      setUsuario(dataFallback)
    }
  }, [])

  useEffect(() => {
    let montado = true

    async function getInitialSession() {
      try {
        const { data: { session }, error } = await supabase.auth.getSession()
        if (error) throw error
        
        if (montado && session) {
          setSession(session)
          await cargarPerfil(session)
        }
      } catch (error) {
        console.error("Error obteniendo sesión:", error)
      } finally {
        if (montado) setCargando(false)
      }
    }

    getInitialSession()

    // Escuchamos los cambios de sesión (login, logout)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, newSession) => {
      if (montado) {
        setSession(newSession)
        // Ejecutamos cargarPerfil de forma asíncrona pero sin retornar la promesa a Supabase
        // para evitar que gotrue-js mantenga el "lock" interno por más de 5000ms.
        cargarPerfil(newSession).finally(() => {
          if (montado) setCargando(false)
        })
      }
    })

    return () => {
      montado = false
      subscription?.unsubscribe()
    }
  }, [cargarPerfil])

  const recargarPerfil = async () => await cargarPerfil(session)

  return (
    <AuthContext.Provider value={{ session, usuario, cargando, recargarPerfil }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuthContext = () => useContext(AuthContext)