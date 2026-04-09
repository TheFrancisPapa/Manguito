// src/components/ui/Button.jsx — Premium Button with spring press
export function Button({ children, variante = 'primary', className = '', icono, cargando, tamaño, ...props }) {
  const base = `inline-flex items-center justify-center gap-2 rounded-2xl font-semibold
    transition-all duration-200 ease-[cubic-bezier(0.25,0.46,0.45,0.94)]
    active:scale-[0.97] disabled:opacity-50 disabled:pointer-events-none
    cursor-pointer select-none font-display`
  
  const variantes = {
    primary: `btn-primary text-white px-5 py-2.5 text-sm`,
    
    secondary: `bg-white dark:bg-[var(--dark-card)] text-zinc-700 dark:text-zinc-200 
      border border-zinc-200/80 dark:border-[var(--dark-border)]
      hover:bg-[var(--cream)] dark:hover:bg-zinc-800/80
      hover:text-[var(--mango-dark)] dark:hover:text-[var(--mango)] 
      hover:border-[var(--mango)]/25 shadow-[var(--shadow-xs)]`,
    
    danger: `bg-gradient-to-br from-red-500 to-rose-600 text-white
      shadow-md shadow-red-500/20 
      hover:shadow-red-500/35 hover:-translate-y-0.5`,
    
    ghost: `bg-transparent text-zinc-600 dark:text-zinc-400 
      hover:bg-[var(--cream)] dark:hover:bg-[var(--mango)]/8
      hover:text-[var(--mango-dark)] dark:hover:text-[var(--mango)]`
  }

  const tamaños = {
    sm: 'px-3.5 py-2 text-xs rounded-xl',
    md: icono && !children ? 'p-2.5' : 'px-5 py-2.5 text-sm',
    lg: 'px-7 py-3.5 text-base rounded-2xl',
  }
  const pad = tamaños[tamaño] || ''

  return (
    <button
      className={`${base} ${variantes[variante]} ${pad} ${className}`}
      disabled={cargando}
      {...props}
    >
      {cargando ? (
        <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-20" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3"/>
          <path className="opacity-90" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
        </svg>
      ) : (
        <>
          {icono && <span className="text-base leading-none">{icono}</span>}
          {children}
        </>
      )}
    </button>
  )
}