import { supabase } from '../../lib/supabase'
import { useState, useEffect, useCallback, useRef, useMemo } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { registrarUsuario } from '../../api/auth'
import { Input, Spinner } from '../../components/ui'

/* ═══════════════════════════════════════════════════════
   🥭  REGISTRO PAGE — Dopamine-Driven Onboarding
   Multi-step wizard with gamification, celebration states,
   progress rewards, and gratifying micro-interactions
   ═══════════════════════════════════════════════════════ */

const OBJETIVOS = [
  { id: 'gastos',      icono: '🎯', titulo: 'Controlar mis gastos', desc: 'Saber a dónde se va cada peso.', color: '#F59E0B' },
  { id: 'ahorro',      icono: '✈️', titulo: 'Ahorrar para algo especial', desc: 'Un viaje, un auto, una meta.', color: '#10B981' },
  { id: 'emergencia',  icono: '🛡️', titulo: 'Armar un fondo de emergencia', desc: 'Tener colchón para imprevistos.', color: '#3B82F6' },
  { id: 'deudas',      icono: '💳', titulo: 'Salir de deudas', desc: 'Organizarme para pagar lo que debo.', color: '#EF4444' },
  { id: 'inversion',   icono: '📈', titulo: 'Empezar a invertir', desc: 'Hacer que mi plata rinda más.', color: '#8B5CF6' },
]

const PASOS = ['Cuenta', 'Perfil', 'Objetivo', 'Meta']

const FRASES = [
  { text: 'Preparando tu espacio...', emoji: '🏗️' },
  { text: 'Configurando categorías...', emoji: '📂' },
  { text: 'Activando ManguitoAI...', emoji: '🤖' },
  { text: '¡Todo listo! 🎉', emoji: '🚀' },
]

// ── Step completion celebration ──
function StepCelebration({ emoji }) {
  return (
    <div className="absolute inset-0 pointer-events-none flex items-center justify-center z-20">
      <div className="animate-pop-in">
        <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-900/30
          flex items-center justify-center shadow-lg">
          <span className="text-3xl">{emoji}</span>
        </div>
      </div>
    </div>
  )
}

// ── Password strength with dopamine progression ──
function PasswordStrength({ password }) {
  if (!password) return null

  const getStrength = (pw) => {
    let score = 0
    if (pw.length >= 6) score++
    if (pw.length >= 8) score++
    if (/[A-Z]/.test(pw)) score++
    if (/[0-9]/.test(pw)) score++
    if (/[^A-Za-z0-9]/.test(pw)) score++
    return score
  }

  const strength = getStrength(password)
  const levels = [
    { label: 'Muy débil', color: '#EF4444', width: 20, emoji: '😰' },
    { label: 'Débil', color: '#F97316', width: 40, emoji: '😐' },
    { label: 'Regular', color: '#EAB308', width: 60, emoji: '🙂' },
    { label: 'Fuerte', color: '#22C55E', width: 80, emoji: '💪' },
    { label: '¡Excelente!', color: '#10B981', width: 100, emoji: '🔒' },
  ]

  const level = levels[Math.min(strength, levels.length) - 1] || levels[0]

  return (
    <div className="space-y-1 animate-in fade-in duration-300">
      <div className="h-1.5 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-700 ease-out"
          style={{ width: `${level.width}%`, background: level.color }}
        />
      </div>
      <div className="flex items-center justify-between">
        <p className="text-[10px] font-bold tracking-wide" style={{ color: level.color }}>
          {level.label}
        </p>
        <span className="text-xs transition-all duration-300">{level.emoji}</span>
      </div>
    </div>
  )
}

// ── Floating ambient particles ──
function AmbientParticles() {
  const items = [
    { emoji: '🥭', x: 12, y: 18, size: 28, dur: 18, delay: 0 },
    { emoji: '💰', x: 82, y: 22, size: 20, dur: 22, delay: 1.2 },
    { emoji: '📈', x: 20, y: 72, size: 22, dur: 20, delay: 3 },
    { emoji: '✨', x: 75, y: 68, size: 16, dur: 16, delay: 0.8 },
    { emoji: '🎯', x: 55, y: 35, size: 18, dur: 24, delay: 4 },
  ]

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {items.map((p, i) => (
        <div
          key={i}
          className="absolute animate-float"
          style={{
            left: `${p.x}%`, top: `${p.y}%`,
            fontSize: `${p.size}px`,
            animationDuration: `${p.dur}s`,
            animationDelay: `${p.delay}s`,
            opacity: 0.18,
          }}
        >
          {p.emoji}
        </div>
      ))}
    </div>
  )
}

