// src/components/bento/BentoBalance.jsx
import { BentoCell, BentoLabel, BentoAmount } from './BentoCell'
import { fmtCompleto as formatMoneda } from '../../pages/Dashboard/helpers'

export function BentoBalance({ balance, cargando }) {
  const saldo = (balance?.total_ingresos ?? 0) - (balance?.total_gastos ?? 0)
  const positivo = saldo >= 0

  return (
    // col-span-7 en desktop, 12 en mobile
    <BentoCell
      cols={7}
      className="col-span-12 md:col-span-7"
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
      ) : (
        <>
          <BentoAmount
            value={formatMoneda(Math.abs(saldo))}
            size="xl"
            color={positivo ? 'positive' : 'negative'}
            label={`Saldo del mes: ${formatMoneda(saldo)}`}
          />

          {/* Badge de variación con rol semántico */}
          <p
            role="status"
            aria-label={`Variación del 12.4% respecto al mes anterior`}
            className="inline-flex items-center gap-1 mt-2 text-[10px] font-semibold
              bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400
              px-2 py-1 rounded-lg"
          >
            ▲ +12.4% vs mes anterior
          </p>
        </>
      )}

      {/* Sub-métricas */}
      <div
        className="flex gap-6 mt-4"
        role="group"
        aria-label="Desglose de ingresos y gastos"
      >
        <div>
          <BentoLabel>Ingresos</BentoLabel>
          <BentoAmount
            value={formatMoneda(balance?.total_ingresos ?? 0)}
            size="md"
            color="positive"
            label={`Ingresos totales: ${formatMoneda(balance?.total_ingresos ?? 0)}`}
          />
        </div>
        <div>
          <BentoLabel>Gastos</BentoLabel>
          <BentoAmount
            value={formatMoneda(balance?.total_gastos ?? 0)}
            size="md"
            color="negative"
            label={`Gastos totales: ${formatMoneda(balance?.total_gastos ?? 0)}`}
          />
        </div>
      </div>
    </BentoCell>
  )
}
