// src/components/layout/PresupCard.jsx
// Enhanced color coding: red glow when approaching limit, thick bar

const ESTADO = {
  sin_datos: {
    barra: '#E5E7EB',
    barraGlow: 'none',
    etiqueta: 'Sin gastos',
    color: 'text-zinc-400',
    bgTint: '',
    borderTint: '',
  },
  holgado: {
    barra: '#10B981',
    barraGlow: 'none',
    etiqueta: 'Bajo control',
    color: 'text-emerald-600 dark:text-emerald-400',
    bgTint: '',
    borderTint: '',
  },
  alerta: {
    barra: '#F59E0B',
    barraGlow: '0 0 8px rgba(245,158,11,0.4)',
    etiqueta: '⚠️ Atención',
    color: 'text-amber-600 dark:text-amber-400',
    bgTint: 'bg-amber-50/40 dark:bg-amber-900/5',
    borderTint: 'border-amber-200/60 dark:border-amber-800/30',
  },
  critico: {
    barra: '#EF4444',
    barraGlow: '0 0 12px rgba(239,68,68,0.5)',
    etiqueta: '🔴 Crítico',
    color: 'text-red-500 dark:text-red-400',
    bgTint: 'bg-red-50/50 dark:bg-red-900/8',
    borderTint: 'border-red-200/60 dark:border-red-800/30',
  },
  excedido: {
    barra: '#DC2626',
    barraGlow: '0 0 16px rgba(220,38,38,0.6)',
    etiqueta: '🚨 Excedido',
    color: 'text-red-600 dark:text-red-400 font-bold',
    bgTint: 'bg-red-50/60 dark:bg-red-900/10',
    borderTint: 'border-red-300/80 dark:border-red-700/40',
  },
}

function calcularEstado(pct, alertaPct) {
  if (pct === 0)         return 'sin_datos'
  if (pct > 100)         return 'excedido'
  if (pct >= 90)         return 'critico'   // NEW: red near limit
  if (pct >= alertaPct)  return 'alerta'
  return 'holgado'
}

export function PresupCard({ presupuesto, onClick }) {
  const { categoria_nombre, categoria_icono, limite_monto, gastado, porcentaje, alerta_pct } = presupuesto
  const estado = calcularEstado(porcentaje ?? 0, alerta_pct)
  const cfg    = ESTADO[estado]
  const pctUI  = Math.min(porcentaje ?? 0, 100)
  const esRojo = estado === 'critico' || estado === 'excedido'

  return (
    <div
      onClick={onClick}
      className={`flex flex-col gap-2.5 py-4 px-3 -mx-3 rounded-[18px] cursor-pointer
        transition-all duration-300 group
        hover:shadow-[var(--shadow-sm)]
        ${cfg.bgTint || 'hover:bg-zinc-50/80 dark:hover:bg-zinc-800/40'}
        ${cfg.borderTint ? `border ${cfg.borderTint}` : ''}`}
    >
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className={`w-10 h-10 rounded-[14px] flex items-center justify-center text-xl flex-shrink-0
            ${esRojo ? 'bg-red-100/80 dark:bg-red-900/20' : 'bg-zinc-50 dark:bg-zinc-800/50'}`}>
            {categoria_icono}
          </div>
          <div className="min-w-0">
            <span className="text-sm font-bold text-zinc-800 dark:text-zinc-100 truncate block font-display">
              {categoria_nombre}
            </span>
            <span className={`text-[10px] font-semibold ${cfg.color}`}>{cfg.etiqueta}</span>
          </div>
        </div>
        <div className="text-right flex-shrink-0">
          <span className={`text-sm font-black tabular-nums font-mono-num ${
            esRojo ? 'text-red-600 dark:text-red-400' : 'text-zinc-800 dark:text-zinc-100'
          }`}>
            ${Number(gastado ?? 0).toLocaleString('es-AR')}
          </span>
          <span className="text-xs text-zinc-400 dark:text-zinc-500 ml-1">
            / ${Number(limite_monto).toLocaleString('es-AR')}
          </span>
        </div>
      </div>

      {/* Progress bar — thicker, with glow */}
      <div className="h-2.5 bg-zinc-100 dark:bg-zinc-700/60 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-700
            ${esRojo ? 'animate-pulse-subtle' : ''}`}
          style={{
            width: `${pctUI}%`,
            backgroundColor: cfg.barra,
            boxShadow: cfg.barraGlow,
          }}
        />
      </div>

      <div className="flex items-center justify-between">
        <span className="text-[10px] text-zinc-400 dark:text-zinc-500 tabular-nums font-medium">
          {(porcentaje ?? 0).toFixed(0)}% utilizado
        </span>
        {porcentaje > 0 && porcentaje <= 100 && (
          <span className="text-[10px] text-zinc-400 dark:text-zinc-500 font-medium">
            Queda ${Number(limite_monto - (gastado ?? 0)).toLocaleString('es-AR')}
          </span>
        )}
        {estado === 'excedido' && (
          <span className="text-[10px] text-red-500 font-bold">
            Excedido en ${Number((gastado ?? 0) - limite_monto).toLocaleString('es-AR')}
          </span>
        )}
      </div>
    </div>
  )
}