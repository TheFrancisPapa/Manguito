// src/pages/Dashboard/index.jsx
// Actualizado: alertas de gasto crítico + vencimientos próximos + InsightsFinancieros
import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useAuthContext } from '../../context/AuthContext'
import { useBalance, useUltimosMovimientos, useEvolucionMensual } from '../../hooks/useMovimientos'
import { useVencimientos } from '../../hooks/useVencimientos'
import { usePresupuestos } from '../../hooks/usePresupuestos'
import { useMetas } from '../../hooks/useMetas'
import { getVencimientosProximos } from '../../api/vencimientos'
import { PageWrapper, MovCard } from '../../components/layout'
import { Card } from '../../components/ui'
import { ResumenBalance, LineaTemporal, InsightsFinancieros } from '../../components/charts'
import { exportarMovimientosCSV } from '../../lib/exportar'
import { useMovimientos } from '../../hooks/useMovimientos'

function useRangoMes() {
  return useMemo(() => {
    const hoy = new Date()
    return {
      desde: new Date(hoy.getFullYear(), hoy.getMonth(), 1).toLocaleDateString('sv-SE'),
      hasta: hoy.toLocaleDateString('sv-SE'),
    }
  }, [])
}

// Componente de alerta de presupuesto excedido
function AlertaGastoCritico({ presupuestos }) {
  const criticos = presupuestos.filter(p => {
    const diaActual = new Date().getDate()
    return p.porcentaje >= 75 && diaActual <= 20 && p.porcentaje < 100
  })
  const excedidos = presupuestos.filter(p => p.porcentaje >= 100)

  if (criticos.length === 0 && excedidos.length === 0) return null

  return (
    <div className="mb-6 flex flex-col gap-2">
      {excedidos.map(p => (
        <div key={p.id} className="flex items-center gap-3 px-4 py-3
          bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/50 rounded-2xl">
          <span className="text-xl flex-shrink-0">🚨</span>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-red-700 dark:text-red-400 truncate">
              Excediste el límite de {p.categoria_nombre}
            </p>
            <p className="text-xs text-red-500">
              Gastaste el {p.porcentaje.toFixed(0)}% del presupuesto
            </p>
          </div>
          <Link to="/presupuestos" className="text-xs font-bold text-red-600 dark:text-red-400 flex-shrink-0">
            Ver →
          </Link>
        </div>
      ))}
      {criticos.map(p => {
        const diaActual = new Date().getDate()
        return (
          <div key={p.id} className="flex items-center gap-3 px-4 py-3
            bg-amber-50 dark:bg-amber-900/15 border border-amber-200 dark:border-amber-800/40 rounded-2xl">
            <span className="text-xl flex-shrink-0">⚠️</span>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-amber-700 dark:text-amber-400 truncate">
                Venís rápido con {p.categoria_nombre}
              </p>
              <p className="text-xs text-amber-600 dark:text-amber-500">
                Usaste el {p.porcentaje.toFixed(0)}% del límite y es día {diaActual}
              </p>
            </div>
            <Link to="/presupuestos" className="text-xs font-bold text-amber-600 dark:text-amber-400 flex-shrink-0">
              Ver →
            </Link>
          </div>
        )
      })}
    </div>
  )
}

// Widget de vencimientos próximos
function VencimientosWidget({ vencimientos }) {
  const proximos = useMemo(() => getVencimientosProximos(vencimientos, 7), [vencimientos])
  if (proximos.length === 0) return null

  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-2 px-1">
        <h2 className="text-sm font-bold text-zinc-800 dark:text-zinc-200">📅 Vencen pronto</h2>
        <Link to="/vencimientos" className="text-xs font-bold text-[var(--mango-dark)]">Ver agenda</Link>
      </div>
      <div className="flex flex-col gap-2">
        {proximos.slice(0, 3).map(v => (
          <Link key={v.id} to="/vencimientos"
            className="flex items-center gap-3 px-4 py-3
              bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-2xl
              hover:border-zinc-200 dark:hover:border-zinc-700 transition-colors">
            <span className="text-lg flex-shrink-0">{v.icono}</span>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-zinc-800 dark:text-zinc-100 truncate">{v.nombre}</p>
              {v.monto && (
                <p className="text-xs text-zinc-400">
                  ${Number(v.monto).toLocaleString('es-AR', { maximumFractionDigits: 0 })}
                </p>
              )}
            </div>
            <span className={`text-xs font-bold px-2 py-0.5 rounded-full flex-shrink-0 ${
              v.diasRestantes === 0
                ? 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400'
                : v.diasRestantes <= 3
                  ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400'
                  : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500'
            }`}>
              {v.diasRestantes === 0 ? 'Hoy' : `${v.diasRestantes}d`}
            </span>
          </Link>
        ))}
      </div>
    </div>
  )
}

