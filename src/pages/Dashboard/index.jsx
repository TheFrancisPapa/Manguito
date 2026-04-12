// src/pages/Dashboard/index.jsx
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
  if (abs >= 100_000)   return `$${(n / 1_000).toFixed(0)}K`
  return Number(n).toLocaleString('es-AR', { maximumFractionDigits: 0, style: 'currency', currency: 'ARS' })
}

// ─── SVG Chart ───────────────────────────────────────────────
function ChartEvolucion({ datos = [], cargando }) {
  if (cargando) return <div className="w-full h-40 rounded-2xl bg-zinc-100 dark:bg-zinc-800 animate-pulse" />
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

  const areaPath = (campo) => `${curva(campo)} L ${px(datos.length - 1)} ${H} L ${px(0)} ${H} Z`

  const labelIndices = datos.length <= 4
    ? datos.map((_, i) => i)
    : [0, Math.floor(datos.length / 3), Math.floor(2 * datos.length / 3), datos.length - 1]

  return (
    <div className="relative w-full" style={{ height: 160 }}>
      <svg width="100%" height="100%" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" className="overflow-visible">
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
        <path d={curva('gastos')} fill="none" stroke="#EF4444" strokeWidth="2.5" strokeLinecap="round"
          style={{ filter: 'drop-shadow(0 4px 6px rgba(239,68,68,0.2))' }} />
        <path d={areaPath('ingresos')} fill="url(#gradGreen)" />
        <path d={curva('ingresos')} fill="none" stroke="var(--leaf)" strokeWidth="2.5" strokeLinecap="round"
          style={{ filter: 'drop-shadow(0 4px 6px rgba(5,150,105,0.2))' }} />
        {datos.length > 0 && (
          <>
            <circle cx={px(datos.length-1)} cy={py(datos[datos.length-1].ingresos)} r="4" fill="var(--leaf)" stroke="white" strokeWidth="2" />
            <circle cx={px(datos.length-1)} cy={py(datos[datos.length-1].gastos)} r="4" fill="#EF4444" stroke="white" strokeWidth="2" />
          </>
        )}
      </svg>
      <div className="absolute bottom-0 left-0 right-0 flex justify-between px-1">
        {datos.map((d, i) => {
          const show = datos.length <= 4 || labelIndices.includes(i)
          return show ? (
            <span key={i} className="text-[9px] font-bold text-zinc-400 dark:text-zinc-500 uppercase">{d.label}</span>
          ) : null
        })}
      </div>
    </div>
  )
}

// ─── Accesos rápidos ──────────────────────────────────────────
const ACCESOS = [
  { to: '/movimientos',   emoji: '💸', label: 'Movimientos'  },
  { to: '/presupuestos',  emoji: '📊', label: 'Presupuestos' },
  { to: '/metas',         emoji: '🎯', label: 'Metas'        },
  { to: '/inversiones',   emoji: '📈', label: 'Inversiones'  },
  { to: '/suscripciones', emoji: '📱', label: 'Suscripciones'},
  { to: '/cotizaciones',  emoji: '💱', label: 'Divisas'      },
  { to: '/vencimientos',  emoji: '📅', label: 'Pagos'        },
  { to: '/calculadora',   emoji: '🧮', label: 'Calculadora'  },
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
    <div className="flex items-center gap-3 py-2.5">
      <div className="w-9 h-9 rounded-xl flex items-center justify-center text-base flex-shrink-0"
        style={{ background: (cat?.color ?? '#6B7280') + '18' }}>
        {cat?.icono ?? '📦'}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-zinc-800 dark:text-zinc-100 truncate leading-tight">
          {m.descripcion || cat?.nombre}
        </p>
        <p className="text-xs text-zinc-400 mt-0.5">{cat?.nombre} · {fechaFmt}</p>
      </div>
      <span className={`text-sm font-black tabular-nums flex-shrink-0 ${
        esIngreso ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500 dark:text-red-400'
      }`}>
        {esIngreso ? '+' : '-'}{montoDisplay}
      </span>
    </div>
  )
}

