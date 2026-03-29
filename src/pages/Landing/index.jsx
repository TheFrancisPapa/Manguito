import { Link, Navigate, useNavigate } from 'react-router-dom'
import { useAuthContext } from '../../context/AuthContext'
import { Button } from '../../components/ui'
import { useState, useEffect } from 'react'

// Floating stat pill
function StatPill({ emoji, value, label, delay }) {
  return (
    <div
      className="absolute bg-white/95 dark:bg-[var(--dark-card)]/95 backdrop-blur-md
        rounded-2xl px-4 py-3 shadow-xl border border-zinc-100/80 dark:border-white/8
        animate-fade-up opacity-0 flex items-center gap-3 whitespace-nowrap"
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

// Feature card
function FeatureCard({ emoji, title, desc, color, delay }) {
  return (
    <div
      className="group relative bg-white dark:bg-[var(--dark-card)] rounded-3xl p-6
        border border-zinc-100/80 dark:border-white/6
        hover:shadow-xl hover:-translate-y-1 transition-all duration-300
        animate-fade-up opacity-0"
      style={{ animationDelay: delay, animationFillMode: 'forwards' }}
    >
      <div
        className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl mb-5
          group-hover:scale-110 transition-transform duration-200"
        style={{ background: color + '18' }}
      >
        {emoji}
      </div>
      <h3 className="text-lg font-bold font-display text-zinc-900 dark:text-white mb-2">
        {title}
      </h3>
      <p className="text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed">
        {desc}
      </p>
    </div>
  )
}

export function LandingPage() {
  const { session } = useAuthContext()
  const navigate = useNavigate()
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', fn)
    return () => window.removeEventListener('scroll', fn)
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
        {/* Background blobs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-[-10%] left-[-5%] w-[600px] h-[600px]
            bg-[var(--mango)]/20 rounded-full blur-[120px] animate-blob" />
          <div className="absolute bottom-[-10%] right-[-5%] w-[500px] h-[500px]
            bg-emerald-400/10 rounded-full blur-[100px] animate-blob animation-delay-2000" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px]
            bg-amber-300/8 rounded-full blur-[100px]" />
        </div>

        <div className="relative max-w-6xl mx-auto px-6 w-full py-16">
          <div className="grid lg:grid-cols-2 gap-16 items-center">

            {/* Left: Copy */}
            <div className="space-y-8">
              {/* Badge */}
              <div
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full
                  bg-[var(--mango)]/12 border border-[var(--mango)]/25
                  text-[var(--mango-dark)] dark:text-[var(--mango)]
                  text-xs font-bold uppercase tracking-widest
                  animate-fade-up opacity-0"
                style={{ animationDelay: '100ms', animationFillMode: 'forwards' }}
              >
                <span className="w-2 h-2 rounded-full bg-[var(--mango)] animate-pulse" />
                Finanzas con sabor argentino 🥭
              </div>

              {/* Headline */}
              <div
                className="animate-fade-up opacity-0"
                style={{ animationDelay: '200ms', animationFillMode: 'forwards' }}
              >
                <h1 className="font-display text-5xl md:text-6xl lg:text-7xl font-black leading-[1.02] tracking-tight">
                  <span className="text-zinc-900 dark:text-white">Tu plata,</span>
                  <br />
                  <span className="text-gradient-gold">tu control.</span>
                  <br />
                  <span className="text-zinc-900 dark:text-white">Tu futuro.</span>
                </h1>
              </div>

              {/* Subheadline */}
              <p
                className="text-lg text-zinc-500 dark:text-zinc-400 leading-relaxed max-w-lg
                  animate-fade-up opacity-0 font-medium"
                style={{ animationDelay: '300ms', animationFillMode: 'forwards' }}
              >
                Registrá gastos, armá presupuestos, invertí con confianza y dejá que la
                IA te dé consejos personalizados para cada situación.
              </p>

              {/* CTA Buttons */}
              <div
                className="flex flex-col sm:flex-row gap-3 animate-fade-up opacity-0"
                style={{ animationDelay: '400ms', animationFillMode: 'forwards' }}
              >
                <Button
                  onClick={() => navigate('/registro')}
                  className="text-base px-8 py-4 rounded-2xl font-bold shadow-[0_8px_32px_rgba(245,166,35,0.4)]"
                >
                  ✨ Empezar gratis
                </Button>
                <button
                  onClick={() => document.getElementById('features').scrollIntoView({ behavior: 'smooth' })}
                  className="flex items-center justify-center gap-2 px-8 py-4 rounded-2xl
                    text-base font-semibold text-zinc-600 dark:text-zinc-300
                    bg-white/80 dark:bg-white/5 backdrop-blur-sm
                    border border-zinc-200/80 dark:border-white/8
                    hover:border-[var(--mango)]/30 hover:text-[var(--mango-dark)]
                    dark:hover:text-[var(--mango)] transition-all"
                >
                  Ver funciones
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M8 3v10M3 8l5 5 5-5"/>
                  </svg>
                </button>
              </div>

              {/* Social proof */}
              <div
                className="flex items-center gap-4 animate-fade-up opacity-0"
                style={{ animationDelay: '500ms', animationFillMode: 'forwards' }}
              >
                <div className="flex -space-x-2">
                  {['🧑','👩','👨','👱','🧔'].map((e, i) => (
                    <div key={i} className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-400 to-orange-500
                      flex items-center justify-center text-sm border-2 border-white dark:border-[var(--dark-bg)]">
                      {e}
                    </div>
                  ))}
                </div>
                <p className="text-sm text-zinc-500 dark:text-zinc-400 font-medium">
                  +2.400 usuarios ya controlan su plata
                </p>
              </div>
            </div>

            {/* Right: Dashboard mockup */}
            <div className="relative hidden lg:block">
              {/* Main card */}
              <div
                className="relative rounded-3xl bg-white dark:bg-[var(--dark-card)]
                  shadow-2xl border border-zinc-100/80 dark:border-white/8 p-6
                  animate-fade-up opacity-0"
                style={{ animationDelay: '300ms', animationFillMode: 'forwards' }}
              >
                {/* Header mockup */}
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <p className="text-xs text-zinc-400 font-medium mb-1">Balance del mes</p>
                    <p className="text-3xl font-black font-display text-zinc-900 dark:text-white">
                      $420.500
                    </p>
                  </div>
                  <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center text-xl">
                    📈
                  </div>
                </div>

                {/* Stats row */}
                <div className="grid grid-cols-2 gap-3 mb-5">
                  <div className="bg-emerald-50 dark:bg-emerald-900/15 rounded-2xl p-3.5 border border-emerald-100/60 dark:border-emerald-800/30">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 mb-1">Ingresos</p>
                    <p className="text-lg font-black font-display text-emerald-700 dark:text-emerald-400">$850K</p>
                  </div>
                  <div className="bg-red-50 dark:bg-red-900/15 rounded-2xl p-3.5 border border-red-100/60 dark:border-red-800/30">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-red-600 dark:text-red-400 mb-1">Gastos</p>
                    <p className="text-lg font-black font-display text-red-700 dark:text-red-400">$429K</p>
                  </div>
                </div>

                {/* Mini chart bars */}
                <div className="flex items-end gap-1 h-16 mb-4">
                  {[40,65,45,80,55,95,70,88,60,75,90,100].map((h, i) => (
                    <div key={i} className="flex-1 rounded-sm transition-all" style={{
                      height: `${h}%`,
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
                  <div key={i} className="flex items-center gap-3 py-2.5 border-b border-zinc-50 dark:border-zinc-700/40 last:border-0">
                    <div className="w-9 h-9 rounded-xl bg-zinc-100 dark:bg-zinc-700/50 flex items-center justify-center text-base">
                      {m.cat}
                    </div>
                    <p className="flex-1 text-sm font-medium text-zinc-700 dark:text-zinc-300">{m.name}</p>
                    <p className={`text-sm font-bold ${m.color}`}>{m.amount}</p>
                  </div>
                ))}
              </div>

              {/* Floating pills */}
              <div className="absolute -left-12 top-1/4">
                <StatPill emoji="📊" value="87%" label="Tasa de ahorro" delay="600ms" />
              </div>
              <div className="absolute -right-8 bottom-1/4">
                <StatPill emoji="₿" value="U$D 1.240" label="Cartera crypto" delay="700ms" />
              </div>
              <div className="absolute -top-6 right-1/4">
                <StatPill emoji="🎯" value="60%" label="Meta alcanzada" delay="800ms" />
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ── FEATURES ── */}
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
              delay="100ms"
            />
            <FeatureCard
              emoji="🎯"
              title="Metas de ahorro"
              desc="Visualizá tu progreso hacia cada objetivo con barras animadas y aportes incrementales."
              color="#10B981"
              delay="200ms"
            />
            <FeatureCard
              emoji="🤖"
              title="IA Financiera"
              desc="ManguitoAI analiza tus finanzas y te da un diagnóstico personalizado con consejos accionables."
              color="#8B5CF6"
              delay="300ms"
            />
            <FeatureCard
              emoji="📈"
              title="Inversiones en vivo"
              desc="Seguí tus CEDEARs, acciones y cripto con precios en tiempo real directo de Yahoo Finance y CoinGecko."
              color="#3B82F6"
              delay="400ms"
            />
            <FeatureCard
              emoji="💱"
              title="Cotizaciones del dólar"
              desc="Blue, MEP, CCL, oficial y todas las divisas actualizadas al minuto con conversor integrado."
              color="#F97316"
              delay="500ms"
            />
            <FeatureCard
              emoji="📱"
              title="Control de suscripciones"
              desc="Catálogo completo con precios reales por método de pago actualizados por la comunidad."
              color="#EC4899"
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
              border border-zinc-100/80 dark:border-white/6 flex flex-col">
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
                    <span className="w-5 h-5 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-[10px] flex-shrink-0">✓</span>
                    {f}
                  </li>
                ))}
              </ul>
              <Button variante="secondary" onClick={() => navigate('/registro')} className="w-full py-3.5">
                Empezar gratis
              </Button>
            </div>

            {/* Pro */}
            <div className="relative rounded-3xl p-8 flex flex-col overflow-hidden"
              style={{ background: 'var(--gradient-mango)' }}>
              {/* Shine effect */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 pointer-events-none" />
              
              <span className="absolute top-4 right-4 bg-white/20 text-white text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-wider">
                ⭐ Recomendado
              </span>

              <div className="mb-6">
                <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center text-2xl mb-4">
                  🥭
                </div>
                <h3 className="text-xl font-bold font-display text-white">Pro</h3>
                <div className="mt-3 flex items-baseline gap-1">
                  <span className="text-4xl font-black font-display text-white">$100</span>
                  <span className="text-white/70 font-medium">/mes</span>
                </div>
              </div>

              <ul className="flex-1 space-y-3 mb-8">
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
                className="w-full py-3.5 rounded-2xl bg-white text-[var(--mango-dark)]
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