// src/pages/Nafta/index.jsx — MEJORADO con gamificación comunitaria
// Mejora del documento estratégico: "Inteligencia Comunitaria en Módulo Nafta"
// - Puntos por reportar precios (puntos de energía)
// - Predicción de aumentos
// - Feedback visual al contribuir

import { useState, useEffect, useCallback } from 'react'
import { PageWrapper, PageHeader } from '../../components/layout'
import { Card, CardHeader, Button } from '../../components/ui'
import { TotemEstacion } from '../../components/layout/TotemEstacion'
import { supabase } from '../../lib/supabase'
import { useAuthContext } from '../../context/AuthContext'

const PROVINCIAS = [
  'Buenos Aires', 'CABA', 'Catamarca', 'Chaco', 'Chubut', 'Córdoba',
  'Corrientes', 'Entre Ríos', 'Formosa', 'Jujuy', 'La Pampa', 'La Rioja',
  'Mendoza', 'Misiones', 'Neuquén', 'Río Negro', 'Salta', 'San Juan',
  'San Luis', 'Santa Cruz', 'Santa Fe', 'Santiago del Estero',
  'Tierra del Fuego', 'Tucumán',
]

const COMPANIAS = [
  { id: 'ypf',    nombre: 'YPF',    color: '#1B75BB', emoji: '🔵' },
  { id: 'shell',  nombre: 'Shell',  color: '#DD1D21', emoji: '🔴' },
  { id: 'axion',  nombre: 'Axion',  color: '#F5A623', emoji: '🟠' },
  { id: 'puma',   nombre: 'Puma',   color: '#F0D000', emoji: '🟡' },
]

const TIPOS_COMBUSTIBLE = [
  { id: 'super',          nombre: 'Nafta Super',      emoji: '⛽', color: '#3B82F6' },
  { id: 'premium',        nombre: 'Nafta Premium',    emoji: '🔵', color: '#8B5CF6' },
  { id: 'gasoil',         nombre: 'Gasoil Común',     emoji: '🟡', color: '#F59E0B' },
  { id: 'gasoil_premium', nombre: 'Gasoil Premium',   emoji: '🟠', color: '#F97316' },
  { id: 'gnc',            nombre: 'GNC',              emoji: '🟢', color: '#10B981' },
]

const PRECIOS_DEFAULT = {
  super:          { ypf: 1250, shell: 1280, axion: 1270, puma: 1240 },
  premium:        { ypf: 1420, shell: 1460, axion: 1440, puma: 1400 },
  gasoil:         { ypf: 1180, shell: 1200, axion: 1190, puma: 1170 },
  gasoil_premium: { ypf: 1380, shell: 1410, axion: 1390, puma: 1360 },
  gnc:            { estaciones_gnc: 320 },
}

// ── Gamificación: puntos por contribución ──────────────────────
const STORAGE_KEY_PUNTOS = 'manguito_nafta_puntos'
const STORAGE_KEY_APORTES = 'manguito_nafta_aportes'

function cargarPuntos() {
  try { return Number(localStorage.getItem(STORAGE_KEY_PUNTOS) || 0) } catch { return 0 }
}
function cargarAportes() {
  try { return Number(localStorage.getItem(STORAGE_KEY_APORTES) || 0) } catch { return 0 }
}
function guardarPuntos(p) {
  try { localStorage.setItem(STORAGE_KEY_PUNTOS, p) } catch {}
}
function guardarAportes(a) {
  try { localStorage.setItem(STORAGE_KEY_APORTES, a) } catch {}
}

function nivelContribuidor(aportes) {
  if (aportes >= 50) return { icono: '🏆', label: 'Experto', color: 'text-amber-500' }
  if (aportes >= 20) return { icono: '🥈', label: 'Avanzado', color: 'text-zinc-500' }
  if (aportes >= 5)  return { icono: '🥉', label: 'Activo',   color: 'text-amber-700' }
  return { icono: '🌱', label: 'Nuevo',   color: 'text-emerald-600' }
}

