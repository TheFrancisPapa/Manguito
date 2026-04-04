// src/pages/Dashboard/index.jsx
// Rediseñado para coincidir con el mockup de Stitch — estética warm fintech

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

// ─── SVG Chart al estilo Stitch ──────────────────────────────
function ChartEvolucion({ datos = [], cargando }) {
  if (cargando) {
    return <div className="w-full h-40 rounded-2xl bg-amber-50 animate-pulse" />
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

  // Smooth curves usando bezier
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

  const mesesLabels = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic']
  const labelCount = Math.min(4, datos.length)
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
            <stop offset="0%" stopColor="#436500" stopOpacity="0.15" />
            <stop offset="100%" stopColor="#436500" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="gradRed" x1="0%" x2="0%" y1="0%" y2="100%">
            <stop offset="0%" stopColor="#b02500" stopOpacity="0.10" />
            <stop offset="100%" stopColor="#b02500" stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* Área gastos */}
        <path d={areaPath('gastos')} fill="url(#gradRed)" />
        {/* Línea gastos */}
        <path
          d={curva('gastos')}
          fill="none"
          stroke="#b02500"
          strokeWidth="2.5"
          strokeLinecap="round"
          style={{ filter: 'drop-shadow(0 4px 6px rgba(176,37,0,0.2))' }}
        />

        {/* Área ingresos */}
        <path d={areaPath('ingresos')} fill="url(#gradGreen)" />
        {/* Línea ingresos */}
        <path
          d={curva('ingresos')}
          fill="none"
          stroke="#436500"
          strokeWidth="2.5"
          strokeLinecap="round"
          style={{ filter: 'drop-shadow(0 4px 6px rgba(67,101,0,0.2))' }}
        />
      </svg>

      {/* Labels meses */}
      <div className="absolute bottom-0 left-0 right-0 flex justify-between px-1 mt-2">
        {datos.map((d, i) => {
          const show = datos.length <= 4 || labelIndices.includes(i)
          return show ? (
            <span key={i} className="text-[9px] font-bold text-stone-400 uppercase">
              {d.label}
            </span>
          ) : null
        })}
      </div>
    </div>
  )
}

