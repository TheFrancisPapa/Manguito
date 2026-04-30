// src/pages/Mercado/index.jsx — Buscador de precios "Mercado"
import { useState, useCallback, useEffect } from 'react'
import { PageWrapper, PageHeader } from '../../components/layout'
import { Card, CardHeader, Button } from '../../components/ui'
import { useAuthContext } from '../../context/AuthContext'
import {
  useUbicacion, useBusqueda, usePreciosProducto, useComercios,
  crearComercio, crearProducto, reportarPrecio,
  PROVINCIAS_AR, CIUDADES_POR_PROVINCIA, CATEGORIAS_PRODUCTO, TIPOS_COMERCIO,
  fmtPrecio, tiempoDesde,
} from '../../hooks/useMercado'

// ── Selector de ubicación ────────────────────────────────────
function SelectorUbicacion({ ubicacion, onChange }) {
  const ciudades = CIUDADES_POR_PROVINCIA[ubicacion.provincia] || []
  return (
    <div className="flex gap-2 mb-5">
      <div className="flex-1 flex flex-col gap-1">
        <label className="text-[10px] text-zinc-400 uppercase tracking-wider font-medium">📍 Provincia</label>
        <select
          value={ubicacion.provincia}
          onChange={e => onChange(e.target.value, CIUDADES_POR_PROVINCIA[e.target.value]?.[0] || '')}
          className="field-base field-select text-sm !py-2.5"
        >
          {PROVINCIAS_AR.map(p => <option key={p} value={p}>{p}</option>)}
        </select>
      </div>
      <div className="flex-1 flex flex-col gap-1">
        <label className="text-[10px] text-zinc-400 uppercase tracking-wider font-medium">🏙️ Ciudad</label>
        <select
          value={ubicacion.ciudad}
          onChange={e => onChange(ubicacion.provincia, e.target.value)}
          className="field-base field-select text-sm !py-2.5"
        >
          {ciudades.map(c => <option key={c} value={c}>{c}</option>)}
          {!ciudades.includes(ubicacion.ciudad) && ubicacion.ciudad && (
            <option value={ubicacion.ciudad}>{ubicacion.ciudad}</option>
          )}
        </select>
      </div>
    </div>
  )
}

// ── Barra de búsqueda hero ───────────────────────────────────
function SearchBar({ query, onChange, cargando }) {
  return (
    <div className="relative mb-5">
      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 text-lg">🔍</div>
      <input
        type="text"
        value={query}
        onChange={e => onChange(e.target.value)}
        placeholder="Buscar producto... ej: Nesquik, Coca Cola, arroz"
        className="field-base !py-3.5 !pl-12 !pr-4 !text-base !rounded-2xl"
        style={{
          boxShadow: '0 4px 20px rgba(245,166,35,0.08), inset 0 1px 3px rgba(0,0,0,0.04)',
        }}
      />
      {cargando && (
        <div className="absolute right-4 top-1/2 -translate-y-1/2">
          <div className="w-5 h-5 border-2 border-[var(--mango)]/30 border-t-[var(--mango)] rounded-full animate-spin" />
        </div>
      )}
    </div>
  )
}

// ── Chips de categorías ──────────────────────────────────────
function ChipsCategorias({ seleccionada, onSelect }) {
  const populares = CATEGORIAS_PRODUCTO.slice(0, 8)
  return (
    <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-2 mb-4 -mx-1 px-1">
      <button
        onClick={() => onSelect(null)}
        className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-bold border transition-all ${
          !seleccionada
            ? 'bg-[var(--mango)]/10 border-[var(--mango)]/30 text-[var(--mango-dark)] dark:text-[var(--mango)]'
            : 'border-zinc-200 dark:border-zinc-700 text-zinc-500 hover:border-zinc-300'
        }`}
      >
        Todos
      </button>
      {populares.map(cat => (
        <button
          key={cat.id}
          onClick={() => onSelect(cat.id === seleccionada ? null : cat.id)}
          className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-bold border transition-all whitespace-nowrap ${
            seleccionada === cat.id
              ? 'bg-[var(--mango)]/10 border-[var(--mango)]/30 text-[var(--mango-dark)] dark:text-[var(--mango)]'
              : 'border-zinc-200 dark:border-zinc-700 text-zinc-500 hover:border-zinc-300'
          }`}
        >
          {cat.emoji} {cat.nombre}
        </button>
      ))}
    </div>
  )
}

