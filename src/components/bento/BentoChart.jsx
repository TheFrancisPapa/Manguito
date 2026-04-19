// src/components/bento/BentoChart.jsx
import { useState } from 'react'
import { BentoCell, BentoLabel } from './BentoCell'
import { fmtCompleto as formatMoneda, fmtAbrev } from '../../pages/Dashboard/helpers'

function LineaTemporal({ datos = [], cargando, ...ariaProps }) {
  const [hover, setHover] = useState(null)

  if (cargando) return (
    <div className="w-full h-32 rounded-2xl bg-zinc-100 dark:bg-zinc-800/50 animate-pulse mt-4" />
  )
  if (!datos || datos.length === 0) return (
    <div className="w-full h-32 flex items-center justify-center mt-4">
      <span className="text-xs text-zinc-400">Sin datos suficientes</span>
    </div>
  )

  const W = 400, H = 130
  const PL = 8, PR = 8, PT = 16, PB = 20
  const iW = W - PL - PR
  const iH = H - PT - PB
  const maxV = Math.max(...datos.flatMap(d => [d.ingresos, d.gastos]), 1)
  const xS = datos.length > 1 ? iW / (datos.length - 1) : iW
  const px = (i) => PL + i * xS
  const py = (v) => PT + iH - (v / maxV) * iH

  const curva = (campo) => {
    if (datos.length < 2) return `M ${px(0)} ${py(datos[0][campo])}`
    let d = `M ${px(0)} ${py(datos[0][campo])}`
    for (let i = 1; i < datos.length; i++) {
      const cpx = (px(i - 1) + px(i)) / 2
      d += ` C ${cpx} ${py(datos[i-1][campo])}, ${cpx} ${py(datos[i][campo])}, ${px(i)} ${py(datos[i][campo])}`
    }
    return d
  }

  return (
    <div className="relative w-full mt-4" onMouseLeave={() => setHover(null)} {...ariaProps}>
      <svg width="100%" height={H} viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" className="overflow-visible">
        <defs>
          <linearGradient id="gIngBento" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="rgba(52, 211, 153, 0.2)" />
            <stop offset="100%" stopColor="rgba(52, 211, 153, 0)" />
          </linearGradient>
          <linearGradient id="gGasBento" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="rgba(248, 113, 113, 0.2)" />
            <stop offset="100%" stopColor="rgba(248, 113, 113, 0)" />
          </linearGradient>
        </defs>

        {/* Áreas rellenas */}
        <path
          d={`${curva('gastos')} L ${px(datos.length-1)} ${H-PB} L ${px(0)} ${H-PB} Z`}
          fill="url(#gGasBento)"
        />
        <path
          d={`${curva('ingresos')} L ${px(datos.length-1)} ${H-PB} L ${px(0)} ${H-PB} Z`}
          fill="url(#gIngBento)"
        />

        {/* Líneas */}
        <path d={curva('gastos')} fill="none" stroke="#F87171" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <path d={curva('ingresos')} fill="none" stroke="#34D399" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />

        {/* Puntos y Textos Base */}
        {datos.map((d, i) => (
          <g key={i} onMouseEnter={() => setHover(i)} style={{ cursor: 'pointer' }}>
            <rect x={px(i) - Math.max(xS/2, 16)} y={0} width={Math.max(xS, 32)} height={H} fill="transparent" />
            <text x={px(i)} y={H - 2} textAnchor="middle" fontSize="10" fill="gray" fontWeight="500" opacity="0.6">
              {d.label}
            </text>
          </g>
        ))}

        {/* Highlight en Hover */}
        {hover !== null && (
          <g>
            <line x1={px(hover)} y1={0} x2={px(hover)} y2={H-PB} stroke="currentColor" strokeWidth="1" strokeDasharray="4 4" className="text-zinc-300 dark:text-zinc-600" />
            <circle cx={px(hover)} cy={py(datos[hover].gastos)} r="4" fill="#F87171" stroke="white" strokeWidth="2" />
            <circle cx={px(hover)} cy={py(datos[hover].ingresos)} r="5" fill="#34D399" stroke="white" strokeWidth="2" />
          </g>
        )}
      </svg>

      {/* Tooltip de Datos */}
      {hover !== null && (
        <div className="absolute -top-2 left-1/2 -translate-x-1/2 flex items-center gap-3 bg-white dark:bg-zinc-800 shadow-lg border border-zinc-100 dark:border-zinc-700 rounded-full px-3 py-1.5 text-[10px] font-bold z-10">
          <span className="text-zinc-500 uppercase">{datos[hover]?.label}</span>
          <span className="text-emerald-500">+{fmtAbrev(datos[hover]?.ingresos)}</span>
          <span className="text-red-500">-{fmtAbrev(datos[hover]?.gastos)}</span>
        </div>
      )}
    </div>
  )
}

export function BentoChart({ datos, cargando }) {
  // Descripción textual de los datos para lectores de pantalla
  const resumenTexto = datos?.length
    ? `Evolución de los últimos ${datos.length} meses.
       Ingresos van de ${formatMoneda(datos[0]?.ingresos)} a
       ${formatMoneda(datos.at(-1)?.ingresos)}.
       Gastos promedio: ${formatMoneda(
         datos.reduce((s, d) => s + d.gastos, 0) / datos.length
       )}.`
    : 'Sin datos disponibles.'

  return (
    <BentoCell
      cols={8}
      className="col-span-12 md:col-span-8"
      role="region"
      aria-labelledby="chart-heading"
    >
      <div className="flex items-center justify-between">
        <BentoLabel>
          <span id="chart-heading">Evolución 6 meses</span>
        </BentoLabel>
        
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 bg-emerald-400 rounded-sm" />
            <span className="text-[9px] font-bold text-zinc-500">Ingresos</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 bg-red-400 rounded-sm" />
            <span className="text-[9px] font-bold text-zinc-500">Gastos</span>
          </div>
        </div>
      </div>

      {/* figure + figcaption es el patrón correcto para gráficos */}
      <figure
        role="img"
        aria-labelledby="chart-title"
        aria-describedby="chart-desc"
        className="m-0"
      >
        {/* Título y descripción visualmente ocultos, accesibles para AT */}
        <span id="chart-title" className="sr-only">
          Gráfico de evolución mensual
        </span>
        <span id="chart-desc" className="sr-only">
          {resumenTexto}
        </span>

        {/* SVG: aria-hidden porque la descripción ya está en figcaption */}
        <LineaTemporal
          datos={datos}
          cargando={cargando}
          aria-hidden="true"
          focusable="false"
        />

        <figcaption className="sr-only">{resumenTexto}</figcaption>
      </figure>
    </BentoCell>
  )
}
