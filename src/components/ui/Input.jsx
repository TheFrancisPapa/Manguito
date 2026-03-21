// src/components/ui/Input.jsx

export function Input({
  label,
  error,
  prefijo = null,   // ej: "$" antes del monto
  sufijo = null,    // ej: "ARS" después del monto
  className = '',
  ...props
}) {
  const baseInput = `
    w-full bg-white dark:bg-zinc-900
    border rounded-xl px-3 py-2 text-sm
    outline-none transition-colors
    placeholder:text-zinc-400
    ${error
      ? 'border-red-400 focus:border-red-500'
      : 'border-zinc-200 dark:border-zinc-700 focus:border-amber-400 dark:focus:border-amber-500'
    }
  `

  return (
    <div className={`flex flex-col gap-1 ${className}`}>
      {label && (
        <label className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
          {label}
        </label>
      )}

      <div className="relative flex items-center">
        {prefijo && (
          <span className="absolute left-3 text-sm text-zinc-400 pointer-events-none">
            {prefijo}
          </span>
        )}
        <input
          className={`${baseInput} ${prefijo ? 'pl-7' : ''} ${sufijo ? 'pr-10' : ''}`}
          {...props}
        />
        {sufijo && (
          <span className="absolute right-3 text-xs text-zinc-400 pointer-events-none">
            {sufijo}
          </span>
        )}
      </div>

      {error && (
        <p className="text-xs text-red-500">{error}</p>
      )}
    </div>
  )
}

// Select estilizado igual que Input
export function Select({ label, error, children, className = '', ...props }) {
  return (
    <div className={`flex flex-col gap-1 ${className}`}>
      {label && (
        <label className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
          {label}
        </label>
      )}
      <select
        className={`
          w-full bg-white dark:bg-zinc-900
          border rounded-xl px-3 py-2 text-sm
          outline-none transition-colors
          ${error
            ? 'border-red-400'
            : 'border-zinc-200 dark:border-zinc-700 focus:border-amber-400'
          }
        `}
        {...props}
      >
        {children}
      </select>
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  )
}