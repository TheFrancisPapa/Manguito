import { useState } from 'react'

export function LineaTemporal({ datos = [], moneda = 'ARS', cargando = false }) {
  const [hover, setHover] = useState(null)
  const fmt = (n) => Number(n).toLocaleString('es-AR', { style: 'currency', currency: moneda, maximumFractionDigits: 0 })
  if (cargando) return <div className="w-full h-40 rounded-xl bg-zinc-100 dark:bg-zinc-800 animate-pulse" />
  if (!datos.length) return <div className="flex items-center justify-center h-40 text-zinc-400 text-sm">Sin datos en el período</div>
  const W = 560, H = 140, PAD = { t: 10, r: 10, b: 30, l: 10 }
  const innerW = W - PAD.l - PAD.r, innerH = H - PAD.t - PAD.b
  const maxVal = Math.max(...datos.flatMap(d => [d.ingresos, d.gastos]), 1)
  const xStep  = innerW / (datos.length - 1 || 1)
  const px = (i) => PAD.l + i * xStep
  const py = (v) => PAD.t + innerH - (v / maxVal) * innerH

  // Cambio principal: Usamos stroke="currentColor" y aplicamos la clase de color al polyline
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
      <svg width="100%" viewBox={`0 0 ${W} ${H}`} className="overflow-visible" onMouseLeave={() => setHover(null)}>
        {[0, 0.5, 1].map(f => (
          <line key={f} x1={PAD.l} y1={PAD.t + innerH * (1 - f)} x2={W - PAD.r} y2={PAD.t + innerH * (1 - f)}
            stroke="currentColor" strokeOpacity="0.08" strokeWidth="1" />
        ))}
        
        {/* Usamos clases de texto de Tailwind para definir el currentColor */}
        {linea('ingresos', 'text-emerald-500')}
        {linea('gastos',   'text-red-500')}
        
        {datos.map((d, i) => (
          <g key={i} onMouseEnter={() => setHover(i)}>
            {/* Aseguramos que los círculos también tengan el color correcto */}
            <circle cx={px(i)} cy={py(d.ingresos)} r="3" className="fill-emerald-500" />
            <circle cx={px(i)} cy={py(d.gastos)}   r="3" className="fill-red-500" />
            
            <rect x={px(i) - xStep / 2} y={PAD.t} width={xStep} height={innerH} fill="transparent" />
            <text x={px(i)} y={H - 4} textAnchor="middle" fontSize="9" fill="currentColor" fillOpacity="0.4">{d.label}</text>
          </g>
        ))}
        {hover !== null && (
          <line x1={px(hover)} y1={PAD.t} x2={px(hover)} y2={PAD.t + innerH}
            stroke="currentColor" strokeOpacity="0.15" strokeWidth="1" strokeDasharray="4 3" />
        )}
      </svg>
      {hover !== null && (
        <div className="flex justify-between text-xs px-1 mt-1">
          <span className="text-zinc-400">{datos[hover].label}</span>
          <div className="flex gap-3">
            <span className="text-emerald-600 dark:text-emerald-400">+{fmt(datos[hover].ingresos)}</span>
            <span className="text-red-500 dark:text-red-400">-{fmt(datos[hover].gastos)}</span>
          </div>
        </div>
      )}
      <div className="flex gap-4 justify-center mt-2">
        <div className="flex items-center gap-1.5"><div className="w-3 h-0.5 bg-emerald-500 rounded" /><span className="text-xs text-zinc-400">Ingresos</span></div>
        <div className="flex items-center gap-1.5"><div className="w-3 h-0.5 bg-red-500 rounded" /><span className="text-xs text-zinc-400">Gastos</span></div>
      </div>
    </div>
  )
}