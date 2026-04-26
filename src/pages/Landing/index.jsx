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
      <section className="relative min-h-screen flex items-center pt-16 overflow-hidden">
        {/* Animated background */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <GradientOrb
            className="top-[-15%] left-[-8%] opacity-25"
            color1="rgba(245,166,35,0.4)"
            color2="rgba(245,166,35,0)"
            size={700}
          />
          <GradientOrb
            className="bottom-[-15%] right-[-8%] opacity-15 animation-delay-2000"
            color1="rgba(16,185,129,0.3)"
            color2="rgba(16,185,129,0)"
            size={600}
          />
          <GradientOrb
            className="top-[40%] left-[50%] -translate-x-1/2 opacity-10 animation-delay-4000"
            color1="rgba(251,191,36,0.25)"
            color2="rgba(251,191,36,0)"
            size={900}
          />
        </div>

        <FloatingParticles />

        <div className="relative max-w-6xl mx-auto px-6 w-full py-16">
          <div className="grid lg:grid-cols-2 gap-16 items-center">

            {/* Left: Copy */}
            <div className="space-y-8">
              {/* App badge */}
              <div
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-full
                  bg-[var(--mango)]/12 border border-[var(--mango)]/25
                  text-[var(--mango-dark)] dark:text-[var(--mango)]
                  text-xs font-bold uppercase tracking-widest
                  transition-all duration-700 ${heroVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
              >
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[var(--mango)] opacity-75" />
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[var(--mango)]" />
                </span>
                100% gratuito · Hecho en Argentina 🇦🇷
              </div>

              {/* Headline with staggered reveal */}
              <div
                className={`transition-all duration-700 delay-100 ${heroVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}
              >
                <h1 className="font-display text-5xl md:text-6xl lg:text-7xl font-black leading-[1.02] tracking-tight">
                  <span className="text-zinc-900 dark:text-white">Tu plata,</span>
                  <br />
                  <div className="flex items-center text-zinc-900 dark:text-white mt-1">
                    <span className="mr-3 md:mr-4">tu</span>
                    <AnimatedHero />
                  </div>
                </h1>
              </div>

              {/* Subheadline */}
              <p
                className={`text-lg text-zinc-500 dark:text-zinc-400 leading-relaxed max-w-lg
                  font-medium transition-all duration-700 delay-200 ${heroVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}
              >
                Registrá gastos, armá presupuestos, invertí con confianza y dejá que la
                IA te dé consejos personalizados para cada situación.
              </p>

              {/* CTA Buttons */}
              <div
                className={`flex flex-col sm:flex-row gap-3 transition-all duration-700 delay-300 ${heroVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}
              >
                <Button
                  onClick={() => navigate('/registro')}
                  className="text-base px-8 py-4 rounded-2xl font-bold shadow-[0_8px_32px_rgba(245,166,35,0.4)]
                    hover:shadow-[0_12px_48px_rgba(245,166,35,0.5)] hover:scale-[1.02] transition-all duration-300"
                >
                  ✨ Empezar gratis — 30 seg
                </Button>
                <button
                  onClick={() => document.getElementById('features').scrollIntoView({ behavior: 'smooth' })}
                  className="flex items-center justify-center gap-2 px-8 py-4 rounded-2xl
                    text-base font-semibold text-zinc-600 dark:text-zinc-300
                    bg-white/80 dark:bg-white/5 backdrop-blur-sm
                    border border-zinc-200/80 dark:border-white/8
                    hover:border-[var(--mango)]/30 hover:text-[var(--mango-dark)]
                    dark:hover:text-[var(--mango)] transition-all duration-300
                    hover:shadow-md"
                >
                  Ver funciones
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M8 3v10M3 8l5 5 5-5"/>
                  </svg>
                </button>
              </div>


            </div>

            {/* Right: Dashboard mockup */}
            <div className="relative hidden lg:block">
              {/* Main card */}
              <div
                className={`relative rounded-3xl bg-white dark:bg-[var(--dark-card)]
                  shadow-2xl border border-zinc-100/80 dark:border-white/8 p-6
                  transition-all duration-1000 delay-300 ${heroVisible ? 'opacity-100 translate-y-0 rotate-0' : 'opacity-0 translate-y-12 rotate-1'}`}
              >
                {/* Header mockup */}
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <p className="text-xs text-zinc-400 font-medium mb-1">Balance del mes</p>
                    <p className="text-3xl font-black font-display text-zinc-900 dark:text-white">
                      $<AnimatedCounter end={420500} duration={3000} delay={800} />
                    </p>
                    <div className="flex items-center gap-1.5 mt-1">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-900/20 text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                        ↗ +12.3%
                      </span>
                      <span className="text-[10px] text-zinc-400">vs mes anterior</span>
                    </div>
                  </div>
                  <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center text-xl
                    animate-pulse-subtle">
                    📈
                  </div>
                </div>

                {/* Stats row */}
                <div className="grid grid-cols-2 gap-3 mb-5">
                  <div className="bg-emerald-50 dark:bg-emerald-900/15 rounded-2xl p-3.5 border border-emerald-100/60 dark:border-emerald-800/30
                    hover:scale-[1.02] transition-transform duration-200">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 mb-1">Ingresos</p>
                    <p className="text-lg font-black font-display text-emerald-700 dark:text-emerald-400">
                      $<AnimatedCounter end={850} suffix="K" duration={2000} delay={1200} />
                    </p>
                  </div>
                  <div className="bg-red-50 dark:bg-red-900/15 rounded-2xl p-3.5 border border-red-100/60 dark:border-red-800/30
                    hover:scale-[1.02] transition-transform duration-200">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-red-600 dark:text-red-400 mb-1">Gastos</p>
                    <p className="text-lg font-black font-display text-red-700 dark:text-red-400">
                      $<AnimatedCounter end={429} suffix="K" duration={2000} delay={1400} />
                    </p>
                  </div>
                </div>

                {/* Animated chart bars */}
                <div className="flex items-end gap-1 h-16 mb-4">
                  {[40,65,45,80,55,95,70,88,60,75,90,100].map((h, i) => (
                    <div key={i} className="flex-1 rounded-sm transition-all duration-1000 ease-out"
                      style={{
                        height: heroVisible ? `${h}%` : '5%',
                        transitionDelay: `${1500 + i * 80}ms`,
                        background: i === 11
                          ? 'var(--gradient-mango)'
                          : i % 2 === 0
                            ? 'rgba(16,185,129,0.25)'
                            : 'rgba(239,68,68,0.2)',
                      }} />
                  ))}
                </div>

                {/* Movements */}
                {[
                  { cat: '🛒', name: 'Supermercado', amount: '-$12.400', color: 'text-red-500' },
                  { cat: '💰', name: 'Sueldo', amount: '+$285.000', color: 'text-emerald-600' },
                  { cat: '🚗', name: 'Nafta', amount: '-$8.200', color: 'text-red-500' },
                ].map((m, i) => (
                  <div key={i} className="flex items-center gap-3 py-2.5 border-b border-zinc-50 dark:border-zinc-700/40 last:border-0
                    hover:bg-zinc-50/50 dark:hover:bg-white/[0.02] rounded-lg px-1 -mx-1 transition-colors duration-200">
                    <div className="w-9 h-9 rounded-xl bg-zinc-100 dark:bg-zinc-700/50 flex items-center justify-center text-base">
                      {m.cat}
                    </div>
                    <p className="flex-1 text-sm font-medium text-zinc-700 dark:text-zinc-300">{m.name}</p>
                    <p className={`text-sm font-bold ${m.color}`}>{m.amount}</p>
                  </div>
                ))}
              </div>

              {/* Floating pills with enhanced animations */}
              <div className="absolute -left-14 top-[20%]">
                <StatPill emoji="📊" value="87%" label="Tasa de ahorro" delay="800ms" />
              </div>
              <div className="absolute -right-10 bottom-[20%]">
                <StatPill emoji="🎯" value="3 metas" label="Completadas" delay="1000ms" />
              </div>
              <div className="absolute -top-8 right-[20%]">
                <StatPill emoji="🤖" value="IA activa" label="Análisis listo" delay="1200ms" />
              </div>
            </div>

          </div>
        </div>
      </section>

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