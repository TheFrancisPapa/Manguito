// src/pages/Suscripciones/Catalogo.jsx
// Catálogo comunitario de suscripciones con precios en ARS (Mercado Pago).
// Los usuarios pueden registrar servicios nuevos y crear categorías custom.

import { useState, useEffect, useMemo, useCallback } from 'react'
import { createPortal } from 'react-dom'
import { supabase } from '../../lib/supabase'
import {
  CATALOGO_SUSCRIPCIONES,
  CATEGORIAS_CATALOGO,
  METODOS_PAGO,
  CICLOS_DISPONIBLES,
} from '../../data/catalogo-suscripciones'

// ── Helpers ──────────────────────────────────────────────────
const fmtPrecio = (n) => {
  if (n == null) return null
  return `$${Number(n).toLocaleString('es-AR', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`
}

function precioMinimo(servicio, preciosComunitarios = {}) {
  let min = null
  servicio.planes?.forEach(plan => {
    const pc = preciosComunitarios[plan.id]?.ars_mp
    const pb = plan.precios?.ars_mp
    const precio = pc ?? pb
    if (precio != null && (min == null || precio < min)) min = precio
  })
  return min != null ? fmtPrecio(min) : null
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
      .eq('metodo_pago', 'ars_mp')
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

  const actualizarPrecio = useCallback(async (planId, nuevoPrecio) => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return false

    const { error } = await supabase
      .from('catalogo_precios_billetera')
      .upsert({
        servicio_id: planId,
        metodo_pago: 'ars_mp',
        precio: Number(nuevoPrecio),
        moneda: 'ARS',
        votos_ok: 1,
        votos_desactual: 0,
        updated_by: user.id,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'servicio_id,metodo_pago' })

    if (!error) {
      setPrecios(prev => ({
        ...prev,
        [planId]: { ...(prev[planId] || {}), ars_mp: Number(nuevoPrecio) },
      }))
      return true
    }
    return false
  }, [])

  return { precios, cargando, actualizarPrecio }
}

// ── Hook para cargar servicios custom de Supabase ──────────────
function useServiciosCustom() {
  const [servicios, setServicios] = useState([])
  const [categoriasCustom, setCategoriasCustom] = useState([])

  const cargar = useCallback(async () => {
    // Cargar servicios custom con sus planes
    const { data: svcs } = await supabase
      .from('catalogo_servicios_custom')
      .select('*, catalogo_planes_custom(*)')
      .eq('aprobado', true)
      .order('created_at', { ascending: false })

    if (svcs) {
      const mapped = svcs.map(s => ({
        id:        `custom-${s.id}`,
        nombre:    s.nombre,
        icono:     s.icono,
        color:     s.color,
        categoria: s.categoria,
        ciclo:     s.ciclo,
        url:       s.url,
        imagen:    s.imagen,
        esCustom:  true,
        planes: (s.catalogo_planes_custom || []).map(p => ({
          id:          `custom-plan-${p.id}`,
          nombre:      p.nombre,
          descripcion: p.descripcion,
          precios:     { ars_mp: p.precio_ars_mp },
        })),
      }))
      setServicios(mapped)
    }

    // Cargar categorías custom
    const { data: cats } = await supabase
      .from('categorias_catalogo_custom')
      .select('*')
      .order('created_at', { ascending: true })

    if (cats) {
      setCategoriasCustom(cats.map(c => ({
        id:    c.label.toLowerCase().replace(/\s+/g, '-'),
        label: c.label,
        emoji: c.emoji,
      })))
    }
  }, [])

  useEffect(() => { cargar() }, [cargar])

  return { servicios, categoriasCustom, recargar: cargar }
}