// ── Card de resultado de búsqueda ────────────────────────────
function ResultadoCard({ producto, onSelect }) {
  const catInfo = CATEGORIAS_PRODUCTO.find(c => c.id === producto.categoria)
  return (
    <button
      onClick={() => onSelect(producto)}
      className="w-full card-premium card-interactive p-4 text-left"
    >
      <div className="flex items-start gap-3">
        <div className="w-12 h-12 rounded-xl bg-[var(--mango)]/8 dark:bg-[var(--mango)]/5
          flex items-center justify-center text-2xl flex-shrink-0">
          {catInfo?.emoji || '📦'}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold text-zinc-900 dark:text-white truncate">
            {producto.nombre}
          </p>
          <p className="text-xs text-zinc-400 mt-0.5">
            {producto.marca} {producto.presentacion && `· ${producto.presentacion}`}
          </p>
          <div className="flex items-center gap-2 mt-2">
            {producto.precio_min ? (
              <>
                <span className="text-base font-black text-[var(--mango-dark)] dark:text-[var(--mango)]">
                  {fmtPrecio(producto.precio_min)}
                </span>
                {producto.precio_max > producto.precio_min && (
                  <span className="text-xs text-zinc-400">
                    — {fmtPrecio(producto.precio_max)}
                  </span>
                )}
                <span className="text-[10px] text-zinc-400 ml-auto">
                  {producto.cant_comercios} comercio{producto.cant_comercios !== 1 ? 's' : ''}
                </span>
              </>
            ) : (
              <span className="text-xs text-zinc-400 italic">Sin precios aún</span>
            )}
          </div>
        </div>
      </div>
    </button>
  )
}

