// src/pages/Suscripciones/Catalogo.jsx
// Vista agrupada: una tarjeta por servicio → Modal con planes y precios.
// La comunidad puede actualizar precios desde el modal.

import { useState, useEffect, useMemo, useCallback } from 'react'
import { createPortal } from 'react-dom'
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

/** Dado un servicio, devuelve el precio más bajo en cualquier método de pago */
function precioMinimo(servicio, preciosComunitarios = {}) {
  let min = null
  let minMoneda = 'ARS'
  servicio.planes?.forEach(plan => {
    METODOS_PAGO.forEach(m => {
      const pc = preciosComunitarios[plan.id]?.[m.id]
      const pb = plan.precios?.[m.id]
      const precio = pc ?? pb
      if (precio == null) return
      // Comparar en USD aproximado para encontrar el mínimo real
      const enUSD = m.moneda === 'USD' ? precio : precio / 1300
      const minEnUSD = min != null ? (minMoneda === 'USD' ? min : min / 1300) : Infinity
      if (enUSD < minEnUSD) { min = precio; minMoneda = m.moneda }
    })
  })
  return min != null ? fmtPrecio(min, minMoneda) : null
}

// ── Hook para cargar precios comunitarios ─────────────────────
function usePreciosComunitarios() {
  const [precios, setPrecios] = useState({})   // { plan_id: { metodo: precio } }
  const [cargando, setCargando] = useState(true)

  useEffect(() => {
    let mounted = true
    supabase
      .from('catalogo_precios_billetera')
      .select('*')
      .then(({ data }) => {
        if (!mounted || !data) return
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

  const actualizarPrecio = useCallback(async (planId, metodoPago, nuevoPrecio, moneda) => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return false

    const { error } = await supabase
      .from('catalogo_precios_billetera')
      .upsert({
        servicio_id: planId,
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
        [planId]: { ...(prev[planId] || {}), [metodoPago]: Number(nuevoPrecio) },
      }))
      return true
    }
    return false
  }, [])

  return { precios, cargando, actualizarPrecio }
}

// ── Fila de precio editable ───────────────────────────────────
function FilaPrecio({ planId, metodo, precio, esComunidad, onEditar }) {
  const [editando, setEditando] = useState(false)
  const [valor, setValor]       = useState(precio?.toString() || '')
  const [guardando, setGuardando] = useState(false)

  const confirmar = async () => {
    if (!valor || isNaN(valor) || Number(valor) <= 0) return
    setGuardando(true)
    const ok = await onEditar(planId, metodo.id, valor, metodo.moneda)
    setGuardando(false)
    if (ok) setEditando(false)
  }

  if (editando) {
    return (
      <div className="flex items-center gap-2 py-2">
        <span className="text-base w-7 text-center flex-shrink-0">{metodo.emoji}</span>
        <span className="text-xs text-zinc-500 dark:text-zinc-400 flex-1 min-w-0 truncate">
          {metodo.label}
        </span>
        <input
          type="number"
          value={valor}
          onChange={e => setValor(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') confirmar(); if (e.key === 'Escape') setEditando(false) }}
          autoFocus
          step={metodo.moneda === 'USD' ? '0.01' : '1'}
          className="w-24 bg-zinc-50 dark:bg-zinc-800 border border-[var(--mango)]/60
            rounded-lg px-2 py-1 text-xs text-right font-bold text-zinc-900 dark:text-white
            focus:outline-none focus:ring-1 focus:ring-[var(--mango)]"
        />
        <button
          onClick={confirmar}
          disabled={guardando}
          className="px-2 py-1 rounded-lg bg-[var(--mango)] text-[var(--charcoal)]
            text-[10px] font-black hover:opacity-90 active:scale-95 transition-all"
        >
          {guardando ? '…' : '✓'}
        </button>
        <button
          onClick={() => { setEditando(false); setValor(precio?.toString() || '') }}
          className="px-2 py-1 rounded-lg bg-zinc-100 dark:bg-zinc-700
            text-zinc-500 text-[10px] font-bold hover:bg-zinc-200 transition-colors"
        >
          ✕
        </button>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-2 py-2 group/row">
      <span className="text-base w-7 text-center flex-shrink-0">{metodo.emoji}</span>
      <span className="text-xs text-zinc-500 dark:text-zinc-400 flex-1 min-w-0 truncate">
        {metodo.label}
      </span>
      {esComunidad && (
        <span className="text-[9px] bg-emerald-100 dark:bg-emerald-900/20 text-emerald-600
          px-1 py-0.5 rounded font-bold flex-shrink-0">
          👥
        </span>
      )}
      <div className="flex flex-col items-end justify-center flex-shrink-0">
        <span className="text-sm font-bold text-zinc-800 dark:text-zinc-100 leading-none">
          {fmtPrecio(precio, metodo.moneda)}
        </span>
        {metodo.moneda === 'ARS' && precio != null && (
          <span className="text-[10px] text-zinc-400 dark:text-zinc-500 font-medium mt-0.5">
            (~U$D {(precio / 1300).toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })})
          </span>
        )}
      </div>
      <button
        onClick={() => { setValor(precio?.toString() || ''); setEditando(true) }}
        title="Actualizar precio"
        className="opacity-0 group-hover/row:opacity-100 focus:opacity-100 transition-opacity
          w-6 h-6 rounded-md flex items-center justify-center text-[11px]
          bg-zinc-100 dark:bg-zinc-700 text-zinc-500 hover:text-zinc-800
          dark:hover:text-zinc-100 flex-shrink-0"
      >
        ✏️
      </button>
    </div>
  )
}

// ── Tarjeta de plan dentro del modal ─────────────────────────
function TarjetaPlan({ plan, preciosComunitarios, onAgregar, onEditarPrecio }) {
  const metodosConPrecio = METODOS_PAGO.filter(m => {
    const pc = preciosComunitarios?.[m.id]
    const pb = plan.precios?.[m.id]
    return (pc ?? pb) != null
  })

  const [metodoPagoSeleccionado, setMetodoPago] = useState(
    metodosConPrecio[0]?.id || 'ars_mp'
  )

  const metaM = METODOS_PAGO.find(m => m.id === metodoPagoSeleccionado)
  const precioCom = preciosComunitarios?.[metodoPagoSeleccionado]
  const precioBase = plan.precios?.[metodoPagoSeleccionado]
  const precioFinal = precioCom ?? precioBase

  return (
    <div className="rounded-2xl border border-zinc-100 dark:border-zinc-800
      bg-zinc-50/60 dark:bg-zinc-800/30 overflow-hidden">

      {/* Encabezado del plan */}
      <div className="px-4 pt-4 pb-3">
        <p className="font-bold text-sm text-zinc-900 dark:text-white leading-tight">
          {plan.nombre}
        </p>
        {plan.descripcion && (
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5 leading-relaxed">
            {plan.descripcion}
          </p>
        )}
      </div>

      {/* Precios por método */}
      <div className={`px-4 divide-y divide-zinc-100 dark:divide-zinc-800/60 ${metodosConPrecio.length > 0 ? 'pb-1' : 'pb-4'}`}>
        {metodosConPrecio.map(m => {
          const pc = preciosComunitarios?.[m.id]
          const pb = plan.precios?.[m.id]
          const precio = pc ?? pb
          // Prevent null/undefined from causing empty lines
          if (precio == null) return null;
          
          return (
            <FilaPrecio
              key={m.id}
              planId={plan.id}
              metodo={m}
              precio={precio}
              esComunidad={pc != null && pc !== pb}
              onEditar={onEditarPrecio}
            />
          )
        })}
      </div>

      {/* Selector de método + botón agregar */}
      {metodosConPrecio.length > 0 && (
        <div className="px-4 pb-4 pt-3 border-t border-zinc-100 dark:border-zinc-800/60">
          <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 mb-2">
            Agregar con
          </p>
          <div className="flex gap-1.5 flex-wrap mb-3">
            {metodosConPrecio.map(m => (
              <button
                key={m.id}
                onClick={() => setMetodoPago(m.id)}
                className={`px-2 py-1 rounded-lg text-[10px] font-bold border transition-all ${
                  metodoPagoSeleccionado === m.id
                    ? 'border-[var(--mango)] bg-[var(--mango)]/10 text-[var(--mango-dark)] dark:text-[var(--mango)]'
                    : 'border-zinc-200 dark:border-zinc-700 text-zinc-500 hover:border-zinc-300'
                }`}
              >
                {m.emoji} {m.label}
              </button>
            ))}
          </div>

          <button
            onClick={() => onAgregar(plan, metodoPagoSeleccionado, precioFinal, metaM?.moneda)}
            className="w-full py-2.5 rounded-xl text-sm font-bold
              bg-gradient-to-r from-[var(--mango)] to-[var(--mango-dark)]
              text-[var(--charcoal)] hover:opacity-90 active:scale-[0.98] transition-all
              flex items-center justify-center gap-2"
          >
            <span>+ Agregar a mis suscripciones</span>
            {precioFinal && (
              <span className="text-[11px] font-bold text-zinc-800/70 opacity-90 flex items-center">
                <span className="mx-1.5 opacity-50">•</span> 
                {fmtPrecio(precioFinal, metaM?.moneda)}
                {metaM?.moneda === 'ARS' && (
                  <span className="font-medium opacity-80 ml-1">
                    (~U$D {(precioFinal / 1300).toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })})
                  </span>
                )}
              </span>
            )}
          </button>
        </div>
      )}
    </div>
  )
}

