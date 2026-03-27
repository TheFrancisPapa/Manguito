// ──────────────────────────────────────────────────────────────
//  FormInversion — con auto-detección de nombre y precio
//  Reemplazá la función FormInversion en src/pages/Inversiones/index.jsx
//  por este componente completo.
//
//  También agregá este import al inicio del archivo:
//    import { fetchSymbolInfoConFecha } from '../../api/inversiones'
// ──────────────────────────────────────────────────────────────
import { useState, useEffect, useCallback } from 'react'
import { Button, Input, Spinner } from '../../components/ui'
import { CRYPTOS_POPULARES, fetchSymbolInfoConFecha } from '../../api/inversiones'

// ── Tipos de activo con metadatos ───────────────────────────
const TIPOS = {
  accion:  { label: 'Acción',  icono: '📈', color: '#3B82F6', hint: 'Ej: AAPL, SPY, TSLA' },
  cedear:  { label: 'CEDEAR',  icono: '🇦🇷', color: '#8B5CF6', hint: 'Ej: AAPL → se busca AAPL.BA' },
  crypto:  { label: 'Cripto',  icono: '₿',  color: '#F59E0B', hint: 'Seleccioná o escribí el símbolo' },
  fci:     { label: 'FCI',     icono: '🏦', color: '#10B981', hint: 'Ingresá el nombre del fondo' },
  otro:    { label: 'Otro',    icono: '💼', color: '#6B7280', hint: 'Inmueble, oro, plazo fijo, etc.' },
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

// Formateador de precio para el badge de detección
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

  // ── Estado de auto-detección ──────────────────────────────
  const [detectando,     setDetectando]     = useState(false)
  const [infoDetectada,  setInfoDetectada]  = useState(null)
  const [errorDeteccion, setErrorDeteccion] = useState(null)

  const set = (k) => (e) => {
    const val = e.target?.value ?? e
    setForm(f => ({ ...f, [k]: val }))
    setError(null)
  }

  // Cuando cambia el tipo, limpiamos símbolo/nombre y la info detectada
  const handleTipo = (tipo) => {
    const icono = TIPOS[tipo]?.icono ?? '📈'
    setForm(f => ({ ...f, tipo, simbolo: '', nombre: '', icono, precio_compra: '', moneda_compra: 'USD' }))
    setInfoDetectada(null)
    setErrorDeteccion(null)
  }

  // Para el selector rápido de cripto
  const handleCryptoSelect = (cripto) => {
    setForm(f => ({
      ...f,
      simbolo:       cripto.simbolo,
      nombre:        cripto.nombre,
      icono:         cripto.icono,
      moneda_compra: 'USD',
    }))
    setInfoDetectada(null)
    setErrorDeteccion(null)
  }

  // ── Auto-detección con debounce ───────────────────────────
  // Se dispara cuando cambia el símbolo, la fecha, o el tipo
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

      // Auto-rellenar campos con la info detectada
      setForm(f => ({
        ...f,
        nombre:        info.nombre                              || f.nombre,
        simbolo:       info.simboloFinal                        || f.simbolo,
        precio_compra: info.precio != null
          ? Number(info.precio).toFixed(info.precio < 1 ? 6 : 2)
          : f.precio_compra,
        moneda_compra: info.moneda === 'ARS' ? 'ARS' : 'USD',
      }))
    } catch (err) {
      setErrorDeteccion(err.message || 'No se pudo obtener el precio automáticamente.')
    } finally {
      setDetectando(false)
    }
  }, [])

  useEffect(() => {
    if (!puedeAutoDetectar) {
      setInfoDetectada(null)
      setErrorDeteccion(null)
      return
    }

    const timer = setTimeout(() => {
      detectar(form.simbolo, form.tipo, form.fecha_compra)
    }, 700)

    return () => clearTimeout(timer)
  }, [form.simbolo, form.fecha_compra, form.tipo, puedeAutoDetectar, detectar])

  // ── Submit ────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!form.nombre.trim()) {
      setError('Completá el nombre del activo.')
      return
    }
    if (!form.cantidad || parseFloat(form.cantidad) <= 0) {
      setError('La cantidad debe ser mayor a 0.')
      return
    }
    if (!form.precio_compra || parseFloat(form.precio_compra) <= 0) {
      setError('El precio de compra debe ser mayor a 0.')
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

  // ── Texto del badge de estado ─────────────────────────────
  const badgeContenido = (() => {
    if (detectando) return { tipo: 'cargando', texto: 'Buscando en los mercados…' }

    if (infoDetectada) {
      const precioStr  = fmtPrecioDetectado(infoDetectada.precio, infoDetectada.moneda)
      const fechaReal  = infoDetectada.actualDate
        ? new Date(infoDetectada.actualDate + 'T12:00:00').toLocaleDateString('es-AR', { day: 'numeric', month: 'short', year: 'numeric' })
        : null
      const nombreCorto = infoDetectada.nombre?.length > 28
        ? infoDetectada.nombre.slice(0, 26) + '…'
        : infoDetectada.nombre

      return {
        tipo:  'exito',
        texto: `${nombreCorto} · ${precioStr}${fechaReal ? ` (${fechaReal})` : ''}`,
      }
    }

    if (errorDeteccion) {
      return { tipo: 'error', texto: errorDeteccion }
    }

    if (form.simbolo?.trim().length > 0 && !form.fecha_compra) {
      return { tipo: 'hint', texto: 'Completá la fecha de compra para detectar el precio.' }
    }

    return null
  })()

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 max-h-[75vh] overflow-y-auto overflow-x-hidden pr-1">

      {/* ── 1. Tipo de activo ── */}
      <div>
        <label className="text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-2 block">
          Tipo de activo
        </label>
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

      {/* ── 2. Símbolo (ticker) y fecha — en la misma fila ── */}
      <div className="grid grid-cols-2 gap-3">
        {/* Símbolo */}
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
            Símbolo / Ticker
          </label>
          <div className="relative flex items-center">
            <input
              value={form.simbolo}
              onChange={set('simbolo')}
              placeholder={
                form.tipo === 'cedear'  ? 'AAPL, GOOGL…'  :
                form.tipo === 'crypto'  ? 'BTC, ETH…'     :
                form.tipo === 'accion'  ? 'SPY, AAPL…'    :
                form.tipo === 'fci'     ? 'Sin ticker'     : '—'
              }
              disabled={['fci', 'otro'].includes(form.tipo)}
              className="w-full bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700
                rounded-xl px-3 py-2.5 text-sm uppercase font-mono font-bold tracking-wide
                focus:outline-none focus:ring-2 focus:ring-[var(--mango)]/40
                text-zinc-900 dark:text-white placeholder:text-zinc-400 placeholder:font-normal
                disabled:opacity-50 disabled:cursor-not-allowed"
            />
            {/* Spinner de detección dentro del campo */}
            {detectando && (
              <div className="absolute right-3">
                <Spinner size={14} />
              </div>
            )}
          </div>
          {/* Hint del tipo */}
          <p className="text-[10px] text-zinc-400 px-1 leading-tight">{tipoMeta.hint}</p>
        </div>

        {/* Fecha de compra */}
        <Input
          label="Fecha de compra"
          type="date"
          value={form.fecha_compra}
          onChange={set('fecha_compra')}
          required
        />
      </div>

      {/* ── 3. Badge de estado de detección ── */}
      {badgeContenido && (
        <div className={`flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs font-medium transition-all ${
          badgeContenido.tipo === 'cargando'
            ? 'bg-zinc-50 dark:bg-zinc-800/50 text-zinc-500 border border-zinc-200 dark:border-zinc-700'
          : badgeContenido.tipo === 'exito'
            ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/50'
          : badgeContenido.tipo === 'error'
            ? 'bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800/50'
          : 'bg-zinc-50 dark:bg-zinc-800/50 text-zinc-400 border border-zinc-200 dark:border-zinc-700'
        }`}>
          <span className="flex-shrink-0 text-base leading-none">
            {badgeContenido.tipo === 'cargando' && <Spinner size={13} />}
            {badgeContenido.tipo === 'exito'    && '✅'}
            {badgeContenido.tipo === 'error'    && '⚠️'}
            {badgeContenido.tipo === 'hint'     && '💡'}
          </span>
          <span className="leading-snug">{badgeContenido.texto}</span>
          {/* Botón para reintentar si hubo error */}
          {badgeContenido.tipo === 'error' && form.simbolo && form.fecha_compra && (
            <button
              type="button"
              onClick={() => detectar(form.simbolo, form.tipo, form.fecha_compra)}
              className="ml-auto text-[10px] underline opacity-70 hover:opacity-100 flex-shrink-0"
            >
              Reintentar
            </button>
          )}
        </div>
      )}

      {/* ── 4. Selector rápido de cripto ── */}
      {form.tipo === 'crypto' && (
        <div>
          <label className="text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-2 block">
            Cripto popular
          </label>
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
          <p className="text-xs text-zinc-400 mt-1.5">
            ¿No está? Escribí el símbolo arriba (ej: <code className="bg-zinc-100 dark:bg-zinc-800 px-1 rounded">LINK</code>).
          </p>
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
          placeholder={
            form.tipo === 'accion'  ? 'Se completa automáticamente' :
            form.tipo === 'cedear'  ? 'Se completa automáticamente' :
            form.tipo === 'crypto'  ? 'Se completa automáticamente' :
            form.tipo === 'fci'     ? 'Ej: Fondo Allaria Ahorro'   : 'Nombre del activo'
          }
          required
          className="w-full bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700
            rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--mango)]/40
            text-zinc-900 dark:text-white placeholder:text-zinc-400"
        />
      </div>

      {/* ── 6. Emoji (solo FCI/otro) ── */}
      {(form.tipo === 'fci' || form.tipo === 'otro') && (
        <Input label="Emoji / Ícono" value={form.icono} onChange={set('icono')} maxLength={2} />
      )}

      {/* ── 7. Cantidad y precio ── */}
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

        {/* Precio con moneda auto-detectada */}
        <div className="flex flex-col gap-1">
          <div className="flex items-center justify-between">
            <label className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
              Precio de compra
            </label>
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
              value={form.moneda_compra}
              onChange={set('moneda_compra')}
              className="bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700
                rounded-xl px-2 text-xs text-zinc-700 dark:text-zinc-300 w-16
                focus:outline-none focus:ring-2 focus:ring-[var(--mango)]/40 cursor-pointer"
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
                value={form.precio_compra}
                onChange={set('precio_compra')}
                required
                className="w-full bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700
                  rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--mango)]/40
                  text-zinc-900 dark:text-white placeholder:text-zinc-400"
              />
              {/* Indicador de precio detectado dentro del campo */}
              {infoDetectada?.precio != null && form.precio_compra && (
                <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] text-emerald-500 font-bold pointer-events-none">
                  ✓
                </span>
              )}
            </div>
          </div>
          <p className="text-[10px] text-zinc-400 px-1">
            {infoDetectada?.isHistorical
              ? `Precio de cierre detectado · Podés editarlo`
              : 'Se detecta automáticamente por la fecha'}
          </p>
        </div>
      </div>

      {/* ── 8. Notas opcionales ── */}
      <div className="flex flex-col gap-1">
        <label className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
          Notas (opcional)
        </label>
        <input
          value={form.notas}
          onChange={set('notas')}
          placeholder="Ej: Compra promediada, dividendos reinvertidos…"
          className="w-full bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700
            rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--mango)]/40
            text-zinc-900 dark:text-white placeholder:text-zinc-400"
        />
      </div>

      {/* ── Error general ── */}
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
        <Button type="submit" className="flex-1" cargando={cargando}>
          Guardar
        </Button>
      </div>
    </form>
  )
}