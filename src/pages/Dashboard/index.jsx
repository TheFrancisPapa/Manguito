// src/pages/Dashboard/index.jsx
// Redesign v3 — Premium warm fintech, iOS-inspired, full dark mode

import { useState, useMemo, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { useAuthContext } from '../../context/AuthContext'
import {
  useBalance,
  useEvolucionMensual,
  useMovimientos,
} from '../../hooks/useMovimientos'
import { usePresupuestos } from '../../hooks/usePresupuestos'
import { useMetas } from '../../hooks/useMetas'
import { PageWrapper } from '../../components/layout'
import { MovCard } from '../../components/layout/MovCard'
import { Modal } from '../../components/ui/Modal'
import { FormMovimiento } from '../../components/forms/FormMovimiento'

// ─── Helpers ──────────────────────────────────────────────────
function useRangoMes(offsetMeses = 0) {
  return useMemo(() => {
    const hoy = new Date()
    const d = new Date(hoy.getFullYear(), hoy.getMonth() + offsetMeses, 1)
    const desde = d.toLocaleDateString('sv-SE')
    const hasta =
      offsetMeses === 0
        ? hoy.toLocaleDateString('sv-SE')
        : new Date(d.getFullYear(), d.getMonth() + 1, 0).toLocaleDateString('sv-SE')
    return { desde, hasta }
  }, [offsetMeses])
}

function fmtBalance(n) {
  return Number(n).toLocaleString('es-AR', {
    style: 'currency',
    currency: 'ARS',
    maximumFractionDigits: 2,
  })
}

function fmtAbrev(n) {
  const abs = Math.abs(n)
  if (abs >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`
  if (abs >= 100_000) return `$${(n / 1_000).toFixed(0)}K`
  return Number(n).toLocaleString('es-AR', { maximumFractionDigits: 0, style: 'currency', currency: 'ARS' })
}

// ─── SVG Chart ───────────────────────────────────────────────
function ChartEvolucion({ datos = [], cargando }) {
  if (cargando) {
    return <div className="w-full h-40 rounded-2xl bg-zinc-100 dark:bg-zinc-800 animate-pulse" />
  }
  if (!datos.length) return null

  const W = 400, H = 160
  const PL = 0, PR = 0, PT = 8, PB = 0
  const iW = W - PL - PR
  const iH = H - PT - PB
  const maxV = Math.max(...datos.flatMap(d => [d.ingresos, d.gastos]), 1)
  const xS = datos.length > 1 ? iW / (datos.length - 1) : iW
  const px = (i) => PL + i * xS
  const py = (v) => PT + iH - (v / maxV) * iH

  const curva = (campo) => {
    if (datos.length < 2) return `M ${px(0)} ${py(datos[0][campo])}`
    let d = `M ${px(0)} ${py(datos[0][campo])}`
    for (let i = 1; i < datos.length; i++) {
      const cpx = (px(i - 1) + px(i)) / 2
      d += ` C ${cpx} ${py(datos[i - 1][campo])}, ${cpx} ${py(datos[i][campo])}, ${px(i)} ${py(datos[i][campo])}`
    }
    return d
  }

  const areaPath = (campo) => {
    const line = curva(campo)
    return `${line} L ${px(datos.length - 1)} ${H} L ${px(0)} ${H} Z`
  }

  const labelIndices = datos.length <= 4
    ? datos.map((_, i) => i)
    : [0, Math.floor(datos.length / 3), Math.floor(2 * datos.length / 3), datos.length - 1]

  return (
    <div className="relative w-full" style={{ height: 160 }}>
      <svg
        width="100%"
        height="100%"
        viewBox={`0 0 ${W} ${H}`}
        preserveAspectRatio="none"
        className="overflow-visible"
      >
        <defs>
          <linearGradient id="gradGreen" x1="0%" x2="0%" y1="0%" y2="100%">
            <stop offset="0%" stopColor="var(--leaf)" stopOpacity="0.18" />
            <stop offset="100%" stopColor="var(--leaf)" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="gradRed" x1="0%" x2="0%" y1="0%" y2="100%">
            <stop offset="0%" stopColor="#EF4444" stopOpacity="0.12" />
            <stop offset="100%" stopColor="#EF4444" stopOpacity="0" />
          </linearGradient>
        </defs>

        <path d={areaPath('gastos')} fill="url(#gradRed)" />
        <path
          d={curva('gastos')}
          fill="none"
          stroke="#EF4444"
          strokeWidth="2.5"
          strokeLinecap="round"
          style={{ filter: 'drop-shadow(0 4px 6px rgba(239,68,68,0.2))' }}
        />

        <path d={areaPath('ingresos')} fill="url(#gradGreen)" />
        <path
          d={curva('ingresos')}
          fill="none"
          stroke="var(--leaf)"
          strokeWidth="2.5"
          strokeLinecap="round"
          style={{ filter: 'drop-shadow(0 4px 6px rgba(5,150,105,0.2))' }}
        />

        {/* Dots at endpoints */}
        {datos.length > 0 && (
          <>
            <circle cx={px(datos.length-1)} cy={py(datos[datos.length-1].ingresos)} r="4"
              fill="var(--leaf)" stroke="white" strokeWidth="2" />
            <circle cx={px(datos.length-1)} cy={py(datos[datos.length-1].gastos)} r="4"
              fill="#EF4444" stroke="white" strokeWidth="2" />
          </>
        )}
      </svg>

      <div className="absolute bottom-0 left-0 right-0 flex justify-between px-1 mt-2">
        {datos.map((d, i) => {
          const show = datos.length <= 4 || labelIndices.includes(i)
          return show ? (
            <span key={i} className="text-[9px] font-bold text-zinc-400 dark:text-zinc-500 uppercase">
              {d.label}
            </span>
          ) : null
        })}
      </div>
    </div>
  )
}

// ─── Card de Presupuesto Crítico ───────────────────────────────
function PresupuestoCritico({ presupuesto }) {
  const { categoria_nombre, categoria_icono, limite_monto, gastado, porcentaje, alerta_pct } = presupuesto
  const excedido = porcentaje >= 100
  const enAlerta = porcentaje >= alerta_pct && !excedido

  const colorBarra = excedido ? '#EF4444' : enAlerta ? '#F59E0B' : 'var(--leaf)'
  const badgeText = excedido ? 'Excedido' : 'Alerta'
  const badgeColor = excedido
    ? 'bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400'
    : 'bg-amber-100 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400'
  const iconBg = excedido
    ? 'bg-red-100 dark:bg-red-900/25'
    : 'bg-amber-100 dark:bg-amber-900/25'

  return (
    <div className="bg-white dark:bg-[var(--dark-card)] p-5 rounded-[20px]
      border border-zinc-100/60 dark:border-[var(--dark-border)]
      flex flex-col gap-4 shadow-[var(--shadow-sm)]">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center text-xl ${iconBg}`}>
            {categoria_icono || '⚠️'}
          </div>
          <div>
            <h3 className="text-sm font-bold leading-tight text-zinc-800 dark:text-white font-display">
              {excedido ? 'Presupuesto Excedido' : 'Presupuesto Crítico'}
            </h3>
            <p className="text-[10px] text-zinc-500 dark:text-zinc-400">{categoria_nombre}</p>
          </div>
        </div>
        <span className={`text-[9px] font-extrabold px-2 py-1 rounded-full uppercase ${badgeColor}`}>
          {badgeText}
        </span>
      </div>
      <div className="space-y-2">
        <div className="flex justify-between text-[10px] font-bold">
          <span className="text-zinc-400 dark:text-zinc-500">{porcentaje.toFixed(0)}% alcanzado</span>
          <span style={{ color: colorBarra }}>
            ${Number(gastado).toLocaleString('es-AR')} / ${Number(limite_monto).toLocaleString('es-AR')}
          </span>
        </div>
        <div className="w-full h-2.5 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-700"
            style={{ width: `${Math.min(porcentaje, 100)}%`, backgroundColor: colorBarra }}
          />
        </div>
      </div>
    </div>
  )
}

