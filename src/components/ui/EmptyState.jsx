// src/components/ui/EmptyState.jsx — Premium empty states
export function EmptyState({ icono = '📭', titulo, descripcion, accion = null }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-8 text-center animate-fade-up">
      <div className="relative mb-4">
        <div className="absolute inset-0 bg-[var(--mango)] blur-2xl opacity-10 rounded-full scale-150" />
        <span className="relative block text-5xl">{icono}</span>
      </div>
      <h3 className="text-sm font-bold font-display text-zinc-700 dark:text-zinc-200 mb-1.5">{titulo}</h3>
      {descripcion && (
        <p className="text-xs text-zinc-400 dark:text-zinc-500 max-w-[280px] mb-6 leading-relaxed">
          {descripcion}
        </p>
      )}
      {accion}
    </div>
  )
}

export const EMPTY_STATES = {
  movimientos:  { icono: '💸', titulo: 'Sin movimientos todavía',  descripcion: 'Registrá tu primer ingreso o gasto para empezar a ver tu historial.' },
  presupuestos: { icono: '📊', titulo: 'Sin presupuestos',         descripcion: 'Creá un límite por categoría y Manguito te avisa cuando te estás pasando.' },
  metas:        { icono: '🎯', titulo: 'Sin metas de ahorro',      descripcion: 'Definí un objetivo y seguí tu progreso.' },
  categorias:   { icono: '🏷️', titulo: 'Sin categorías propias',  descripcion: 'Ya tenés las categorías base. Podés agregar las tuyas cuando quieras.' },
}