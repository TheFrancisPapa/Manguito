import { useState, useEffect, useCallback } from 'react'
import { Button, Input, Spinner } from '../ui'
import { fetchSymbolInfoConFecha } from '../../api/inversiones'
import { calcularGananciaVenta } from '../../api/ventas'

const TIPOS = {
  accion:  { label: 'Acción',  icono: '📈', color: '#3B82F6' },
  cedear:  { label: 'CEDEAR',  icono: '🇦🇷', color: '#8B5CF6' },
  crypto:  { label: 'Cripto',  icono: '₿',  color: '#F59E0B' },
  fci:     { label: 'FCI',     icono: '🏦', color: '#10B981' },
  otro:    { label: 'Otro',    icono: '💼', color: '#6B7280' },
}

function fmtPrecio(precio, moneda) {
  if (precio == null) return '—'
  const fmt = Number(precio).toLocaleString('es-AR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: precio < 1 ? 6 : 2,
  })
  return `${moneda === 'ARS' ? '$' : 'U$D'} ${fmt}`
}

function fmtGanancia(valor, moneda = 'USD') {
  if (valor == null) return '—'
  const abs = Math.abs(valor)
  const sign = valor >= 0 ? '+' : '-'
  const fmt = abs.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
  return `${sign}${moneda === 'ARS' ? '$' : 'U$D'} ${fmt}`
}

/**
 * FormVenta — formulario para registrar una venta de inversión.
 *
 * Props:
 *   inversiones  — lista de inversiones del usuario (para el selector)
 *   dolarRate    — cotización del dólar blue (para calcular ganancia en ARS)
 *   onSubmit     — (datos) => Promise<void>
 *   onCancel     — () => void
 *   inversionPreseleccionada — objeto inversión a preseleccionar (opcional)
 */
