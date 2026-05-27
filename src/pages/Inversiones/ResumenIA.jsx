// src/pages/Inversiones/ResumenIA.jsx — AI Summary Modal
import { Modal } from '../../components/ui'

// ── Section parser ────────────────────────────────────
// Splits AI text into structured sections by emoji headers.
function parseSecciones(texto) {
  if (!texto) return []

  const regex = /(📋|🤔|📊|💡)\s*(.+?)(?:\n|$)([\s\S]*?)(?=(?:📋|🤔|📊|💡)\s|$)/g
  const secciones = []
  let match

  while ((match = regex.exec(texto)) !== null) {
    secciones.push({
      emoji: match[1],
      titulo: match[2].trim().replace(/[*:]/g, ''),
      contenido: match[3].trim(),
    })
  }

  // Fallback: if parsing fails, show as single block
  if (secciones.length === 0 && texto.trim()) {
    secciones.push({
      emoji: '📋',
      titulo: 'Resumen',
      contenido: texto.trim(),
    })
  }

  return secciones
}

// ── Section background tints ──────────────────────────
const TINTES = {
  '📋': 'bg-blue-50/60 dark:bg-blue-900/10 border-blue-100/60 dark:border-blue-800/20',
  '🤔': 'bg-amber-50/60 dark:bg-amber-900/10 border-amber-100/60 dark:border-amber-800/20',
  '📊': 'bg-purple-50/60 dark:bg-purple-900/10 border-purple-100/60 dark:border-purple-800/20',
  '💡': 'bg-emerald-50/60 dark:bg-emerald-900/10 border-emerald-100/60 dark:border-emerald-800/20',
}

// ── Loading dots animation ────────────────────────────
function DotsLoading() {
  return (
    <div className="flex flex-col items-center justify-center py-10 gap-4">
      <div className="text-4xl animate-pulse-subtle">🥭</div>
      <div className="flex items-center gap-1.5">
        <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
          Mango está analizando la noticia
        </p>
        <span className="inline-flex gap-0.5">
          <span className="w-1 h-1 rounded-full bg-[var(--mango)] animate-pulse-subtle" style={{ animationDelay: '0ms' }} />
          <span className="w-1 h-1 rounded-full bg-[var(--mango)] animate-pulse-subtle" style={{ animationDelay: '200ms' }} />
          <span className="w-1 h-1 rounded-full bg-[var(--mango)] animate-pulse-subtle" style={{ animationDelay: '400ms' }} />
        </span>
      </div>
    </div>
  )
}

export function ResumenIA({ abierto, onCerrar, noticia, resumen, cargando, error }) {
  const secciones = parseSecciones(resumen)

  return (
    <Modal
      abierto={abierto}
      onCerrar={onCerrar}
      titulo="🤖 Mango te explica"
      ancho="max-w-lg"
    >
      <div className="flex flex-col gap-4">
        {/* ── Article title context ── */}
        {noticia && (
          <div className="bg-zinc-50 dark:bg-zinc-800/50 rounded-2xl p-3.5 border border-zinc-100 dark:border-zinc-800/60">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 mb-1">
              Artículo
            </p>
            <p className="text-sm font-bold text-zinc-800 dark:text-zinc-200 font-display leading-snug line-clamp-2">
              {noticia.titulo}
            </p>
            {noticia.fuente && (
              <p className="text-[10px] text-zinc-400 dark:text-zinc-500 mt-1">
                Fuente: {noticia.fuente}
              </p>
            )}
          </div>
        )}

        {/* ── Loading state ── */}
        {cargando && <DotsLoading />}

        {/* ── Error state ── */}
        {error && !cargando && (
          <div className="bg-red-50 dark:bg-red-900/15 border border-red-200 dark:border-red-800/40 rounded-2xl p-4">
            <p className="text-sm text-red-600 dark:text-red-400 font-medium">
              ❌ {error}
            </p>
          </div>
        )}

        {/* ── Sections ── */}
        {!cargando && !error && secciones.length > 0 && (
          <div className="flex flex-col gap-3 animate-fade-up">
            {secciones.map((sec, i) => (
              <div
                key={i}
                className={`
                  rounded-2xl p-4 border
                  ${TINTES[sec.emoji] ?? 'bg-zinc-50/60 dark:bg-zinc-800/30 border-zinc-100/60 dark:border-zinc-800/20'}
                  animate-scale-in
                `}
                style={{ animationDelay: `${i * 80}ms` }}
              >
                <p className="text-xs font-bold text-zinc-700 dark:text-zinc-200 mb-1.5 font-display">
                  {sec.emoji} {sec.titulo}
                </p>
                <p className="text-sm text-zinc-600 dark:text-zinc-300 leading-relaxed whitespace-pre-line">
                  {sec.contenido}
                </p>
              </div>
            ))}
          </div>
        )}

        {/* ── Footer ── */}
        {!cargando && (
          <div className="flex flex-col gap-3 pt-2 border-t border-zinc-100 dark:border-zinc-800/60">
            {/* Open original article */}
            {noticia?.url && (
              <button
                onClick={() => window.open(noticia.url, '_blank', 'noopener,noreferrer')}
                className="
                  w-full inline-flex items-center justify-center gap-2
                  px-4 py-2.5 rounded-2xl text-sm font-semibold
                  bg-zinc-100 dark:bg-zinc-800
                  text-zinc-700 dark:text-zinc-200
                  hover:bg-zinc-200 dark:hover:bg-zinc-700
                  active:scale-[0.98]
                  transition-all cursor-pointer font-display
                "
              >
                Ver noticia original ↗
              </button>
            )}

            {/* Disclaimer */}
            <p className="text-[10px] text-zinc-400 dark:text-zinc-500 text-center leading-relaxed">
              ⚠️ Resumen generado por IA · No constituye asesoramiento financiero
            </p>
          </div>
        )}
      </div>
    </Modal>
  )
}
