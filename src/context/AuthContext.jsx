import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { supabase } from '../lib/supabase.js'
import { getPerfil } from '../api/auth.js'
import { secureStorage } from '../lib/secureStorage.js'

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
      const perfil = await getPerfil()
      setUsuario(perfil)
    } catch (err) {
      console.error("Error cargando perfil desde DB:", err)
      // Fallback a los metadatos de sesión si falla la DB
      setUsuario({
        id: currentSession.user.id,
        email: currentSession.user.email,
        ...currentSession.user.user_metadata,
      })
    }
  }, [])

  useEffect(() => {
    let montado = true

    async function getInitialSession() {
      try {
        const { data: { session }, error } = await supabase.auth.getSession()
        if (error) throw error
        
        // Atar la clave de cifrado al usuario actual
        await secureStorage.bindUser(session?.user?.id || '')

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

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, newSession) => {
      if (montado) {
        setSession(newSession)
        // Atar la clave de cifrado al nuevo usuario (o limpiar si es logout)
        await secureStorage.bindUser(newSession?.user?.id || '')
        
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