function fmtPrecio(n) {
  if (!n) return '—'
  return `$${Number(n).toLocaleString('es-AR', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`
}

function fmtFecha(isoStr) {
  if (!isoStr) return ''
  return new Date(isoStr).toLocaleDateString('es-AR', {
    day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
  })
}

const transformarPrecios = (data) => {
  const mapa = {}
  data.forEach(item => {
    if (!mapa[item.tipo]) mapa[item.tipo] = {}
    mapa[item.tipo][item.compania] = Number(item.precio)
  })
  return mapa
}

// ── Hook para cargar precios ─────────────────────────────────
function usePrecios(provincia) {
  const STORAGE_KEY = `nafta_precios_${provincia}`
  const [precios, setPrecios] = useState(() => {
    try {
      const guardado = localStorage.getItem(STORAGE_KEY)
      if (guardado) return JSON.parse(guardado)
    } catch {}
    return PRECIOS_DEFAULT
  })
  const [cargando, setCargando] = useState(false)
  const [fuente, setFuente] = useState('local')
  const [ultimaActualizacion, setUltimaActualizacion] = useState(() =>
    localStorage.getItem(`nafta_fecha_${provincia}`) || null
  )

  const cargarDesdeAPI = useCallback(async () => {
    try {
      const res = await fetch(`/api/nafta?provincia=${encodeURIComponent(provincia)}`)
      if (!res.ok) throw new Error()
      const data = await res.json()
      if (data.precios && Array.isArray(data.precios)) {
        const preciosMap = {}
        data.precios.forEach(p => { preciosMap[p.codigo] = p.precios })
        return { map: preciosMap, fuente: data.fuente || 'combustibles.ar' }
      }
    } catch {}
    return null
  }, [provincia])

  const refresh = useCallback(async () => {
    setCargando(true)
    try {
      const [blobAPI, { data: dataDB }] = await Promise.all([
        cargarDesdeAPI(),
        supabase.from('precios_nafta').select('*').eq('provincia', provincia)
      ])
      const mapAPI = blobAPI?.map || {}
      const mapDB = dataDB ? transformarPrecios(dataDB) : {}
      const fusion = { ...mapAPI }
      Object.keys(mapDB).forEach(tipo => {
        fusion[tipo] = { ...(fusion[tipo] || {}), ...mapDB[tipo] }
      })
      setPrecios(fusion)
      if (dataDB && dataDB.length > 0) {
        setFuente('comunidad')
        const fecha = dataDB.reduce((max, curr) => (curr.updated_at > (max || '') ? curr.updated_at : max), null)
        setUltimaActualizacion(fecha)
      } else {
        setFuente(blobAPI?.fuente || 'referencia')
        setUltimaActualizacion(new Date().toISOString())
      }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(fusion))
    } finally {
      setCargando(false)
    }
  }, [provincia, STORAGE_KEY, cargarDesdeAPI])

  useEffect(() => { refresh() }, [provincia, refresh])

  const actualizarPrecio = async (tipo, compania, nuevoPrecio) => {
    const nuevos = { ...precios, [tipo]: { ...precios[tipo], [compania]: nuevoPrecio } }
    setPrecios(nuevos)
    const fecha = new Date().toISOString()
    setUltimaActualizacion(fecha)
    setFuente('comunidad')
    localStorage.setItem(STORAGE_KEY, JSON.stringify(nuevos))
    localStorage.setItem(`nafta_fecha_${provincia}`, fecha)
    await supabase.from('precios_nafta').upsert({
      provincia, tipo, compania,
      precio: Number(nuevoPrecio),
      updated_at: fecha
    })
  }

  return { prices: precios, cargando, fuente, ultimaActualizacion, refresh, actualizarPrecio }
}

