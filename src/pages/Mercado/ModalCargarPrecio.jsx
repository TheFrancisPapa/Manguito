// src/pages/Mercado/ModalCargarPrecio.jsx
import { useState, useEffect, useMemo } from 'react'
import {
  crearComercio, crearProducto, reportarPrecio,
  CATEGORIAS_PRODUCTO, TIPOS_COMERCIO,
  ETIQUETAS_POR_CATEGORIA, LOCALES_CORRIENTES,
} from '../../hooks/useMercado'

// ── Step indicator ───────────────────────────────────────────
function StepIndicator({ paso, total = 3 }) {
  return (
    <div className="flex items-center gap-2 mb-5">
      {Array.from({ length: total }, (_, i) => {
        const step = i + 1
        const active = paso === step
        const done = paso > step
        return (
          <div key={step} className="flex items-center gap-2 flex-1">
            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold
              transition-all duration-300 flex-shrink-0 ${
              done ? 'bg-emerald-500 text-white'
              : active ? 'bg-gradient-to-br from-[var(--mango)] to-[var(--mango-dark)] text-[var(--charcoal)] shadow-md'
              : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-400'
            }`}>
              {done ? '✓' : step}
            </div>
            {step < total && (
              <div className={`flex-1 h-0.5 rounded-full transition-all duration-300 ${
                done ? 'bg-emerald-400' : 'bg-zinc-200 dark:bg-zinc-700'
              }`} />
            )}
          </div>
        )
      })}
    </div>
  )
}

// ── Etiqueta chip selector ───────────────────────────────────
function EtiquetaSelector({ categoria, seleccionada, onSelect }) {
  const etiquetas = ETIQUETAS_POR_CATEGORIA[categoria] || []
  if (etiquetas.length <= 1) return null

  return (
    <div className="flex flex-col gap-2">
      <label className="text-[10px] text-zinc-400 uppercase tracking-wider font-medium">
        🏷️ Etiqueta del producto
      </label>
      <div className="flex flex-wrap gap-1.5 max-h-[140px] overflow-y-auto scrollbar-hide
        p-2 rounded-xl bg-zinc-50/50 dark:bg-zinc-800/30 border border-zinc-100 dark:border-zinc-800">
        {etiquetas.map(et => (
          <button
            key={et.id}
            type="button"
            onClick={() => onSelect(et.id === seleccionada ? '' : et.id)}
            className={`px-2.5 py-1.5 rounded-lg text-[11px] font-semibold border transition-all
              whitespace-nowrap press-light ${
              seleccionada === et.id
                ? 'bg-[var(--mango)]/12 border-[var(--mango)]/40 text-[var(--mango-dark)] dark:text-[var(--mango)]'
                : 'border-zinc-200 dark:border-zinc-700 text-zinc-500 hover:border-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800'
            }`}
          >
            {et.emoji} {et.nombre}
          </button>
        ))}
      </div>
    </div>
  )
}

// ── Local/Lugar card ─────────────────────────────────────────
function LocalCard({ local, selected, onSelect }) {
  const tipo = TIPOS_COMERCIO.find(t => t.id === local.tipo)
  return (
    <button
      type="button"
      onClick={onSelect}
      className={`w-full text-left p-3 rounded-xl border transition-all press-light ${
        selected
          ? 'border-[var(--mango)]/50 bg-[var(--mango)]/6 dark:bg-[var(--mango)]/4 shadow-sm'
          : 'border-zinc-150 dark:border-zinc-700/60 bg-white dark:bg-zinc-800/50 hover:border-zinc-300'
      }`}
    >
      <div className="flex items-center gap-2.5">
        <div className={`w-9 h-9 rounded-lg flex items-center justify-center text-lg flex-shrink-0 ${
          selected ? 'bg-[var(--mango)]/15' : 'bg-zinc-100 dark:bg-zinc-800'
        }`}>
          {tipo?.emoji || '🏪'}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-bold text-zinc-800 dark:text-white truncate">{local.nombre}</p>
          <p className="text-[11px] text-zinc-400 truncate flex items-center gap-1">
            📍 {local.direccion}
          </p>
        </div>
        {selected && (
          <div className="w-5 h-5 rounded-full bg-[var(--mango)] flex items-center justify-center flex-shrink-0">
            <span className="text-[10px] text-white font-bold">✓</span>
          </div>
        )}
      </div>
    </button>
  )
}

// ── Field wrapper ────────────────────────────────────────────
function FieldGroup({ label, emoji, children }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-[10px] text-zinc-400 uppercase tracking-wider font-medium flex items-center gap-1">
        {emoji && <span>{emoji}</span>} {label}
      </label>
      {children}
    </div>
  )
}

// ══════════════════════════════════════════════════════════════
// ██  MODAL PRINCIPAL  ████████████████████████████████████████
// ══════════════════════════════════════════════════════════════
export default function ModalCargarPrecio({ onCerrar, comercios, ubicacion, productoPreseleccionado = null }) {
  const [paso, setPaso] = useState(productoPreseleccionado ? 2 : 1)

  // Paso 1 — Producto
  const [productoNombre, setProductoNombre] = useState('')
  const [productoMarca, setProductoMarca] = useState('')
  const [productoCategoria, setProductoCategoria] = useState('almacen')
  const [productoPresentacion, setProductoPresentacion] = useState('')
  const [productoEtiqueta, setProductoEtiqueta] = useState('')
  const [productoId, setProductoId] = useState(productoPreseleccionado?.producto_id || null)

  // Paso 2 — Lugar
  const [localSeleccionado, setLocalSeleccionado] = useState(null) // from LOCALES_CORRIENTES
  const [comercioId, setComercioId] = useState('')
  const [usarLocalConocido, setUsarLocalConocido] = useState(true)
  const [crearNuevoComercio, setCrearNuevoComercio] = useState(false)
  const [nuevoComercioNombre, setNuevoComercioNombre] = useState('')
  const [nuevoComercioTipo, setNuevoComercioTipo] = useState('supermercado')
  const [nuevoComercioDir, setNuevoComercioDir] = useState('')
  const [busquedaLocal, setBusquedaLocal] = useState('')

  // Paso 3 — Precio
  const [precio, setPrecio] = useState('')
  const [enOferta, setEnOferta] = useState(false)
  const [precioOferta, setPrecioOferta] = useState('')
  const [esRetornable, setEsRetornable] = useState(false)

  // General
  const [guardando, setGuardando] = useState(false)
  const [exito, setExito] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')

  useEffect(() => {
    if (productoPreseleccionado) {
      setProductoNombre(productoPreseleccionado.nombre || '')
      setProductoMarca(productoPreseleccionado.marca || '')
    }
  }, [productoPreseleccionado])

  // Filter known locales
  const localesFiltrados = useMemo(() => {
    const all = LOCALES_CORRIENTES.filter(l =>
      l.ciudad === ubicacion.ciudad && l.provincia === ubicacion.provincia
    )
    if (!busquedaLocal.trim()) return all
    const q = busquedaLocal.toLowerCase()
    return all.filter(l => l.nombre.toLowerCase().includes(q) || l.direccion.toLowerCase().includes(q))
  }, [ubicacion, busquedaLocal])

  // Validations per step
  const paso1Valido = productoNombre.trim().length > 0 && productoMarca.trim().length > 0
  const paso2Valido = usarLocalConocido
    ? localSeleccionado !== null
    : crearNuevoComercio ? nuevoComercioNombre.trim().length > 0 : comercioId !== ''

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

      // Create product if needed
      if (!finalProductoId) {
        if (!productoNombre.trim() || !productoMarca.trim()) {
          setErrorMsg('Completá nombre y marca del producto')
          setGuardando(false)
          return
        }
        const prod = await crearProducto({
          nombre: productoNombre, marca: productoMarca,
          categoria: productoCategoria,
          subcategoria: productoEtiqueta || null,
          presentacion: productoPresentacion,
        })
        finalProductoId = prod.id
      }

      // Create or select comercio
      if (usarLocalConocido && localSeleccionado !== null) {
        const local = localesFiltrados[localSeleccionado] || LOCALES_CORRIENTES[localSeleccionado]
        if (local) {
          // Check if comercio already exists by name
          const existing = comercios.find(c => c.nombre === local.nombre)
          if (existing) {
            finalComercioId = existing.id
          } else {
            const com = await crearComercio({
              nombre: local.nombre, tipo: local.tipo,
              direccion: local.direccion, ciudad: local.ciudad,
              provincia: local.provincia,
            })
            finalComercioId = com.id
          }
        }
      } else if (crearNuevoComercio) {
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
        setErrorMsg('Seleccioná un lugar / comercio')
        setGuardando(false)
        return
      }

      await reportarPrecio({
        productoId: finalProductoId, comercioId: finalComercioId,
        precio: Number(precio), enOferta,
        precioOferta: enOferta && precioOferta ? Number(precioOferta) : null,
        esRetornable,
      })

      setExito(true)
      setTimeout(onCerrar, 1500)
    } catch (e) {
      setErrorMsg(e.message || 'Error al guardar')
    } finally {
      setGuardando(false)
    }
  }

  // ── Success state ──────────────────────────────────────────
  if (exito) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onCerrar}>
        <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
        <div className="relative bg-white dark:bg-zinc-900 rounded-2xl p-8 text-center shadow-xl animate-in zoom-in duration-300">
          <p className="text-5xl mb-3">✅</p>
          <p className="text-lg font-bold text-zinc-900 dark:text-white">¡Precio cargado!</p>
          <p className="text-sm text-zinc-400 mt-1">Gracias por contribuir a la comunidad 🥭</p>
        </div>
      </div>
    )
  }

  // ── Main render ────────────────────────────────────────────
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center" onClick={onCerrar}>
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
      <div
        className="relative w-full max-w-lg bg-white dark:bg-zinc-900 rounded-t-3xl sm:rounded-2xl
          shadow-xl max-h-[90vh] overflow-hidden animate-in slide-in-from-bottom duration-300
          flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        {/* Handle bar (mobile) */}
        <div className="sm:hidden pt-2 pb-1 flex justify-center">
          <div className="sheet-handle" />
        </div>

        {/* Header */}
        <div className="px-6 pt-4 pb-2 flex items-center justify-between flex-shrink-0">
          <div>
            <h3 className="text-lg font-bold text-zinc-900 dark:text-white font-display">
              🏷️ Cargar Producto
            </h3>
            <p className="text-[11px] text-zinc-400 mt-0.5">
              {paso === 1 ? 'Información del producto' : paso === 2 ? 'Lugar de compra' : 'Precio'}
            </p>
          </div>
          <button onClick={onCerrar} className="w-8 h-8 flex items-center justify-center rounded-full
            bg-zinc-100 dark:bg-zinc-800 text-zinc-400 text-xs hover:bg-zinc-200 transition-colors">✕</button>
        </div>

        {/* Content */}
        <div className="px-6 pb-6 overflow-y-auto flex-1">
          <StepIndicator paso={paso} />

          {errorMsg && (
            <div className="mb-4 px-3.5 py-2.5 rounded-xl bg-red-50 dark:bg-red-900/15
              text-xs text-red-500 font-medium flex items-center gap-2">
              <span>⚠️</span> {errorMsg}
            </div>
          )}

          {/* ─── PASO 1: Producto ─────────────────────────── */}
          {paso === 1 && (
            <div className="flex flex-col gap-4 animate-in fade-in duration-200">
              <FieldGroup label="Nombre del producto" emoji="📦">
                <input value={productoNombre} onChange={e => setProductoNombre(e.target.value)}
                  placeholder="Ej: Coca Cola, Nesquik, Arroz..."
                  className="field-base !py-3 text-sm !px-4" autoFocus />
              </FieldGroup>

              <div className="grid grid-cols-2 gap-3">
                <FieldGroup label="Marca" emoji="🏭">
                  <input value={productoMarca} onChange={e => setProductoMarca(e.target.value)}
                    placeholder="Ej: Arcor, Quilmes"
                    className="field-base !py-3 text-sm !px-4" />
                </FieldGroup>
                <FieldGroup label="Cantidad" emoji="⚖️">
                  <input value={productoPresentacion} onChange={e => setProductoPresentacion(e.target.value)}
                    placeholder="Ej: 500g, 1.5L, x6"
                    className="field-base !py-3 text-sm !px-4" />
                </FieldGroup>
              </div>

              <FieldGroup label="Categoría" emoji="📂">
                <select value={productoCategoria}
                  onChange={e => { setProductoCategoria(e.target.value); setProductoEtiqueta('') }}
                  className="field-base field-select text-sm !py-3 !px-4">
                  {CATEGORIAS_PRODUCTO.map(c => <option key={c.id} value={c.id}>{c.emoji} {c.nombre}</option>)}
                </select>
              </FieldGroup>

              <EtiquetaSelector
                categoria={productoCategoria}
                seleccionada={productoEtiqueta}
                onSelect={setProductoEtiqueta}
              />

              <button onClick={() => { setErrorMsg(''); setPaso(2) }} disabled={!paso1Valido}
                className="w-full py-3 rounded-2xl bg-gradient-to-r from-[var(--mango)] to-[var(--mango-dark)]
                  text-sm font-bold text-[var(--charcoal)] disabled:opacity-40 press-scale mt-1
                  shadow-lg transition-all"
                style={{ boxShadow: paso1Valido ? '0 4px 16px rgba(245,166,35,0.3)' : 'none' }}>
                Siguiente — Elegir lugar →
              </button>
            </div>
          )}

          {/* ─── PASO 2: Lugar ────────────────────────────── */}
          {paso === 2 && (
            <div className="flex flex-col gap-4 animate-in fade-in duration-200">
              {!productoPreseleccionado && (
                <button onClick={() => setPaso(1)}
                  className="text-xs text-[var(--mango-dark)] dark:text-[var(--mango)] font-semibold self-start
                    flex items-center gap-1 press-light">
                  ← Cambiar producto
                </button>
              )}

              {/* Toggle: conocido vs nuevo */}
              <div className="flex rounded-xl bg-zinc-100 dark:bg-zinc-800 p-1 gap-1">
                <button onClick={() => { setUsarLocalConocido(true); setCrearNuevoComercio(false) }}
                  className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${
                    usarLocalConocido
                      ? 'bg-white dark:bg-zinc-700 text-zinc-900 dark:text-white shadow-sm'
                      : 'text-zinc-400'
                  }`}>
                  📍 Locales conocidos
                </button>
                <button onClick={() => { setUsarLocalConocido(false); setLocalSeleccionado(null) }}
                  className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${
                    !usarLocalConocido
                      ? 'bg-white dark:bg-zinc-700 text-zinc-900 dark:text-white shadow-sm'
                      : 'text-zinc-400'
                  }`}>
                  ✏️ Otro comercio
                </button>
              </div>

              {usarLocalConocido ? (
                <>
                  <input value={busquedaLocal} onChange={e => setBusquedaLocal(e.target.value)}
                    placeholder="🔍 Buscar local..."
                    className="field-base !py-2.5 text-sm !px-4" />
                  <div className="flex flex-col gap-2 max-h-[200px] overflow-y-auto scrollbar-hide">
                    {localesFiltrados.length === 0 ? (
                      <p className="text-xs text-zinc-400 text-center py-4">
                        No hay locales cargados para {ubicacion.ciudad}
                      </p>
                    ) : (
                      localesFiltrados.map((local, i) => (
                        <LocalCard
                          key={`${local.nombre}-${i}`}
                          local={local}
                          selected={localSeleccionado === i}
                          onSelect={() => setLocalSeleccionado(localSeleccionado === i ? null : i)}
                        />
                      ))
                    )}
                  </div>
                </>
              ) : (
                <>
                  {!crearNuevoComercio ? (
                    <>
                      <FieldGroup label="Seleccionar comercio existente" emoji="🏪">
                        <select value={comercioId} onChange={e => setComercioId(e.target.value)}
                          className="field-base field-select text-sm !py-3 !px-4">
                          <option value="">Elegí un comercio...</option>
                          {comercios.map(c => {
                            const t = TIPOS_COMERCIO.find(x => x.id === c.tipo)
                            return <option key={c.id} value={c.id}>{t?.emoji} {c.nombre}</option>
                          })}
                        </select>
                      </FieldGroup>
                      <button onClick={() => setCrearNuevoComercio(true)}
                        className="text-xs text-[var(--mango-dark)] dark:text-[var(--mango)] font-semibold
                          self-start flex items-center gap-1 press-light">
                        + Agregar comercio nuevo
                      </button>
                    </>
                  ) : (
                    <>
                      <FieldGroup label="Nombre del comercio" emoji="🏪">
                        <input value={nuevoComercioNombre} onChange={e => setNuevoComercioNombre(e.target.value)}
                          placeholder="Ej: Kiosco Don Raúl"
                          className="field-base !py-3 text-sm !px-4" />
                      </FieldGroup>
                      <div className="grid grid-cols-2 gap-3">
                        <FieldGroup label="Tipo" emoji="🏷️">
                          <select value={nuevoComercioTipo} onChange={e => setNuevoComercioTipo(e.target.value)}
                            className="field-base field-select text-sm !py-3 !px-4">
                            {TIPOS_COMERCIO.map(t => <option key={t.id} value={t.id}>{t.emoji} {t.nombre}</option>)}
                          </select>
                        </FieldGroup>
                        <FieldGroup label="Dirección" emoji="📍">
                          <input value={nuevoComercioDir} onChange={e => setNuevoComercioDir(e.target.value)}
                            placeholder="Calle y número"
                            className="field-base !py-3 text-sm !px-4" />
                        </FieldGroup>
                      </div>
                      <button onClick={() => setCrearNuevoComercio(false)}
                        className="text-xs text-zinc-400 font-semibold self-start press-light">
                        ← Elegir comercio existente
                      </button>
                    </>
                  )}
                </>
              )}

              <button onClick={() => { setErrorMsg(''); setPaso(3) }} disabled={!paso2Valido}
                className="w-full py-3 rounded-2xl bg-gradient-to-r from-[var(--mango)] to-[var(--mango-dark)]
                  text-sm font-bold text-[var(--charcoal)] disabled:opacity-40 press-scale mt-1
                  shadow-lg transition-all"
                style={{ boxShadow: paso2Valido ? '0 4px 16px rgba(245,166,35,0.3)' : 'none' }}>
                Siguiente — Cargar precio →
              </button>
            </div>
          )}

          {/* ─── PASO 3: Precio ───────────────────────────── */}
          {paso === 3 && (
            <div className="flex flex-col gap-4 animate-in fade-in duration-200">
              <button onClick={() => setPaso(2)}
                className="text-xs text-[var(--mango-dark)] dark:text-[var(--mango)] font-semibold self-start
                  flex items-center gap-1 press-light">
                ← Cambiar lugar
              </button>

              {/* Summary card */}
              <div className="card-premium p-4">
                <p className="text-[10px] text-zinc-400 uppercase tracking-wider font-medium mb-2">Resumen</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[var(--mango)]/8 flex items-center justify-center text-xl">
                    {CATEGORIAS_PRODUCTO.find(c => c.id === productoCategoria)?.emoji || '📦'}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-bold text-zinc-800 dark:text-white truncate">
                      {productoPreseleccionado?.nombre || productoNombre}
                    </p>
                    <p className="text-[11px] text-zinc-400 truncate">
                      {productoPreseleccionado?.marca || productoMarca}
                      {productoPresentacion && ` · ${productoPresentacion}`}
                      {productoEtiqueta && (() => {
                        const et = ETIQUETAS_POR_CATEGORIA[productoCategoria]?.find(e => e.id === productoEtiqueta)
                        return et ? ` · ${et.emoji} ${et.nombre}` : ''
                      })()}
                    </p>
                  </div>
                </div>
                {(usarLocalConocido && localSeleccionado !== null) && (
                  <div className="mt-2 pt-2 border-t border-zinc-100 dark:border-zinc-800">
                    <p className="text-[11px] text-zinc-400 flex items-center gap-1">
                      📍 {localesFiltrados[localSeleccionado]?.nombre} — {localesFiltrados[localSeleccionado]?.direccion}
                    </p>
                  </div>
                )}
              </div>

              <FieldGroup label="Precio ($)" emoji="💰">
                <input type="number" value={precio} onChange={e => setPrecio(e.target.value)}
                  placeholder="Ej: 4500"
                  className="field-base !py-3.5 text-base !px-4 font-bold" autoFocus
                  inputMode="decimal" />
              </FieldGroup>

              <label className="flex items-center gap-3 cursor-pointer p-3 rounded-xl
                bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-100 dark:border-zinc-800">
                <input type="checkbox" checked={enOferta} onChange={e => setEnOferta(e.target.checked)} />
                <div>
                  <span className="text-sm font-semibold text-zinc-700 dark:text-zinc-200">¿Está en oferta?</span>
                  <p className="text-[10px] text-zinc-400">Marcá si el precio es promocional</p>
                </div>
              </label>

              {enOferta && (
                <FieldGroup label="Precio de oferta ($)" emoji="🔥">
                  <input type="number" value={precioOferta} onChange={e => setPrecioOferta(e.target.value)}
                    placeholder="Precio con descuento"
                    className="field-base !py-3 text-sm !px-4" inputMode="decimal" />
                </FieldGroup>
              )}

              {/* Toggle retornable — solo para bebidas */}
              {(productoCategoria === 'bebidas' || productoPreseleccionado?.categoria === 'bebidas') && (
                <label className="flex items-start gap-3 cursor-pointer p-3 rounded-xl
                  bg-sky-50/60 dark:bg-sky-900/10 border border-sky-200/60 dark:border-sky-800/40">
                  <input type="checkbox" checked={esRetornable} onChange={e => setEsRetornable(e.target.checked)}
                    className="mt-0.5" />
                  <div>
                    <span className="text-sm font-semibold text-sky-700 dark:text-sky-300 flex items-center gap-1.5">
                      ♻️ ¿Envase retornable?
                    </span>
                    <p className="text-[10px] text-sky-500/80 dark:text-sky-400/70 mt-0.5 leading-relaxed">
                      Marcá esto si entregaste un envase retornable y te hicieron descuento.
                      Sin envase, el precio suele ser más alto.
                    </p>
                  </div>
                </label>
              )}

              <button onClick={handleGuardar} disabled={guardando || !precio}
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-[var(--mango)] to-[var(--mango-dark)]
                  text-sm font-bold text-[var(--charcoal)] disabled:opacity-40 press-scale mt-1
                  shadow-lg transition-all"
                style={{ boxShadow: '0 4px 16px rgba(245,166,35,0.3)' }}>
                {guardando ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="w-4 h-4 border-2 border-[var(--charcoal)]/30 border-t-[var(--charcoal)] rounded-full animate-spin" />
                    Guardando...
                  </span>
                ) : '💰 Cargar precio'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
