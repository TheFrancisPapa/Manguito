import { useState, useEffect, useCallback } from 'react'
import { PageWrapper, PageHeader } from '../../components/layout'
import { Card, CardHeader, Button } from '../../components/ui'
import { supabase } from '../../api/supabase'

// ── Provincias argentinas ────────────────────────────────────
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
  { id: 'super',         nombre: 'Nafta Super',      emoji: '⛽', color: '#3B82F6' },
  { id: 'premium',       nombre: 'Nafta Premium',    emoji: '🔵', color: '#8B5CF6' },
  { id: 'gasoil',        nombre: 'Gasoil Común',     emoji: '🟡', color: '#F59E0B' },
  { id: 'gasoil_premium',nombre: 'Gasoil Premium',   emoji: '🟠', color: '#F97316' },
  { id: 'gnc',           nombre: 'GNC',              emoji: '🟢', color: '#10B981' },
]

// ── Precios hardcodeados (fallback mientras carga o si falla el proxy) ────────
const PRECIOS_DEFAULT = {
  super:          { ypf: 1250, shell: 1280, axion: 1270, puma: 1240 },
  premium:        { ypf: 1420, shell: 1460, axion: 1440, puma: 1400 },
  gasoil:         { ypf: 1180, shell: 1200, axion: 1190, puma: 1170 },
  gasoil_premium: { ypf: 1380, shell: 1410, axion: 1390, puma: 1360 },
  gnc:            { estaciones_gnc: 320 },
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
  const [ultimaActualizacion, setUltimaActualizacion] = useState(() => {
    return localStorage.getItem(`nafta_fecha_${provincia}`) || null
  })

  // Transforma datos planos de la DB al formato anidado de la app
  const transformarPrecios = (data) => {
    const mapa = {}
    data.forEach(item => {
      if (!mapa[item.tipo]) mapa[item.tipo] = {}
      mapa[item.tipo][item.compania] = Number(item.precio)
    })
    return mapa
  }

  // 1. Cargar desde la base comunitaria de Supabase
  const cargarDesdeDB = useCallback(async () => {
    const { data, error } = await supabase
      .from('precios_nafta')
      .select('*')
      .eq('provincia', provincia)

    if (data && data.length > 0) {
      const preciosMap = transformarPrecios(data)
      setPrecios(preciosMap)
      setFuente('comunidad')
      // Buscamos la fecha más reciente de los items traídos
      const fecha = data.reduce((max, curr) => (curr.updated_at > (max || '') ? curr.updated_at : max), null)
      setUltimaActualizacion(fecha)
      localStorage.setItem(STORAGE_KEY, JSON.stringify(preciosMap))
      localStorage.setItem(`nafta_fecha_${provincia}`, fecha)
      return true
    }
    return false
  }, [provincia, STORAGE_KEY])

  // 2. Cargar desde API externa (y actualizar la DB)
  const cargarDesdeAPI = useCallback(async () => {
    setCargando(true)
    try {
      const res = await fetch(`/api/nafta?provincia=${encodeURIComponent(provincia)}`)
      if (!res.ok) throw new Error('Error del servidor')
      const data = await res.json()

      if (data.precios && Array.isArray(data.precios)) {
        const preciosMap = {}
        const itemsParaDB = []
        const ahora = new Date().toISOString()

        data.precios.forEach(p => {
          preciosMap[p.codigo] = p.precios
          // Preparamos items para guardar en la base compartida
          Object.entries(p.precios).forEach(([compania, precio]) => {
            itemsParaDB.push({
              provincia,
              tipo: p.codigo,
              compania,
              precio: Number(precio),
              updated_at: ahora
            })
          })
        })

        setPrecios(preciosMap)
        setFuente(data.fuente || 'combustibles.ar')
        setUltimaActualizacion(ahora)
        localStorage.setItem(STORAGE_KEY, JSON.stringify(preciosMap))
        localStorage.setItem(`nafta_fecha_${provincia}`, ahora)

        // Actualizamos la base comunitaria de fondo
        supabase.from('precios_nafta').upsert(itemsParaDB).then()
        
        return true
      }
    } catch (err) {
      console.error("Error cargando API:", err)
      setFuente('local')
    } finally {
      setCargando(false)
    }
    return false
  }, [provincia, STORAGE_KEY])

  // Lógica de carga inicial: DB -> API
  useEffect(() => {
    const iniciar = async () => {
      const hayEnDB = await cargarDesdeDB()
      if (!hayEnDB) {
        await cargarDesdeAPI()
      }
    }
    iniciar()
  }, [provincia, cargarDesdeDB, cargarDesdeAPI])

  // Actualizar un precio manualmente
  const actualizarPrecio = async (tipo, compania, nuevoPrecio) => {
    const nuevos = { ...precios, [tipo]: { ...precios[tipo], [compania]: nuevoPrecio } }
    setPrecios(nuevos)
    const fecha = new Date().toISOString()
    setUltimaActualizacion(fecha)
    setFuente('comunidad')
    localStorage.setItem(STORAGE_KEY, JSON.stringify(nuevos))
    localStorage.setItem(`nafta_fecha_${provincia}`, fecha)

    // Guardar en la base de datos para que sea compartido
    await supabase.from('precios_nafta').upsert({
      provincia,
      tipo,
      compania,
      precio: Number(nuevoPrecio),
      updated_at: fecha
    })
  }

  return { prices: precios, cargando, fuente, ultimaActualizacion, refresh: cargarDesdeAPI, actualizarPrecio }
}