// ── Fila de precio editable (simplificada: solo Mercado Pago) ──
function FilaPrecio({ planId, precio, esComunidad, onEditar }) {
  const [editando, setEditando] = useState(false)
  const [valor, setValor]       = useState(precio?.toString() || '')
  const [guardando, setGuardando] = useState(false)

  const confirmar = async () => {
    if (!valor || isNaN(valor) || Number(valor) <= 0) return
    setGuardando(true)
    const ok = await onEditar(planId, valor)
    setGuardando(false)
    if (ok) setEditando(false)
  }

  if (precio == null && !editando) {
    return (
      <div className="flex items-center gap-2 py-2">
        <span className="text-base w-7 text-center flex-shrink-0">💙</span>
        <span className="text-xs text-zinc-400 flex-1">Mercado Pago</span>
        <button
          onClick={() => setEditando(true)}
          className="text-[10px] font-bold text-[var(--mango)] hover:underline"
        >
          + Agregar precio
        </button>
      </div>
    )
  }

  if (editando) {
    return (
      <div className="flex items-center gap-2 py-2">
        <span className="text-base w-7 text-center flex-shrink-0">💙</span>
        <span className="text-xs text-zinc-500 dark:text-zinc-400 flex-1 min-w-0 truncate">
          Mercado Pago
        </span>
        <input
          type="number"
          value={valor}
          onChange={e => setValor(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') confirmar(); if (e.key === 'Escape') setEditando(false) }}
          autoFocus
          step="1"
          placeholder="Ej: 4699"
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
      <span className="text-base w-7 text-center flex-shrink-0">💙</span>
      <span className="text-xs text-zinc-500 dark:text-zinc-400 flex-1 min-w-0 truncate">
        Mercado Pago
      </span>
      {esComunidad && (
        <span className="text-[9px] bg-emerald-100 dark:bg-emerald-900/20 text-emerald-600
          px-1 py-0.5 rounded font-bold flex-shrink-0">
          👥
        </span>
      )}
      <span className="text-sm font-bold text-zinc-800 dark:text-zinc-100 flex-shrink-0">
        {fmtPrecio(precio)}
      </span>
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
  const pc = preciosComunitarios?.ars_mp
  const pb = plan.precios?.ars_mp
  const precio = pc ?? pb

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

      {/* Precio Mercado Pago */}
      <div className="px-4 pb-1">
        <FilaPrecio
          planId={plan.id}
          precio={precio}
          esComunidad={pc != null && pc !== pb}
          onEditar={onEditarPrecio}
        />
      </div>
    </div>
  )
}

// ── Modal de planes de un servicio ───────────────────────────
function ModalPlanes({ servicio, preciosComunitarios, onAgregar, onEditarPrecio, onCerrar }) {
  useEffect(() => {
    const fn = (e) => { if (e.key === 'Escape') onCerrar() }
    window.addEventListener('keydown', fn)
    return () => window.removeEventListener('keydown', fn)
  }, [onCerrar])

  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = '' }
  }, [])

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-3 sm:p-4"
      onClick={onCerrar}
    >
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200" />

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
              {servicio.esCustom && (
                <span className="ml-1 px-1.5 py-0.5 bg-violet-100 dark:bg-violet-900/20
                  text-violet-600 dark:text-violet-400 text-[9px] font-bold rounded">
                  COMUNIDAD
                </span>
              )}
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

// ── Modal para crear una suscripción nueva ────────────────────
function ModalNuevaSuscripcion({ categorias, onGuardar, onCerrar }) {
  const [paso, setPaso] = useState(1)
  const [guardando, setGuardando] = useState(false)
  const [creandoCat, setCreandoCat] = useState(false)
  const [nuevaCatLabel, setNuevaCatLabel] = useState('')
  const [nuevaCatEmoji, setNuevaCatEmoji] = useState('📦')

  // Datos del servicio
  const [nombre, setNombre]       = useState('')
  const [categoria, setCategoria] = useState('')
  const [ciclo, setCiclo]         = useState('mensual')
  const [url, setUrl]             = useState('')
  const [icono, setIcono]         = useState('📱')

  // Datos del plan
  const [planNombre, setPlanNombre]   = useState('')
  const [planDesc, setPlanDesc]       = useState('')
  const [planPrecio, setPlanPrecio]   = useState('')

  const categoriasDisponibles = categorias.filter(c => c.id !== 'todos')

  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = '' }
  }, [])

  useEffect(() => {
    const fn = (e) => { if (e.key === 'Escape') onCerrar() }
    window.addEventListener('keydown', fn)
    return () => window.removeEventListener('keydown', fn)
  }, [onCerrar])

  const puedePaso2 = nombre.trim() && categoria
  const puedePaso3 = planNombre.trim() && planPrecio && Number(planPrecio) > 0

  const handleGuardar = async () => {
    setGuardando(true)
    await onGuardar({
      nombre: nombre.trim(),
      icono,
      categoria,
      ciclo,
      url: url.trim() || null,
      plan: {
        nombre: planNombre.trim(),
        descripcion: planDesc.trim() || null,
        precio: Number(planPrecio),
      },
    })
    setGuardando(false)
  }

  const handleCrearCategoria = async () => {
    if (!nuevaCatLabel.trim()) return
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    await supabase.from('categorias_catalogo_custom').insert({
      label: nuevaCatLabel.trim(),
      emoji: nuevaCatEmoji || '📦',
      created_by: user.id,
    })

    setCategoria(nuevaCatLabel.trim().toLowerCase().replace(/\s+/g, '-'))
    setCreandoCat(false)
    setNuevaCatLabel('')
    setNuevaCatEmoji('📦')
  }

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-3 sm:p-4"
      onClick={onCerrar}
    >
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200" />

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
        <div className="flex items-center gap-3 px-5 pt-5 pb-4 flex-shrink-0">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[var(--mango)] to-[var(--mango-dark)]
            flex items-center justify-center text-lg text-[var(--charcoal)] font-black flex-shrink-0">
            +
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-lg font-black text-zinc-900 dark:text-white leading-tight">
              Nueva suscripción
            </h2>
            <p className="text-xs text-zinc-400 mt-0.5">
              Paso {paso} de 3
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

        {/* Progress bar */}
        <div className="mx-5 mb-4 flex gap-1.5">
          {[1, 2, 3].map(p => (
            <div
              key={p}
              className={`h-1 rounded-full flex-1 transition-all duration-300 ${
                p <= paso
                  ? 'bg-gradient-to-r from-[var(--mango)] to-[var(--mango-dark)]'
                  : 'bg-zinc-100 dark:bg-zinc-800'
              }`}
            />
          ))}
        </div>

        {/* Contenido por paso */}
        <div className="overflow-y-auto flex-1 px-5 pb-5 min-h-0">

          {/* PASO 1: Datos del servicio */}
          {paso === 1 && (
            <div className="flex flex-col gap-4">
              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 mb-1.5 block">
                  Nombre del servicio *
                </label>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      const emojis = ['📱', '🎬', '🎵', '☁️', '🤖', '💻', '🎮', '⚽', '📚', '🎨', '🔐', '📺', '🛡️', '🦉', '📊']
                      const idx = emojis.indexOf(icono)
                      setIcono(emojis[(idx + 1) % emojis.length])
                    }}
                    className="w-11 h-11 rounded-xl border-2 border-zinc-200 dark:border-zinc-700
                      flex items-center justify-center text-xl hover:border-[var(--mango)]
                      transition-colors flex-shrink-0"
                    title="Cambiar icono"
                  >
                    {icono}
                  </button>
                  <input
                    type="text"
                    value={nombre}
                    onChange={e => setNombre(e.target.value)}
                    placeholder="Ej: Tidal, Mubi, Crunchyroll..."
                    className="flex-1 bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700
                      rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2
                      focus:ring-[var(--mango)]/40 text-zinc-900 dark:text-white placeholder:text-zinc-400"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 mb-1.5 block">
                  Categoría *
                </label>
                <div className="flex gap-1.5 flex-wrap">
                  {categoriasDisponibles.map(cat => (
                    <button
                      key={cat.id}
                      onClick={() => setCategoria(cat.id)}
                      className={`px-2.5 py-1.5 rounded-xl text-[11px] font-bold border-2 transition-all ${
                        categoria === cat.id
                          ? 'border-[var(--mango)] bg-[var(--mango)]/10 text-[var(--mango-dark)] dark:text-[var(--mango)]'
                          : 'border-zinc-100 dark:border-zinc-800 text-zinc-500 hover:border-zinc-200'
                      }`}
                    >
                      {cat.emoji} {cat.label}
                    </button>
                  ))}
                  <button
                    onClick={() => setCreandoCat(true)}
                    className="px-2.5 py-1.5 rounded-xl text-[11px] font-bold border-2 border-dashed
                      border-zinc-300 dark:border-zinc-700 text-zinc-400 hover:border-[var(--mango)]
                      hover:text-[var(--mango)] transition-all"
                  >
                    ➕ Nueva
                  </button>
                </div>

                {/* Mini-form para crear categoría */}
                {creandoCat && (
                  <div className="mt-2 p-3 bg-zinc-50 dark:bg-zinc-800/50 rounded-xl
                    border border-zinc-200 dark:border-zinc-700 flex gap-2 items-end">
                    <div className="flex-1">
                      <input
                        type="text"
                        value={nuevaCatLabel}
                        onChange={e => setNuevaCatLabel(e.target.value)}
                        placeholder="Nombre de la categoría"
                        autoFocus
                        className="w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700
                          rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:ring-1
                          focus:ring-[var(--mango)] text-zinc-900 dark:text-white placeholder:text-zinc-400"
                      />
                    </div>
                    <input
                      type="text"
                      value={nuevaCatEmoji}
                      onChange={e => setNuevaCatEmoji(e.target.value)}
                      className="w-10 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700
                        rounded-lg px-2 py-1.5 text-xs text-center focus:outline-none focus:ring-1
                        focus:ring-[var(--mango)]"
                      maxLength={2}
                    />
                    <button
                      onClick={handleCrearCategoria}
                      className="px-2.5 py-1.5 rounded-lg bg-[var(--mango)] text-[var(--charcoal)]
                        text-[10px] font-black hover:opacity-90 transition-all"
                    >
                      ✓
                    </button>
                    <button
                      onClick={() => setCreandoCat(false)}
                      className="px-2.5 py-1.5 rounded-lg bg-zinc-200 dark:bg-zinc-700
                        text-zinc-500 text-[10px] font-bold"
                    >
                      ✕
                    </button>
                  </div>
                )}
              </div>

              <div className="flex gap-3">
                <div className="flex-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 mb-1.5 block">
                    Ciclo de facturación
                  </label>
                  <select
                    value={ciclo}
                    onChange={e => setCiclo(e.target.value)}
                    className="w-full bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700
                      rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2
                      focus:ring-[var(--mango)]/40 text-zinc-900 dark:text-white appearance-none"
                  >
                    {CICLOS_DISPONIBLES.map(c => (
                      <option key={c.id} value={c.id}>{c.label}</option>
                    ))}
                  </select>
                </div>
                <div className="flex-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 mb-1.5 block">
                    URL (opcional)
                  </label>
                  <input
                    type="url"
                    value={url}
                    onChange={e => setUrl(e.target.value)}
                    placeholder="https://..."
                    className="w-full bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700
                      rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2
                      focus:ring-[var(--mango)]/40 text-zinc-900 dark:text-white placeholder:text-zinc-400"
                  />
                </div>
              </div>
            </div>
          )}

          {/* PASO 2: Plan y precio */}
          {paso === 2 && (
            <div className="flex flex-col gap-4">
              <div className="p-3 bg-zinc-50 dark:bg-zinc-800/30 rounded-xl border border-zinc-100 dark:border-zinc-800">
                <p className="text-xs text-zinc-500">
                  <span className="text-xl mr-2">{icono}</span>
                  Registrando plan para <span className="font-bold text-zinc-800 dark:text-white">{nombre}</span>
                </p>
              </div>

              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 mb-1.5 block">
                  Nombre del plan *
                </label>
                <input
                  type="text"
                  value={planNombre}
                  onChange={e => setPlanNombre(e.target.value)}
                  placeholder="Ej: Individual, Familiar, Premium..."
                  className="w-full bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700
                    rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2
                    focus:ring-[var(--mango)]/40 text-zinc-900 dark:text-white placeholder:text-zinc-400"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 mb-1.5 block">
                  Descripción (opcional)
                </label>
                <input
                  type="text"
                  value={planDesc}
                  onChange={e => setPlanDesc(e.target.value)}
                  placeholder="Ej: Incluye 4 pantallas, calidad 4K..."
                  className="w-full bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700
                    rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2
                    focus:ring-[var(--mango)]/40 text-zinc-900 dark:text-white placeholder:text-zinc-400"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 mb-1.5 block">
                  Precio en ARS (Mercado Pago) *
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 text-sm font-bold">$</span>
                  <input
                    type="number"
                    value={planPrecio}
                    onChange={e => setPlanPrecio(e.target.value)}
                    placeholder="4699"
                    step="1"
                    min="0"
                    className="w-full bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700
                      rounded-xl pl-7 pr-3 py-2.5 text-sm focus:outline-none focus:ring-2
                      focus:ring-[var(--mango)]/40 text-zinc-900 dark:text-white placeholder:text-zinc-400
                      font-bold"
                  />
                </div>
                <p className="text-[10px] text-zinc-400 mt-1">
                  💙 Precio con Mercado Pago. La comunidad podrá actualizarlo.
                </p>
              </div>
            </div>
          )}

          {/* PASO 3: Confirmación */}
          {paso === 3 && (
            <div className="flex flex-col gap-4">
              <p className="text-xs text-zinc-400 font-medium text-center mb-1">
                Revisá los datos antes de publicar
              </p>

              {/* Preview card */}
              <div className="rounded-2xl border-2 border-[var(--mango)]/30 bg-white dark:bg-zinc-900/60 overflow-hidden">
                <div className="flex items-center gap-3 p-4 border-b border-zinc-100 dark:border-zinc-800">
                  <div
                    className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0"
                    style={{ background: '#8B5CF618' }}
                  >
                    {icono}
                  </div>
                  <div>
                    <p className="font-bold text-sm text-zinc-900 dark:text-white">{nombre}</p>
                    <p className="text-[10px] text-zinc-400">
                      {categoriasDisponibles.find(c => c.id === categoria)?.emoji}{' '}
                      {categoriasDisponibles.find(c => c.id === categoria)?.label || categoria}
                      {' · '}
                      {CICLOS_DISPONIBLES.find(c => c.id === ciclo)?.label}
                    </p>
                  </div>
                </div>

                <div className="p-4">
                  <p className="text-xs font-bold text-zinc-700 dark:text-zinc-300">{planNombre}</p>
                  {planDesc && (
                    <p className="text-[11px] text-zinc-400 mt-0.5">{planDesc}</p>
                  )}
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-base">💙</span>
                    <span className="text-xs text-zinc-500">Mercado Pago</span>
                    <span className="text-sm font-bold text-zinc-800 dark:text-white ml-auto">
                      {fmtPrecio(Number(planPrecio))}
                    </span>
                  </div>
                </div>
              </div>

              <p className="text-[10px] text-zinc-400 text-center leading-relaxed">
                🌐 Tu suscripción será visible para toda la comunidad.
                <br />
                Otros usuarios podrán actualizar el precio si cambia.
              </p>
            </div>
          )}
        </div>

        {/* Footer con botones de navegación */}
        <div className="px-5 pb-5 pt-2 flex gap-3 flex-shrink-0">
          {paso > 1 && (
            <button
              onClick={() => setPaso(p => p - 1)}
              className="px-4 py-2.5 rounded-xl text-sm font-bold
                border-2 border-zinc-200 dark:border-zinc-700
                text-zinc-600 dark:text-zinc-300 hover:border-zinc-300 transition-all"
            >
              ← Atrás
            </button>
          )}
          {paso < 3 ? (
            <button
              onClick={() => setPaso(p => p + 1)}
              disabled={paso === 1 ? !puedePaso2 : !puedePaso3}
              className="flex-1 py-2.5 rounded-xl text-sm font-bold
                bg-gradient-to-r from-[var(--mango)] to-[var(--mango-dark)]
                text-[var(--charcoal)] hover:opacity-90 active:scale-[0.98] transition-all
                disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Siguiente →
            </button>
          ) : (
            <button
              onClick={handleGuardar}
              disabled={guardando}
              className="flex-1 py-2.5 rounded-xl text-sm font-bold
                bg-gradient-to-r from-emerald-500 to-emerald-600
                text-white hover:opacity-90 active:scale-[0.98] transition-all
                disabled:opacity-40"
            >
              {guardando ? 'Guardando…' : '✓ Publicar suscripción'}
            </button>
          )}
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
      {/* Ícono / Logo */}
      {servicio.imagen ? (
        <div className="w-14 h-14 rounded-2xl bg-white shadow-sm border border-zinc-100/80 dark:border-zinc-800
          flex items-center justify-center overflow-hidden flex-shrink-0 p-2 relative
          group-hover:scale-105 transition-transform">
          <div className="absolute inset-0 bg-gradient-to-br from-white to-zinc-50 dark:from-zinc-100 dark:to-zinc-200" />
          <img
            src={servicio.imagen}
            alt={servicio.nombre}
            className="w-full h-full object-contain relative z-10"
            onError={e => {
              e.currentTarget.style.display = 'none'
              e.currentTarget.parentElement.querySelector('.emoji-fallback').style.display = 'flex'
            }}
          />
          <span className="emoji-fallback hidden absolute inset-0 items-center justify-center text-2xl">
            {servicio.icono}
          </span>
        </div>
      ) : (
        <div
          className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0
            group-hover:scale-105 transition-transform"
          style={{ background: servicio.color + '18' }}
        >
          {servicio.icono}
        </div>
      )}

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="font-bold text-sm text-zinc-900 dark:text-white leading-tight flex items-center gap-1.5">
          {servicio.nombre}
          {servicio.esCustom && (
            <span className="px-1 py-0.5 bg-violet-100 dark:bg-violet-900/20
              text-violet-600 dark:text-violet-400 text-[8px] font-bold rounded">
              COM
            </span>
          )}
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
  const [servicioAbierto, setServicioAbierto] = useState(null)
  const [modalNuevo, setModalNuevo]           = useState(false)
  const [toastMsg, setToastMsg]               = useState(null)

  const { precios: preciosComunitarios, actualizarPrecio } = usePreciosComunitarios()
  const { servicios: serviciosCustom, categoriasCustom, recargar: recargarCustom } = useServiciosCustom()

  // Merge categorías estáticas + custom (sin duplicados)
  const todasCategorias = useMemo(() => {
    const ids = new Set(CATEGORIAS_CATALOGO.map(c => c.id))
    const extra = categoriasCustom.filter(c => !ids.has(c.id))
    return [...CATEGORIAS_CATALOGO, ...extra]
  }, [categoriasCustom])

  // Merge servicios estáticos + custom
  const todosServicios = useMemo(() => {
    return [...CATALOGO_SUSCRIPCIONES, ...serviciosCustom]
  }, [serviciosCustom])

  // Filtrar
  const serviciosFiltrados = useMemo(() => {
    return todosServicios.filter(s => {
      const matchCat  = categoriaActiva === 'todos' || s.categoria === categoriaActiva
      const matchBusq = !busqueda ||
        s.nombre.toLowerCase().includes(busqueda.toLowerCase())
      return matchCat && matchBusq
    })
  }, [categoriaActiva, busqueda, todosServicios])

  const handleAgregarDesdeModal = (plan, precio) => {
    const servicio = servicioAbierto

    onAgregarSuscripcion({
      nombre:    servicio.nombre,
      plan:      plan.nombre,
      monto:     precio,
      moneda:    'ARS',
      icono:     servicio.icono,
      color:     servicio.color,
      ciclo:     servicio.ciclo,
      categoria: servicio.categoria,
      url:       servicio.url,
      notas:     'Método: Mercado Pago',
      activa:    true,
    })

    setServicioAbierto(null)
    setToastMsg(`${servicio.nombre} — ${plan.nombre} agregado ✅`)
    setTimeout(() => setToastMsg(null), 3000)
  }

  const handleEditarPrecio = async (planId, precio) => {
    return actualizarPrecio(planId, precio)
  }

  const handleGuardarNuevo = async (datos) => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    // 1. Crear servicio
    const { data: svc, error: errSvc } = await supabase
      .from('catalogo_servicios_custom')
      .insert({
        nombre:     datos.nombre,
        icono:      datos.icono,
        color:      '#8B5CF6',
        categoria:  datos.categoria,
        ciclo:      datos.ciclo,
        url:        datos.url,
        created_by: user.id,
      })
      .select('id')
      .single()

    if (errSvc || !svc) return

    // 2. Crear plan
    await supabase.from('catalogo_planes_custom').insert({
      servicio_id:  svc.id,
      nombre:       datos.plan.nombre,
      descripcion:  datos.plan.descripcion,
      precio_ars_mp: datos.plan.precio,
      created_by:   user.id,
    })

    setModalNuevo(false)
    recargarCustom()
    setToastMsg(`${datos.nombre} publicado en el catálogo ✅`)
    setTimeout(() => setToastMsg(null), 3000)
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
          {todasCategorias.map(cat => (
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

        {/* Contador + botón agregar */}
        <div className="flex items-center justify-between px-1">
          <p className="text-xs text-zinc-400 font-medium">
            {serviciosFiltrados.length} servicio{serviciosFiltrados.length !== 1 ? 's' : ''}
          </p>
          <button
            onClick={() => setModalNuevo(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] font-bold
              bg-gradient-to-r from-[var(--mango)] to-[var(--mango-dark)]
              text-[var(--charcoal)] hover:opacity-90 active:scale-95 transition-all shadow-sm"
          >
            <span className="text-sm">➕</span>
            Agregar suscripción
          </button>
        </div>

        {/* Lista de servicios */}
        {serviciosFiltrados.length === 0 ? (
          <div className="text-center py-12 text-zinc-400 text-sm">
            No encontramos servicios para esa búsqueda 🔍
            <br />
            <button
              onClick={() => setModalNuevo(true)}
              className="mt-3 text-[var(--mango)] font-bold hover:underline"
            >
              ¿Querés agregar uno nuevo?
            </button>
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
          Precios actualizados por la comunidad · Método: Mercado Pago (ARS).
          <br />
          Los precios son orientativos y pueden variar.
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

      {/* Modal nueva suscripción */}
      {modalNuevo && (
        <ModalNuevaSuscripcion
          categorias={todasCategorias}
          onGuardar={handleGuardarNuevo}
          onCerrar={() => setModalNuevo(false)}
        />
      )}
    </>
  )
}