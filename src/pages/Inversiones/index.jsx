import { useState } from 'react'
import { useAuthContext } from '../../context/AuthContext'
import { useInversiones } from '../../hooks/useInversiones'
import { PageWrapper, PageHeader } from '../../components/layout'
import { Card, CardHeader, Button, EmptyState, Modal } from '../../components/ui'
import { FormInversion } from '../../components/forms/FormInversion'
import { FormVenta } from '../../components/forms/FormVenta'
import { TipContextual } from '../../components/ui/TipContextual'
import { FeedNoticias } from './FeedNoticias'

// ── Formateo ────────────────────────────────────────────────
const fmt = (n, dec = 2) =>
  n == null ? '—' : Number(n).toLocaleString('es-AR', { minimumFractionDigits: dec, maximumFractionDigits: dec })

const fmtARS = (n) => n == null ? '—' : `$\u00A0${fmt(n, 0)}`
const fmtUSD = (n) => n == null ? '—' : `U$D\u00A0${fmt(n, 2)}`

const TIPOS = {
  accion:  { label: 'Acción',   icono: '📈', color: '#3B82F6' },
  cedear:  { label: 'CEDEAR',   icono: '🇦🇷', color: '#8B5CF6' },
  crypto:  { label: 'Cripto',   icono: '₿',  color: '#F59E0B' },
  fci:     { label: 'FCI',      icono: '🏦', color: '#10B981' },
  otro:    { label: 'Otro',     icono: '💼', color: '#6B7280' },
}

function BadgeVariacion({ pct }) {
  if (pct == null) return <span className="text-xs text-zinc-400">—</span>
  const positivo = pct >= 0
  return (
    <span className={`inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-xs font-bold ${
      positivo
        ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400'
        : 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400'
    }`}>
      {positivo ? '▲' : '▼'} {Math.abs(pct).toFixed(2)}%
    </span>
  )
}

