// src/pages/Inversiones/FiltrosNoticias.jsx — Category Filter Chips
const FILTROS = [
  { value: null,        label: 'Todas',     emoji: '📰' },
  { value: 'argentina', label: 'Argentina', emoji: '🇦🇷' },
  { value: 'global',    label: 'Global',    emoji: '🌎' },
  { value: 'acciones',  label: 'Acciones',  emoji: '📈' },
  { value: 'crypto',    label: 'Crypto',    emoji: '₿' },
]

export function FiltrosNoticias({ categoriaActiva, onCambiar }) {
  return (
    <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1 -mx-1 px-1">
      {FILTROS.map((f) => {
        const activo = categoriaActiva === f.value

        return (
          <button
            key={f.label}
            onClick={() => onCambiar(f.value)}
            className={`
              inline-flex items-center gap-1.5
              px-3 py-1.5 rounded-full
              text-xs font-bold
              cursor-pointer select-none
              whitespace-nowrap flex-shrink-0
              transition-all duration-200
              active:scale-95
              ${activo
                ? `
                  bg-gradient-to-r from-[var(--mango)] to-[var(--mango-dark)]
                  text-white
                  shadow-[0_2px_12px_var(--mango-glow-sm)]
                `
                : `
                  bg-zinc-100 dark:bg-zinc-800
                  text-zinc-600 dark:text-zinc-400
                  hover:bg-zinc-200 dark:hover:bg-zinc-700
                  hover:text-zinc-800 dark:hover:text-zinc-200
                `
              }
            `}
          >
            <span className="text-sm leading-none">{f.emoji}</span>
            {f.label}
          </button>
        )
      })}
    </div>
  )
}
