import { useState, useEffect, useCallback } from 'react'
import { Button, Input, Spinner } from '../../components/ui'
import { CRYPTOS_POPULARES, fetchSymbolInfoConFecha } from '../../api/inversiones'

const TIPOS = {
  accion:  { label: 'Acción',  icono: '📈', color: '#3B82F6', hint: 'Ej: AAPL, SPY, TSLA' },
  cedear:  { label: 'CEDEAR',  icono: '🇦🇷', color: '#8B5CF6', hint: 'Ej: AAPL → busca AAPL.BA' },
  crypto:  { label: 'Cripto',  icono: '₿',  color: '#F5A623', hint: 'Seleccioná o escribí el símbolo' },
  fci:     { label: 'FCI',     icono: '🏦', color: '#10B981', hint: 'Ingresá el nombre del fondo' },
  otro:    { label: 'Otro',    icono: '💼', color: '#6B7280', hint: 'Inmueble, oro, plazo fijo…' },
}

const FORM_INICIAL = {
  tipo:          'accion',
  nombre:        '',
  simbolo:       '',
  icono:         '📈',
  cantidad:      '',
  precio_compra: '',
  moneda_compra: 'USD',
  fecha_compra:  new Date().toLocaleDateString('sv-SE'),
  notas:         '',
}

function fmtPrecioDetectado(precio, moneda) {
  if (precio == null) return '—'
  const fmt = Number(precio).toLocaleString('es-AR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: precio < 1 ? 6 : 2,
  })
  return `${moneda === 'ARS' ? '$' : 'U$D'} ${fmt}`
}

