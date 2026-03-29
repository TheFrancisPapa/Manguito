import { supabase } from '../../lib/supabase'
import { useState, useEffect, useCallback, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { registrarUsuario } from '../../api/auth'
import { Input, Spinner } from '../../components/ui'

const OBJETIVOS = [
  { id: 'gastos',      icono: '🎯', titulo: 'Controlar mis gastos', desc: 'Saber a dónde se va cada peso.' },
  { id: 'ahorro',      icono: '✈️', titulo: 'Ahorrar para algo especial', desc: 'Un viaje, un auto, una meta.' },
  { id: 'emergencia',  icono: '🛡️', titulo: 'Armar un fondo de emergencia', desc: 'Tener colchón para imprevistos.' },
  { id: 'deudas',      icono: '💳', titulo: 'Salir de deudas', desc: 'Organizarme para pagar lo que debo.' },
  { id: 'inversion',   icono: '📈', titulo: 'Empezar a invertir', desc: 'Hacer que mi plata rinda más.' },
]

const PASOS = ['Cuenta', 'Perfil', 'Objetivo', 'Meta']

const FRASES = [
  'Analizando tu objetivo...',
  'Preparando tu panel...',
  'Configurando categorías...',
  '¡Todo listo! 🎉',
]

export function RegistroPage() {
  const navigate = useNavigate()
  const [paso, setPaso] = useState(1)
  const [cargando, setCargando] = useState(false)
  const [error, setError] = useState('')
  const [fraseIdx, setFraseIdx] = useState(0)
  const [showPass, setShowPass] = useState(false)
  const formDataRef = useRef({})

  const [formData, setFormData] = useState({
    email: '', password: '', nombre: '', fechaNacimiento: '',
    objetivo: '', metaActiva: false, metaEmoji: '🎯', metaNombre: '', metaMonto: '',
  })

  useEffect(() => { formDataRef.current = formData }, [formData])

  const set = (campo, valor) => {
    setFormData(prev => ({ ...prev, [campo]: valor }))
    setError('')
  }

  const avanzar = () => {
    if (paso === 1 && (!formData.email || formData.password.length < 6)) {
      setError('Ingresá un email válido y contraseña de al menos 6 caracteres.')
      return
    }
    if (paso === 2 && !formData.nombre.trim()) {
      setError('Completá tu nombre para continuar.')
      return
    }
    if (paso === 3 && !formData.objetivo) {
      setError('Elegí un objetivo para personalizar tu experiencia.')
      return
    }
    setPaso(p => p + 1)
  }

  const finalizar = useCallback(async () => {
    const datos = formDataRef.current
    try {
      await registrarUsuario(datos)
      if (datos.metaActiva && datos.metaNombre && datos.metaMonto) {
        const { data: { session } } = await supabase.auth.getSession()
        if (session) {
          await supabase.from('metas').insert({
            usuario_id: session.user.id,
            nombre: datos.metaNombre,
            monto_objetivo: Number(datos.metaMonto),
            monto_actual: 0,
            icono: datos.metaEmoji || '🎯',
            color: '#F5A623',
            estado: 'activa',
            prioridad: 1,
          })
        }
      }
      setTimeout(() => navigate('/dashboard'), 4500)
    } catch (err) {
      setError(err.message || 'Hubo un error. Revisá los datos.')
      setPaso(1)
    }
  }, [navigate])

  useEffect(() => {
    if (paso !== 5) return
    const iv = setInterval(() => {
      setFraseIdx(prev => {
        if (prev < FRASES.length - 1) return prev + 1
        clearInterval(iv)
        return prev
      })
    }, 1100)
    finalizar()
    return () => clearInterval(iv)
  }, [paso, finalizar])

  const objActual = OBJETIVOS.find(o => o.id === formData.objetivo)

  return (
    <div className="min-h-screen w-full flex overflow-hidden bg-[var(--cream-soft)] dark:bg-[var(--dark-bg)]">

      {/* ── LEFT PANEL ── */}
      <div className="hidden lg:flex lg:w-2/5 relative flex-col justify-between p-12 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-amber-50 via-orange-50/40 to-yellow-50/20 dark:from-[var(--dark-bg)] dark:via-[var(--dark-surface)] dark:to-[var(--dark-bg)]" />
        <div className="absolute top-0 left-0 w-72 h-72 bg-[var(--mango)]/20 rounded-full blur-[80px] animate-blob" />
        <div className="absolute bottom-0 right-0 w-56 h-56 bg-emerald-400/12 rounded-full blur-[70px] animate-blob animation-delay-2000" />

        <div className="relative z-10">
          <div className="flex items-center gap-2.5">
            <div className="relative">
              <div className="absolute inset-0 bg-[var(--mango)] blur-lg opacity-40 rounded-full" />
              <img src="/Mango.png" alt="Manguito" className="relative w-8 h-8 object-contain" />
            </div>
            <span className="text-xl font-black font-display text-gradient-gold">Manguito</span>
          </div>
        </div>

        <div className="relative z-10">
          <h2 className="font-display text-3xl font-black text-zinc-800 dark:text-white mb-3 leading-tight">
            Tu camino al
            <br />
            <span className="text-gradient-gold">éxito financiero</span>
            <br />
            empieza acá 🚀
          </h2>
          <p className="text-zinc-500 dark:text-zinc-400 text-sm leading-relaxed font-medium">
            En 2 minutos tenés tu cuenta lista y empezás a tomar control de tu plata.
          </p>
        </div>

        <div className="relative z-10 space-y-3">
          {['Sin tarjeta requerida', 'Datos seguros y encriptados', 'Plan gratuito para siempre'].map(t => (
            <div key={t} className="flex items-center gap-2.5 text-sm text-zinc-600 dark:text-zinc-400 font-medium">
              <span className="w-5 h-5 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-[10px] text-emerald-600">✓</span>
              {t}
            </div>
          ))}
        </div>
      </div>

      {/* ── RIGHT PANEL ── */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 lg:p-12 overflow-y-auto">
        <div className="w-full max-w-[420px]">

          {/* Mobile logo */}
          <div className="lg:hidden flex items-center justify-center gap-2.5 mb-6">
            <img src="/Mango.png" alt="Manguito" className="w-9 h-9 object-contain" />
            <span className="text-xl font-black font-display text-gradient-gold">Manguito</span>
          </div>

          {/* Progress */}
          {paso < 5 && (
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                {PASOS.map((p, i) => (
                  <div key={p} className="flex items-center gap-1">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold transition-all ${
                      i + 1 < paso
                        ? 'bg-[var(--mango)] text-white'
                        : i + 1 === paso
                          ? 'bg-[var(--mango)]/20 text-[var(--mango-dark)] border-2 border-[var(--mango)]'
                          : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-400'
                    }`}>
                      {i + 1 < paso ? '✓' : i + 1}
                    </div>
                    {i < PASOS.length - 1 && (
                      <div className={`h-px flex-1 w-8 mx-1 transition-all ${
                        i + 1 < paso ? 'bg-[var(--mango)]' : 'bg-zinc-200 dark:bg-zinc-700'
                      }`} />
                    )}
                  </div>
                ))}
              </div>
              <p className="text-[11px] text-zinc-400 font-medium">Paso {paso} de {PASOS.length}</p>
            </div>
          )}

          {/* Form card */}
          <div className="bg-white/90 dark:bg-[var(--dark-card)]/95 backdrop-blur-xl rounded-3xl
            shadow-[var(--shadow-lg)] border border-zinc-100/80 dark:border-[var(--dark-border)] p-7">

            {error && (
              <div className="mb-5 flex items-center gap-2 bg-red-50 dark:bg-red-900/20
                text-red-600 dark:text-red-400 text-sm px-4 py-3 rounded-2xl
                border border-red-100 dark:border-red-800/40 font-medium">
                <span>⚠</span> {error}
              </div>
            )}

            {/* PASO 1: Cuenta */}
            {paso === 1 && (
              <div className="flex flex-col gap-5 animate-in slide-in-from-right-4 fade-in duration-400">
                <div>
                  <h1 className="text-2xl font-black font-display text-zinc-900 dark:text-white mb-1">
                    Creá tu cuenta
                  </h1>
                  <p className="text-sm text-zinc-500 dark:text-zinc-400 font-medium">
                    El primer paso para tomar el control 💪
                  </p>
                </div>

                <Input label="Email" type="email" placeholder="tu@email.com" autoFocus
                  value={formData.email} onChange={e => set('email', e.target.value)} />

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 tracking-wide">
                    Contraseña
                  </label>
                  <div className="relative">
                    <input
                      type={showPass ? 'text' : 'password'}
                      placeholder="Mínimo 6 caracteres"
                      value={formData.password}
                      onChange={e => set('password', e.target.value)}
                      className="w-full bg-zinc-50/80 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700/60
                        rounded-xl px-3.5 py-2.5 pr-11 text-sm font-medium
                        focus:outline-none focus:ring-2 focus:ring-[var(--mango)]/30 focus:border-[var(--mango)]/60
                        transition-all text-zinc-900 dark:text-white"
                    />
                    <button type="button" onClick={() => setShowPass(s => !s)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 transition-colors text-sm">
                      {showPass ? '🙈' : '👁️'}
                    </button>
                  </div>
                </div>

                <button onClick={avanzar}
                  className="btn-primary w-full py-3.5 rounded-2xl text-white text-sm font-bold mt-1">
                  Continuar →
                </button>

                <p className="text-center text-sm text-zinc-500 dark:text-zinc-400 font-medium">
                  ¿Ya tenés cuenta?{' '}
                  <Link to="/login" className="font-bold text-[var(--mango-dark)] dark:text-[var(--mango)] hover:underline">
                    Entrar
                  </Link>
                </p>
              </div>
            )}

            {/* PASO 2: Perfil */}
            {paso === 2 && (
              <div className="flex flex-col gap-5 animate-in slide-in-from-right-4 fade-in duration-400">
                <div>
                  <h2 className="text-2xl font-black font-display text-zinc-900 dark:text-white mb-1">
                    ¿Cómo te llamás?
                  </h2>
                  <p className="text-sm text-zinc-500 dark:text-zinc-400 font-medium">
                    Para que Manguito sea más personal
                  </p>
                </div>

                <Input label="Tu nombre o apodo" placeholder="Ej: Maxi" autoFocus
                  value={formData.nombre} onChange={e => set('nombre', e.target.value)} />

                <Input label="Fecha de nacimiento (opcional)" type="date"
                  value={formData.fechaNacimiento} onChange={e => set('fechaNacimiento', e.target.value)} />

                <div className="flex gap-3 mt-1">
                  <button onClick={() => setPaso(1)}
                    className="flex-1 py-3 rounded-2xl border border-zinc-200 dark:border-zinc-700
                      text-sm font-semibold text-zinc-600 dark:text-zinc-400
                      hover:bg-zinc-50 dark:hover:bg-zinc-800/60 transition-colors">
                    ← Atrás
                  </button>
                  <button onClick={avanzar}
                    className="btn-primary flex-1 py-3 rounded-2xl text-white text-sm font-bold">
                    Continuar →
                  </button>
                </div>
              </div>
            )}

            {/* PASO 3: Objetivo */}
            {paso === 3 && (
              <div className="flex flex-col gap-4 animate-in slide-in-from-right-4 fade-in duration-400">
                <div>
                  <h2 className="text-2xl font-black font-display text-zinc-900 dark:text-white mb-1">
                    ¿Qué querés lograr?
                  </h2>
                  <p className="text-sm text-zinc-500 dark:text-zinc-400 font-medium">
                    Personalizamos Manguito para vos
                  </p>
                </div>

                <div className="flex flex-col gap-2 max-h-72 overflow-y-auto -mx-1 px-1 scrollbar-hide">
                  {OBJETIVOS.map(obj => (
                    <button
                      key={obj.id}
                      type="button"
                      onClick={() => { set('objetivo', obj.id); setError('') }}
                      className={`flex items-start gap-3 p-4 rounded-2xl border-2 text-left
                        transition-all duration-150 ${formData.objetivo === obj.id
                          ? 'border-[var(--mango)] bg-[var(--mango)]/8 dark:bg-[var(--mango)]/6'
                          : 'border-zinc-100 dark:border-zinc-700/60 hover:border-zinc-200 dark:hover:border-zinc-600'
                        }`}
                    >
                      <span className="text-2xl mt-0.5 flex-shrink-0">{obj.icono}</span>
                      <div>
                        <p className="font-bold text-sm text-zinc-900 dark:text-white">{obj.titulo}</p>
                        <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">{obj.desc}</p>
                      </div>
                      {formData.objetivo === obj.id && (
                        <span className="ml-auto text-[var(--mango)] flex-shrink-0">✓</span>
                      )}
                    </button>
                  ))}
                </div>

                <div className="flex gap-3 mt-1">
                  <button onClick={() => setPaso(2)}
                    className="flex-1 py-3 rounded-2xl border border-zinc-200 dark:border-zinc-700
                      text-sm font-semibold text-zinc-600 dark:text-zinc-400
                      hover:bg-zinc-50 dark:hover:bg-zinc-800/60 transition-colors">
                    ← Atrás
                  </button>
                  <button onClick={avanzar}
                    className="btn-primary flex-1 py-3 rounded-2xl text-white text-sm font-bold">
                    Continuar →
                  </button>
                </div>
              </div>
            )}

            {/* PASO 4: Meta opcional */}
            {paso === 4 && (
              <div className="flex flex-col gap-5 animate-in slide-in-from-right-4 fade-in duration-400">
                <div>
                  <h2 className="text-2xl font-black font-display text-zinc-900 dark:text-white mb-1">
                    Tu primera meta
                  </h2>
                  <p className="text-sm text-zinc-500 dark:text-zinc-400 font-medium">
                    Opcional — podés hacerlo después también
                  </p>
                </div>

                {!formData.metaActiva ? (
                  <div className="flex flex-col gap-3">
                    <button
                      onClick={() => set('metaActiva', true)}
                      className="flex items-center gap-3 p-5 rounded-2xl border-2
                        border-[var(--mango)] bg-[var(--mango)]/5 text-left
                        hover:bg-[var(--mango)]/10 transition-colors"
                    >
                      <span className="text-2xl">🎯</span>
                      <div>
                        <p className="font-bold text-sm text-zinc-900 dark:text-white">Crear mi primera meta ahora</p>
                        <p className="text-xs text-zinc-500 mt-0.5">Empieza con el pie derecho</p>
                      </div>
                    </button>
                    <div className="flex gap-3">
                      <button onClick={() => setPaso(3)}
                        className="flex-1 py-3 rounded-2xl border border-zinc-200 dark:border-zinc-700
                          text-sm font-semibold text-zinc-600 dark:text-zinc-400
                          hover:bg-zinc-50 dark:hover:bg-zinc-800/60 transition-colors">
                        ← Atrás
                      </button>
                      <button onClick={() => setPaso(5)}
                        className="btn-primary flex-1 py-3 rounded-2xl text-white text-sm font-bold">
                        Crear cuenta →
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="bg-zinc-50 dark:bg-zinc-800/50 rounded-2xl p-4 flex flex-col gap-4
                      border border-zinc-100 dark:border-zinc-700/50">
                      <div className="flex gap-3">
                        <Input label="Emoji" value={formData.metaEmoji}
                          onChange={e => set('metaEmoji', e.target.value)} maxLength={2}
                          className="w-20 text-center" />
                        <Input label="¿Qué querés lograr?" placeholder="Ej: Viaje a Brasil" autoFocus
                          value={formData.metaNombre} onChange={e => set('metaNombre', e.target.value)}
                          className="flex-1" />
                      </div>
                      <Input label="Monto objetivo" type="number" prefijo="$"
                        placeholder="0.00"
                        value={formData.metaMonto} onChange={e => set('metaMonto', e.target.value)} />
                    </div>
                    <div className="flex gap-3">
                      <button onClick={() => set('metaActiva', false)}
                        className="flex-1 py-3 rounded-2xl border border-zinc-200 dark:border-zinc-700
                          text-sm font-semibold text-zinc-600 dark:text-zinc-400
                          hover:bg-zinc-50 dark:hover:bg-zinc-800/60 transition-colors">
                        ← Atrás
                      </button>
                      <button onClick={() => setPaso(5)}
                        className="btn-primary flex-1 py-3 rounded-2xl text-white text-sm font-bold">
                        Crear cuenta →
                      </button>
                    </div>
                  </>
                )}
              </div>
            )}

            {/* PASO 5: Loading */}
            {paso === 5 && (
              <div className="flex flex-col items-center justify-center gap-6 py-8 animate-in fade-in duration-500">
                <div className="relative">
                  <div className="w-20 h-20 rounded-full bg-[var(--mango)]/15 flex items-center justify-center">
                    <span className="text-4xl animate-bounce">
                      {objActual?.icono || '🥭'}
                    </span>
                  </div>
                  <div className="absolute inset-0 rounded-full border-2 border-[var(--mango)]/40 animate-pulse-ring" />
                </div>
                <div className="text-center">
                  <h3 className="text-xl font-black font-display text-zinc-900 dark:text-white mb-2">
                    Preparando tu Manguito
                  </h3>
                  <p className="text-sm text-zinc-500 dark:text-zinc-400 font-medium animate-pulse">
                    {FRASES[fraseIdx]}
                  </p>
                </div>
                <div className="w-full bg-zinc-100 dark:bg-zinc-800 rounded-full h-1.5 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-[var(--mango)] to-[var(--mango-dark)] rounded-full animate-shimmer"
                    style={{ width: `${((fraseIdx + 1) / FRASES.length) * 100}%`, transition: 'width 1s ease' }}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}