import { useState, useEffect, useCallback } from 'react'
import { useAuthContext } from '../../context/AuthContext'
import { PageWrapper, PageHeader, Sidebar, BottomNav } from '../../components/layout'
import { Card, CardHeader, Button } from '../../components/ui'

// ─── Monedas soportadas ─────────────────────────────────────
const MONEDAS = [
  { codigo: 'USD', nombre: 'Dólar estadounidense', bandera: '🇺🇸', simbolo: 'U$D' },
  { codigo: 'EUR', nombre: 'Euro',                 bandera: '🇪🇺', simbolo: '€'   },
  { codigo: 'BRL', nombre: 'Real brasileño',       bandera: '🇧🇷', simbolo: 'R$'  },
  { codigo: 'CLP', nombre: 'Peso chileno',         bandera: '🇨🇱', simbolo: 'CL$' },
  { codigo: 'UYU', nombre: 'Peso uruguayo',        bandera: '🇺🇾', simbolo: '$U'  },
  { codigo: 'PYG', nombre: 'Guaraní paraguayo',    bandera: '🇵🇾', simbolo: '₲'   },
  { codigo: 'BOB', nombre: 'Boliviano',            bandera: '🇧🇴', simbolo: 'Bs'  },
  { codigo: 'PEN', nombre: 'Sol peruano',          bandera: '🇵🇪', simbolo: 'S/'  },
  { codigo: 'COP', nombre: 'Peso colombiano',      bandera: '🇨🇴', simbolo: 'CO$' },
  { codigo: 'MXN', nombre: 'Peso mexicano',        bandera: '🇲🇽', simbolo: 'MX$' },
  { codigo: 'GBP', nombre: 'Libra esterlina',      bandera: '🇬🇧', simbolo: '£'   },
  { codigo: 'JPY', nombre: 'Yen japonés',          bandera: '🇯🇵', simbolo: '¥'   },
  { codigo: 'CNY', nombre: 'Yuan chino',           bandera: '🇨🇳', simbolo: '¥'   },
]

const API_BASE = 'https://open.er-api.com/v6/latest'

// ─── Hook para cotizaciones ─────────────────────────────────
function useCotizaciones(base = 'ARS') {
  const [datos, setDatos] = useState(null)
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState(null)
  const [ultimaAct, setUltimaAct] = useState(null)

  const cargar = useCallback(async () => {
    setCargando(true)
    setError(null)
    try {
      const res = await fetch(`${API_BASE}/${base}`)
      if (!res.ok) throw new Error(`Error ${res.status}`)
      const json = await res.json()
      if (json.result !== 'success') throw new Error(json['error-type'] || 'Error de API')
      setDatos(json.conversion_rates)
      setUltimaAct(new Date())
    } catch (err) {
      setError(err.message)
    } finally {
      setCargando(false)
    }
  }, [base])

  useEffect(() => { cargar() }, [cargar])

  return { datos, cargando, error, ultimaAct, recargar: cargar }
}

// ─── Formateo ───────────────────────────────────────────────
function fmtPrecio(valor, decimales = 2) {
  if (!valor && valor !== 0) return '—'
  if (valor >= 1000) return Number(valor).toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
  if (valor >= 1) return Number(valor).toFixed(decimales)
  return Number(valor).toFixed(4)
}

// ─── Componente Tarjeta de Moneda ───────────────────────────
function TarjetaMoneda({ moneda, tasa, base }) {
  const precio = tasa ? fmtPrecio(tasa) : '—'
  const inverso = tasa ? fmtPrecio(1 / tasa) : '—'
  
  return (
    <div className="flex items-center justify-between p-4 bg-white dark:bg-zinc-900 
      rounded-2xl border border-[var(--mango)]/8 dark:border-zinc-800 
      hover:border-[var(--mango)]/25 hover:shadow-md transition-all group">
      <div className="flex items-center gap-3">
        <span className="text-2xl">{moneda.bandera}</span>
        <div>
          <div className="flex items-center gap-2">
            <span className="font-bold text-sm text-zinc-900 dark:text-white">{moneda.codigo}</span>
            <span className="text-xs text-zinc-400">/{base}</span>
          </div>
          <p className="text-xs text-zinc-400 mt-0.5">{moneda.nombre}</p>
        </div>
      </div>
      <div className="text-right">
        <p className="text-lg font-bold text-[var(--charcoal)] dark:text-white tabular-nums">
          {moneda.simbolo} {precio}
        </p>
        <p className="text-xs text-zinc-400 tabular-nums">
          1 {moneda.codigo} = {inverso} {base}
        </p>
      </div>
    </div>
  )
}

