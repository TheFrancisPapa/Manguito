// src/components/bento/BentoCell.jsx
export function BentoCell({ children, cols = 6, className = '', ...ariaProps }) {
  // If className already includes col-span, we avoid adding a duplicate.
  // Tailwind PurgeCSS usually needs full strings, so we pass responsive classes via className.
  const hasSpan = className.includes('col-span-')
  
  return (
    <section
      className={`bento-cell
        ${!hasSpan ? `col-span-${cols}` : ''}
        hover:scale-[1.01] transition-transform duration-300
        ${className}
      `}
      {...ariaProps}
    >
      {children}
    </section>
  )
}

export function BentoLabel({ children, className = '' }) {
  return (
    <p className={`text-[10px] font-extrabold uppercase tracking-[.08em]
      text-zinc-400 dark:text-zinc-500 mb-2 ${className}`}>
      {children}
    </p>
  )
}

// Tipografía pesada para saldos — el núcleo del cambio visual
export function BentoAmount({ value, size = 'xl', color = 'default', label, className = '' }) {
  const sizes = {
    xl: 'bento-amount-xl',
    lg: 'bento-amount-lg',
    md: 'bento-amount-md',
  }
  const colors = {
    default:  'text-zinc-900 dark:text-white',
    positive: 'text-emerald-600 dark:text-emerald-400',
    negative: 'text-red-500 dark:text-red-400',
    warning:  'text-amber-600 dark:text-amber-500',
    blue:     'text-blue-500 dark:text-blue-400',
    teal:     'text-teal-600 dark:text-teal-400'
  }
  return (
    <p
      className={`${sizes[size] || sizes.xl} tabular-nums
        ${colors[color] || colors.default} ${className}`}
      aria-label={label}
      aria-live={size === 'xl' ? 'polite' : undefined}
      aria-atomic="true"
    >
      {value}
    </p>
  )
}

export function BentoHeader({ icon, title, className = '' }) {
  return (
    <div className={`flex items-center gap-2 mb-3 ${className}`}>
      <div className="w-8 h-8 rounded-[12px] bg-zinc-100 dark:bg-zinc-800/80 flex items-center justify-center text-lg">
        {icon}
      </div>
      <BentoLabel className="!mb-0">{title}</BentoLabel>
    </div>
  )
}
