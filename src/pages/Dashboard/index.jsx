// src/pages/Dashboard/index.jsx — REDISEÑO ESTÉTICO v2
import { useState, useMemo, useCallback } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuthContext } from '../../context/AuthContext'
import {
  useBalance,
  useEvolucionMensual,
  useMovimientos,
  useUltimosMovimientos,
} from '../../hooks/useMovimientos'
import { PageWrapper } from '../../components/layout'
import { MobileDrawer } from '../../components/layout/MobileDrawer'
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

function fmtAbrev(n) {
  const abs = Math.abs(n)
  if (abs >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`
  if (abs >= 100_000)   return `$${(n / 1_000).toFixed(0)}K`
  return Number(n).toLocaleString('es-AR', { maximumFractionDigits: 0, style: 'currency', currency: 'ARS' })
}

function fmtCompleto(n) {
  return Number(n).toLocaleString('es-AR', {
    style: 'currency', currency: 'ARS', maximumFractionDigits: 0,
  })
}

// ─── Gráfico de evolución mejorado ────────────────────────────
function ChartEvolucion({ datos = [], cargando }) {
  const [hover, setHover] = useState(null)

  if (cargando) return (
    <div className="w-full h-36 rounded-2xl bg-white/10 animate-pulse" />
  )
  if (!datos.length) return null

  const W = 400, H = 140
  const PL = 4, PR = 4, PT = 12, PB = 24
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
      d += ` C ${cpx} ${py(datos[i-1][campo])}, ${cpx} ${py(datos[i][campo])}, ${px(i)} ${py(datos[i][campo])}`
    }
    return d
  }

  return (
    <div className="relative w-full" onMouseLeave={() => setHover(null)}>
      <svg width="100%" height={H} viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" className="overflow-visible">
        <defs>
          <linearGradient id="gIng" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="rgba(255,255,255,0.25)" />
            <stop offset="100%" stopColor="rgba(255,255,255,0)" />
          </linearGradient>
          <linearGradient id="gGas" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="rgba(255,255,255,0.12)" />
            <stop offset="100%" stopColor="rgba(255,255,255,0)" />
          </linearGradient>
        </defs>

        {/* Áreas rellenas */}
        <path
          d={`${curva('gastos')} L ${px(datos.length-1)} ${H-PB} L ${px(0)} ${H-PB} Z`}
          fill="url(#gGas)"
        />
        <path
          d={`${curva('ingresos')} L ${px(datos.length-1)} ${H-PB} L ${px(0)} ${H-PB} Z`}
          fill="url(#gIng)"
        />

        {/* Líneas */}
        <path d={curva('gastos')} fill="none" stroke="rgba(255,255,255,0.45)" strokeWidth="1.5" strokeLinecap="round" />
        <path d={curva('ingresos')} fill="none" stroke="rgba(255,255,255,0.9)" strokeWidth="2" strokeLinecap="round" />

        {/* Puntos interactivos */}
        {datos.map((d, i) => (
          <g key={i} onMouseEnter={() => setHover(i)} style={{ cursor: 'pointer' }}>
            <rect x={px(i) - Math.max(xS/2, 16)} y={PT} width={Math.max(xS, 32)} height={iH} fill="transparent" />
            <circle cx={px(i)} cy={py(d.ingresos)} r={hover === i ? 4 : 2.5} fill="white" />
            <circle cx={px(i)} cy={py(d.gastos)} r={hover === i ? 3.5 : 2} fill="rgba(255,255,255,0.5)" />
            <text x={px(i)} y={H - 4} textAnchor="middle" fontSize="8" fill="rgba(255,255,255,0.55)" fontWeight="600">
              {d.label}
            </text>
          </g>
        ))}

        {/* Línea vertical en hover */}
        {hover !== null && (
          <line x1={px(hover)} y1={PT} x2={px(hover)} y2={H-PB}
            stroke="rgba(255,255,255,0.3)" strokeWidth="1" strokeDasharray="3 2" />
        )}
      </svg>

      {/* Tooltip */}
      {hover !== null && (
        <div className="absolute top-0 left-1/2 -translate-x-1/2 flex gap-3
          text-[10px] font-bold text-white/90">
          <span className="opacity-70">{datos[hover]?.label}</span>
          <span className="text-white">+{fmtAbrev(datos[hover]?.ingresos)}</span>
          <span className="text-white/60">-{fmtAbrev(datos[hover]?.gastos)}</span>
        </div>
      )}
    </div>
  )
}

// ─── Accesos rápidos ──────────────────────────────────────────
const ACCESOS = [
  { to: '/movimientos',   emoji: '💸', label: 'Movimientos',  color: '#F5A623' },
  { to: '/planificacion', emoji: '📊', label: 'Presupuestos', color: '#10B981' },
  { to: '/planificacion', emoji: '🎯', label: 'Metas',        color: '#8B5CF6' },
  { to: '/inversiones',   emoji: '📈', label: 'Inversiones',  color: '#3B82F6' },
  { to: '/agenda',        emoji: '📅', label: 'Agenda',       color: '#EC4899' },
  { to: '/cotizaciones',  emoji: '💱', label: 'Divisas',      color: '#F59E0B' },
  { to: '/nafta',         emoji: '⛽', label: 'Nafta',        color: '#6B7280' },
  { to: '/calculadora',   emoji: '🧮', label: 'Calculadora',  color: '#06B6D4' },
]

// ─── Tarjeta de movimiento reciente ─────────────────────────
function MovReciente({ m }) {
  const esIngreso = m.tipo === 'ingreso'
  const cat = m.categorias
  const montoAbs = Math.abs(Number(m.monto))
  const montoDisplay = montoAbs >= 1_000_000
    ? `$${(montoAbs/1_000_000).toFixed(1)}M`
    : montoAbs >= 100_000
      ? `$${(montoAbs/1_000).toFixed(0)}K`
      : `$${montoAbs.toLocaleString('es-AR', { maximumFractionDigits: 0 })}`
  const fechaFmt = new Date(m.fecha + 'T00:00:00').toLocaleDateString('es-AR', { day: 'numeric', month: 'short' })

  return (
    <div className="flex items-center gap-3 py-2.5 px-1">
      <div className="w-10 h-10 rounded-[14px] flex items-center justify-center text-lg flex-shrink-0 shadow-sm"
        style={{ background: (cat?.color ?? '#F5A623') + '18' }}>
        <span style={{ fontSize: 18 }}>{cat?.icono ?? '📦'}</span>
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[13px] font-semibold text-zinc-800 dark:text-zinc-100 truncate leading-tight">
          {m.descripcion || cat?.nombre}
        </p>
        <p className="text-[11px] text-zinc-400 mt-0.5">{cat?.nombre} · {fechaFmt}</p>
      </div>
      <div className="flex flex-col items-end flex-shrink-0">
        <span className={`text-[13px] font-black tabular-nums ${
          esIngreso ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500 dark:text-red-400'
        }`}>
          {esIngreso ? '+' : '-'}{montoDisplay}
        </span>
      </div>
    </div>
  )
}

// ─── PÁGINA PRINCIPAL ─────────────────────────────────────────
export function DashboardPage() {
  const { usuario } = useAuthContext()
  const navigate = useNavigate()
  const [drawerAbierto, setDrawerAbierto] = useState(false)
  const [modalAbierto, setModalAbierto]   = useState(false)
  const [tipoDefault, setTipoDefault]     = useState('gasto')
  const [saldoVisible, setSaldoVisible]   = useState(true)

  const { desde, hasta } = useRangoMes(0)
  const { balance, cargando: cBal }           = useBalance(desde, hasta)
  const { datos: evolucion, cargando: cEvo }  = useEvolucionMensual(6)
  const { movimientos: ultimos, cargando: cUlt } = useUltimosMovimientos(5)
  const { agregar }                            = useMovimientos({ desde, hasta })

  const ingresos = balance?.total_ingresos ?? 0
  const gastos   = balance?.total_gastos   ?? 0
  const saldo    = ingresos - gastos
  const positivo = saldo >= 0
  const mesActual = new Date().toLocaleDateString('es-AR', { month: 'long', year: 'numeric' })

  const abrirModal = useCallback((tipo = 'gasto') => {
    setTipoDefault(tipo)
    setModalAbierto(true)
  }, [])

  const handleGuardar = useCallback(async (datos) => {
    await agregar({ ...datos, usuario_id: usuario?.id })
    setModalAbierto(false)
  }, [agregar, usuario?.id])

  // Porcentaje de gastos sobre ingresos
  const pctGastos = ingresos > 0 ? Math.min((gastos / ingresos) * 100, 100) : 0

  return (
    <>
      <div className="flex flex-col gap-4 pb-8">

        {/* ════════════════════════════════════════
            HERO — Balance Card
            ════════════════════════════════════════ */}
        <section
          className="relative rounded-[28px] overflow-hidden p-6"
          style={{
            background: 'linear-gradient(135deg, #F5A623 0%, #E8850F 45%, #C96B00 100%)',
          }}
        >
          {/* Blobs decorativos */}
          <div className="absolute -top-8 -right-8 w-40 h-40 rounded-full"
            style={{ background: 'rgba(255,255,255,0.12)', filter: 'blur(32px)' }} />
          <div className="absolute -bottom-6 -left-6 w-32 h-32 rounded-full"
            style={{ background: 'rgba(0,0,0,0.12)', filter: 'blur(24px)' }} />

          {/* Header */}
          <div className="relative z-10 flex items-center justify-between mb-5">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-white/60">
                Saldo del mes
              </p>
              <p className="text-[11px] font-medium text-white/50 mt-0.5 capitalize">{mesActual}</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setSaldoVisible(v => !v)}
                className="w-8 h-8 flex items-center justify-center rounded-full bg-white/15 active:bg-white/25 transition-colors"
              >
                <span className="text-sm">{saldoVisible ? '👁' : '🫣'}</span>
              </button>
              <button
                onClick={() => setDrawerAbierto(true)}
                className="w-8 h-8 flex items-center justify-center rounded-full bg-white/15 active:bg-white/25 transition-colors"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round">
                  <line x1="4" y1="7" x2="20" y2="7"/><line x1="4" y1="12" x2="16" y2="12"/><line x1="4" y1="17" x2="12" y2="17"/>
                </svg>
              </button>
            </div>
          </div>

          {/* Balance principal */}
          <div className="relative z-10 mb-6">
            {cBal ? (
              <div className="h-12 w-52 bg-white/20 rounded-2xl animate-pulse" />
            ) : (
              <>
                <h2 className="text-4xl font-black text-white tracking-tight leading-none">
                  {saldoVisible ? fmtCompleto(Math.abs(saldo)) : '$ ●●●●●'}
                </h2>
                {!positivo && (
                  <span className="text-[11px] font-bold text-red-200 mt-1 block">▼ Déficit del mes</span>
                )}
              </>
            )}
          </div>

          {/* Ingresos / Gastos */}
          <div className="relative z-10 grid grid-cols-2 gap-3 mb-5">
            <div className="bg-white/15 rounded-2xl p-3.5">
              <div className="flex items-center gap-1.5 mb-1">
                <div className="w-1.5 h-1.5 rounded-full bg-white/70" />
                <p className="text-[10px] font-bold text-white/70 uppercase tracking-wider">Ingresos</p>
              </div>
              <p className="text-lg font-black text-white leading-tight">
                {saldoVisible ? fmtAbrev(ingresos) : '●●●'}
              </p>
            </div>
            <div className="bg-white/10 rounded-2xl p-3.5">
              <div className="flex items-center gap-1.5 mb-1">
                <div className="w-1.5 h-1.5 rounded-full bg-white/40" />
                <p className="text-[10px] font-bold text-white/60 uppercase tracking-wider">Gastos</p>
              </div>
              <p className="text-lg font-black text-white/80 leading-tight">
                {saldoVisible ? fmtAbrev(gastos) : '●●●'}
              </p>
            </div>
          </div>

          {/* Barra de progreso gastos/ingresos */}
          {!cBal && ingresos > 0 && (
            <div className="relative z-10 mb-5">
              <div className="h-1.5 bg-white/20 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{
                    width: `${pctGastos}%`,
                    background: pctGastos > 80
                      ? 'rgba(255,80,80,0.8)'
                      : 'rgba(255,255,255,0.7)',
                  }}
                />
              </div>
              <p className="text-[9px] text-white/50 mt-1 font-medium">
                Gastaste el {pctGastos.toFixed(0)}% de tus ingresos
              </p>
            </div>
          )}

          {/* Gráfico de evolución */}
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-2">
              <p className="text-[10px] font-bold text-white/60 uppercase tracking-wider">Evolución 6 meses</p>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1">
                  <div className="w-3 h-[2px] bg-white/90 rounded" />
                  <span className="text-[9px] text-white/60">Ingresos</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-3 h-[2px] bg-white/45 rounded" />
                  <span className="text-[9px] text-white/60">Gastos</span>
                </div>
              </div>
            </div>
            <ChartEvolucion datos={evolucion} cargando={cEvo} />
          </div>
        </section>

        {/* ════════════════════════════════════════
            ACCIONES RÁPIDAS
            ════════════════════════════════════════ */}
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => abrirModal('gasto')}
            className="flex items-center gap-3 px-4 py-4 rounded-[20px]
              bg-white dark:bg-zinc-900
              border border-zinc-100 dark:border-zinc-800
              hover:border-red-200 dark:hover:border-red-800/50
              hover:bg-red-50/50 dark:hover:bg-red-900/10
              active:scale-[0.97] transition-all shadow-sm"
          >
            <div className="w-10 h-10 rounded-[14px] bg-red-100 dark:bg-red-900/30 flex items-center justify-center text-lg flex-shrink-0">
              💸
            </div>
            <div className="text-left">
              <p className="text-[13px] font-bold text-zinc-800 dark:text-white leading-tight">Nuevo gasto</p>
              <p className="text-[10px] text-zinc-400">Registrá ahora</p>
            </div>
          </button>
          <button
            onClick={() => abrirModal('ingreso')}
            className="flex items-center gap-3 px-4 py-4 rounded-[20px]
              bg-white dark:bg-zinc-900
              border border-zinc-100 dark:border-zinc-800
              hover:border-emerald-200 dark:hover:border-emerald-800/50
              hover:bg-emerald-50/50 dark:hover:bg-emerald-900/10
              active:scale-[0.97] transition-all shadow-sm"
          >
            <div className="w-10 h-10 rounded-[14px] bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-lg flex-shrink-0">
              💰
            </div>
            <div className="text-left">
              <p className="text-[13px] font-bold text-zinc-800 dark:text-white leading-tight">Nuevo ingreso</p>
              <p className="text-[10px] text-zinc-400">Registrá ahora</p>
            </div>
          </button>
        </div>

        {/* ════════════════════════════════════════
            SECCIONES — Grid 4 cols
            ════════════════════════════════════════ */}
        <section className="bg-white dark:bg-zinc-900 rounded-[22px]
          border border-zinc-100 dark:border-zinc-800 shadow-sm p-4">
          <p className="text-[10px] font-extrabold text-zinc-400 dark:text-zinc-500 uppercase tracking-[0.12em] mb-3">
            Secciones
          </p>
          <div className="grid grid-cols-4 gap-2">
            {ACCESOS.map(({ to, emoji, label, color }) => (
              <Link key={`${to}-${label}`} to={to}
                className="flex flex-col items-center gap-1.5 py-3 rounded-[16px]
                  hover:scale-105 active:scale-95 transition-all duration-200 group">
                <div className="w-11 h-11 rounded-[14px] flex items-center justify-center text-xl
                  transition-transform duration-200 group-hover:shadow-md"
                  style={{ background: color + '18' }}>
                  <span style={{ fontSize: 20 }}>{emoji}</span>
                </div>
                <span className="text-[9px] font-bold text-zinc-500 dark:text-zinc-400 text-center leading-tight">
                  {label}
                </span>
              </Link>
            ))}
          </div>
        </section>

        {/* ════════════════════════════════════════
            ÚLTIMOS MOVIMIENTOS
            ════════════════════════════════════════ */}
        <section className="bg-white dark:bg-zinc-900 rounded-[22px]
          border border-zinc-100 dark:border-zinc-800 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-5 pt-4 pb-3">
            <p className="text-[10px] font-extrabold text-zinc-400 dark:text-zinc-500 uppercase tracking-[0.12em]">
              Últimos movimientos
            </p>
            <Link to="/movimientos"
              className="text-[10px] font-bold text-[var(--mango-dark)] dark:text-[var(--mango)] hover:underline">
              Ver todos →
            </Link>
          </div>

          <div className="px-4 pb-3">
            {cUlt ? (
              <div className="flex flex-col gap-3 py-1">
                {[0,1,2].map(i => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-[14px] bg-zinc-100 dark:bg-zinc-800 animate-pulse flex-shrink-0" />
                    <div className="flex-1 space-y-1.5">
                      <div className="h-3 bg-zinc-100 dark:bg-zinc-800 rounded-full animate-pulse w-3/4" />
                      <div className="h-2.5 bg-zinc-100 dark:bg-zinc-800 rounded-full animate-pulse w-1/2" />
                    </div>
                    <div className="h-3 bg-zinc-100 dark:bg-zinc-800 rounded-full animate-pulse w-12" />
                  </div>
                ))}
              </div>
            ) : ultimos.length === 0 ? (
              <div className="flex flex-col items-center py-8 gap-2">
                <span className="text-3xl">💸</span>
                <p className="text-xs text-zinc-400">Sin movimientos este mes</p>
                <button
                  onClick={() => abrirModal('gasto')}
                  className="text-xs font-bold text-[var(--mango-dark)] dark:text-[var(--mango)] hover:underline mt-1"
                >
                  + Registrar el primero
                </button>
              </div>
            ) : (
              <div className="divide-y divide-zinc-50 dark:divide-zinc-800/50">
                {ultimos.map(m => <MovReciente key={m.id} m={m} />)}
              </div>
            )}
          </div>

          {/* Footer link */}
          {ultimos.length > 0 && (
            <Link to="/movimientos"
              className="flex items-center justify-center gap-1.5 py-3 border-t border-zinc-50 dark:border-zinc-800
                text-[11px] font-semibold text-zinc-400 hover:text-[var(--mango-dark)] dark:hover:text-[var(--mango)]
                transition-colors">
              Ver historial completo →
            </Link>
          )}
        </section>

        {/* ════════════════════════════════════════
            AI BANNER — ManguitoAI
            ════════════════════════════════════════ */}
        <Link to="/chat"
          className="relative overflow-hidden rounded-[22px] p-5
            bg-zinc-900 dark:bg-zinc-800
            border border-zinc-800 dark:border-zinc-700
            active:scale-[0.98] transition-all group">
          <div className="absolute -right-6 -top-6 w-28 h-28 rounded-full"
            style={{ background: 'rgba(245,166,35,0.12)', filter: 'blur(20px)' }} />
          <div className="relative flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0"
              style={{ background: 'rgba(245,166,35,0.15)' }}>
              🤖
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-white leading-tight">ManguitoAI</p>
              <p className="text-[11px] text-zinc-400 mt-0.5">Consultá sobre finanzas, dólar e inversiones</p>
            </div>
            <div className="w-7 h-7 rounded-full bg-[var(--mango)]/20 flex items-center justify-center
              group-hover:bg-[var(--mango)]/40 transition-colors flex-shrink-0">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--mango)" strokeWidth="2.5" strokeLinecap="round">
                <path d="M5 12h14M12 5l7 7-7 7"/>
              </svg>
            </div>
          </div>
        </Link>

      </div>

      {/* ── MobileDrawer ── */}
      <MobileDrawer abierto={drawerAbierto} onCerrar={() => setDrawerAbierto(false)} />

      {/* ── Modal nuevo movimiento ── */}
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