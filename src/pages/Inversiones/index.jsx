import { useState } from 'react'
import { useAuthContext } from '../../context/AuthContext'
import { useInversiones } from '../../hooks/useInversiones'
import { CRYPTOS_POPULARES } from '../../api/inversiones'
import { PageWrapper, PageHeader, Sidebar, BottomNav } from '../../components/layout'
import { Card, CardHeader, Button, EmptyState, Modal, Input } from '../../components/ui'

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

// ── Formulario de nueva inversión ───────────────────────────
const FORM_INICIAL = {
  tipo: 'accion',
  nombre: '',
  simbolo: '',
  icono: '📈',
  cantidad: '',
  precio_compra: '',
  moneda_compra: 'USD',
  fecha_compra: new Date().toLocaleDateString('sv-SE'),
  notas: '',
}

function FormInversion({ onSubmit, onCancel }) {
  const [form, setForm]         = useState(FORM_INICIAL)
  const [cargando, setCargando] = useState(false)
  const [error, setError]       = useState(null)

  const set = (k) => (e) => {
    const val = e.target?.value ?? e
    setForm(f => ({ ...f, [k]: val }))
    setError(null)
  }

  const handleTipo = (tipo) => {
    const icono = TIPOS[tipo]?.icono ?? '📈'
    setForm(f => ({ ...f, tipo, simbolo: '', nombre: '', icono }))
  }

  const handleCryptoSelect = (cripto) => {
    setForm(f => ({
      ...f,
      simbolo: cripto.simbolo,
      nombre:  cripto.nombre,
      icono:   cripto.icono,
      moneda_compra: 'USD',
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.nombre || !form.cantidad || !form.precio_compra) {
      setError('Completá nombre, cantidad y precio de compra.')
      return
    }
    if (parseFloat(form.cantidad) <= 0 || parseFloat(form.precio_compra) <= 0) {
      setError('La cantidad y el precio deben ser mayores a 0.')
      return
    }
    setCargando(true)
    try {
      await onSubmit({
        ...form,
        simbolo:       form.simbolo?.toUpperCase() || null,
        cantidad:      parseFloat(form.cantidad),
        precio_compra: parseFloat(form.precio_compra),
      })
    } catch (err) {
      setError(err.message || 'Error al guardar la inversión.')
      setCargando(false)
    }
  }

  const tipoMeta = TIPOS[form.tipo]

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 max-h-[70vh] overflow-y-auto pr-1">
      {/* Tipo */}
      <div>
        <label className="text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-2 block">Tipo de activo</label>
        <div className="grid grid-cols-5 gap-1.5">
          {Object.entries(TIPOS).map(([key, meta]) => (
            <button
              key={key}
              type="button"
              onClick={() => handleTipo(key)}
              className={`flex flex-col items-center gap-1 p-2 rounded-xl border-2 transition-all text-center ${
                form.tipo === key
                  ? 'border-[var(--mango)] bg-[var(--mango)]/8'
                  : 'border-zinc-100 dark:border-zinc-800 hover:border-zinc-200'
              }`}
            >
              <span className="text-lg">{meta.icono}</span>
              <span className="text-[9px] font-bold text-zinc-500 dark:text-zinc-400">{meta.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Cripto: selector rápido */}
      {form.tipo === 'crypto' && (
        <div>
          <label className="text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-2 block">Seleccioná la cripto</label>
          <div className="grid grid-cols-5 gap-1.5">
            {CRYPTOS_POPULARES.map(c => (
              <button
                key={c.simbolo}
                type="button"
                onClick={() => handleCryptoSelect(c)}
                className={`flex flex-col items-center gap-1 p-2 rounded-xl border transition-all ${
                  form.simbolo === c.simbolo
                    ? 'border-amber-400 bg-amber-50 dark:bg-amber-900/20'
                    : 'border-zinc-100 dark:border-zinc-800 hover:border-zinc-300'
                }`}
              >
                <span className="text-base font-mono font-bold">{c.icono}</span>
                <span className="text-[9px] font-bold text-zinc-500">{c.simbolo}</span>
              </button>
            ))}
          </div>
          {/* Cripto manual */}
          <p className="text-xs text-zinc-400 mt-2">
            ¿No está en la lista? Ingresá el símbolo manualmente abajo (ej: <code className="bg-zinc-100 dark:bg-zinc-800 px-1 rounded">LINK</code>).
          </p>
        </div>
      )}

      {/* Nombre + Símbolo */}
      <div className="grid grid-cols-2 gap-3">
        <Input
          label="Nombre"
          placeholder={form.tipo === 'accion' ? 'Apple Inc.' : form.tipo === 'cedear' ? 'Apple CEDEAR' : 'Bitcoin'}
          value={form.nombre}
          onChange={set('nombre')}
          required
        />
        <Input
          label={`Ticker ${tipoMeta.hint ? `(${tipoMeta.hint})` : ''}`}
          placeholder={form.tipo === 'crypto' ? 'BTC' : form.tipo === 'cedear' ? 'AAPL.BA' : 'AAPL'}
          value={form.simbolo}
          onChange={set('simbolo')}
          disabled={form.tipo === 'fci' || form.tipo === 'otro'}
        />
      </div>

      {/* Emoji (solo para fci/otro) */}
      {(form.tipo === 'fci' || form.tipo === 'otro') && (
        <Input label="Emoji / Ícono" value={form.icono} onChange={set('icono')} maxLength={2} />
      )}

      {/* Cantidad y precio */}
      <div className="grid grid-cols-2 gap-3">
        <Input
          label="Cantidad"
          type="number"
          inputMode="decimal"
          step="any"
          min="0.00000001"
          placeholder={form.tipo === 'crypto' ? '0.5' : '10'}
          value={form.cantidad}
          onChange={set('cantidad')}
          required
        />
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
            Precio de compra
          </label>
          <div className="flex gap-1.5">
            <select
              value={form.moneda_compra}
              onChange={set('moneda_compra')}
              className="bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 rounded-xl px-2 text-xs text-zinc-700 dark:text-zinc-300 w-20 focus:outline-none focus:ring-2 focus:ring-[var(--mango)]/40"
            >
              <option value="USD">USD</option>
              <option value="ARS">ARS</option>
              <option value="EUR">EUR</option>
            </select>
            <input
              type="number"
              inputMode="decimal"
              step="any"
              min="0.0001"
              placeholder="0.00"
              value={form.precio_compra}
              onChange={set('precio_compra')}
              required
              className="flex-1 bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--mango)]/40 text-zinc-900 dark:text-white"
            />
          </div>
        </div>
      </div>

      {/* Fecha */}
      <Input
        label="Fecha de compra"
        type="date"
        value={form.fecha_compra}
        onChange={set('fecha_compra')}
        required
      />

      {error && (
        <p className="text-xs text-red-500 bg-red-50 dark:bg-red-900/20 rounded-xl px-3 py-2 border border-red-100 dark:border-red-900">
          {error}
        </p>
      )}

      <div className="flex gap-3 mt-2">
        <Button type="button" variante="secondary" className="flex-1" onClick={onCancel} disabled={cargando}>
          Cancelar
        </Button>
        <Button type="submit" className="flex-1" cargando={cargando}>
          Guardar
        </Button>
      </div>
    </form>
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
    await crear(datos)
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