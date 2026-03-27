import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { actualizarPassword, onCambioSesion } from '../../api/auth'
import { Button, Input } from '../../components/ui'

export function ResetPassword() {
  const navigate = useNavigate()
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [cargando, setCargando] = useState(false)
  const [error, setError] = useState('')
  const [sesionValida, setSesionValida] = useState(false)

  const sesionValidaRef = useRef(false)
  
  useEffect(() => {
    sesionValidaRef.current = sesionValida
  }, [sesionValida])

  useEffect(() => {
    // Escuchamos si Supabase pudo iniciar la sesión de recuperación
    const unsubscribe = onCambioSesion((user) => {
      if (user) setSesionValida(true)
    })
    
    // Si después de 3 segundos no hay sesión, asumimos que el link es inválido
    // (Aumentamos un poco el tiempo para evitar falsos positivos en conexiones lentas)
    const timer = setTimeout(() => {
      if (!sesionValidaRef.current) {
        setError('El link de recuperación es inválido o expiró.')
      }
    }, 3000)

    return () => {
      unsubscribe()
      clearTimeout(timer)
    }
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres.')
      return
    }
    
    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden.')
      return
    }

    setCargando(true)
    setError('')
    try {
      await actualizarPassword(password)
      navigate('/dashboard')
    } catch (err) {
      console.error(err)
      setError(err.message || 'Hubo un error al actualizar tu contraseña.')
    } finally {
      setCargando(false)
    }
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-50 rounded-3xl shadow-sm border border-zinc-100 dark:border-zinc-800 p-6 md:p-8">
        
        <div className="text-center mb-6">
          <span className="text-4xl mb-3 block">🥭</span>
          <h1 className="text-2xl font-bold">Crear nueva contraseña</h1>
          <p className="text-zinc-500 text-sm mt-2">
            Escribí tu nueva contraseña. Asegurate de que sea segura y fácil de recordar.
          </p>
        </div>

        {error ? (
           <div className="flex flex-col gap-4">
            <div className="bg-red-50 dark:bg-red-900/20 text-red-600 text-sm px-4 py-3 rounded-xl border border-red-100 dark:border-red-900/50 animate-in fade-in zoom-in-95">
              {error}
            </div>
            <Button onClick={() => navigate('/login')} className="w-full">
              Volver al Login
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <Input 
              label="Nueva contraseña" 
              type="password" 
              placeholder="Mínimo 6 caracteres" 
              value={password} 
              onChange={e => { setPassword(e.target.value); setError(''); }}
              autoFocus
              required 
            />
            <Input 
              label="Repetir contraseña" 
              type="password" 
              placeholder="Mínimo 6 caracteres" 
              value={confirmPassword} 
              onChange={e => { setConfirmPassword(e.target.value); setError(''); }}
              required 
            />
            
            <Button type="submit" cargando={cargando} disabled={!sesionValida} className="w-full mt-2 py-3 text-base">
              {sesionValida ? 'Guardar y Entrar' : 'Validando link...'}
            </Button>
          </form>
        )}
      </div>
    </div>
  )
}
