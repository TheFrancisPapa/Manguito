import { useState, useEffect, useCallback } from 'react'
import { useAuthContext } from '../../context/AuthContext'
import { PageWrapper, PageHeader, Sidebar, BottomNav } from '../../components/layout'
import { Card, CardHeader, Button } from '../../components/ui'

// ─── Iconos y colores por tipo de dólar ─────────────────────
const DOLAR_META = {
  oficial:          { icono: '🏛️', color: 'var(--leaf)',   label: 'Oficial'  },
  blue:             { icono: '💵', color: '#3B82F6',       label: 'Blue'     },
  bolsa:            { icono: '📈', color: 'var(--mango)',   label: 'MEP / Bolsa' },
  contadoconliqui:  { icono: '🔄', color: '#A855F7',       label: 'CCL'      },
  mayorista:        { icono: '🏭', color: '#6B7280',       label: 'Mayorista'},
  cripto:           { icono: '₿',  color: '#F59E0B',       label: 'Cripto'   },
  tarjeta:          { icono: '💳', color: '#EF4444',       label: 'Tarjeta'  },
}

const MONEDA_BANDERA = {
  USD: '🇺🇸', EUR: '🇪🇺', BRL: '🇧🇷', CLP: '🇨🇱', UYU: '🇺🇾',
}

// ─── Formateo de números ────────────────────────────────────
function fmtPrecio(n) {
  if (!n && n !== 0) return '—'
  return Number(n).toLocaleString('es-AR', { 
    minimumFractionDigits: 2,
    maximumFractionDigits: 2 
  })
}

function tiempoRelativo(fechaStr) {
  if (!fechaStr) return ''
  const diff = (Date.now() - new Date(fechaStr).getTime()) / 1000 / 60
  if (diff < 1) return 'Hace segundos'
  if (diff < 60) return `Hace ${Math.floor(diff)} min`
  if (diff < 1440) return `Hace ${Math.floor(diff / 60)} hs`
  return new Date(fechaStr).toLocaleDateString('es-AR')
}