// ── Modal de planes de un servicio ───────────────────────────
function ModalPlanes({ servicio, preciosComunitarios, onAgregar, onEditarPrecio, onCerrar }) {
  // Cerrar con Escape
  useEffect(() => {
    const fn = (e) => { if (e.key === 'Escape') onCerrar() }
    window.addEventListener('keydown', fn)
    return () => window.removeEventListener('keydown', fn)
  }, [onCerrar])

  // Bloquear scroll del body
  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = '' }
  }, [])

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-3 sm:p-4"
      onClick={onCerrar}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200" />

      {/* Panel */}
      <div
        className="relative w-full max-w-lg bg-white dark:bg-[var(--dark-card)]
          rounded-3xl shadow-2xl border border-zinc-100/80 dark:border-[var(--dark-border)]
          max-h-[90vh] flex flex-col
          animate-in slide-in-from-bottom-4 fade-in duration-300"
        onClick={e => e.stopPropagation()}
      >
        {/* Línea decorativa */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-14 h-1
          bg-gradient-to-r from-[var(--mango)] to-[var(--mango-dark)] rounded-full" />

        {/* Header */}
        <div className="flex items-center gap-4 px-5 pt-5 pb-4 flex-shrink-0">
          {servicio.imagen ? (
            <div className="w-14 h-14 rounded-2xl bg-white shadow-sm border border-zinc-100/80 dark:border-zinc-800 overflow-hidden flex-shrink-0 flex items-center justify-center p-1.5 relative">
               <div className="absolute inset-0 bg-gradient-to-br from-white to-zinc-50 dark:from-zinc-100 dark:to-zinc-200" />
               <img src={servicio.imagen} alt={servicio.nombre} className="w-full h-full object-contain relative z-10" />
            </div>
          ) : (
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl flex-shrink-0 shadow-sm border border-zinc-100 dark:border-zinc-800"
              style={{ background: servicio.color + '18' }}
            >
              {servicio.icono}
            </div>
          )}
          <div className="flex-1 min-w-0">
            <h2 className="text-lg font-black text-zinc-900 dark:text-white leading-tight">
              {servicio.nombre}
            </h2>
            <p className="text-xs text-zinc-400 mt-0.5">
              {servicio.planes?.length} plan{servicio.planes?.length !== 1 ? 'es' : ''} disponibles
              · Ciclo {servicio.ciclo}
            </p>
          </div>
          <button
            onClick={onCerrar}
            className="w-8 h-8 flex items-center justify-center rounded-xl
              text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200
              hover:bg-zinc-100 dark:hover:bg-zinc-700/60 transition-all text-sm"
          >
            ✕
          </button>
        </div>

        {/* Info de precios comunitarios */}
        <div className="mx-5 mb-3 px-3 py-2 bg-blue-50 dark:bg-blue-900/15
          border border-blue-200 dark:border-blue-800/40 rounded-xl flex-shrink-0">
          <p className="text-[10px] text-blue-700 dark:text-blue-300 leading-relaxed">
            <span className="font-bold">✏️ Precios desactualizados?</span>{' '}
            Pasá el cursor sobre cualquier precio y tocá el lápiz para corregirlo.
            Tu corrección ayuda a toda la comunidad.
          </p>
        </div>

        {/* Lista de planes — scrolleable */}
        <div className="overflow-y-auto flex-1 px-5 pb-5 flex flex-col gap-4 min-h-0">
          {servicio.planes?.map(plan => (
            <TarjetaPlan
              key={plan.id}
              plan={plan}
              preciosComunitarios={preciosComunitarios[plan.id]}
              onAgregar={onAgregar}
              onEditarPrecio={onEditarPrecio}
            />
          ))}
        </div>
      </div>
    </div>,
    document.body
  )
}

