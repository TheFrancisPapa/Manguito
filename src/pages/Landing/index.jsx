import { Link, Navigate, useNavigate } from 'react-router-dom'
import { useAuthContext } from '../../context/AuthContext'
import { Button } from '../../components/ui'

export function LandingPage() {
  const { session } = useAuthContext()
  const navigate = useNavigate()

  // Si ya tiene la sesión iniciada, lo mandamos directo a su panel
  if (session) {
    return <Navigate to="/dashboard" replace />
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-50 flex flex-col font-sans selection:bg-[var(--mango)] selection:text-zinc-900">
      
      {/* Navbar Simple */}
      <header className="px-6 py-5 flex justify-between items-center max-w-6xl w-full mx-auto animate-in fade-in slide-in-from-top-4 duration-700">
        <div className="flex items-center gap-2 text-2xl font-black tracking-tighter">
          <span>🥭</span> Manguito
        </div>
        <div className="flex items-center gap-4 md:gap-6">
          <Link to="/login" className="text-sm font-semibold text-zinc-500 hover:text-[var(--mango-dark)] dark:hover:text-[var(--mango)] transition-colors hidden sm:block">
            Iniciar sesión
          </Link>
          <Button onClick={() => navigate('/registro')} tamaño="sm" className="shadow-md shadow-[var(--mango)]/20">
            Comenzar gratis
          </Button>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col items-center justify-center text-center px-4 mt-12 md:mt-20 max-w-5xl mx-auto">
        
        <div className="inline-flex items-center gap-2 px-4 py-1.5 mb-8 rounded-full bg-amber-100 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 text-sm font-bold tracking-wide border border-amber-200 dark:border-amber-500/20 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
          </span>
          Tu plata, bajo control.
        </div>
        
        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6 animate-in fade-in slide-in-from-bottom-5 duration-700 delay-150 text-balance leading-tight">
          Finanzas personales <br className="hidden md:block"/> con sabor argentino.
        </h1>
        
        <p className="text-lg md:text-xl text-zinc-500 dark:text-zinc-400 mb-10 max-w-2xl animate-in fade-in slide-in-from-bottom-6 duration-700 delay-300 text-balance">
          Registrá tus gastos, ponete límites, armá metas de ahorro y dejá que ManguitoAI te tire la posta financiera. Todo en una sola app, simple y al pie.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto animate-in fade-in slide-in-from-bottom-8 duration-700 delay-500">
          <Button onClick={() => navigate('/registro')} className="text-lg px-8 py-4 shadow-xl shadow-[var(--mango)]/20">
            Crear mi cuenta gratis
          </Button>
          <Button variante="secondary" onClick={() => document.getElementById('features').scrollIntoView({ behavior: 'smooth'})} className="text-lg px-8 py-4 bg-white dark:bg-zinc-900 border-2">
            Ver funciones
          </Button>
        </div>

        {/* Feature Grid */}
        <div id="features" className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-32 mb-20 w-full text-left">
          <div className="p-8 bg-white dark:bg-zinc-900 rounded-[2rem] border border-zinc-100 dark:border-zinc-800 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-14 h-14 bg-blue-50 dark:bg-blue-500/10 rounded-2xl flex items-center justify-center text-3xl mb-6 border border-blue-100 dark:border-blue-500/20">
              📊
            </div>
            <h3 className="text-xl font-bold mb-3">Presupuestos</h3>
            <p className="text-sm text-zinc-500 leading-relaxed">Ponete un límite mensual por categoría (ej: Supermercado) y Manguito te avisa antes de que te pases de rosca.</p>
          </div>
          
          <div className="p-8 bg-white dark:bg-zinc-900 rounded-[2rem] border border-zinc-100 dark:border-zinc-800 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-14 h-14 bg-amber-50 dark:bg-amber-500/10 rounded-2xl flex items-center justify-center text-3xl mb-6 border border-amber-100 dark:border-amber-500/20">
              🎯
            </div>
            <h3 className="text-xl font-bold mb-3">Metas de Ahorro</h3>
            <p className="text-sm text-zinc-500 leading-relaxed">¿Querés cambiar el celu o irte de viaje? Creá una meta, andá sumando aportes y festejá cuando llegues al 100%.</p>
          </div>
          
          <div className="relative p-8 bg-white dark:bg-zinc-900 rounded-[2rem] border-2 border-emerald-500/30 shadow-sm hover:shadow-emerald-500/10 transition-shadow overflow-hidden group">
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-emerald-500/10 rounded-full blur-3xl group-hover:bg-emerald-500/20 transition-colors"></div>
            <div className="w-14 h-14 bg-emerald-50 dark:bg-emerald-500/10 rounded-2xl flex items-center justify-center text-3xl mb-6 border border-emerald-100 dark:border-emerald-500/20 relative z-10">
              ⭐
            </div>
            <h3 className="text-xl font-bold mb-3 text-emerald-600 dark:text-emerald-400 relative z-10">ManguitoAI Pro</h3>
            <p className="text-sm text-zinc-500 leading-relaxed relative z-10">Chateá con nuestra inteligencia artificial para sacarte dudas sobre el dólar, Lecaps o en qué invertir tus pesos sobrantes.</p>
          </div>
        </div>
      </main>

      {/* Footer Simple */}
      <footer className="py-8 text-center text-sm font-medium text-zinc-400 border-t border-zinc-100 dark:border-zinc-800/50 mt-auto">
        <p>Manguito 🥭 · Hecho con ❤️ en Argentina</p>
      </footer>
    </div>
  )
}