// ── Mini sparkline SVG ──────────────────────────────────────
function MiniSparkline({ positivo }) {
  const color = positivo ? '#10B981' : '#EF4444'
  const path = positivo
    ? 'M0,12 L4,10 L8,11 L12,7 L16,8 L20,4 L24,3'
    : 'M0,3 L4,5 L8,4 L12,8 L16,7 L20,11 L24,12'
  return (
    <svg width="28" height="16" viewBox="0 0 24 16" className="flex-shrink-0 opacity-60">
      <path d={path} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

// ── Tarjeta de inversión con indicador visual ───────────────
function TarjetaInversion({ detalle, onEliminar, onVender }) {
  const tipo = TIPOS[detalle.tipo] || TIPOS.otro
  const cot  = detalle.cotizacion
  const tienePrecios = detalle.precioActualUSD != null
  const ganando = detalle.gananciaUSD != null ? detalle.gananciaUSD >= 0 : null

  // Color border indicator
  const borderColor = ganando === null
    ? 'border-zinc-100 dark:border-[var(--dark-border)]'
    : ganando
      ? 'border-l-emerald-400 dark:border-l-emerald-600 border-zinc-100 dark:border-[var(--dark-border)]'
      : 'border-l-red-400 dark:border-l-red-600 border-zinc-100 dark:border-[var(--dark-border)]'

  return (
    <div className={`flex flex-col gap-3 p-4
      bg-white dark:bg-[var(--dark-card)]
      border ${borderColor} border-l-[3px]
      rounded-[20px] group
      hover:shadow-[var(--shadow-md)] hover:border-zinc-200 dark:hover:border-zinc-700
      transition-all shadow-[var(--shadow-xs)]`}>

      {/* Top row */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-11 h-11 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
            style={{ background: tipo.color + '18' }}>
            {detalle.icono || tipo.icono}
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <p className="font-bold text-sm text-zinc-900 dark:text-white truncate leading-tight font-display">
                {detalle.nombre}
              </p>
              {tienePrecios && (
                <MiniSparkline positivo={cot?.changePercent >= 0} />
              )}
            </div>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded"
                style={{ background: tipo.color + '18', color: tipo.color }}>
                {tipo.label}
              </span>
              {detalle.simbolo && (
                <span className="text-xs text-zinc-400 dark:text-zinc-500">{detalle.simbolo}</span>
              )}
            </div>
          </div>
        </div>

        {/* Current price + variation */}
        <div className="text-right flex-shrink-0">
          {tienePrecios ? (
            <>
              <p className="text-sm font-bold text-zinc-900 dark:text-white font-mono-num">
                {fmtUSD(detalle.precioActualUSD)}
              </p>
              <BadgeVariacion pct={cot?.changePercent} />
            </>
          ) : (
            <span className="text-xs text-zinc-400 italic">Sin precio</span>
          )}
        </div>
      </div>

      {/* Holdings row: invested vs current & gain/loss */}
      <div className="grid grid-cols-3 gap-2">
        <div className="bg-zinc-50 dark:bg-zinc-800/40 rounded-[14px] p-2.5">
          <p className="text-[10px] text-zinc-400 dark:text-zinc-500 uppercase tracking-wider font-semibold mb-0.5">Invertí</p>
          <p className="text-sm font-bold text-zinc-700 dark:text-zinc-300 font-mono-num">
            {fmtUSD(detalle.costoTotalUSD ?? detalle.precio_compra * detalle.cantidad)}
          </p>
        </div>

        <div className="bg-zinc-50 dark:bg-zinc-800/40 rounded-[14px] p-2.5">
          <p className="text-[10px] text-zinc-400 dark:text-zinc-500 uppercase tracking-wider font-semibold mb-0.5">Vale hoy</p>
          <p className={`text-sm font-bold font-mono-num ${
            ganando === null ? 'text-zinc-700 dark:text-zinc-300'
              : ganando ? 'text-emerald-600 dark:text-emerald-400'
              : 'text-red-500 dark:text-red-400'
          }`}>
            {tienePrecios ? fmtUSD(detalle.valorActualUSD) : '—'}
          </p>
          {tienePrecios && detalle.valorActualARS && (
            <p className="text-[10px] text-zinc-400 dark:text-zinc-500 mt-0.5">{fmtARS(detalle.valorActualARS)}</p>
          )}
        </div>

        <div className={`rounded-[14px] p-2.5 ${
          ganando == null
            ? 'bg-zinc-50 dark:bg-zinc-800/40'
            : ganando
              ? 'bg-emerald-50/80 dark:bg-emerald-900/15'
              : 'bg-red-50/80 dark:bg-red-900/15'
        }`}>
          <p className="text-[10px] text-zinc-400 dark:text-zinc-500 uppercase tracking-wider font-semibold mb-0.5">Resultado</p>
          {detalle.gananciaUSD != null ? (
            <>
              <p className={`text-sm font-bold font-mono-num ${
                ganando
                  ? 'text-emerald-700 dark:text-emerald-400'
                  : 'text-red-600 dark:text-red-400'
              }`}>
                {ganando ? '+' : ''}{fmtUSD(detalle.gananciaUSD)}
              </p>
              <BadgeVariacion pct={detalle.gananciaPct} />
            </>
          ) : (
            <p className="text-sm text-zinc-400">—</p>
          )}
        </div>
      </div>

      {/* Footer: details + actions */}
      <div className="flex items-center justify-between text-xs text-zinc-400 dark:text-zinc-500 border-t border-zinc-100 dark:border-zinc-800 pt-2.5 gap-2">
        <span className="truncate">
          {detalle.cantidad % 1 === 0 ? detalle.cantidad : detalle.cantidad.toFixed(4)} uds
          · Compré a {fmtUSD(detalle.precio_compra)}
        </span>

        <div className="flex items-center gap-1.5 flex-shrink-0">
          <span className="text-zinc-300 dark:text-zinc-700">
            {new Date(detalle.fecha_compra + 'T00:00:00').toLocaleDateString('es-AR', {
              day: 'numeric', month: 'short', year: '2-digit',
            })}
          </span>

          <button
            onClick={() => onVender(detalle)}
            title="Registrar venta"
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold
              bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400
              border border-red-200 dark:border-red-800/50
              hover:bg-red-100 dark:hover:bg-red-900/40
              transition-colors md:opacity-0 md:group-hover:opacity-100"
          >
            📉 Vender
          </button>

          <button
            onClick={() => onEliminar(detalle)}
            className="p-1 text-zinc-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
            title="Eliminar inversión"
          >
            🗑️
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Historial de ventas ──────────────────────────────────────
function HistorialVentas({ ventas, onEliminar }) {
  const [expandido, setExpandido] = useState(false)
  if (!ventas || ventas.length === 0) return null

  const visibles = expandido ? ventas : ventas.slice(0, 3)

  return (
    <Card className="mb-5">
      <CardHeader
        titulo="Historial de ventas"
        subtitulo={`${ventas.length} operación${ventas.length !== 1 ? 'es' : ''} cerrada${ventas.length !== 1 ? 's' : ''}`}
      />
      <div className="flex flex-col gap-3 mt-2">
        {visibles.map(v => {
          const precioVenta = v.moneda_venta === 'ARS'
            ? `$${Number(v.precio_venta).toLocaleString('es-AR', { maximumFractionDigits: 2 })}`
            : `U$D ${Number(v.precio_venta).toLocaleString('es-AR', { minimumFractionDigits: 2 })}`

          const tipo = TIPOS[v.tipo] || TIPOS.otro
          const fechaFmt = new Date(v.fecha_venta + 'T00:00:00').toLocaleDateString('es-AR', {
            day: 'numeric', month: 'short', year: '2-digit',
          })

          return (
            <div key={v.id}
              className="flex items-center gap-3 py-2.5 px-1 border-b border-zinc-100 dark:border-zinc-800 last:border-0 group">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center text-lg flex-shrink-0"
                style={{ background: tipo.color + '18' }}>
                {v.icono || tipo.icono}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-zinc-800 dark:text-zinc-100 truncate">
                  {v.nombre}
                  {v.simbolo && <span className="text-zinc-400 font-normal ml-1">({v.simbolo})</span>}
                </p>
                <p className="text-xs text-zinc-400 dark:text-zinc-500">
                  {Number(v.cantidad) % 1 === 0 ? v.cantidad : Number(v.cantidad).toFixed(4)} uds
                  · {fechaFmt}
                </p>
              </div>
              <div className="text-right flex-shrink-0">
                <p className="text-sm font-bold text-zinc-800 dark:text-zinc-100 font-mono-num">{precioVenta}/u</p>
                <p className="text-xs text-zinc-400 dark:text-zinc-500">por unidad</p>
              </div>
              <button
                onClick={() => onEliminar(v.id)}
                className="opacity-0 group-hover:opacity-100 transition-opacity text-zinc-300 hover:text-red-500 ml-1 p-0.5"
                title="Eliminar registro"
              >
                🗑️
              </button>
            </div>
          )
        })}
      </div>
      {ventas.length > 3 && (
        <button
          onClick={() => setExpandido(e => !e)}
          className="w-full text-center text-xs font-medium text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 mt-3 pt-3 border-t border-zinc-100 dark:border-zinc-800 transition-colors"
        >
          {expandido ? 'Ver menos ▲' : `Ver ${ventas.length - 3} más ▼`}
        </button>
      )}
    </Card>
  )
}

// ── Resumen compacto del portfolio ───────────────────────────
function ResumenPortfolioCompacto({ portfolio, dolarRate, cargandoPrecios, onVerCartera }) {
  if (!portfolio || portfolio.detalles?.length === 0) return null

  const positivo = portfolio.gananciaARS >= 0

  return (
    <div
      className="card-premium card-interactive bg-white dark:bg-[var(--dark-card)]
        border border-zinc-100/70 dark:border-[var(--dark-border)]
        rounded-[20px] p-4 mb-4 cursor-pointer"
      onClick={onVerCartera}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center text-lg
            bg-gradient-to-br from-[var(--mango)]/15 to-[var(--mango)]/5">
            💼
          </div>
          <div>
            <p className="text-[10px] font-extrabold uppercase tracking-[0.12em] text-zinc-400 dark:text-zinc-500 mb-0.5">
              Mi Cartera
            </p>
            <p className="text-lg font-black text-zinc-900 dark:text-white font-mono-num leading-tight">
              {fmtARS(portfolio.totalValorARS)}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {cargandoPrecios && (
            <div className="w-1.5 h-1.5 rounded-full bg-[var(--mango)] animate-live-dot" />
          )}
          {portfolio.gananciaTotalPct != null && (
            <div className={`flex items-center gap-1 px-2.5 py-1 rounded-full ${
              positivo
                ? 'bg-emerald-50 dark:bg-emerald-900/15'
                : 'bg-red-50 dark:bg-red-900/15'
            }`}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                <path d={positivo ? "M7 17l9.2-9.2M17 17V7H7" : "M17 7l-9.2 9.2M7 7v10h10"}
                  stroke={positivo ? 'var(--leaf)' : '#EF4444'}
                  strokeWidth="2.5" strokeLinecap="round" />
              </svg>
              <span className={`text-xs font-extrabold ${
                positivo ? 'text-emerald-700 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'
              }`}>
                {positivo ? '+' : ''}{portfolio.gananciaTotalPct.toFixed(2)}%
              </span>
            </div>
          )}
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="text-zinc-300 dark:text-zinc-600">
            <path d="M9 18l6-6-6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
      </div>
    </div>
  )
}

// ── Resumen del portfolio (detallado, para vista de cartera) ─
function ResumenPortfolio({ portfolio, dolarRate, cargandoPrecios }) {
  if (!portfolio) {
    return (
      <div className="grid grid-cols-2 gap-3">
        {[0,1].map(i => <div key={i} className="h-24 bg-zinc-100 dark:bg-zinc-800 rounded-2xl animate-pulse" />)}
      </div>
    )
  }

  const positivo = portfolio.gananciaARS >= 0

  return (
    <Card className="mb-5">
      <div className="flex items-start justify-between mb-4">
        <div>
          <p className="text-[10px] font-extrabold uppercase tracking-widest text-[var(--mango-dark)] dark:text-[var(--mango)] mb-1">
            Mi Cartera
          </p>
          <p className="text-3xl font-black text-zinc-900 dark:text-white leading-tight font-mono-num">
            {fmtARS(portfolio.totalValorARS)}
          </p>
          <p className="text-sm text-zinc-400 dark:text-zinc-500 mt-0.5">
            ≈ {fmtUSD(portfolio.totalValorUSD)}
            {dolarRate && (
              <span className="text-zinc-300 dark:text-zinc-600">
                {' '}· Blue ${fmt(dolarRate.venta, 0)}
              </span>
            )}
          </p>
        </div>
        <div className="flex flex-col items-end gap-1.5">
          {cargandoPrecios && (
            <div className="flex items-center gap-1.5 text-xs text-zinc-400">
              <div className="w-1.5 h-1.5 rounded-full bg-[var(--mango)] animate-pulse" />
              Actualizando
            </div>
          )}
          {/* Overall variation */}
          {portfolio.gananciaTotalPct != null && (
            <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full ${
              positivo
                ? 'bg-emerald-50 dark:bg-emerald-900/15'
                : 'bg-red-50 dark:bg-red-900/15'
            }`}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                <path d={positivo ? "M7 17l9.2-9.2M17 17V7H7" : "M17 7l-9.2 9.2M7 7v10h10"}
                  stroke={positivo ? 'var(--leaf)' : '#EF4444'}
                  strokeWidth="2.5" strokeLinecap="round" />
              </svg>
              <span className={`text-xs font-extrabold ${
                positivo ? 'text-emerald-700 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'
              }`}>
                {positivo ? '+' : ''}{portfolio.gananciaTotalPct.toFixed(2)}%
              </span>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="bg-zinc-50 dark:bg-zinc-800/40 rounded-[18px] p-3">
          <p className="text-[10px] text-zinc-400 dark:text-zinc-500 uppercase tracking-wider font-semibold mb-1">Invertido</p>
          <p className="text-base font-bold text-zinc-700 dark:text-zinc-300 font-mono-num">
            {fmtARS(portfolio.totalCostoARS)}
          </p>
        </div>
        <div className={`rounded-[18px] p-3 ${positivo ? 'bg-emerald-50/80 dark:bg-emerald-900/15' : 'bg-red-50/80 dark:bg-red-900/15'}`}>
          <p className="text-[10px] text-zinc-400 dark:text-zinc-500 uppercase tracking-wider font-semibold mb-1">Resultado</p>
          <p className={`text-base font-bold font-mono-num ${positivo ? 'text-emerald-700 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
            {positivo ? '+' : ''}{fmtARS(portfolio.gananciaARS)}
          </p>
        </div>
      </div>
    </Card>
  )
}

// ── Vista de la cartera (portfolio detallado) ────────────────
function VistaCartera({
  inversiones, portfolio, ventas, dolarRate, cargando, cargandoPrecios,
  onAgregarInversion, onEliminar, onVender, onRefrescar, onEliminarVenta, onVolver
}) {
  const detalles = portfolio?.detalles ?? []

  return (
    <>
      {/* Botón volver */}
      <button
        onClick={onVolver}
        className="flex items-center gap-1.5 text-sm font-medium text-zinc-400 dark:text-zinc-500
          hover:text-[var(--mango)] transition-colors mb-4 cursor-pointer"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M15 18l-6-6 6-6"/>
        </svg>
        Volver a noticias
      </button>

      {/* Portfolio summary */}
      <ResumenPortfolio
        portfolio={portfolio}
        dolarRate={dolarRate}
        cargandoPrecios={cargandoPrecios}
      />

      {/* Investment list */}
      {cargando ? (
        <div className="flex flex-col gap-3">
          {[0,1,2].map(i => (
            <div key={i} className="h-40 bg-zinc-100 dark:bg-zinc-800 rounded-[20px] animate-pulse" />
          ))}
        </div>
      ) : detalles.length === 0 || inversiones.length === 0 ? (
        <Card className="py-12 mb-5">
          <EmptyState
            icono="📊"
            titulo="Todavía no tenés inversiones"
            descripcion="Agregá tus acciones, CEDEARs, cripto o fondos para ver tu cartera en tiempo real."
            accion={<Button icono="+" onClick={onAgregarInversion}>Agregar mi primera inversión</Button>}
          />
        </Card>
      ) : (
        <div className="flex flex-col gap-3 mb-5">
          <div className="flex items-center justify-between px-1">
            <p className="text-xs font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">
              {inversiones.length} {inversiones.length === 1 ? 'posición' : 'posiciones'}
            </p>
            <div className="flex gap-2">
              <Button
                variante="secondary"
                tamaño="sm"
                onClick={onRefrescar}
                cargando={cargandoPrecios}
                title="Actualizar precios"
              >
                🔄
              </Button>
            </div>
          </div>
          {detalles.map(det => (
            <TarjetaInversion
              key={det.id}
              detalle={det}
              onEliminar={onEliminar}
              onVender={onVender}
            />
          ))}
        </div>
      )}

      {/* Sales history */}
      <HistorialVentas ventas={ventas} onEliminar={onEliminarVenta} />

      {inversiones.length > 0 && (
        <p className="text-[10px] text-zinc-400 dark:text-zinc-500 text-center mt-2 pb-2">
          Precios referenciales · Fuente: Yahoo Finance & CoinGecko · No constituyen asesoramiento financiero.
        </p>
      )}
    </>
  )
}

// ── Página principal ─────────────────────────────────────────
export function InversionesPage() {
  const { usuario } = useAuthContext()
  const {
    inversiones, ventas, cotizaciones, dolarRate, portfolio,
    cargando, cargandoPrecios,
    crear, borrar, registrarVenta, eliminarVenta, refrescarPrecios,
  } = useInversiones()

  const [modalNuevo,  setModalNuevo]  = useState(false)
  const [modalVenta,  setModalVenta]  = useState(false)
  const [invParaVender, setInvParaVender] = useState(null)
  const [vistaActiva, setVistaActiva] = useState('noticias') // 'noticias' | 'cartera'

  const handleEliminar = async (detalle) => {
    if (window.confirm(`¿Eliminás ${detalle.nombre} de tu cartera?`)) {
      await borrar(detalle.id)
    }
  }

  const handleAbrirVenta = (detalle = null) => {
    setInvParaVender(detalle)
    setModalVenta(true)
  }

  const handleGuardarInversion = async (datos) => {
    if (!usuario?.id) return
    await crear(datos, usuario.id)
    setModalNuevo(false)
  }

  const handleGuardarVenta = async (datos) => {
    if (!usuario?.id) return
    await registrarVenta(datos, usuario.id)
    setModalVenta(false)
    setInvParaVender(null)
  }

  // Count gainers and losers
  const detalles = portfolio?.detalles ?? []
  const ganadores = detalles.filter(d => d.gananciaUSD > 0).length
  const perdedores = detalles.filter(d => d.gananciaUSD < 0).length

  return (
    <div className="animate-in fade-in duration-500">
      <PageWrapper>
        <PageHeader
          titulo="Inversiones"
          subtitulo={
            vistaActiva === 'noticias'
              ? 'Noticias · Informes · Análisis con IA'
              : cargando ? 'Cargando...'
              : detalles.length === 0 ? 'Tu cartera en tiempo real'
              : `${ganadores} en verde · ${perdedores} en rojo`
          }
          accion={
            <div className="flex gap-2">
              {vistaActiva === 'cartera' && (
                <>
                  <Button
                    variante="secondary"
                    tamaño="sm"
                    onClick={() => handleAbrirVenta(null)}
                    className="!text-red-600 dark:!text-red-400 !border-red-200 dark:!border-red-800/50 hover:!bg-red-50 dark:hover:!bg-red-900/20"
                    title="Registrar una venta"
                  >
                    📉 Vender
                  </Button>
                  <Button icono="+" onClick={() => setModalNuevo(true)}>
                    Agregar
                  </Button>
                </>
              )}
              {vistaActiva === 'noticias' && inversiones.length > 0 && (
                <Button
                  variante="secondary"
                  tamaño="sm"
                  onClick={() => setModalNuevo(true)}
                >
                  + Inversión
                </Button>
              )}
            </div>
          }
        />

        <TipContextual seccion="inversiones" className="mb-5" />

        {/* Vista: Noticias (default) */}
        {vistaActiva === 'noticias' && (
          <>
            {/* Resumen compacto del portfolio (clickeable para ir a la cartera) */}
            <ResumenPortfolioCompacto
              portfolio={portfolio}
              dolarRate={dolarRate}
              cargandoPrecios={cargandoPrecios}
              onVerCartera={() => setVistaActiva('cartera')}
            />

            {/* Feed de noticias */}
            <FeedNoticias holdings={inversiones} />
          </>
        )}

        {/* Vista: Cartera (portfolio detallado) */}
        {vistaActiva === 'cartera' && (
          <VistaCartera
            inversiones={inversiones}
            portfolio={portfolio}
            ventas={ventas}
            dolarRate={dolarRate}
            cargando={cargando}
            cargandoPrecios={cargandoPrecios}
            onAgregarInversion={() => setModalNuevo(true)}
            onEliminar={handleEliminar}
            onVender={handleAbrirVenta}
            onRefrescar={refrescarPrecios}
            onEliminarVenta={eliminarVenta}
            onVolver={() => setVistaActiva('noticias')}
          />
        )}
      </PageWrapper>

      {/* Modal: Add investment */}
      <Modal abierto={modalNuevo} onCerrar={() => setModalNuevo(false)} titulo="Agregar inversión" ancho="max-w-lg">
        <FormInversion onSubmit={handleGuardarInversion} onCancel={() => setModalNuevo(false)} />
      </Modal>

      {/* Modal: Register sale */}
      <Modal
        abierto={modalVenta}
        onCerrar={() => { setModalVenta(false); setInvParaVender(null) }}
        titulo="Registrar venta"
        ancho="max-w-lg"
      >
        <FormVenta
          inversiones={inversiones}
          dolarRate={dolarRate}
          inversionPreseleccionada={invParaVender}
          onSubmit={handleGuardarVenta}
          onCancel={() => { setModalVenta(false); setInvParaVender(null) }}
        />
      </Modal>
    </div>
  )
}