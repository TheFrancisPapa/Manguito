// src/pages/Dashboard/index.jsx
import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useAuthContext } from '../../context/AuthContext'
import { useBalance, useUltimosMovimientos, useEvolucionMensual, useMovimientos } from '../../hooks/useMovimientos'
import { useVencimientos } from '../../hooks/useVencimientos'
import { usePresupuestos } from '../../hooks/usePresupuestos'
import { useMetas } from '../../hooks/useMetas'
import { getVencimientosProximos } from '../../api/vencimientos'
import { PageWrapper, MovCard } from '../../components/layout'
import { Card } from '../../components/ui'
import { ResumenBalance, LineaTemporal, InsightsFinancieros } from '../../components/charts'
import { exportarMovimientosCSV } from '../../lib/exportar'

function useRangoMes() {
  return useMemo(() => {
    const hoy = new Date()
    return {
      desde: new Date(hoy.getFullYear(), hoy.getMonth(), 1).toLocaleDateString('sv-SE'),
      hasta: hoy.toLocaleDateString('sv-SE'),
    }
  }, [])
}

function AlertaGastoCritico({ presupuestos }) {
  const criticos  = presupuestos.filter(p => p.porcentaje >= 75 && new Date().getDate() <= 20 && p.porcentaje < 100)
  const excedidos = presupuestos.filter(p => p.porcentaje >= 100)
  if (criticos.length === 0 && excedidos.length === 0) return null

  return (
    <div className="flex flex-col gap-2 mb-5">
      {excedidos.map(p => (
        <Link key={p.id} to="/presupuestos"
          className="flex items-center gap-3 px-4 py-3
            bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/50 rounded-2xl
            hover:shadow-md transition-all">
          <span className="text-xl flex-shrink-0">🚨</span>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-red-700 dark:text-red-400 truncate">
              Excediste el límite de {p.categoria_nombre}
            </p>
            <p className="text-xs text-red-500">{p.porcentaje.toFixed(0)}% del presupuesto usado</p>
          </div>
          <span className="text-xs font-bold text-red-500 flex-shrink-0">Ver →</span>
        </Link>
      ))}
      {criticos.map(p => (
        <Link key={p.id} to="/presupuestos"
          className="flex items-center gap-3 px-4 py-3
            bg-amber-50 dark:bg-amber-900/15 border border-amber-200 dark:border-amber-800/40 rounded-2xl
            hover:shadow-md transition-all">
          <span className="text-xl flex-shrink-0">⚠️</span>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-amber-700 dark:text-amber-400 truncate">
              Venís rápido con {p.categoria_nombre}
            </p>
            <p className="text-xs text-amber-600 dark:text-amber-500">
              {p.porcentaje.toFixed(0)}% usado · día {new Date().getDate()}
            </p>
          </div>
          <span className="text-xs font-bold text-amber-600 flex-shrink-0">Ver →</span>
        </Link>
      ))}
    </div>
  )
}

