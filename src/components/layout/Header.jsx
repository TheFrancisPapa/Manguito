import { useTheme } from '../../hooks/useTheme'

export function Header() {
  const { theme, toggleTheme } = useTheme()

  return (
    <header className="sticky top-0 z-30 w-full bg-[var(--cream-soft)]/80 dark:bg-[var(--dark-bg)]/80 backdrop-blur-md border-b border-[var(--mango)]/10 dark:border-zinc-800/50">
      <div className="max-w-2xl mx-auto md:max-w-4xl px-4 h-16 flex items-center justify-between">
        {/* Espacio para el logo en mobile si se desea, o simplemente vacío para empujar el botón al final */}
        <div className="md:hidden flex items-center gap-2">
          <img src="/Mango.png" alt="Logo" className="w-8 h-8 object-contain" />
          <span className="font-bold text-[var(--charcoal)] dark:text-white">Manguito</span>
        </div>
        
        <div className="flex-1" />

        <button
          onClick={toggleTheme}
          className="p-2.5 rounded-xl bg-white dark:bg-zinc-900 border border-[var(--mango)]/20 dark:border-zinc-800 shadow-sm hover:scale-105 transition-transform active:scale-95"
          aria-label="Cambiar tema"
        >
          {theme === 'light' ? (
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-amber-500">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z" />
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-amber-400">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" />
            </svg>
          )}
        </button>
      </div>
    </header>
  )
}