export function FormVenta({ inversiones = [], dolarRate, onSubmit, onCancel, inversionPreseleccionada = null }) {
  const hoyStr = new Date().toLocaleDateString('sv-SE')

  const [invSeleccionada, setInvSeleccionada] = useState(inversionPreseleccionada?.id ?? '')
  const [form, setForm] = useState({
    tipo:         inversionPreseleccionada?.tipo         ?? 'accion',
    simbolo:      inversionPreseleccionada?.simbolo      ?? '',
    nombre:       inversionPreseleccionada?.nombre       ?? '',
    icono:        inversionPreseleccionada?.icono        ?? '📉',
    cantidad:     inversionPreseleccionada?.cantidad?.toString() ?? '',
    precio_venta: '',
    moneda_venta: inversionPreseleccionada?.moneda_compra ?? 'USD',
    fecha_venta:  hoyStr,
    notas:        '',
  })

  const [cargando,         setCargando]         = useState(false)
  const [error,            setError]             = useState(null)
  const [detectando,       setDetectando]        = useState(false)
  const [infoDetectada,    setInfoDetectada]      = useState(null)
  const [errorDeteccion,   setErrorDeteccion]    = useState(null)
  const [gananciaPreview,  setGananciaPreview]   = useState(null)

  const set = (k) => (e) => {
    setForm(f => ({ ...f, [k]: e.target?.value ?? e }))
    setError(null)
  }

  // ── Cuando el usuario selecciona una inversión existente ─────
  const handleSelectInversion = (id) => {
    setInvSeleccionada(id)
    if (!id) return

    const inv = inversiones.find(i => i.id === id)
    if (!inv) return

    setForm(f => ({
      ...f,
      tipo:         inv.tipo,
      simbolo:      inv.simbolo ?? '',
      nombre:       inv.nombre,
      icono:        inv.icono ?? TIPOS[inv.tipo]?.icono ?? '📉',
      cantidad:     inv.cantidad?.toString() ?? '',
      moneda_venta: inv.moneda_compra ?? 'USD',
    }))
    setInfoDetectada(null)
    setErrorDeteccion(null)
    setGananciaPreview(null)
  }

  // ── Auto-detección de precio por símbolo + fecha ─────────────
  const puedeDetectar = !['fci', 'otro'].includes(form.tipo)
    && form.simbolo?.trim().length >= 1
    && form.fecha_venta?.length === 10

  const detectar = useCallback(async (simbolo, tipo, fecha) => {
    setDetectando(true)
    setInfoDetectada(null)
    setErrorDeteccion(null)

    try {
      const info = await fetchSymbolInfoConFecha(simbolo, tipo, fecha)
      if (!info) return

      setInfoDetectada(info)
      setForm(f => ({
        ...f,
        nombre:       info.nombre || f.nombre,
        simbolo:      info.simboloFinal || f.simbolo,
        precio_venta: info.precio != null
          ? Number(info.precio).toFixed(info.precio < 1 ? 6 : 2)
          : f.precio_venta,
        moneda_venta: info.moneda === 'ARS' ? 'ARS' : 'USD',
      }))
    } catch (err) {
      setErrorDeteccion(err.message || 'No se pudo obtener el precio automáticamente.')
    } finally {
      setDetectando(false)
    }
  }, [])

  useEffect(() => {
    if (!puedeDetectar) {
      setInfoDetectada(null)
      setErrorDeteccion(null)
      return
    }
    const timer = setTimeout(() => {
      detectar(form.simbolo, form.tipo, form.fecha_venta)
    }, 700)
    return () => clearTimeout(timer)
  }, [form.simbolo, form.fecha_venta, form.tipo, puedeDetectar, detectar])

  // ── Cálculo de ganancia en tiempo real ───────────────────────
  useEffect(() => {
    if (!invSeleccionada || !form.precio_venta || !form.cantidad) {
      setGananciaPreview(null)
      return
    }
    const inv = inversiones.find(i => i.id === invSeleccionada)
    if (!inv) { setGananciaPreview(null); return }

    const g = calcularGananciaVenta({
      cantidad:          parseFloat(form.cantidad),
      precio_venta:      parseFloat(form.precio_venta),
      moneda_venta:      form.moneda_venta,
      precio_compra_ref: inv.precio_compra,
      moneda_compra_ref: inv.moneda_compra,
      dolarBlue:         dolarRate,
    })
    setGananciaPreview(g)
  }, [form.precio_venta, form.cantidad, form.moneda_venta, invSeleccionada, inversiones, dolarRate])

  // ── Submit ───────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!form.nombre.trim()) { setError('Completá el nombre del activo.'); return }
    if (!form.cantidad || parseFloat(form.cantidad) <= 0) { setError('La cantidad debe ser mayor a 0.'); return }
    if (!form.precio_venta || parseFloat(form.precio_venta) <= 0) { setError('El precio de venta debe ser mayor a 0.'); return }

    // Validar que no vende más de lo que tiene (si viene de inversión existente)
    if (invSeleccionada) {
      const inv = inversiones.find(i => i.id === invSeleccionada)
      if (inv && parseFloat(form.cantidad) > inv.cantidad) {
        setError(`No podés vender más de ${inv.cantidad} unidades (lo que tenés).`)
        return
      }
    }

    setCargando(true)
    try {
      const inv = inversiones.find(i => i.id === invSeleccionada)
      await onSubmit({
        tipo:              form.tipo,
        nombre:            form.nombre.trim(),
        simbolo:           form.simbolo?.toUpperCase() || null,
        icono:             form.icono || TIPOS[form.tipo]?.icono || '📉',
        cantidad:          parseFloat(form.cantidad),
        precio_venta:      parseFloat(form.precio_venta),
        moneda_venta:      form.moneda_venta,
        fecha_venta:       form.fecha_venta,
        notas:             form.notas.trim() || null,
        inversion_id:      invSeleccionada || null,
        precio_compra_ref: inv?.precio_compra || null,
        moneda_compra_ref: inv?.moneda_compra || null,
      })
    } catch (err) {
      setError(err.message || 'Error al registrar la venta.')
      setCargando(false)
    }
  }

  // ── Badge de estado de detección ─────────────────────────────
  const badge = (() => {
    if (detectando) return { tipo: 'cargando', texto: 'Buscando precio de venta…' }
    if (infoDetectada) {
      const precioStr = fmtPrecio(infoDetectada.precio, infoDetectada.moneda)
      const fechaReal = infoDetectada.actualDate
        ? new Date(infoDetectada.actualDate + 'T12:00:00').toLocaleDateString('es-AR', { day: 'numeric', month: 'short', year: 'numeric' })
        : null
      const nombreCorto = infoDetectada.nombre?.length > 28
        ? infoDetectada.nombre.slice(0, 26) + '…'
        : infoDetectada.nombre
      return { tipo: 'exito', texto: `${nombreCorto} · ${precioStr}${fechaReal ? ` (${fechaReal})` : ''}` }
    }
    if (errorDeteccion) return { tipo: 'error', texto: errorDeteccion }
    return null
  })()

  const tipoMeta = TIPOS[form.tipo]
  const invActual = inversiones.find(i => i.id === invSeleccionada)

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 max-h-[75vh] overflow-y-auto overflow-x-hidden pr-1">

      {/* ── 1. Selector de inversión existente ── */}
      {inversiones.length > 0 && (
        <div>
          <label className="text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-1.5 block">
            ¿Vendés algo de tu cartera? (opcional)
          </label>
          <select
            value={invSeleccionada}
            onChange={e => handleSelectInversion(e.target.value)}
            className="field-base field-select"
          >
            <option value="">— Ingresá el símbolo manualmente —</option>
            <optgroup label="Mis inversiones">
              {inversiones
                .filter(i => i.simbolo)
                .map(inv => (
                  <option key={inv.id} value={inv.id}>
                    {TIPOS[inv.tipo]?.icono} {inv.nombre}
                    {inv.simbolo ? ` (${inv.simbolo})` : ''}
                    {' · '}x{Number(inv.cantidad) % 1 === 0 ? inv.cantidad : Number(inv.cantidad).toFixed(4)}
                  </option>
                ))}
            </optgroup>
          </select>
          {invActual && (
            <p className="text-[10px] text-zinc-400 mt-1 px-1">
              Precio de compra: {fmtPrecio(invActual.precio_compra, invActual.moneda_compra)}
              · Fecha:{' '}
              {new Date(invActual.fecha_compra + 'T12:00:00').toLocaleDateString('es-AR', { day: 'numeric', month: 'short', year: 'numeric' })}
            </p>
          )}
        </div>
      )}

      {/* ── 2. Tipo (solo si no hay inversión seleccionada) ── */}
      {!invSeleccionada && (
        <div>
          <label className="text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-2 block">
            Tipo de activo
          </label>
          <div className="grid grid-cols-5 gap-1.5">
            {Object.entries(TIPOS).map(([key, meta]) => (
              <button
                key={key}
                type="button"
                onClick={() => {
                  setForm(f => ({ ...f, tipo: key, simbolo: '', nombre: '', icono: meta.icono }))
                  setInfoDetectada(null)
                  setErrorDeteccion(null)
                }}
                className={`flex flex-col items-center gap-1 p-2 rounded-xl border-2 transition-all ${
                  form.tipo === key
                    ? 'border-red-400 bg-red-50/50 dark:bg-red-900/10'
                    : 'border-zinc-100 dark:border-zinc-800 hover:border-zinc-200'
                }`}
              >
                <span className="text-lg">{meta.icono}</span>
                <span className="text-[9px] font-bold text-zinc-500 dark:text-zinc-400">{meta.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ── 3. Símbolo y fecha — misma fila ── */}
      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
            Símbolo / Ticker
          </label>
          <div className="relative flex items-center">
            <input
              value={form.simbolo}
              onChange={set('simbolo')}
              placeholder={
                form.tipo === 'cedear' ? 'AAPL, GOOGL…' :
                form.tipo === 'crypto' ? 'BTC, ETH…' :
                form.tipo === 'accion' ? 'SPY, AAPL…' : '—'
              }
              disabled={['fci', 'otro'].includes(form.tipo) || !!invSeleccionada}
              className="w-full bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700
                rounded-xl px-3 py-2.5 text-sm uppercase font-mono font-bold tracking-wide
                focus:outline-none focus:ring-2 focus:ring-red-400/40
                text-zinc-900 dark:text-white placeholder:text-zinc-400 placeholder:font-normal
                disabled:opacity-50 disabled:cursor-not-allowed"
            />
            {detectando && (
              <div className="absolute right-3">
                <Spinner size={14} />
              </div>
            )}
          </div>
        </div>

        <Input
          label="Fecha de venta"
          type="date"
          value={form.fecha_venta}
          onChange={set('fecha_venta')}
          required
        />
      </div>

      {/* ── 4. Badge de detección ── */}
      {badge && (
        <div className={`flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs font-medium transition-all ${
          badge.tipo === 'cargando'
            ? 'bg-zinc-50 dark:bg-zinc-800/50 text-zinc-500 border border-zinc-200 dark:border-zinc-700'
          : badge.tipo === 'exito'
            ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/50'
          : 'bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800/50'
        }`}>
          <span className="flex-shrink-0 text-base leading-none">
            {badge.tipo === 'cargando' && <Spinner size={13} />}
            {badge.tipo === 'exito'    && '✅'}
            {badge.tipo === 'error'    && '⚠️'}
          </span>
          <span className="leading-snug">{badge.texto}</span>
          {badge.tipo === 'error' && form.simbolo && form.fecha_venta && (
            <button
              type="button"
              onClick={() => detectar(form.simbolo, form.tipo, form.fecha_venta)}
              className="ml-auto text-[10px] underline opacity-70 hover:opacity-100 flex-shrink-0"
            >
              Reintentar
            </button>
          )}
        </div>
      )}

      {/* ── 5. Nombre ── */}
      <div className="flex flex-col gap-1">
        <div className="flex items-center justify-between">
          <label className="text-xs font-medium text-zinc-500 dark:text-zinc-400">Nombre del activo</label>
          {infoDetectada?.nombre && form.nombre === infoDetectada.nombre && (
            <span className="text-[9px] text-emerald-600 dark:text-emerald-400 font-semibold bg-emerald-50 dark:bg-emerald-900/20 px-1.5 py-0.5 rounded-full">
              Detectado
            </span>
          )}
        </div>
        <input
          value={form.nombre}
          onChange={set('nombre')}
          placeholder="Se completa automáticamente"
          required
          disabled={!!invSeleccionada}
          className="w-full bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700
            rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-400/40
            text-zinc-900 dark:text-white placeholder:text-zinc-400
            disabled:opacity-50 disabled:cursor-not-allowed"
        />
      </div>

      {/* ── 6. Cantidad y precio de venta ── */}
      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-zinc-500 dark:text-zinc-400">Cantidad vendida</label>
          {invActual && (
            <p className="text-[10px] text-zinc-400 -mt-0.5">
              Tenés: {Number(invActual.cantidad) % 1 === 0
                ? invActual.cantidad
                : Number(invActual.cantidad).toFixed(4)}
            </p>
          )}
          <input
            type="number"
            inputMode="decimal"
            step="any"
            min="0.00000001"
            placeholder={invActual ? `máx ${invActual.cantidad}` : '0'}
            value={form.cantidad}
            onChange={set('cantidad')}
            required
            className="w-full bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700
              rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-400/40
              text-zinc-900 dark:text-white placeholder:text-zinc-400"
          />
        </div>

        <div className="flex flex-col gap-1">
          <div className="flex items-center justify-between">
            <label className="text-xs font-medium text-zinc-500 dark:text-zinc-400">Precio de venta</label>
            {infoDetectada?.moneda && (
              <span className={`text-[9px] font-semibold px-1.5 py-0.5 rounded-full ${
                infoDetectada.moneda === 'ARS'
                  ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20'
                  : 'text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20'
              }`}>
                {infoDetectada.moneda === 'ARS' ? '🇦🇷 ARS' : '🇺🇸 USD'}
              </span>
            )}
          </div>
          <div className="flex gap-1.5">
            <select
              value={form.moneda_venta}
              onChange={set('moneda_venta')}
              className="field-base field-select !w-[90px]"
            >
              <option value="USD">USD</option>
              <option value="ARS">ARS</option>
              <option value="EUR">EUR</option>
            </select>
            <div className="relative flex-1">
              <input
                type="number"
                inputMode="decimal"
                step="any"
                min="0.0001"
                placeholder={detectando ? '…' : '0.00'}
                value={form.precio_venta}
                onChange={set('precio_venta')}
                required
                className="w-full bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700
                  rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-400/40
                  text-zinc-900 dark:text-white placeholder:text-zinc-400"
              />
              {infoDetectada?.precio != null && form.precio_venta && (
                <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] text-emerald-500 font-bold pointer-events-none">
                  ✓
                </span>
              )}
            </div>
          </div>
          <p className="text-[10px] text-zinc-400 px-1">
            {infoDetectada?.isHistorical ? 'Precio de cierre · podés editarlo' : 'Se detecta por el símbolo y la fecha'}
          </p>
        </div>
      </div>

      {/* ── 7. Preview de ganancia/pérdida ── */}
      {gananciaPreview && (
        <div className={`rounded-xl px-4 py-3 border ${
          (gananciaPreview.gananciaPct ?? 0) >= 0
            ? 'bg-emerald-50 dark:bg-emerald-900/15 border-emerald-200 dark:border-emerald-800/50'
            : 'bg-red-50 dark:bg-red-900/15 border-red-200 dark:border-red-800/50'
        }`}>
          <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 mb-1.5">
            Resultado estimado de la venta
          </p>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <p className="text-[10px] text-zinc-400 mb-0.5">Ganancia / Pérdida (USD)</p>
              <p className={`text-base font-black ${
                gananciaPreview.gananciaUSD >= 0
                  ? 'text-emerald-700 dark:text-emerald-400'
                  : 'text-red-600 dark:text-red-400'
              }`}>
                {fmtGanancia(gananciaPreview.gananciaUSD, 'USD')}
              </p>
            </div>
            <div>
              <p className="text-[10px] text-zinc-400 mb-0.5">Variación</p>
              <p className={`text-base font-black ${
                (gananciaPreview.gananciaPct ?? 0) >= 0
                  ? 'text-emerald-700 dark:text-emerald-400'
                  : 'text-red-600 dark:text-red-400'
              }`}>
                {gananciaPreview.gananciaPct != null
                  ? `${gananciaPreview.gananciaPct >= 0 ? '+' : ''}${gananciaPreview.gananciaPct.toFixed(2)}%`
                  : '—'}
              </p>
            </div>
          </div>
          <p className="text-[10px] text-zinc-400 mt-1.5">
            Compra: {fmtPrecio(gananciaPreview.precioCompraUSD, 'USD')} · Venta: {fmtPrecio(gananciaPreview.precioVentaUSD, 'USD')}
            {dolarRate ? ` · Dólar blue: $${Number(dolarRate.venta).toLocaleString('es-AR')}` : ''}
          </p>
        </div>
      )}

      {/* ── 8. Notas ── */}
      <div className="flex flex-col gap-1">
        <label className="text-xs font-medium text-zinc-500 dark:text-zinc-400">Notas (opcional)</label>
        <input
          value={form.notas}
          onChange={set('notas')}
          placeholder="Ej: Venta parcial, tomé ganancias, stop-loss…"
          className="w-full bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700
            rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-400/40
            text-zinc-900 dark:text-white placeholder:text-zinc-400"
        />
      </div>

      {/* ── Error ── */}
      {error && (
        <p className="text-xs text-red-500 bg-red-50 dark:bg-red-900/20 rounded-xl px-3 py-2 border border-red-100 dark:border-red-900">
          {error}
        </p>
      )}

      {/* ── Acciones ── */}
      <div className="flex gap-3 mt-2">
        <Button type="button" variante="secondary" className="flex-1" onClick={onCancel} disabled={cargando}>
          Cancelar
        </Button>
        <Button
          type="submit"
          className="flex-1 !bg-gradient-to-r !from-red-500 !to-rose-600 !shadow-red-500/25 !border-red-600/20"
          cargando={cargando}
        >
          Registrar venta
        </Button>
      </div>
    </form>
  )
}