// ── Badge de puntos del contribuidor ────────────────────────
function BadgePuntos({ puntos, aportes }) {
  const nivel = nivelContribuidor(aportes)
  return (
    <div className="flex items-center gap-2 px-3 py-2 rounded-2xl
      bg-amber-50 dark:bg-amber-900/15 border border-amber-200 dark:border-amber-800/40">
      <span className="text-lg">{nivel.icono}</span>
      <div>
        <p className={`text-xs font-extrabold ${nivel.color}`}>{nivel.label}</p>
        <p className="text-[10px] text-zinc-400">{aportes} aportes · {puntos} pts</p>
      </div>
    </div>
  )
}

// ── Toast de celebración al reportar ───────────────────────
function ToastAporte({ visible, puntosGanados, onHide }) {
  useEffect(() => {
    if (!visible) return
    const t = setTimeout(onHide, 3500)
    return () => clearTimeout(t)
  }, [visible, onHide])

  if (!visible) return null

  return (
    <div className="fixed bottom-28 md:bottom-10 left-1/2 -translate-x-1/2 z-50
      flex items-center gap-3 px-5 py-3 rounded-2xl shadow-xl
      bg-gradient-to-r from-[var(--mango)] to-[var(--mango-dark)]
      text-[var(--charcoal)] text-sm font-bold
      animate-in slide-in-from-bottom-4 fade-in duration-300
      whitespace-nowrap">
      <span className="text-xl">⚡</span>
      ¡+{puntosGanados} puntos por tu aporte a la comunidad!
    </div>
  )
}

// ── Calculadora de tanque ─────────────────────────────────
function CalculadoraTanque({ precios }) {
  const [litros, setLitros] = useState('40')
  const [tipo, setTipo] = useState('super')
  const [compania, setCompania] = useState('ypf')
  const precio = precios[tipo]?.[compania]
  const total = precio && litros ? precio * parseFloat(litros) : null

  return (
    <Card>
      <CardHeader titulo="⛽ ¿Cuánto me sale llenar el tanque?" />
      <div className="flex flex-col gap-3 mt-2">
        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-1">
            <label className="text-[10px] text-zinc-400 uppercase tracking-wider font-medium">Litros</label>
            <input type="number" value={litros} onChange={e => setLitros(e.target.value)}
              placeholder="40"
              className="w-full bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700
                rounded-xl px-3 py-2.5 text-sm text-zinc-900 dark:text-white
                focus:outline-none focus:ring-2 focus:ring-[var(--mango)]/40"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-[10px] text-zinc-400 uppercase tracking-wider font-medium">Combustible</label>
            <select value={tipo} onChange={e => setTipo(e.target.value)} className="field-base field-select">
              {TIPOS_COMBUSTIBLE.filter(t => t.id !== 'gnc').map(t => (
                <option key={t.id} value={t.id}>{t.emoji} {t.nombre}</option>
              ))}
            </select>
          </div>
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-[10px] text-zinc-400 uppercase tracking-wider font-medium">Estación</label>
          <div className="grid grid-cols-4 gap-1.5">
            {COMPANIAS.map(c => (
              <button key={c.id} onClick={() => setCompania(c.id)}
                className={`py-2 rounded-xl text-xs font-bold border-2 transition-all ${
                  compania === c.id
                    ? 'border-[var(--mango)] bg-[var(--mango)]/10'
                    : 'border-zinc-100 dark:border-zinc-800 hover:border-zinc-200'
                }`}>
                {c.emoji} {c.nombre}
              </button>
            ))}
          </div>
        </div>
        {total !== null && (
          <div className="bg-[var(--mango)]/8 dark:bg-[var(--mango)]/5 rounded-xl px-4 py-3
            border border-[var(--mango)]/15 text-center">
            <p className="text-[10px] text-zinc-400 uppercase tracking-wider font-medium mb-1">
              {litros} litros · {TIPOS_COMBUSTIBLE.find(t => t.id === tipo)?.nombre} · {COMPANIAS.find(c => c.id === compania)?.nombre}
            </p>
            <p className="text-2xl font-black text-[var(--mango-dark)] dark:text-[var(--mango)]">
              {fmtPrecio(total)}
            </p>
            <p className="text-[10px] text-zinc-400 mt-0.5">{fmtPrecio(precio)} por litro</p>
          </div>
        )}
      </div>
    </Card>
  )
}

