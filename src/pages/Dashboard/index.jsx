// src/pages/Dashboard/index.jsx — Rediseño App-Like
// Reemplazá el contenido de src/pages/Dashboard/index.jsx con este archivo.

import { useState, useMemo, useCallback } from 'react'
import { Link }                           from 'react-router-dom'
import { useAuthContext }                 from '../../context/AuthContext'
import {
  useBalance,
  useEvolucionMensual,
  useMovimientos,
}                                         from '../../hooks/useMovimientos'
import { usePresupuestos }                from '../../hooks/usePresupuestos'
import { PageWrapper }                    from '../../components/layout'
import { MovCard }                        from '../../components/layout/MovCard'
import { Modal }                          from '../../components/ui/Modal'
import { FormMovimiento }                 from '../../components/forms/FormMovimiento'

// ─── Utilidades ──────────────────────────────────────────────
function useRangoMes(offsetMeses = 0) {
  return useMemo(() => {
    const hoy = new Date()
    const d   = new Date(hoy.getFullYear(), hoy.getMonth() + offsetMeses, 1)
    const desde = d.toLocaleDateString('sv-SE')
    const hasta =
      offsetMeses === 0
        ? hoy.toLocaleDateString('sv-SE')
        : new Date(d.getFullYear(), d.getMonth() + 1, 0).toLocaleDateString('sv-SE')
    return { desde, hasta }
  }, [offsetMeses])
}

