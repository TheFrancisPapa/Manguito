// src/pages/Inversiones/TarjetaNoticia.jsx — Premium News Card
import { useState } from 'react'

// ── Relative time helper ──────────────────────────────
function tiempoRelativo(fecha) {
  if (!fecha) return ''
  const ahora = Date.now()
  const pasado = new Date(fecha).getTime()
  const diffSeg = Math.floor((ahora - pasado) / 1000)

  if (diffSeg < 60) return 'hace un momento'
  const diffMin = Math.floor(diffSeg / 60)
  if (diffMin < 60) return `hace ${diffMin} min`
  const diffHs = Math.floor(diffMin / 60)
  if (diffHs < 24) return `hace ${diffHs} hs`
  const diffDias = Math.floor(diffHs / 24)
  if (diffDias === 1) return 'ayer'
  if (diffDias < 7) return `hace ${diffDias} días`
  const diffSem = Math.floor(diffDias / 7)
  if (diffSem < 4) return `hace ${diffSem} sem`
  return new Date(fecha).toLocaleDateString('es-AR', {
    day: 'numeric', month: 'short',
  })
}

// ── Badge color maps ──────────────────────────────────
const COLORES_FUENTE = {
  'Ámbito':      'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400',
  'Ambito':      'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400',
  'Yahoo':       'bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400',
  'CoinDesk':    'bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400',
  'Infobae':     'bg-pink-50 dark:bg-pink-900/20 text-pink-600 dark:text-pink-400',
  'El Cronista': 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400',
}

const COLORES_CATEGORIA = {
  crypto:    'bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400',
  argentina: 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400',
  global:    'bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400',
  acciones:  'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400',
}

const EMOJI_CATEGORIA = {
  crypto: '₿',
  argentina: '🇦🇷',
  global: '🌎',
  acciones: '📈',
}

const FALLBACK_BG = 'bg-gradient-to-br from-[var(--cream)] to-[var(--cream-deep)] dark:from-zinc-800 dark:to-zinc-900'

export function TarjetaNoticia({ noticia, onExplicar, index = 0 }) {
  const [imgError, setImgError] = useState(false)

  const fuenteColor = Object.entries(COLORES_FUENTE).find(
    ([key]) => noticia.fuente?.includes(key)
  )?.[1] ?? 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400'

  const catColor = COLORES_CATEGORIA[noticia.categoria] ?? 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400'

  // Stagger delay: 0, 50ms, 100ms, etc.
  const delayClass = index < 8 ? `animation-delay-${(index + 1) * 100}` : ''

  const handleCardClick = () => {
    if (noticia.url) {
      window.open(noticia.url, '_blank', 'noopener,noreferrer')
    }
  }

  const handleExplicar = (e) => {
    e.stopPropagation()
    onExplicar?.(noticia)
  }

  return (
    <div
      className={`
        card-premium card-interactive
        bg-white dark:bg-[var(--dark-card)]
        border border-zinc-100/70 dark:border-[var(--dark-border)]
        rounded-[20px] overflow-hidden
        flex flex-col
        animate-fade-up opacity-0 ${delayClass}
      `}
      onClick={handleCardClick}
      role="article"
    >
      {/* ── Image / Fallback gradient ── */}
      {noticia.imagen && !imgError ? (
        <div className="relative aspect-[16/9] overflow-hidden">
          <img
            src={noticia.imagen}
            alt=""
            loading="lazy"
            onError={() => setImgError(true)}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
          {/* Subtle bottom fade for text readability */}
          <div className="absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-black/10 to-transparent" />
        </div>
      ) : noticia.imagen ? (
        <div className={`aspect-[16/9] ${FALLBACK_BG} flex items-center justify-center`}>
          <span className="text-4xl opacity-40">
            {EMOJI_CATEGORIA[noticia.categoria] ?? '📰'}
          </span>
        </div>
      ) : null}

      {/* ── Content ── */}
      <div className="flex flex-col flex-1 p-4 gap-2.5">
        {/* Title */}
        <h3 className="font-bold text-sm text-zinc-900 dark:text-white font-display leading-snug line-clamp-2">
          {noticia.titulo}
        </h3>

        {/* Description */}
        {noticia.descripcion && (
          <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed line-clamp-2">
            {noticia.descripcion}
          </p>
        )}

        {/* ── Footer row ── */}
        <div className="flex items-center justify-between gap-2 mt-auto pt-1.5">
          <div className="flex items-center gap-1.5 min-w-0 flex-wrap">
            {/* Source badge */}
            {noticia.fuente && (
              <span className={`
                inline-flex items-center px-2 py-0.5 rounded-full
                text-[10px] font-semibold uppercase tracking-wider
                ${fuenteColor}
              `}>
                {noticia.fuente}
              </span>
            )}

            {/* Category badge */}
            {noticia.categoria && (
              <span className={`
                inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full
                text-[10px] font-semibold uppercase tracking-wider
                ${catColor}
              `}>
                {EMOJI_CATEGORIA[noticia.categoria]} {noticia.categoria}
              </span>
            )}

            {/* Time */}
            {noticia.fecha && (
              <span className="text-[10px] text-zinc-400 dark:text-zinc-500 whitespace-nowrap">
                {tiempoRelativo(noticia.fecha)}
              </span>
            )}
          </div>

          {/* Explicame button */}
          <button
            onClick={handleExplicar}
            className="
              flex items-center gap-1 px-2.5 py-1 rounded-xl
              text-[11px] font-bold whitespace-nowrap
              bg-[var(--cream)] dark:bg-[var(--mango)]/10
              text-[var(--mango-dark)] dark:text-[var(--mango)]
              border border-[var(--mango)]/20 dark:border-[var(--mango)]/15
              hover:bg-[var(--mango)]/15 dark:hover:bg-[var(--mango)]/20
              hover:border-[var(--mango)]/40
              active:scale-95
              transition-all cursor-pointer
              flex-shrink-0
            "
          >
            🤖 Explicame
          </button>
        </div>
      </div>
    </div>
  )
}
