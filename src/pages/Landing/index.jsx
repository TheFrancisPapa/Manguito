import { Link, Navigate, useNavigate } from 'react-router-dom'
import { useAuthContext } from '../../context/AuthContext'
import { Button } from '../../components/ui'
import { AnimatedHero } from '../../components/ui/AnimatedHero'
import { useState, useEffect, useRef, useCallback } from 'react'

/* ═══════════════════════════════════════════════════════
   🥭  LANDING PAGE — Dopamine-Driven Design
   Animated counters, floating particles, social proof,
   aspirational dashboard preview, gamified features
   ═══════════════════════════════════════════════════════ */

// ── Animated counter (dopamine: numbers going up = reward) ──
function AnimatedCounter({ end, suffix = '', prefix = '', duration = 2000, delay = 0 }) {
  const [count, setCount] = useState(0)
  const [started, setStarted] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setStarted(true) },
      { threshold: 0.3 }
    )
    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    if (!started) return
    const timeout = setTimeout(() => {
      const startTime = performance.now()
      const animate = (now) => {
        const elapsed = now - startTime
        const progress = Math.min(elapsed / duration, 1)
        // Ease out cubic for satisfying deceleration
        const eased = 1 - Math.pow(1 - progress, 3)
        setCount(Math.floor(eased * end))
        if (progress < 1) requestAnimationFrame(animate)
      }
      requestAnimationFrame(animate)
    }, delay)
    return () => clearTimeout(timeout)
  }, [started, end, duration, delay])

  return (
    <span ref={ref} className="tabular-nums font-mono-num">
      {prefix}{count.toLocaleString('es-AR')}{suffix}
    </span>
  )
}

// ── Floating particle system (ambient dopamine: movement = alive) ──
function FloatingParticles() {
  const particles = [
    { emoji: '🥭', size: 28, x: 8, y: 15, dur: 18, delay: 0 },
    { emoji: '💰', size: 20, x: 85, y: 25, dur: 22, delay: 2 },
    { emoji: '📈', size: 22, x: 15, y: 70, dur: 20, delay: 4 },
    { emoji: '✨', size: 16, x: 90, y: 65, dur: 16, delay: 1 },
    { emoji: '🎯', size: 18, x: 50, y: 10, dur: 24, delay: 3 },
    { emoji: '💎', size: 14, x: 75, y: 80, dur: 19, delay: 5 },
    { emoji: '🚀', size: 16, x: 30, y: 85, dur: 21, delay: 2 },
    { emoji: '⭐', size: 14, x: 65, y: 45, dur: 17, delay: 6 },
  ]

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {particles.map((p, i) => (
        <div
          key={i}
          className="absolute animate-float opacity-30"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            fontSize: `${p.size}px`,
            animationDuration: `${p.dur}s`,
            animationDelay: `${p.delay}s`,
          }}
        >
          {p.emoji}
        </div>
      ))}
    </div>
  )
}

// ── Animated gradient orb ──
function GradientOrb({ className, color1, color2, size = 500 }) {
  return (
    <div
      className={`absolute rounded-full blur-[120px] animate-blob pointer-events-none ${className}`}
      style={{
        width: size,
        height: size,
        background: `radial-gradient(circle, ${color1} 0%, ${color2} 100%)`,
      }}
    />
  )
}

// ── Feature card with dopamine micro-interactions ──
function FeatureCard({ emoji, title, desc, color, stat, statLabel, delay }) {
  const [hovered, setHovered] = useState(false)

  return (
    <div
      className="group relative bg-white dark:bg-[var(--dark-card)] rounded-3xl p-6
        border border-zinc-100/80 dark:border-white/6
        hover:shadow-2xl hover:-translate-y-2 transition-all duration-500
        animate-fade-up opacity-0 cursor-default overflow-hidden"
      style={{ animationDelay: delay, animationFillMode: 'forwards' }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Hover glow */}
      <div
        className="absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"
        style={{ background: `radial-gradient(circle at 50% 0%, ${color}15 0%, transparent 70%)` }}
      />

      <div className="relative">
        <div
          className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl mb-5
            group-hover:scale-110 group-hover:rotate-3 transition-all duration-300"
          style={{ background: color + '15' }}
        >
          <span className={`transition-transform duration-300 inline-block ${hovered ? 'scale-125' : ''}`}>
            {emoji}
          </span>
        </div>
        <h3 className="text-lg font-bold font-display text-zinc-900 dark:text-white mb-2">
          {title}
        </h3>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed mb-4">
          {desc}
        </p>

        {/* Stat pill - dopamine: seeing progress/numbers */}
        {stat && (
          <div className="flex items-center gap-2">
            <div className="h-1.5 flex-1 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-1000 ease-out"
                style={{
                  width: hovered ? stat + '%' : '0%',
                  background: `linear-gradient(90deg, ${color}, ${color}aa)`,
                }}
              />
            </div>
            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
              {statLabel}
            </span>
          </div>
        )}
      </div>
    </div>
  )
}