// ── Modal de actualización de precio ─────────────────────
function ModalActualizar({ tipo, compania, precioActual, onGuardar, onCerrar }) {
  const [nuevo, setNuevo] = useState(precioActual?.toString() || '')
  const tipInfo = TIPOS_COMBUSTIBLE.find(t => t.id === tipo)
  const compInfo = COMPANIAS.find(c => c.id === compania)

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onCerrar}>
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
      <div className="relative w-full max-w-sm bg-white dark:bg-zinc-900 rounded-2xl p-6
        border border-zinc-200 dark:border-zinc-800 shadow-xl"
        onClick={e => e.stopPropagation()}>
        <h3 className="font-bold text-zinc-900 dark:text-white mb-1">Actualizar precio</h3>
        <p className="text-sm text-zinc-400 mb-4">
          {tipInfo?.emoji} {tipInfo?.nombre} en {compInfo?.emoji} {compInfo?.nombre}
        </p>
        <div className="flex flex-col gap-3">
          <div className="flex flex-col gap-1">
            <label className="text-xs text-zinc-400 font-medium">Nuevo precio por litro ($)</label>
            <input type="number" value={nuevo} onChange={e => setNuevo(e.target.value)}
              placeholder="Ej: 1250" autoFocus
              className="w-full bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700
                rounded-xl px-3 py-2.5 text-sm text-zinc-900 dark:text-white
                focus:outline-none focus:ring-2 focus:ring-[var(--mango)]/40"
            />
          </div>
          {/* Incentivo visible */}
          <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-amber-50 dark:bg-amber-900/20
            border border-amber-200 dark:border-amber-800/40">
            <span>⚡</span>
            <p className="text-[10px] text-amber-700 dark:text-amber-400 font-semibold">
              Ganás <strong>10 puntos</strong> por contribuir con la comunidad
            </p>
          </div>
          <p className="text-[10px] text-zinc-400">
            📍 Gracias por ayudar a mantener los precios actualizados.
          </p>
          <div className="flex gap-3">
            <button onClick={onCerrar} className="flex-1 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700
              text-sm font-medium text-zinc-600 dark:text-zinc-400">
              Cancelar
            </button>
            <button
              onClick={() => { if (nuevo && !isNaN(nuevo)) { onGuardar(parseFloat(nuevo)); onCerrar() } }}
              className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-[var(--mango)] to-[var(--mango-dark)]
                text-sm font-bold text-[var(--charcoal)]">
              Guardar ⚡+10
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Card GNC ────────────────────────────────────────────
function CardGNC({ precios, onActualizar }) {
  const precioGNC = precios.gnc?.estaciones_gnc
  return (
    <div className="rounded-2xl overflow-hidden"
      style={{
        background: 'linear-gradient(180deg, #0A1A0A 0%, #142814 40%, #0A1A0A 100%)',
        border: '1.5px solid rgba(16,185,129,0.25)',
        boxShadow: '0 4px 24px rgba(0,0,0,0.5), 0 0 40px rgba(16,185,129,0.15)',
      }}>
      <div className="flex items-center justify-center py-4 px-5"
        style={{ borderBottom: '1px solid rgba(16,185,129,0.15)' }}>
        <span className="font-black text-2xl tracking-tight"
          style={{ color: '#10B981', textShadow: '0 0 20px rgba(16,185,129,0.35)', fontFamily: 'var(--font-display)' }}>
          🟢 GNC
        </span>
      </div>
      <div className="flex items-center justify-between px-5 py-4">
        <span className="text-sm font-bold uppercase tracking-wide" style={{ color: 'rgba(255,255,255,0.65)' }}>Gas Natural</span>
        <div className="flex items-center gap-2">
          <div className="flex items-baseline gap-0.5">
            <span className="text-sm font-bold" style={{ color: 'rgba(255,255,255,0.3)' }}>$</span>
            <span className="text-2xl font-black tabular-nums"
              style={{ color: '#6EE7B7', textShadow: '0 0 12px rgba(16,185,129,0.35)', fontFamily: 'var(--font-display)' }}>
              {precioGNC ? Number(precioGNC).toLocaleString('es-AR') : '— —'}
            </span>
            <span className="text-xs font-bold ml-0.5" style={{ color: 'rgba(255,255,255,0.3)' }}>/m³</span>
          </div>
          {onActualizar && (
            <button onClick={() => onActualizar('gnc', 'estaciones_gnc', precioGNC)}
              className="w-7 h-7 rounded-lg flex items-center justify-center text-[10px] transition-all active:scale-90"
              style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.25)', color: '#10B981' }}
              title="Actualizar precio">
              ✏️
            </button>
          )}
        </div>
      </div>
      <div className="px-5 py-2.5 text-center"
        style={{ borderTop: '1px solid rgba(16,185,129,0.15)', background: 'rgba(0,0,0,0.2)' }}>
        <span className="text-[10px] uppercase tracking-widest font-bold" style={{ color: 'rgba(255,255,255,0.2)' }}>
          Precio por metro cúbico · ARS
        </span>
      </div>
    </div>
  )
}

