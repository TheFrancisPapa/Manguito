// src/pages/Mercado/index.jsx — Buscador de precios "Mercado"
import { useState, useCallback } from 'react'
import { PageWrapper, PageHeader } from '../../components/layout'
import { useAuthContext } from '../../context/AuthContext'
import {
  useUbicacion, useBusqueda, usePreciosProducto, useComercios, usePopulares,
  votarPrecio, actualizarPrecio,
  PROVINCIAS_AR, CIUDADES_POR_PROVINCIA, CATEGORIAS_PRODUCTO, TIPOS_COMERCIO, CANALES_COMPRA,
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
  const tipoInfo = TIPOS_COMERCIO.find(t => t.id === producto.comercio_mejor_tipo)
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
          <div className="flex items-center gap-2 mt-2 flex-wrap">
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
                {producto.precio_mejor_retornable && (
                  <span className="px-1.5 py-0.5 rounded-md text-[9px] font-black
                    bg-sky-100 dark:bg-sky-900/30 text-sky-600 dark:text-sky-400 uppercase flex-shrink-0">
                    ♻️ Retornable
                  </span>
                )}
                <span className="text-[10px] text-zinc-400 ml-auto flex-shrink-0">
                  {producto.cant_comercios} comercio{producto.cant_comercios !== 1 ? 's' : ''}
                </span>
              </>
            ) : (
              <span className="text-xs text-zinc-400 italic">Sin precios aún</span>
            )}
          </div>
          {/* Dónde se consigue al mejor precio */}
          {producto.comercio_mejor && (
            <div className="flex items-center gap-1.5 mt-2 pt-1.5 border-t border-zinc-100 dark:border-zinc-800">
              <span className="text-[11px]">{tipoInfo?.emoji || '🏪'}</span>
              <p className="text-[11px] text-zinc-500 dark:text-zinc-400 truncate">
                <span className="font-semibold">{producto.comercio_mejor}</span>
                {producto.comercio_mejor_dir && (
                  <span className="text-zinc-400 dark:text-zinc-500"> · 📍 {producto.comercio_mejor_dir}</span>
                )}
              </p>
            </div>
          )}
        </div>
      </div>
    </button>
  )
}

