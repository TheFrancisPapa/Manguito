import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { login } from '../../api/auth'
import { Button, Input } from '../../components/ui'

const PALABRAS_CLAVE = ['tus gastos', 'tus ahorros', 'tu futuro', 'tu plata']

export function LoginPage() {
  const navigate = useNavigate()
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
    <div className="min-h-screen w-full flex items-center justify-center relative overflow-hidden bg-[var(--cream-soft)] dark:bg-zinc-950">
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-[var(--mango)]/30 dark:bg-[var(--mango)]/15 rounded-full blur-[100px] mix-blend-multiply dark:mix-blend-screen animate-blob" />
      <div className="absolute top-[20%] right-[-10%] w-96 h-96 bg-[var(--mango-dark)]/20 dark:bg-[var(--mango-dark)]/15 rounded-full blur-[100px] mix-blend-multiply dark:mix-blend-screen animate-blob animation-delay-2000" />
      <div className="absolute bottom-[-20%] left-[20%] w-96 h-96 bg-[var(--mango-light)]/30 dark:bg-[var(--mango-light)]/10 rounded-full blur-[120px] mix-blend-multiply dark:mix-blend-screen animate-blob animation-delay-4000" />

      <div className="container mx-auto px-4 relative z-10 flex flex-col lg:flex-row items-center justify-center lg:justify-evenly gap-12 lg:gap-0">
        <div className="text-center lg:text-left max-w-lg mt-10 lg:mt-0">
          <div className="inline-flex items-center justify-center lg:justify-start gap-3 mb-6">
            <div className="relative">
              <div className="absolute inset-0 bg-[var(--mango)] blur-md opacity-30 rounded-full animate-pulse"></div>
              <img src="/Mango.png" alt="Logo Manguito" className="relative w-14 h-14 lg:w-16 lg:h-16 rounded-2xl object-cover shadow-md border-2 border-white dark:border-zinc-800" />
            </div>
            <span className="text-3xl lg:text-4xl font-extrabold bg-gradient-to-br from-[var(--mango)] to-[var(--mango-dark)] bg-clip-text text-transparent tracking-tight">
              Manguito
            </span>
          </div>
          <h1 className="text-4xl lg:text-6xl font-bold tracking-tight text-[var(--charcoal)] dark:text-white leading-tight mb-4">
            Tomá el control de <br className="hidden lg:block" />
            <span className="text-[var(--mango-dark)] relative inline-block">
              <span className={`transition-opacity duration-500 ${animandoTexto ? 'opacity-0' : 'opacity-100'}`}>
                {PALABRAS_CLAVE[palabraActual]}
              </span>
              <svg className="absolute w-full h-3 -bottom-1 left-0 text-[var(--mango)]/50" viewBox="0 0 100 10" preserveAspectRatio="none">
                <path d="M0 5 Q 50 10 100 5" stroke="currentColor" strokeWidth="4" fill="transparent" strokeLinecap="round" />
              </svg>
            </span>
          </h1>
          <p className="text-lg text-zinc-600 dark:text-zinc-400 mb-8 max-w-md mx-auto lg:mx-0">
            Una herramienta simple, rápida y sin vueltas para entender a dónde va tu plata todos los meses.
          </p>
        </div>

        <div className="w-full max-w-md">
          <div className="bg-white/70 dark:bg-zinc-900/70 backdrop-blur-xl rounded-3xl p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.2)] border border-[var(--mango)]/15 dark:border-zinc-800/50">
            <h2 className="text-2xl font-bold text-[var(--charcoal)] dark:text-white mb-6">Iniciar sesión</h2>

            {error && (
              <div className="mb-6 bg-red-50 dark:bg-red-900/20 text-red-600 text-sm px-4 py-3 rounded-xl border border-red-100 dark:border-red-900/50">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <Input
                label="Email"
                type="email"
                placeholder="vos@email.com"
                value={formData.email}
                onChange={e => handleChange('email', e.target.value)}
                required
              />
              <div>
                <Input
                  label="Contraseña"
                  type="password"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={e => handleChange('password', e.target.value)}
                  required
                />
                <div className="flex justify-end mt-1">
                  <Link to="/recuperar-password" className="text-xs text-[var(--mango-dark)] dark:text-[var(--mango)] hover:underline font-medium">
                    ¿Te olvidaste la contraseña?
                  </Link>
                </div>
              </div>

              <Button type="submit" cargando={cargando} className="w-full mt-4 py-3 text-base">
                Ingresar a mi cuenta
              </Button>
            </form>

            <div className="mt-8 pt-6 border-t border-zinc-200/50 dark:border-zinc-800/50 text-center">
              <p className="text-sm text-zinc-600 dark:text-zinc-400">¿Primera vez por acá?</p>
              <Link to="/registro" className="inline-block mt-2 font-semibold text-[var(--charcoal)] dark:text-white hover:text-[var(--mango-dark)] dark:hover:text-[var(--mango)] transition-colors">
                Crear una cuenta gratis &rarr;
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}