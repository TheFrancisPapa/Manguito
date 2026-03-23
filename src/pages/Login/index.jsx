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
  
  // Estado para la animación de texto
  const [palabraActual, setPalabraActual] = useState(0)
  const [animandoTexto, setAnimandoTexto] = useState(false)

  // Efecto para rotar las palabras clave
  useEffect(() => {
    const intervalo = setInterval(() => {
      setAnimandoTexto(true)
      setTimeout(() => {
        setPalabraActual((prev) => (prev + 1) % PALABRAS_CLAVE.length)
        setAnimandoTexto(false)
      }, 500) // Mitad del tiempo para desvanecer, luego cambia y reaparece
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
      await login(formData.email, formData.password)
      navigate('/dashboard')
    } catch (err) {
      console.error(err)
      setError('Email o contraseña incorrectos. Volvé a intentar.')
      setCargando(false)
    }
  }

  return (
    <div className="min-h-screen w-full flex items-center justify-center relative overflow-hidden bg-zinc-50 dark:bg-zinc-950">
      
      {/* 1. Fondo "Mesh Gradient" (Bolas de luz difuminadas) */}
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-amber-400/30 dark:bg-amber-600/20 rounded-full blur-[100px] mix-blend-multiply dark:mix-blend-screen animate-blob" />
      <div className="absolute top-[20%] right-[-10%] w-96 h-96 bg-orange-400/20 dark:bg-orange-600/20 rounded-full blur-[100px] mix-blend-multiply dark:mix-blend-screen animate-blob animation-delay-2000" />
      <div className="absolute bottom-[-20%] left-[20%] w-96 h-96 bg-yellow-300/30 dark:bg-yellow-600/10 rounded-full blur-[120px] mix-blend-multiply dark:mix-blend-screen animate-blob animation-delay-4000" />

      <div className="container mx-auto px-4 relative z-10 flex flex-col lg:flex-row items-center justify-center lg:justify-evenly gap-12 lg:gap-0">
        
        {/* 2. Sección de Branding (Texto dinámico) */}
        <div className="text-center lg:text-left max-w-lg mt-10 lg:mt-0">
          <div className="inline-flex items-center justify-center lg:justify-start gap-3 mb-6">
            <span className="text-5xl lg:text-6xl drop-shadow-lg">🥭</span>
            <span className="text-3xl lg:text-4xl font-extrabold tracking-tight text-zinc-900 dark:text-white">
              Manguito
            </span>
          </div>
          <h1 className="text-4xl lg:text-6xl font-bold tracking-tight text-zinc-900 dark:text-white leading-tight mb-4">
            Tomá el control de <br className="hidden lg:block" />
            <span className="text-amber-500 relative inline-block">
              <span className={`transition-opacity duration-500 ${animandoTexto ? 'opacity-0' : 'opacity-100'}`}>
                {PALABRAS_CLAVE[palabraActual]}
              </span>
              {/* Subrayado decorativo */}
              <svg className="absolute w-full h-3 -bottom-1 left-0 text-amber-300/50 dark:text-amber-700/50" viewBox="0 0 100 10" preserveAspectRatio="none">
                <path d="M0 5 Q 50 10 100 5" stroke="currentColor" strokeWidth="4" fill="transparent" strokeLinecap="round" />
              </svg>
            </span>
          </h1>
          <p className="text-lg text-zinc-600 dark:text-zinc-400 mb-8 max-w-md mx-auto lg:mx-0">
            Una herramienta simple, rápida y sin vueltas para entender a dónde va tu plata todos los meses.
          </p>
        </div>

        {/* 3. Tarjeta de Login (Glassmorphism) */}
        <div className="w-full max-w-md">
          <div className="bg-white/70 dark:bg-zinc-900/70 backdrop-blur-xl rounded-3xl p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.2)] border border-white/50 dark:border-zinc-800/50">
            
            <h2 className="text-2xl font-bold text-zinc-900 dark:text-white mb-6">Iniciar sesión</h2>
            
            {error && (
              <div className="mb-6 bg-red-50 dark:bg-red-900/20 text-red-600 text-sm px-4 py-3 rounded-xl border border-red-100 dark:border-red-900/50 animate-in fade-in zoom-in-95">
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
                  <Link to="/recuperar-password" className="text-xs text-amber-600 dark:text-amber-500 hover:underline font-medium">
                    ¿Te olvidaste la contraseña?
                  </Link>
                </div>
              </div>

              <Button type="submit" cargando={cargando} className="w-full mt-4 py-3 text-base shadow-md shadow-amber-500/20">
                Ingresar a mi cuenta
              </Button>
            </form>

            <div className="mt-8 pt-6 border-t border-zinc-200/50 dark:border-zinc-800/50 text-center">
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                ¿Primera vez por acá?
              </p>
              <Link to="/registro" className="inline-block mt-2 font-semibold text-zinc-900 dark:text-white hover:text-amber-600 dark:hover:text-amber-400 transition-colors">
                Crear una cuenta gratis &rarr;
              </Link>
            </div>

          </div>
        </div>

      </div>
    </div>
  )
}