// ─── Card de Presupuesto Crítico ──────────────────────────────
function PresupuestoCritico({ presupuesto }) {
  const { categoria_nombre, categoria_icono, limite_monto, gastado, porcentaje, alerta_pct } = presupuesto
  const excedido = porcentaje >= 100
  const enAlerta = porcentaje >= alerta_pct && !excedido

  const colorBarra = excedido ? '#b02500' : enAlerta ? '#F5A623' : '#436500'
  const badgeText = excedido ? 'Excedido' : 'Alerta'
  const badgeColor = excedido
    ? 'bg-red-100 text-red-700'
    : 'bg-amber-100 text-amber-700'
  const iconBg = excedido ? 'bg-red-100 text-red-600' : 'bg-amber-100 text-amber-600'

  return (
    <div className="bg-white p-5 rounded-2xl border border-stone-100 flex flex-col gap-4 shadow-sm">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center text-xl ${iconBg}`}>
            {categoria_icono || '⚠️'}
          </div>
          <div>
            <h3 className="text-sm font-bold leading-tight text-stone-800">
              {excedido ? 'Presupuesto Excedido' : 'Presupuesto Crítico'}
            </h3>
            <p className="text-[10px] text-stone-500">{categoria_nombre}</p>
          </div>
        </div>
        <span className={`text-[9px] font-black px-2 py-1 rounded-full uppercase ${badgeColor}`}>
          {badgeText}
        </span>
      </div>
      <div className="space-y-2">
        <div className="flex justify-between text-[10px] font-bold">
          <span className="text-stone-400">{porcentaje.toFixed(0)}% alcanzado</span>
          <span style={{ color: colorBarra }}>
            ${Number(gastado).toLocaleString('es-AR')} / ${Number(limite_monto).toLocaleString('es-AR')}
          </span>
        </div>
        <div className="w-full h-2.5 bg-stone-100 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-700"
            style={{ width: `${Math.min(porcentaje, 100)}%`, backgroundColor: colorBarra }}
          />
        </div>
      </div>
    </div>
  )
}

// ─── Card de Meta ─────────────────────────────────────────────
function MetaCard({ meta }) {
  const { nombre, icono, color, monto_objetivo, monto_actual, estado } = meta
  const pct = Math.min((monto_actual / monto_objetivo) * 100, 100)
  const falta = monto_objetivo - monto_actual
  const completa = estado === 'completada'

  return (
    <div className="bg-white p-5 rounded-2xl border border-stone-100 flex flex-col gap-4 shadow-sm">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center text-xl"
            style={{ backgroundColor: (color || '#436500') + '22' }}
          >
            {icono || '🎯'}
          </div>
          <div>
            <h3 className="text-sm font-bold leading-tight text-stone-800">Meta Próxima</h3>
            <p className="text-[10px] text-stone-500">{nombre}</p>
          </div>
        </div>
        <span className="text-[9px] font-black bg-green-100 text-green-700 px-2 py-1 rounded-full uppercase">
          {completa ? '✓ Lista' : 'Ahorro'}
        </span>
      </div>
      <div className="space-y-2">
        <div className="flex justify-between text-[10px] font-bold">
          <span className="text-stone-400">{pct.toFixed(0)}% completado</span>
          <span style={{ color: color || '#436500' }}>
            ${Number(monto_actual).toLocaleString('es-AR')} / ${Number(monto_objetivo).toLocaleString('es-AR')}
          </span>
        </div>
        <div className="w-full h-2.5 bg-stone-100 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-700"
            style={{ width: `${pct}%`, backgroundColor: color || '#436500' }}
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
          active:scale-90 transition-all duration-150"
        style={{
          background: '#f9c940',
          boxShadow: '0 12px 24px -8px rgba(114, 88, 0, 0.4)',
        }}
      >
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none"
          stroke="#725800" strokeWidth="2.8" strokeLinecap="round">
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

  // Calcular % de variación (mock — en producción podés comparar con mes anterior)
  const tasaAhorro = balance?.total_ingresos > 0
    ? ((saldo / balance.total_ingresos) * 100).toFixed(1)
    : 0

  // Presupuestos en alerta
  const presupuestosEnAlerta = presupuestos.filter(
    p => p.porcentaje >= (p.alerta_pct ?? 80)
  ).slice(0, 2)

  // Meta más cercana
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
      {/* ── CONTENIDO PRINCIPAL ── */}
      <div className="space-y-5 pb-6">

        {/* ── Balance General (Glass Card estilo Stitch) ── */}
        <section
          className="p-6 rounded-2xl relative overflow-hidden"
          style={{
            background: 'rgba(255, 255, 255, 0.85)',
            backdropFilter: 'blur(16px)',
            border: '1px solid rgba(255, 255, 255, 0.6)',
            boxShadow: '0 10px 30px -5px rgba(0,0,0,0.06)',
          }}
        >
          {/* Halo decorativo */}
          <div
            className="absolute -right-16 -top-16 w-40 h-40 rounded-full blur-3xl"
            style={{ background: 'rgba(249, 201, 64, 0.2)' }}
          />

          <div className="relative z-10">
            {/* Selector período */}
            <div className="flex items-center gap-2 mb-4">
              {PERIODOS.map((p, i) => (
                <button
                  key={i}
                  onClick={() => setPeriodoIdx(i)}
                  className={`px-3 py-1 rounded-full text-[11px] font-bold transition-all ${
                    periodoIdx === i
                      ? 'text-stone-800'
                      : 'text-stone-400 hover:text-stone-600'
                  }`}
                  style={periodoIdx === i ? { background: '#f9c940' } : {}}
                >
                  {p.label}
                </button>
              ))}
            </div>

            <div className="flex justify-between items-start">
              <p className="text-xs font-semibold text-stone-500 tracking-wide">Balance General</p>
            </div>

            {cBal ? (
              <div className="h-10 w-48 rounded-xl bg-stone-100 animate-pulse mt-2" />
            ) : (
              <h2
                className="text-3xl font-black mt-2 tracking-tight"
                style={{
                  fontFamily: 'Montserrat, Plus Jakarta Sans, sans-serif',
                  color: positivo ? '#2f2f2f' : '#b02500',
                }}
              >
                {fmtBalance(Math.abs(saldo))}
              </h2>
            )}

            {/* Badge de variación */}
            {!cBal && (
              <div className="mt-3 flex items-center gap-3">
                <div
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full"
                  style={{ background: 'rgba(196, 253, 107, 0.3)' }}
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="#3a5800">
                    <path d="M7 17l9.2-9.2M17 17V7H7" stroke="#3a5800" strokeWidth="2.5" strokeLinecap="round" fill="none"/>
                  </svg>
                  <span className="text-[10px] font-black" style={{ color: '#3a5800' }}>
                    {tasaAhorro}% tasa de ahorro
                  </span>
                </div>
              </div>
            )}

            {/* Pills ingreso/gasto */}
            {!cBal && (
              <div className="grid grid-cols-2 gap-3 mt-4">
                <button
                  onClick={() => abrirModal('ingreso')}
                  className="flex items-center gap-2 p-3 rounded-xl border-2 border-transparent
                    hover:border-green-200 transition-all active:scale-95"
                  style={{ background: 'rgba(196, 253, 107, 0.15)' }}
                >
                  <span className="text-lg">💰</span>
                  <div className="text-left">
                    <p className="text-[9px] font-bold text-stone-400 uppercase tracking-wide">Ingresos</p>
                    <p className="text-sm font-black" style={{ color: '#436500' }}>
                      {fmtAbrev(balance?.total_ingresos ?? 0)}
                    </p>
                  </div>
                </button>
                <button
                  onClick={() => abrirModal('gasto')}
                  className="flex items-center gap-2 p-3 rounded-xl border-2 border-transparent
                    hover:border-red-200 transition-all active:scale-95"
                  style={{ background: 'rgba(176, 37, 0, 0.07)' }}
                >
                  <span className="text-lg">💸</span>
                  <div className="text-left">
                    <p className="text-[9px] font-bold text-stone-400 uppercase tracking-wide">Gastos</p>
                    <p className="text-sm font-black" style={{ color: '#b02500' }}>
                      {fmtAbrev(balance?.total_gastos ?? 0)}
                    </p>
                  </div>
                </button>
              </div>
            )}
          </div>
        </section>

        {/* ── Evolución Mensual (Glass Card) ── */}
        <section
          className="p-6 rounded-2xl"
          style={{
            background: 'rgba(255, 255, 255, 0.85)',
            backdropFilter: 'blur(16px)',
            border: '1px solid rgba(255, 255, 255, 0.6)',
            boxShadow: '0 10px 30px -5px rgba(0,0,0,0.06)',
          }}
        >
          <div className="flex justify-between items-center mb-5">
            <h3
              className="text-sm font-black"
              style={{ fontFamily: 'Montserrat, sans-serif', color: '#2f2f2f' }}
            >
              Evolución Mensual
            </h3>
            <div className="flex gap-4">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full inline-block" style={{ background: '#436500' }} />
                <span className="text-[10px] font-bold text-stone-500">Ingresos</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full inline-block" style={{ background: '#b02500' }} />
                <span className="text-[10px] font-bold text-stone-500">Gastos</span>
              </div>
            </div>
          </div>

          <ChartEvolucion datos={evolucion} cargando={cEvo} />
        </section>

        {/* ── Accesos rápidos ── */}
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
              className="flex flex-col items-center gap-2 p-3.5 rounded-2xl
                hover:scale-105 active:scale-95 transition-all"
              style={{
                background: 'rgba(255,255,255,0.85)',
                border: '1px solid rgba(255,255,255,0.6)',
                boxShadow: '0 4px 12px rgba(0,0,0,0.04)',
              }}
            >
              <span className="text-xl">{emoji}</span>
              <span className="text-[9px] font-semibold text-stone-500 text-center">{label}</span>
            </Link>
          ))}
        </div>

        {/* ── Presupuestos en alerta ── */}
        {presupuestosEnAlerta.length > 0 && (
          <div className="space-y-3">
            {presupuestosEnAlerta.map(p => (
              <PresupuestoCritico key={p.id} presupuesto={p} />
            ))}
          </div>
        )}

        {/* ── Meta principal ── */}
        {metaPrincipal && <MetaCard meta={metaPrincipal} />}

        {/* ── Movimientos recientes ── */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <p className="text-[10px] font-bold uppercase tracking-widest text-stone-400">
              Movimientos recientes
            </p>
            <Link
              to="/movimientos"
              className="text-[11px] font-bold hover:underline"
              style={{ color: '#725800' }}
            >
              Ver todos →
            </Link>
          </div>

          {cMovs ? (
            <div className="space-y-2">
              {[0, 1, 2].map(i => (
                <div
                  key={i}
                  className="h-14 rounded-2xl animate-pulse"
                  style={{ background: 'rgba(255,255,255,0.7)' }}
                />
              ))}
            </div>
          ) : movimientos.length === 0 ? (
            <button
              onClick={() => abrirModal('gasto')}
              className="w-full flex flex-col items-center py-10 rounded-2xl
                border-2 border-dashed border-stone-200 hover:border-amber-300
                active:scale-[0.97] transition-all"
              style={{ background: 'rgba(255,255,255,0.6)' }}
            >
              <span className="text-3xl mb-2">💸</span>
              <p className="text-sm font-semibold text-stone-500">Sin movimientos este período</p>
              <p className="text-[11px] text-stone-400 mt-1">Tocá para registrar el primero →</p>
            </button>
          ) : (
            <div
              className="rounded-2xl overflow-hidden"
              style={{
                background: 'rgba(255,255,255,0.85)',
                backdropFilter: 'blur(16px)',
                border: '1px solid rgba(255,255,255,0.6)',
                boxShadow: '0 10px 30px -5px rgba(0,0,0,0.06)',
              }}
            >
              {movimientos.slice(0, 6).map((m, i) => (
                <div
                  key={m.id}
                  className={i > 0 ? 'border-t border-stone-50' : ''}
                >
                  <MovCard movimiento={m} compact />
                </div>
              ))}
              {movimientos.length > 6 && (
                <Link
                  to="/movimientos"
                  className="block text-center py-3.5 text-[11px] font-bold text-stone-400
                    hover:text-stone-600 border-t border-stone-50 transition-colors"
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

      {/* ── Modal formulario ── */}
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
    <div
      className="animate-in fade-in duration-500 min-h-screen"
      style={{
        background: 'radial-gradient(circle at 0% 0%, #fff9e6 0%, #fdfaf2 50%, #fffdf7 100%)',
      }}
    >
      <PageWrapper className="!bg-transparent">
        <DashboardPage />
      </PageWrapper>
    </div>
  )
}