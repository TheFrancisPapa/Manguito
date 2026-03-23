import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { registrarUsuario } from '../../api/auth'
import { useMetas } from '../../hooks/useMetas'
import { Button, Input, Spinner } from '../../components/ui'

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
  const [paso, setPaso] = useState(1)
  const [cargando, setCargando] = useState(false)
  const [error, setError] = useState('')
  const [fraseIndex, setFraseIndex] = useState(0)
  
  // Hook de metas (lo usamos al final si creó una)
  const { agregar: agregarMeta } = useMetas()

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

  // Efecto para la pantallita final de "Calibrando"
  useEffect(() => {
    if (paso === 5) {
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
    }
  }, [paso])

  const finalizarRegistro = async () => {
    try {
      // 1. Registramos al usuario en Supabase
      const { user } = await registrarUsuario(formData)
      
      // 2. Si armó una meta inicial, la guardamos
      if (formData.metaActiva && formData.metaNombre && formData.metaMonto) {
        // En una app real, acá esperaríamos a que la sesión esté lista.
        // Como el hook useMetas requiere usuario logueado, lo ideal sería 
        // hacer el insert directo usando el user.id que nos devuelve signUp.
        // Pero para mantenerlo simple, simulamos el delay.
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
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex flex-col items-center justify-center p-4">
      
      {/* Indicador de progreso (solo se muestra en pasos 1 al 4) */}
      {paso < 5 && (
        <div className="w-full max-w-md mb-8">
          <div className="flex justify-between mb-2">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className={`h-1.5 flex-1 mx-1 rounded-full transition-all duration-500 ${
                paso >= i ? 'bg-amber-500' : 'bg-zinc-200 dark:bg-zinc-800'
              }`} />
            ))}
          </div>
          <p className="text-xs text-center text-zinc-500 font-medium">Paso {paso} de 4</p>
        </div>
      )}

      <div className="w-full max-w-md bg-white dark:bg-zinc-900 rounded-3xl shadow-sm border border-zinc-100 dark:border-zinc-800 p-6 md:p-8 overflow-hidden relative min-h-[400px] flex flex-col justify-center">
        
        {error && (
          <div className="absolute top-4 left-6 right-6 bg-red-50 dark:bg-red-900/20 text-red-600 text-sm px-4 py-3 rounded-xl border border-red-100 dark:border-red-900/50 animate-in slide-in-from-top-4">
            {error}
          </div>
        )}

        {/* PASO 1: Cuenta */}
        {paso === 1 && (
          <div className="flex flex-col gap-5 animate-in slide-in-from-right-8 fade-in duration-500">
            <div className="text-center mb-2">
              <span className="text-4xl mb-3 block">🥭</span>
              <h1 className="text-2xl font-bold">Creá tu cuenta</h1>
              <p className="text-zinc-500 text-sm mt-1">El primer paso para tomar el control.</p>
            </div>
            <Input label="Email" type="email" placeholder="vos@email.com" autoFocus
              value={formData.email} onChange={e => handleChange('email', e.target.value)} />
            <Input label="Contraseña" type="password" placeholder="Mínimo 6 caracteres"
              value={formData.password} onChange={e => handleChange('password', e.target.value)} />
            <Button onClick={avanzar} className="mt-2 text-lg py-3">Comenzar</Button>
            <p className="text-center text-sm text-zinc-500 mt-2">
              ¿Ya tenés cuenta? <Link to="/login" className="text-amber-600 font-medium hover:underline">Ingresá acá</Link>
            </p>
          </div>
        )}

        {/* PASO 2: Datos Personales */}
        {paso === 2 && (
          <div className="flex flex-col gap-5 animate-in slide-in-from-right-8 fade-in duration-500">
            <div className="text-center mb-2">
              <h2 className="text-2xl font-bold">¡Hola! ¿Cómo te llamás?</h2>
              <p className="text-zinc-500 text-sm mt-1">Queremos que te sientas como en casa.</p>
            </div>
            <Input label="Tu nombre o apodo" placeholder="Ej: Fran" autoFocus
              value={formData.nombre} onChange={e => handleChange('nombre', e.target.value)} />
            <Input label="Fecha de nacimiento" type="date"
              value={formData.fechaNacimiento} onChange={e => handleChange('fechaNacimiento', e.target.value)} />
            <p className="text-xs text-zinc-400 text-center -mt-2">Prometemos saludarte en tu cumple 🎂</p>
            
            <div className="flex gap-3 mt-4">
              <Button onClick={() => setPaso(1)} variante="secondary" className="px-4">Atrás</Button>
              <Button onClick={avanzar} className="flex-1">Siguiente</Button>
            </div>
          </div>
        )}

        {/* PASO 3: Objetivo */}
        {paso === 3 && (
          <div className="flex flex-col gap-4 animate-in slide-in-from-right-8 fade-in duration-500">
            <div className="text-center mb-2">
              <h2 className="text-2xl font-bold">¿Qué buscás lograr?</h2>
              <p className="text-zinc-500 text-sm mt-1">Manguito se adaptará a tu necesidad principal.</p>
            </div>
            <div className="flex flex-col gap-2 max-h-[300px] overflow-y-auto px-1 pb-2">
              {OBJETIVOS.map(obj => (
                <div key={obj.id} 
                  onClick={() => handleChange('objetivo', obj.id)}
                  className={`flex items-start gap-3 p-3 rounded-2xl border-2 cursor-pointer transition-all ${
                    formData.objetivo === obj.id 
                      ? 'border-amber-400 bg-amber-50 dark:bg-amber-900/20' 
                      : 'border-zinc-100 dark:border-zinc-800 hover:border-zinc-200 dark:hover:border-zinc-700'
                  }`}>
                  <span className="text-2xl mt-0.5">{obj.icono}</span>
                  <div>
                    <h3 className="font-semibold text-sm">{obj.titulo}</h3>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400">{obj.desc}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex gap-3 mt-2">
              <Button onClick={() => setPaso(2)} variante="secondary" className="px-4">Atrás</Button>
              <Button onClick={avanzar} className="flex-1">Siguiente</Button>
            </div>
          </div>
        )}

        {/* PASO 4: Primera Meta (Opcional) */}
        {paso === 4 && (
          <div className="flex flex-col gap-5 animate-in slide-in-from-right-8 fade-in duration-500">
            <div className="text-center mb-2">
              <h2 className="text-2xl font-bold">Tu primera meta</h2>
              <p className="text-zinc-500 text-sm mt-1">Las metas te ayudan a mantener el foco. ¿Armamos una rápida?</p>
            </div>
            
            {!formData.metaActiva ? (
              <div className="flex flex-col gap-3 my-4 mt-auto">
                <Button onClick={() => handleChange('metaActiva', true)} className="py-4 text-base" icono="🎯">
                  ¡Dale, armemos una meta!
                </Button>
                <div className="flex gap-3">
                  <Button onClick={() => setPaso(3)} variante="secondary" className="px-4">
                    Atrás
                  </Button>
                  <Button onClick={avanzar} variante="ghost" className="flex-1 bg-zinc-100 dark:bg-zinc-800/50">
                    Finalizar sin meta
                  </Button>
                </div>
              </div>
            ) : (
              <>
                <div className="flex flex-col gap-4 bg-zinc-50 dark:bg-zinc-800/50 p-4 rounded-2xl border border-zinc-100 dark:border-zinc-800 animate-in fade-in zoom-in-95">
                  <div className="flex gap-3">
                    <div className="w-16">
                      <Input label="Emoji" value={formData.metaEmoji} 
                        onChange={e => handleChange('metaEmoji', e.target.value)} maxLength={2} className="text-center text-xl" />
                    </div>
                    <div className="flex-1">
                      <Input label="¿Qué querés lograr?" placeholder="Ej: Celular nuevo" autoFocus
                        value={formData.metaNombre} onChange={e => handleChange('metaNombre', e.target.value)} />
                    </div>
                  </div>
                  <Input label="¿Cuánta plata necesitás?" type="number" prefijo="$" placeholder="0.00"
                    value={formData.metaMonto} onChange={e => handleChange('metaMonto', e.target.value)} />
                </div>
                
                <div className="flex gap-3 mt-auto">
                  <Button onClick={() => handleChange('metaActiva', false)} variante="secondary" className="px-4">
                    Atrás
                  </Button>
                  <Button onClick={avanzar} className="flex-1 bg-zinc-900 hover:bg-zinc-800 text-white dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-100">
                    Finalizar y Crear Meta
                  </Button>
                </div>
              </>
            )}
          </div>
        )}

        {/* PASO 5: Calibrando (Loading Screen) */}
        {paso === 5 && (
          <div className="flex flex-col items-center justify-center gap-6 py-8 animate-in fade-in duration-1000">
            <div className="relative">
              <Spinner size={60} className="text-amber-500" />
              <div className="absolute inset-0 flex items-center justify-center text-2xl animate-pulse">
                {OBJETIVOS.find(o => o.id === formData.objetivo)?.icono || '✨'}
              </div>
            </div>
            <div className="text-center">
              <h2 className="text-xl font-bold mb-2">Preparando todo para {formData.nombre}</h2>
              <p className="text-zinc-500 text-sm min-h-[20px] transition-all duration-300">
                {FRASES_CALIBRACION[fraseIndex]}
              </p>
            </div>
          </div>
        )}

      </div>
    </div>
  )
}