function VencimientosWidget({ vencimientos }) {
  const proximos = useMemo(() => getVencimientosProximos(vencimientos, 7), [vencimientos])
  if (proximos.length === 0) return null

  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-3 px-1">
        <h2 className="text-sm font-bold font-display text-zinc-800 dark:text-zinc-200">📅 Vencen pronto</h2>
        <Link to="/vencimientos" className="text-xs font-bold text-[var(--mango-dark)] dark:text-[var(--mango)] hover:underline">
          Ver agenda
        </Link>
      </div>
      <div className="flex flex-col gap-2">
        {proximos.slice(0, 3).map(v => (
          <Link key={v.id} to="/vencimientos"
            className="flex items-center gap-3 px-4 py-3
              bg-white dark:bg-[var(--dark-card)] border border-zinc-100 dark:border-[var(--dark-border)] rounded-2xl
              hover:border-zinc-200 dark:hover:border-zinc-600 hover:shadow-sm transition-all">
            <span className="text-lg flex-shrink-0">{v.icono}</span>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-zinc-800 dark:text-zinc-100 truncate">{v.nombre}</p>
              {v.monto && <p className="text-xs text-zinc-400">${Number(v.monto).toLocaleString('es-AR', { maximumFractionDigits: 0 })}</p>}
            </div>
            <span className={`text-xs font-bold px-2.5 py-1 rounded-full flex-shrink-0 ${
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

  const mesActual = new Date().toLocaleDateString('es-AR', { month: 'long', year: 'numeric' })

  return (
    <div className="animate-in fade-in duration-500">
      <PageWrapper>

        {/* Alertas críticas */}
        {presupuestos.length > 0 && <AlertaGastoCritico presupuestos={presupuestos} />}

        {/* ── BALANCE ── */}
        <div className="mb-5">
          <div className="flex items-center justify-between mb-3 px-1">
            <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-zinc-400">
              Balance del mes
            </p>
            <button
              onClick={() => exportarMovimientosCSV(movimientos, mesActual)}
              className="text-xs font-semibold text-zinc-400 hover:text-[var(--mango-dark)]
                dark:hover:text-[var(--mango)] transition-colors flex items-center gap-1"
              title="Exportar a CSV"
            >
              📤 Exportar
            </button>
          </div>
          <ResumenBalance balance={balance} moneda={usuario?.moneda} cargando={cBal} />
        </div>

        {/* ── EVOLUCIÓN ── */}
        <div className="mb-5">
          <Card className="p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-bold font-display text-zinc-800 dark:text-zinc-200">
                Evolución de los últimos 6 meses
              </h2>
            </div>
            <LineaTemporal datos={evolucion} moneda={usuario?.moneda} cargando={cEvo} />
          </Card>
        </div>

        {/* ── INSIGHTS IA ── */}
        <div className="mb-5">
          <Card className="p-5">
            <InsightsFinancieros
              balance={balance}
              movimientos={todosMovs}
              presupuestos={presupuestos}
              metas={metas}
              moneda={usuario?.moneda}
            />
          </Card>
        </div>

        {/* ── VENCIMIENTOS ── */}
        <VencimientosWidget vencimientos={vencimientos} />

        {/* ── ACCESO RÁPIDO ── */}
        <div className="mb-5">
          <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-zinc-400 mb-3 px-1">
            Acceso rápido
          </p>
          <div className="grid grid-cols-4 gap-2">
            {[
              { to: '/movimientos',   emoji: '💸', label: 'Movimientos', bg: 'bg-blue-50 dark:bg-blue-900/20',    color: 'text-blue-600 dark:text-blue-400'   },
              { to: '/inversiones',   emoji: '📈', label: 'Inversiones', bg: 'bg-emerald-50 dark:bg-emerald-900/20', color: 'text-emerald-600 dark:text-emerald-400' },
              { to: '/presupuestos',  emoji: '📊', label: 'Límites',     bg: 'bg-amber-50 dark:bg-amber-900/20',  color: 'text-amber-600 dark:text-amber-400' },
              { to: '/cotizaciones',  emoji: '💱', label: 'Dólar',       bg: 'bg-purple-50 dark:bg-purple-900/20',color: 'text-purple-600 dark:text-purple-400'},
            ].map(({ to, emoji, label, bg, color }) => (
              <Link key={to} to={to}
                className="bg-white dark:bg-[var(--dark-card)] border border-zinc-100 dark:border-[var(--dark-border)]
                  rounded-2xl p-3 flex flex-col items-center gap-2
                  hover:shadow-md hover:border-zinc-200 dark:hover:border-zinc-600
                  active:scale-95 transition-all">
                <div className={`w-10 h-10 rounded-xl ${bg} flex items-center justify-center text-xl`}>
                  {emoji}
                </div>
                <span className={`text-[10px] font-bold text-center leading-tight ${color}`}>
                  {label}
                </span>
              </Link>
            ))}
          </div>
        </div>

        {/* ── ÚLTIMOS MOVIMIENTOS ── */}
        <div>
          <div className="flex items-center justify-between mb-3 px-1">
            <h2 className="text-sm font-bold font-display text-zinc-800 dark:text-zinc-200">
              Últimos movimientos
            </h2>
            <Link to="/movimientos"
              className="text-xs font-bold text-[var(--mango-dark)] dark:text-[var(--mango)] hover:underline">
              Ver todos
            </Link>
          </div>
          <Card className="p-0 overflow-hidden">
            {cMovs ? (
              <div className="p-5 text-center text-sm text-zinc-400">Cargando…</div>
            ) : movimientos.length === 0 ? (
              <div className="p-8 text-center">
                <p className="text-2xl mb-2">💸</p>
                <p className="text-sm text-zinc-400 font-medium">Sin movimientos recientes</p>
              </div>
            ) : (
              <div>
                {movimientos.map((m, i) => (
                  <div key={m.id} className={`${i !== movimientos.length - 1 ? 'border-b border-zinc-50 dark:border-zinc-800/60' : ''}`}>
                    <MovCard movimiento={m} compact />
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