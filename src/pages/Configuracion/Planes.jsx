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
    <div className="animate-in fade-in duration-500">
      <Sidebar usuario={usuario} />
      <BottomNav />
      
      <PageWrapper>
        <PageHeader 
          titulo="Tu Suscripción" 
          subtitulo="Elegí el plan que mejor se adapte a tu bolsillo" 
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6 max-w-4xl mx-auto">
          
          {/* Tarjeta Plan Básico */}
          <Card className={`relative flex flex-col p-6 border-2 ${planActual === 'basico' ? 'border-[var(--mango)]' : 'border-transparent'}`}>
            {planActual === 'basico' && (
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[var(--mango)] text-white text-xs font-bold px-3 py-1 rounded-full">
                Plan Actual
              </span>
            )}
            <div className="text-center mb-6">
              <h3 className="text-xl font-bold text-zinc-900 dark:text-white">Manguito Básico</h3>
              <p className="text-sm text-zinc-500 mt-2">Para organizar el día a día</p>
              <div className="text-4xl font-extrabold mt-4 mb-1">Gratis</div>
            </div>
            
            <ul className="flex-1 space-y-4 mb-8 text-sm text-zinc-600 dark:text-zinc-300">
              <li className="flex items-center gap-2"><span>✅</span> Registro de movimientos ilimitados</li>
              <li className="flex items-center gap-2"><span>✅</span> Hasta 3 presupuestos</li>
              <li className="flex items-center gap-2"><span>✅</span> 1 meta de ahorro activa</li>
              <li className="flex items-center gap-2"><span>✅</span> Gráficos de balance mensuales</li>
            </ul>

            <Button 
              variante={planActual === 'basico' ? 'secondary' : 'primary'} 
              className="w-full"
              disabled={planActual === 'basico'}
            >
              {planActual === 'basico' ? 'Es tu plan actual' : 'Bajar a Básico'}
            </Button>
          </Card>

          {/* Tarjeta Plan Pro */}
          <Card className={`relative flex flex-col p-6 border-2 shadow-xl ${planActual === 'pro' ? 'border-emerald-500' : 'border-zinc-200 dark:border-zinc-800'}`}>
            {planActual === 'pro' && (
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-emerald-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                Plan Actual
              </span>
            )}
            <div className="text-center mb-6">
              <h3 className="text-xl font-bold text-emerald-600 dark:text-emerald-400">Manguito Pro</h3>
              <p className="text-sm text-zinc-500 mt-2">Herramientas avanzadas e Inteligencia Artificial</p>
              <div className="text-4xl font-extrabold mt-4 mb-1">$100<span className="text-lg font-normal text-zinc-400">/mes</span></div>
            </div>

            <ul className="flex-1 space-y-4 mb-8 text-sm text-zinc-600 dark:text-zinc-300">
              <li className="flex items-center gap-2"><span>⭐</span> <strong className="text-zinc-900 dark:text-white">Chat Financiero con IA</strong></li>
              <li className="flex items-center gap-2"><span>♾️</span> Presupuestos y metas ilimitadas</li>
              <li className="flex items-center gap-2"><span>📈</span> Cotizaciones en tiempo real</li>
              <li className="flex items-center gap-2"><span>📊</span> Exportación de reportes a PDF/Excel</li>
            </ul>

            <Button 
              className="w-full bg-emerald-500 hover:bg-emerald-600 text-white shadow-emerald-500/20"
              onClick={handlePagar}
              disabled={cargando || planActual === 'pro'}
            >
              {cargando ? 'Cargando...' : (planActual === 'pro' ? 'Es tu plan actual' : 'Pasarme a Pro por $100')}
            </Button>
          </Card>

        </div>
      </PageWrapper>
    </div>
  )
}