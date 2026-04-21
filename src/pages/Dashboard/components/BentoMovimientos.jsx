import { Link } from 'react-router-dom'
import { useUltimosMovimientos } from '../../../hooks/useMovimientos'
import { fmtCompleto } from '../helpers'
import { BentoCell } from '../../../components/bento/BentoCell'

function MovReciente({ m }) {
  const esIngreso = m.tipo === 'ingreso'
  const cat = m.categorias
  const montoAbs = Math.abs(Number(m.monto))
  const montoDisplay = fmtCompleto(montoAbs)
  const fechaFmt = new Date(m.fecha + 'T00:00:00').toLocaleDateString('es-AR', { day: 'numeric', month: 'short' })

  return (
    <div className="flex items-center gap-3 py-3 px-1 hover:bg-zinc-50 dark:hover:bg-zinc-800/30 rounded-xl transition-colors">
      <div className="w-11 h-11 rounded-[16px] flex items-center justify-center text-xl flex-shrink-0 shadow-sm"
        style={{ background: (cat?.color ?? '#F5A623') + '18' }}>
        <span>{cat?.icono ?? '📦'}</span>
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[14px] font-bold text-zinc-800 dark:text-zinc-100 truncate leading-tight">
          {m.descripcion || cat?.nombre}
        </p>
        <p className="text-[11px] text-zinc-400 mt-1">{cat?.nombre} · {fechaFmt}</p>
      </div>
      <div className="flex flex-col items-end flex-shrink-0">
        <span className={`text-[14px] font-black tabular-nums tracking-tight ${
          esIngreso ? 'text-emerald-500 dark:text-emerald-400' : 'text-zinc-800 dark:text-zinc-300'
        }`}>
          {esIngreso ? '+' : '-'}{montoDisplay}
        </span>
      </div>
    </div>
  )
}

export function BentoMovimientos({ className = '' }) {
  const { movimientos: ultimos, cargando: cUlt } = useUltimosMovimientos(5)

  return (
    <BentoCell className={`col-span-12 mb-6 ${className}`} cols={12}>
      <div className="flex items-center justify-between pb-4">
        <p className="text-[10px] font-extrabold text-zinc-400 dark:text-zinc-500 uppercase tracking-[0.12em]">
          Últimos movimientos
        </p>
        <Link to="/movimientos"
          className="text-[10px] font-bold text-[var(--mango-dark)] dark:text-[var(--mango)] hover:underline">
          Ver historial completo →
        </Link>
      </div>

      <div className="pb-1">
        {cUlt ? (
          <div className="flex flex-col gap-3 py-1">
            {[0,1,2].map(i => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-[16px] bg-zinc-100 dark:bg-zinc-800 animate-pulse flex-shrink-0" />
                <div className="flex-1 space-y-1.5">
                  <div className="h-3 bg-zinc-100 dark:bg-zinc-800 rounded-full animate-pulse w-3/4" />
                  <div className="h-2.5 bg-zinc-100 dark:bg-zinc-800 rounded-full animate-pulse w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : ultimos.length === 0 ? (
          <div className="flex flex-col items-center py-8 gap-2">
            <span className="text-3xl opacity-50 grayscale">💸</span>
            <p className="text-xs font-medium text-zinc-400">Silencio en la billetera</p>
          </div>
        ) : (
          <div className="divide-y divide-zinc-50 dark:divide-zinc-800/30">
            {ultimos.map(m => <MovReciente key={m.id} m={m} />)}
          </div>
        )}
      </div>
    </BentoCell>
  )
}