// ─── Card de Meta ──────────────────────────────────────────────
function MetaCard({ meta }) {
  const { nombre, icono, color, monto_objetivo, monto_actual, estado } = meta
  const pct = Math.min((monto_actual / monto_objetivo) * 100, 100)
  const completa = estado === 'completada'

  return (
    <div className="bg-white dark:bg-[var(--dark-card)] p-5 rounded-[20px]
      border border-zinc-100/60 dark:border-[var(--dark-border)]
      flex flex-col gap-4 shadow-[var(--shadow-sm)]">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center text-xl"
            style={{ backgroundColor: (color || 'var(--leaf)') + '22' }}
          >
            {icono || '🎯'}
          </div>
          <div>
            <h3 className="text-sm font-bold leading-tight text-zinc-800 dark:text-white font-display">Meta Próxima</h3>
            <p className="text-[10px] text-zinc-500 dark:text-zinc-400">{nombre}</p>
          </div>
        </div>
        <span className="text-[9px] font-extrabold bg-emerald-100 dark:bg-emerald-900/20
          text-emerald-700 dark:text-emerald-400 px-2 py-1 rounded-full uppercase">
          {completa ? '✓ Lista' : 'Ahorro'}
        </span>
      </div>
      <div className="space-y-2">
        <div className="flex justify-between text-[10px] font-bold">
          <span className="text-zinc-400 dark:text-zinc-500">{pct.toFixed(0)}% completado</span>
          <span style={{ color: color || 'var(--leaf)' }}>
            ${Number(monto_actual).toLocaleString('es-AR')} / ${Number(monto_objetivo).toLocaleString('es-AR')}
          </span>
        </div>
        <div className="w-full h-2.5 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-700"
            style={{ width: `${pct}%`, backgroundColor: color || 'var(--leaf)' }}
          />
        </div>
      </div>
    </div>
  )
}

