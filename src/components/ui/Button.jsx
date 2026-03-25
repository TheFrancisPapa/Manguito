export function Button({ children, variante = 'primary', className = '', icono, cargando, tamaño, ...props }) {
  const base = "inline-flex items-center justify-center gap-2 rounded-xl font-semibold transition-all duration-200 active:scale-[0.97] disabled:opacity-70 disabled:pointer-events-none cursor-pointer"
  
  const variantes = {
    primary: `bg-gradient-to-r from-[var(--mango)] to-[var(--mango-dark)] 
      hover:from-[var(--mango-dark)] hover:to-[#D4920F] 
      text-[var(--charcoal)] shadow-lg shadow-[var(--mango)]/25 
      border border-[var(--mango-dark)]/20`,
    
    secondary: `bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-200 
      border border-zinc-200 dark:border-zinc-800 
      hover:bg-[var(--cream)] dark:hover:bg-[var(--mango)]/10 
      hover:text-[var(--mango-dark)] dark:hover:text-[var(--mango)] 
      hover:border-[var(--mango)]/30 dark:hover:border-[var(--mango)]/20 shadow-sm`,
    
    danger: "bg-red-500 hover:bg-red-600 text-white shadow-md shadow-red-500/20",
    
    ghost: `bg-transparent text-zinc-600 dark:text-zinc-400 
      hover:bg-[var(--cream)] dark:hover:bg-[var(--mango)]/10 
      hover:text-[var(--mango-dark)] dark:hover:text-[var(--mango)]`
  }

  const tamaños = {
    sm: "px-3 py-1.5 text-xs",
    md: icono && !children ? "p-3" : "px-5 py-2.5 text-sm",
    lg: "px-6 py-3 text-base",
  }
  const pad = tamaños[tamaño] || tamaños.md

  return (
    <button className={`${base} ${variantes[variante]} ${pad} ${className}`} disabled={cargando} {...props}>
      {cargando ? (
        <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      ) : (
        <>
          {icono && <span className="text-lg">{icono}</span>}
          {children}
        </>
      )}
    </button>
  )
}