import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { login } from '../../api/auth'
import { Button, Input } from '../../components/ui'
import { useTheme } from '../../hooks/useTheme'

const PALABRAS_CLAVE = ['tus gastos', 'tus ahorros', 'tu futuro', 'tu plata']

export function LoginPage() {
  const navigate = useNavigate()
  const { theme } = useTheme()
  const [formData, setFormData] = useState({ email: '', password: '' })
  const [cargando, setCargando] = useState(false)
  const [error, setError] = useState('')
  const [palabraActual, setPalabraActual] = useState(0)
  const [animandoTexto, setAnimandoTexto] = useState(false)

  useEffect(() => {
    const intervalo = setInterval(() => {
      setAnimandoTexto(true)
      setTimeout(() => {
        setPalabraActual((prev) => (prev + 1) % PALABRAS_CLAVE.length)
        setAnimandoTexto(false)
      }, 500)
    }, 3500)
    return () => clearInterval(intervalo)
  }, [])

  const handleChange = (campo, valor) => {
    setFormData(prev => ({ ...prev, [campo]: valor }))
    setError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!formData.email || !formData.password) {
      setError('Por favor, completá todos los campos.')
      return
    }
    setCargando(true)
    try {
      // ✅ FIX: pasar un objeto, no dos argumentos separados
      await login({ email: formData.email, password: formData.password })
      // Eliminamos el navigate explícito para confiar en el PublicRoute que reacciona a onAuthStateChange
    } catch (err) {
      console.error(err)
      setError('Email o contraseña incorrectos. Volvé a intentar.')
      setCargando(false)
    }
  }

  return (
    <div className="min-h-screen w-full flex flex-col lg:flex-row bg-[var(--cream-soft)] dark:bg-[var(--dark-bg)] overflow-hidden">
      {/* Panel Izquierdo: Ilustración y Marketing */}
      <div className="hidden lg:flex lg:w-1/2 relative flex-col items-center justify-center p-12 bg-white dark:bg-zinc-900 border-r border-[var(--mango)]/10 dark:border-zinc-800">
        <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-[var(--mango)]/20 dark:bg-[var(--mango)]/10 rounded-full blur-[100px] animate-blob" />
        <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-[var(--primary-vibrant)]/10 rounded-full blur-[100px] animate-blob animation-delay-2000" />
        
        <div className="relative z-10 text-center">
          <div className="relative inline-block mb-8">
            <div className="absolute inset-0 bg-[var(--mango)] blur-3xl opacity-20 dark:opacity-30 rounded-full animate-pulse" />
            <img 
              src="/Mango.png" 
              alt="Logo Manguito" 
              className="relative w-40 h-40 lg:w-48 lg:h-48 object-contain drop-shadow-2xl animate-float"
            />
          </div>
          <h2 className="text-4xl font-bold text-[var(--charcoal)] dark:text-white mb-4 tracking-tight">
            Hace que tu plata <span className="text-[var(--leaf)] dark:text-[var(--primary-vibrant)]">crezca</span>
          </h2>
          <p className="text-lg text-zinc-500 dark:text-zinc-400 max-w-xs mx-auto leading-relaxed">
            La herramienta más simple para entender tus finanzas y alcanzar tus metas de ahorro.
          </p>
        </div>
      </div>

      {/* Panel Derecho: Formulario */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 lg:p-12 relative">
        {/* Fondo decorativo mobile */}
        <div className="lg:hidden absolute inset-0 overflow-hidden -z-10">
          <div className="absolute top-[-10%] left-[-10%] w-64 h-64 bg-[var(--mango)]/20 rounded-full blur-[80px]" />
          <div className="absolute bottom-[-10%] right-[-10%] w-64 h-64 bg-[var(--primary-vibrant)]/10 rounded-full blur-[80px]" />
        </div>

        <div className="w-full max-w-md">
          {/* Logo Mobile */}
          <div className="lg:hidden flex items-center justify-center gap-3 mb-10">
            <img src="/Mango.png" alt="Logo" className="w-12 h-12 object-contain" />
            <span className="text-3xl font-extrabold bg-gradient-to-br from-[var(--mango)] to-[var(--mango-dark)] bg-clip-text text-transparent italic">
              Manguito
            </span>
          </div>

          <div className="bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl rounded-3xl p-8 lg:p-10 shadow-xl border border-[var(--mango)]/10 dark:border-zinc-800">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-[var(--charcoal)] dark:text-white mb-2">¡Hola de nuevo! 👋</h1>
              <p className="text-zinc-500 dark:text-zinc-400">Ingresá tus datos para entrar a Manguito.</p>
            </div>

            {error && (
              <div className="mb-6 bg-red-50 dark:bg-red-900/20 text-red-600 text-sm px-4 py-3 rounded-xl border border-red-100 dark:border-red-900/50">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
              <Input
                label="Email"
                type="email"
                placeholder="tu@email.com"
                value={formData.email}
                onChange={e => handleChange('email', e.target.value)}
                required
                className="bg-zinc-50 dark:bg-zinc-800/50"
              />
              <div>
                <Input
                  label="Contraseña"
                  type="password"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={e => handleChange('password', e.target.value)}
                  required
                  className="bg-zinc-50 dark:bg-zinc-800/50"
                />
                <div className="flex justify-end mt-2">
                  <Link to="/recuperar-password" title="Recuperar contraseña" className="text-xs text-[var(--leaf)] hover:text-[var(--leaf-dark)] dark:text-[var(--primary-vibrant)] font-semibold transition-colors">
                    ¿Te olvidaste la contraseña?
                  </Link>
                </div>
              </div>

              <Button type="submit" cargando={cargando} className="w-full mt-4 py-4 text-base font-bold shadow-lg shadow-[var(--mango)]/20 dark:shadow-none">
                Entrar a mi cuenta
              </Button>
            </form>

            <div className="mt-10 pt-8 border-t border-zinc-100 dark:border-zinc-800 text-center">
              <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-3">¿Todavía no tenés cuenta?</p>
              <Link to="/registro" className="text-base font-bold text-[var(--charcoal)] dark:text-[var(--primary-vibrant)] hover:scale-105 inline-block transition-transform">
                Empezá gratis ahora &rarr;
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}