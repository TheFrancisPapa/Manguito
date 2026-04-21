// src/pages/Dashboard/components/BentoMetas.jsx
import { Link } from 'react-router-dom'
import { BentoCell, BentoHeader } from '../../../components/bento/BentoCell'

function fmtMonto(n) {
  const abs = Math.abs(n)
  if (abs >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`
  if (abs >= 1_000)     return `$${(n / 1_000).toFixed(0)}K`
  return `$${Number(n).toLocaleString('es-AR', { maximumFractionDigits: 0 })}`
}

export function BentoMetas({ metas = [], cargando = false, className = '' }) {
  const activas = metas.filter(m => m.estado === 'activa')
  const meta    = activas[0] ?? null

  if (cargando) {
    return (
      <BentoCell className={`col-span-12 md:col-span-6 bg-indigo-50 dark:bg-indigo-900/10 border-indigo-100 dark:border-indigo-900/30 flex flex-col justify-between relative ${className}`}>
        <div className="h-3 w-16 bg-indigo-100 dark:bg-indigo-800/40 rounded-full animate-pulse mb-3" />
        <div className="h-5 w-28 bg-indigo-100 dark:bg-indigo-800/40 rounded-full animate-pulse mb-1" />
        <div className="h-3 w-20 bg-indigo-100 dark:bg-indigo-800/40 rounded-full animate-pulse mb-2" />
        <div className="h-1.5 w-full bg-indigo-200 dark:bg-indigo-900/50 rounded-full" />
      </BentoCell>
    )
  }

  if (!meta) {
    return (
      <BentoCell className={`col-span-12 md:col-span-6 bg-indigo-50 dark:bg-indigo-900/10 border-indigo-100 dark:border-indigo-900/30 flex flex-col items-center justify-center text-center gap-2 ${className}`}>
        <span className="text-3xl opacity-40">🎯</span>
        <p className="text-xs text-indigo-400 dark:text-indigo-500">
          Sin metas activas
        </p>
        <Link
          to="/planificacion"
          className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
        >
          Crear una meta →
        </Link>
      </BentoCell>
    )
  }

  const pct    = Math.min(((meta.monto_actual ?? 0) / (meta.monto_objetivo ?? 1)) * 100, 100)
  const falta  = (meta.monto_objetivo ?? 0) - (meta.monto_actual ?? 0)
  const cercana = pct >= 80
  const color  = meta.color ?? '#6366F1'

  // Días restantes si tiene fecha límite
  let diasRestantes = null
  if (meta.fecha_limite) {
    const diff = Math.ceil(
      (new Date(meta.fecha_limite + 'T00:00:00') - new Date()) / 86_400_000
    )
    diasRestantes = diff
  }

  return (
    <Link to="/planificacion" className={`block col-span-12 md:col-span-6 ${className}`}>
      <BentoCell
        className="h-full flex flex-col justify-between relative cursor-pointer
          hover:scale-[1.02] transition-transform"
        style={{
          background: color + '12',
          borderColor: color + '25',
        }}
      >
        {/* Emoji decorativo fondo */}
        <div
          className="absolute -right-4 -bottom-4 text-8xl opacity-[0.06] select-none pointer-events-none"
          style={{ filter: 'blur(2px)' }}
        >
          {meta.icono ?? '🎯'}
        </div>

        {/* Header */}
        <div className="flex items-center gap-1.5 relative z-10 mb-1">
          <span className="text-lg">{meta.icono ?? '🎯'}</span>
          <p
            className="text-[10px] font-extrabold uppercase tracking-wider"
            style={{ color }}
          >
            Meta {activas.length > 1 ? `1/${activas.length}` : 'activa'}
          </p>
          {cercana && (
            <span
              className="text-[8px] font-black uppercase px-2 py-0.5 rounded-full animate-pop-in"
              style={{ background: color + '22', color }}
            >
              ¡CASI!
            </span>
          )}
        </div>

        {/* Nombre y falta */}
        <div className="relative z-10">
          <p
            className="text-[14px] font-black leading-tight mb-1 text-zinc-900 dark:text-white"
          >
            {meta.nombre}
          </p>
          <p className="text-[11px] font-bold mb-3" style={{ color }}>
            {falta > 0 ? `Faltan ${fmtMonto(falta)}` : '¡Completada! 🎉'}
            {diasRestantes !== null && falta > 0 && (
              <span className="text-zinc-400 dark:text-zinc-500 font-medium ml-1.5 opacity-60">
                · {diasRestantes > 0 ? `${diasRestantes}d restantes` : 'Vencida'}
              </span>
            )}
          </p>

          {/* Barra de progreso */}
          <div className="h-2.5 w-full bg-zinc-200/50 dark:bg-zinc-800/40 rounded-full overflow-hidden p-[1px] shadow-inner">
            <div
              className="h-full rounded-full transition-all duration-1000 ease-out relative"
              style={{
                width: `${pct}%`,
                background: `linear-gradient(90deg, ${color}CC, ${color})`,
                boxShadow: cercana ? `0 0 12px ${color}50` : 'none',
              }}
            >
               {/* Shine effect inside the progress bar */}
              <div className="absolute inset-0 bg-gradient-to-b from-white/20 to-transparent pointer-events-none" />
            </div>
          </div>

          {/* Porcentaje */}
          <div className="flex justify-between items-end mt-2">
            <p className="text-[10px] font-black" style={{ color }}>
              {pct.toFixed(0)}%
            </p>
            <p className="text-[9px] font-bold text-zinc-400 dark:text-zinc-500 tabular-nums">
              {fmtMonto(meta.monto_actual ?? 0)} / {fmtMonto(meta.monto_objetivo ?? 0)}
            </p>
          </div>
        </div>
      </BentoCell>
    </Link>
  )
}