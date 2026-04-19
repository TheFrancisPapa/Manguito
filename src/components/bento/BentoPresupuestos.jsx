// src/components/bento/BentoPresupuestos.jsx
import { BentoCell, BentoLabel } from './BentoCell'

export function BentoPresupuestos({ presupuestos }) {
  if (!presupuestos || presupuestos.length === 0) return (
    <BentoCell
      cols={4}
      className="col-span-12 md:col-span-4"
      role="region"
      aria-labelledby="presup-heading"
    >
      <BentoLabel>
        <span id="presup-heading">Presupuestos del mes</span>
      </BentoLabel>
      <div className="flex w-full h-full min-h-[100px] items-center justify-center">
        <span className="text-xs text-zinc-400">Sin presupuestos definidos</span>
      </div>
    </BentoCell>
  )

  return (
    <BentoCell
      cols={4}
      className="col-span-12 md:col-span-4"
      role="region"
      aria-labelledby="presup-heading"
    >
      <BentoLabel>
        <span id="presup-heading">Presupuestos del mes</span>
      </BentoLabel>

      <ul
        aria-label="Lista de presupuestos con estado actual"
        className="flex flex-col gap-3 mt-1 list-none p-0 m-0"
      >
        {presupuestos.map(p => {
          const pct = Math.min(p.porcentaje, 100)
          const excedido = p.porcentaje > 100
          const alerta = p.porcentaje >= p.alerta_pct && !excedido

          const estadoLabel = excedido
            ? `excedido, ${p.porcentaje.toFixed(0)}% utilizado`
            : alerta
              ? `en alerta, ${pct.toFixed(0)}% utilizado`
              : `bajo control, ${pct.toFixed(0)}% utilizado`

          return (
            <li key={p.id}>
              <div className="flex justify-between text-xs mb-1">
                <span className="font-medium text-zinc-700 dark:text-zinc-300 flex items-center gap-1.5">
                  <span>{p.categoria_icono}</span> <span>{p.categoria_nombre}</span>
                </span>
                <span className="text-zinc-400 font-medium">
                  ${Number(p.gastado).toLocaleString('es-AR')} /
                  ${Number(p.limite_monto).toLocaleString('es-AR')}
                </span>
              </div>

              {/* role="progressbar" + aria-* es el patrón WCAG correcto */}
              <div
                role="progressbar"
                aria-valuenow={pct}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label={`${p.categoria_nombre}: ${estadoLabel}`}
                aria-valuetext={`${pct.toFixed(0)} por ciento utilizado`}
                className="h-2 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden"
              >
                <div
                  className={`h-full rounded-full transition-all duration-700 ${
                    excedido  ? 'bg-red-500'   :
                    alerta    ? 'bg-amber-400' :
                    'bg-emerald-500'
                  }`}
                  style={{ width: `${pct}%` }}
                />
              </div>

              {excedido && (
                <p
                  role="alert"
                  aria-live="assertive"
                  className="text-[10px] text-red-600 dark:text-red-400 mt-1 font-semibold"
                >
                  Excedido en ${Number(p.gastado - p.limite_monto).toLocaleString('es-AR')}
                </p>
              )}
            </li>
          )
        })}
      </ul>
    </BentoCell>
  )
}