// ── Vista detalle: precios de un producto ────────────────────
function DetalleProducto({ producto, ciudad, provincia, onVolver, onCargarPrecio }) {
  const { precios, cargando, recargar } = usePreciosProducto(producto.producto_id, ciudad, provincia)
  const catInfo = CATEGORIAS_PRODUCTO.find(c => c.id === producto.categoria)
  const [votando, setVotando] = useState(null)
  const [editandoPrecioId, setEditandoPrecioId] = useState(null)
  const [nuevoPrecioInput, setNuevoPrecioInput] = useState('')
  const [guardandoPrecio, setGuardandoPrecio] = useState(false)
  const [canalFiltro, setCanalFiltro] = useState(null)

  // Filtrar precios por canal
  const preciosFiltrados = canalFiltro
    ? precios.filter(p => p.canal === canalFiltro)
    : precios

  // Estadísticas de precios
  const precioMin = preciosFiltrados.length ? Math.min(...preciosFiltrados.map(p => p.en_oferta && p.precio_oferta ? p.precio_oferta : p.precio)) : 0
  const precioMax = preciosFiltrados.length ? Math.max(...preciosFiltrados.map(p => p.precio)) : 0
  const ahorro = precioMax > 0 ? precioMax - precioMin : 0
  const ahorroPct = precioMax > 0 ? Math.round((ahorro / precioMax) * 100) : 0

  const handleVoto = async (precioId, tipo) => {
    setVotando(precioId)
    try {
      await votarPrecio(precioId, tipo)
      await recargar()
    } catch (e) { console.error(e) }
    finally { setVotando(null) }
  }

  const handleActualizarPrecio = async (precioId) => {
    if (!nuevoPrecioInput || isNaN(nuevoPrecioInput) || Number(nuevoPrecioInput) <= 0) return
    setGuardandoPrecio(true)
    try {
      await actualizarPrecio(precioId, Number(nuevoPrecioInput))
      await recargar()
      setEditandoPrecioId(null)
      setNuevoPrecioInput('')
    } catch (e) { console.error(e) }
    finally { setGuardandoPrecio(false) }
  }

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
          <div className="flex-1">
            <h2 className="text-lg font-bold text-zinc-900 dark:text-white">{producto.nombre}</h2>
            <p className="text-sm text-zinc-400">
              {producto.marca} {producto.presentacion && `· ${producto.presentacion}`}
            </p>
          </div>
        </div>
      </div>

      {/* Tarjeta de ahorro — solo si hay más de 1 precio */}
      {precios.length > 1 && ahorro > 0 && (
        <div className="card-premium p-4 mb-4 border-l-4 border-emerald-500"
          style={{ background: 'linear-gradient(135deg, rgba(16,185,129,0.06) 0%, transparent 100%)' }}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
                💡 Ahorro potencial
              </p>
              <p className="text-[11px] text-zinc-400 mt-0.5">
                Comprando en el más barato vs el más caro
              </p>
            </div>
            <div className="text-right">
              <p className="text-xl font-black text-emerald-600 dark:text-emerald-400">
                {fmtPrecio(ahorro)}
              </p>
              <p className="text-[10px] font-bold text-emerald-500/70">
                −{ahorroPct}% menos
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Filtro por canal */}
      {precios.length > 0 && (
        <div className="flex gap-1.5 overflow-x-auto scrollbar-hide pb-2 mb-3 -mx-1 px-1">
          <button
            onClick={() => setCanalFiltro(null)}
            className={`flex-shrink-0 px-2.5 py-1.5 rounded-full text-[10px] font-bold border transition-all ${
              !canalFiltro
                ? 'bg-[var(--mango)]/10 border-[var(--mango)]/30 text-[var(--mango-dark)] dark:text-[var(--mango)]'
                : 'border-zinc-200 dark:border-zinc-700 text-zinc-500 hover:border-zinc-300'
            }`}
          >
            Todos
          </button>
          {CANALES_COMPRA.map(canal => {
            const count = precios.filter(p => p.canal === canal.id).length
            if (count === 0) return null
            return (
              <button
                key={canal.id}
                onClick={() => setCanalFiltro(canalFiltro === canal.id ? null : canal.id)}
                className={`flex-shrink-0 px-2.5 py-1.5 rounded-full text-[10px] font-bold border transition-all whitespace-nowrap ${
                  canalFiltro === canal.id
                    ? 'bg-[var(--mango)]/10 border-[var(--mango)]/30 text-[var(--mango-dark)] dark:text-[var(--mango)]'
                    : 'border-zinc-200 dark:border-zinc-700 text-zinc-500 hover:border-zinc-300'
                }`}
              >
                {canal.emoji} {canal.nombre} ({count})
              </button>
            )
          })}
        </div>
      )}

      {/* Lista de precios */}
      <h3 className="text-sm font-bold text-zinc-500 dark:text-zinc-400 mb-3 flex items-center gap-2">
        💰 Precios en {ciudad || 'tu zona'}
        <span className="text-[10px] font-normal text-zinc-400 ml-auto">
          {preciosFiltrados.length} comercio{preciosFiltrados.length !== 1 ? 's' : ''}
        </span>
        {cargando && <div className="w-4 h-4 border-2 border-[var(--mango)]/30 border-t-[var(--mango)] rounded-full animate-spin" />}
      </h3>

      {preciosFiltrados.length === 0 && !cargando ? (
        <div className="card-premium p-6 text-center">
          <p className="text-3xl mb-2">🏷️</p>
          <p className="text-sm font-bold text-zinc-600 dark:text-zinc-300">
            {canalFiltro
              ? `No hay precios por ${CANALES_COMPRA.find(c => c.id === canalFiltro)?.nombre || canalFiltro}`
              : `Aún no hay precios para este producto en ${ciudad}`}
          </p>
          <p className="text-xs text-zinc-400 mt-1">
            {canalFiltro ? 'Probá cambiando el filtro de canal' : '¡Sé el primero en cargar un precio!'}
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {(() => {
            // Agrupar precios por comercio
            const grupos = {}
            preciosFiltrados.forEach(p => {
              const key = p.comercio_nombre + '|' + (p.comercio_dir || '')
              if (!grupos[key]) grupos[key] = { info: p, precios: [] }
              grupos[key].precios.push(p)
            })
            // Ordenar grupos por precio más bajo del local (o el menor disponible)
            const gruposArr = Object.values(grupos).sort((a, b) => {
              const precioA = a.precios.find(p => p.canal === 'local') || a.precios[0]
              const precioB = b.precios.find(p => p.canal === 'local') || b.precios[0]
              const valA = precioA.en_oferta && precioA.precio_oferta ? precioA.precio_oferta : precioA.precio
              const valB = precioB.en_oferta && precioB.precio_oferta ? precioB.precio_oferta : precioB.precio
              return valA - valB
            })

            return gruposArr.map((grupo, gi) => {
              const tipoInfo = TIPOS_COMERCIO.find(t => t.id === grupo.info.comercio_tipo)
              const pLocal = grupo.precios.find(p => p.canal === 'local')
              const pSecundarios = grupo.precios.filter(p => p.canal !== 'local')
              const pPrincipal = pLocal || grupo.precios[0]
              const precioEfectivo = pPrincipal.en_oferta && pPrincipal.precio_oferta
                ? pPrincipal.precio_oferta : pPrincipal.precio
              const isEditing = editandoPrecioId === pPrincipal.precio_id

              return (
                <div key={`${grupo.info.comercio_nombre}-${gi}`}
                  className={`card-premium p-4 transition-all ${gi === 0 ? 'ring-2 ring-emerald-500/25' : ''}`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg flex-shrink-0 ${
                        gi === 0 ? 'bg-emerald-100 dark:bg-emerald-900/30' : 'bg-zinc-100 dark:bg-zinc-800'
                      }`}>
                        {tipoInfo?.emoji || '🏪'}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <p className="text-sm font-bold text-zinc-900 dark:text-white truncate">
                            {grupo.info.comercio_nombre}
                          </p>
                          {pPrincipal.en_oferta && (
                            <span className="flex-shrink-0 px-1.5 py-0.5 rounded-md text-[9px] font-black
                              bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 uppercase">Oferta</span>
                          )}
                          {pPrincipal.es_retornable && (
                            <span className="flex-shrink-0 px-1.5 py-0.5 rounded-md text-[9px] font-black
                              bg-sky-100 dark:bg-sky-900/30 text-sky-600 dark:text-sky-400 uppercase">♻️ Ret.</span>
                          )}
                        </div>
                        <p className="text-[11px] text-zinc-400 truncate">
                          {grupo.info.comercio_dir || tipoInfo?.nombre}
                        </p>
                        {/* Badge del canal principal si NO es local */}
                        {!pLocal && (
                          <span className={`inline-flex items-center gap-0.5 mt-0.5 px-1.5 py-0.5 rounded-md text-[9px] font-black uppercase w-fit
                            ${pPrincipal.canal === 'pedidos_ya' ? 'bg-violet-100 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400'
                            : pPrincipal.canal === 'rappi' ? 'bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400'
                            : pPrincipal.canal === 'online' ? 'bg-sky-100 dark:bg-sky-900/30 text-sky-600 dark:text-sky-400'
                            : 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400'}`}>
                            {CANALES_COMPRA.find(c => c.id === pPrincipal.canal)?.emoji} {CANALES_COMPRA.find(c => c.id === pPrincipal.canal)?.nombre}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0 ml-3">
                      <p className={`text-lg font-black ${
                        gi === 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-zinc-900 dark:text-white'
                      }`}>
                        {fmtPrecio(precioEfectivo)}
                      </p>
                      {pPrincipal.en_oferta && pPrincipal.precio_oferta && (
                        <p className="text-[10px] text-zinc-400 line-through">{fmtPrecio(pPrincipal.precio)}</p>
                      )}
                      {pLocal && <p className="text-[9px] text-emerald-500 font-semibold">🏪 En el local</p>}
                      <p className="text-[10px] text-zinc-400">{tiempoDesde(pPrincipal.updated_at)}</p>
                    </div>
                  </div>

                  {/* Precios secundarios (delivery, online) — letra chica */}
                  {pSecundarios.length > 0 && (
                    <div className="mt-2 pt-2 border-t border-zinc-100 dark:border-zinc-800
                      flex flex-wrap gap-x-4 gap-y-1">
                      {pSecundarios.map(ps => {
                        const ci = CANALES_COMPRA.find(c => c.id === ps.canal)
                        const colorClass = ps.canal === 'pedidos_ya' ? 'text-violet-500'
                          : ps.canal === 'rappi' ? 'text-orange-500'
                          : ps.canal === 'online' ? 'text-sky-500' : 'text-zinc-400'
                        return (
                          <p key={ps.id} className={`text-[10px] ${colorClass} flex items-center gap-1`}>
                            <span>{ci?.emoji}</span>
                            <span className="font-semibold">{ci?.nombre}:</span>
                            <span className="font-black">{fmtPrecio(ps.en_oferta && ps.precio_oferta ? ps.precio_oferta : ps.precio)}</span>
                          </p>
                        )
                      })}
                    </div>
                  )}

                  {/* Retornable info */}
                  {pPrincipal.es_retornable && (
                    <div className="mt-2 pt-2 border-t border-sky-100 dark:border-sky-900/30
                      flex items-start gap-2 px-1">
                      <span className="text-sm flex-shrink-0">♻️</span>
                      <p className="text-[10px] text-sky-600 dark:text-sky-400 leading-relaxed">
                        <span className="font-bold">Precio con envase retornable.</span> Sin envase, el precio será más alto.
                      </p>
                    </div>
                  )}

                  {/* Editor inline */}
                  {isEditing && (
                    <div className="mt-3 pt-3 border-t border-amber-200 dark:border-amber-800/40
                      bg-amber-50/50 dark:bg-amber-900/10 -mx-4 -mb-4 px-4 pb-4 rounded-b-2xl
                      animate-in slide-in-from-top-2 duration-200">
                      <p className="text-[11px] font-bold text-amber-700 dark:text-amber-300 mb-2 flex items-center gap-1.5">
                        ✏️ ¿Cuánto sale ahora?
                      </p>
                      <div className="flex items-center gap-2">
                        <div className="relative flex-1">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-bold text-zinc-400">$</span>
                          <input type="number" value={nuevoPrecioInput}
                            onChange={e => setNuevoPrecioInput(e.target.value)}
                            placeholder={String(pPrincipal.precio)}
                            className="field-base !py-2.5 !pl-8 !pr-3 text-sm font-bold"
                            inputMode="decimal" autoFocus />
                        </div>
                        <button onClick={() => handleActualizarPrecio(pPrincipal.precio_id)}
                          disabled={guardandoPrecio || !nuevoPrecioInput}
                          className="px-4 py-2.5 rounded-xl text-xs font-bold
                            bg-gradient-to-r from-[var(--mango)] to-[var(--mango-dark)]
                            text-[var(--charcoal)] disabled:opacity-40 press-scale transition-all">
                          {guardandoPrecio ? '...' : '✓ Actualizar'}
                        </button>
                        <button onClick={() => { setEditandoPrecioId(null); setNuevoPrecioInput('') }}
                          className="px-2 py-2.5 rounded-xl text-xs font-bold text-zinc-400
                            hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all">✕</button>
                      </div>
                    </div>
                  )}

                  {/* Footer: votos */}
                  {!isEditing && (
                    <div className="mt-2 pt-2 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
                      {gi === 0 && gruposArr.length > 1 ? (
                        <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
                          🏆 Mejor precio
                        </span>
                      ) : (
                        <span className="text-[10px] text-zinc-400">
                          {pPrincipal.votos_ok > 0 && `✓ ${pPrincipal.votos_ok} confirmaron`}
                          {pPrincipal.votos_desactual > 0 && ` · ⚠ ${pPrincipal.votos_desactual} reportaron`}
                        </span>
                      )}
                      <div className="flex items-center gap-1">
                        <button onClick={() => handleVoto(pPrincipal.precio_id, 'ok')}
                          disabled={votando === pPrincipal.precio_id}
                          className="px-2 py-1 rounded-lg text-[10px] font-bold
                            bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400
                            hover:bg-emerald-100 active:scale-95 transition-all disabled:opacity-50">
                          👍 Confirmo
                        </button>
                        <button onClick={() => { setEditandoPrecioId(pPrincipal.precio_id); setNuevoPrecioInput('') }}
                          disabled={votando === pPrincipal.precio_id}
                          className="px-2 py-1 rounded-lg text-[10px] font-bold
                            bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400
                            hover:bg-amber-100 active:scale-95 transition-all disabled:opacity-50">
                          📢 Actualizar
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )
            })
          })()}
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

// ── Modal para cargar precio (componente externo) ────────────
import ModalCargarPrecio from './ModalCargarPrecio'


// ── PÁGINA PRINCIPAL ─────────────────────────────────────────
export function MercadoPage() {
  const { usuario } = useAuthContext()
  const { ubicacion, cambiarUbicacion } = useUbicacion()
  const { query, resultados, cargando, error, buscarConDebounce } = useBusqueda()
  const { comercios } = useComercios(ubicacion.ciudad, ubicacion.provincia)
  const { populares } = usePopulares(ubicacion.ciudad, ubicacion.provincia)
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
          <>
            <EstadoInicial onSearch={handleSearch} />

            {/* Productos populares */}
            {populares.length > 0 && (
              <div className="mt-4">
                <h3 className="text-sm font-bold text-zinc-600 dark:text-zinc-300 mb-3 flex items-center gap-2">
                  🔥 Populares en {ubicacion.ciudad}
                </h3>
                <div className="flex flex-col gap-2">
                  {populares.map(prod => (
                    <ResultadoCard
                      key={prod.producto_id}
                      producto={prod}
                      onSelect={setProductoSeleccionado}
                    />
                  ))}
                </div>
              </div>
            )}
          </>
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
