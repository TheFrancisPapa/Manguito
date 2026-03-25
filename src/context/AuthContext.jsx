import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase.js'

const AuthContext = createContext({})

export const AuthProvider = ({ children }) => {
  const [session, setSession] = useState(null)
  const [usuario, setUsuario] = useState(null)
  const [cargando, setCargando] = useState(true)

  useEffect(() => {
    let montado = true

    async function getInitialSession() {
      try {
        const { data: { session }, error } = await supabase.auth.getSession()
        if (error) throw error
        
        if (montado && session) {
          setSession(session)
          setUsuario({
            id: session.user.id,
            email: session.user.email,
            ...session.user.user_metadata
          })
        }
      } catch (error) {
        console.error("Error obteniendo sesión:", error)
      } finally {
        // La clave de todo: esto SIEMPRE se ejecuta, evitando la carga infinita
        if (montado) setCargando(false)
      }
    }

    getInitialSession()

    // Escuchamos los cambios de sesión (login, logout)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (montado) {
        setSession(session)
        if (session) {
          setUsuario({
            id: session.user.id,
            email: session.user.email,
            ...session.user.user_metadata
          })
        } else {
          setUsuario(null)
        }
        setCargando(false)
      }
    })

    return () => {
      montado = false
      subscription?.unsubscribe()
    }
  }, [])

  return (
    <AuthContext.Provider value={{ session, usuario, cargando }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuthContext = () => useContext(AuthContext)