function fmtAbrev(n) {
  const abs = Math.abs(n)
  if (abs >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (abs >= 100_000)   return `${(n / 1_000).toFixed(0)}K`
  return Number(n).toLocaleString('es-AR', { maximumFractionDigits: 0 })
}

function fmtFull(n) {
  return `$\u00A0${Number(n).toLocaleString('es-AR', { maximumFractionDigits: 0 })}`
}

// ─── Gráfico de evolución integrado ──────────────────────────
function ChartEvolucion({ datos = [], cargando }) {
  if (cargando) {
    return <div className="w-full h-24 rounded-xl bg-white/8 animate-pulse" />
  }
  if (!datos.length) return null

  const W = 400, H = 88
  const PL = 8, PR = 8, PT = 4, PB = 20
  const iW = W - PL - PR
  const iH = H - PT - PB
  const maxV = Math.max(...datos.flatMap(d => [d.ingresos, d.gastos]), 1)
  const xS  = datos.length > 1 ? iW / (datos.length - 1) : iW
  const px  = (i) => PL + i * xS
  const py  = (v) => PT + iH - (v / maxV) * iH

  const areaD = [
    `M ${px(0)} ${PT + iH}`,
    ...datos.map((d, i) => `L ${px(i)} ${py(d.ingresos)}`),
    `L ${px(datos.length - 1)} ${PT + iH} Z`,
  ].join(' ')

  return (
    <svg width="100%" viewBox={`0 0 ${W} ${H}`} className="overflow-visible">
      <defs>
        <linearGradient id="g1" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor="rgba(255,255,255,0.22)" />
          <stop offset="100%" stopColor="rgba(255,255,255,0.01)" />
        </linearGradient>
      </defs>

      {/* Área */}
      <path d={areaD} fill="url(#g1)" />

      {/* Línea gastos — punteada roja */}
      <polyline
        points={datos.map((d, i) => `${px(i)},${py(d.gastos)}`).join(' ')}
        fill="none" stroke="rgba(252,165,165,0.55)"
        strokeWidth="1.5" strokeDasharray="4 3" strokeLinecap="round"
      />

      {/* Línea ingresos */}
      <polyline
        points={datos.map((d, i) => `${px(i)},${py(d.ingresos)}`).join(' ')}
        fill="none" stroke="rgba(255,255,255,0.85)"
        strokeWidth="2" strokeLinecap="round"
      />

      {/* Puntos y etiquetas */}
      {datos.map((d, i) => (
        <g key={i}>
          <circle cx={px(i)} cy={py(d.ingresos)} r="2.5" fill="white" opacity="0.65" />
          <text x={px(i)} y={H - 4} textAnchor="middle" fontSize="8"
            fill="rgba(255,255,255,0.32)">
            {d.label}
          </text>
        </g>
      ))}
    </svg>
  )
}

// ─── Alerta presupuesto ───────────────────────────────────────
function AlertaPresupuesto({ presupuestos }) {
  const excedidos = presupuestos.filter(p => p.porcentaje >= 100)
  const alertas   = presupuestos.filter(p => p.porcentaje >= p.alerta_pct && p.porcentaje < 100)
  if (!excedidos.length && !alertas.length) return null

  const n   = excedidos.length + alertas.length
  const mal = excedidos.length > 0

  return (
    <Link to="/presupuestos"
      className={`flex items-center gap-3 px-4 py-3 rounded-2xl mb-4 border active:scale-[0.98] transition-all
        ${mal
          ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800/40'
          : 'bg-amber-50 dark:bg-amber-900/15 border-amber-200 dark:border-amber-800/30'}`}
    >
      <span className="text-xl">{mal ? '🚨' : '⚠️'}</span>
      <div className="flex-1 min-w-0">
        <p className={`text-sm font-bold ${mal ? 'text-red-700 dark:text-red-400' : 'text-amber-700 dark:text-amber-500'}`}>
          {mal
            ? `${excedidos.length} presupuesto${excedidos.length > 1 ? 's' : ''} excedido${excedidos.length > 1 ? 's' : ''}`
            : `${n} presupuesto${n > 1 ? 's' : ''} cerca del límite`}
        </p>
        <p className="text-[10px] text-zinc-400 mt-0.5">Tocá para revisar →</p>
      </div>
    </Link>
  )
}

// ─── FAB ─────────────────────────────────────────────────────
function FAB({ onClick }) {
  return (
    <button
      onClick={onClick}
      aria-label="Agregar movimiento"
      className="fixed bottom-24 right-4 z-40 md:bottom-8 md:right-8
        w-[60px] h-[60px] rounded-[20px] flex items-center justify-center
        active:scale-90 transition-transform duration-150"
      style={{
        background: 'linear-gradient(145deg, #F8B133 0%, #D4730A 100%)',
        boxShadow:
          '0 6px 24px rgba(245,166,35,0.65), 0 2px 8px rgba(0,0,0,0.2)',
      }}
    >
      <svg width="26" height="26" viewBox="0 0 24 24"
        fill="none" stroke="#1C1410" strokeWidth="2.8" strokeLinecap="round">
        <line x1="12" y1="4" x2="12" y2="20" />
        <line x1="4"  y1="12" x2="20" y2="12" />
      </svg>
    </button>
  )
}

// ─── Períodos ─────────────────────────────────────────────────
const PERIODOS = [
  { label: 'Este mes', offset: 0 },
  { label: 'Anterior', offset: -1 },
  { label: 'Hace 2',   offset: -2 },
]

// ─── PÁGINA ──────────────────────────────────────────────────
export function DashboardPage() {
  const { usuario }                         = useAuthContext()
  const [periodoIdx, setPeriodoIdx]         = useState(0)
  const [modalAbierto, setModalAbierto]     = useState(false)
  const [tipoDefault, setTipoDefault]       = useState('gasto')

  const offset           = PERIODOS[periodoIdx].offset
  const { desde, hasta } = useRangoMes(offset)

  const { balance, cargando: cBal }          = useBalance(desde, hasta)
  const { datos: evolucion, cargando: cEvo } = useEvolucionMensual(6)
  const { presupuestos }                     = usePresupuestos()
  const { movimientos, cargando: cMovs, agregar } = useMovimientos({ desde, hasta })

  const saldo   = (balance?.total_ingresos ?? 0) - (balance?.total_gastos ?? 0)
  const positivo = saldo >= 0

  const mesLabel = useMemo(() => {
    const d = new Date()
    d.setMonth(d.getMonth() + offset)
    return d.toLocaleDateString('es-AR', { month: 'long', year: 'numeric' })
  }, [offset])

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

      {/* ════════════════════════════════════════
          HERO — balance + gráfico
      ════════════════════════════════════════ */}
      <div
        className="relative overflow-hidden rounded-[28px] mb-4 p-5"
        style={{
          background: 'linear-gradient(150deg, #1A1208 0%, #291A07 48%, #1A1108 100%)',
        }}
      >
        {/* Halo ambiental */}
        <div className="absolute inset-0 pointer-events-none" aria-hidden style={{
          background:
            'radial-gradient(ellipse at 18% 55%, rgba(245,166,35,0.15) 0%, transparent 52%), ' +
            'radial-gradient(ellipse at 82% 18%, rgba(245,166,35,0.07) 0%, transparent 48%)',
        }} />

        {/* Selector período */}
        <div className="relative z-10 flex items-center gap-1.5 mb-5">
          {PERIODOS.map((p, i) => (
            <button key={i} onClick={() => setPeriodoIdx(i)}
              className={`px-3 py-1.5 rounded-full text-[11px] font-bold transition-all ${
                periodoIdx === i
                  ? 'bg-[#F5A623] text-[#1C1410]'
                  : 'bg-white/10 text-white/40 hover:bg-white/15'
              }`}
            >
              {p.label}
            </button>
          ))}
          <span className="ml-auto text-[9px] text-white/22 capitalize truncate max-w-[100px]">
            {mesLabel}
          </span>
        </div>

        {/* Saldo principal */}
        <div className="relative z-10 mb-4">
          <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-white/30 mb-2">
            Saldo del período
          </p>
          {cBal ? (
            <div className="h-12 w-40 rounded-xl bg-white/10 animate-pulse" />
          ) : (
            <>
              <div className="flex items-baseline gap-1">
                <span className="text-lg font-bold text-white/30 leading-none self-end mb-0.5">$</span>
                <span
                  className={`leading-none font-black tracking-tighter ${positivo ? 'text-white' : 'text-red-300'}`}
                  style={{ fontSize: 'clamp(2.6rem, 9vw, 3.4rem)', fontFamily: 'var(--font-display)' }}
                >
                  {fmtAbrev(Math.abs(saldo))}
                </span>
                {!positivo && (
                  <span className="text-xs font-bold text-red-400/70 ml-1 self-end mb-1">negativo</span>
                )}
              </div>
              <p className="text-[10px] text-white/18 mt-1 tabular-nums">
                {fmtFull(Math.abs(saldo))} ARS
              </p>
            </>
          )}
        </div>

        {/* Pills ing/gas */}
        <div className="relative z-10 flex gap-2.5 mb-5">
          {[
            { label: 'Ingresos', val: balance?.total_ingresos ?? 0, emoji: '📥', color: 'text-emerald-300' },
            { label: 'Gastos',   val: balance?.total_gastos   ?? 0, emoji: '📤', color: 'text-red-300'     },
          ].map(({ label, val, emoji, color }) => (
            <div key={label}
              className="flex-1 bg-white/8 rounded-2xl p-3 border border-white/8">
              <div className="flex items-center gap-1 mb-0.5">
                <span className="text-sm">{emoji}</span>
                <span className="text-[9px] font-bold text-white/35 uppercase tracking-wide">{label}</span>
              </div>
              <p className={`text-[15px] font-black leading-none ${color}`}>
                ${fmtAbrev(val)}
              </p>
            </div>
          ))}
        </div>

        {/* Gráfico */}
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-2">
            <p className="text-[9px] font-bold uppercase tracking-[0.15em] text-white/22">
              Evolución · 6 meses
            </p>
            <div className="flex gap-3">
              {[
                { c: 'bg-white/60', l: 'Ingresos' },
                { c: 'bg-red-300/50', l: 'Gastos', dashed: true },
              ].map(({ c, l, dashed }) => (
                <div key={l} className="flex items-center gap-1">
                  {dashed
                    ? <div style={{ width: 12, borderTop: '1.5px dashed rgba(252,165,165,0.55)', height: 0 }} />
                    : <div className={`w-3 h-0.5 ${c} rounded-full`} />
                  }
                  <span className="text-[8px] text-white/28">{l}</span>
                </div>
              ))}
            </div>
          </div>
          <ChartEvolucion datos={evolucion} cargando={cEvo} />
        </div>
      </div>

      {/* ════════════════════════════════════════
          BOTONES RÁPIDOS ingreso / gasto
      ════════════════════════════════════════ */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        {[
          {
            tipo: 'ingreso',
            emoji: '💰',
            label: 'Ingreso',
            sub: 'Sueldo, cobro…',
            hoverBorder: 'hover:border-emerald-300 dark:hover:border-emerald-700/50',
            hoverBg: 'hover:bg-emerald-50/60 dark:hover:bg-emerald-900/10',
            iconBg: 'bg-emerald-100 dark:bg-emerald-900/40',
          },
          {
            tipo: 'gasto',
            emoji: '💸',
            label: 'Gasto',
            sub: 'Compra, servicio…',
            hoverBorder: 'hover:border-red-300 dark:hover:border-red-700/50',
            hoverBg: 'hover:bg-red-50/60 dark:hover:bg-red-900/10',
            iconBg: 'bg-red-100 dark:bg-red-900/40',
          },
        ].map(({ tipo, emoji, label, sub, hoverBorder, hoverBg, iconBg }) => (
          <button
            key={tipo}
            onClick={() => abrirModal(tipo)}
            className={`group flex items-center gap-3 p-4 rounded-2xl text-left
              bg-white dark:bg-zinc-900
              border border-zinc-100 dark:border-zinc-800
              ${hoverBorder} ${hoverBg}
              active:scale-[0.97] transition-all shadow-sm`}
          >
            <div className={`w-11 h-11 rounded-xl flex items-center justify-center text-xl flex-shrink-0
              ${iconBg} group-hover:scale-110 transition-transform`}>
              {emoji}
            </div>
            <div>
              <p className="text-sm font-bold text-zinc-900 dark:text-white leading-tight">{label}</p>
              <p className="text-[10px] text-zinc-400 font-medium mt-0.5">{sub}</p>
            </div>
          </button>
        ))}
      </div>

      {/* ── Alerta presupuesto ── */}
      {presupuestos.length > 0 && <AlertaPresupuesto presupuestos={presupuestos} />}

      {/* ════════════════════════════════════════
          ACCESOS RÁPIDOS
      ════════════════════════════════════════ */}
      <div className="mb-5">
        <p className="text-[9px] font-bold uppercase tracking-[0.15em] text-zinc-400 mb-2.5">
          Acceso rápido
        </p>
        <div className="grid grid-cols-4 gap-2">
          {[
            { to: '/movimientos',  emoji: '📋', label: 'Historial', bg: 'bg-zinc-100 dark:bg-zinc-800/70' },
            { to: '/presupuestos', emoji: '📊', label: 'Límites',   bg: 'bg-amber-50 dark:bg-amber-900/20' },
            { to: '/inversiones',  emoji: '📈', label: 'Inversiones',bg:'bg-emerald-50 dark:bg-emerald-900/20'},
            { to: '/cotizaciones', emoji: '💱', label: 'Dólar',     bg: 'bg-violet-50 dark:bg-violet-900/20' },
          ].map(({ to, emoji, label, bg }) => (
            <Link key={to} to={to}
              className={`${bg} rounded-2xl p-3 flex flex-col items-center gap-1.5
                border border-zinc-100/50 dark:border-zinc-800/30
                hover:scale-105 active:scale-95 transition-all`}
            >
              <span className="text-[22px]">{emoji}</span>
              <span className="text-[9px] font-semibold text-zinc-500 dark:text-zinc-400 text-center leading-tight">
                {label}
              </span>
            </Link>
          ))}
        </div>
      </div>

      {/* ════════════════════════════════════════
          MOVIMIENTOS RECIENTES
      ════════════════════════════════════════ */}
      <div>
        <div className="flex items-center justify-between mb-2.5">
          <p className="text-[9px] font-bold uppercase tracking-[0.15em] text-zinc-400">
            Movimientos recientes
          </p>
          <Link to="/movimientos"
            className="text-[11px] font-bold text-[var(--mango-dark)] dark:text-[var(--mango)] hover:underline">
            Ver todos →
          </Link>
        </div>

        {cMovs ? (
          <div className="flex flex-col gap-2">
            {[0,1,2].map(i => (
              <div key={i} className="h-14 rounded-2xl bg-zinc-100 dark:bg-zinc-800 animate-pulse" />
            ))}
          </div>
        ) : movimientos.length === 0 ? (
          <button
            onClick={() => abrirModal('gasto')}
            className="w-full flex flex-col items-center py-10 rounded-2xl
              border-2 border-dashed border-zinc-200 dark:border-zinc-800
              hover:border-[var(--mango)]/40 hover:bg-[var(--mango)]/3
              active:scale-[0.98] transition-all"
          >
            <span className="text-3xl mb-2">💸</span>
            <p className="text-sm font-semibold text-zinc-500">Sin movimientos este período</p>
            <p className="text-[11px] text-zinc-400 mt-0.5">Tocá para registrar el primero →</p>
          </button>
        ) : (
          <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-100 dark:border-zinc-800 overflow-hidden">
            {movimientos.slice(0, 7).map((m, i) => (
              <div key={m.id}
                className={i > 0 ? 'border-t border-zinc-50 dark:border-zinc-800/50' : ''}>
                <MovCard movimiento={m} compact />
              </div>
            ))}
            {movimientos.length > 7 && (
              <Link to="/movimientos"
                className="block text-center py-3 text-[11px] font-bold text-zinc-400
                  hover:text-[var(--mango-dark)] dark:hover:text-[var(--mango)]
                  border-t border-zinc-50 dark:border-zinc-800/50 transition-colors">
                Ver {movimientos.length - 7} movimientos más →
              </Link>
            )}
          </div>
        )}
      </div>

      {/* ─── FAB ─── */}
      <FAB onClick={() => abrirModal('gasto')} />

      {/* ─── Modal ─── */}
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

// ─── Wrapper con PageWrapper (mantiene compatibilidad con router) ─
export default function DashboardPageWrapped() {
  return (
    <div className="animate-in fade-in duration-500">
      <PageWrapper>
        <DashboardPage />
      </PageWrapper>
    </div>
  )
}