// ─── FAB ──────────────────────────────────────────────────────
function FAB({ onClick }) {
  return (
    <div className="flex justify-center pt-6 pb-2">
      <button
        onClick={onClick}
        aria-label="Agregar movimiento"
        className="w-16 h-16 rounded-full flex items-center justify-center
          active:scale-90 transition-all duration-150 press-scale"
        style={{
          background: 'var(--gradient-mango)',
          boxShadow: '0 12px 24px -8px rgba(245,166,35,0.5)',
        }}
      >
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none"
          stroke="white" strokeWidth="2.8" strokeLinecap="round">
          <line x1="12" y1="4" x2="12" y2="20" />
          <line x1="4" y1="12" x2="20" y2="12" />
        </svg>
      </button>
    </div>
  )
}

// ─── Períodos ─────────────────────────────────────────────────
const PERIODOS = [
  { label: 'Este mes', offset: 0 },
  { label: 'Anterior', offset: -1 },
  { label: 'Hace 2', offset: -2 },
]

// ─── PÁGINA PRINCIPAL ─────────────────────────────────────────
export function DashboardPage() {
  const { usuario } = useAuthContext()
  const [periodoIdx, setPeriodoIdx] = useState(0)
  const [modalAbierto, setModalAbierto] = useState(false)
  const [tipoDefault, setTipoDefault] = useState('gasto')

  const offset = PERIODOS[periodoIdx].offset
  const { desde, hasta } = useRangoMes(offset)

  const { balance, cargando: cBal } = useBalance(desde, hasta)
  const { datos: evolucion, cargando: cEvo } = useEvolucionMensual(6)
  const { presupuestos } = usePresupuestos()
  const { metas } = useMetas('activa')
  const { movimientos, cargando: cMovs, agregar } = useMovimientos({ desde, hasta })

  const saldo = (balance?.total_ingresos ?? 0) - (balance?.total_gastos ?? 0)
  const positivo = saldo >= 0

  const tasaAhorro = balance?.total_ingresos > 0
    ? ((saldo / balance.total_ingresos) * 100).toFixed(1)
    : 0

  const presupuestosEnAlerta = presupuestos.filter(
    p => p.porcentaje >= (p.alerta_pct ?? 80)
  ).slice(0, 2)

  const metaPrincipal = metas[0] ?? null

  const abrirModal = useCallback((tipo = 'gasto') => {
    setTipoDefault(tipo)
    setModalAbierto(true)
  }, [])

  const handleGuardar = useCallback(async (datos) => {
    await agregar({ ...datos, usuario_id: usuario?.id })
    setModalAbierto(false)
  }, [agregar, usuario?.id])

  return (
    <>
      <div className="space-y-5 pb-6">

        {/* ── Balance General — Premium Glass Card ── */}
        <section className="p-6 rounded-[22px] relative overflow-hidden
          bg-white/85 dark:bg-[var(--dark-card)]/95
          backdrop-blur-2xl
          border border-white/60 dark:border-[var(--dark-border)]
          shadow-[var(--shadow-md)]">

          {/* Decorative halo */}
          <div className="absolute -right-16 -top-16 w-40 h-40 rounded-full blur-3xl
            bg-[var(--mango)]/15 dark:bg-[var(--mango)]/8" />

          <div className="relative z-10">
            {/* Period selector */}
            <div className="flex items-center gap-1.5 mb-4">
              {PERIODOS.map((p, i) => (
                <button
                  key={i}
                  onClick={() => setPeriodoIdx(i)}
                  className={`px-3 py-1.5 rounded-full text-[11px] font-bold transition-all press-scale ${
                    periodoIdx === i
                      ? 'text-white dark:text-[var(--charcoal)]'
                      : 'text-zinc-400 dark:text-zinc-500 hover:text-zinc-600 dark:hover:text-zinc-300'
                  }`}
                  style={periodoIdx === i ? {
                    background: 'var(--gradient-mango)',
                    boxShadow: '0 2px 8px rgba(245,166,35,0.35)'
                  } : {}}
                >
                  {p.label}
                </button>
              ))}
            </div>

            <p className="text-[10px] font-extrabold text-zinc-400 dark:text-zinc-500
              uppercase tracking-[0.1em]">
              Balance General
            </p>

            {cBal ? (
              <div className="h-10 w-48 rounded-xl bg-zinc-100 dark:bg-zinc-800 animate-pulse mt-2" />
            ) : (
              <h2
                className="text-3xl font-black mt-2 tracking-tight font-mono-num animate-counter"
                style={{
                  color: positivo ? undefined : '#EF4444',
                }}
              >
                <span className="text-zinc-900 dark:text-white">
                  {fmtBalance(Math.abs(saldo))}
                </span>
              </h2>
            )}

            {/* Savings rate badge */}
            {!cBal && (
              <div className="mt-3 flex items-center gap-3">
                <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full ${
                  positivo
                    ? 'bg-emerald-100/70 dark:bg-emerald-900/20'
                    : 'bg-red-100/70 dark:bg-red-900/20'
                }`}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                    <path d={positivo ? "M7 17l9.2-9.2M17 17V7H7" : "M17 7l-9.2 9.2M7 7v10h10"}
                      stroke={positivo ? 'var(--leaf)' : '#EF4444'}
                      strokeWidth="2.5" strokeLinecap="round" />
                  </svg>
                  <span className={`text-[10px] font-extrabold ${
                    positivo
                      ? 'text-emerald-700 dark:text-emerald-400'
                      : 'text-red-600 dark:text-red-400'
                  }`}>
                    {tasaAhorro}% tasa de ahorro
                  </span>
                </div>
              </div>
            )}

            {/* Income/Expense pills */}
            {!cBal && (
              <div className="grid grid-cols-2 gap-3 mt-4">
                <button
                  onClick={() => abrirModal('ingreso')}
                  className="flex items-center gap-2.5 p-3.5 rounded-2xl
                    bg-emerald-50/80 dark:bg-emerald-900/10
                    border border-emerald-100/60 dark:border-emerald-800/20
                    hover:border-emerald-200 dark:hover:border-emerald-800/40
                    transition-all press-scale"
                >
                  <span className="text-lg">💰</span>
                  <div className="text-left">
                    <p className="text-[9px] font-extrabold text-zinc-400 dark:text-zinc-500 uppercase tracking-wide">
                      Ingresos
                    </p>
                    <p className="text-sm font-black text-emerald-700 dark:text-emerald-400 font-mono-num">
                      {fmtAbrev(balance?.total_ingresos ?? 0)}
                    </p>
                  </div>
                </button>
                <button
                  onClick={() => abrirModal('gasto')}
                  className="flex items-center gap-2.5 p-3.5 rounded-2xl
                    bg-red-50/80 dark:bg-red-900/10
                    border border-red-100/60 dark:border-red-800/20
                    hover:border-red-200 dark:hover:border-red-800/40
                    transition-all press-scale"
                >
                  <span className="text-lg">💸</span>
                  <div className="text-left">
                    <p className="text-[9px] font-extrabold text-zinc-400 dark:text-zinc-500 uppercase tracking-wide">
                      Gastos
                    </p>
                    <p className="text-sm font-black text-red-600 dark:text-red-400 font-mono-num">
                      {fmtAbrev(balance?.total_gastos ?? 0)}
                    </p>
                  </div>
                </button>
              </div>
            )}
          </div>
        </section>

        {/* ── Chart — Glass Card ── */}
        <section className="p-6 rounded-[22px]
          bg-white/85 dark:bg-[var(--dark-card)]/95
          backdrop-blur-2xl
          border border-white/60 dark:border-[var(--dark-border)]
          shadow-[var(--shadow-sm)]">
          <div className="flex justify-between items-center mb-5">
            <h3 className="text-sm font-black font-display text-zinc-800 dark:text-white">
              Evolución Mensual
            </h3>
            <div className="flex gap-4">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full inline-block bg-[var(--leaf)]" />
                <span className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500">Ingresos</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full inline-block bg-red-500" />
                <span className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500">Gastos</span>
              </div>
            </div>
          </div>
          <ChartEvolucion datos={evolucion} cargando={cEvo} />
        </section>

        {/* ── Quick Access Grid ── */}
        <div className="grid grid-cols-4 gap-2.5">
          {[
            { to: '/movimientos', emoji: '📋', label: 'Historial' },
            { to: '/presupuestos', emoji: '📊', label: 'Límites' },
            { to: '/inversiones', emoji: '📈', label: 'Inversiones' },
            { to: '/cotizaciones', emoji: '💱', label: 'Dólar' },
          ].map(({ to, emoji, label }) => (
            <Link
              key={to}
              to={to}
              className="flex flex-col items-center gap-2 p-3.5 rounded-[18px]
                bg-white/85 dark:bg-[var(--dark-card)]
                border border-white/60 dark:border-[var(--dark-border)]
                shadow-[var(--shadow-xs)]
                hover:scale-105 active:scale-95 transition-all"
            >
              <span className="text-xl">{emoji}</span>
              <span className="text-[9px] font-semibold text-zinc-500 dark:text-zinc-400 text-center">{label}</span>
            </Link>
          ))}
        </div>

        {/* ── Budget Alerts ── */}
        {presupuestosEnAlerta.length > 0 && (
          <div className="space-y-3">
            {presupuestosEnAlerta.map(p => (
              <PresupuestoCritico key={p.id} presupuesto={p} />
            ))}
          </div>
        )}

        {/* ── Goal Preview ── */}
        {metaPrincipal && <MetaCard meta={metaPrincipal} />}

        {/* ── Recent Movements ── */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <p className="text-[10px] font-extrabold uppercase tracking-[0.1em] text-zinc-400 dark:text-zinc-500">
              Movimientos recientes
            </p>
            <Link
              to="/movimientos"
              className="text-[11px] font-bold text-[var(--mango-dark)] dark:text-[var(--mango)]
                hover:underline transition-colors"
            >
              Ver todos →
            </Link>
          </div>

          {cMovs ? (
            <div className="space-y-2">
              {[0, 1, 2].map(i => (
                <div key={i} className="h-14 rounded-2xl animate-pulse
                  bg-zinc-100 dark:bg-zinc-800" />
              ))}
            </div>
          ) : movimientos.length === 0 ? (
            <button
              onClick={() => abrirModal('gasto')}
              className="w-full flex flex-col items-center py-10 rounded-[20px]
                border-2 border-dashed border-zinc-200 dark:border-zinc-700
                hover:border-[var(--mango)]/40
                bg-white/60 dark:bg-[var(--dark-card)]/60
                active:scale-[0.97] transition-all"
            >
              <span className="text-3xl mb-2">💸</span>
              <p className="text-sm font-semibold text-zinc-500 dark:text-zinc-400">Sin movimientos este período</p>
              <p className="text-[11px] text-zinc-400 dark:text-zinc-500 mt-1">Tocá para registrar el primero →</p>
            </button>
          ) : (
            <div className="rounded-[20px] overflow-hidden
              bg-white/85 dark:bg-[var(--dark-card)]
              backdrop-blur-2xl
              border border-white/60 dark:border-[var(--dark-border)]
              shadow-[var(--shadow-sm)]">
              {movimientos.slice(0, 6).map((m, i) => (
                <div key={m.id}
                  className={i > 0 ? 'border-t border-zinc-50 dark:border-zinc-800/60' : ''}>
                  <MovCard movimiento={m} compact />
                </div>
              ))}
              {movimientos.length > 6 && (
                <Link
                  to="/movimientos"
                  className="block text-center py-3.5 text-[11px] font-bold
                    text-zinc-400 dark:text-zinc-500
                    hover:text-[var(--mango-dark)] dark:hover:text-[var(--mango)]
                    border-t border-zinc-50 dark:border-zinc-800/60 transition-colors"
                >
                  Ver {movimientos.length - 6} movimientos más →
                </Link>
              )}
            </div>
          )}
        </div>

        {/* ── FAB ── */}
        <FAB onClick={() => abrirModal('gasto')} />
      </div>

      {/* ── Form Modal ── */}
      <Modal
        abierto={modalAbierto}
        onCerrar={() => setModalAbierto(false)}
        titulo={tipoDefault === 'ingreso' ? '💰 Registrar ingreso' : '💸 Registrar gasto'}
        ancho="max-w-md"
      >
        <FormMovimiento
          valoresIniciales={{ tipo: tipoDefault }}
          onSubmit={handleGuardar}
          onCancel={() => setModalAbierto(false)}
        />
      </Modal>
    </>
  )
}

// ─── Wrapper ──────────────────────────────────────────────────
export default function DashboardPageWrapped() {
  return (
    <div className="animate-in fade-in duration-500 min-h-screen mesh-bg">
      <PageWrapper className="!bg-transparent">
        <DashboardPage />
      </PageWrapper>
    </div>
  )
}