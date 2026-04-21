// src/components/bento/BentoBalance.jsx
import { BentoCell, BentoLabel, BentoAmount } from './BentoCell'
import { fmtCompleto as formatMoneda } from '../../pages/Dashboard/helpers'

function calcularVariacion(balanceActual, balancePrevio) {
  const saldoActual  = (balanceActual?.total_ingresos  ?? 0) - (balanceActual?.total_gastos  ?? 0)
  const saldoPrevio  = (balancePrevio?.total_ingresos  ?? 0) - (balancePrevio?.total_gastos  ?? 0)

  if (!balancePrevio || saldoPrevio === 0) return null

  const variacion = ((saldoActual - saldoPrevio) / Math.abs(saldoPrevio)) * 100
  return parseFloat(variacion.toFixed(1))
}

export function BentoBalance({ balance, balancePrevio, cargando, className = '' }) {
  const saldo    = (balance?.total_ingresos ?? 0) - (balance?.total_gastos ?? 0)
  const positivo = saldo >= 0
  const sinDatos = !balance || (balance.total_ingresos === 0 && balance.total_gastos === 0)

  const variacion = calcularVariacion(balance, balancePrevio)

  return (
    <BentoCell
      cols={7}
      className={`col-span-12 md:col-span-7 ${className}`}
      role="region"
      aria-labelledby="balance-heading"
    >
      <BentoLabel>
        <span id="balance-heading">Balance del mes</span>
      </BentoLabel>

      {cargando ? (
        <div
          className="h-10 w-48 rounded-xl bg-zinc-100 dark:bg-zinc-800 animate-pulse"
          role="status"
          aria-label="Cargando balance..."
        />
      ) : sinDatos ? (
        // ── Estado vacío amigable ──────────────────────────────
        <div className="flex flex-col gap-1 mt-1">
          <p className="text-2xl font-black text-zinc-300 dark:text-zinc-600">$0</p>
          <p className="text-xs text-zinc-400 dark:text-zinc-500 leading-snug">
            Este mes arrancás de cero 🥭<br />
            Registrá tu primer movimiento para empezar.
          </p>
        </div>
      ) : (
        <>
          <BentoAmount
            value={formatMoneda(Math.abs(saldo))}
            size="xl"
            color={positivo ? 'positive' : 'negative'}
            label={`Saldo del mes: ${formatMoneda(saldo)}`}
            className="animate-counter"
          />

          {/* Badge de variación real vs mes anterior */}
          {variacion !== null ? (
            <p
              role="status"
              className={`inline-flex items-center gap-1 mt-2 text-[10px] font-black uppercase tracking-wider
                px-2.5 py-1 rounded-full
                ${variacion >= 0
                  ? 'bg-emerald-100/50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 border border-emerald-200/50 dark:border-emerald-800/30'
                  : 'bg-red-100/50 dark:bg-red-900/25 text-red-600 dark:text-red-400 border border-red-200/50 dark:border-red-800/30'
                }`}
            >
              <span className={variacion >= 0 ? 'animate-bounce' : 'animate-pulse'}>
                {variacion >= 0 ? '▲' : '▼'}
              </span>
              {Math.abs(variacion)}% vs mes anterior
            </p>
          ) : (
            <p className="inline-flex items-center gap-1 mt-2 text-[10px] font-bold uppercase tracking-wider
              px-2.5 py-1 rounded-full bg-zinc-100 dark:bg-zinc-800/50 text-zinc-400 dark:text-zinc-500 border border-zinc-200/50 dark:border-zinc-700/30">
              Primer mes registrado ✨
            </p>
          )}
        </>
      )}

      {/* Sub-métricas */}
      {!cargando && !sinDatos && (
        <div className="flex gap-6 mt-4" role="group" aria-label="Desglose de ingresos y gastos">
          <div>
            <BentoLabel>Ingresos</BentoLabel>
            <BentoAmount
              value={formatMoneda(balance?.total_ingresos ?? 0)}
              size="md"
              color="positive"
            />
          </div>
          <div>
            <BentoLabel>Gastos</BentoLabel>
            <BentoAmount
              value={formatMoneda(balance?.total_gastos ?? 0)}
              size="md"
              color="negative"
            />
          </div>
        </div>
      )}
    </BentoCell>
  )
}