// ── Floating stat pill (attention reward) ──
function StatPill({ emoji, value, label, delay, className = '' }) {
  return (
    <div
      className={`absolute bg-white/95 dark:bg-[var(--dark-card)]/95 backdrop-blur-md
        rounded-2xl px-4 py-3 shadow-xl border border-zinc-100/80 dark:border-white/8
        animate-fade-up opacity-0 flex items-center gap-3 whitespace-nowrap
        hover:scale-105 transition-transform duration-200 ${className}`}
      style={{ animationDelay: delay, animationFillMode: 'forwards' }}
    >
      <span className="text-2xl">{emoji}</span>
      <div>
        <p className="text-base font-bold font-display text-zinc-900 dark:text-white leading-none">{value}</p>
        <p className="text-[10px] text-zinc-400 font-medium mt-0.5">{label}</p>
      </div>
    </div>
  )
}

// ══════════════════════════════════════════════════════
//  Main Landing
// ══════════════════════════════════════════════════════

export function LandingPage() {
  const { session } = useAuthContext()
  const navigate = useNavigate()
  const [scrolled, setScrolled] = useState(false)
  const [heroVisible, setHeroVisible] = useState(false)

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', fn)
    return () => window.removeEventListener('scroll', fn)
  }, [])

  useEffect(() => {
    const timer = setTimeout(() => setHeroVisible(true), 100)
    return () => clearTimeout(timer)
  }, [])

  if (session) return <Navigate to="/dashboard" replace />

  return (
    <div className="min-h-screen bg-[var(--cream-soft)] dark:bg-[var(--dark-bg)] text-zinc-900 dark:text-zinc-50 overflow-x-hidden">

      {/* ── NAV ── */}
      <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-white/90 dark:bg-[var(--dark-surface)]/90 backdrop-blur-xl shadow-sm border-b border-zinc-100/80 dark:border-white/6'
          : ''
      }`}>
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="relative">
              <div className="absolute inset-0 bg-[var(--mango)] blur-md opacity-40 rounded-full" />
              <img src="/Mango.png" alt="Manguito" className="relative w-8 h-8 object-contain" />
            </div>
            <span className="text-xl font-bold font-display text-gradient-mango">
              Manguito
            </span>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/login"
              className="text-sm font-semibold text-zinc-600 dark:text-zinc-300
                hover:text-[var(--mango-dark)] dark:hover:text-[var(--mango)] transition-colors"
            >
              Entrar
            </Link>
            <Button onClick={() => navigate('/registro')} tamaño="sm">
              Empezar gratis
            </Button>
          </div>
        </div>
      </header>

      {/* ── HERO ── */}
      <AnimatedHero />

      {/* ── TRUST BANNER (dopamine: validation from authority) ── */}
      <section className="py-8 border-y border-zinc-100/60 dark:border-white/[0.04] bg-white/40 dark:bg-white/[0.02]">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex flex-wrap items-center justify-center gap-8 md:gap-14">
            {[
              { icon: '🔒', text: 'Encriptación bancaria' },
              { icon: '🇦🇷', text: 'Hecho en Argentina' },
              { icon: '⚡', text: '99.9% uptime' },
              { icon: '🛡️', text: 'Datos protegidos' },
              { icon: '💳', text: 'Sin tarjeta requerida' },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-2 text-sm font-medium text-zinc-400 dark:text-zinc-500
                hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors duration-200">
                <span className="text-lg">{item.icon}</span>
                {item.text}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURES (gamified cards with progress indicators) ── */}
      <section id="features" className="py-32 relative">
        <div className="max-w-6xl mx-auto px-6">

          {/* Section header */}
          <div className="text-center max-w-2xl mx-auto mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full
              bg-zinc-100/80 dark:bg-white/5 border border-zinc-200/60 dark:border-white/8
              text-xs font-bold uppercase tracking-widest text-zinc-500 dark:text-zinc-400 mb-6">
              Todo lo que necesitás
            </div>
            <h2 className="text-4xl md:text-5xl font-black font-display text-zinc-900 dark:text-white mb-4 leading-tight">
              Finanzas simples,<br />
              <span className="text-gradient-gold">resultados reales</span>
            </h2>
            <p className="text-zinc-500 dark:text-zinc-400 text-lg leading-relaxed">
              Herramientas diseñadas para el contexto argentino. Sin complicaciones.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <FeatureCard
              emoji="📊"
              title="Presupuestos inteligentes"
              desc="Definí límites por categoría y recibí alertas en tiempo real antes de que se te vaya de las manos."
              color="#F59E0B"
              stat={78}
              statLabel="control"
              delay="100ms"
            />
            <FeatureCard
              emoji="🎯"
              title="Metas de ahorro"
              desc="Visualizá tu progreso hacia cada objetivo con barras animadas y aportes incrementales."
              color="#10B981"
              stat={65}
              statLabel="progreso"
              delay="200ms"
            />
            <FeatureCard
              emoji="🤖"
              title="IA Financiera"
              desc="ManguitoAI analiza tus finanzas y te da un diagnóstico personalizado con consejos accionables."
              color="#8B5CF6"
              stat={92}
              statLabel="precisión"
              delay="300ms"
            />
            <FeatureCard
              emoji="📈"
              title="Inversiones en vivo"
              desc="Seguí tus CEDEARs, acciones y cripto con precios en tiempo real directo de Yahoo Finance y CoinGecko."
              color="#3B82F6"
              stat={88}
              statLabel="cobertura"
              delay="400ms"
            />
            <FeatureCard
              emoji="💱"
              title="Cotizaciones del dólar"
              desc="Blue, MEP, CCL, oficial y todas las divisas actualizadas al minuto con conversor integrado."
              color="#F97316"
              stat={100}
              statLabel="en vivo"
              delay="500ms"
            />
            <FeatureCard
              emoji="📱"
              title="Control de suscripciones"
              desc="Catálogo completo con precios reales por método de pago actualizados por la comunidad."
              color="#EC4899"
              stat={45}
              statLabel="ahorro"
              delay="600ms"
            />
          </div>
        </div>
      </section>



      {/* ── PLANS ── */}
      <section className="py-28 relative">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-zinc-200/60 dark:via-white/8 to-transparent" />
        </div>
        <div className="max-w-4xl mx-auto px-6">
          <div className="text-center mb-14">
            <h2 className="text-4xl font-black font-display text-zinc-900 dark:text-white mb-3">
              Planes para todos
            </h2>
            <p className="text-zinc-500 dark:text-zinc-400 text-lg">
              Empezá gratis y crecé cuando estés listo.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 items-stretch">
            {/* Free */}
            <div className="bg-white dark:bg-[var(--dark-card)] rounded-3xl p-8
              border border-zinc-100/80 dark:border-white/6 flex flex-col
              hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
              <div className="mb-6">
                <div className="w-12 h-12 rounded-2xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-2xl mb-4">
                  🌱
                </div>
                <h3 className="text-xl font-bold font-display text-zinc-900 dark:text-white">Básico</h3>
                <div className="mt-3 flex items-baseline gap-1">
                  <span className="text-4xl font-black font-display text-zinc-900 dark:text-white">Gratis</span>
                </div>
              </div>
              <ul className="flex-1 space-y-3 mb-8">
                {['Movimientos ilimitados','Hasta 3 presupuestos','1 Meta de ahorro','Balance mensual'].map(f => (
                  <li key={f} className="flex items-center gap-2.5 text-sm text-zinc-500 dark:text-zinc-400 font-medium">
                    <span className="w-5 h-5 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-[10px] text-emerald-600 flex-shrink-0">✓</span>
                    {f}
                  </li>
                ))}
              </ul>
              <Button variante="secondary" onClick={() => navigate('/registro')} className="w-full py-3.5">
                Empezar gratis
              </Button>
            </div>

            {/* Pro — with urgency */}
            <div className="relative rounded-3xl p-8 flex flex-col overflow-hidden group
              hover:-translate-y-1 transition-all duration-300"
              style={{ background: 'var(--gradient-mango)' }}>
              {/* Animated shine */}
              <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-0 -left-full w-full h-full bg-gradient-to-r from-transparent via-white/10 to-transparent
                  group-hover:left-full transition-all duration-1000 ease-out" />
              </div>
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 pointer-events-none" />
              
              <span className="absolute top-4 right-4 bg-white/20 text-white text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-wider
                animate-pulse-subtle">
                ⭐ Recomendado
              </span>

              <div className="mb-6 relative">
                <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center text-2xl mb-4">
                  🥭
                </div>
                <h3 className="text-xl font-bold font-display text-white">Pro</h3>
                <div className="mt-3 flex items-baseline gap-1">
                  <span className="text-4xl font-black font-display text-white">$100</span>
                  <span className="text-white/70 font-medium">/mes</span>
                </div>
                <p className="text-white/60 text-xs font-medium mt-1">
                  🔥 Precio de lanzamiento — luego $250/mes
                </p>
              </div>

              <ul className="flex-1 space-y-3 mb-8 relative">
                {[
                  { t: 'IA Financiera ilimitada', star: true },
                  { t: 'Presupuestos y metas ilimitadas' },
                  { t: 'Cotizaciones en tiempo real' },
                  { t: 'Exportar datos a CSV' },
                  { t: 'Reportes avanzados' },
                ].map(f => (
                  <li key={f.t} className={`flex items-center gap-2.5 text-sm font-semibold ${f.star ? 'text-white' : 'text-white/80'}`}>
                    <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] flex-shrink-0 ${f.star ? 'bg-white text-amber-600' : 'bg-white/20 text-white'}`}>
                      {f.star ? '★' : '✓'}
                    </span>
                    {f.t}
                  </li>
                ))}
              </ul>

              <button
                onClick={() => navigate('/registro')}
                className="relative w-full py-3.5 rounded-2xl bg-white text-[var(--mango-dark)]
                  text-sm font-bold hover:bg-[var(--cream)] transition-all
                  shadow-[0_4px_20px_rgba(0,0,0,0.15)] hover:shadow-[0_6px_28px_rgba(0,0,0,0.2)]
                  hover:-translate-y-0.5 active:translate-y-0"
              >
                Probar Pro ahora →
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ── FINAL CTA (urgency + dopamine) ── */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <GradientOrb
            className="top-[-30%] left-[10%] opacity-20"
            color1="rgba(245,166,35,0.35)"
            color2="rgba(245,166,35,0)"
            size={500}
          />
          <GradientOrb
            className="bottom-[-30%] right-[10%] opacity-15"
            color1="rgba(16,185,129,0.25)"
            color2="rgba(16,185,129,0)"
            size={400}
          />
        </div>

        <div className="relative max-w-3xl mx-auto px-6 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full
            bg-emerald-50 dark:bg-emerald-900/15 border border-emerald-200/60 dark:border-emerald-800/20
            text-xs font-bold text-emerald-600 dark:text-emerald-400 mb-6">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            Registro gratuito — sin tarjeta
          </div>
          <h2 className="text-4xl md:text-5xl font-black font-display text-zinc-900 dark:text-white mb-4 leading-tight">
            ¿Y si hoy fuera el día que<br />
            <span className="text-gradient-gold">todo cambia?</span>
          </h2>
          <p className="text-lg text-zinc-500 dark:text-zinc-400 font-medium mb-8 max-w-xl mx-auto">
            Cada peso cuenta. Cada decisión también. Dale a tu plata el respeto que se merece.
          </p>
          <Button
            onClick={() => navigate('/registro')}
            className="text-lg px-10 py-5 rounded-2xl font-bold
              shadow-[0_8px_32px_rgba(245,166,35,0.4)] hover:shadow-[0_16px_48px_rgba(245,166,35,0.5)]
              hover:scale-[1.03] transition-all duration-300"
          >
            🚀 Crear mi cuenta gratis
          </Button>
          <p className="text-sm text-zinc-400 mt-4 font-medium">
            Se crea en 30 segundos · Sin compromisos
          </p>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="py-12 border-t border-zinc-100/80 dark:border-white/6">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2.5">
              <img src="/Mango.png" alt="Manguito" className="w-7 h-7 object-contain" />
              <span className="font-bold font-display text-gradient-mango">Manguito</span>
            </div>
            <p className="text-sm text-zinc-400 dark:text-zinc-500 font-medium">
              Hecho con ❤️ en Argentina · {new Date().getFullYear()}
            </p>
            <div className="flex items-center gap-4 text-sm font-medium text-zinc-500">
              <Link to="/login" className="hover:text-[var(--mango-dark)] dark:hover:text-[var(--mango)] transition-colors">Entrar</Link>
              <Link to="/registro" className="hover:text-[var(--mango-dark)] dark:hover:text-[var(--mango)] transition-colors">Registrarse</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}