// ─── Conversor ──────────────────────────────────────────────
function Conversor({ datos, base }) {
  const [monto, setMonto] = useState('')
  const [desde, setDesde] = useState(base)
  const [hacia, setHacia] = useState('USD')

  const monedas = [{ codigo: base }, ...MONEDAS]

  function calcular() {
    if (!monto || !datos) return null
    const val = parseFloat(monto)
    if (isNaN(val)) return null

    if (desde === base) {
      return val * (datos[hacia] || 0)
    } else if (hacia === base) {
      return val / (datos[desde] || 1)
    } else {
      const enBase = val / (datos[desde] || 1)
      return enBase * (datos[hacia] || 0)
    }
  }

  const resultado = calcular()
  const monedaDestino = MONEDAS.find(m => m.codigo === hacia)

  function invertir() {
    setDesde(hacia)
    setHacia(desde)
  }

  return (
    <Card>
      <CardHeader titulo="Conversor de monedas" />
      <div className="flex flex-col gap-4 mt-2">
        {/* Monto origen */}
        <div className="flex gap-2">
          <input
            type="number"
            value={monto}
            onChange={e => setMonto(e.target.value)}
            placeholder="Monto"
            className="flex-1 bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 
              rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--mango)]/40
              text-zinc-900 dark:text-white placeholder:text-zinc-400"
          />
          <select
            value={desde}
            onChange={e => setDesde(e.target.value)}
            className="bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 
              rounded-xl px-3 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--mango)]/40
              text-zinc-900 dark:text-white appearance-none cursor-pointer font-medium w-24"
          >
            {monedas.map(m => <option key={m.codigo} value={m.codigo}>{m.codigo}</option>)}
          </select>
        </div>

        {/* Botón invertir */}
        <div className="flex justify-center">
          <button onClick={invertir}
            className="w-10 h-10 rounded-full bg-[var(--cream)] dark:bg-zinc-800 
              border border-[var(--mango)]/15 dark:border-zinc-700
              flex items-center justify-center text-lg
              hover:bg-[var(--mango)]/15 hover:scale-110 transition-all active:scale-95 cursor-pointer">
            ↕️
          </button>
        </div>

        {/* Moneda destino */}
        <div className="flex gap-2">
          <div className="flex-1 bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 
            rounded-xl px-4 py-3 text-sm text-zinc-900 dark:text-white min-h-[48px] flex items-center">
            {resultado !== null ? (
              <span className="text-lg font-bold">
                {monedaDestino?.simbolo ?? ''} {fmtPrecio(resultado)}
              </span>
            ) : (
              <span className="text-zinc-400">Resultado</span>
            )}
          </div>
          <select
            value={hacia}
            onChange={e => setHacia(e.target.value)}
            className="bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 
              rounded-xl px-3 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--mango)]/40
              text-zinc-900 dark:text-white appearance-none cursor-pointer font-medium w-24"
          >
            {monedas.map(m => <option key={m.codigo} value={m.codigo}>{m.codigo}</option>)}
          </select>
        </div>

        {/* Referencia */}
        {resultado !== null && monto && (
          <p className="text-xs text-zinc-400 text-center">
            1 {desde} = {fmtPrecio(calcularTasaDirecta())} {hacia}
          </p>
        )}
      </div>
    </Card>
  )

  function calcularTasaDirecta() {
    if (!datos) return 0
    if (desde === base) return datos[hacia] || 0
    if (hacia === base) return 1 / (datos[desde] || 1)
    return (datos[hacia] || 0) / (datos[desde] || 1)
  }
}

// ─── Página principal ───────────────────────────────────────
export function CotizacionesPage() {
  const { usuario } = useAuthContext()
  const base = usuario?.moneda ?? 'ARS'
  const { datos, cargando, error, ultimaAct, recargar } = useCotizaciones(base)
  const [busqueda, setBusqueda] = useState('')

  const monedasFiltradas = MONEDAS.filter(m => 
    m.codigo !== base && (
      m.codigo.toLowerCase().includes(busqueda.toLowerCase()) ||
      m.nombre.toLowerCase().includes(busqueda.toLowerCase())
    )
  )

  return (
    <>
      <Sidebar usuario={usuario} />
      <BottomNav />
      <PageWrapper>
        <PageHeader 
          titulo="Cotizaciones" 
          subtitulo={`Base: ${base} · ${ultimaAct ? `Actualizado ${ultimaAct.toLocaleTimeString('es-AR')}` : ''}`}
          accion={
            <Button variante="secondary" tamaño="sm" onClick={recargar} cargando={cargando}>
              🔄 Actualizar
            </Button>
          }
        />

        {error && (
          <div className="mb-6 bg-red-50 dark:bg-red-900/20 text-red-600 text-sm px-4 py-3 rounded-xl border border-red-100 dark:border-red-900/50">
            Error al cargar cotizaciones: {error}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Conversor — columna principal */}
          <div className="lg:col-span-1 order-1 lg:order-2">
            {datos && <Conversor datos={datos} base={base} />}
          </div>

          {/* Lista de cotizaciones */}
          <div className="lg:col-span-2 order-2 lg:order-1">
            {/* Buscador */}
            <div className="mb-4">
              <input
                type="text"
                value={busqueda}
                onChange={e => setBusqueda(e.target.value)}
                placeholder="🔍 Buscar moneda..."
                className="w-full bg-white dark:bg-zinc-900 border border-[var(--mango)]/10 dark:border-zinc-800 
                  rounded-2xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--mango)]/40
                  text-zinc-900 dark:text-white placeholder:text-zinc-400"
              />
            </div>

            {cargando ? (
              <div className="flex flex-col gap-3">
                {[0,1,2,3,4,5].map(i => (
                  <div key={i} className="bg-zinc-100 dark:bg-zinc-800 rounded-2xl h-[76px] animate-pulse" />
                ))}
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {monedasFiltradas.map(m => (
                  <TarjetaMoneda 
                    key={m.codigo} 
                    moneda={m} 
                    tasa={datos?.[m.codigo]} 
                    base={base}
                  />
                ))}
                {monedasFiltradas.length === 0 && (
                  <div className="text-center py-12">
                    <span className="text-4xl block mb-3">🔍</span>
                    <p className="text-sm text-zinc-500">No se encontraron monedas con "{busqueda}"</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        <p className="text-[10px] text-zinc-400 text-center mt-8 pb-4">
          Fuente: ExchangeRate-API · Cotizaciones referenciales, no transaccionales.
        </p>
      </PageWrapper>
    </>
  )
}
