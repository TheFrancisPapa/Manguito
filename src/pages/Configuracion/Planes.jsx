import { useState } from 'react'
import { PageWrapper, PageHeader } from '../../components/layout'
import { Card, Button } from '../../components/ui'
import { useAuthContext } from '../../context/AuthContext'
import { iniciarPago } from '../../lib/pagos'

export function PlanesPage() {
  const { usuario } = useAuthContext()
  const [cargando, setCargando] = useState(false)
  const [error, setError] = useState(null)
  const planActual = usuario?.plan || 'basico'

  const handlePagar = async () => {
    setCargando(true)
    setError(null)
    try {
      await iniciarPago({ userId: usuario?.id, email: usuario?.email })
    } catch (err) {
      console.error('Error al iniciar pago:', err)
      setError('No se pudo conectar con el servicio de pagos. Intentá de nuevo.')
      setCargando(false)
    }
  }

  return (
    <div className="animate-in fade-in duration-700">
      <PageWrapper>
        <div className="text-center mb-12">
          <h1 className="text-3xl lg:text-4xl font-extrabold text-[var(--charcoal)] dark:text-white mb-3">
            Elegí tu <span className="text-[var(--mango-dark)] dark:text-[var(--mango)]">Manguito</span>
          </h1>
          <p className="text-zinc-500 dark:text-zinc-400 max-w-lg mx-auto">
            Pasate a Pro y desbloqueá el poder de la Inteligencia Artificial para manejar tus ahorros.
          </p>
        </div>

        {error && (
          <div className="max-w-4xl mx-auto mb-6 bg-red-50 dark:bg-red-900/20 text-red-600 text-sm px-4 py-3 rounded-xl border border-red-100 dark:border-red-900/50">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-6 max-w-4xl mx-auto items-stretch">

          {/* Plan Básico */}
          <Card className={`group relative flex flex-col p-8 border-2 transition-all duration-300 ${
            planActual === 'basico'
              ? 'border-[var(--mango)] bg-white dark:bg-zinc-900 shadow-lg'
              : 'border-zinc-200 dark:border-zinc-800 bg-white/50 dark:bg-zinc-900/50 opacity-80 hover:opacity-100 hover:scale-[1.02]'
          }`}>
            {planActual === 'basico' && (
              <span className="absolute -top-4 left-1/2 -translate-x-1/2 bg-[var(--mango)] text-[var(--charcoal)] text-[10px] uppercase tracking-widest font-black px-4 py-1.5 rounded-full shadow-md">
                Plan Actual
              </span>
            )}

            <div className="mb-8">
              <div className="w-12 h-12 rounded-2xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-2xl mb-4">🌱</div>
              <h3 className="text-xl font-bold text-zinc-900 dark:text-white">Básico</h3>
              <p className="text-sm text-zinc-500 mt-1 italic">Lo esencial para empezar</p>
              <div className="flex items-baseline gap-1 mt-6">
                <span className="text-4xl font-black text-zinc-900 dark:text-white">Gratis</span>
              </div>
            </div>

            <div className="flex-1 space-y-4 mb-10">
              {[
                'Movimientos ilimitados',
                'Hasta 3 presupuestos',
                '1 meta de ahorro',
                'Balance mensual visual',
                'Cotizaciones y Nafta',
                'Calculadoras financieras',
                'Comunidad Manguito',
                'ManguitoAI (5 msgs/día)',
              ].map((item) => (
                <div key={item} className="flex items-center gap-3 text-sm text-zinc-600 dark:text-zinc-400 font-medium">
                  <div className="flex-shrink-0 w-5 h-5 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-[10px]">✓</div>
                  {item}
                </div>
              ))}
            </div>

            <Button
              variante="secondary"
              className="w-full py-4 font-bold border-2"
              disabled={planActual === 'basico'}
            >
              {planActual === 'basico' ? 'Activo en tu cuenta' : 'Bajar a este plan'}
            </Button>
          </Card>

          {/* Plan Pro */}
          <Card className={`group relative flex flex-col p-8 border-2 transition-all duration-500 shadow-2xl ${
            planActual === 'pro'
              ? 'border-[var(--primary-vibrant)] bg-white dark:bg-zinc-900'
              : 'border-[var(--mango)]/30 bg-white dark:bg-zinc-900 hover:scale-[1.03] hover:border-[var(--primary-vibrant)]'
          }`}>
            <span className="absolute -top-4 left-1/2 -translate-x-1/2 bg-[var(--primary-vibrant)] text-[var(--dark-bg)] text-[10px] uppercase tracking-widest font-black px-5 py-1.5 rounded-full shadow-lg z-10 animate-pulse">
              RECOMENDADO
            </span>

            <div className="mb-8">
              <div className="w-12 h-12 rounded-2xl bg-[var(--primary-soft)] dark:bg-[var(--primary-vibrant)]/10 flex items-center justify-center text-2xl mb-4">🥭</div>
              <h3 className="text-2xl font-black text-[var(--charcoal)] dark:text-white">Plan Pro</h3>
              <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1 italic font-medium">Poder ilimitado e IA</p>
              <div className="flex items-baseline gap-1 mt-6">
                <span className="text-4xl font-black text-[var(--charcoal)] dark:text-white">$1.999</span>
                <span className="text-zinc-400 font-bold">/mes</span>
              </div>
            </div>

            <div className="flex-1 space-y-4 mb-10">
              {[
                { text: 'ManguitoAI (15 msgs/día)', destacada: true },
                { text: 'Presupuestos ilimitados' },
                { text: 'Metas de ahorro ilimitadas' },
                { text: 'Agenda de pagos ilimitada' },
                { text: 'Portfolio de inversiones' },
                { text: 'Exportar datos a Excel/CSV' },
                { text: 'Todo lo del plan Básico' },
              ].map((item) => (
                <div key={item.text} className={`flex items-center gap-3 text-sm font-semibold ${
                  item.destacada ? 'text-[var(--leaf)] dark:text-[var(--primary-vibrant)]' : 'text-zinc-600 dark:text-zinc-400'
                }`}>
                  <div className={`flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${
                    item.destacada ? 'bg-[var(--primary-vibrant)] text-[var(--dark-bg)]' : 'bg-zinc-100 dark:bg-zinc-800'
                  }`}>★</div>
                  {item.text}
                </div>
              ))}
            </div>

            <Button
              className={`w-full py-4 text-base font-black shadow-xl transition-all duration-300 ${
                planActual === 'pro'
                  ? 'bg-zinc-100 dark:bg-zinc-800 text-zinc-400 cursor-not-allowed border-none'
                  : 'bg-[var(--primary-vibrant)] hover:bg-[var(--leaf)] text-zinc-900 hover:text-white border-none'
              }`}
              onClick={handlePagar}
              cargando={cargando}
              disabled={planActual === 'pro'}
              icono={planActual === 'pro' ? null : '🚀'}
            >
              {planActual === 'pro' ? 'Tu plan actual' : 'PASARME A PRO'}
            </Button>

            <div className="mt-4 text-[10px] text-center text-zinc-400 font-bold uppercase tracking-tight">
              Cancelá cuando quieras · Pagá con Mercado Pago
            </div>
          </Card>

        </div>
      </PageWrapper>
    </div>
  )
}