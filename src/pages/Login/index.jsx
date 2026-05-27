import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { login } from '../../api/auth'
import { Input } from '../../components/ui'

/* ═══════════════════════════════════════════════════════
   🥭  LOGIN PAGE — Dopamine-Driven Premium Auth
   Floating particles, ambient glow, micro-interactions,
   gratifying feedback on every action
   ═══════════════════════════════════════════════════════ */

// ── Floating ambient particles for the left panel ──
function AmbientParticles() {
  const items = [
    { emoji: '🥭', x: 15, y: 20, size: 32, dur: 18, delay: 0 },
    { emoji: '💰', x: 80, y: 15, size: 22, dur: 22, delay: 1.5 },
    { emoji: '📈', x: 25, y: 75, size: 24, dur: 20, delay: 3 },
    { emoji: '✨', x: 70, y: 65, size: 18, dur: 16, delay: 0.8 },
    { emoji: '🎯', x: 50, y: 40, size: 20, dur: 24, delay: 4 },
    { emoji: '💎', x: 85, y: 80, size: 16, dur: 19, delay: 2.5 },
  ]

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {items.map((p, i) => (
        <div
          key={i}
          className="absolute animate-float"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            fontSize: `${p.size}px`,
            animationDuration: `${p.dur}s`,
            animationDelay: `${p.delay}s`,
            opacity: 0.2,
          }}
        >
          {p.emoji}
        </div>
      ))}
    </div>
  )
}

// ── Password strength indicator with dopamine colors ──
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
    { label: 'Muy débil', color: '#EF4444', width: 20 },
    { label: 'Débil', color: '#F97316', width: 40 },
    { label: 'Regular', color: '#EAB308', width: 60 },
    { label: 'Fuerte', color: '#22C55E', width: 80 },
    { label: '¡Excelente! 🔒', color: '#10B981', width: 100 },
  ]

  const level = levels[Math.min(strength, levels.length) - 1] || levels[0]

  return (
    <div className="space-y-1.5 animate-in fade-in duration-300">
      <div className="h-1 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-500 ease-out"
          style={{ width: `${level.width}%`, background: level.color }}
        />
      </div>
      <p className="text-[10px] font-bold tracking-wide" style={{ color: level.color }}>
        {level.label}
      </p>
    </div>
  )
}

// ── Feature highlight cards for left panel ──
function FeatureHighlight({ emoji, title, desc, delay }) {
  return (
    <div
      className="flex items-start gap-3 bg-white/40 dark:bg-white/[0.04] backdrop-blur-sm
        rounded-2xl p-4 border border-white/60 dark:border-white/[0.06]
        hover:bg-white/60 dark:hover:bg-white/[0.06] hover:scale-[1.02]
        transition-all duration-300 animate-fade-up opacity-0"
      style={{ animationDelay: delay, animationFillMode: 'forwards' }}
    >
      <div className="w-10 h-10 rounded-xl bg-[var(--mango)]/10 dark:bg-[var(--mango)]/15
        flex items-center justify-center text-lg flex-shrink-0">
        {emoji}
      </div>
      <div>
        <p className="text-sm font-bold text-zinc-800 dark:text-white">{title}</p>
        <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed mt-0.5">{desc}</p>
      </div>
    </div>
  )
}

// ══════════════════════════════════════════════════════
//  Main Login Page
// ══════════════════════════════════════════════════════

