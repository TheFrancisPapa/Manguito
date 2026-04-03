// src/pages/Suscripciones/index.jsx
// Con búsqueda inteligente en catálogo al tipear el nombre del servicio
import { useState, useEffect, useCallback } from 'react'
import { useAuthContext } from '../../context/AuthContext'
import { useSuscripciones } from '../../hooks/useSuscripciones'
import { SUSCRIPCIONES_POPULARES } from '../../api/suscripciones'
import {
  CATALOGO_SUSCRIPCIONES,
} from '../../data/catalogo-suscripciones'
import { PageWrapper, PageHeader } from '../../components/layout'
import { Card, CardHeader, Button, EmptyState, Modal, Input, Select } from '../../components/ui'
import { exportarSuscripcionesCSV } from '../../lib/exportar'
import { CatalogoSuscripciones } from './Catalogo'
import { supabase } from '../../lib/supabase'

const CATEGORIAS = [
  { id: 'streaming', label: 'Streaming',  icono: '🎬' },
  { id: 'musica',    label: 'Música',     icono: '🎵' },
  { id: 'nube',      label: 'Nube',       icono: '☁️' },
  { id: 'ia',        label: 'IA',         icono: '🤖' },
  { id: 'software',  label: 'Software',   icono: '💻' },
  { id: 'salud',     label: 'Salud/Gym',  icono: '🏋️' },
  { id: 'educacion', label: 'Educación',  icono: '📚' },
  { id: 'juegos',    label: 'Juegos',     icono: '🎮' },
  { id: 'deportes',  label: 'Deportes',   icono: '⚽' },
  { id: 'otro',      label: 'Otro',       icono: '📦' },
]

const COLORES = ['#8B5CF6','#EC4899','#1DB954','#E50914','#3478F6','#F59E0B','#EF4444','#10B981']

const FORM_INIT = {
  nombre: '', monto: '', moneda: 'ARS', icono: '📱', color: '#8B5CF6',
  ciclo: 'mensual', dia_cobro: '', categoria: 'streaming', url: '', notas: '',
}

function fmtMes(m) {
  return `$${Number(m).toLocaleString('es-AR', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`
}

// ── Helper: buscar en catálogo ──────────────────────────────
function buscarEnCatalogo(nombre) {
  if (!nombre || nombre.length < 2) return []
  const q = nombre.toLowerCase().trim()
  return CATALOGO_SUSCRIPCIONES
    .filter(s =>
      s.nombre.toLowerCase().includes(q) ||
      q.includes(s.nombre.toLowerCase().substring(0, Math.max(4, s.nombre.length - 4)))
    )
    // Priorizar ciclo mensual
    .sort((a, b) => {
      const aMensual = a.ciclo === 'mensual' ? 0 : 1
      const bMensual = b.ciclo === 'mensual' ? 0 : 1
      return aMensual - bMensual
    })
    .slice(0, 5)
}

// ── Guardar corrección de precio en Supabase ─────────────────
async function guardarCorreccionPrecio(planId, nuevoPrecio) {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user || !planId) return
    await supabase.from('catalogo_precios_billetera').upsert({
      servicio_id: planId,
      metodo_pago: 'ars_mp',
      precio: Number(nuevoPrecio),
      moneda: 'ARS',
      votos_ok: 1,
      votos_desactual: 0,
      updated_by: user.id,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'servicio_id,metodo_pago' })
  } catch (e) {
    console.warn('[catalogo] No se pudo guardar corrección de precio:', e)
  }
}