// ─── PÁGINA PRINCIPAL ─────────────────────────────────────────
export function DashboardPage() {
  const { usuario } = useAuthContext()
  const [drawerAbierto, setDrawerAbierto] = useState(false)
  const [modalAbierto, setModalAbierto]   = useState(false)
  const [tipoDefault, setTipoDefault]     = useState('gasto')
  const [saldoVisible, setSaldoVisible]   = useState(true)

  const { desde, hasta } = useRangoMes(0)
  const { balance, cargando: cBal }           = useBalance(desde, hasta)
  const { datos: evolucion, cargando: cEvo }  = useEvolucionMensual(6)
  const { movimientos: ultimos, cargando: cUlt } = useUltimosMovimientos(5)
  const { agregar }                            = useMovimientos({ desde, hasta })

  const saldo    = (balance?.total_ingresos ?? 0) - (balance?.total_gastos ?? 0)
  const positivo = saldo >= 0

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
      <div className="space-y-4 pb-6">

        {/* ── Balance General ── */}
        <section className="p-5 rounded-[22px] relative overflow-hidden
          bg-white/85 dark:bg-[var(--dark-card)]/95 backdrop-blur-2xl
          border border-white/60 dark:border-[var(--dark-border)] shadow-[var(--shadow-md)]">
          <div className="absolute -right-16 -top-16 w-40 h-40 rounded-full blur-3xl bg-[var(--mango)]/15 dark:bg-[var(--mango)]/8" />

          <div className="relative z-10">
            <div className="flex items-center justify-between">
              <p className="text-[10px] font-extrabold text-zinc-400 dark:text-zinc-500 uppercase tracking-[0.1em]">
                Balance General
              </p>
              <div className="flex items-center gap-1.5">
                {/* Toggle visibilidad */}
                <button
                  onClick={() => setSaldoVisible(v => !v)}
                  className="w-8 h-8 flex items-center justify-center rounded-full
                    text-zinc-300 dark:text-zinc-600
                    hover:bg-zinc-100 dark:hover:bg-zinc-800 active:scale-90 transition-all"
                >
                  {saldoVisible ? (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
                    </svg>
                  ) : (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24"/>
                      <line x1="1" y1="1" x2="23" y2="23"/>
                    </svg>
                  )}
                </button>
                {/* Hamburger → abre MobileDrawer */}
                <button
                  onClick={() => setDrawerAbierto(true)}
                  className="w-8 h-8 flex items-center justify-center rounded-xl
                    bg-zinc-100 dark:bg-zinc-800
                    hover:bg-zinc-200 dark:hover:bg-zinc-700
                    active:scale-90 transition-all"
                  aria-label="Abrir menú"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
                    <line x1="4" y1="7" x2="20" y2="7"/>
                    <line x1="4" y1="12" x2="16" y2="12"/>
                    <line x1="4" y1="17" x2="12" y2="17"/>
                  </svg>
                </button>
              </div>
            </div>

            {cBal ? (
              <div className="h-10 w-48 rounded-xl bg-zinc-100 dark:bg-zinc-800 animate-pulse mt-2" />
            ) : (
              <h2 className="text-3xl font-black mt-2 tracking-tight font-mono-num animate-counter"
                style={{ color: positivo ? undefined : '#EF4444' }}>
                <span className="text-zinc-900 dark:text-white">
                  {saldoVisible ? fmtBalance(Math.abs(saldo)) : '$ ●●●●●●'}
                </span>
              </h2>
            )}

            {/* Mini resumen ingresos/gastos */}
            {!cBal && balance && (
              <div className="flex gap-4 mt-3">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 flex-shrink-0" />
                  <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">
                    {saldoVisible ? fmtAbrev(balance.total_ingresos ?? 0) : '●●●'}
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-red-500 flex-shrink-0" />
                  <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">
                    {saldoVisible ? fmtAbrev(balance.total_gastos ?? 0) : '●●●'}
                  </span>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* ── Botones rápidos ── */}
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => abrirModal('gasto')}
            className="flex items-center gap-3 px-4 py-3.5 rounded-[18px]
              bg-red-50 dark:bg-red-900/15
              border border-red-100 dark:border-red-800/30
              hover:bg-red-100 dark:hover:bg-red-900/25
              active:scale-[0.97] transition-all press-scale"
          >
            <span className="text-xl">💸</span>
            <span className="text-sm font-bold text-red-600 dark:text-red-400">Nuevo gasto</span>
          </button>
          <button
            onClick={() => abrirModal('ingreso')}
            className="flex items-center gap-3 px-4 py-3.5 rounded-[18px]
              bg-emerald-50 dark:bg-emerald-900/15
              border border-emerald-100 dark:border-emerald-800/30
              hover:bg-emerald-100 dark:hover:bg-emerald-900/25
              active:scale-[0.97] transition-all press-scale"
          >
            <span className="text-xl">💰</span>
            <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">Nuevo ingreso</span>
          </button>
        </div>

        {/* ── Accesos rápidos grid ── */}
        <section className="p-4 rounded-[22px]
          bg-white/85 dark:bg-[var(--dark-card)]/95
          border border-white/60 dark:border-[var(--dark-border)]
          shadow-[var(--shadow-sm)]">
          <p className="text-[10px] font-extrabold text-zinc-400 dark:text-zinc-500 uppercase tracking-[0.1em] mb-3">
            Secciones
          </p>
          <div className="grid grid-cols-4 gap-2">
            {ACCESOS.map(({ to, emoji, label }) => (
              <Link
                key={to}
                to={to}
                className="flex flex-col items-center gap-1.5 py-3 rounded-2xl
                  bg-zinc-50 dark:bg-zinc-800/50
                  hover:bg-[var(--mango)]/8 dark:hover:bg-[var(--mango)]/10
                  active:scale-95 transition-all press-scale"
              >
                <span className="text-xl leading-none">{emoji}</span>
                <span className="text-[9px] font-bold text-zinc-500 dark:text-zinc-400 text-center leading-tight">
                  {label}
                </span>
              </Link>
            ))}
          </div>
        </section>

        {/* ── Gráfico ── */}
        <section className="p-5 rounded-[22px]
          bg-white/85 dark:bg-[var(--dark-card)]/95
          border border-white/60 dark:border-[var(--dark-border)]
          shadow-[var(--shadow-sm)]">
          <div className="flex justify-between items-center mb-4">
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

        {/* ── Últimos movimientos ── */}
        <section className="p-5 rounded-[22px]
          bg-white/85 dark:bg-[var(--dark-card)]/95
          border border-white/60 dark:border-[var(--dark-border)]
          shadow-[var(--shadow-sm)]">
          <div className="flex items-center justify-between mb-1">
            <p className="text-[10px] font-extrabold text-zinc-400 dark:text-zinc-500 uppercase tracking-[0.1em]">
              Últimos movimientos
            </p>
            <Link to="/movimientos"
              className="text-[10px] font-bold text-[var(--mango-dark)] dark:text-[var(--mango)] hover:underline">
              Ver todos →
            </Link>
          </div>

          {cUlt ? (
            <div className="flex flex-col gap-2 mt-3">
              {[0,1,2].map(i => <div key={i} className="h-12 bg-zinc-100 dark:bg-zinc-800 rounded-xl animate-pulse" />)}
            </div>
          ) : ultimos.length === 0 ? (
            <div className="flex flex-col items-center py-6 gap-2">
              <span className="text-3xl">💸</span>
              <p className="text-xs text-zinc-400">Aún no hay movimientos este mes</p>
              <button
                onClick={() => abrirModal('gasto')}
                className="text-xs font-bold text-[var(--mango-dark)] dark:text-[var(--mango)] hover:underline"
              >
                + Registrar el primero
              </button>
            </div>
          ) : (
            <div className="divide-y divide-zinc-50 dark:divide-zinc-800/50">
              {ultimos.map(m => <MovReciente key={m.id} m={m} />)}
            </div>
          )}
        </section>

      </div>

      {/* ── MobileDrawer (menú hamburger) ── */}
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