// ─── Hook para ambas APIs ───────────────────────────────────
function useDolarAPI() {
  const [dolares, setDolares] = useState([])
  const [cotizaciones, setCotizaciones] = useState([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState(null)

  const cargar = useCallback(async () => {
    setCargando(true)
    setError(null)
    try {
      const [resDolares, resCotiz] = await Promise.all([
        fetch('https://dolarapi.com/v1/dolares'),
        fetch('https://dolarapi.com/v1/cotizaciones'),
      ])
      if (!resDolares.ok) throw new Error(`Error dólares: ${resDolares.status}`)
      if (!resCotiz.ok) throw new Error(`Error cotizaciones: ${resCotiz.status}`)
      
      const [dataDolares, dataCotiz] = await Promise.all([
        resDolares.json(),
        resCotiz.json(),
      ])
      
      setDolares(dataDolares)
      // Filtrar USD de cotizaciones ya que los dólares los mostramos aparte
      setCotizaciones(dataCotiz.filter(c => c.moneda !== 'USD'))
    } catch (err) {
      setError(err.message)
    } finally {
      setCargando(false)
    }
  }, [])

  useEffect(() => { cargar() }, [cargar])

  return { dolares, cotizaciones, cargando, error, recargar: cargar }
}

// ─── Tarjeta de dólar ───────────────────────────────────────
function TarjetaDolar({ dolar }) {
  const meta = DOLAR_META[dolar.casa] || { icono: '💲', color: '#666', label: dolar.nombre }
  const spread = dolar.compra && dolar.venta 
    ? ((dolar.venta - dolar.compra) / dolar.compra * 100).toFixed(1)
    : null

  return (
    <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-[var(--mango)]/8 dark:border-zinc-800 
      p-4 hover:border-[var(--mango)]/25 hover:shadow-md transition-all">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl"
            style={{ backgroundColor: `${meta.color}15` }}>
            {meta.icono}
          </div>
          <div>
            <p className="font-bold text-sm text-zinc-900 dark:text-white">{meta.label}</p>
            <p className="text-[10px] text-zinc-400">{tiempoRelativo(dolar.fechaActualizacion)}</p>
          </div>
        </div>
        {spread && (
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-500">
            spread {spread}%
          </span>
        )}
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-zinc-50 dark:bg-zinc-800/50 rounded-xl p-2.5 text-center">
          <p className="text-[10px] text-zinc-400 uppercase tracking-wider font-medium mb-0.5">Compra</p>
          <p className="text-base font-bold tabular-nums" style={{ color: meta.color }}>
            ${fmtPrecio(dolar.compra)}
          </p>
        </div>
        <div className="bg-zinc-50 dark:bg-zinc-800/50 rounded-xl p-2.5 text-center">
          <p className="text-[10px] text-zinc-400 uppercase tracking-wider font-medium mb-0.5">Venta</p>
          <p className="text-base font-bold tabular-nums" style={{ color: meta.color }}>
            ${fmtPrecio(dolar.venta)}
          </p>
        </div>
      </div>
    </div>
  )
}

// ─── Tarjeta de otra moneda ─────────────────────────────────
function TarjetaMoneda({ cotiz }) {
  const bandera = MONEDA_BANDERA[cotiz.moneda] || '🌐'
  
  return (
    <div className="flex items-center justify-between p-4 bg-white dark:bg-zinc-900 
      rounded-2xl border border-[var(--mango)]/8 dark:border-zinc-800 
      hover:border-[var(--mango)]/25 hover:shadow-md transition-all">
      <div className="flex items-center gap-3">
        <span className="text-2xl">{bandera}</span>
        <div>
          <p className="font-bold text-sm text-zinc-900 dark:text-white">{cotiz.nombre}</p>
          <p className="text-xs text-zinc-400">{cotiz.moneda}/ARS · {tiempoRelativo(cotiz.fechaActualizacion)}</p>
        </div>
      </div>
      <div className="text-right flex gap-4">
        <div>
          <p className="text-[10px] text-zinc-400">Compra</p>
          <p className="text-sm font-bold text-[var(--leaf)] tabular-nums">${fmtPrecio(cotiz.compra)}</p>
        </div>
        <div>
          <p className="text-[10px] text-zinc-400">Venta</p>
          <p className="text-sm font-bold text-[var(--charcoal)] dark:text-white tabular-nums">${fmtPrecio(cotiz.venta)}</p>
        </div>
      </div>
    </div>
  )
}

// ─── Conversor rápido ───────────────────────────────────────
function Conversor({ dolares }) {
  const [monto, setMonto] = useState('')
  const [tipo, setTipo] = useState('blue')
  const [direccion, setDireccion] = useState('ars_a_usd') // ars_a_usd | usd_a_ars

  const dolar = dolares.find(d => d.casa === tipo)
  
  function calcular() {
    const val = parseFloat(monto)
    if (isNaN(val) || !dolar) return null
    if (direccion === 'ars_a_usd') {
      return dolar.venta ? val / dolar.venta : null
    } else {
      return dolar.compra ? val * dolar.compra : null
    }
  }

  const resultado = calcular()

  return (
    <Card>
      <CardHeader titulo="Conversor rápido" />
      <div className="flex flex-col gap-3 mt-2">
        {/* Tipo de dólar */}
        <select
          value={tipo}
          onChange={e => setTipo(e.target.value)}
          className="w-full bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 
            rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--mango)]/40
            text-zinc-900 dark:text-white appearance-none cursor-pointer"
        >
          {dolares.map(d => {
            const meta = DOLAR_META[d.casa]
            return <option key={d.casa} value={d.casa}>{meta?.icono} {meta?.label || d.nombre}</option>
          })}
        </select>

        {/* Monto */}
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 text-sm">
            {direccion === 'ars_a_usd' ? '$' : 'U$D'}
          </span>
          <input
            type="number"
            value={monto}
            onChange={e => setMonto(e.target.value)}
            placeholder={direccion === 'ars_a_usd' ? 'Pesos argentinos' : 'Dólares'}
            className="w-full bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 
              rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--mango)]/40
              text-zinc-900 dark:text-white placeholder:text-zinc-400"
          />
        </div>

        {/* Invertir */}
        <button onClick={() => setDireccion(d => d === 'ars_a_usd' ? 'usd_a_ars' : 'ars_a_usd')}
          className="self-center w-10 h-10 rounded-full bg-[var(--cream)] dark:bg-zinc-800 
            border border-[var(--mango)]/15 dark:border-zinc-700
            flex items-center justify-center text-lg
            hover:bg-[var(--mango)]/15 hover:scale-110 transition-all active:scale-95 cursor-pointer">
          ↕️
        </button>

        {/* Resultado */}
        <div className="bg-[var(--mango)]/8 dark:bg-[var(--mango)]/5 rounded-xl px-4 py-3 
          border border-[var(--mango)]/15 text-center min-h-[52px] flex items-center justify-center">
          {resultado !== null ? (
            <span className="text-xl font-bold text-[var(--mango-dark)] dark:text-[var(--mango)]">
              {direccion === 'ars_a_usd' ? 'U$D' : '$'} {fmtPrecio(resultado)}
            </span>
          ) : (
            <span className="text-sm text-zinc-400">Ingresá un monto</span>
          )}
        </div>

        {/* Referencia */}
        {dolar && (
          <p className="text-[10px] text-zinc-400 text-center">
            {DOLAR_META[tipo]?.label}: compra ${fmtPrecio(dolar.compra)} · venta ${fmtPrecio(dolar.venta)}
          </p>
        )}
      </div>
    </Card>
  )
}

