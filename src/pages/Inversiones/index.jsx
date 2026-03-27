import { useState } from 'react'
import { useAuthContext } from '../../context/AuthContext'
import { useInversiones } from '../../hooks/useInversiones'
import { PageWrapper, PageHeader, Sidebar, BottomNav } from '../../components/layout'
import { Card, CardHeader, Button, EmptyState, Modal } from '../../components/ui'
import { FormInversion } from '../../components/forms/FormInversion'
import { FormVenta } from '../../components/forms/FormVenta'

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

// ── Tarjeta de inversión individual ─────────────────────────
function TarjetaInversion({ detalle, onEliminar, onVender }) {
  const tipo = TIPOS[detalle.tipo] || TIPOS.otro
  const cot  = detalle.cotizacion
  const tienePrecios = detalle.precioActualUSD != null

  return (
    <div className="flex flex-col gap-3 p-4 bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-2xl group hover:border-zinc-200 dark:hover:border-zinc-700 transition-all">
      {/* Fila superior */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-11 h-11 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
            style={{ background: tipo.color + '18' }}>
            {detalle.icono || tipo.icono}
          </div>
          <div className="min-w-0">
            <p className="font-bold text-sm text-zinc-900 dark:text-white truncate leading-tight">
              {detalle.nombre}
            </p>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded"
                style={{ background: tipo.color + '18', color: tipo.color }}>
                {tipo.label}
              </span>
              {detalle.simbolo && (
                <span className="text-xs text-zinc-400">{detalle.simbolo}</span>
              )}
            </div>
          </div>
        </div>

        {/* Precio actual + variación */}
        <div className="text-right flex-shrink-0">
          {tienePrecios ? (
            <>
              <p className="text-sm font-bold text-zinc-900 dark:text-white">
                {fmtUSD(detalle.precioActualUSD)}
              </p>
              <BadgeVariacion pct={cot?.changePercent} />
            </>
          ) : (
            <span className="text-xs text-zinc-400 italic">Sin precio</span>
          )}
        </div>
      </div>

      {/* Fila de holdings */}
      <div className="grid grid-cols-2 gap-2">
        <div className="bg-zinc-50 dark:bg-zinc-800/50 rounded-xl p-2.5">
          <p className="text-[10px] text-zinc-400 uppercase tracking-wider font-medium mb-0.5">Mi posición</p>
          <p className="text-sm font-bold text-zinc-800 dark:text-zinc-200">
            {tienePrecios ? fmtUSD(detalle.valorActualUSD) : '—'}
          </p>
          {tienePrecios && detalle.valorActualARS && (
            <p className="text-[10px] text-zinc-400 mt-0.5">{fmtARS(detalle.valorActualARS)}</p>
          )}
        </div>

        <div className={`rounded-xl p-2.5 ${
          detalle.gananciaUSD == null
            ? 'bg-zinc-50 dark:bg-zinc-800/50'
            : detalle.gananciaUSD >= 0
              ? 'bg-emerald-50 dark:bg-emerald-900/15'
              : 'bg-red-50 dark:bg-red-900/15'
        }`}>
          <p className="text-[10px] text-zinc-400 uppercase tracking-wider font-medium mb-0.5">Ganancia</p>
          {detalle.gananciaUSD != null ? (
            <>
              <p className={`text-sm font-bold ${
                detalle.gananciaUSD >= 0
                  ? 'text-emerald-700 dark:text-emerald-400'
                  : 'text-red-600 dark:text-red-400'
              }`}>
                {detalle.gananciaUSD >= 0 ? '+' : ''}{fmtUSD(detalle.gananciaUSD)}
              </p>
              <BadgeVariacion pct={detalle.gananciaPct} />
            </>
          ) : (
            <p className="text-sm text-zinc-400">—</p>
          )}
        </div>
      </div>

      {/* Pie: detalles + acciones */}
      <div className="flex items-center justify-between text-xs text-zinc-400 border-t border-zinc-100 dark:border-zinc-800 pt-2.5 gap-2">
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

          {/* Botón Vender — visible siempre en mobile, hover en desktop */}
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

          {/* Botón Eliminar */}
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
                <p className="text-xs text-zinc-400">
                  {Number(v.cantidad) % 1 === 0 ? v.cantidad : Number(v.cantidad).toFixed(4)} uds
                  · {fechaFmt}
                </p>
              </div>
              <div className="text-right flex-shrink-0">
                <p className="text-sm font-bold text-zinc-800 dark:text-zinc-100">{precioVenta}/u</p>
                <p className="text-xs text-zinc-400">por unidad</p>
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

// ── Resumen del portfolio ────────────────────────────────────
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
          <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--mango-dark)] dark:text-[var(--mango)] mb-1">
            Mi Cartera
          </p>
          <p className="text-3xl font-black text-zinc-900 dark:text-white leading-tight">
            {fmtARS(portfolio.totalValorARS)}
          </p>
          <p className="text-sm text-zinc-400 mt-0.5">
            ≈ {fmtUSD(portfolio.totalValorUSD)}
            {dolarRate && (
              <span className="text-zinc-300 dark:text-zinc-600">
                {' '}· Blue ${fmt(dolarRate.venta, 0)}
              </span>
            )}
          </p>
        </div>
        {cargandoPrecios && (
          <div className="flex items-center gap-1.5 text-xs text-zinc-400">
            <div className="w-1.5 h-1.5 rounded-full bg-[var(--mango)] animate-pulse" />
            Actualizando
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="bg-zinc-50 dark:bg-zinc-800/50 rounded-2xl p-3">
          <p className="text-[10px] text-zinc-400 uppercase tracking-wider font-medium mb-1">Invertido</p>
          <p className="text-base font-bold text-zinc-700 dark:text-zinc-300">
            {fmtARS(portfolio.totalCostoARS)}
          </p>
        </div>
        <div className={`rounded-2xl p-3 ${positivo ? 'bg-emerald-50 dark:bg-emerald-900/15' : 'bg-red-50 dark:bg-red-900/15'}`}>
          <p className="text-[10px] text-zinc-400 uppercase tracking-wider font-medium mb-1">Resultado</p>
          <p className={`text-base font-bold ${positivo ? 'text-emerald-700 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
            {positivo ? '+' : ''}{fmtARS(portfolio.gananciaARS)}
          </p>
          <BadgeVariacion pct={portfolio.gananciaTotalPct} />
        </div>
      </div>
    </Card>
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
  // Inversión preseleccionada al abrir el modal de venta desde una tarjeta
  const [invParaVender, setInvParaVender] = useState(null)

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

  return (
    <div className="animate-in fade-in duration-500">
      <Sidebar usuario={usuario} />
      <BottomNav />

      <PageWrapper>
        <PageHeader
          titulo="Inversiones"
          subtitulo="Tu cartera en tiempo real"
          accion={
            <div className="flex gap-2">
              <Button
                variante="secondary"
                tamaño="sm"
                onClick={refrescarPrecios}
                cargando={cargandoPrecios}
                title="Actualizar precios"
              >
                🔄
              </Button>
              {/* ── Botón Vender ── */}
              <Button
                variante="secondary"
                tamaño="sm"
                onClick={() => handleAbrirVenta(null)}
                className="!text-red-600 dark:!text-red-400 !border-red-200 dark:!border-red-800/50 hover:!bg-red-50 dark:hover:!bg-red-900/20"
                title="Registrar una venta"
              >
                📉 Vender
              </Button>
              {/* ── Botón Agregar ── */}
              <Button icono="+" onClick={() => setModalNuevo(true)}>
                Agregar
              </Button>
            </div>
          }
        />

        {/* Resumen del portfolio */}
        <ResumenPortfolio
          portfolio={portfolio}
          dolarRate={dolarRate}
          cargandoPrecios={cargandoPrecios}
        />

        {/* Lista de inversiones */}
        {cargando ? (
          <div className="flex flex-col gap-3">
            {[0,1,2].map(i => (
              <div key={i} className="h-36 bg-zinc-100 dark:bg-zinc-800 rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : portfolio?.detalles?.length === 0 || inversiones.length === 0 ? (
          <Card className="py-12 mb-5">
            <EmptyState
              icono="📊"
              titulo="Todavía no tenés inversiones"
              descripcion="Agregá tus acciones, CEDEARs, cripto o fondos para ver tu cartera en tiempo real."
              accion={<Button icono="+" onClick={() => setModalNuevo(true)}>Agregar mi primera inversión</Button>}
            />
          </Card>
        ) : (
          <div className="flex flex-col gap-3 mb-5">
            <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider px-1">
              {inversiones.length} {inversiones.length === 1 ? 'posición' : 'posiciones'}
            </p>
            {(portfolio?.detalles ?? []).map(det => (
              <TarjetaInversion
                key={det.id}
                detalle={det}
                onEliminar={handleEliminar}
                onVender={handleAbrirVenta}
              />
            ))}
          </div>
        )}

        {/* Historial de ventas */}
        <HistorialVentas ventas={ventas} onEliminar={eliminarVenta} />

        {inversiones.length > 0 && (
          <p className="text-[10px] text-zinc-400 text-center mt-2 pb-2">
            Precios referenciales · Fuente: Yahoo Finance & CoinGecko · No constituyen asesoramiento financiero.
          </p>
        )}
      </PageWrapper>

      {/* Modal: Agregar inversión */}
      <Modal abierto={modalNuevo} onCerrar={() => setModalNuevo(false)} titulo="Agregar inversión" ancho="max-w-lg">
        <FormInversion onSubmit={handleGuardarInversion} onCancel={() => setModalNuevo(false)} />
      </Modal>

      {/* Modal: Registrar venta */}
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