import { supabase } from '../../lib/supabase'
import { useState, useEffect, useCallback, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { registrarUsuario } from '../../api/auth'
import { Button, Input, Spinner } from '../../components/ui'
import { useTheme } from '../../hooks/useTheme'

const OBJETIVOS = [
  { id: 'gastos', icono: '🎯', titulo: 'Controlar mis gastos diarios', desc: 'Saber a dónde se va la plata.' },
  { id: 'ahorro', icono: '✈️', titulo: 'Ahorrar para algo especial', desc: 'Un viaje, un auto, una compu.' },
  { id: 'emergencia', icono: '🛡️', titulo: 'Armar un fondo de emergencia', desc: 'Tener un colchón para imprevistos.' },
  { id: 'deudas', icono: '💳', titulo: 'Salir de deudas', desc: 'Organizarme para pagar lo que debo.' },
  { id: 'inversion', icono: '📈', titulo: 'Empezar a invertir', desc: 'Hacer que mi plata rinda más.' }
]

const FRASES_CALIBRACION = [
  "Analizando tu objetivo financiero...",
  "Preparando tu panel de control...",
  "Ajustando las categorías...",
  "¡Todo listo para arrancar!"
]

export function RegistroPage() {
  const navigate = useNavigate()
  const { theme } = useTheme()
  const [paso, setPaso] = useState(1)
  const [cargando, setCargando] = useState(false)
  const [error, setError] = useState('')
  const [fraseIndex, setFraseIndex] = useState(0)

  // Estado del formulario
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    nombre: '',
    fechaNacimiento: '',
    objetivo: '',
    // Datos de la meta inicial opcional
    metaActiva: false,
    metaEmoji: '🎯',
    metaNombre: '',
    metaMonto: ''
  })

  // Ref para evitar stale closures en el proceso de registro
  const formDataRef = useRef(formData)
  useEffect(() => { formDataRef.current = formData }, [formData])

  const handleChange = (campo, valor) => {
    setFormData(prev => ({ ...prev, [campo]: valor }))
    setError('')
  }

  const avanzar = () => {
    if (paso === 1 && (!formData.email || formData.password.length < 6)) {
      setError('Ingresá un email válido y una contraseña de al menos 6 caracteres.')
      return
    }
    if (paso === 2 && (!formData.nombre || !formData.fechaNacimiento)) {
      setError('Por favor, completá tu nombre y fecha de nacimiento.')
      return
    }
    if (paso === 3 && !formData.objetivo) {
      setError('Elegí un objetivo para que podamos ayudarte mejor.')
      return
    }
    setPaso(p => p + 1)
  }

  // Definimos finalizarRegistro con useCallback para evitar re-creación innecesaria
  const finalizarRegistro = useCallback(async () => {
    const datos = formDataRef.current // Usamos la ref para tener el valor real al momento de la ejecución
    try {
      // 1. Registramos al usuario en Supabase
      await registrarUsuario(datos)

      // 2. Si armó una meta inicial, la guardamos
      if (datos.metaActiva && datos.metaNombre && datos.metaMonto) {
        const { data: { session } } = await supabase.auth.getSession()
        if (session) {
          await supabase.from('metas').insert({
            usuario_id: session.user.id,
            nombre: datos.metaNombre,
            monto_objetivo: Number(datos.metaMonto),
            monto_actual: 0,
            icono: datos.metaEmoji || '🎯',
            color: '#F59E0B',
            estado: 'activa',
            prioridad: 1,
          })
        }
      }

      // 3. Después de unos segundos de animación, lo mandamos al dashboard
      setTimeout(() => {
        navigate('/dashboard')
      }, 5000)

    } catch (err) {
      console.error(err)
      setError(err.message || 'Hubo un error al crear tu cuenta.')
      setPaso(1) // Lo volvemos al inicio si falla
    }
  }, [navigate])

  // Efecto para la pantallita final de "Calibrando"
  useEffect(() => {
    if (paso !== 5) return

    const interval = setInterval(() => {
      setFraseIndex(prev => {
        if (prev < FRASES_CALIBRACION.length - 1) return prev + 1
        clearInterval(interval)
        return prev
      })
    }, 1200) // Cambia la frase cada 1.2s

    // Ejecutamos el registro de fondo mientras ve la animación
    finalizarRegistro()

    return () => clearInterval(interval)
  }, [paso, finalizarRegistro])

  return (
    <div className="min-h-screen w-full flex flex-col lg:flex-row bg-[var(--cream-soft)] dark:bg-[var(--dark-bg)] overflow-hidden">
      {/* Panel Izquierdo: Ilustración y Marketing (Compartido con Login) */}
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
            Empezá tu camino <br /> al <span className="text-[var(--leaf)] dark:text-[var(--primary-vibrant)]">éxito financiero</span>
          </h2>
          <p className="text-lg text-zinc-500 dark:text-zinc-400 max-w-xs mx-auto leading-relaxed">
            Unite a miles de personas que ya están tomando mejores decisiones con Manguito.
          </p>
        </div>
      </div>

      {/* Panel Derecho: Formulario Multi-paso */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 lg:p-12 relative overflow-y-auto">
        <div className="w-full max-w-md">
          {/* Indicador de progreso */}
          {paso < 5 && (
            <div className="mb-8">
              <div className="flex justify-between mb-3">
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className={`h-1.5 flex-1 mx-1 rounded-full transition-all duration-500 ${paso >= i ? 'bg-[var(--mango)]' : 'bg-zinc-200 dark:bg-zinc-800'}`} />
                ))}
              </div>
              <p className="text-[10px] text-center text-zinc-400 font-bold uppercase tracking-widest">Paso {paso} de 4</p>
            </div>
          )}

          <div className="bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl rounded-3xl p-8 lg:p-10 shadow-xl border border-[var(--mango)]/10 dark:border-zinc-800 relative min-h-[450px] flex flex-col justify-center">
            {error && (
              <div className="absolute top-4 left-6 right-6 bg-red-50 dark:bg-red-900/20 text-red-600 text-sm px-4 py-3 rounded-xl border border-red-100 dark:border-red-900/50 z-20">
                {error}
              </div>
            )}

            {/* PASO 1: Cuenta */}
            {paso === 1 && (
              <div className="flex flex-col gap-6 animate-in slide-in-from-right-8 fade-in duration-500">
                <div>
                  <h1 className="text-3xl font-bold text-[var(--charcoal)] dark:text-white mb-2">Creá tu cuenta</h1>
                  <p className="text-zinc-500 dark:text-zinc-400">El primer paso para tomar el control.</p>
                </div>
                <Input label="Email" type="email" placeholder="tu@email.com" autoFocus
                  value={formData.email} onChange={e => handleChange('email', e.target.value)} className="bg-zinc-50 dark:bg-zinc-800/50" />
                <Input label="Contraseña" type="password" placeholder="Mínimo 6 caracteres"
                  value={formData.password} onChange={e => handleChange('password', e.target.value)} className="bg-zinc-50 dark:bg-zinc-800/50" />
                <Button onClick={avanzar} className="mt-2 py-4 font-bold shadow-lg shadow-[var(--mango)]/20">Comenzar aventura</Button>
                <p className="text-center text-sm text-zinc-500 mt-2">
                  ¿Ya tenés cuenta? <Link to="/login" className="text-[var(--leaf)] dark:text-[var(--primary-vibrant)] font-bold hover:underline">Ingresá acá</Link>
                </p>
              </div>
            )}

            {/* PASO 2: Datos Personales */}
            {paso === 2 && (
              <div className="flex flex-col gap-6 animate-in slide-in-from-right-8 fade-in duration-500">
                <div>
                  <h2 className="text-3xl font-bold text-[var(--charcoal)] dark:text-white mb-2">¡Hola! ¿Cómo te llamás?</h2>
                  <p className="text-zinc-500 dark:text-zinc-400">Para que Manguito sea más personal.</p>
                </div>
                <Input label="Tu nombre o apodo" placeholder="Ej: Fran" autoFocus
                  value={formData.nombre} onChange={e => handleChange('nombre', e.target.value)} className="bg-zinc-50 dark:bg-zinc-800/50" />
                <Input label="Fecha de nacimiento" type="date"
                  value={formData.fechaNacimiento} onChange={e => handleChange('fechaNacimiento', e.target.value)} className="bg-zinc-50 dark:bg-zinc-800/50" />
                <p className="text-xs text-zinc-400 text-center -mt-2 italic">Prometemos saludarte en tu cumple 🎂</p>

                <div className="flex gap-4 mt-4">
                  <Button onClick={() => setPaso(1)} variante="secondary" className="px-6">Atrás</Button>
                  <Button onClick={avanzar} className="flex-1 font-bold">Siguiente</Button>
                </div>
              </div>
            )}

            {/* PASO 3: Objetivo */}
            {paso === 3 && (
              <div className="flex flex-col gap-5 animate-in slide-in-from-right-8 fade-in duration-500">
                <div>
                  <h2 className="text-3xl font-bold text-[var(--charcoal)] dark:text-white mb-2">¿Qué buscás lograr?</h2>
                  <p className="text-zinc-500 dark:text-zinc-400">Seleccioná tu meta principal.</p>
                </div>
                <div className="flex flex-col gap-3 max-h-[320px] overflow-y-auto pr-2 custom-scrollbar">
                  {OBJETIVOS.map(obj => (
                    <div key={obj.id}
                      onClick={() => handleChange('objetivo', obj.id)}
                      className={`flex items-start gap-4 p-4 rounded-2xl border-2 cursor-pointer transition-all ${formData.objetivo === obj.id
                          ? 'border-[var(--mango)] bg-[var(--mango)]/5 dark:bg-[var(--mango)]/10'
                          : 'border-zinc-100 dark:border-zinc-800 hover:border-zinc-200 dark:hover:border-zinc-700'
                        }`}>
                      <span className="text-2xl mt-0.5">{obj.icono}</span>
                      <div>
                        <h3 className="font-bold text-sm text-[var(--charcoal)] dark:text-white">{obj.titulo}</h3>
                        <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">{obj.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="flex gap-4 mt-2">
                  <Button onClick={() => setPaso(2)} variante="secondary" className="px-6">Atrás</Button>
                  <Button onClick={avanzar} className="flex-1 font-bold">Siguiente</Button>
                </div>
              </div>
            )}

            {/* PASO 4: Primera Meta (Opcional) */}
            {paso === 4 && (
              <div className="flex flex-col gap-6 animate-in slide-in-from-right-8 fade-in duration-500">
                <div>
                  <h2 className="text-3xl font-bold text-[var(--charcoal)] dark:text-white mb-2">Tu primera meta</h2>
                  <p className="text-zinc-500 dark:text-zinc-400">¿Querés que armemos un objetivo ahora?</p>
                </div>

                {!formData.metaActiva ? (
                  <div className="flex flex-col gap-4 my-4">
                    <Button onClick={() => handleChange('metaActiva', true)} className="py-5 text-base font-bold" icono="🎯">
                      ¡Sí, armar mi primera meta!
                    </Button>
                    <div className="flex gap-4">
                      <Button onClick={() => setPaso(3)} variante="secondary" className="px-6 font-semibold">Atrás</Button>
                      <Button onClick={avanzar} variante="ghost" className="flex-1 bg-zinc-50 dark:bg-zinc-800/50 font-bold border border-zinc-100 dark:border-zinc-800">
                        Omitir por ahora
                      </Button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="flex flex-col gap-5 bg-zinc-50 dark:bg-zinc-800/50 p-6 rounded-3xl border border-zinc-100 dark:border-zinc-800">
                      <div className="flex gap-4">
                        <div className="w-20">
                          <Input label="Icono" value={formData.metaEmoji}
                            onChange={e => handleChange('metaEmoji', e.target.value)} maxLength={2} className="text-center text-2xl h-14" />
                        </div>
                        <div className="flex-1">
                          <Input label="¿Qué querés lograr?" placeholder="Ej: Viaje a Brasil" autoFocus
                            value={formData.metaNombre} onChange={e => handleChange('metaNombre', e.target.value)} className="h-14" />
                        </div>
                      </div>
                      <Input label="Monto objetivo" type="number" prefijo="$" placeholder="0.00"
                        value={formData.metaMonto} onChange={e => handleChange('metaMonto', e.target.value)} className="h-14" />
                    </div>

                    <div className="flex gap-4 mt-4">
                      <Button onClick={() => handleChange('metaActiva', false)} variante="secondary" className="px-6">Atrás</Button>
                      <Button onClick={avanzar} className="flex-1 font-bold">Crear mi cuenta</Button>
                    </div>
                  </>
                )}
              </div>
            )}

            {/* PASO 5: Calibrando */}
            {paso === 5 && (
              <div className="flex flex-col items-center justify-center gap-8 py-10 animate-in fade-in duration-1000">
                <div className="relative">
                  <Spinner size={72} className="text-[var(--mango)]" />
                  <div className="absolute inset-0 flex items-center justify-center text-3xl animate-pulse">
                    {OBJETIVOS.find(o => o.id === formData.objetivo)?.icono || '🥭'}
                  </div>
                </div>
                <div className="text-center">
                  <h2 className="text-2xl font-bold mb-3 text-[var(--charcoal)] dark:text-white">Preparando tu Manguito</h2>
                  <p className="text-zinc-500 dark:text-zinc-400 font-medium italic animate-pulse">
                    {FRASES_CALIBRACION[fraseIndex]}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}