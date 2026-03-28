// src/pages/Suscripciones/Catalogo.jsx
// Catálogo de suscripciones con precios por método de pago.
// La comunidad puede actualizar los precios.

import { useState, useEffect, useMemo, useCallback } from 'react'
import { supabase } from '../../lib/supabase'
import {
  CATALOGO_SUSCRIPCIONES,
  CATEGORIAS_CATALOGO,
  METODOS_PAGO,
} from '../../data/catalogo-suscripciones'

// ── Helpers ──────────────────────────────────────────────────
const fmtPrecio = (n, moneda) => {
  if (n == null) return null
  if (moneda === 'USD') {
    return `U$D ${Number(n).toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
  }
  return `$${Number(n).toLocaleString('es-AR', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`
}

// ── Hook para cargar precios comunitarios ─────────────────────
function usePreciosComunitarios() {
  const [precios, setPrecios] = useState({})
  const [cargando, setCargando] = useState(true)

  useEffect(() => {
    let mounted = true
    supabase
      .from('catalogo_precios_billetera')
      .select('*')
      .then(({ data }) => {
        if (!mounted || !data) return
        // Convertir a mapa { servicio_id: { metodo: precio } }
        const mapa = {}
        data.forEach(r => {
          if (!mapa[r.servicio_id]) mapa[r.servicio_id] = {}
          mapa[r.servicio_id][r.metodo_pago] = r.precio
        })
        setPrecios(mapa)
        setCargando(false)
      })
      .catch(() => setCargando(false))

    return () => { mounted = false }
  }, [])

  const actualizarPrecio = useCallback(async (servicioId, metodoPago, nuevoPrecio, moneda) => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { error } = await supabase
      .from('catalogo_precios_billetera')
      .upsert({
        servicio_id: servicioId,
        metodo_pago: metodoPago,
        precio: Number(nuevoPrecio),
        moneda,
        votos_ok: 1,
        votos_desactual: 0,
        updated_by: user.id,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'servicio_id,metodo_pago' })

    if (!error) {
      setPrecios(prev => ({
        ...prev,
        [servicioId]: { ...(prev[servicioId] || {}), [metodoPago]: Number(nuevoPrecio) }
      }))
    }
  }, [])

  return { precios, cargando, actualizarPrecio }
}

// ── Modal de actualización de precio ─────────────────────────
function ModalActualizarPrecio({ servicio, metodo, precioActual, onGuardar, onCerrar }) {
  const [nuevo, setNuevo] = useState(precioActual?.toString() || '')
  const metaMet = METODOS_PAGO.find(m => m.id === metodo)

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onCerrar}>
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
      <div
        className="relative w-full max-w-sm bg-white dark:bg-zinc-900 rounded-2xl p-6
          border border-zinc-200 dark:border-zinc-800 shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        <h3 className="font-bold text-zinc-900 dark:text-white mb-1 text-base">
          Actualizar precio
        </h3>
        <p className="text-sm text-zinc-400 mb-4">
          {servicio.nombre} {servicio.plan} · {metaMet?.emoji} {metaMet?.label}
        </p>

        <div className="flex flex-col gap-3">
          <div className="flex flex-col gap-1">
            <label className="text-xs text-zinc-400 font-medium">
              Nuevo precio ({metaMet?.moneda})
            </label>
            <input
              type="number"
              value={nuevo}
              onChange={e => setNuevo(e.target.value)}
              placeholder={metaMet?.moneda === 'USD' ? 'Ej: 15.49' : 'Ej: 7199'}
              autoFocus
              step={metaMet?.moneda === 'USD' ? '0.01' : '1'}
              className="w-full bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700
                rounded-xl px-3 py-2.5 text-sm text-zinc-900 dark:text-white
                focus:outline-none focus:ring-2 focus:ring-[var(--mango)]/40"
            />
          </div>
          <p className="text-[10px] text-zinc-400">
            🙌 Tu actualización ayuda a toda la comunidad. ¡Gracias!
          </p>
          <div className="flex gap-3 mt-1">
            <button
              onClick={onCerrar}
              className="flex-1 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700
                text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={() => {
                if (nuevo && !isNaN(nuevo) && Number(nuevo) > 0) {
                  onGuardar(parseFloat(nuevo))
                  onCerrar()
                }
              }}
              className="flex-1 py-2.5 rounded-xl text-sm font-bold
                bg-gradient-to-r from-[var(--mango)] to-[var(--mango-dark)]
                text-[var(--charcoal)] transition-all hover:opacity-90"
            >
              Guardar
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Tabla de precios por método de pago ───────────────────────
function TablaPreciosMetodos({ servicio, preciosComunitarios, onActualizar }) {
  const metodosDisponibles = METODOS_PAGO.filter(m => {
    const precioBase = servicio.precios[m.id]
    const precioCom = preciosComunitarios?.[m.id]
    return precioBase !== undefined || precioCom !== undefined
  })

  return (
    <div className="mt-3 pt-3 border-t border-zinc-100 dark:border-zinc-800">
      <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-2">
        Precio por método de pago
      </p>
      <div className="flex flex-col gap-1.5">
        {metodosDisponibles.map(m => {
          const precioBase = servicio.precios[m.id]
          const precioCom = preciosComunitarios?.[m.id]
          const precio = precioCom ?? precioBase
          const esComunidad = precioCom != null && precioCom !== precioBase

          if (precio == null) return null

          return (
            <div
              key={m.id}
              className="flex items-center justify-between group"
            >
              <div className="flex items-center gap-2">
                <span className="text-base w-6 text-center">{m.emoji}</span>
                <span className="text-xs text-zinc-500 dark:text-zinc-400">{m.label}</span>
                {esComunidad && (
                  <span className="text-[9px] bg-emerald-100 dark:bg-emerald-900/20 text-emerald-600
                    px-1 py-0.5 rounded font-semibold">
                    👥 comunidad
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-zinc-800 dark:text-zinc-100">
                  {fmtPrecio(precio, m.moneda)}
                </span>
                <button
                  onClick={e => { e.stopPropagation(); onActualizar(m.id, precio, m.moneda) }}
                  title="Actualizar precio"
                  className="opacity-0 group-hover:opacity-100 transition-opacity
                    text-[10px] w-5 h-5 rounded text-zinc-400 hover:text-zinc-700
                    bg-white dark:bg-zinc-700 border border-zinc-200 dark:border-zinc-600
                    flex items-center justify-center flex-shrink-0"
                >
                  ✏️
                </button>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ── Tarjeta de servicio del catálogo ─────────────────────────
function TarjetaServicio({ servicio, preciosComunitarios, onAgregar, metodoPagoFiltro }) {
  const [expandido, setExpandido] = useState(false)
  const [modalPrecio, setModalPrecio] = useState(null) // { metodo, precio, moneda }

  const { actualizarPrecio } = usePreciosComunitarios()

  // Precio del método seleccionado (si hay filtro)
  const precioDestacado = useMemo(() => {
    if (!metodoPagoFiltro) return null
    const metaM = METODOS_PAGO.find(m => m.id === metodoPagoFiltro)
    const precioCom = preciosComunitarios?.[metodoPagoFiltro]
    const precioBase = servicio.precios[metodoPagoFiltro]
    const precio = precioCom ?? precioBase
    if (precio == null) return null
    return { precio, moneda: metaM?.moneda, metodo: metaM }
  }, [metodoPagoFiltro, preciosComunitarios, servicio.precios])

  return (
    <>
      <div
        className="flex flex-col bg-white dark:bg-zinc-900
          border border-zinc-100 dark:border-zinc-800 rounded-2xl overflow-hidden
          hover:border-zinc-200 dark:hover:border-zinc-700 hover:shadow-md
          transition-all group"
      >
        {/* Header */}
        <div
          className="flex items-center gap-3 p-4 cursor-pointer"
          onClick={() => setExpandido(e => !e)}
        >
          <div
            className="w-11 h-11 rounded-xl flex items-center justify-center text-2xl flex-shrink-0"
            style={{ background: servicio.color + '18' }}
          >
            {servicio.icono}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-bold text-sm text-zinc-900 dark:text-white leading-tight">
              {servicio.nombre}
            </p>
            <p className="text-xs text-zinc-400 mt-0.5">{servicio.plan}</p>
          </div>

          {/* Precio destacado o precio más bajo */}
          <div className="text-right flex-shrink-0">
            {precioDestacado ? (
              <p className="text-sm font-bold" style={{ color: servicio.color }}>
                {fmtPrecio(precioDestacado.precio, precioDestacado.moneda)}
              </p>
            ) : (
              (() => {
                // Precio más bajo disponible
                const precios = METODOS_PAGO
                  .map(m => {
                    const pc = preciosComunitarios?.[m.id]
                    const pb = servicio.precios[m.id]
                    const p = pc ?? pb
                    return p != null ? { precio: p, moneda: m.moneda, metodo: m } : null
                  })
                  .filter(Boolean)

                if (precios.length === 0) return <span className="text-xs text-zinc-400">Sin precio</span>

                const min = precios.reduce((a, b) => {
                  // Comparar en USD aproximado
                  const toUSD = (p) => p.moneda === 'USD' ? p.precio : p.precio / 1300
                  return toUSD(a) < toUSD(b) ? a : b
                })

                return (
                  <div>
                    <p className="text-sm font-bold" style={{ color: servicio.color }}>
                      {fmtPrecio(min.precio, min.moneda)}
                    </p>
                    <p className="text-[9px] text-zinc-400">desde</p>
                  </div>
                )
              })()
            )}
            <span className="text-[10px] text-zinc-400 mt-0.5 block">
              {expandido ? '▲' : '▼'}
            </span>
          </div>
        </div>

        {/* Expandido: tabla de precios */}
        {expandido && (
          <div className="px-4 pb-4">
            <p className="text-xs text-zinc-400 mb-2 leading-relaxed">{servicio.descripcion}</p>

            <TablaPreciosMetodos
              servicio={servicio}
              preciosComunitarios={preciosComunitarios}
              onActualizar={(metodo, precio, moneda) => setModalPrecio({ metodo, precio, moneda })}
            />

            <button
              onClick={() => onAgregar(servicio, preciosComunitarios)}
              className="w-full mt-4 py-2.5 rounded-xl text-sm font-bold
                bg-gradient-to-r from-[var(--mango)] to-[var(--mango-dark)]
                text-[var(--charcoal)] hover:opacity-90 active:scale-[0.98] transition-all"
            >
              + Agregar a mis suscripciones
            </button>
          </div>
        )}
      </div>

      {/* Modal actualización precio */}
      {modalPrecio && (
        <ModalActualizarPrecio
          servicio={servicio}
          metodo={modalPrecio.metodo}
          precioActual={modalPrecio.precio}
          onGuardar={(precio) => actualizarPrecio(servicio.id, modalPrecio.metodo, precio, modalPrecio.moneda)}
          onCerrar={() => setModalPrecio(null)}
        />
      )}
    </>
  )
}

// ── Modal para elegir método de pago al agregar ───────────────
function ModalElegirMetodo({ servicio, preciosComunitarios, onConfirmar, onCerrar }) {
  const [metodoPago, setMetodoPago] = useState('ars_mp')

  const metodosDisponibles = METODOS_PAGO.filter(m => {
    const precioCom = preciosComunitarios?.[m.id]
    const precioBase = servicio.precios[m.id]
    return (precioCom ?? precioBase) != null
  })

  const metaSeleccionado = METODOS_PAGO.find(m => m.id === metodoPago)
  const precioCom = preciosComunitarios?.[metodoPago]
  const precioBase = servicio.precios[metodoPago]
  const precioFinal = precioCom ?? precioBase

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onCerrar}>
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
      <div
        className="relative w-full max-w-sm bg-white dark:bg-zinc-900 rounded-2xl p-6
          border border-zinc-200 dark:border-zinc-800 shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl"
            style={{ background: servicio.color + '18' }}>
            {servicio.icono}
          </div>
          <div>
            <p className="font-bold text-zinc-900 dark:text-white">{servicio.nombre}</p>
            <p className="text-xs text-zinc-400">{servicio.plan}</p>
          </div>
        </div>

        <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-3">
          ¿Con qué método lo pagás?
        </p>

        <div className="flex flex-col gap-2 mb-4">
          {metodosDisponibles.map(m => {
            const pc = preciosComunitarios?.[m.id]
            const pb = servicio.precios[m.id]
            const precio = pc ?? pb
            return (
              <label
                key={m.id}
                className={`flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all ${
                  metodoPago === m.id
                    ? 'border-[var(--mango)] bg-[var(--mango)]/8'
                    : 'border-zinc-100 dark:border-zinc-800 hover:border-zinc-200'
                }`}
              >
                <input
                  type="radio"
                  name="metodo"
                  value={m.id}
                  checked={metodoPago === m.id}
                  onChange={() => setMetodoPago(m.id)}
                  className="accent-amber-400"
                />
                <span className="text-xl">{m.emoji}</span>
                <div className="flex-1">
                  <p className="text-sm font-medium text-zinc-800 dark:text-zinc-100">{m.label}</p>
                  <p className="text-xs text-zinc-400">
                    {precio != null ? fmtPrecio(precio, m.moneda) : '—'}
                    {pc != null && pc !== pb ? ' (comunitario)' : ''}
                  </p>
                </div>
              </label>
            )
          })}
        </div>

        <div className="flex gap-3">
          <button
            onClick={onCerrar}
            className="flex-1 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700
              text-sm font-medium text-zinc-600 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={() => onConfirmar(servicio, metodoPago, precioFinal, metaSeleccionado?.moneda)}
            className="flex-1 py-2.5 rounded-xl text-sm font-bold
              bg-gradient-to-r from-[var(--mango)] to-[var(--mango-dark)]
              text-[var(--charcoal)] hover:opacity-90 transition-all"
          >
            Agregar
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Componente principal del catálogo ─────────────────────────
export function CatalogoSuscripciones({ onAgregarSuscripcion }) {
  const [categoriaActiva, setCategoriaActiva] = useState('todos')
  const [busqueda, setBusqueda]               = useState('')
  const [metodoPagoFiltro, setMetodoPagoFiltro] = useState('')
  const [modalAgregar, setModalAgregar]       = useState(null) // { servicio, precios }

  const { precios: preciosComunitarios, actualizarPrecio } = usePreciosComunitarios()

  const serviciosFiltrados = useMemo(() => {
    return CATALOGO_SUSCRIPCIONES.filter(s => {
      const matchCat = categoriaActiva === 'todos' || s.categoria === categoriaActiva
      const matchBusq = !busqueda ||
        s.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
        s.plan.toLowerCase().includes(busqueda.toLowerCase())
      const matchMetodo = !metodoPagoFiltro || (() => {
        const pc = preciosComunitarios[s.id]?.[metodoPagoFiltro]
        const pb = s.precios[metodoPagoFiltro]
        return (pc ?? pb) != null
      })()
      return matchCat && matchBusq && matchMetodo
    })
  }, [categoriaActiva, busqueda, metodoPagoFiltro, preciosComunitarios])

  const handleConfirmarAgregar = (servicio, metodoPago, precio, moneda) => {
    const metaMet = METODOS_PAGO.find(m => m.id === metodoPago)

    // Preparar datos para el hook de suscripciones
    onAgregarSuscripcion({
      nombre:    servicio.nombre,
      plan:      servicio.plan,
      monto:     precio,
      moneda:    moneda || 'ARS',
      icono:     servicio.icono,
      color:     servicio.color,
      ciclo:     servicio.ciclo,
      categoria: servicio.categoria,
      url:       servicio.url,
      notas:     `Método: ${metaMet?.label}`,
      activa:    true,
    })

    setModalAgregar(null)
  }

  return (
    <>
      <div className="flex flex-col gap-4">
        {/* Buscador */}
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400">🔍</span>
          <input
            type="text"
            value={busqueda}
            onChange={e => setBusqueda(e.target.value)}
            placeholder="Buscar Netflix, Spotify..."
            className="w-full bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700
              rounded-xl pl-9 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--mango)]/40
              text-zinc-900 dark:text-white placeholder:text-zinc-400"
          />
        </div>

        {/* Filtro por método de pago */}
        <div>
          <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 mb-2">
            Ver precios para
          </p>
          <div className="flex gap-1.5 flex-wrap">
            <button
              onClick={() => setMetodoPagoFiltro('')}
              className={`px-2.5 py-1.5 rounded-xl text-xs font-semibold border-2 transition-all ${
                !metodoPagoFiltro
                  ? 'border-[var(--mango)] bg-[var(--mango)]/8 text-[var(--mango-dark)] dark:text-[var(--mango)]'
                  : 'border-zinc-100 dark:border-zinc-800 text-zinc-500 hover:border-zinc-200'
              }`}
            >
              🌐 Todos
            </button>
            {METODOS_PAGO.map(m => (
              <button
                key={m.id}
                onClick={() => setMetodoPagoFiltro(prev => prev === m.id ? '' : m.id)}
                className={`px-2.5 py-1.5 rounded-xl text-xs font-semibold border-2 transition-all ${
                  metodoPagoFiltro === m.id
                    ? 'border-[var(--mango)] bg-[var(--mango)]/8 text-[var(--mango-dark)] dark:text-[var(--mango)]'
                    : 'border-zinc-100 dark:border-zinc-800 text-zinc-500 hover:border-zinc-200'
                }`}
              >
                {m.emoji} {m.label}
              </button>
            ))}
          </div>
        </div>

        {/* Categorías */}
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
          {CATEGORIAS_CATALOGO.map(cat => (
            <button
              key={cat.id}
              onClick={() => setCategoriaActiva(cat.id)}
              className={`flex-shrink-0 px-3 py-1.5 rounded-xl text-xs font-semibold border-2 transition-all whitespace-nowrap ${
                categoriaActiva === cat.id
                  ? 'border-[var(--mango)] bg-[var(--mango)]/8 text-[var(--mango-dark)] dark:text-[var(--mango)]'
                  : 'border-zinc-100 dark:border-zinc-800 text-zinc-500 hover:border-zinc-200'
              }`}
            >
              {cat.emoji} {cat.label}
            </button>
          ))}
        </div>

        {/* Info de comunidad */}
        <div className="bg-blue-50 dark:bg-blue-900/15 border border-blue-200 dark:border-blue-800/40
          rounded-2xl px-3 py-2.5 text-xs text-blue-700 dark:text-blue-300">
          <span className="font-semibold">💡 Precios comunitarios:</span> Pasá el mouse sobre cualquier precio
          y tocá ✏️ para actualizarlo. Todos los usuarios se benefician de tu corrección.
        </div>

        {/* Grid de servicios */}
        {serviciosFiltrados.length === 0 ? (
          <div className="text-center py-8 text-zinc-400 text-sm">
            No se encontraron servicios para esa búsqueda.
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3">
            {serviciosFiltrados.map(s => (
              <TarjetaServicio
                key={s.id}
                servicio={s}
                preciosComunitarios={preciosComunitarios[s.id]}
                metodoPagoFiltro={metodoPagoFiltro}
                onAgregar={(servicio, precios) => setModalAgregar({ servicio, precios })}
              />
            ))}
          </div>
        )}
      </div>

      {/* Modal elegir método al agregar */}
      {modalAgregar && (
        <ModalElegirMetodo
          servicio={modalAgregar.servicio}
          preciosComunitarios={preciosComunitarios[modalAgregar.servicio.id]}
          onConfirmar={handleConfirmarAgregar}
          onCerrar={() => setModalAgregar(null)}
        />
      )}
    </>
  )
}