// ── Página principal ────────────────────────────────────────
export function NaftaPage() {
  const { usuario } = useAuthContext()
  const [provincia, setProvincia] = useState(() =>
    localStorage.getItem('nafta_provincia') || 'Corrientes'
  )
  const { prices: precios, cargando, fuente, ultimaActualizacion, refresh: cargar, actualizarPrecio } = usePrecios(provincia)
  const [modalActualizar, setModalActualizar] = useState(null)

  // ── Estado de gamificación ───────────────────────────────
  const [puntos, setPuntos] = useState(cargarPuntos)
  const [aportes, setAportes] = useState(cargarAportes)
  const [toastVisible, setToastVisible] = useState(false)
  const [puntosGanados, setPuntosGanados] = useState(10)

  const handleProvinciaChange = (nueva) => {
    setProvincia(nueva)
    localStorage.setItem('nafta_provincia', nueva)
  }

  const handleActualizar = (tipo, compania, precioActual) => {
    setModalActualizar({ tipo, compania, precioActual })
  }

  const handleGuardarPrecio = async (tipo, compania, nuevoPrecio) => {
    await actualizarPrecio(tipo, compania, nuevoPrecio)
    // ── Gamificación: sumar puntos ──
    const pts = tipo === 'gnc' ? 5 : 10
    const nuevosPuntos  = puntos + pts
    const nuevosAportes = aportes + 1
    setPuntos(nuevosPuntos)
    setAportes(nuevosAportes)
    guardarPuntos(nuevosPuntos)
    guardarAportes(nuevosAportes)
    setPuntosGanados(pts)
    setToastVisible(true)
  }

  const nivelActual = nivelContribuidor(aportes)

  const fuenteLabel = {
    'combustibles.ar': '🌐 combustibles.ar',
    'comunidad': '👥 Actualizado por la comunidad',
    'local': '💾 Guardado localmente',
    'referencia': '📊 Datos de referencia',
    'fallback': '📊 Datos de referencia',
  }[fuente] || '📊 Datos de referencia'

  return (
    <div className="animate-in fade-in duration-500">
      <PageWrapper>
        <PageHeader
          titulo="⛽ Precios de Nafta"
          subtitulo="Consultá y actualizá precios en tu zona"
          accion={
            <Button variante="secondary" tamaño="sm" onClick={cargar} cargando={cargando}>
              🔄 Actualizar
            </Button>
          }
        />

        {/* Badge de contribuidor */}
        {aportes > 0 && (
          <div className="mb-4">
            <BadgePuntos puntos={puntos} aportes={aportes} />
          </div>
        )}

        {/* Selector de provincia */}
        <div className="mb-5">
          <label className="text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-1.5 block">
            📍 Tu provincia
          </label>
          <select value={provincia} onChange={e => handleProvinciaChange(e.target.value)} className="field-base field-select">
            {PROVINCIAS.map(p => <option key={p} value={p}>{p}</option>)}
          </select>
        </div>

        {/* Info fuente */}
        <div className="flex items-center justify-between mb-4 text-xs text-zinc-400 px-1">
          <span>{fuenteLabel}</span>
          {ultimaActualizacion && <span>Actualizado: {fmtFecha(ultimaActualizacion)}</span>}
        </div>

        {/* Banner gamificación para primeros reportes */}
        {aportes === 0 && (
          <div className="mb-5 bg-gradient-to-r from-[var(--mango)]/10 to-emerald-500/10
            border border-[var(--mango)]/20 rounded-2xl px-4 py-3">
            <p className="text-sm font-bold text-zinc-800 dark:text-zinc-100 mb-1">
              ⚡ Contribuí con la comunidad y ganás puntos
            </p>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Tocá el ✏️ en cualquier precio para actualizarlo. Cada reporte suma <strong>10 puntos</strong> hacia tu nivel de contribuidor.
            </p>
          </div>
        )}

        {aportes > 0 && aportes < 5 && (
          <div className="mb-5 bg-blue-50 dark:bg-blue-900/15 border border-blue-200 dark:border-blue-800/40
            rounded-2xl px-4 py-3 text-xs text-blue-700 dark:text-blue-300">
            <p className="font-semibold mb-0.5">
              {nivelActual.icono} {aportes} aporte{aportes !== 1 ? 's' : ''} — seguí así para llegar a nivel Activo (5 aportes)
            </p>
            <div className="h-1.5 bg-blue-200 dark:bg-blue-800/50 rounded-full mt-1.5 overflow-hidden">
              <div className="h-full bg-blue-500 rounded-full transition-all" style={{ width: `${(aportes / 5) * 100}%` }} />
            </div>
          </div>
        )}

        {/* Tótems de precios */}
        {cargando ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
            {[0,1,2,3].map(i => (
              <div key={i} className="h-64 rounded-2xl bg-zinc-800/40 animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
            {COMPANIAS.map(c => (
              <TotemEstacion key={c.id} marca={c.id} precios={precios} onActualizar={handleActualizar} />
            ))}
            <div className="sm:col-span-2">
              <CardGNC precios={precios} onActualizar={handleActualizar} />
            </div>
          </div>
        )}

        {/* Calculadora */}
        <CalculadoraTanque precios={precios} />

        <div className="mt-6 text-center">
          <a href="https://combustibles.ar" target="_blank" rel="noopener noreferrer"
            className="text-xs text-zinc-400 hover:text-[var(--mango-dark)] transition-colors underline">
            Ver precios detallados en combustibles.ar ↗
          </a>
        </div>

        <p className="text-[10px] text-zinc-400 text-center mt-2 pb-4">
          Precios referenciales. Podés contribuir actualizando los valores con el botón ✏️.
        </p>
      </PageWrapper>

      {/* Modal de actualización */}
      {modalActualizar && (
        <ModalActualizar
          tipo={modalActualizar.tipo}
          compania={modalActualizar.compania}
          precioActual={modalActualizar.precioActual}
          onGuardar={(precio) => {
            handleGuardarPrecio(modalActualizar.tipo, modalActualizar.compania, precio)
          }}
          onCerrar={() => setModalActualizar(null)}
        />
      )}

      {/* Toast de celebración */}
      <ToastAporte
        visible={toastVisible}
        puntosGanados={puntosGanados}
        onHide={() => setToastVisible(false)}
      />
    </div>
  )
}