import { useState } from 'react'

export function LineaTemporal({ datos = [], moneda = 'ARS', cargando = false }) {
  const [hover, setHover] = useState(null)
  const fmt = (n) => Number(n).toLocaleString('es-AR', { style: 'currency', currency: moneda, maximumFractionDigits: 0 })

  if (cargando) return <div className="w-full h-40 rounded-xl bg-zinc-100 dark:bg-zinc-800 animate-pulse" />
  if (!datos.length) return <div className="flex items-center justify-center h-40 text-zinc-400 text-sm">Sin datos en el período</div>

  // Dimensiones más compactas para mobile
  const W = 400
  const H = 120
  const PAD = { t: 8, r: 8, b: 28, l: 8 }
  const innerW = W - PAD.l - PAD.r
  const innerH = H - PAD.t - PAD.b
  const maxVal = Math.max(...datos.flatMap(d => [d.ingresos, d.gastos]), 1)
  const xStep  = datos.length > 1 ? innerW / (datos.length - 1) : innerW
  const px = (i) => PAD.l + i * xStep
  const py = (v) => PAD.t + innerH - (v / maxVal) * innerH

  // Etiqueta: mostrar solo primera y última en mobile (si hay muchos puntos)
  const mostrarLabel = (i) => {
    if (datos.length <= 4) return true
    return i === 0 || i === datos.length - 1 || i === Math.floor(datos.length / 2)
  }

  const linea = (campo, colorClass) => (
    <polyline
      points={datos.map((d, i) => `${px(i)},${py(d[campo])}`).join(' ')}
      fill="none"
      stroke="currentColor"
      className={colorClass}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  )

  return (
    <div className="w-full">
      <svg
        width="100%"
        viewBox={`0 0 ${W} ${H}`}
        className="overflow-visible"
        onMouseLeave={() => setHover(null)}
        onTouchEnd={() => setHover(null)}
      >
        {/* Líneas de referencia horizontales */}
        {[0, 0.5, 1].map(f => (
          <line
            key={f}
            x1={PAD.l} y1={PAD.t + innerH * (1 - f)}
            x2={W - PAD.r} y2={PAD.t + innerH * (1 - f)}
            stroke="currentColor" strokeOpacity="0.08" strokeWidth="1"
          />
        ))}

        {linea('ingresos', 'text-emerald-500')}
        {linea('gastos', 'text-red-500')}

        {datos.map((d, i) => (
          <g
            key={i}
            onMouseEnter={() => setHover(i)}
            onTouchStart={() => setHover(i)}
          >
            <circle cx={px(i)} cy={py(d.ingresos)} r="3.5" className="fill-emerald-500" />
            <circle cx={px(i)} cy={py(d.gastos)} r="3.5" className="fill-red-500" />
            {/* Área interactiva más grande para touch */}
            <rect
              x={px(i) - Math.max(xStep / 2, 16)}
              y={PAD.t}
              width={Math.max(xStep, 32)}
              height={innerH}
              fill="transparent"
            />
            {/* Etiqueta de mes — mostrar solo algunas para no amontonar */}
            {mostrarLabel(i) && (
              <text
                x={px(i)}
                y={H - 4}
                textAnchor="middle"
                fontSize="8"
                fill="currentColor"
                fillOpacity="0.45"
              >
                {d.label}
              </text>
            )}
          </g>
        ))}

        {/* Línea vertical del hover */}
        {hover !== null && (
          <line
            x1={px(hover)} y1={PAD.t}
            x2={px(hover)} y2={PAD.t + innerH}
            stroke="currentColor" strokeOpacity="0.15"
            strokeWidth="1" strokeDasharray="4 3"
          />
        )}
      </svg>

      {/* Tooltip del punto hover */}
      {hover !== null && (
        <div className="flex justify-between text-xs px-1 mt-1">
          <span className="text-zinc-400 dark:text-zinc-500">{datos[hover].label}</span>
          <div className="flex gap-3">
            <span className="text-emerald-600 dark:text-emerald-400 font-medium">
              +{fmt(datos[hover].ingresos)}
            </span>
            <span className="text-red-500 dark:text-red-400 font-medium">
              -{fmt(datos[hover].gastos)}
            </span>
          </div>
        </div>
      )}

      {/* Leyenda */}
      <div className="flex gap-4 justify-center mt-2">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-0.5 bg-emerald-500 rounded" />
          <span className="text-xs text-zinc-400">Ingresos</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-0.5 bg-red-500 rounded" />
          <span className="text-xs text-zinc-400">Gastos</span>
        </div>
      </div>
    </div>
  )
}