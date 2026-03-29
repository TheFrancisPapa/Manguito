import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { login } from '../../api/auth'
import { Input } from '../../components/ui'

export function LoginPage() {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({ email: '', password: '' })
  const [cargando, setCargando] = useState(false)
  const [error, setError] = useState('')
  const [showPass, setShowPass] = useState(false)

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
    } catch (err) {
      setError('Email o contraseña incorrectos. Volvé a intentar.')
      setCargando(false)
    }
  }

  return (
    <div className="min-h-screen w-full flex overflow-hidden bg-[var(--cream-soft)] dark:bg-[var(--dark-bg)]">

      {/* ── LEFT PANEL ── */}
      <div className="hidden lg:flex lg:w-1/2 relative flex-col items-center justify-center overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0 mesh-bg" />
        <div className="absolute inset-0 bg-gradient-to-br from-amber-50 via-orange-50/50 to-cream dark:from-[var(--dark-bg)] dark:via-[var(--dark-surface)] dark:to-[var(--dark-bg)]" />
        
        {/* Blobs */}
        <div className="absolute top-[-10%] left-[-10%] w-80 h-80 bg-[var(--mango)]/25 rounded-full blur-[90px] animate-blob" />
        <div className="absolute bottom-[-10%] right-[-5%] w-64 h-64 bg-emerald-400/15 rounded-full blur-[80px] animate-blob animation-delay-2000" />

        {/* Content */}
        <div className="relative z-10 text-center px-12 max-w-md">
          <div className="relative inline-block mb-8">
            <div className="absolute inset-0 bg-[var(--mango)] blur-2xl opacity-30 rounded-full animate-pulse scale-150" />
            <img
              src="/Mango.png"
              alt="Manguito"
              className="relative w-28 h-28 object-contain animate-float drop-shadow-2xl"
            />
          </div>

          <h2 className="font-display text-4xl font-black text-zinc-800 dark:text-white mb-4 leading-tight">
            Bienvenido de
            <br />
            <span className="text-gradient-gold">vuelta 👋</span>
          </h2>
          <p className="text-zinc-500 dark:text-zinc-400 text-base leading-relaxed font-medium">
            Tu plata te está esperando. Entrá y tomá el control.
          </p>

          {/* Mini stats */}
          <div className="mt-8 grid grid-cols-3 gap-3">
            {[
              { n: '2.4K+', l: 'usuarios' },
              { n: '99.9%', l: 'uptime' },
              { n: '$0', l: 'plan gratis' },
            ].map(s => (
              <div key={s.l} className="bg-white/60 dark:bg-white/5 backdrop-blur-sm rounded-2xl p-3
                border border-white/50 dark:border-white/8">
                <p className="font-black font-display text-lg text-zinc-900 dark:text-white">{s.n}</p>
                <p className="text-[10px] text-zinc-400 font-medium">{s.l}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── RIGHT PANEL ── */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 lg:p-12 relative">
        {/* Mobile background */}
        <div className="absolute inset-0 lg:hidden overflow-hidden pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] w-64 h-64 bg-[var(--mango)]/15 rounded-full blur-[80px]" />
          <div className="absolute bottom-[-10%] right-[-10%] w-64 h-64 bg-emerald-400/10 rounded-full blur-[80px]" />
        </div>

        <div className="w-full max-w-[400px] relative">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center justify-center gap-2.5 mb-8">
            <img src="/Mango.png" alt="Manguito" className="w-10 h-10 object-contain" />
            <span className="text-2xl font-black font-display text-gradient-gold">Manguito</span>
          </div>

          {/* Form card */}
          <div className="bg-white/90 dark:bg-[var(--dark-card)]/95 backdrop-blur-xl rounded-3xl
            shadow-[var(--shadow-lg)] border border-zinc-100/80 dark:border-[var(--dark-border)] p-7">

            <div className="mb-6">
              <h1 className="text-2xl font-black font-display text-zinc-900 dark:text-white mb-1">
                Entrar a Manguito
              </h1>
              <p className="text-sm text-zinc-500 dark:text-zinc-400 font-medium">
                Ingresá tus datos para continuar
              </p>
            </div>

            {/* Error */}
            {error && (
              <div className="mb-5 flex items-center gap-2 bg-red-50 dark:bg-red-900/20
                text-red-600 dark:text-red-400 text-sm px-4 py-3 rounded-2xl
                border border-red-100 dark:border-red-800/40 font-medium animate-in slide-in-from-top-2">
                <span>⚠</span> {error}
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
                <div className="relative">
                  <input
                    type={showPass ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={e => handleChange('password', e.target.value)}
                    required
                    className="w-full bg-zinc-50/80 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700/60
                      rounded-xl px-3.5 py-2.5 pr-11 text-sm font-medium
                      focus:outline-none focus:ring-2 focus:ring-[var(--mango)]/30 focus:border-[var(--mango)]/60
                      transition-all text-zinc-900 dark:text-white"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass(s => !s)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 transition-colors text-sm"
                  >
                    {showPass ? '🙈' : '👁️'}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={cargando}
                className="btn-primary w-full py-3.5 rounded-2xl text-white text-sm font-bold mt-2
                  disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
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
                  'Entrar a mi cuenta →'
                )}
              </button>
            </form>

            <div className="mt-6 pt-5 border-t border-zinc-100 dark:border-zinc-700/40 text-center">
              <p className="text-sm text-zinc-500 dark:text-zinc-400 font-medium">
                ¿No tenés cuenta?{' '}
                <Link to="/registro" className="font-bold text-[var(--mango-dark)] dark:text-[var(--mango)] hover:underline">
                  Registrate gratis
                </Link>
              </p>
            </div>
          </div>

          {/* Footer note */}
          <p className="text-center text-xs text-zinc-400 mt-4 font-medium">
            🔒 Tu información está protegida con encriptación de banco
          </p>
        </div>
      </div>
    </div>
  )
}