// ── Tarjeta de servicio (lista principal) ─────────────────────
function TarjetaServicio({ servicio, preciosComunitarios, onAbrir }) {
  const precioDesde = useMemo(
    () => precioMinimo(servicio, preciosComunitarios),
    [servicio, preciosComunitarios]
  )

  const cantPlanes = servicio.planes?.length || 0

  return (
    <button
      onClick={onAbrir}
      className="w-full flex items-center gap-4 p-4 text-left
        bg-white dark:bg-zinc-900 rounded-2xl
        border border-zinc-100 dark:border-zinc-800
        hover:border-[var(--mango)]/30 dark:hover:border-[var(--mango)]/20
        hover:shadow-md active:scale-[0.98]
        transition-all duration-200 group"
    >
      {/* Ícono */}
      <div
        className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0
          group-hover:scale-105 transition-transform"
        style={{ background: servicio.color + '18' }}
      >
        {servicio.icono}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="font-bold text-sm text-zinc-900 dark:text-white leading-tight">
          {servicio.nombre}
        </p>
        <p className="text-[11px] text-zinc-400 mt-0.5">
          {cantPlanes} plan{cantPlanes !== 1 ? 'es' : ''}
          {' · '}
          <span className="capitalize">{servicio.ciclo}</span>
        </p>
      </div>

      {/* Precio desde + chevron */}
      <div className="flex items-center gap-2 flex-shrink-0">
        <div className="text-right">
          {precioDesde ? (
            <>
              <p className="text-[9px] text-zinc-400 uppercase tracking-wider font-medium leading-none mb-0.5">
                desde
              </p>
              <p className="text-sm font-black" style={{ color: servicio.color }}>
                {precioDesde}
              </p>
            </>
          ) : (
            <p className="text-xs text-zinc-400 italic">Sin precio</p>
          )}
        </div>
        <svg
          width="16" height="16" viewBox="0 0 16 16" fill="none"
          stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"
          className="text-zinc-300 dark:text-zinc-600 group-hover:text-[var(--mango)] transition-colors flex-shrink-0"
        >
          <path d="M6 4l4 4-4 4" />
        </svg>
      </div>
    </button>
  )
}

