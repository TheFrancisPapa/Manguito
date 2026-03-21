// src/components/ui/Badge.jsx

const COLORES = {
  // movimientos
  ingreso:    'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400',
  gasto:      'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',

  // presupuestos
  holgado:    'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400',
  alerta:     'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400',
  excedido:   'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  sin_datos:  'bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400',

  // metas
  activa:     'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  completada: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400',
  pausada:    'bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400',
  cancelada:  'bg-zinc-100 text-zinc-400 dark:bg-zinc-800 dark:text-zinc-500 line-through',

  // recurrente
  recurrente: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
}

export function Badge({ tipo, children, className = '' }) {
  const color = COLORES[tipo] ?? 'bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300'

  return (
    <span className={`
      inline-flex items-center gap-1
      px-2 py-0.5 rounded-full
      text-xs font-medium
      ${color} ${className}
    `}>
      {children}
    </span>
  )
}