// ── Vista detalle: precios de un producto ────────────────────
function DetalleProducto({ producto, ciudad, provincia, onVolver, onCargarPrecio }) {
  const { precios, cargando } = usePreciosProducto(producto.producto_id, ciudad, provincia)
  const catInfo = CATEGORIAS_PRODUCTO.find(c => c.id === producto.categoria)

  return (
    <div className="animate-in fade-in duration-300">
      <button
        onClick={onVolver}
        className="flex items-center gap-1.5 text-sm text-[var(--mango-dark)] dark:text-[var(--mango)]
          font-semibold mb-4 press-scale"
      >
        ← Volver a resultados
      </button>

      {/* Header del producto */}
      <div className="card-premium p-5 mb-4">
        <div className="flex items-center gap-3">
          <div className="w-14 h-14 rounded-2xl bg-[var(--mango)]/8 flex items-center justify-center text-3xl">
            {catInfo?.emoji || '📦'}
          </div>
          <div>
            <h2 className="text-lg font-bold text-zinc-900 dark:text-white">{producto.nombre}</h2>
            <p className="text-sm text-zinc-400">
              {producto.marca} {producto.presentacion && `· ${producto.presentacion}`}
            </p>
          </div>
        </div>
      </div>

      {/* Lista de precios */}
      <h3 className="text-sm font-bold text-zinc-500 dark:text-zinc-400 mb-3 flex items-center gap-2">
        💰 Precios en {ciudad || 'tu zona'}
        {cargando && <div className="w-4 h-4 border-2 border-[var(--mango)]/30 border-t-[var(--mango)] rounded-full animate-spin" />}
      </h3>

      {precios.length === 0 && !cargando ? (
        <div className="card-premium p-6 text-center">
          <p className="text-3xl mb-2">🏷️</p>
          <p className="text-sm font-bold text-zinc-600 dark:text-zinc-300">
            Aún no hay precios para este producto en {ciudad}
          </p>
          <p className="text-xs text-zinc-400 mt-1">
            ¡Sé el primero en cargar un precio!
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {precios.map((p, i) => {
            const tipoInfo = TIPOS_COMERCIO.find(t => t.id === p.comercio_tipo)
            return (
              <div
                key={p.precio_id}
                className={`card-premium p-4 ${i === 0 ? 'ring-2 ring-[var(--mango)]/20' : ''}`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-zinc-100 dark:bg-zinc-800
                      flex items-center justify-center text-lg flex-shrink-0">
                      {tipoInfo?.emoji || '🏪'}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-zinc-900 dark:text-white truncate">
                        {p.comercio_nombre}
                      </p>
                      <p className="text-[11px] text-zinc-400 truncate">
                        {p.comercio_dir || tipoInfo?.nombre}
                        {p.comercio_cadena && ` · ${p.comercio_cadena}`}
                      </p>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0 ml-3">
                    <p className={`text-lg font-black ${
                      i === 0
                        ? 'text-emerald-600 dark:text-emerald-400'
                        : 'text-zinc-900 dark:text-white'
                    }`}>
                      {fmtPrecio(p.en_oferta && p.precio_oferta ? p.precio_oferta : p.precio)}
                    </p>
                    {p.en_oferta && p.precio_oferta && (
                      <p className="text-[10px] text-zinc-400 line-through">{fmtPrecio(p.precio)}</p>
                    )}
                    <p className="text-[10px] text-zinc-400">{tiempoDesde(p.updated_at)}</p>
                  </div>
                </div>
                {i === 0 && precios.length > 1 && (
                  <div className="mt-2 pt-2 border-t border-zinc-100 dark:border-zinc-800">
                    <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
                      🏆 Mejor precio
                    </span>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      {/* CTA: Cargar precio para este producto */}
      <button
        onClick={() => onCargarPrecio && onCargarPrecio(producto)}
        className="w-full mt-5 py-3 rounded-2xl bg-gradient-to-r from-[var(--mango)] to-[var(--mango-dark)]
          text-sm font-bold text-[var(--charcoal)] press-scale
          shadow-lg"
        style={{ boxShadow: '0 4px 16px rgba(245,166,35,0.3)' }}
      >
        🏷️ Cargar precio en otro comercio
      </button>
    </div>
  )
}

// ── Estado vacío / bienvenida ────────────────────────────────
function EstadoInicial({ onSearch }) {
  return (
    <div className="text-center py-8">
      <div className="text-5xl mb-4">🛒</div>
      <h3 className="text-lg font-bold text-zinc-800 dark:text-white mb-2 font-display">
        Bienvenido a Mercado
      </h3>
      <p className="text-sm text-zinc-400 max-w-xs mx-auto leading-relaxed">
        Buscá cualquier producto y compará precios en comercios cerca tuyo.
        ¡Encontrá dónde comprar más barato!
      </p>
      <p className="text-xs text-zinc-400 mt-4 mb-2 font-medium">Probá buscando:</p>
      <div className="flex flex-wrap justify-center gap-2">
        {['Nesquik', 'Coca Cola', 'Arroz', 'Yerba', 'Fideos', 'Leche', 'Aceite'].map(ej => (
          <button
            key={ej}
            onClick={() => onSearch(ej)}
            className="px-3 py-1.5 rounded-full text-xs font-semibold
              bg-[var(--mango)]/8 dark:bg-[var(--mango)]/5
              text-[var(--mango-dark)] dark:text-[var(--mango)]
              border border-[var(--mango)]/20
              hover:bg-[var(--mango)]/15 active:scale-95
              transition-all press-scale"
          >
            🔍 {ej}
          </button>
        ))}
      </div>
    </div>
  )
}

// ── Sin resultados ───────────────────────────────────────────
function SinResultados({ query }) {
  return (
    <div className="text-center py-8">
      <div className="text-4xl mb-3">🔍</div>
      <p className="text-sm font-bold text-zinc-600 dark:text-zinc-300">
        No encontramos "{query}"
      </p>
      <p className="text-xs text-zinc-400 mt-1">
        Probá con otro nombre o revisá la ortografía
      </p>
    </div>
  )
}

// ── Modal para cargar precio ─────────────────────────────────
function ModalCargarPrecio({ onCerrar, comercios, ubicacion, productoPreseleccionado = null }) {
  const [paso, setPaso] = useState(productoPreseleccionado ? 2 : 1)
  const [productoNombre, setProductoNombre] = useState('')
  const [productoMarca, setProductoMarca] = useState('')
  const [productoCategoria, setProductoCategoria] = useState('almacen')
  const [productoPresentacion, setProductoPresentacion] = useState('')
  const [productoId, setProductoId] = useState(productoPreseleccionado?.producto_id || null)
  const [comercioId, setComercioId] = useState('')
  const [precio, setPrecio] = useState('')
  const [enOferta, setEnOferta] = useState(false)
  const [precioOferta, setPrecioOferta] = useState('')
  const [guardando, setGuardando] = useState(false)
  const [exito, setExito] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  // Nuevo comercio
  const [crearNuevoComercio, setCrearNuevoComercio] = useState(false)
  const [nuevoComercioNombre, setNuevoComercioNombre] = useState('')
  const [nuevoComercioTipo, setNuevoComercioTipo] = useState('supermercado')
  const [nuevoComercioDir, setNuevoComercioDir] = useState('')

  useEffect(() => {
    if (productoPreseleccionado) {
      setProductoNombre(productoPreseleccionado.nombre || '')
      setProductoMarca(productoPreseleccionado.marca || '')
    }
  }, [productoPreseleccionado])

  const handleGuardar = async () => {
    setErrorMsg('')
    if (!precio || isNaN(precio) || Number(precio) <= 0) {
      setErrorMsg('Ingresá un precio válido')
      return
    }

    setGuardando(true)
    try {
      let finalProductoId = productoId
      let finalComercioId = comercioId

      // Crear producto nuevo si no hay ID
      if (!finalProductoId) {
        if (!productoNombre.trim() || !productoMarca.trim()) {
          setErrorMsg('Completá nombre y marca del producto')
          setGuardando(false)
          return
        }
        const prod = await crearProducto({
          nombre: productoNombre, marca: productoMarca,
          categoria: productoCategoria, presentacion: productoPresentacion,
        })
        finalProductoId = prod.id
      }

      // Crear comercio nuevo si corresponde
      if (crearNuevoComercio) {
        if (!nuevoComercioNombre.trim()) {
          setErrorMsg('Ingresá el nombre del comercio')
          setGuardando(false)
          return
        }
        const com = await crearComercio({
          nombre: nuevoComercioNombre, tipo: nuevoComercioTipo,
          direccion: nuevoComercioDir, ciudad: ubicacion.ciudad,
          provincia: ubicacion.provincia,
        })
        finalComercioId = com.id
      }

      if (!finalComercioId) {
        setErrorMsg('Seleccioná un comercio')
        setGuardando(false)
        return
      }

      await reportarPrecio({
        productoId: finalProductoId, comercioId: finalComercioId,
        precio: Number(precio), enOferta,
        precioOferta: enOferta && precioOferta ? Number(precioOferta) : null,
      })

      setExito(true)
      setTimeout(onCerrar, 1500)
    } catch (e) {
      setErrorMsg(e.message || 'Error al guardar')
    } finally {
      setGuardando(false)
    }
  }

  if (exito) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onCerrar}>
        <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
        <div className="relative bg-white dark:bg-zinc-900 rounded-2xl p-8 text-center shadow-xl animate-in zoom-in duration-300">
          <p className="text-5xl mb-3">✅</p>
          <p className="text-lg font-bold text-zinc-900 dark:text-white">¡Precio cargado!</p>
          <p className="text-sm text-zinc-400 mt-1">Gracias por contribuir a la comunidad</p>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center" onClick={onCerrar}>
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
      <div
        className="relative w-full max-w-md bg-white dark:bg-zinc-900 rounded-t-2xl sm:rounded-2xl
          p-5 shadow-xl max-h-[85vh] overflow-y-auto animate-in slide-in-from-bottom duration-300"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-bold text-zinc-900 dark:text-white">🏷️ Cargar Precio</h3>
          <button onClick={onCerrar} className="w-8 h-8 flex items-center justify-center rounded-full
            bg-zinc-100 dark:bg-zinc-800 text-zinc-400 text-xs">✕</button>
        </div>

        {errorMsg && (
          <div className="mb-3 px-3 py-2 rounded-xl bg-red-50 dark:bg-red-900/15 text-xs text-red-500 font-medium">
            {errorMsg}
          </div>
        )}

        {/* Paso 1: Producto */}
        {paso === 1 && (
          <div className="flex flex-col gap-3">
            <p className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Paso 1 — Producto</p>
            <input value={productoNombre} onChange={e => setProductoNombre(e.target.value)}
              placeholder="Nombre del producto" className="field-base !py-2.5 text-sm" />
            <div className="grid grid-cols-2 gap-2">
              <input value={productoMarca} onChange={e => setProductoMarca(e.target.value)}
                placeholder="Marca" className="field-base !py-2.5 text-sm" />
              <input value={productoPresentacion} onChange={e => setProductoPresentacion(e.target.value)}
                placeholder="Presentación (ej: 1kg)" className="field-base !py-2.5 text-sm" />
            </div>
            <select value={productoCategoria} onChange={e => setProductoCategoria(e.target.value)}
              className="field-base field-select text-sm !py-2.5">
              {CATEGORIAS_PRODUCTO.map(c => <option key={c.id} value={c.id}>{c.emoji} {c.nombre}</option>)}
            </select>
            <button onClick={() => setPaso(2)} disabled={!productoNombre.trim() || !productoMarca.trim()}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-[var(--mango)] to-[var(--mango-dark)]
                text-sm font-bold text-[var(--charcoal)] disabled:opacity-40 press-scale">
              Siguiente →
            </button>
          </div>
        )}

        {/* Paso 2: Comercio + Precio */}
        {paso === 2 && (
          <div className="flex flex-col gap-3">
            {!productoPreseleccionado && (
              <button onClick={() => setPaso(1)} className="text-xs text-[var(--mango-dark)] font-semibold self-start">← Cambiar producto</button>
            )}
            <p className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Paso 2 — Comercio y precio</p>

            {!crearNuevoComercio ? (
              <>
                <select value={comercioId} onChange={e => setComercioId(e.target.value)}
                  className="field-base field-select text-sm !py-2.5">
                  <option value="">Seleccioná un comercio...</option>
                  {comercios.map(c => {
                    const t = TIPOS_COMERCIO.find(x => x.id === c.tipo)
                    return <option key={c.id} value={c.id}>{t?.emoji} {c.nombre}</option>
                  })}
                </select>
                <button onClick={() => setCrearNuevoComercio(true)}
                  className="text-xs text-[var(--mango-dark)] dark:text-[var(--mango)] font-semibold self-start">
                  + Agregar comercio nuevo
                </button>
              </>
            ) : (
              <>
                <input value={nuevoComercioNombre} onChange={e => setNuevoComercioNombre(e.target.value)}
                  placeholder="Nombre del comercio" className="field-base !py-2.5 text-sm" />
                <div className="grid grid-cols-2 gap-2">
                  <select value={nuevoComercioTipo} onChange={e => setNuevoComercioTipo(e.target.value)}
                    className="field-base field-select text-sm !py-2.5">
                    {TIPOS_COMERCIO.map(t => <option key={t.id} value={t.id}>{t.emoji} {t.nombre}</option>)}
                  </select>
                  <input value={nuevoComercioDir} onChange={e => setNuevoComercioDir(e.target.value)}
                    placeholder="Dirección (opcional)" className="field-base !py-2.5 text-sm" />
                </div>
                <button onClick={() => setCrearNuevoComercio(false)}
                  className="text-xs text-zinc-400 font-semibold self-start">← Elegir comercio existente</button>
              </>
            )}

            <div className="border-t border-zinc-100 dark:border-zinc-800 pt-3">
              <label className="text-[10px] text-zinc-400 uppercase tracking-wider font-medium">Precio ($)</label>
              <input type="number" value={precio} onChange={e => setPrecio(e.target.value)}
                placeholder="Ej: 4500" className="field-base !py-2.5 text-sm mt-1" autoFocus />
            </div>

            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={enOferta} onChange={e => setEnOferta(e.target.checked)}
                className="w-4 h-4 rounded accent-[var(--mango)]" />
              <span className="text-sm text-zinc-600 dark:text-zinc-300">¿Está en oferta?</span>
            </label>

            {enOferta && (
              <div>
                <label className="text-[10px] text-zinc-400 uppercase tracking-wider font-medium">Precio de oferta ($)</label>
                <input type="number" value={precioOferta} onChange={e => setPrecioOferta(e.target.value)}
                  placeholder="Precio con descuento" className="field-base !py-2.5 text-sm mt-1" />
              </div>
            )}

            <button onClick={handleGuardar} disabled={guardando || !precio}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-[var(--mango)] to-[var(--mango-dark)]
                text-sm font-bold text-[var(--charcoal)] disabled:opacity-40 press-scale mt-1">
              {guardando ? 'Guardando...' : '💰 Cargar precio'}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

// ── PÁGINA PRINCIPAL ─────────────────────────────────────────
export function MercadoPage() {
  const { usuario } = useAuthContext()
  const { ubicacion, cambiarUbicacion } = useUbicacion()
  const { query, resultados, cargando, error, buscarConDebounce } = useBusqueda()
  const { comercios } = useComercios(ubicacion.ciudad, ubicacion.provincia)
  const [categoriaFiltro, setCategoriaFiltro] = useState(null)
  const [productoSeleccionado, setProductoSeleccionado] = useState(null)
  const [mostrarModalPrecio, setMostrarModalPrecio] = useState(false)

  const handleSearch = useCallback((texto) => {
    buscarConDebounce(texto, ubicacion.ciudad, ubicacion.provincia)
  }, [buscarConDebounce, ubicacion])

  const resultadosFiltrados = categoriaFiltro
    ? resultados.filter(r => r.categoria === categoriaFiltro)
    : resultados

  // Vista de detalle
  if (productoSeleccionado) {
    return (
      <div className="animate-in fade-in duration-500">
        <PageWrapper>
          <PageHeader
            titulo="🛒 Mercado"
            subtitulo="Detalle de producto"
          />
          <DetalleProducto
            producto={productoSeleccionado}
            ciudad={ubicacion.ciudad}
            provincia={ubicacion.provincia}
            onVolver={() => setProductoSeleccionado(null)}
            onCargarPrecio={(prod) => {
              setMostrarModalPrecio(true)
            }}
          />
        </PageWrapper>
      </div>
    )
  }

  // Vista principal
  return (
    <div className="animate-in fade-in duration-500">
      <PageWrapper>
        <PageHeader
          titulo="🛒 Mercado"
          subtitulo="Compará precios cerca tuyo"
        />

        <SelectorUbicacion
          ubicacion={ubicacion}
          onChange={cambiarUbicacion}
        />

        <SearchBar
          query={query}
          onChange={handleSearch}
          cargando={cargando}
        />

        <ChipsCategorias
          seleccionada={categoriaFiltro}
          onSelect={setCategoriaFiltro}
        />

        {error && (
          <div className="mb-4 px-4 py-3 rounded-2xl bg-red-50 dark:bg-red-900/15
            border border-red-200 dark:border-red-800/40 text-sm text-red-600 dark:text-red-400">
            {error}
          </div>
        )}

        {/* Resultados */}
        {!query || query.length < 2 ? (
          <EstadoInicial onSearch={handleSearch} />
        ) : resultadosFiltrados.length === 0 && !cargando ? (
          <SinResultados query={query} />
        ) : (
          <div className="flex flex-col gap-3">
            {!cargando && (
              <p className="text-xs text-zinc-400 px-1">
                {resultadosFiltrados.length} resultado{resultadosFiltrados.length !== 1 ? 's' : ''}
              </p>
            )}
            {resultadosFiltrados.map(prod => (
              <ResultadoCard
                key={prod.producto_id}
                producto={prod}
                onSelect={setProductoSeleccionado}
              />
            ))}
          </div>
        )}

        <p className="text-[10px] text-zinc-400 text-center mt-8 pb-4">
          Precios cargados por la comunidad · Mercado de Manguito 🥭
        </p>
      </PageWrapper>

      {/* FAB — Cargar precio */}
      {usuario && (
        <button
          onClick={() => setMostrarModalPrecio(true)}
          className="fixed bottom-20 right-4 md:bottom-8 md:right-8 z-30
            w-14 h-14 rounded-2xl flex items-center justify-center
            text-[var(--charcoal)] text-xl shadow-lg press-scale
            animate-in zoom-in duration-300"
          style={{
            background: 'var(--gradient-mango)',
            boxShadow: '0 8px 24px rgba(245,166,35,0.4), 0 2px 8px rgba(0,0,0,0.15)',
          }}
          title="Cargar un precio"
        >
          ＋
        </button>
      )}

      {/* Modal de carga */}
      {mostrarModalPrecio && (
        <ModalCargarPrecio
          onCerrar={() => setMostrarModalPrecio(false)}
          comercios={comercios}
          ubicacion={ubicacion}
        />
      )}
    </div>
  )
}
