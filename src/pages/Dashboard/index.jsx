// src/pages/Dashboard/index.jsx
// Redesign v4 — Clean dashboard: Balance + Chart + Navigation dropdown

import { useState, useMemo, useCallback, useRef, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuthContext } from '../../context/AuthContext'
import {
  useBalance,
  useEvolucionMensual,
  useMovimientos,
} from '../../hooks/useMovimientos'
import { PageWrapper } from '../../components/layout'
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

// ─── Navigation Sections ──────────────────────────────────────
const NAV_SECTIONS = [
  { to: '/movimientos',    emoji: '📋', label: 'Movimientos' },
  { to: '/presupuestos',   emoji: '📊', label: 'Presupuestos' },
  { to: '/inversiones',    emoji: '📈', label: 'Inversiones' },
  { to: '/cotizaciones',   emoji: '💱', label: 'Cotizaciones' },
  { to: '/metas',          emoji: '🎯', label: 'Metas' },
  { to: '/suscripciones',  emoji: '🔄', label: 'Suscripciones' },
  { to: '/vencimientos',   emoji: '📅', label: 'Vencimientos' },
  { to: '/calculadora',    emoji: '🧮', label: 'Calculadora' },
  { to: '/nafta',          emoji: '⛽', label: 'Nafta' },
  { to: '/recursos',       emoji: '📚', label: 'Recursos' },
  { to: '/configuracion',  emoji: '⚙️', label: 'Configuración' },
]

// ─── Dropdown Menu ────────────────────────────────────────────
function SectionDropdown() {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)
  const navigate = useNavigate()

  useEffect(() => {
    function handleClickOutside(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    if (open) document.addEventListener('pointerdown', handleClickOutside)
    return () => document.removeEventListener('pointerdown', handleClickOutside)
  }, [open])

  return (
    <div ref={ref} className="relative z-50">
      <button
        onClick={() => setOpen(v => !v)}
        className="w-9 h-9 flex items-center justify-center rounded-xl
          bg-white/70 dark:bg-zinc-800/70
          border border-zinc-200/60 dark:border-zinc-700/60
          backdrop-blur-xl
          hover:bg-zinc-100 dark:hover:bg-zinc-700
          active:scale-90 transition-all shadow-sm"
        aria-label="Menú de secciones"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" strokeWidth="2" strokeLinecap="round"
          className="text-zinc-600 dark:text-zinc-300">
          <circle cx="12" cy="5" r="1.5" fill="currentColor" />
          <circle cx="12" cy="12" r="1.5" fill="currentColor" />
          <circle cx="12" cy="19" r="1.5" fill="currentColor" />
        </svg>
      </button>

      {open && (
        <div
          className="absolute right-0 top-full mt-2 w-56
            bg-white/95 dark:bg-[var(--dark-card)]/95
            backdrop-blur-2xl
            border border-zinc-200/60 dark:border-[var(--dark-border)]
            rounded-2xl shadow-[var(--shadow-lg)]
            overflow-hidden
            animate-in fade-in slide-in-from-top-2 duration-200"
        >
          <div className="py-1.5">
            {NAV_SECTIONS.map(({ to, emoji, label }) => (
              <button
                key={to}
                onClick={() => { navigate(to); setOpen(false) }}
                className="w-full flex items-center gap-3 px-4 py-2.5
                  text-left text-sm font-semibold
                  text-zinc-700 dark:text-zinc-200
                  hover:bg-zinc-100/80 dark:hover:bg-zinc-800/60
                  active:bg-zinc-200/60 dark:active:bg-zinc-700/60
                  transition-colors"
              >
                <span className="text-base">{emoji}</span>
                <span>{label}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// ─── PÁGINA PRINCIPAL ─────────────────────────────────────────
export function DashboardPage() {
  const { usuario } = useAuthContext()
  const [modalAbierto, setModalAbierto] = useState(false)
  const [tipoDefault, setTipoDefault] = useState('gasto')
  const [saldoVisible, setSaldoVisible] = useState(true)

  const { desde, hasta } = useRangoMes(0)

  const { balance, cargando: cBal } = useBalance(desde, hasta)
  const { datos: evolucion, cargando: cEvo } = useEvolucionMensual(6)
  const { agregar } = useMovimientos({ desde, hasta })

  const saldo = (balance?.total_ingresos ?? 0) - (balance?.total_gastos ?? 0)
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
      <div className="space-y-5 pb-6">

        {/* ── Balance General — Clean Card ── */}
        <section className="p-6 rounded-[22px] relative overflow-hidden
          bg-white/85 dark:bg-[var(--dark-card)]/95
          backdrop-blur-2xl
          border border-white/60 dark:border-[var(--dark-border)]
          shadow-[var(--shadow-md)]">

          {/* Decorative halo */}
          <div className="absolute -right-16 -top-16 w-40 h-40 rounded-full blur-3xl
            bg-[var(--mango)]/15 dark:bg-[var(--mango)]/8" />

          <div className="relative z-10">
            {/* Header: Balance label + visibility toggle + section menu */}
            <div className="flex items-center justify-between">
              <p className="text-[10px] font-extrabold text-zinc-400 dark:text-zinc-500
                uppercase tracking-[0.1em]">
                Balance General
              </p>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setSaldoVisible(v => !v)}
                  className="w-8 h-8 flex items-center justify-center rounded-full
                    text-zinc-300 dark:text-zinc-600
                    hover:bg-zinc-100 dark:hover:bg-zinc-800
                    active:scale-90 transition-all"
                  aria-label={saldoVisible ? 'Ocultar saldo' : 'Mostrar saldo'}
                >
                  {saldoVisible ? (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                      <circle cx="12" cy="12" r="3"/>
                    </svg>
                  ) : (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24"/>
                      <line x1="1" y1="1" x2="23" y2="23"/>
                    </svg>
                  )}
                </button>
                <SectionDropdown />
              </div>
            </div>

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
                  {saldoVisible ? fmtBalance(Math.abs(saldo)) : '$ ●●●●●●'}
                </span>
              </h2>
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