export function DashboardPage() {
  const { usuario } = useAuthContext()
  const { desde, hasta } = useRangoMes()

  const { balance, cargando: cBal }          = useBalance(desde, hasta)
  const { datos: evolucion, cargando: cEvo } = useEvolucionMensual(6)
  const { movimientos, cargando: cMovs }     = useUltimosMovimientos(5)
  const { movimientos: todosMovs }           = useMovimientos({ desde, hasta })
  const { presupuestos }                     = usePresupuestos()
  const { vencimientos }                     = useVencimientos()
  const { metas }                            = useMetas('activa')

  return (
    <div className="animate-in fade-in duration-500">
      <PageWrapper>

        {/* ALERTAS DE GASTO CRÍTICO */}
        {presupuestos.length > 0 && (
          <AlertaGastoCritico presupuestos={presupuestos} />
        )}

        {/* 1. BALANCE TOTAL */}
        <div className="mt-2 mb-6">
          <div className="flex items-center justify-between mb-2 px-1">
            <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Tu Dinero</p>
            <button
              onClick={() => exportarMovimientosCSV(movimientos, new Date().toLocaleDateString('es-AR', { month: 'long', year: 'numeric' }))}
              className="text-xs font-medium text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors"
              title="Exportar movimientos del mes a CSV"
            >
              📤 Exportar
            </button>
          </div>
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

        {/* 3. INSIGHTS DE SALUD FINANCIERA */}
        <div className="mb-6">
          <Card className="p-4 shadow-sm border border-zinc-200 dark:border-zinc-800 rounded-2xl">
            <InsightsFinancieros
              balance={balance}
              movimientos={todosMovs}
              presupuestos={presupuestos}
              metas={metas}
              moneda={usuario?.moneda}
            />
          </Card>
        </div>

        {/* 4. VENCIMIENTOS PRÓXIMOS */}
        <VencimientosWidget vencimientos={vencimientos} />

        {/* 5. ACCESO RÁPIDO */}
        <div className="grid grid-cols-3 gap-2 sm:gap-3 mb-6">
          {[
            { to: '/movimientos',   emoji: '💸', label: 'Movimientos', bg: 'bg-blue-50 dark:bg-blue-900/20' },
            { to: '/inversiones',   emoji: '📈', label: 'Inversiones', bg: 'bg-emerald-50 dark:bg-emerald-900/20' },
            { to: '/vencimientos',  emoji: '📅', label: 'Agenda',      bg: 'bg-amber-50 dark:bg-amber-900/20' },
          ].map(({ to, emoji, label, bg }) => (
            <Link key={to} to={to}
              className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800
                rounded-2xl p-2 sm:p-4 flex flex-col items-center justify-center gap-1.5
                shadow-sm active:scale-95 transition-transform hover:border-zinc-300 dark:hover:border-zinc-700">
              <div className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full ${bg} flex items-center justify-center text-lg`}>
                {emoji}
              </div>
              <span className="text-[10px] sm:text-xs font-semibold text-center leading-tight text-zinc-700 dark:text-zinc-300">
                {label}
              </span>
            </Link>
          ))}
        </div>

        {/* 6. ÚLTIMOS MOVIMIENTOS */}
        <div>
          <div className="flex items-center justify-between mb-3 px-1">
            <h2 className="text-sm font-bold text-zinc-800 dark:text-zinc-200">Últimos movimientos</h2>
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
                  <div key={m.id}
                    className={`py-3 px-2 ${i !== movimientos.length - 1 ? 'border-b border-zinc-100 dark:border-zinc-800' : ''}`}>
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