export function FormInversion({ onSubmit, onCancel }) {
  const [form,     setForm]     = useState(FORM_INICIAL)
  const [cargando, setCargando] = useState(false)
  const [error,    setError]    = useState(null)

  const [detectando,     setDetectando]     = useState(false)
  const [infoDetectada,  setInfoDetectada]  = useState(null)
  const [errorDeteccion, setErrorDeteccion] = useState(null)

  const set = (k) => (e) => {
    const val = e.target?.value ?? e
    setForm(f => ({ ...f, [k]: val }))
    setError(null)
  }

  const handleTipo = (tipo) => {
    const icono = TIPOS[tipo]?.icono ?? '📈'
    setForm(f => ({ ...f, tipo, simbolo: '', nombre: '', icono, precio_compra: '', moneda_compra: 'USD' }))
    setInfoDetectada(null)
    setErrorDeteccion(null)
  }

  const handleCryptoSelect = (cripto) => {
    setForm(f => ({ ...f, simbolo: cripto.simbolo, nombre: cripto.nombre, icono: cripto.icono, moneda_compra: 'USD' }))
    setInfoDetectada(null)
    setErrorDeteccion(null)
  }

  const puedeAutoDetectar = !['fci', 'otro'].includes(form.tipo)
    && form.simbolo?.trim().length >= 1
    && form.fecha_compra?.length === 10

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
        nombre:        info.nombre || f.nombre,
        simbolo:       info.simboloFinal || f.simbolo,
        precio_compra: info.precio != null ? Number(info.precio).toFixed(info.precio < 1 ? 6 : 2) : f.precio_compra,
        moneda_compra: info.moneda === 'ARS' ? 'ARS' : 'USD',
      }))
    } catch (err) {
      setErrorDeteccion(err.message || 'No se pudo obtener el precio.')
    } finally {
      setDetectando(false)
    }
  }, [])

  useEffect(() => {
    if (!puedeAutoDetectar) { setInfoDetectada(null); setErrorDeteccion(null); return }
    const timer = setTimeout(() => detectar(form.simbolo, form.tipo, form.fecha_compra), 700)
    return () => clearTimeout(timer)
  }, [form.simbolo, form.fecha_compra, form.tipo, puedeAutoDetectar, detectar])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.nombre.trim()) { setError('Completá el nombre del activo.'); return }
    if (!form.cantidad || parseFloat(form.cantidad) <= 0) { setError('La cantidad debe ser mayor a 0.'); return }
    if (!form.precio_compra || parseFloat(form.precio_compra) <= 0) { setError('El precio de compra debe ser mayor a 0.'); return }
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

  const badge = (() => {
    if (detectando) return { tipo: 'cargando', texto: 'Buscando en los mercados…' }
    if (infoDetectada) {
      const p = fmtPrecioDetectado(infoDetectada.precio, infoDetectada.moneda)
      const f = infoDetectada.actualDate
        ? new Date(infoDetectada.actualDate + 'T12:00:00').toLocaleDateString('es-AR', { day: 'numeric', month: 'short', year: 'numeric' })
        : null
      const n = infoDetectada.nombre?.length > 28 ? infoDetectada.nombre.slice(0, 26) + '…' : infoDetectada.nombre
      return { tipo: 'exito', texto: `${n} · ${p}${f ? ` (${f})` : ''}` }
    }
    if (errorDeteccion) return { tipo: 'error', texto: errorDeteccion }
    return null
  })()

  return (
    /* FIX: overflow-x-hidden para evitar scroll horizontal en el modal */
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 overflow-x-hidden">

      {/* Tipo de activo — grid de 3 columnas en mobile para evitar overflow */}
      <div>
        <label className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 mb-2 block tracking-wide">
          Tipo de activo
        </label>
        <div className="grid grid-cols-3 sm:grid-cols-5 gap-1.5">
          {Object.entries(TIPOS).map(([key, meta]) => (
            <button
              key={key}
              type="button"
              onClick={() => handleTipo(key)}
              className={`flex flex-col items-center gap-1 p-2 rounded-xl border-2 transition-all text-center ${
                form.tipo === key
                  ? 'border-[var(--mango)] bg-[var(--mango)]/8 dark:bg-[var(--mango)]/6'
                  : 'border-zinc-100 dark:border-zinc-700/60 hover:border-zinc-200'
              }`}
            >
              <span className="text-lg">{meta.icono}</span>
              <span className="text-[9px] font-bold text-zinc-500 dark:text-zinc-400 leading-tight">{meta.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Símbolo + Fecha */}
      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 tracking-wide">
            Símbolo / Ticker
          </label>
          <div className="relative">
            <input
              value={form.simbolo}
              onChange={set('simbolo')}
              placeholder={form.tipo === 'cedear' ? 'AAPL…' : form.tipo === 'crypto' ? 'BTC…' : form.tipo === 'accion' ? 'SPY…' : '—'}
              disabled={['fci', 'otro'].includes(form.tipo)}
              className="w-full bg-zinc-50/80 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700/60
                rounded-xl px-3.5 py-2.5 text-sm uppercase font-bold font-mono tracking-wide
                focus:outline-none focus:ring-2 focus:ring-[var(--mango)]/30 focus:border-[var(--mango)]/60
                transition-all text-zinc-900 dark:text-white placeholder:normal-case placeholder:font-normal
                placeholder:font-sans disabled:opacity-50 disabled:cursor-not-allowed"
            />
            {detectando && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                <Spinner size={14} />
              </div>
            )}
          </div>
          <p className="text-[10px] text-zinc-400 leading-tight">{tipoMeta.hint}</p>
        </div>

        <Input
          label="Fecha de compra"
          type="date"
          value={form.fecha_compra}
          onChange={set('fecha_compra')}
          required
        />
      </div>

      {/* Badge de detección */}
      {badge && (
        <div className={`flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs font-medium transition-all ${
          badge.tipo === 'cargando' ? 'bg-zinc-50 dark:bg-zinc-800/50 text-zinc-500 border border-zinc-200 dark:border-zinc-700'
          : badge.tipo === 'exito'  ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/50'
          : badge.tipo === 'error'  ? 'bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800/50'
          : 'bg-zinc-50 dark:bg-zinc-800/50 text-zinc-400 border border-zinc-200 dark:border-zinc-700'
        }`}>
          <span className="flex-shrink-0 leading-none">
            {badge.tipo === 'cargando' ? <Spinner size={13} /> : badge.tipo === 'exito' ? '✅' : badge.tipo === 'error' ? '⚠️' : '💡'}
          </span>
          <span className="leading-snug flex-1 min-w-0 truncate">{badge.texto}</span>
          {badge.tipo === 'error' && form.simbolo && form.fecha_compra && (
            <button type="button" onClick={() => detectar(form.simbolo, form.tipo, form.fecha_compra)}
              className="ml-auto text-[10px] underline opacity-70 hover:opacity-100 flex-shrink-0">
              Reintentar
            </button>
          )}
        </div>
      )}

      {/* Selector rápido cripto — 5 cols con min-w-0 */}
      {form.tipo === 'crypto' && (
        <div>
          <label className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 mb-2 block tracking-wide">
            Criptos populares
          </label>
          <div className="grid grid-cols-5 gap-1">
            {CRYPTOS_POPULARES.map(c => (
              <button
                key={c.simbolo}
                type="button"
                onClick={() => handleCryptoSelect(c)}
                className={`flex flex-col items-center gap-1 p-1.5 rounded-xl border transition-all min-w-0 ${
                  form.simbolo === c.simbolo
                    ? 'border-amber-400 bg-amber-50 dark:bg-amber-900/20'
                    : 'border-zinc-100 dark:border-zinc-800 hover:border-zinc-300'
                }`}
              >
                <span className="text-sm font-mono font-bold">{c.icono}</span>
                <span className="text-[8px] font-bold text-zinc-500 truncate w-full text-center">{c.simbolo}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Nombre */}
      <div className="flex flex-col gap-1.5">
        <div className="flex items-center justify-between">
          <label className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 tracking-wide">
            Nombre del activo
          </label>
          {infoDetectada?.nombre && form.nombre === infoDetectada.nombre && (
            <span className="text-[9px] text-emerald-600 dark:text-emerald-400 font-semibold
              bg-emerald-50 dark:bg-emerald-900/20 px-1.5 py-0.5 rounded-full">
              Detectado
            </span>
          )}
        </div>
        <input
          value={form.nombre}
          onChange={set('nombre')}
          placeholder="Se completa automáticamente"
          required
          className="w-full bg-zinc-50/80 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700/60
            rounded-xl px-3.5 py-2.5 text-sm font-medium
            focus:outline-none focus:ring-2 focus:ring-[var(--mango)]/30 focus:border-[var(--mango)]/60
            transition-all text-zinc-900 dark:text-white placeholder:text-zinc-400"
        />
      </div>

      {/* Icono (solo FCI/otro) */}
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
          placeholder="0"
          value={form.cantidad}
          onChange={set('cantidad')}
          required
        />

        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 tracking-wide">
              Precio de compra
            </label>
            {infoDetectada?.moneda && (
              <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${
                infoDetectada.moneda === 'ARS'
                  ? 'text-blue-600 bg-blue-50 dark:bg-blue-900/20'
                  : 'text-green-600 bg-green-50 dark:bg-green-900/20'
              }`}>
                {infoDetectada.moneda === 'ARS' ? '🇦🇷 ARS' : '🇺🇸 USD'}
              </span>
            )}
          </div>
          <div className="flex gap-1.5">
            <select
              value={form.moneda_compra}
              onChange={set('moneda_compra')}
              className="field-base field-select !w-[90px]"
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
              placeholder={detectando ? '…' : '0.00'}
              value={form.precio_compra}
              onChange={set('precio_compra')}
              required
              className="flex-1 min-w-0 bg-zinc-50/80 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700/60
                rounded-xl px-3 py-2.5 text-sm font-medium
                focus:outline-none focus:ring-2 focus:ring-[var(--mango)]/30
                text-zinc-900 dark:text-white placeholder:text-zinc-400"
            />
          </div>
          <p className="text-[10px] text-zinc-400">
            {infoDetectada?.isHistorical ? 'Precio de cierre · podés editarlo' : 'Se detecta por fecha'}
          </p>
        </div>
      </div>

      {/* Notas */}
      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 tracking-wide">
          Notas (opcional)
        </label>
        <input
          value={form.notas}
          onChange={set('notas')}
          placeholder="Ej: Compra promediada, dividendos reinvertidos…"
          className="w-full bg-zinc-50/80 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700/60
            rounded-xl px-3.5 py-2.5 text-sm font-medium
            focus:outline-none focus:ring-2 focus:ring-[var(--mango)]/30
            text-zinc-900 dark:text-white placeholder:text-zinc-400"
        />
      </div>

      {/* Error */}
      {error && (
        <p className="text-xs text-red-500 bg-red-50 dark:bg-red-900/20 rounded-xl px-3 py-2
          border border-red-100 dark:border-red-900 font-medium">
          {error}
        </p>
      )}

      {/* Acciones */}
      <div className="flex gap-3 mt-1">
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