// ── Formulario de suscripción con catálogo inteligente ────────
function FormSuscripcion({ onSubmit, onCancel, inicial = null }) {
  const [form, setForm] = useState(inicial ? {
    nombre: inicial.nombre, monto: inicial.monto, moneda: inicial.moneda ?? 'ARS',
    icono: inicial.icono, color: inicial.color, ciclo: inicial.ciclo,
    dia_cobro: inicial.dia_cobro ?? '', categoria: inicial.categoria || 'otro',
    url: inicial.url ?? '', notas: inicial.notas ?? '',
  } : FORM_INIT)
  const [cargando, setCargando] = useState(false)
  const [error, setError] = useState(null)

  // ── Estado del buscador de catálogo ──
  const [sugerencias, setSugerencias]           = useState([])
  const [mostrarSugerencias, setMostrarSugerencias] = useState(false)
  const [matchCatalogo, setMatchCatalogo]       = useState(null)  // { servicio, plan, planId }
  const [precioOriginal, setPrecioOriginal]     = useState(null)  // precio del catálogo
  const [precioModificado, setPrecioModificado] = useState(false)

  const set = (k) => (e) => { setForm(f => ({ ...f, [k]: e.target?.value ?? e })); setError(null) }

  // ── Buscar en catálogo cuando cambia el nombre ──
  useEffect(() => {
    if (inicial) return // No buscar al editar
    const timer = setTimeout(() => {
      const resultados = buscarEnCatalogo(form.nombre)
      setSugerencias(resultados)
      setMostrarSugerencias(resultados.length > 0 && !matchCatalogo)
    }, 200)
    return () => clearTimeout(timer)
  }, [form.nombre, inicial, matchCatalogo])

  // ── Aplicar match del catálogo ──
  const aplicarMatch = useCallback((servicio, planIndex = 0) => {
    const plan = servicio.planes?.[planIndex]
    const precio = plan?.precios?.ars_mp
    setForm(f => ({
      ...f,
      nombre:    servicio.nombre,
      icono:     servicio.icono,
      color:     servicio.color,
      categoria: servicio.categoria,
      ciclo:     servicio.ciclo,
      moneda:    'ARS',
      monto:     precio ? String(precio) : f.monto,
    }))
    setMatchCatalogo({ servicio, plan, planId: plan?.id })
    setPrecioOriginal(precio ?? null)
    setPrecioModificado(false)
    setMostrarSugerencias(false)
    setSugerencias([])
  }, [])

  // ── Manejar cambio de ciclo → actualizar precio del catálogo ──
  const handleCicloChange = useCallback((e) => {
    const nuevoCiclo = e.target.value
    setForm(f => ({ ...f, ciclo: nuevoCiclo }))
    setError(null)

    if (matchCatalogo) {
      // Buscar versión anual del mismo servicio en el catálogo
      const nombreBase = matchCatalogo.servicio.nombre
        .replace(/\s*—\s*anual/i, '')
        .replace(/\s*anual/i, '')
        .trim()

      const servicioAnual = CATALOGO_SUSCRIPCIONES.find(s =>
        s.ciclo === nuevoCiclo &&
        (s.nombre.toLowerCase().includes(nombreBase.toLowerCase()) ||
         nombreBase.toLowerCase().includes(s.nombre.toLowerCase().replace(/\s*—\s*anual/i, '').replace(/\s*anual/i, '').trim()))
      )

      if (servicioAnual?.planes?.[0]?.precios?.ars_mp) {
        const nuevoPrecio = servicioAnual.planes[0].precios.ars_mp
        setForm(f => ({ ...f, monto: String(nuevoPrecio), ciclo: nuevoCiclo }))
        setMatchCatalogo(prev => ({
          ...prev,
          servicio: servicioAnual,
          plan: servicioAnual.planes[0],
          planId: servicioAnual.planes[0]?.id,
        }))
        setPrecioOriginal(nuevoPrecio)
        setPrecioModificado(false)
      }
    }
  }, [matchCatalogo])

  // ── Manejar cambio de monto → marcar como corrección ──
  const handleMontoChange = useCallback((e) => {
    const val = e.target.value
    setForm(f => ({ ...f, monto: val }))
    setError(null)
    if (matchCatalogo && precioOriginal !== null && val && Number(val) !== precioOriginal) {
      setPrecioModificado(true)
    } else {
      setPrecioModificado(false)
    }
  }, [matchCatalogo, precioOriginal])

  // ── Manejar cambio de moneda ──
  const handleMonedaChange = useCallback((e) => {
    setForm(f => ({ ...f, moneda: e.target.value }))
    setError(null)
  }, [])

  const handlePopular = (p) => {
    // Intentar match en catálogo
    const matches = buscarEnCatalogo(p.nombre)
    if (matches.length > 0) {
      aplicarMatch(matches[0])
    } else {
      setForm(f => ({ ...f, nombre: p.nombre, icono: p.icono, color: p.color, categoria: p.categoria, moneda: p.moneda }))
    }
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!form.nombre.trim()) { setError('Ingresá un nombre.'); return }
    if (!form.monto || Number(form.monto) <= 0) { setError('El monto debe ser mayor a 0.'); return }
    setCargando(true)

    try {
      // Si el precio fue modificado y es en ARS, guardar como corrección comunitaria
      if (precioModificado && form.moneda === 'ARS' && matchCatalogo?.planId) {
        await guardarCorreccionPrecio(matchCatalogo.planId, form.monto)
      }

      // Si se pagó en USD y hay match en catálogo, agregar precio USD al catálogo
      if (form.moneda === 'USD' && matchCatalogo?.planId && form.monto) {
        try {
          const { data: { user } } = await supabase.auth.getUser()
          if (user) {
            await supabase.from('catalogo_precios_billetera').upsert({
              servicio_id: matchCatalogo.planId + '_usd',
              metodo_pago: 'usd',
              precio: Number(form.monto),
              moneda: 'USD',
              votos_ok: 1,
              votos_desactual: 0,
              updated_by: user.id,
              updated_at: new Date().toISOString(),
            }, { onConflict: 'servicio_id,metodo_pago' })
          }
        } catch {}
      }

      await onSubmit({
        nombre:    form.nombre.trim(),
        monto:     Number(form.monto),
        moneda:    form.moneda,
        icono:     form.icono || '📱',
        color:     form.color,
        ciclo:     form.ciclo,
        dia_cobro: form.dia_cobro ? Number(form.dia_cobro) : null,
        categoria: form.categoria,
        url:       form.url.trim() || null,
        notas:     form.notas.trim() || null,
        activa:    true,
      })
    } catch (err) {
      setError(err.message)
      setCargando(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 max-h-[75vh] overflow-y-auto pr-1">
      {/* Acceso rápido (solo en modo creación) */}
      {!inicial && (
        <div>
          <label className="text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-2 block">
            Acceso rápido
          </label>
          <div className="grid grid-cols-5 gap-1.5">
            {SUSCRIPCIONES_POPULARES.map(p => (
              <button key={p.nombre} type="button" onClick={() => handlePopular(p)}
                className={`flex flex-col items-center gap-1 p-2 rounded-xl border-2 transition-all ${
                  form.nombre === p.nombre
                    ? 'border-[var(--mango)] bg-[var(--mango)]/8'
                    : 'border-zinc-100 dark:border-zinc-800 hover:border-zinc-300'
                }`}>
                <span className="text-lg">{p.icono}</span>
                <span className="text-[9px] font-bold text-zinc-500">{p.nombre}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Campo nombre con búsqueda inteligente */}
      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
          Nombre del servicio *
        </label>
        <div className="flex gap-2 relative">
          {/* Emoji / icono */}
          <div className="w-11 h-11 rounded-xl border-2 border-zinc-200 dark:border-zinc-700
            flex items-center justify-center text-xl flex-shrink-0"
            style={{ background: form.color + '18' }}>
            {form.icono}
          </div>

          <div className="flex-1 relative">
            <input
              type="text"
              value={form.nombre}
              onChange={(e) => {
                set('nombre')(e)
                if (matchCatalogo) {
                  setMatchCatalogo(null)
                  setPrecioOriginal(null)
                  setPrecioModificado(false)
                }
              }}
              placeholder="Ej: Netflix, Spotify, iCloud…"
              required
              autoComplete="off"
              className="w-full bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700
                rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2
                focus:ring-[var(--mango)]/40 text-zinc-900 dark:text-white placeholder:text-zinc-400"
            />

            {/* Sugerencias del catálogo */}
            {mostrarSugerencias && sugerencias.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-zinc-900
                border border-zinc-200 dark:border-zinc-700 rounded-2xl shadow-xl z-50 overflow-hidden">
                {sugerencias.map(s => {
                  const precio = s.planes?.[0]?.precios?.ars_mp
                  return (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => aplicarMatch(s)}
                      className="w-full flex items-center gap-3 px-4 py-3 text-left
                        hover:bg-[var(--mango)]/5 transition-colors border-b
                        border-zinc-50 dark:border-zinc-800 last:border-0"
                    >
                      <div className="w-9 h-9 rounded-xl flex items-center justify-center text-lg flex-shrink-0"
                        style={{ background: s.color + '18' }}>
                        {s.icono}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-zinc-900 dark:text-white leading-tight">
                          {s.nombre}
                        </p>
                        <p className="text-[10px] text-zinc-400 capitalize">
                          {s.ciclo} · {s.planes?.length} plan{s.planes?.length !== 1 ? 'es' : ''}
                        </p>
                      </div>
                      {precio != null && (
                        <span className="text-xs font-bold text-zinc-500 flex-shrink-0">
                          ${Number(precio).toLocaleString('es-AR')}
                        </span>
                      )}
                    </button>
                  )
                })}
                <button
                  type="button"
                  onClick={() => setMostrarSugerencias(false)}
                  className="w-full py-2 text-[10px] text-zinc-400 hover:text-zinc-600 transition-colors"
                >
                  Cerrar ✕
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Badge: encontrado en catálogo */}
        {matchCatalogo && (
          <div className="flex items-center gap-2 px-3 py-2 rounded-xl
            bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800/40">
            <span className="text-emerald-500 text-base">✅</span>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-emerald-700 dark:text-emerald-400 leading-tight">
                Encontrado en el catálogo
              </p>
              <p className="text-[10px] text-emerald-600/70 dark:text-emerald-500/70">
                {matchCatalogo.plan?.nombre} · Precio y ciclo completados automáticamente
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                setMatchCatalogo(null)
                setPrecioOriginal(null)
                setPrecioModificado(false)
              }}
              className="text-[10px] text-emerald-500 hover:text-emerald-700 font-bold"
            >
              ✕
            </button>
          </div>
        )}

        {/* Selector de plan (si hay múltiples) */}
        {matchCatalogo && matchCatalogo.servicio.planes?.length > 1 && (
          <div>
            <label className="text-[10px] font-medium text-zinc-400 mb-1.5 block">
              Plan del servicio
            </label>
            <div className="flex gap-1.5 flex-wrap">
              {matchCatalogo.servicio.planes.map((plan, idx) => {
                const precio = plan.precios?.ars_mp
                const esActivo = matchCatalogo.plan?.id === plan.id
                return (
                  <button
                    key={plan.id}
                    type="button"
                    onClick={() => {
                      setMatchCatalogo(prev => ({ ...prev, plan, planId: plan.id }))
                      if (precio != null) {
                        setForm(f => ({ ...f, monto: String(precio) }))
                        setPrecioOriginal(precio)
                        setPrecioModificado(false)
                      }
                    }}
                    className={`px-2.5 py-1.5 rounded-xl text-[11px] font-bold border-2 transition-all ${
                      esActivo
                        ? 'border-[var(--mango)] bg-[var(--mango)]/10 text-[var(--mango-dark)] dark:text-[var(--mango)]'
                        : 'border-zinc-100 dark:border-zinc-800 text-zinc-500 hover:border-zinc-200'
                    }`}
                  >
                    {plan.nombre}
                    {precio != null && (
                      <span className="ml-1 opacity-70">
                        · ${Number(precio).toLocaleString('es-AR')}
                      </span>
                    )}
                  </button>
                )
              })}
            </div>
          </div>
        )}
      </div>

      {/* Categoría */}
      <Select label="Categoría" value={form.categoria} onChange={set('categoria')}>
        {CATEGORIAS.map(c => <option key={c.id} value={c.id}>{c.icono} {c.label}</option>)}
      </Select>

      {/* Precio, moneda y ciclo */}
      <div className="grid grid-cols-3 gap-3">
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-zinc-500 dark:text-zinc-400">Moneda</label>
          <select value={form.moneda} onChange={handleMonedaChange}
            className="field-base field-select">
            <option value="ARS">$ ARS</option>
            <option value="USD">U$D USD</option>
            <option value="EUR">€ EUR</option>
          </select>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-[11px] font-bold uppercase tracking-widest text-zinc-400 dark:text-zinc-500 pl-1">
            Precio
          </label>
          <div className="relative flex items-center">
            <input
              type="number"
              inputMode="decimal"
              step="0.01"
              min="0.01"
              placeholder="0.00"
              required
              value={form.monto}
              onChange={handleMontoChange}
              className="field-base pl-4"
            />
          </div>
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-zinc-500 dark:text-zinc-400">Ciclo</label>
          <select value={form.ciclo} onChange={handleCicloChange}
            className="field-base field-select">
            <option value="mensual">Mensual</option>
            <option value="trimestral">Trimestral</option>
            <option value="anual">Anual</option>
          </select>
        </div>
      </div>

      {/* Badge: precio modificado (corrección comunitaria) */}
      {precioModificado && (
        <div className="flex items-center gap-2 px-3 py-2 rounded-xl
          bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/40">
          <span className="text-amber-500 text-base">✏️</span>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold text-amber-700 dark:text-amber-400 leading-tight">
              Precio actualizado
            </p>
            <p className="text-[10px] text-amber-600/70 dark:text-amber-500/70">
              Tu corrección se guardará en el catálogo para ayudar a otros usuarios
            </p>
          </div>
        </div>
      )}

      {/* Badge: precio en USD → se registrará */}
      {form.moneda === 'USD' && matchCatalogo && form.monto && (
        <div className="flex items-center gap-2 px-3 py-2 rounded-xl
          bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800/40">
          <span className="text-base">🇺🇸</span>
          <p className="text-[10px] text-blue-700 dark:text-blue-400 leading-relaxed">
            <span className="font-bold">Precio en dólares detectado.</span>{' '}
            Tu valor (U$D {form.monto}) quedará registrado en el catálogo para que otros usuarios vean el precio en USD.
          </p>
        </div>
      )}

      {/* Día de cobro */}
      <Input label="Día de cobro (opcional)" type="number" inputMode="numeric"
        min="1" max="31" placeholder="Ej: 15"
        value={form.dia_cobro} onChange={set('dia_cobro')} />

      {/* Color */}
      <div className="flex flex-col gap-1">
        <label className="text-xs font-medium text-zinc-500 dark:text-zinc-400">Color</label>
        <div className="flex gap-2">
          {COLORES.map(c => (
            <button key={c} type="button" onClick={() => setForm(f => ({ ...f, color: c }))}
              className={`w-7 h-7 rounded-full transition-transform ${form.color === c ? 'scale-125 ring-2 ring-offset-2 ring-offset-white dark:ring-offset-zinc-900 ring-zinc-400' : 'hover:scale-110'}`}
              style={{ backgroundColor: c }} />
          ))}
        </div>
      </div>

      {error && (
        <p className="text-xs text-red-500 bg-red-50 dark:bg-red-900/20 rounded-xl px-3 py-2 border border-red-100 dark:border-red-900">
          {error}
        </p>
      )}

      <div className="flex gap-3 mt-2">
        <Button type="button" variante="secondary" className="flex-1" onClick={onCancel} disabled={cargando}>Cancelar</Button>
        <Button type="submit" className="flex-1" cargando={cargando}>
          {inicial ? 'Guardar cambios' : 'Agregar suscripción'}
        </Button>
      </div>
    </form>
  )
}

function TarjetaSuscripcion({ s, costoMensual, onEditar, onToggle }) {
  const cicloLabel = s.ciclo === 'mensual' ? '/mes' : s.ciclo === 'trimestral' ? '/trim.' : '/año'
  const monedaSimbolo = s.moneda === 'ARS' ? '$' : s.moneda === 'USD' ? 'U$D' : '€'

  return (
    <div className={`flex items-center gap-4 p-4 rounded-2xl border transition-all group
      ${s.activa
        ? 'bg-white dark:bg-zinc-900 border-zinc-100 dark:border-zinc-800'
        : 'bg-zinc-50/50 dark:bg-zinc-900/50 border-zinc-100 dark:border-zinc-800 opacity-60'}`}>
      <div className="w-11 h-11 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
        style={{ background: s.color + '20' }}>
        {s.icono}
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-bold text-sm text-zinc-900 dark:text-white truncate leading-tight">
          {s.nombre}
          {s.plan && <span className="text-zinc-400 font-normal ml-1 text-xs">({s.plan})</span>}
        </p>
        <p className="text-xs text-zinc-400 mt-0.5">
          {monedaSimbolo}{Number(s.monto).toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}{cicloLabel}
          {s.dia_cobro && ` · día ${s.dia_cobro}`}
          {s.notas && ` · ${s.notas}`}
        </p>
      </div>
      <div className="flex items-center gap-2 flex-shrink-0">
        <div className="text-right">
          <p className="text-sm font-bold" style={{ color: s.activa ? s.color : '#9CA3AF' }}>
            {fmtMes(costoMensual)}/mes
          </p>
          <p className="text-[10px] text-zinc-400">aprox. ARS</p>
        </div>
        {/* Toggle activa */}
        <button onClick={onToggle}
          className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full
            border-2 border-transparent transition-colors duration-200
            ${s.activa ? 'bg-[var(--mango)]' : 'bg-zinc-200 dark:bg-zinc-700'}`}
          title={s.activa ? 'Pausar' : 'Activar'}>
          <span className={`pointer-events-none flex h-5 w-5 items-center justify-center rounded-full bg-white shadow
            transform transition-transform ${s.activa ? 'translate-x-5' : 'translate-x-0'}`}>
            <span className="text-[10px]">{s.activa ? '✓' : '·'}</span>
          </span>
        </button>
        {/* Editar */}
        <button onClick={onEditar}
          className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200
            hover:bg-zinc-100 dark:hover:bg-zinc-800 opacity-0 group-hover:opacity-100 transition-all">
          ✏️
        </button>
      </div>
    </div>
  )
}

export function SuscripcionesPage() {
  const { usuario } = useAuthContext()
  const { suscripciones, resumen, cargando, crear, editar, borrar, toggleActiva } = useSuscripciones()
  const [tab, setTab]                     = useState('mis')
  const [modalNuevo, setModalNuevo]       = useState(false)
  const [seleccionada, setSeleccionada]   = useState(null)
  const [exito, setExito]                 = useState(null)

  const handleGuardar = async (datos) => {
    if (seleccionada) {
      await editar(seleccionada.id, datos)
    } else {
      await crear({ ...datos, usuario_id: usuario?.id })
    }
    setModalNuevo(false)
    setSeleccionada(null)
  }

  const handleAgregarDesdeCatalogo = async (datos) => {
    try {
      await crear({ ...datos, usuario_id: usuario?.id })
      setExito(datos.nombre)
      setTimeout(() => setExito(null), 3000)
    } catch (err) {
      console.error(err)
    }
  }

  const handleEliminar = async () => {
    if (!seleccionada) return
    if (window.confirm(`¿Eliminás "${seleccionada.nombre}"?`)) {
      await borrar(seleccionada.id)
      setSeleccionada(null)
      setModalNuevo(false)
    }
  }

  return (
    <div className="animate-in fade-in duration-500">
      <PageWrapper>
        <PageHeader
          titulo="📱 Suscripciones"
          subtitulo="¿Cuánto gastás en servicios digitales?"
          accion={
            <div className="flex gap-2">
              {suscripciones.length > 0 && tab === 'mis' && (
                <Button variante="secondary" tamaño="sm"
                  onClick={() => exportarSuscripcionesCSV(suscripciones)}>
                  📤
                </Button>
              )}
              {tab === 'mis' && (
                <Button icono="+" onClick={() => { setSeleccionada(null); setModalNuevo(true) }}>
                  Agregar
                </Button>
              )}
            </div>
          }
        />

        {/* Tabs */}
        <div className="flex bg-zinc-100 dark:bg-zinc-800 rounded-xl p-1 mb-5">
          <button
            onClick={() => setTab('mis')}
            className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-colors ${
              tab === 'mis'
                ? 'bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white shadow-sm'
                : 'text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'
            }`}
          >
            📱 Mis suscripciones
            {suscripciones.length > 0 && (
              <span className="ml-1.5 text-[10px] bg-zinc-200 dark:bg-zinc-700 px-1.5 py-0.5 rounded-full">
                {suscripciones.filter(s => s.activa).length}
              </span>
            )}
          </button>
          <button
            onClick={() => setTab('catalogo')}
            className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-colors ${
              tab === 'catalogo'
                ? 'bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white shadow-sm'
                : 'text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'
            }`}
          >
            🏪 Catálogo
          </button>
        </div>

        {/* Toast de éxito */}
        {exito && (
          <div className="mb-4 flex items-center gap-2 px-4 py-3 bg-emerald-50 dark:bg-emerald-900/20
            border border-emerald-200 dark:border-emerald-800/40 rounded-2xl text-sm
            text-emerald-700 dark:text-emerald-400 font-medium animate-in slide-in-from-top-2">
            ✅ {exito} agregado a tus suscripciones
          </div>
        )}

        {/* ── Mis suscripciones ── */}
        {tab === 'mis' && (
          <>
            {resumen.activas > 0 && (
              <div className="grid grid-cols-3 gap-3 mb-5">
                <div className="bg-purple-50 dark:bg-purple-900/15 border border-purple-100 dark:border-purple-900/20 rounded-2xl p-3">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400 mb-0.5">Activas</p>
                  <p className="text-2xl font-black text-purple-700 dark:text-purple-400">{resumen.activas}</p>
                </div>
                <div className="bg-red-50 dark:bg-red-900/15 border border-red-100 dark:border-red-900/20 rounded-2xl p-3">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-red-600 dark:text-red-400 mb-0.5">Por mes</p>
                  <p className="text-lg font-black text-red-700 dark:text-red-400 leading-tight">
                    ${Math.round(resumen.totalMensualARS / 1000)}K
                  </p>
                  <p className="text-[9px] text-red-500/60">
                    ${Number(resumen.totalMensualARS).toLocaleString('es-AR', { maximumFractionDigits: 0 })}
                  </p>
                </div>
                <div className="bg-amber-50 dark:bg-amber-900/15 border border-amber-100 dark:border-amber-900/20 rounded-2xl p-3">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400 mb-0.5">Al año</p>
                  <p className="text-lg font-black text-amber-700 dark:text-amber-400 leading-tight">
                    ${Math.round(resumen.totalAnualARS / 1000)}K
                  </p>
                </div>
              </div>
            )}

            {cargando ? (
              <div className="flex flex-col gap-3">
                {[0,1,2].map(i => <div key={i} className="h-20 bg-zinc-100 dark:bg-zinc-800 rounded-2xl animate-pulse" />)}
              </div>
            ) : suscripciones.length === 0 ? (
              <div className="flex flex-col gap-4">
                <div className="text-center py-8">
                  <p className="text-3xl mb-2">📱</p>
                  <p className="font-semibold text-zinc-700 dark:text-zinc-300 mb-1">Sin suscripciones todavía</p>
                  <p className="text-xs text-zinc-400 mb-4">
                    Agregá desde el catálogo o escribí el nombre para que el sistema lo busque automáticamente
                  </p>
                  <div className="flex gap-3 justify-center">
                    <Button variante="secondary" onClick={() => setTab('catalogo')}>
                      🏪 Ver catálogo
                    </Button>
                    <Button icono="+" onClick={() => setModalNuevo(true)}>
                      Agregar
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {resumen.detalle.map(s => (
                  <TarjetaSuscripcion
                    key={s.id}
                    s={s}
                    costoMensual={s.costoMensualARS}
                    onEditar={() => { setSeleccionada(s); setModalNuevo(true) }}
                    onToggle={() => toggleActiva(s.id)}
                  />
                ))}
                {suscripciones.filter(s => !s.activa).map(s => {
                  const costoMensual = s.ciclo === 'mensual' ? s.monto : s.ciclo === 'trimestral' ? s.monto / 3 : s.monto / 12
                  return (
                    <TarjetaSuscripcion
                      key={s.id}
                      s={s}
                      costoMensual={costoMensual * (s.moneda === 'ARS' ? 1 : 1300)}
                      onEditar={() => { setSeleccionada(s); setModalNuevo(true) }}
                      onToggle={() => toggleActiva(s.id)}
                    />
                  )
                })}
              </div>
            )}
          </>
        )}

        {/* ── Catálogo ── */}
        {tab === 'catalogo' && (
          <CatalogoSuscripciones onAgregarSuscripcion={handleAgregarDesdeCatalogo} />
        )}
      </PageWrapper>

      <Modal
        abierto={modalNuevo}
        onCerrar={() => { setModalNuevo(false); setSeleccionada(null) }}
        titulo={seleccionada ? 'Editar suscripción' : 'Nueva suscripción'}
        ancho="max-w-md"
      >
        <FormSuscripcion
          inicial={seleccionada}
          onSubmit={handleGuardar}
          onCancel={() => { setModalNuevo(false); setSeleccionada(null) }}
        />
        {seleccionada && (
          <button onClick={handleEliminar}
            className="w-full mt-3 py-2.5 rounded-xl text-sm font-medium text-red-500
              hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
            🗑️ Eliminar esta suscripción
          </button>
        )}
      </Modal>
    </div>
  )
}