// ══════════════════════════════════════════════════════
//  Main Registration Page
// ══════════════════════════════════════════════════════

export function RegistroPage() {
  const navigate = useNavigate()
  const [paso, setPaso] = useState(1)
  const [cargando, setCargando] = useState(false)
  const [error, setError] = useState('')
  const [fraseIdx, setFraseIdx] = useState(0)
  const [showPass, setShowPass] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [celebrating, setCelebrating] = useState(false)
  const formDataRef = useRef({})

  const [formData, setFormData] = useState({
    email: '', password: '', nombre: '', diaNac: '', mesNac: '', anioNac: '',
    objetivo: '', metaActiva: false, metaEmoji: '🎯', metaNombre: '', metaMonto: '',
  })

  useEffect(() => { formDataRef.current = formData }, [formData])
  useEffect(() => {
    const timer = setTimeout(() => setMounted(true), 50)
    return () => clearTimeout(timer)
  }, [])

  const set = (campo, valor) => {
    setFormData(prev => ({ ...prev, [campo]: valor }))
    setError('')
  }

  const edadCalculada = useMemo(() => {
    const { diaNac, mesNac, anioNac } = formData
    if (!diaNac || !mesNac || !anioNac || anioNac.length !== 4) return null
    const baseDate = new Date(`${anioNac}-${mesNac.padStart(2, '0')}-${diaNac.padStart(2, '0')}T00:00:00`)
    if (isNaN(baseDate.getTime())) return null
    const now = new Date()
    let age = now.getFullYear() - baseDate.getFullYear()
    const m = now.getMonth() - baseDate.getMonth()
    if (m < 0 || (m === 0 && now.getDate() < baseDate.getDate())) age--
    return age >= 0 && age <= 120 ? age : null
  }, [formData.diaNac, formData.mesNac, formData.anioNac])

  // Celebrate step completion with brief animation
  const celebrateAndAdvance = () => {
    setCelebrating(true)
    setTimeout(() => {
      setCelebrating(false)
      setPaso(p => p + 1)
    }, 400)
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
    celebrateAndAdvance()
  }

  const finalizar = useCallback(async () => {
    const datos = { ...formDataRef.current }
    if (datos.diaNac && datos.mesNac && datos.anioNac) {
      datos.fechaNacimiento = `${datos.anioNac}-${datos.mesNac.padStart(2, '0')}-${datos.diaNac.padStart(2, '0')}`
    } else {
      datos.fechaNacimiento = null
    }

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

  // Step-specific motivational subtitles
  const stepMotivation = {
    1: { icon: '🚀', text: 'Tu camino financiero empieza acá' },
    2: { icon: '👤', text: 'Hacemos Manguito personal para vos' },
    3: { icon: '🎯', text: 'Personalizamos todo según tu objetivo' },
    4: { icon: '⭐', text: '¡Último paso! Ya casi está' },
  }

  return (
    <div className="min-h-screen w-full flex overflow-hidden bg-[var(--cream-soft)] dark:bg-[var(--dark-bg)]">

      {/* ── LEFT PANEL — Brand experience with context ── */}
      <div className="hidden lg:flex lg:w-[42%] relative flex-col justify-between p-12 overflow-hidden">
        {/* Layered background */}
        <div className="absolute inset-0 bg-gradient-to-br from-amber-50/80 via-orange-50/40 to-yellow-50/20
          dark:from-[var(--dark-bg)] dark:via-[var(--dark-surface)] dark:to-[var(--dark-bg)]" />
        <div className="absolute top-[-10%] left-[-10%] w-80 h-80 bg-[var(--mango)]/20 rounded-full blur-[90px] animate-blob" />
        <div className="absolute bottom-[-10%] right-[-5%] w-64 h-64 bg-emerald-400/12 rounded-full blur-[80px] animate-blob animation-delay-2000" />
        <div className="absolute top-[50%] left-[50%] w-40 h-40 bg-amber-300/10 rounded-full blur-[60px] animate-blob animation-delay-4000" />

        <AmbientParticles />

        {/* Top — Logo */}
        <div className="relative z-10">
          <Link to="/" className="flex items-center gap-2.5 group w-fit">
            <div className="relative">
              <div className="absolute inset-0 bg-[var(--mango)] blur-lg opacity-40 rounded-full
                group-hover:opacity-60 transition-opacity" />
              <img src="/Mango.png" alt="Manguito" className="relative w-8 h-8 object-contain" />
            </div>
            <span className="text-xl font-black font-display text-gradient-gold">Manguito</span>
          </Link>
        </div>

        {/* Middle — Dynamic content based on step */}
        <div className={`relative z-10 transition-all duration-500 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
          <h2 className="font-display text-3xl font-black text-zinc-800 dark:text-white mb-3 leading-tight">
            {paso <= 2 && (
              <>
                Tu camino al
                <br />
                <span className="text-gradient-gold">éxito financiero</span>
                <br />
                empieza acá 🚀
              </>
            )}
            {paso === 3 && (
              <>
                Cada objetivo
                <br />
                <span className="text-gradient-gold">merece un plan</span>
                <br />
                a medida 🎯
              </>
            )}
            {paso >= 4 && (
              <>
                ¡Ya casi
                <br />
                <span className="text-gradient-gold">lo tenés!</span>
                <br />
                Un paso más ✨
              </>
            )}
          </h2>
          <p className="text-zinc-500 dark:text-zinc-400 text-sm leading-relaxed font-medium max-w-xs">
            En 2 minutos tenés tu cuenta lista y empezás a tomar control de tu plata.
          </p>

          {/* Progress visualization */}
          <div className="mt-8 flex items-center gap-2">
            {PASOS.map((p, i) => (
              <div key={p} className="flex items-center gap-2">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold
                    transition-all duration-500 ${
                    i + 1 < paso
                      ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/30 scale-100'
                      : i + 1 === paso
                        ? 'bg-[var(--mango)] text-white shadow-md shadow-[var(--mango)]/30 scale-110 animate-pulse-subtle'
                        : 'bg-white/40 dark:bg-white/[0.06] text-zinc-400 dark:text-zinc-600'
                  }`}
                >
                  {i + 1 < paso ? '✓' : i + 1}
                </div>
                {i < PASOS.length - 1 && (
                  <div className={`w-6 h-0.5 rounded-full transition-all duration-500 ${
                    i + 1 < paso ? 'bg-emerald-500' : 'bg-zinc-200/60 dark:bg-zinc-700/40'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Bottom — Trust indicators */}
        <div className="relative z-10 space-y-2.5">
          {['Sin tarjeta requerida', 'Datos seguros y encriptados', 'Plan gratuito para siempre'].map((t, i) => (
            <div key={t} className={`flex items-center gap-2.5 text-sm text-zinc-600 dark:text-zinc-400 font-medium
              animate-fade-up opacity-0`}
              style={{ animationDelay: `${400 + i * 150}ms`, animationFillMode: 'forwards' }}>
              <span className="w-5 h-5 rounded-full bg-emerald-100 dark:bg-emerald-900/30
                flex items-center justify-center text-[10px] text-emerald-600 flex-shrink-0">✓</span>
              {t}
            </div>
          ))}
        </div>
      </div>

      {/* ── RIGHT PANEL — Multi-step form ── */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 lg:p-12 overflow-y-auto relative">
        {/* Mobile ambient bg */}
        <div className="absolute inset-0 lg:hidden overflow-hidden pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] w-72 h-72 bg-[var(--mango)]/12 rounded-full blur-[90px]" />
          <div className="absolute bottom-[-10%] right-[-10%] w-72 h-72 bg-emerald-400/8 rounded-full blur-[90px]" />
        </div>

        <div className={`w-full max-w-[420px] relative transition-all duration-700
          ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>

          {/* Mobile logo */}
          <div className="lg:hidden flex items-center justify-center gap-2.5 mb-6">
            <div className="relative">
              <div className="absolute inset-0 bg-[var(--mango)] blur-lg opacity-30 rounded-full" />
              <img src="/Mango.png" alt="Manguito" className="relative w-9 h-9 object-contain" />
            </div>
            <span className="text-xl font-black font-display text-gradient-gold">Manguito</span>
          </div>

          {/* Mobile progress bar — compact */}
          {paso < 5 && (
            <div className="lg:hidden mb-5">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs text-zinc-500 dark:text-zinc-400 font-semibold">
                  {stepMotivation[paso]?.icon} {stepMotivation[paso]?.text}
                </p>
                <span className="text-[10px] font-bold text-[var(--mango)]">
                  {paso}/4
                </span>
              </div>
              <div className="h-1.5 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-700 ease-out"
                  style={{
                    width: `${(paso / PASOS.length) * 100}%`,
                    background: 'var(--gradient-mango)'
                  }}
                />
              </div>
            </div>
          )}

          {/* Desktop progress - above card */}
          {paso < 5 && (
            <div className="hidden lg:block mb-5">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-base">{stepMotivation[paso]?.icon}</span>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 font-semibold">
                  {stepMotivation[paso]?.text}
                </p>
              </div>
              <div className="h-1.5 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-700 ease-out"
                  style={{
                    width: `${(paso / PASOS.length) * 100}%`,
                    background: 'var(--gradient-mango)'
                  }}
                />
              </div>
            </div>
          )}

          {/* Form card */}
          <div className="relative bg-white/90 dark:bg-[var(--dark-card)]/95 backdrop-blur-xl rounded-3xl
            shadow-[var(--shadow-lg)] border border-zinc-100/80 dark:border-[var(--dark-border)] p-7
            hover:shadow-[var(--shadow-xl)] transition-shadow duration-500">

            {/* Celebration overlay */}
            {celebrating && <StepCelebration emoji="✅" />}

            {error && (
              <div className="mb-5 flex items-center gap-2.5 bg-red-50 dark:bg-red-900/20
                text-red-600 dark:text-red-400 text-sm px-4 py-3 rounded-2xl
                border border-red-100 dark:border-red-800/40 font-medium
                animate-in slide-in-from-top-2 duration-300">
                <span className="text-base flex-shrink-0">⚠️</span>
                <span>{error}</span>
              </div>
            )}

            {/* ═══ PASO 1: Cuenta ═══ */}
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
                  <div className="relative group">
                    <input
                      type={showPass ? 'text' : 'password'}
                      placeholder="Mínimo 6 caracteres"
                      value={formData.password}
                      onChange={e => set('password', e.target.value)}
                      className="w-full bg-zinc-50/80 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700/60
                        rounded-xl px-3.5 py-2.5 pr-11 text-sm font-medium
                        focus:outline-none focus:ring-2 focus:ring-[var(--mango)]/30 focus:border-[var(--mango)]/60
                        hover:border-zinc-300 dark:hover:border-zinc-600
                        transition-all text-zinc-900 dark:text-white"
                    />
                    <button type="button" onClick={() => setShowPass(s => !s)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400
                        hover:text-zinc-600 dark:hover:text-zinc-300
                        transition-all text-sm hover:scale-110 active:scale-95">
                      {showPass ? '🙈' : '👁️'}
                    </button>
                  </div>
                  <PasswordStrength password={formData.password} />
                </div>

                <button onClick={avanzar}
                  className="btn-primary w-full py-3.5 rounded-2xl text-white text-sm font-bold mt-1
                    hover:scale-[1.01] active:scale-[0.98] transition-transform duration-150">
                  Continuar →
                </button>

                <p className="text-center text-sm text-zinc-500 dark:text-zinc-400 font-medium">
                  ¿Ya tenés cuenta?{' '}
                  <Link to="/login" className="font-bold text-[var(--mango-dark)] dark:text-[var(--mango)]
                    hover:underline transition-colors">
                    Entrar →
                  </Link>
                </p>
              </div>
            )}

            {/* ═══ PASO 2: Perfil ═══ */}
            {paso === 2 && (
              <div className="flex flex-col gap-5 animate-in slide-in-from-right-4 fade-in duration-400">
                <div>
                  <h2 className="text-2xl font-black font-display text-zinc-900 dark:text-white mb-1">
                    ¿Cómo te llamás?
                  </h2>
                  <p className="text-sm text-zinc-500 dark:text-zinc-400 font-medium">
                    Para que Manguito sea más personal 🥭
                  </p>
                </div>

                <Input label="Tu nombre o apodo" placeholder="Ej: Maxi" autoFocus
                  value={formData.nombre} onChange={e => set('nombre', e.target.value)} />

                {/* Personalized greeting preview */}
                {formData.nombre.trim() && (
                  <div className="bg-[var(--mango)]/8 dark:bg-[var(--mango)]/6 rounded-2xl p-4
                    border border-[var(--mango)]/15 animate-in fade-in slide-in-from-bottom-2 duration-300">
                    <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                      <span className="text-lg mr-1">👋</span>
                      Así vas a ver tu panel: <strong className="text-[var(--mango-dark)] dark:text-[var(--mango)]">
                        "¡Hola, {formData.nombre.trim().split(' ')[0]}!"
                      </strong>
                    </p>
                  </div>
                )}

                <div className="flex flex-col gap-1.5 mt-1">
                  <label className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 tracking-wide">
                    Fecha de nacimiento <span className="text-zinc-300 dark:text-zinc-600">(opcional)</span>
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    <input type="number" placeholder="Día" min="1" max="31"
                      value={formData.diaNac} onChange={e => set('diaNac', e.target.value)}
                      className="w-full bg-zinc-50/80 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700/60
                        rounded-xl px-3 py-2.5 text-center text-sm font-medium focus:outline-none focus:ring-2
                        focus:ring-[var(--mango)]/30 focus:border-[var(--mango)]/60
                        hover:border-zinc-300 dark:hover:border-zinc-600
                        transition-all text-zinc-900 dark:text-white"
                    />
                    <input type="number" placeholder="Mes" min="1" max="12"
                      value={formData.mesNac} onChange={e => set('mesNac', e.target.value)}
                      className="w-full bg-zinc-50/80 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700/60
                        rounded-xl px-3 py-2.5 text-center text-sm font-medium focus:outline-none focus:ring-2
                        focus:ring-[var(--mango)]/30 focus:border-[var(--mango)]/60
                        hover:border-zinc-300 dark:hover:border-zinc-600
                        transition-all text-zinc-900 dark:text-white"
                    />
                    <input type="number" placeholder="Año" min="1900" max={new Date().getFullYear()}
                      value={formData.anioNac} onChange={e => set('anioNac', e.target.value)}
                      className="w-full bg-zinc-50/80 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700/60
                        rounded-xl px-3 py-2.5 text-center text-sm font-medium focus:outline-none focus:ring-2
                        focus:ring-[var(--mango)]/30 focus:border-[var(--mango)]/60
                        hover:border-zinc-300 dark:hover:border-zinc-600
                        transition-all text-zinc-900 dark:text-white"
                    />
                  </div>
                  {edadCalculada !== null && (
                    <div className="flex items-center gap-1.5 mt-0.5 animate-in fade-in slide-in-from-bottom-1 duration-300">
                      <span className="text-sm">🎉</span>
                      <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-bold">
                        ¡Tenés {edadCalculada} años!
                      </p>
                    </div>
                  )}
                </div>

                <div className="flex gap-3 mt-1">
                  <button onClick={() => setPaso(1)}
                    className="flex-1 py-3 rounded-2xl border border-zinc-200 dark:border-zinc-700
                      text-sm font-semibold text-zinc-600 dark:text-zinc-400
                      hover:bg-zinc-50 dark:hover:bg-zinc-800/60 hover:border-zinc-300
                      active:scale-[0.98] transition-all duration-150">
                    ← Atrás
                  </button>
                  <button onClick={avanzar}
                    className="btn-primary flex-1 py-3 rounded-2xl text-white text-sm font-bold
                      hover:scale-[1.01] active:scale-[0.98] transition-transform duration-150">
                    Continuar →
                  </button>
                </div>
              </div>
            )}

            {/* ═══ PASO 3: Objetivo ═══ */}
            {paso === 3 && (
              <div className="flex flex-col gap-4 animate-in slide-in-from-right-4 fade-in duration-400">
                <div>
                  <h2 className="text-2xl font-black font-display text-zinc-900 dark:text-white mb-1">
                    ¿Qué querés lograr?
                  </h2>
                  <p className="text-sm text-zinc-500 dark:text-zinc-400 font-medium">
                    Personalizamos Manguito para vos, {formData.nombre.split(' ')[0] || ''} ✨
                  </p>
                </div>

                <div className="flex flex-col gap-2 max-h-72 overflow-y-auto -mx-1 px-1 scrollbar-hide">
                  {OBJETIVOS.map((obj, i) => (
                    <button
                      key={obj.id}
                      type="button"
                      onClick={() => { set('objetivo', obj.id); setError('') }}
                      className={`flex items-start gap-3 p-4 rounded-2xl border-2 text-left
                        transition-all duration-200 group
                        hover:scale-[1.01] active:scale-[0.99] ${formData.objetivo === obj.id
                          ? 'border-[var(--mango)] bg-[var(--mango)]/8 dark:bg-[var(--mango)]/6 shadow-md shadow-[var(--mango)]/10'
                          : 'border-zinc-100 dark:border-zinc-700/60 hover:border-zinc-200 dark:hover:border-zinc-600 hover:bg-zinc-50/50 dark:hover:bg-white/[0.02]'
                        }`}
                      style={{
                        animationDelay: `${i * 80}ms`,
                      }}
                    >
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0
                        transition-all duration-300 ${formData.objetivo === obj.id
                          ? 'scale-110 rotate-3'
                          : 'group-hover:scale-105'}`}
                        style={{ background: `${obj.color}15` }}>
                        {obj.icono}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-sm text-zinc-900 dark:text-white">{obj.titulo}</p>
                        <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">{obj.desc}</p>
                      </div>
                      {formData.objetivo === obj.id && (
                        <span className="text-emerald-500 text-lg flex-shrink-0 animate-pop-in">✓</span>
                      )}
                    </button>
                  ))}
                </div>

                <div className="flex gap-3 mt-1">
                  <button onClick={() => setPaso(2)}
                    className="flex-1 py-3 rounded-2xl border border-zinc-200 dark:border-zinc-700
                      text-sm font-semibold text-zinc-600 dark:text-zinc-400
                      hover:bg-zinc-50 dark:hover:bg-zinc-800/60 hover:border-zinc-300
                      active:scale-[0.98] transition-all duration-150">
                    ← Atrás
                  </button>
                  <button onClick={avanzar}
                    className="btn-primary flex-1 py-3 rounded-2xl text-white text-sm font-bold
                      hover:scale-[1.01] active:scale-[0.98] transition-transform duration-150">
                    Continuar →
                  </button>
                </div>
              </div>
            )}

            {/* ═══ PASO 4: Meta opcional ═══ */}
            {paso === 4 && (
              <div className="flex flex-col gap-5 animate-in slide-in-from-right-4 fade-in duration-400">
                <div>
                  <h2 className="text-2xl font-black font-display text-zinc-900 dark:text-white mb-1">
                    Tu primera meta
                  </h2>
                  <p className="text-sm text-zinc-500 dark:text-zinc-400 font-medium">
                    Opcional — podés hacerlo después también 😊
                  </p>
                </div>

                {!formData.metaActiva ? (
                  <div className="flex flex-col gap-3">
                    <button
                      onClick={() => set('metaActiva', true)}
                      className="flex items-center gap-3 p-5 rounded-2xl border-2
                        border-[var(--mango)] bg-[var(--mango)]/5 text-left
                        hover:bg-[var(--mango)]/10 hover:scale-[1.01] active:scale-[0.99]
                        transition-all duration-200 group"
                    >
                      <div className="w-12 h-12 rounded-2xl bg-[var(--mango)]/15
                        flex items-center justify-center text-2xl
                        group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300">
                        🎯
                      </div>
                      <div>
                        <p className="font-bold text-sm text-zinc-900 dark:text-white">Crear mi primera meta ahora</p>
                        <p className="text-xs text-zinc-500 mt-0.5">Empezá con el pie derecho</p>
                      </div>
                      <span className="ml-auto text-zinc-300 dark:text-zinc-600 group-hover:text-[var(--mango)]
                        transition-colors text-lg">→</span>
                    </button>

                    <div className="flex gap-3">
                      <button onClick={() => setPaso(3)}
                        className="flex-1 py-3 rounded-2xl border border-zinc-200 dark:border-zinc-700
                          text-sm font-semibold text-zinc-600 dark:text-zinc-400
                          hover:bg-zinc-50 dark:hover:bg-zinc-800/60 hover:border-zinc-300
                          active:scale-[0.98] transition-all duration-150">
                        ← Atrás
                      </button>
                      <button onClick={() => setPaso(5)}
                        className="btn-primary flex-1 py-3 rounded-2xl text-white text-sm font-bold
                          hover:scale-[1.01] active:scale-[0.98] transition-transform duration-150">
                        Crear cuenta →
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="bg-zinc-50/80 dark:bg-zinc-800/50 rounded-2xl p-4 flex flex-col gap-4
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

                      {/* Preview of the goal */}
                      {formData.metaNombre && formData.metaMonto && (
                        <div className="bg-white dark:bg-[var(--dark-card)] rounded-xl p-3
                          border border-zinc-100 dark:border-zinc-700/40
                          animate-in fade-in slide-in-from-bottom-2 duration-300">
                          <div className="flex items-center gap-2.5">
                            <span className="text-2xl">{formData.metaEmoji}</span>
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-bold text-zinc-800 dark:text-white truncate">
                                {formData.metaNombre}
                              </p>
                              <p className="text-[10px] text-zinc-400 font-medium">
                                Meta: ${Number(formData.metaMonto).toLocaleString('es-AR')}
                              </p>
                            </div>
                            <span className="text-[10px] font-bold text-emerald-500">0%</span>
                          </div>
                          <div className="mt-2 h-1 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                            <div className="h-full w-[2%] bg-[var(--mango)] rounded-full" />
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="flex gap-3">
                      <button onClick={() => set('metaActiva', false)}
                        className="flex-1 py-3 rounded-2xl border border-zinc-200 dark:border-zinc-700
                          text-sm font-semibold text-zinc-600 dark:text-zinc-400
                          hover:bg-zinc-50 dark:hover:bg-zinc-800/60 hover:border-zinc-300
                          active:scale-[0.98] transition-all duration-150">
                        ← Atrás
                      </button>
                      <button onClick={() => setPaso(5)}
                        className="btn-primary flex-1 py-3 rounded-2xl text-white text-sm font-bold
                          hover:scale-[1.01] active:scale-[0.98] transition-transform duration-150">
                        Crear cuenta →
                      </button>
                    </div>
                  </>
                )}
              </div>
            )}

            {/* ═══ PASO 5: Loading celebration ═══ */}
            {paso === 5 && (
              <div className="flex flex-col items-center justify-center gap-6 py-10 animate-in fade-in duration-500">
                {/* Animated icon with rings */}
                <div className="relative">
                  <div className="w-24 h-24 rounded-full bg-[var(--mango)]/10 dark:bg-[var(--mango)]/8
                    flex items-center justify-center">
                    <span className="text-5xl animate-bounce" style={{ animationDuration: '1.5s' }}>
                      {fraseIdx >= FRASES.length - 1 ? '🎉' : (FRASES[fraseIdx]?.emoji || '🥭')}
                    </span>
                  </div>
                  <div className="absolute inset-0 rounded-full border-2 border-[var(--mango)]/30 animate-pulse-ring" />
                  <div className="absolute inset-[-4px] rounded-full border border-[var(--mango)]/15 animate-pulse-ring"
                    style={{ animationDelay: '0.5s' }} />
                </div>

                <div className="text-center space-y-2">
                  <h3 className="text-xl font-black font-display text-zinc-900 dark:text-white">
                    {fraseIdx >= FRASES.length - 1
                      ? `¡Bienvenido, ${formData.nombre.split(' ')[0] || 'crack'}! 🥭`
                      : 'Preparando tu Manguito'}
                  </h3>
                  <p className="text-sm text-zinc-500 dark:text-zinc-400 font-medium h-5 transition-all duration-300">
                    {FRASES[fraseIdx]?.text}
                  </p>
                </div>

                {/* Progress bar with step indicators */}
                <div className="w-full space-y-2">
                  <div className="w-full bg-zinc-100 dark:bg-zinc-800 rounded-full h-2 overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-1000 ease-out"
                      style={{
                        width: `${((fraseIdx + 1) / FRASES.length) * 100}%`,
                        background: fraseIdx >= FRASES.length - 1
                          ? 'linear-gradient(90deg, #10B981, #059669)'
                          : 'var(--gradient-mango)',
                      }}
                    />
                  </div>
                  <div className="flex justify-between">
                    {FRASES.map((_, i) => (
                      <div key={i} className={`w-2 h-2 rounded-full transition-all duration-500 ${
                        i <= fraseIdx ? 'bg-[var(--mango)] scale-100' : 'bg-zinc-200 dark:bg-zinc-700 scale-75'
                      }`} />
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Footer links */}
          {paso < 5 && (
            <div className="text-center mt-4">
              <Link to="/" className="text-xs text-zinc-400 hover:text-[var(--mango-dark)] dark:hover:text-[var(--mango)]
                font-medium transition-colors">
                ← Volver al inicio
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}