// src/pages/Dashboard/index.jsx
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuthContext } from '../../context/AuthContext'
import { useBalance, useUltimosMovimientos, useEvolucionMensual } from '../../hooks/useMovimientos'
import { PageWrapper, MovCard } from '../../components/layout'
import { Card } from '../../components/ui'
import { ResumenBalance, LineaTemporal } from '../../components/charts'

function useRangoMes() {
  const [rango] = useState(() => {
    const hoy = new Date()
    const primerDia = new Date(hoy.getFullYear(), hoy.getMonth(), 1)
    return {
      desde: primerDia.toLocaleDateString('sv-SE'),
      hasta: hoy.toLocaleDateString('sv-SE'),
    }
  })
  return rango
}

export function DashboardPage() {
  const { usuario } = useAuthContext()
  const { desde, hasta } = useRangoMes()
  
  // Traemos solo lo que necesitamos para esta vista
  const { balance, cargando: cBal } = useBalance(desde, hasta)
  const { datos: evolucion, cargando: cEvo } = useEvolucionMensual(6)
  const { movimientos, cargando: cMovs } = useUltimosMovimientos(5)

  return (
    <div className="animate-in fade-in duration-500">
      <PageWrapper>
        
        {/* 1. BALANCE TOTAL */}
        <div className="mt-2 mb-6">
          <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-2 px-1">Tu Dinero</p>
          <ResumenBalance balance={balance} moneda={usuario?.moneda} cargando={cBal} />
        </div>

        {/* 2. EVOLUCIÓN MENSUAL */}
        <div className="mb-6">
          <Card className="p-4 shadow-sm border border-zinc-200 dark:border-zinc-800 rounded-2xl">
            <h2 className="text-sm font-bold text-zinc-800 dark:text-zinc-200 mb-4">Evolución de tu dinero</h2>
            <div className="h-48">
              <LineaTemporal datos={evolucion} moneda={usuario?.moneda} cargando={cEvo} />
            </div>
          </Card>
        </div>

        {/* 3. LAS 3 VENTANITAS DE ACCESO RÁPIDO */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <Link to="/movimientos" className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-4 flex flex-col items-center justify-center gap-2 shadow-sm active:scale-95 transition-transform">
            <div className="w-10 h-10 rounded-full bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-xl">💸</div>
            <span className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">Movimientos</span>
          </Link>
          
          <Link to="/inversiones" className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-4 flex flex-col items-center justify-center gap-2 shadow-sm active:scale-95 transition-transform">
            <div className="w-10 h-10 rounded-full bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center text-xl">📈</div>
            <span className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">Inversiones</span>
          </Link>

          <Link to="/chat" className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-4 flex flex-col items-center justify-center gap-2 shadow-sm active:scale-95 transition-transform">
            <div className="w-10 h-10 rounded-full bg-purple-50 dark:bg-purple-900/20 flex items-center justify-center text-xl">🤖</div>
            <span className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">Chat IA</span>
          </Link>
        </div>

        {/* 4. TRANSFERENCIAS RECIENTES (MÁX 5) */}
        <div>
          <div className="flex items-center justify-between mb-3 px-1">
            <h2 className="text-sm font-bold text-zinc-800 dark:text-zinc-200">Transferencias recientes</h2>
            <Link to="/movimientos" className="text-xs font-bold text-[var(--mango-dark)]">Ver todo</Link>
          </div>
          
          <Card className="p-2 shadow-sm border border-zinc-200 dark:border-zinc-800 rounded-2xl">
            {cMovs ? (
               <div className="p-4 text-center text-sm text-zinc-400">Cargando...</div>
            ) : movimientos.length === 0 ? (
               <div className="p-4 text-center text-sm text-zinc-400">No hay movimientos recientes</div>
            ) : (
              <div className="flex flex-col">
                {movimientos.map((m, i) => (
                  <div key={m.id} className={`py-3 px-2 ${i !== movimientos.length - 1 ? 'border-b border-zinc-100 dark:border-zinc-800' : ''}`}>
                    <MovCard movimiento={m} compact={true} />
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>

      </PageWrapper>
    </div>
  )
}