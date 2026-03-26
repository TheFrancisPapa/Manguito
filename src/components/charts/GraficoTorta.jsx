import { useState, useMemo } from 'react'
;
function calcularSegmentos(datos) {
  const total = datos.reduce((s, d) => s + d.monto, 0)
  if (total === 0) return []
  let angulo = -90
  return datos.map((d) => {
    const pct   = d.monto / total
    const deg   = pct * 360
    const ini   = angulo
    const fin   = angulo + deg
    angulo      = fin
    const r = 80, cx = 100, cy = 100
    const rad = (a) => (a * Math.PI) / 180
    const x1 = cx + r * Math.cos(rad(ini)), y1 = cy + r * Math.sin(rad(ini))
    const x2 = cx + r * Math.cos(rad(fin - 0.1)), y2 = cy + r * Math.sin(rad(fin - 0.1))
    return { ...d, pct, path: `M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${deg > 180 ? 1 : 0} 1 ${x2} ${y2} Z` }
  })
}

export function GraficoTorta({ datos = [], moneda = 'ARS', cargando = false }) {
  const [activo, setActivo] = useState(null)
  const fmt = (n) => Number(n).toLocaleString('es-AR', { style: 'currency', currency: moneda, maximumFractionDigits: 0 })
  const segmentos  = useMemo(() => calcularSegmentos(datos), [datos])
  const activoData = activo !== null ? segmentos[activo] : null

  if (cargando) return <div className="w-48 h-48 rounded-full bg-zinc-100 dark:bg-zinc-800 animate-pulse mx-auto" />
  if (!datos.length) return <div className="flex items-center justify-center h-48 text-zinc-400 text-sm">Sin gastos en el período</div>
  return (
    <div className="flex flex-col sm:flex-row items-center gap-6">
      <div className="relative flex-shrink-0">
        <svg width="200" height="200" viewBox="0 0 200 200">
          {segmentos.map((seg, i) => (
            <path key={seg.nombre} d={seg.path} fill={seg.color ?? '#6B7280'}
              opacity={activo === null || activo === i ? 1 : 0.35}
              className="cursor-pointer transition-opacity"
              onMouseEnter={() => setActivo(i)} onMouseLeave={() => setActivo(null)} />
          ))}
          <circle cx="100" cy="100" r="52" className="fill-white dark:fill-zinc-900" />
          {activoData ? (
            <>
              <text x="100" y="96" textAnchor="middle" fontSize="11" style={{ fill: 'var(--color-text-secondary, #71717a)' }}>
                {activoData.nombre.length > 12 ? activoData.nombre.slice(0, 11) + '…' : activoData.nombre}
              </text>
              <text x="100" y="113" textAnchor="middle" fontSize="13" fontWeight="600" style={{ fill: 'var(--color-text-primary, #18181b)' }}>
                {(activoData.pct * 100).toFixed(0)}%
              </text>
            </>
          ) : (
            <text x="100" y="107" textAnchor="middle" fontSize="11" style={{ fill: 'var(--color-text-tertiary, #a1a1aa)' }}>gastos</text>
          )}
        </svg>
      </div>
      <div className="flex flex-col gap-2 w-full">
        {segmentos.map((seg, i) => (
          <div key={seg.nombre} className="flex items-center justify-between gap-2 cursor-pointer"
            onMouseEnter={() => setActivo(i)} onMouseLeave={() => setActivo(null)}>
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: seg.color ?? '#6B7280' }} />
              <span className="text-xs truncate">{seg.icono} {seg.nombre}</span>
            </div>
            <span className="text-xs font-medium text-zinc-500 flex-shrink-0">{fmt(seg.monto)}</span>
          </div>
        ))}
      </div>
    </div>
  )
}