export function LoginPage() {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({ email: '', password: '' })
  const [cargando, setCargando] = useState(false)
  const [error, setError] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setMounted(true), 50)
    return () => clearTimeout(timer)
  }, [])

  const handleChange = (campo, valor) => {
    setFormData(prev => ({ ...prev, [campo]: valor }))
    setError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!formData.email || !formData.password) {
      setError('Completá ambos campos para continuar.')
      return
    }
    setCargando(true)
    try {
      await login({ email: formData.email, password: formData.password })
      setSuccess(true)
      // Dar tiempo a la animación de éxito y al AuthContext para procesar la sesión
      setTimeout(() => navigate('/dashboard'), 1200)
    } catch (err) {
      setError('Email o contraseña incorrectos. Volvé a intentar.')
      setCargando(false)
    }
  }

  return (
    <div className="min-h-screen w-full flex overflow-hidden bg-[var(--cream-soft)] dark:bg-[var(--dark-bg)]">

      {/* ── LEFT PANEL — Immersive brand experience ── */}
      <div className="hidden lg:flex lg:w-[45%] relative flex-col items-center justify-center overflow-hidden">
        {/* Layered background */}
        <div className="absolute inset-0 mesh-bg" />
        <div className="absolute inset-0 bg-gradient-to-br from-amber-50/80 via-orange-50/40 to-yellow-50/20
          dark:from-[var(--dark-bg)] dark:via-[var(--dark-surface)] dark:to-[var(--dark-bg)]" />

        {/* Animated ambient blobs */}
        <div className="absolute top-[-15%] left-[-10%] w-96 h-96 bg-[var(--mango)]/20 rounded-full blur-[100px] animate-blob" />
        <div className="absolute bottom-[-15%] right-[-8%] w-72 h-72 bg-emerald-400/12 rounded-full blur-[90px] animate-blob animation-delay-2000" />
        <div className="absolute top-[50%] left-[60%] w-48 h-48 bg-amber-300/10 rounded-full blur-[70px] animate-blob animation-delay-4000" />

        <AmbientParticles />

        {/* Content */}
        <div className="relative z-10 px-12 max-w-lg w-full">
          {/* Logo with glow */}
          <div className={`text-center mb-10 transition-all duration-700 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
            <div className="relative inline-block mb-6">
              <div className="absolute inset-0 bg-[var(--mango)] blur-3xl opacity-25 rounded-full animate-pulse scale-[2]" />
              <img
                src="/Mango.png"
                alt="Manguito"
                className="relative w-24 h-24 object-contain animate-float drop-shadow-2xl"
              />
            </div>

            <h2 className="font-display text-4xl font-black text-zinc-800 dark:text-white mb-3 leading-tight">
              Bienvenido de
              <br />
              <span className="text-gradient-gold">vuelta</span> 👋
            </h2>
            <p className="text-zinc-500 dark:text-zinc-400 text-base leading-relaxed font-medium">
              Tu plata te está esperando. Retomá el control.
            </p>
          </div>

          {/* Feature highlights — security focused */}
          <div className="space-y-3">
            <FeatureHighlight
              emoji="🔐"
              title="Contraseña encriptada"
              desc="Tu contraseña nunca se almacena en texto plano."
              delay="400ms"
            />
            <FeatureHighlight
              emoji="🛡️"
              title="Email protegido"
              desc="Tu email solo se usa para acceder. Nunca lo compartimos."
              delay="550ms"
            />
            <FeatureHighlight
              emoji="⚡"
              title="Acceso instantáneo"
              desc="Tu panel financiero listo en un segundo."
              delay="700ms"
            />
          </div>
        </div>
      </div>

      {/* ── RIGHT PANEL — Form with premium card ── */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 lg:p-12 relative">
        {/* Mobile ambient background */}
        <div className="absolute inset-0 lg:hidden overflow-hidden pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] w-72 h-72 bg-[var(--mango)]/12 rounded-full blur-[90px]" />
          <div className="absolute bottom-[-10%] right-[-10%] w-72 h-72 bg-emerald-400/8 rounded-full blur-[90px]" />
        </div>

        <div className={`w-full max-w-[400px] relative transition-all duration-700 delay-100
          ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>

          {/* Mobile logo */}
          <div className="lg:hidden flex items-center justify-center gap-2.5 mb-8">
            <div className="relative">
              <div className="absolute inset-0 bg-[var(--mango)] blur-lg opacity-30 rounded-full" />
              <img src="/Mango.png" alt="Manguito" className="relative w-10 h-10 object-contain" />
            </div>
            <span className="text-2xl font-black font-display text-gradient-gold">Manguito</span>
          </div>

          {/* Success state — dopamine rush */}
          {success ? (
            <div className="bg-white/90 dark:bg-[var(--dark-card)]/95 backdrop-blur-xl rounded-3xl
              shadow-[var(--shadow-lg)] border border-zinc-100/80 dark:border-[var(--dark-border)] p-8
              text-center animate-scale-in">
              <div className="relative inline-block mb-4">
                <div className="w-20 h-20 rounded-full bg-emerald-100 dark:bg-emerald-900/30
                  flex items-center justify-center">
                  <span className="text-4xl animate-bounce">🎉</span>
                </div>
                <div className="absolute inset-0 rounded-full border-2 border-emerald-400/40 animate-pulse-ring" />
              </div>
              <h2 className="text-2xl font-black font-display text-zinc-900 dark:text-white mb-2">
                ¡Bienvenido!
              </h2>
              <p className="text-sm text-zinc-500 dark:text-zinc-400 font-medium animate-pulse">
                Cargando tu panel financiero...
              </p>
            </div>
          ) : (
            /* Form card */
            <div className="bg-white/90 dark:bg-[var(--dark-card)]/95 backdrop-blur-xl rounded-3xl
              shadow-[var(--shadow-lg)] border border-zinc-100/80 dark:border-[var(--dark-border)] p-7
              hover:shadow-[var(--shadow-xl)] transition-shadow duration-500">

              <div className="mb-6">
                <h1 className="text-2xl font-black font-display text-zinc-900 dark:text-white mb-1">
                  Entrar a Manguito
                </h1>
                <p className="text-sm text-zinc-500 dark:text-zinc-400 font-medium">
                  Ingresá tus datos para continuar
                </p>
              </div>

              {/* Error with shake animation */}
              {error && (
                <div className="mb-5 flex items-center gap-2.5 bg-red-50 dark:bg-red-900/20
                  text-red-600 dark:text-red-400 text-sm px-4 py-3 rounded-2xl
                  border border-red-100 dark:border-red-800/40 font-medium
                  animate-in slide-in-from-top-2 duration-300"
                  style={{ animation: 'shake 0.4s ease-in-out' }}
                >
                  <span className="text-base flex-shrink-0">⚠️</span>
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <Input
                  label="Email"
                  type="email"
                  placeholder="tu@email.com"
                  value={formData.email}
                  onChange={e => handleChange('email', e.target.value)}
                  required
                />

                <div className="flex flex-col gap-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 tracking-wide">
                      Contraseña
                    </label>
                    <Link
                      to="/recuperar-password"
                      className="text-xs font-semibold text-[var(--mango-dark)] dark:text-[var(--mango)]
                        hover:underline transition-colors"
                    >
                      ¿La olvidaste?
                    </Link>
                  </div>
                  <div className="relative group">
                    <input
                      type={showPass ? 'text' : 'password'}
                      placeholder="••••••••"
                      value={formData.password}
                      onChange={e => handleChange('password', e.target.value)}
                      required
                      className="w-full bg-zinc-50/80 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700/60
                        rounded-xl px-3.5 py-2.5 pr-11 text-sm font-medium
                        focus:outline-none focus:ring-2 focus:ring-[var(--mango)]/30 focus:border-[var(--mango)]/60
                        transition-all text-zinc-900 dark:text-white
                        hover:border-zinc-300 dark:hover:border-zinc-600"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPass(s => !s)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400
                        hover:text-zinc-600 dark:hover:text-zinc-300
                        transition-all text-sm hover:scale-110 active:scale-95"
                    >
                      {showPass ? '🙈' : '👁️'}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={cargando}
                  className="btn-primary w-full py-3.5 rounded-2xl text-white text-sm font-bold mt-2
                    disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2
                    hover:scale-[1.01] active:scale-[0.98] transition-transform duration-150"
                >
                  {cargando ? (
                    <>
                      <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                      </svg>
                      Entrando...
                    </>
                  ) : (
                    <>
                      Entrar a mi cuenta
                      <span className="transition-transform duration-200 group-hover:translate-x-0.5">→</span>
                    </>
                  )}
                </button>
              </form>

              <div className="mt-6 pt-5 border-t border-zinc-100 dark:border-zinc-700/40 space-y-3">
                <p className="text-sm text-zinc-500 dark:text-zinc-400 font-medium text-center">
                  ¿No tenés cuenta?{' '}
                  <Link to="/registro"
                    className="font-bold text-[var(--mango-dark)] dark:text-[var(--mango)]
                      hover:underline hover:text-[var(--mango)] transition-colors">
                    Registrate gratis →
                  </Link>
                </p>

                {/* Security tip */}
                <div className="flex items-center gap-2 bg-blue-50/60 dark:bg-blue-900/10 rounded-xl px-3 py-2
                  border border-blue-100/40 dark:border-blue-800/20">
                  <span className="text-xs flex-shrink-0">💡</span>
                  <p className="text-[10px] text-blue-600/80 dark:text-blue-400/80 font-medium leading-snug">
                    Nunca compartas tu contraseña. Si la olvidaste, usá el link "¿La olvidaste?" arriba.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Footer note */}
          <div className="flex items-center justify-center gap-2 mt-5">
            <span className="text-sm">🔒</span>
            <p className="text-xs text-zinc-400 font-medium">
              Tu información está protegida con encriptación bancaria
            </p>
          </div>

          {/* Back to home */}
          <div className="text-center mt-3">
            <Link to="/" className="text-xs text-zinc-400 hover:text-[var(--mango-dark)] dark:hover:text-[var(--mango)]
              font-medium transition-colors">
              ← Volver al inicio
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}