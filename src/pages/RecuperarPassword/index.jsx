import { useState } from 'react'
import { Link } from 'react-router-dom'
import { recuperarPassword } from '../../api/auth'
import { Button, Input } from '../../components/ui'

export function RecuperarPassword() {
  const [email, setEmail] = useState('')
  const [cargando, setCargando] = useState(false)
  const [error, setError] = useState('')
  const [exito, setExito] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!email) {
      setError('Por favor, ingresá un email válido.')
      return
    }

    setCargando(true)
    setError('')
    try {
      await recuperarPassword(email)
      setExito(true)
    } catch (err) {
      console.error(err)
      setError(err.message || 'Hubo un error al intentar enviar el correo. Revisá tu email.')
    } finally {
      setCargando(false)
    }
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-50 rounded-3xl shadow-sm border border-zinc-100 dark:border-zinc-800 p-6 md:p-8">
        
        <div className="text-center mb-6">
          <span className="text-4xl mb-3 block">🥭</span>
          <h1 className="text-2xl font-bold">Recuperar contraseña</h1>
          <p className="text-zinc-500 text-sm mt-2">
            Ingresá tu correo y te enviaremos un link mágico para que puedas volver a entrar.
          </p>
        </div>

        {error && (
          <div className="mb-6 bg-red-50 dark:bg-red-900/20 text-red-600 text-sm px-4 py-3 rounded-xl border border-red-100 dark:border-red-900/50 animate-in fade-in zoom-in-95">
            {error}
          </div>
        )}

        {exito ? (
          <div className="flex flex-col gap-4 animate-in fade-in zoom-in-95">
            <div className="bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 text-sm px-4 py-3 rounded-xl border border-emerald-100 dark:border-emerald-900/50">
              ¡Listo! Te enviamos un correo con las instrucciones para crear una nueva contraseña. Revisá también tu carpeta de spam.
            </div>
            <Link to="/login" className="mt-2 flex justify-center">
              <Button variante="secondary" className="w-full">
                Volver al inicio de sesión
              </Button>
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <Input 
              label="Email" 
              type="email" 
              placeholder="Ej: vos@email.com" 
              value={email} 
              onChange={e => { setEmail(e.target.value); setError(''); }}
              autoFocus
              required 
            />
            
            <Button type="submit" cargando={cargando} className="w-full mt-2 py-3 text-base">
              Enviar link de recuperación
            </Button>
            
            <Link to="/login" className="text-center text-sm font-medium text-zinc-500 hover:text-amber-600 dark:hover:text-amber-400 transition-colors mt-2">
              Mejor cancelo y vuelvo a probar mi contraseña
            </Link>
          </form>
        )}
      </div>
    </div>
  )
}
