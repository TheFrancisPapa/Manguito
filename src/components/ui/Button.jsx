import { Spinner } from './Spinner'

const VARIANTES = {
  primary:   'bg-amber-400 hover:bg-amber-500 text-amber-900',
  secondary: 'bg-transparent border border-zinc-300 dark:border-zinc-600 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800',
  danger:    'bg-red-500 hover:bg-red-600 text-white',
  ghost:     'bg-transparent hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-400',
}
const TAMAÑOS = {
  sm: 'px-3 py-1.5 text-xs rounded-lg',
  md: 'px-4 py-2 text-sm rounded-xl',
  lg: 'px-6 py-3 text-base rounded-xl',
}

export function Button({ children, variante = 'primary', tamaño = 'md',
  cargando = false, icono = null, className = '', ...props }) {
  return (
    <button
      className={`inline-flex items-center justify-center gap-2 font-medium transition-colors
        disabled:opacity-50 disabled:cursor-not-allowed
        ${VARIANTES[variante]} ${TAMAÑOS[tamaño]} ${className}`}
      disabled={cargando || props.disabled}
      {...props}
    >
      {cargando ? <Spinner size={14} />
        : icono ? <span style={{ fontSize: 16, lineHeight: 1 }}>{icono}</span>
        : null}
      {children}
    </button>
  )
}