// ── Componente principal ──────────────────────────────────────
export function CatalogoSuscripciones({ onAgregarSuscripcion }) {
  const [categoriaActiva, setCategoriaActiva] = useState('todos')
  const [busqueda, setBusqueda]               = useState('')
  const [servicioAbierto, setServicioAbierto] = useState(null) // objeto servicio
  const [toastMsg, setToastMsg]               = useState(null)

  const { precios: preciosComunitarios, actualizarPrecio } = usePreciosComunitarios()

  // Filtrar servicios (un objeto por servicio, no por plan)
  const serviciosFiltrados = useMemo(() => {
    return CATALOGO_SUSCRIPCIONES.filter(s => {
      const matchCat  = categoriaActiva === 'todos' || s.categoria === categoriaActiva
      const matchBusq = !busqueda ||
        s.nombre.toLowerCase().includes(busqueda.toLowerCase())
      return matchCat && matchBusq
    })
  }, [categoriaActiva, busqueda])

  const handleAgregarDesdeModal = (plan, metodoPago, precio, moneda) => {
    const servicio = servicioAbierto
    const metaM = METODOS_PAGO.find(m => m.id === metodoPago)

    onAgregarSuscripcion({
      nombre:    servicio.nombre,
      plan:      plan.nombre,
      monto:     precio,
      moneda:    moneda || 'ARS',
      icono:     servicio.icono,
      color:     servicio.color,
      ciclo:     servicio.ciclo,
      categoria: servicio.categoria,
      url:       servicio.url,
      notas:     `Método: ${metaM?.label || metodoPago}`,
      activa:    true,
    })

    setServicioAbierto(null)
    setToastMsg(`${servicio.nombre} — ${plan.nombre} agregado ✅`)
    setTimeout(() => setToastMsg(null), 3000)
  }

  const handleEditarPrecio = async (planId, metodoPago, precio, moneda) => {
    return actualizarPrecio(planId, metodoPago, precio, moneda)
  }

  return (
    <>
      <div className="flex flex-col gap-4">

        {/* Buscador */}
        <div className="relative">
          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400 text-sm pointer-events-none">
            🔍
          </span>
          <input
            type="text"
            value={busqueda}
            onChange={e => setBusqueda(e.target.value)}
            placeholder="Buscar Netflix, Spotify, iCloud…"
            className="w-full bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700
              rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2
              focus:ring-[var(--mango)]/40 text-zinc-900 dark:text-white placeholder:text-zinc-400"
          />
          {busqueda && (
            <button
              onClick={() => setBusqueda('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400
                hover:text-zinc-600 transition-colors text-sm"
            >
              ✕
            </button>
          )}
        </div>

        {/* Categorías */}
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide -mx-1 px-1">
          {CATEGORIAS_CATALOGO.map(cat => (
            <button
              key={cat.id}
              onClick={() => setCategoriaActiva(cat.id)}
              className={`flex-shrink-0 px-3 py-1.5 rounded-xl text-xs font-semibold
                border-2 transition-all whitespace-nowrap ${
                categoriaActiva === cat.id
                  ? 'border-[var(--mango)] bg-[var(--mango)]/10 text-[var(--mango-dark)] dark:text-[var(--mango)]'
                  : 'border-zinc-100 dark:border-zinc-800 text-zinc-500 hover:border-zinc-200'
              }`}
            >
              {cat.emoji} {cat.label}
            </button>
          ))}
        </div>

        {/* Contador */}
        <div className="flex items-center justify-between px-1">
          <p className="text-xs text-zinc-400 font-medium">
            {serviciosFiltrados.length} servicio{serviciosFiltrados.length !== 1 ? 's' : ''}
          </p>
          <p className="text-[10px] text-zinc-400">
            Tocá una tarjeta para ver planes y precios
          </p>
        </div>

        {/* Lista de servicios */}
        {serviciosFiltrados.length === 0 ? (
          <div className="text-center py-12 text-zinc-400 text-sm">
            No encontramos servicios para esa búsqueda 🔍
          </div>
        ) : (
          <div className="flex flex-col gap-2.5">
            {serviciosFiltrados.map(s => (
              <TarjetaServicio
                key={s.id}
                servicio={s}
                preciosComunitarios={preciosComunitarios}
                onAbrir={() => setServicioAbierto(s)}
              />
            ))}
          </div>
        )}

        {/* Nota al pie */}
        <p className="text-[10px] text-zinc-400 text-center mt-2">
          Precios actualizados por la comunidad · Última actualización según datos locales.
          <br />
          Los precios son orientativos y pueden variar por región.
        </p>
      </div>

      {/* Toast de éxito */}
      {toastMsg && (
        <div className="fixed bottom-24 md:bottom-8 left-1/2 -translate-x-1/2 z-50
          flex items-center gap-2 px-4 py-3 rounded-2xl shadow-xl
          bg-zinc-900 dark:bg-white text-white dark:text-zinc-900
          text-sm font-semibold animate-in slide-in-from-bottom-4 fade-in duration-300
          whitespace-nowrap">
          {toastMsg}
        </div>
      )}

      {/* Modal de planes */}
      {servicioAbierto && (
        <ModalPlanes
          servicio={servicioAbierto}
          preciosComunitarios={preciosComunitarios}
          onAgregar={handleAgregarDesdeModal}
          onEditarPrecio={handleEditarPrecio}
          onCerrar={() => setServicioAbierto(null)}
        />
      )}
    </>
  )
}