// ─── Skeleton de carga ──────────────────────────────────────
function SkeletonDolares() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      {[0,1,2,3,4,5,6].map(i => (
        <div key={i} className="bg-zinc-100 dark:bg-zinc-800 rounded-2xl h-[136px] animate-pulse" />
      ))}
    </div>
  )
}

// ─── Página principal ───────────────────────────────────────
export function CotizacionesPage() {
  const { usuario } = useAuthContext()
  const { dolares, cotizaciones, cargando, error, recargar } = useDolarAPI()

  return (
    <>
      <Sidebar usuario={usuario} />
      <BottomNav />
      <PageWrapper>
        <PageHeader 
          titulo="Cotizaciones" 
          subtitulo="Dólar y divisas en Argentina · En vivo"
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
          {/* Conversor — sidebar derecho */}
          <div className="lg:col-span-1 order-1 lg:order-2">
            {dolares.length > 0 && <Conversor dolares={dolares} />}
          </div>

          {/* Contenido principal */}
          <div className="lg:col-span-2 order-2 lg:order-1 flex flex-col gap-6">
            
            {/* Sección: Dólares */}
            <div>
              <h2 className="text-xs font-semibold text-[var(--mango-dark)] dark:text-[var(--mango)] uppercase tracking-wider mb-3 px-1">
                🇺🇸 Dólar en Argentina
              </h2>
              {cargando ? <SkeletonDolares /> : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {dolares.map(d => <TarjetaDolar key={d.casa} dolar={d} />)}
                </div>
              )}
            </div>

            {/* Sección: Otras monedas */}
            {cotizaciones.length > 0 && (
              <div>
                <h2 className="text-xs font-semibold text-[var(--mango-dark)] dark:text-[var(--mango)] uppercase tracking-wider mb-3 px-1">
                  🌍 Otras divisas
                </h2>
                <div className="flex flex-col gap-3">
                  {cotizaciones.map(c => <TarjetaMoneda key={c.moneda} cotiz={c} />)}
                </div>
              </div>
            )}
          </div>
        </div>

        <p className="text-[10px] text-zinc-400 text-center mt-8 pb-4">
          Fuente: DolarAPI.com · Cotizaciones referenciales, no transaccionales.
        </p>
      </PageWrapper>
    </>
  )
}
