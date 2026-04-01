// src/pages/Dashboard/index.jsx — Vista simplificada con expansión progresiva

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
    return <div className="w-full h-28 rounded-2xl bg-white/5 animate-pulse" />
  }
  if (!datos.length) return null

  const W = 400, H = 100
  const PL = 12, PR = 12, PT = 8, PB = 24
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
          <stop offset="0%"   stopColor="rgba(245,166,35,0.18)" />
          <stop offset="100%" stopColor="rgba(245,166,35,0.01)" />
        </linearGradient>
        <linearGradient id="g2" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%"   stopColor="rgba(255,255,255,0.5)" />
          <stop offset="100%" stopColor="rgba(245,166,35,0.7)" />
        </linearGradient>
      </defs>
      <path d={areaD} fill="url(#g1)" />
      <polyline
        points={datos.map((d, i) => `${px(i)},${py(d.gastos)}`).join(' ')}
        fill="none" stroke="rgba(252,165,165,0.5)"
        strokeWidth="1.5" strokeDasharray="5 4" strokeLinecap="round"
      />
      <polyline
        points={datos.map((d, i) => `${px(i)},${py(d.ingresos)}`).join(' ')}
        fill="none" stroke="url(#g2)"
        strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"
      />
      {datos.map((d, i) => (
        <g key={i}>
          <circle cx={px(i)} cy={py(d.ingresos)} r="3" fill="white" opacity="0.75" />
          <circle cx={px(i)} cy={py(d.ingresos)} r="5" fill="white" opacity="0.08" />
          <text x={px(i)} y={H - 4} textAnchor="middle" fontSize="8.5"
            fill="rgba(255,255,255,0.38)" fontWeight="500">
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
        boxShadow: '0 6px 24px rgba(245,166,35,0.65), 0 2px 8px rgba(0,0,0,0.2)',
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

// ─── Ícono chevron animado ────────────────────────────────────
function ChevronIcon({ abierto }) {
  return (
    <svg
      width="16" height="16" viewBox="0 0 16 16" fill="none"
      stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"
      className={`transition-transform duration-500 ${abierto ? 'rotate-180' : 'rotate-0'}`}
    >
      <path d="M3 6l5 5 5-5" />
    </svg>
  )
}

// ─── PÁGINA ──────────────────────────────────────────────────
export function DashboardPage() {
  const { usuario }                         = useAuthContext()
  const [periodoIdx, setPeriodoIdx]         = useState(0)
  const [modalAbierto, setModalAbierto]     = useState(false)
  const [tipoDefault, setTipoDefault]       = useState('gasto')
  const [expandido, setExpandido]           = useState(false)

  const offset           = PERIODOS[periodoIdx].offset
  const { desde, hasta } = useRangoMes(offset)

  const { balance, cargando: cBal }          = useBalance(desde, hasta)
  const { datos: evolucion, cargando: cEvo } = useEvolucionMensual(6)
  const { presupuestos }                     = usePresupuestos()
  const { movimientos, cargando: cMovs, agregar } = useMovimientos({ desde, hasta })

  const saldo    = (balance?.total_ingresos ?? 0) - (balance?.total_gastos ?? 0)
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
          HERO — balance + gráfico (siempre visible)
      ════════════════════════════════════════ */}
      <div
        className="relative overflow-hidden rounded-2xl mb-5 p-6"
        style={{
          background: 'linear-gradient(155deg, #1C1410 0%, #2A1B0C 40%, #1E160D 100%)',
          boxShadow: '0 8px 32px rgba(0,0,0,0.35), 0 2px 8px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.04)',
        }}
      >
        {/* Halo ambiental mejorado */}
        <div className="absolute inset-0 pointer-events-none" aria-hidden style={{
          background:
            'radial-gradient(ellipse at 15% 50%, rgba(245,166,35,0.18) 0%, transparent 55%), ' +
            'radial-gradient(ellipse at 85% 15%, rgba(245,166,35,0.09) 0%, transparent 50%), ' +
            'radial-gradient(ellipse at 50% 100%, rgba(245,166,35,0.05) 0%, transparent 40%)',
        }} />

        {/* Borde interior sutil */}
        <div className="absolute inset-0 rounded-2xl pointer-events-none" aria-hidden
          style={{ border: '1px solid rgba(255,255,255,0.06)' }} />

        {/* Selector período */}
        <div className="relative z-10 flex items-center gap-2 mb-6">
          {PERIODOS.map((p, i) => (
            <button key={i} onClick={() => setPeriodoIdx(i)}
              className={`px-3.5 py-1.5 rounded-full text-[11px] font-bold transition-all duration-200 ${
                periodoIdx === i
                  ? 'bg-[#F5A623] text-[#1C1410] shadow-lg shadow-amber-500/20'
                  : 'bg-white/8 text-white/40 hover:bg-white/12 hover:text-white/55'
              }`}
            >
              {p.label}
            </button>
          ))}
          <span className="ml-auto text-[10px] text-white/25 capitalize truncate max-w-[110px] font-medium">
            {mesLabel}
          </span>
        </div>

        {/* Saldo principal */}
        <div className="relative z-10 mb-5">
          <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/28 mb-2.5">
            Saldo del período
          </p>
          {cBal ? (
            <div className="h-12 w-44 rounded-2xl bg-white/8 animate-pulse" />
          ) : (
            <>
              <div className="flex items-baseline gap-1.5">
                <span className="text-lg font-bold text-white/25 leading-none self-end mb-0.5">$</span>
                <span
                  className={`leading-none font-black tracking-tighter ${positivo ? 'text-white' : 'text-red-300'}`}
                  style={{ fontSize: 'clamp(2.6rem, 9vw, 3.4rem)', fontFamily: 'var(--font-display)' }}
                >
                  {fmtAbrev(Math.abs(saldo))}
                </span>
                {!positivo && (
                  <span className="text-xs font-bold text-red-400/60 ml-1.5 self-end mb-1">negativo</span>
                )}
              </div>
              <p className="text-[10px] text-white/20 mt-1.5 tabular-nums font-medium">
                {fmtFull(Math.abs(saldo))} ARS
              </p>
            </>
          )}
        </div>

        {/* Pills ing/gas */}
        <div className="relative z-10 flex gap-3 mb-6">
          {[
            { label: 'Ingresos', val: balance?.total_ingresos ?? 0, emoji: '📥', color: 'text-emerald-300' },
            { label: 'Gastos',   val: balance?.total_gastos   ?? 0, emoji: '📤', color: 'text-red-300'     },
          ].map(({ label, val, emoji, color }) => (
            <div key={label}
              className="flex-1 rounded-2xl p-3.5 transition-all duration-200 hover:bg-white/10"
              style={{
                background: 'rgba(255,255,255,0.06)',
                border: '1px solid rgba(255,255,255,0.07)',
                backdropFilter: 'blur(8px)',
              }}>
              <div className="flex items-center gap-1.5 mb-1">
                <span className="text-sm">{emoji}</span>
                <span className="text-[9px] font-bold text-white/35 uppercase tracking-wider">{label}</span>
              </div>
              <p className={`text-base font-black leading-none ${color}`}>
                ${fmtAbrev(val)}
              </p>
            </div>
          ))}
        </div>

        {/* Gráfico — contenedor con aire */}
        <div className="relative z-10 rounded-xl p-4 -mx-1"
          style={{
            background: 'rgba(255,255,255,0.03)',
            border: '1px solid rgba(255,255,255,0.05)',
          }}>
          <div className="flex items-center justify-between mb-3">
            <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-white/25">
              Evolución · 6 meses
            </p>
            <div className="flex gap-3.5">
              {[
                { c: 'bg-white/60', l: 'Ingresos' },
                { c: 'bg-red-300/50', l: 'Gastos', dashed: true },
              ].map(({ c, l, dashed }) => (
                <div key={l} className="flex items-center gap-1.5">
                  {dashed
                    ? <div style={{ width: 14, borderTop: '1.5px dashed rgba(252,165,165,0.5)', height: 0 }} />
                    : <div className={`w-3.5 h-0.5 ${c} rounded-full`} />
                  }
                  <span className="text-[8px] text-white/30 font-medium">{l}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="mt-1">
            <ChartEvolucion datos={evolucion} cargando={cEvo} />
          </div>
        </div>
      </div>

      {/* ════════════════════════════════════════
          BOTÓN "VER MÁS DETALLES" — secondary modern
      ════════════════════════════════════════ */}
      <button
        onClick={() => setExpandido(e => !e)}
        className={`
          group w-full flex items-center justify-center gap-2.5
          py-3.5 mb-5 rounded-2xl font-bold text-sm
          transition-all duration-300 active:scale-[0.97]
          ${expandido
            ? 'bg-white dark:bg-zinc-900 border border-[var(--mango)]/25 text-[var(--mango-dark)] dark:text-[var(--mango)] shadow-md shadow-amber-500/5'
            : 'bg-white/80 dark:bg-zinc-900/70 border border-zinc-200/80 dark:border-zinc-700/50 text-zinc-600 dark:text-zinc-300 hover:border-[var(--mango)]/35 hover:text-[var(--mango-dark)] dark:hover:text-[var(--mango)] hover:shadow-md hover:shadow-amber-500/8'
          }
        `}
        style={{
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
        }}
      >
        <span className="relative">
          {expandido ? 'Ocultar detalles' : 'Ver más detalles'}
          <span className={`absolute -bottom-0.5 left-0 h-[2px] rounded-full bg-[var(--mango)] transition-all duration-300 ${expandido ? 'w-full' : 'w-0 group-hover:w-full'}`} />
        </span>
        <ChevronIcon abierto={expandido} />
      </button>

      {/* ════════════════════════════════════════
          CONTENIDO EXPANDIBLE (con animación suave)
      ════════════════════════════════════════ */}
      <div
        className="overflow-hidden transition-all duration-500 ease-in-out"
        style={{
          maxHeight: expandido ? '9999px' : '0px',
          opacity:   expandido ? 1 : 0,
        }}
      >
        <div className="flex flex-col gap-5">

          {/* Botones rápidos ingreso / gasto */}
          <div className="grid grid-cols-2 gap-3">
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

          {/* Alerta presupuesto */}
          {presupuestos.length > 0 && <AlertaPresupuesto presupuestos={presupuestos} />}

          {/* Accesos rápidos */}
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-zinc-400 dark:text-zinc-500 mb-3">
              Acceso rápido
            </p>
            <div className="grid grid-cols-4 gap-2.5">
              {[
                { to: '/movimientos',  emoji: '📋', label: 'Historial', bg: 'bg-zinc-50 dark:bg-zinc-800/60' },
                { to: '/presupuestos', emoji: '📊', label: 'Límites',   bg: 'bg-amber-50/70 dark:bg-amber-900/15' },
                { to: '/inversiones',  emoji: '📈', label: 'Inversiones', bg: 'bg-emerald-50/70 dark:bg-emerald-900/15' },
                { to: '/cotizaciones', emoji: '💱', label: 'Dólar',     bg: 'bg-violet-50/70 dark:bg-violet-900/15' },
              ].map(({ to, emoji, label, bg }) => (
                <Link key={to} to={to}
                  className={`${bg} rounded-2xl p-3.5 flex flex-col items-center gap-2
                    border border-zinc-100/60 dark:border-zinc-700/30
                    shadow-sm dark:shadow-none
                    hover:scale-105 hover:shadow-md active:scale-95 transition-all duration-200`}
                >
                  <span className="text-[22px]">{emoji}</span>
                  <span className="text-[9px] font-semibold text-zinc-500 dark:text-zinc-400 text-center leading-tight">
                    {label}
                  </span>
                </Link>
              ))}
            </div>
          </div>

          {/* Movimientos recientes */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-zinc-400 dark:text-zinc-500">
                Movimientos recientes
              </p>
              <Link to="/movimientos"
                className="text-[11px] font-bold text-[var(--mango-dark)] dark:text-[var(--mango)] hover:underline underline-offset-2">
                Ver todos →
              </Link>
            </div>

            {cMovs ? (
              <div className="flex flex-col gap-2.5">
                {[0,1,2].map(i => (
                  <div key={i} className="h-14 rounded-2xl bg-zinc-100 dark:bg-zinc-800/60 animate-pulse" />
                ))}
              </div>
            ) : movimientos.length === 0 ? (
              <button
                onClick={() => abrirModal('gasto')}
                className="w-full flex flex-col items-center py-10 rounded-2xl
                  border-2 border-dashed border-zinc-200 dark:border-zinc-700
                  hover:border-[var(--mango)]/40 hover:bg-[var(--mango)]/3
                  active:scale-[0.97] transition-all duration-200"
              >
                <span className="text-3xl mb-2">💸</span>
                <p className="text-sm font-semibold text-zinc-500">Sin movimientos este período</p>
                <p className="text-[11px] text-zinc-400 mt-1">Tocá para registrar el primero →</p>
              </button>
            ) : (
              <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-100 dark:border-zinc-800 overflow-hidden shadow-sm dark:shadow-none">
                {movimientos.slice(0, 7).map((m, i) => (
                  <div key={m.id}
                    className={i > 0 ? 'border-t border-zinc-50 dark:border-zinc-800/50' : ''}>
                    <MovCard movimiento={m} compact />
                  </div>
                ))}
                {movimientos.length > 7 && (
                  <Link to="/movimientos"
                    className="block text-center py-3.5 text-[11px] font-bold text-zinc-400
                      hover:text-[var(--mango-dark)] dark:hover:text-[var(--mango)]
                      border-t border-zinc-50 dark:border-zinc-800/50 transition-colors">
                    Ver {movimientos.length - 7} movimientos más →
                  </Link>
                )}
              </div>
            )}
          </div>

        </div>
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

// ─── Wrapper con PageWrapper ───────────────────────────────────
export default function DashboardPageWrapped() {
  return (
    <div className="animate-in fade-in duration-500">
      <PageWrapper>
        <DashboardPage />
      </PageWrapper>
    </div>
  )
}