import { useState } from 'react'
import { useAuthContext } from '../../context/AuthContext'
import { useInversiones } from '../../hooks/useInversiones'
import { PageWrapper, PageHeader, Sidebar, BottomNav } from '../../components/layout'
import { Card, CardHeader, Button, EmptyState, Modal } from '../../components/ui'
import { FormInversion } from '../../components/forms/FormInversion'

// ── Formateo ────────────────────────────────────────────────
const fmt = (n, dec = 2) =>
  n == null ? '—' : Number(n).toLocaleString('es-AR', { minimumFractionDigits: dec, maximumFractionDigits: dec })

const fmtARS = (n) => n == null ? '—' : `$\u00A0${fmt(n, 0)}`
const fmtUSD = (n) => n == null ? '—' : `U$D\u00A0${fmt(n, 2)}`

// ── Tipos de activo con metadatos ───────────────────────────
const TIPOS = {
  accion:  { label: 'Acción',   icono: '📈', color: '#3B82F6', hint: 'Ej: AAPL, TSLA, MSFT' },
  cedear:  { label: 'CEDEAR',   icono: '🇦🇷', color: '#8B5CF6', hint: 'Ej: AAPL.BA, GOOGL.BA' },
  crypto:  { label: 'Cripto',   icono: '₿',  color: '#F59E0B', hint: 'Seleccioná de la lista' },
  fci:     { label: 'FCI',      icono: '🏦', color: '#10B981', hint: 'Ingresá el nombre del fondo' },
  otro:    { label: 'Otro',     icono: '💼', color: '#6B7280', hint: 'Inmueble, oro, plazo fijo, etc.' },
}

// ── Badge de variación ───────────────────────────────────────
function BadgeVariacion({ pct, size = 'sm' }) {
  if (pct == null) return <span className="text-xs text-zinc-400">—</span>
  const positivo = pct >= 0
  const cls = positivo
    ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400'
    : 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400'
  return (
    <span className={`inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-xs font-bold ${cls}`}>
      {positivo ? '▲' : '▼'} {Math.abs(pct).toFixed(2)}%
    </span>
  )
}

// ── Tarjeta de inversión individual ─────────────────────────
function TarjetaInversion({ detalle, onEliminar }) {
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

      {/* Fila inferior: holdings */}
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
              <p className={`text-sm font-bold ${detalle.gananciaUSD >= 0 ? 'text-emerald-700 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
                {detalle.gananciaUSD >= 0 ? '+' : ''}{fmtUSD(detalle.gananciaUSD)}
              </p>
              <BadgeVariacion pct={detalle.gananciaPct} />
            </>
          ) : (
            <p className="text-sm text-zinc-400">—</p>
          )}
        </div>
      </div>

      {/* Detalles compra */}
      <div className="flex items-center justify-between text-xs text-zinc-400 border-t border-zinc-100 dark:border-zinc-800 pt-2.5">
        <span>
          {detalle.cantidad % 1 === 0 ? detalle.cantidad : detalle.cantidad.toFixed(4)} unidades
          · Compré a {fmtUSD(detalle.precio_compra)}
        </span>
        <div className="flex items-center gap-2">
          <span>{new Date(detalle.fecha_compra + 'T00:00:00').toLocaleDateString('es-AR', { day: 'numeric', month: 'short', year: '2-digit' })}</span>
          <button
            onClick={() => onEliminar(detalle)}
            className="opacity-0 group-hover:opacity-100 transition-opacity text-zinc-300 hover:text-red-500 p-0.5"
            title="Eliminar">
            🗑️
          </button>
        </div>
      </div>
    </div>
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
  const { usuario }     = useAuthContext()
  const {
    inversiones, cotizaciones, dolarRate, portfolio,
    cargando, cargandoPrecios,
    crear, borrar, refrescarPrecios,
  } = useInversiones()

  const [modalNuevo, setModalNuevo] = useState(false)

  const handleEliminar = async (detalle) => {
    if (window.confirm(`¿Eliminás ${detalle.nombre} de tu cartera?`)) {
      await borrar(detalle.id)
    }
  }

  const handleGuardar = async (datos) => {
    if (!usuario?.id) return
    await crear(datos, usuario.id)
    setModalNuevo(false)
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
                title="Actualizar precios">
                🔄
              </Button>
              <Button icono="+" onClick={() => setModalNuevo(true)}>
                Agregar
              </Button>
            </div>
          }
        />

        {/* Resumen */}
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
          <Card className="py-12">
            <EmptyState
              icono="📊"
              titulo="Todavía no tenés inversiones"
              descripcion="Agregá tus acciones, CEDEARs, cripto o fondos para ver tu cartera en tiempo real."
              accion={<Button icono="+" onClick={() => setModalNuevo(true)}>Agregar mi primera inversión</Button>}
            />
          </Card>
        ) : (
          <div className="flex flex-col gap-3">
            <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider px-1">
              {inversiones.length} {inversiones.length === 1 ? 'posición' : 'posiciones'}
            </p>
            {(portfolio?.detalles ?? []).map(det => (
              <TarjetaInversion
                key={det.id}
                detalle={det}
                onEliminar={handleEliminar}
              />
            ))}

            {/* Nota legal */}
            <p className="text-[10px] text-zinc-400 text-center mt-4 pb-2">
              Precios referenciales · Fuente: Yahoo Finance & CoinGecko · No constituyen asesoramiento financiero.
            </p>
          </div>
        )}
      </PageWrapper>

      <Modal abierto={modalNuevo} onCerrar={() => setModalNuevo(false)} titulo="Agregar inversión" ancho="max-w-lg">
        <FormInversion onSubmit={handleGuardar} onCancel={() => setModalNuevo(false)} />
      </Modal>
    </div>
  )
}