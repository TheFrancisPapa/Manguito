// src/pages/Inversiones/FeedNoticias.jsx
// Canal de noticias financieras con resúmenes IA integrados

import { useState } from 'react'
import { useNoticias } from '../../hooks/useNoticias'
import { FiltrosNoticias } from './FiltrosNoticias'
import { TarjetaNoticia } from './TarjetaNoticia'
import { ResumenIA } from './ResumenIA'

export function FeedNoticias({ holdings = [] }) {
  const {
    noticias,
    cargando,
    cargandoResumen,
    error,
    resumen,
    errorResumen,
    categoriaActiva,
    setCategoriaActiva,
    refrescar,
    resumir,
    limpiarResumen,
  } = useNoticias()

  const [noticiaSeleccionada, setNoticiaSeleccionada] = useState(null)

  // Extraer tickers/nombres de los holdings del usuario para personalizar
  const holdingKeywords = holdings.map(h => 
    [h.nombre?.toLowerCase(), h.simbolo?.toLowerCase(), h.ticker?.toLowerCase()]
  ).flat().filter(Boolean)

  // Separar noticias personalizadas (relevantes al portfolio) de las generales
  const noticiasPersonalizadas = holdingKeywords.length > 0
    ? noticias.filter(n => {
        const texto = `${n.titulo} ${n.descripcion}`.toLowerCase()
        return holdingKeywords.some(kw => kw && texto.includes(kw))
      })
    : []

  const noticiasGenerales = holdingKeywords.length > 0
    ? noticias.filter(n => !noticiasPersonalizadas.includes(n))
    : noticias

  const handleExplicar = async (noticia) => {
    setNoticiaSeleccionada(noticia)
    await resumir(noticia)
  }

  const handleCerrarResumen = () => {
    setNoticiaSeleccionada(null)
    limpiarResumen()
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Header del feed */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-[10px] font-extrabold uppercase tracking-[0.12em] text-[var(--mango-dark)] dark:text-[var(--mango)] mb-0.5">
            📰 Noticias del mercado
          </h3>
          <p className="text-xs text-zinc-400 dark:text-zinc-500">
            Información en tiempo real · Resúmenes con IA
          </p>
        </div>
        <button
          onClick={refrescar}
          disabled={cargando}
          className={`p-2 rounded-xl text-zinc-400 dark:text-zinc-500
            hover:text-[var(--mango)] hover:bg-[var(--mango)]/10
            active:scale-90 transition-all cursor-pointer
            ${cargando ? 'animate-spin' : ''}`}
          title="Actualizar noticias"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/>
            <path d="M3 3v5h5"/>
          </svg>
        </button>
      </div>

      {/* Filtros de categoría */}
      <FiltrosNoticias
        categoriaActiva={categoriaActiva}
        onCambiar={setCategoriaActiva}
      />

      {/* Error state */}
      {error && (
        <div className="p-4 rounded-2xl bg-red-50 dark:bg-red-900/15 border border-red-200 dark:border-red-800/30">
          <p className="text-sm text-red-600 dark:text-red-400 font-medium">
            ⚠️ {error}
          </p>
          <button
            onClick={refrescar}
            className="mt-2 text-xs font-bold text-red-500 hover:text-red-600 transition-colors cursor-pointer"
          >
            Reintentar
          </button>
        </div>
      )}

      {/* Loading state */}
      {cargando && (
        <div className="flex flex-col gap-3">
          {[0, 1, 2, 3].map(i => (
            <div
              key={i}
              className="rounded-[20px] overflow-hidden bg-white dark:bg-[var(--dark-card)] border border-zinc-100/70 dark:border-[var(--dark-border)]"
            >
              <div className="h-40 animate-pulse bg-zinc-100 dark:bg-zinc-800" />
              <div className="p-4 space-y-2.5">
                <div className="h-4 w-3/4 rounded-lg animate-pulse bg-zinc-100 dark:bg-zinc-800" />
                <div className="h-3 w-full rounded-lg animate-pulse bg-zinc-100 dark:bg-zinc-800" />
                <div className="h-3 w-2/3 rounded-lg animate-pulse bg-zinc-100 dark:bg-zinc-800" />
                <div className="flex gap-2 pt-1">
                  <div className="h-5 w-16 rounded-full animate-pulse bg-zinc-100 dark:bg-zinc-800" />
                  <div className="h-5 w-20 rounded-full animate-pulse bg-zinc-100 dark:bg-zinc-800" />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Noticias personalizadas (basadas en el portfolio del usuario) */}
      {!cargando && noticiasPersonalizadas.length > 0 && (
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-2 px-1">
            <div className="w-1.5 h-1.5 rounded-full bg-[var(--mango)] animate-live-dot" />
            <p className="text-[10px] font-extrabold uppercase tracking-widest text-[var(--mango-dark)] dark:text-[var(--mango)]">
              Relevantes para tu cartera
            </p>
          </div>
          {noticiasPersonalizadas.map((noticia, i) => (
            <TarjetaNoticia
              key={noticia.id}
              noticia={noticia}
              onExplicar={handleExplicar}
              destacada
              estilo={{ animationDelay: `${i * 60}ms` }}
            />
          ))}
        </div>
      )}

      {/* Noticias generales */}
      {!cargando && noticiasGenerales.length > 0 && (
        <div className="flex flex-col gap-3">
          {noticiasPersonalizadas.length > 0 && (
            <p className="text-[10px] font-extrabold uppercase tracking-widest text-zinc-400 dark:text-zinc-500 px-1 mt-2">
              Más noticias
            </p>
          )}
          {noticiasGenerales.map((noticia, i) => (
            <TarjetaNoticia
              key={noticia.id}
              noticia={noticia}
              onExplicar={handleExplicar}
              estilo={{ animationDelay: `${(noticiasPersonalizadas.length + i) * 60}ms` }}
            />
          ))}
        </div>
      )}

      {/* Empty state */}
      {!cargando && !error && noticias.length === 0 && (
        <div className="card-premium bg-white dark:bg-[var(--dark-card)] border border-zinc-100/70 dark:border-[var(--dark-border)] rounded-[20px] p-8 text-center">
          <div className="text-4xl mb-3">📰</div>
          <p className="font-bold font-display text-zinc-800 dark:text-white mb-1">
            No hay noticias disponibles
          </p>
          <p className="text-sm text-zinc-400 dark:text-zinc-500">
            Intentá de nuevo en unos minutos
          </p>
          <button
            onClick={refrescar}
            className="mt-4 px-4 py-2 rounded-xl text-sm font-bold
              bg-[var(--mango)]/10 text-[var(--mango-dark)] dark:text-[var(--mango)]
              hover:bg-[var(--mango)]/20 transition-colors cursor-pointer"
          >
            🔄 Reintentar
          </button>
        </div>
      )}

      {/* Modal de resumen IA */}
      <ResumenIA
        abierto={!!noticiaSeleccionada}
        onCerrar={handleCerrarResumen}
        noticia={noticiaSeleccionada}
        resumen={resumen}
        cargando={cargandoResumen}
        error={errorResumen}
      />
    </div>
  )
}
