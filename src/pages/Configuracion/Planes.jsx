import { useState } from 'react'
import { PageWrapper, PageHeader, Sidebar, BottomNav } from '../../components/layout'
import { Card, Button } from '../../components/ui'
import { useAuthContext } from '../../context/AuthContext'

export function PlanesPage() {
  const { usuario } = useAuthContext()
  const [cargando, setCargando] = useState(false)

  // Asumimos que por ahora el usuario es 'basico' si no tiene plan
  const planActual = usuario?.plan || 'basico'

  const handlePagar = async () => {
    if (!usuario?.id) return
    setCargando(true)
    try {
      const response = await fetch('/api/pago/crear', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          userId: usuario.id,
          email: usuario.email 
        }), 
      })

      const data = await response.json()

      if (data.init_point) {
        window.location.href = data.init_point
      } else {
        console.error('Error: No se recibió el punto de inicio de pago', data)
      }
    } catch (error) {
      console.error('Error al conectar con el servicio de pagos:', error)
    } finally {
      setCargando(false)
    }
  }

  return (
    <div className="animate-in fade-in duration-700">
      <Sidebar usuario={usuario} />
      <BottomNav />
      
      <PageWrapper>
        <div className="text-center mb-12">
          <h1 className="text-3xl lg:text-4xl font-extrabold text-[var(--charcoal)] dark:text-white mb-3">
            Elegí tu <span className="text-[var(--mango-dark)] dark:text-[var(--mango)]">Manguito</span>
          </h1>
          <p className="text-zinc-500 dark:text-zinc-400 max-w-lg mx-auto">
            Pasate a Pro y desbloqueá el poder de la Inteligencia Artificial para manejar tus ahorros.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-6 max-w-4xl mx-auto items-stretch">
          
          {/* Tarjeta Plan Básico */}
          <Card className={`group relative flex flex-col p-8 border-2 transition-all duration-300 ${planActual === 'basico' ? 'border-[var(--mango)] bg-white dark:bg-zinc-900 shadow-lg' : 'border-zinc-200 dark:border-zinc-800 bg-white/50 dark:bg-zinc-900/50 grayscale opacity-80 hover:grayscale-0 hover:opacity-100 hover:scale-[1.02]'}`}>
            {planActual === 'basico' && (
              <span className="absolute -top-4 left-1/2 -translate-x-1/2 bg-[var(--mango)] text-[var(--charcoal)] text-[10px] uppercase tracking-widest font-black px-4 py-1.5 rounded-full shadow-md">
                Plan Actual
              </span>
            )}
            
            <div className="mb-8">
              <div className="w-12 h-12 rounded-2xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-2xl mb-4 group-hover:scale-110 transition-transform">
                🌱
              </div>
              <h3 className="text-xl font-bold text-zinc-900 dark:text-white">Básico</h3>
              <p className="text-sm text-zinc-500 mt-1 italic">Lo esencial para empezar</p>
              <div className="flex items-baseline gap-1 mt-6">
                <span className="text-4xl font-black text-zinc-900 dark:text-white">Gratis</span>
              </div>
            </div>
            
            <div className="flex-1 space-y-4 mb-10">
              {[
                'Registro de movimientos ilimitados',
                'Hasta 3 presupuestos activos',
                '1 meta de ahorro activa',
                'Balance mensual visual',
              ].map((item, idx) => (
                <div key={idx} className="flex items-center gap-3 text-sm text-zinc-600 dark:text-zinc-400 font-medium">
                  <div className="flex-shrink-0 w-5 h-5 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-[10px]">
                    ✓
                  </div>
                  {item}
                </div>
              ))}
            </div>

            <Button 
              variante={planActual === 'basico' ? 'secondary' : 'primary'} 
              className="w-full py-4 font-bold border-2"
              disabled={planActual === 'basico'}
            >
              {planActual === 'basico' ? 'Activo en tu cuenta' : 'Bajar a este plan'}
            </Button>
          </Card>

          {/* Tarjeta Plan Pro */}
          <Card className={`group relative flex flex-col p-8 border-2 transition-all duration-500 shadow-2xl ${planActual === 'pro' ? 'border-[var(--primary-vibrant)] bg-white dark:bg-zinc-900' : 'border-[var(--mango)]/30 bg-white dark:bg-zinc-900 hover:scale-[1.03] hover:border-[var(--primary-vibrant)]'}`}>
            <span className="absolute -top-4 left-1/2 -translate-x-1/2 bg-[var(--primary-vibrant)] text-[var(--dark-bg)] text-[10px] uppercase tracking-widest font-black px-5 py-1.5 rounded-full shadow-lg z-10 animate-pulse">
              RECOMENDADO
            </span>
            
            <div className="mb-8">
              <div className="w-12 h-12 rounded-2xl bg-[var(--primary-soft)] dark:bg-[var(--primary-vibrant)]/10 flex items-center justify-center text-2xl mb-4 group-hover:scale-110 transition-transform shadow-sm">
                🥭
              </div>
              <h3 className="text-2xl font-black text-[var(--charcoal)] dark:text-white">Plan Pro</h3>
              <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1 italic font-medium">Poder ilimitado e IA</p>
              <div className="flex items-baseline gap-1 mt-6">
                <span className="text-4xl font-black text-[var(--charcoal)] dark:text-white">$100</span>
                <span className="text-zinc-400 font-bold">/mes</span>
              </div>
            </div>

            <div className="flex-1 space-y-4 mb-10">
              {[
                { text: 'Chat Financiero con IA', destacada: true },
                { text: 'Presupuestos y metas ilimitadas' },
                { text: 'Cotizaciones en tiempo real' },
                { text: 'Exportá tus datos a PDF/Excel' },
                { text: 'Reportes avanzados semanales' },
              ].map((item, idx) => (
                <div key={idx} className={`flex items-center gap-3 text-sm font-semibold ${item.destacada ? 'text-[var(--leaf)] dark:text-[var(--primary-vibrant)] scale-[1.02] origin-left' : 'text-zinc-600 dark:text-zinc-400'}`}>
                  <div className={`flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${item.destacada ? 'bg-[var(--primary-vibrant)] text-[var(--dark-bg)]' : 'bg-zinc-100 dark:bg-zinc-800 dark:text-zinc-300'}`}>
                    ★
                  </div>
                  {item.text}
                </div>
              ))}
            </div>

            <Button 
              className={`w-full py-4 text-base font-black shadow-xl transition-all duration-300 ${planActual === 'pro' ? 'bg-zinc-100 dark:bg-zinc-800 text-zinc-400 cursor-not-allowed border-none' : 'bg-[var(--primary-vibrant)] hover:bg-[var(--leaf)] text-zinc-900 hover:text-white shadow-[var(--primary-vibrant)]/20 border-none'}`}
              onClick={handlePagar}
              disabled={cargando || planActual === 'pro'}
              icono={cargando ? null : (planActual === 'pro' ? null : '🚀')}
            >
              {cargando ? 'Cargando...' : (planActual === 'pro' ? 'Tu plan actual' : 'PASARME A PRO')}
            </Button>

            <div className="mt-4 text-[10px] text-center text-zinc-400 font-bold uppercase tracking-tight">
              Cancelá cuando quieras • Pagá con Mercado Pago
            </div>
          </Card>

        </div>
      </PageWrapper>
    </div>
  )
}