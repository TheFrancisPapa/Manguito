// src/components/ui/EmptyState.jsx
// Se muestra cuando una lista no tiene datos todavía.
// Cada sección de la app tiene su propio mensaje.

export function EmptyState({
  icono = '📭',
  titulo,
  descripcion,
  accion = null,       // botón opcional para crear el primer item
}) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
      <span style={{ fontSize: 40 }} className="mb-3">{icono}</span>
      <h3 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
        {titulo}
      </h3>
      {descripcion && (
        <p className="text-xs text-zinc-400 max-w-xs mb-5">
          {descripcion}
        </p>
      )}
      {accion}
    </div>
  )
}

// Estados vacíos predefinidos para cada sección
export const EMPTY_STATES = {
  movimientos: {
    icono: '💸',
    titulo: 'Sin movimientos todavía',
    descripcion: 'Registrá tu primer ingreso o gasto para empezar a ver tu historial.',
  },
  presupuestos: {
    icono: '📊',
    titulo: 'Sin presupuestos',
    descripcion: 'Creá un límite por categoría y Manguito te avisa cuando te estás pasando.',
  },
  metas: {
    icono: '🎯',
    titulo: 'Sin metas de ahorro',
    descripcion: 'Definí un objetivo — vacaciones, notebook, fondo de emergencia — y seguí tu progreso.',
  },
  categorias: {
    icono: '🏷️',
    titulo: 'Sin categorías propias',
    descripcion: 'Ya tenés las categorías base. Podés agregar las tuyas cuando quieras.',
  },
}