// ── Calculadora de tanque ────────────────────────────────────
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
            <input
              type="number"
              value={litros}
              onChange={e => setLitros(e.target.value)}
              placeholder="40"
              className="w-full bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700
                rounded-xl px-3 py-2.5 text-sm text-zinc-900 dark:text-white
                focus:outline-none focus:ring-2 focus:ring-[var(--mango)]/40"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-[10px] text-zinc-400 uppercase tracking-wider font-medium">Combustible</label>
            <select
              value={tipo}
              onChange={e => setTipo(e.target.value)}
              className="w-full bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700
                rounded-xl px-3 py-2.5 text-sm text-zinc-900 dark:text-white
                focus:outline-none focus:ring-2 focus:ring-[var(--mango)]/40 appearance-none cursor-pointer"
            >
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
              <button
                key={c.id}
                onClick={() => setCompania(c.id)}
                className={`py-2 rounded-xl text-xs font-bold border-2 transition-all ${
                  compania === c.id
                    ? 'border-[var(--mango)] bg-[var(--mango)]/10'
                    : 'border-zinc-100 dark:border-zinc-800 hover:border-zinc-200'
                }`}
              >
                {c.emoji} {c.nombre}
              </button>
            ))}
          </div>
        </div>

        {total !== null && (
          <div className="bg-[var(--mango)]/8 dark:bg-[var(--mango)]/5 rounded-xl px-4 py-3
            border border-[var(--mango)]/15 text-center">
            <p className="text-[10px] text-zinc-400 uppercase tracking-wider font-medium mb-1">
              {litros} litros de {TIPOS_COMBUSTIBLE.find(t => t.id === tipo)?.nombre} en {COMPANIAS.find(c => c.id === compania)?.nombre}
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

// ── Modal de actualización de precio ────────────────────────
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
        <h3 className="font-bold text-zinc-900 dark:text-white mb-1">
          Actualizar precio
        </h3>
        <p className="text-sm text-zinc-400 mb-4">
          {tipInfo?.emoji} {tipInfo?.nombre} en {compInfo?.emoji} {compInfo?.nombre}
        </p>
        <div className="flex flex-col gap-3">
          <div className="flex flex-col gap-1">
            <label className="text-xs text-zinc-400 font-medium">Nuevo precio por litro ($)</label>
            <input
              type="number"
              value={nuevo}
              onChange={e => setNuevo(e.target.value)}
              placeholder="Ej: 1250"
              autoFocus
              className="w-full bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700
                rounded-xl px-3 py-2.5 text-sm text-zinc-900 dark:text-white
                focus:outline-none focus:ring-2 focus:ring-[var(--mango)]/40"
            />
          </div>
          <p className="text-[10px] text-zinc-400">
            📍 Gracias por ayudar a mantener los precios actualizados para tu comunidad.
          </p>
          <div className="flex gap-3">
            <button onClick={onCerrar} className="flex-1 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700
              text-sm font-medium text-zinc-600 dark:text-zinc-400">
              Cancelar
            </button>
            <button
              onClick={() => { if (nuevo && !isNaN(nuevo)) { onGuardar(parseFloat(nuevo)); onCerrar() } }}
              className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-[var(--mango)] to-[var(--mango-dark)]
                text-sm font-bold text-[var(--charcoal)]"
            >
              Guardar
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Tabla de precios ─────────────────────────────────────────
function TablaPreciosCombustible({ tipo, precios, onActualizar }) {
  const tipInfo = TIPOS_COMBUSTIBLE.find(t => t.id === tipo)
  const preciosTipo = precios[tipo] || {}

  if (tipo === 'gnc') {
    return (
      <div className="flex items-center justify-between py-3 border-b border-zinc-100 dark:border-zinc-800 last:border-0">
        <div className="flex items-center gap-3">
          <span className="text-xl">{tipInfo.emoji}</span>
          <div>
            <p className="text-sm font-semibold text-zinc-800 dark:text-zinc-100">{tipInfo.nombre}</p>
            <p className="text-xs text-zinc-400">Varía según estación GNC</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-lg font-bold" style={{ color: tipInfo.color }}>
            {fmtPrecio(preciosTipo.estaciones_gnc)}/m³
          </span>
          <button
            onClick={() => onActualizar(tipo, 'estaciones_gnc', preciosTipo.estaciones_gnc)}
            className="text-[10px] text-zinc-400 hover:text-zinc-600 border border-zinc-200 dark:border-zinc-700
              px-1.5 py-0.5 rounded-md transition-colors"
            title="Actualizar precio"
          >
            ✏️
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="border-b border-zinc-100 dark:border-zinc-800 last:border-0 py-3">
      <div className="flex items-center gap-2 mb-2">
        <span className="text-base">{tipInfo.emoji}</span>
        <p className="text-sm font-bold text-zinc-800 dark:text-zinc-100">{tipInfo.nombre}</p>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {COMPANIAS.map(c => {
          const precio = preciosTipo[c.id]
          return (
            <div key={c.id}
              className="bg-zinc-50 dark:bg-zinc-800/50 rounded-xl p-2.5 text-center group relative">
              <p className="text-[10px] font-medium text-zinc-400 mb-1">{c.emoji} {c.nombre}</p>
              <p className="text-base font-bold text-zinc-800 dark:text-zinc-100">
                {fmtPrecio(precio)}
              </p>
              <p className="text-[9px] text-zinc-400">por litro</p>
              <button
                onClick={() => onActualizar(tipo, c.id, precio)}
                className="absolute top-1 right-1 opacity-0 group-hover:opacity-100
                  text-[10px] w-5 h-5 rounded-md text-zinc-400 hover:text-zinc-700
                  bg-white dark:bg-zinc-700 border border-zinc-200 dark:border-zinc-600
                  flex items-center justify-center transition-all"
                title="Actualizar precio"
              >
                ✏️
              </button>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ── Página principal ─────────────────────────────────────────
export function NaftaPage() {
  const [provincia, setProvincia] = useState(() => {
    return localStorage.getItem('nafta_provincia') || 'Corrientes'
  })

  const { prices: precios, cargando, fuente, ultimaActualizacion, refresh: cargar, actualizarPrecio } = usePrecios(provincia)
  const [modalActualizar, setModalActualizar] = useState(null) // { tipo, compania, precio }

  const handleProvinciaChange = (nueva) => {
    setProvincia(nueva)
    localStorage.setItem('nafta_provincia', nueva)
  }

  const handleActualizar = (tipo, compania, precioActual) => {
    setModalActualizar({ tipo, compania, precioActual })
  }

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
          subtitulo="Consultá cuánto sale el combustible en tu zona"
          accion={
            <Button variante="secondary" tamaño="sm" onClick={cargar} cargando={cargando}>
              🔄 Actualizar
            </Button>
          }
        />

        {/* Selector de provincia */}
        <div className="mb-5">
          <label className="text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-1.5 block">
            📍 Tu provincia
          </label>
          <select
            value={provincia}
            onChange={e => handleProvinciaChange(e.target.value)}
            className="w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700
              rounded-xl px-3 py-2.5 text-sm text-zinc-900 dark:text-white
              focus:outline-none focus:ring-2 focus:ring-[var(--mango)]/40 appearance-none cursor-pointer"
          >
            {PROVINCIAS.map(p => <option key={p} value={p}>{p}</option>)}
          </select>
        </div>

        {/* Info de fuente + fecha */}
        <div className="flex items-center justify-between mb-4 text-xs text-zinc-400 px-1">
          <span>{fuenteLabel}</span>
          {ultimaActualizacion && (
            <span>Actualizado: {fmtFecha(ultimaActualizacion)}</span>
          )}
        </div>

        {/* Aviso de actualización comunitaria */}
        <div className="mb-5 bg-blue-50 dark:bg-blue-900/15 border border-blue-200 dark:border-blue-800/40
          rounded-2xl px-4 py-3 text-xs text-blue-700 dark:text-blue-300">
          <p className="font-semibold mb-0.5">💡 ¿Los precios están desactualizados?</p>
          <p>Tocá el ✏️ en cualquier precio para actualizarlo. Tu corrección se guarda para vos y ayuda a la comunidad.</p>
        </div>

        {/* Tabla de precios */}
        <Card className="mb-5">
          <CardHeader titulo={`Precios en ${provincia}`} />
          {cargando ? (
            <div className="space-y-4 mt-3">
              {[0,1,2,3].map(i => (
                <div key={i} className="h-20 bg-zinc-100 dark:bg-zinc-800 rounded-xl animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="mt-2">
              {TIPOS_COMBUSTIBLE.map(t => (
                <TablaPreciosCombustible
                  key={t.id}
                  tipo={t.id}
                  precios={precios}
                  onActualizar={handleActualizar}
                />
              ))}
            </div>
          )}
        </Card>

        {/* Calculadora de tanque */}
        <CalculadoraTanque precios={precios} />

        {/* Enlace a combustibles.ar */}
        <div className="mt-6 text-center">
          <a
            href="https://combustibles.ar"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-zinc-400 hover:text-[var(--mango-dark)] transition-colors underline"
          >
            Ver precios detallados y por estación en combustibles.ar ↗
          </a>
        </div>

        <p className="text-[10px] text-zinc-400 text-center mt-2 pb-4">
          Precios referenciales. Pueden variar por estación y zona. Última actualización según fuente indicada.
        </p>
      </PageWrapper>

      {/* Modal actualización */}
      {modalActualizar && (
        <ModalActualizar
          tipo={modalActualizar.tipo}
          compania={modalActualizar.compania}
          precioActual={modalActualizar.precioActual}
          onGuardar={(precio) => actualizarPrecio(modalActualizar.tipo, modalActualizar.compania, precio)}
          onCerrar={() => setModalActualizar(null)}
        />
      )}
    </div>
  )
}