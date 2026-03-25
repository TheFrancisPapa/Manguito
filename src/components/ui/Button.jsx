export function Button({ children, variante = 'primary', className = '', icono, cargando, ...props }) {
  const base = "inline-flex items-center justify-center gap-2 rounded-xl font-medium transition-all duration-200 active:scale-[0.97] disabled:opacity-70 disabled:pointer-events-none"
  
  const variantes = {
    // El botón principal ahora es un degradado vibrante de naranja a ámbar
    primary: "bg-gradient-to-r from-orange-500 to-amber-400 hover:from-orange-600 hover:to-amber-500 text-white shadow-lg shadow-orange-500/25 border border-orange-400/20",
    
    // El secundario respira calidez al hacer hover
    secondary: "bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-200 border border-zinc-200 dark:border-zinc-800 hover:bg-orange-50 dark:hover:bg-orange-900/20 hover:text-orange-600 dark:hover:text-orange-400 hover:border-orange-200 dark:hover:border-orange-800/50 shadow-sm",
    
    danger: "bg-red-500 hover:bg-red-600 text-white shadow-md shadow-red-500/20",
    
    ghost: "bg-transparent text-zinc-600 dark:text-zinc-400 hover:bg-orange-50 dark:hover:bg-orange-900/20 hover:text-orange-600 dark:hover:text-orange-400"
  }

  const padding = icono && !children ? "p-3" : "px-5 py-2.5"

  return (
    <button className={`${base} ${variantes[variante]} ${padding} ${className}`} disabled={cargando} {...props}>
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