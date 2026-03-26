import { Link, Navigate, useNavigate } from 'react-router-dom'
import { useAuthContext } from '../../context/AuthContext'
import { Button, Card } from '../../components/ui'
import { Header } from '../../components/layout/Header'

export function LandingPage() {
  const { session } = useAuthContext()
  const navigate = useNavigate()

  if (session) {
    return <Navigate to="/dashboard" replace />
  }

  return (
    <div className="min-h-screen bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-50 flex flex-col font-sans selection:bg-[var(--mango)] selection:text-zinc-900 overflow-x-hidden">
      
      <Header />

      <main className="flex-1">
        
        {/* 1. SECCIÓN HÉROE */}
        <section className="relative pt-20 pb-32 overflow-hidden">
          {/* Fondo Decorativo */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-full opacity-30 pointer-events-none">
            <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-[var(--mango)]/20 rounded-full blur-[120px] animate-pulse" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-[var(--primary-vibrant)]/10 rounded-full blur-[120px]" />
          </div>

          <div className="container mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center relative z-10">
            <div className="text-center lg:text-left space-y-8 animate-in fade-in slide-in-from-left-8 duration-1000">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[var(--primary-soft)] dark:bg-[var(--primary-vibrant)]/10 text-[var(--leaf)] dark:text-[var(--primary-vibrant)] text-xs font-black uppercase tracking-widest border border-[var(--primary-vibrant)]/20">
                🚀 Finanzas con sabor argentino
              </div>
              <h1 className="text-5xl md:text-7xl font-black tracking-tight leading-[1.1] text-[var(--charcoal)] dark:text-white">
                Tu Dinero, <br />
                Tu Futuro. <br />
                <span className="text-[var(--mango-dark)] dark:text-[var(--mango)]">Transformá</span> tus finanzas.
              </h1>
              <p className="text-xl text-zinc-500 dark:text-zinc-400 max-w-xl mx-auto lg:mx-0 leading-relaxed font-medium">
                Manguito es la forma más simple de ahorrar, invertir y tomar control total de tu plata con el poder de la Inteligencia Artificial.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <Button 
                  onClick={() => navigate('/registro')} 
                  className="text-lg px-10 py-5 shadow-2xl shadow-[var(--mango)]/30 hover:scale-105 transition-transform font-black"
                >
                  EMPEZÁ GRATIS HOY
                </Button>
                <Button 
                  variante="secondary" 
                  onClick={() => document.getElementById('benefits').scrollIntoView({ behavior: 'smooth'})} 
                  className="text-lg px-10 py-5 bg-white dark:bg-zinc-900 border-2 font-black"
                >
                  VER FUNCIONES
                </Button>
              </div>
            </div>

            <div className="relative animate-in fade-in slide-in-from-right-8 duration-1000 delay-300">
              <div className="relative z-10 p-4 lg:p-0">
                <img 
                  src="/app-mockup.png" 
                  alt="Manguito App Mockup" 
                  className="w-full max-w-[500px] mx-auto drop-shadow-[0_35px_35px_rgba(0,0,0,0.15)] dark:drop-shadow-[0_35px_35px_rgba(255,255,255,0.05)] rounded-[3rem] animate-float" 
                />
              </div>
              {/* Elementos decorativos flotantes */}
              <div className="absolute top-1/2 -left-10 lg:-left-20 bg-white dark:bg-zinc-800 p-6 rounded-3xl shadow-2xl border border-zinc-100 dark:border-zinc-700 animate-float animation-delay-1000 hidden md:block">
                <div className="text-sm font-black text-zinc-400 mb-1 uppercase tracking-tighter">Ahorro Mensual</div>
                <div className="text-3xl font-black text-[var(--leaf)]">$125.400</div>
              </div>
              <div className="absolute bottom-10 -right-5 lg:-right-10 bg-[var(--primary-vibrant)] p-6 rounded-3xl shadow-2xl animate-float animation-delay-2000 hidden md:block">
                <span className="text-3xl">🥭</span>
              </div>
            </div>
          </div>
        </section>

        {/* 2. SECCIÓN DE BENEFICIOS */}
        <section id="benefits" className="py-32 bg-zinc-50 dark:bg-zinc-900/50 relative">
          <div className="container mx-auto px-6">
            <div className="text-center max-w-3xl mx-auto mb-20 space-y-4">
              <h2 className="text-4xl md:text-5xl font-black text-[var(--charcoal)] dark:text-white tracking-tight">
                Controlá tus manguitos sin esfuerzo
              </h2>
              <p className="text-lg text-zinc-500 font-medium">
                Diseñamos cada función para que sea simple, rápida y potente.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <Card className="hover:border-[var(--primary-vibrant)]/30 transition-colors">
                <div className="w-16 h-16 bg-[var(--primary-soft)] dark:bg-[var(--primary-vibrant)]/10 rounded-2xl flex items-center justify-center text-3xl mb-8 border border-[var(--primary-vibrant)]/20 shadow-sm">
                  📊
                </div>
                <h3 className="text-2xl font-black mb-4">Presupuestos</h3>
                <p className="text-zinc-500 font-medium leading-relaxed">
                  Ponete límites por categoría y recibí alertas antes de que se te vaya la mano. Control real en tiempo real.
                </p>
              </Card>

              <Card className="hover:border-[var(--primary-vibrant)]/30 transition-colors scale-105 shadow-2xl z-10 border-[var(--mango)]/20">
                <div className="w-16 h-16 bg-amber-50 dark:bg-amber-500/10 rounded-2xl flex items-center justify-center text-3xl mb-8 border border-amber-200 shadow-sm">
                  🎯
                </div>
                <h3 className="text-2xl font-black mb-4">Metas Pro</h3>
                <p className="text-zinc-500 font-medium leading-relaxed">
                  Ahorrar para el viaje o el auto ahora es visual. Sumá aportes y mirá cómo crecen tus objetivos personales.
                </p>
              </Card>

              <Card className="hover:border-[var(--primary-vibrant)]/30 transition-colors">
                <div className="w-16 h-16 bg-emerald-50 dark:bg-emerald-500/10 rounded-2xl flex items-center justify-center text-3xl mb-8 border border-emerald-200 shadow-sm">
                  🤖
                </div>
                <h3 className="text-2xl font-black mb-4">IA Financiera</h3>
                <p className="text-zinc-500 font-medium leading-relaxed">
                  Chateá con ManguitoAI para sacarte dudas sobre inversiones, dólar o simplemente cómo mejorar tus ahorros.
                </p>
              </Card>
            </div>
          </div>
        </section>

        {/* 3. SECCIÓN DE PLANES */}
        <section className="py-32 container mx-auto px-6">
          <div className="text-center mb-16 space-y-4">
            <h2 className="text-4xl font-black text-[var(--charcoal)] dark:text-white tracking-tight">
              El Plan Ideal Para Vos
            </h2>
            <p className="text-lg text-zinc-500 font-medium">Elegí la potencia que necesitás para tus finanzas.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto items-stretch">
            {/* Plan Free */}
            <Card className="flex flex-col border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50">
              <div className="mb-8">
                <div className="w-12 h-12 rounded-2xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-2xl mb-4">🌱</div>
                <h3 className="text-xl font-bold">Básico</h3>
                <div className="text-4xl font-black mt-4">Gratis</div>
              </div>
              <ul className="flex-1 space-y-4 mb-10 text-zinc-500 font-medium text-sm">
                <li>• Movimientos ilimitados</li>
                <li>• Hasta 3 presupuestos</li>
                <li>• 1 Meta de ahorro</li>
              </ul>
              <Button variante="secondary" onClick={() => navigate('/registro')} className="w-full font-black border-2 py-4">
                EMPEZAR GRATIS
              </Button>
            </Card>

            {/* Plan Pro */}
            <Card className="flex flex-col border-[var(--primary-vibrant)] dark:border-[var(--primary-vibrant)] shadow-2xl relative overflow-hidden">
              <div className="absolute top-4 right-4 bg-[var(--primary-vibrant)] text-[var(--dark-bg)] text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-tighter">RECOMENDADO</div>
              <div className="mb-8">
                <div className="w-12 h-12 rounded-2xl bg-[var(--primary-soft)] dark:bg-[var(--primary-vibrant)]/20 flex items-center justify-center text-2xl mb-4">🥭</div>
                <h3 className="text-xl font-bold">Manguito Pro</h3>
                <div className="text-4xl font-black mt-4">$100<span className="text-lg font-bold text-zinc-400">/mes</span></div>
              </div>
              <ul className="flex-1 space-y-4 mb-10 text-zinc-600 dark:text-zinc-300 font-bold text-sm">
                <li className="text-[var(--leaf)] dark:text-[var(--primary-vibrant)]">★ Chat con IA Ilimitado</li>
                <li>✓ Presupuestos Ilimitados</li>
                <li>✓ Metas Ilimitadas</li>
                <li>✓ Reportes Avanzados</li>
              </ul>
              <Button onClick={() => navigate('/registro')} className="w-full bg-[var(--primary-vibrant)] hover:bg-[var(--leaf)] text-zinc-900 hover:text-white font-black py-4 border-none shadow-xl shadow-[var(--primary-vibrant)]/20">
                PROBAR PRO AHORA
              </Button>
            </Card>
          </div>
        </section>

      </main>

      {/* Footer Simple */}
      <footer className="py-16 text-center border-t border-zinc-100 dark:border-zinc-800/50 bg-zinc-50 dark:bg-zinc-900/20">
        <div className="container mx-auto px-6">
          <div className="text-2xl font-black tracking-tighter mb-4">🥭 Manguito</div>
          <p className="text-zinc-500 font-medium mb-8">La herramienta definitiva para el ahorro inteligente.</p>
          <div className="text-sm font-bold text-zinc-400 uppercase tracking-widest">
            HECHO CON ❤️ EN ARGENTINA
          </div>
        </div>
      </footer>
    </div>
  )
}
