// src/pages/Calculadora/index.jsx
// Calculadora de cuotas vs. contado para Argentina
// Calcula el costo real de financiarse en cuotas considerando inflación

import { useState, useMemo } from 'react'
import { PageWrapper, PageHeader } from '../../components/layout'
import { Card } from '../../components/ui'

// ── Helpers ──────────────────────────────────────────────────
const fmtPesos = (n) =>
  n == null || isNaN(n)
    ? '—'
    : `$\u00A0${Number(n).toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`

const fmtPct = (n) =>
  n == null || isNaN(n) ? '—' : `${Number(n).toFixed(2)}%`

/**
 * Calcula la cuota mensual por el método francés (amortización constante con interés).
 * Fórmula: C = P * (r * (1+r)^n) / ((1+r)^n - 1)
 */
function calcularCuotaFrancesa(capital, tasaMensual, cuotas) {
  if (tasaMensual === 0) return capital / cuotas
  const r = tasaMensual
  const n = cuotas
  return capital * (r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1)
}

/**
 * Calcula el valor presente de una cuota futura, deflactada por la inflación.
 * VP = cuota / (1 + inflacionMensual)^mes
 */
function valorPresente(cuota, inflacionMensual, mes) {
  return cuota / Math.pow(1 + inflacionMensual, mes)
}

/**
 * Motor principal del cálculo.
 */
function calcular({ precioContado, cuotas, teaAnual, inflacionMensual, descuentoContado }) {
  const precioConDescuento = precioContado * (1 - descuentoContado / 100)
  const tasaMensual = Math.pow(1 + teaAnual / 100, 1 / 12) - 1

  const cuotaMensual = calcularCuotaFrancesa(precioContado, tasaMensual, cuotas)
  const totalACobrar = cuotaMensual * cuotas
  const interesTotalPesos = totalACobrar - precioContado
  const cftAnual = (Math.pow(cuotaMensual * cuotas / precioContado, 12 / cuotas) - 1) * 100

  // Valor presente de todas las cuotas (poder adquisitivo real)
  let totalVP = 0
  const detallesCuotas = []
  for (let i = 1; i <= cuotas; i++) {
    const vp = valorPresente(cuotaMensual, inflacionMensual / 100, i)
    totalVP += vp
    detallesCuotas.push({
      mes: i,
      cuota: cuotaMensual,
      vpCuota: vp,
    })
  }

  const ahorroRealVsContado = precioContado - totalVP
  const conveneCuotas = totalVP < precioConDescuento

  return {
    precioConDescuento,
    cuotaMensual,
    totalACobrar,
    interesTotalPesos,
    cftAnual: isFinite(cftAnual) ? cftAnual : null,
    totalVP,
    ahorroRealVsContado,
    conveneCuotas,
    detallesCuotas,
    tasaMensual: tasaMensual * 100,
  }
}

// ── Componente de barra de comparación ──────────────────────
function BarraComparacion({ label, valor, maximo, color, emoji }) {
  const pct = maximo > 0 ? Math.min((valor / maximo) * 100, 100) : 0
  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs text-zinc-500 font-medium">{emoji} {label}</span>
        <span className="text-sm font-bold text-zinc-800 dark:text-zinc-200">{fmtPesos(valor)}</span>
      </div>
      <div className="h-2 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{ width: `${pct}%`, backgroundColor: color }}
        />
      </div>
    </div>
  )
}

// ── Formulario de entrada ────────────────────────────────────
function FormCalculadora({ valores, onChange }) {
  const set = (k) => (e) => onChange({ ...valores, [k]: parseFloat(e.target.value) || 0 })
  const setStr = (k) => (e) => onChange({ ...valores, [k]: e.target.value })

  const CUOTAS_OPCIONES = [1, 3, 6, 9, 12, 18, 24, 36, 48]

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {/* Precio de contado */}
      <div className="flex flex-col gap-1">
        <label className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
          💰 Precio de contado ($)
        </label>
        <input
          type="number"
          value={valores.precioContado || ''}
          onChange={set('precioContado')}
          placeholder="Ej: 500000"
          className="w-full bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700
            rounded-xl px-3 py-2.5 text-sm text-zinc-900 dark:text-white
            focus:outline-none focus:ring-2 focus:ring-[var(--mango)]/40"
        />
      </div>

      {/* Descuento por pago en efectivo */}
      <div className="flex flex-col gap-1">
        <label className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
          🏷️ Descuento por pago contado (%)
        </label>
        <input
          type="number"
          value={valores.descuentoContado || ''}
          onChange={set('descuentoContado')}
          placeholder="Ej: 10"
          min="0" max="50" step="0.5"
          className="w-full bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700
            rounded-xl px-3 py-2.5 text-sm text-zinc-900 dark:text-white
            focus:outline-none focus:ring-2 focus:ring-[var(--mango)]/40"
        />
        <p className="text-[10px] text-zinc-400 px-1">Algunos comercios ofrecen descuento por pago sin tarjeta</p>
      </div>

      {/* Cantidad de cuotas */}
      <div className="flex flex-col gap-1">
        <label className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
          🗓️ Cantidad de cuotas
        </label>
        <div className="grid grid-cols-5 gap-1">
          {CUOTAS_OPCIONES.map(n => (
            <button
              key={n}
              onClick={() => onChange({ ...valores, cuotas: n })}
              className={`py-2 rounded-xl text-xs font-bold border-2 transition-all ${
                valores.cuotas === n
                  ? 'border-[var(--mango)] bg-[var(--mango)]/10 text-[var(--mango-dark)]'
                  : 'border-zinc-100 dark:border-zinc-800 text-zinc-500 hover:border-zinc-300'
              }`}
            >
              {n}x
            </button>
          ))}
        </div>
      </div>

      {/* TEA del banco */}
      <div className="flex flex-col gap-1">
        <label className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
          🏦 TEA del banco / cuotas sin interés (%)
        </label>
        <input
          type="number"
          value={valores.teaAnual || ''}
          onChange={set('teaAnual')}
          placeholder="Ej: 120 (o 0 para cuotas sin interés)"
          min="0"
          className="w-full bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700
            rounded-xl px-3 py-2.5 text-sm text-zinc-900 dark:text-white
            focus:outline-none focus:ring-2 focus:ring-[var(--mango)]/40"
        />
        <p className="text-[10px] text-zinc-400 px-1">
          Ponée 0 si son cuotas sin interés (cuota simple = precio ÷ cuotas)
        </p>
      </div>

      {/* Inflación mensual estimada */}
      <div className="flex flex-col gap-1 sm:col-span-2">
        <div className="flex items-center justify-between">
          <label className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
            📈 Inflación mensual estimada: <span className="font-bold text-zinc-700 dark:text-zinc-200">{valores.inflacionMensual}%</span>
          </label>
        </div>
        <input
          type="range"
          min="2" max="20" step="0.5"
          value={valores.inflacionMensual}
          onChange={set('inflacionMensual')}
          className="accent-amber-400 w-full"
        />
        <div className="flex justify-between text-[10px] text-zinc-400">
          <span>2% (baja)</span>
          <span>10% (moderada)</span>
          <span>20% (alta)</span>
        </div>
        <p className="text-[10px] text-zinc-400 mt-1">
          💡 La inflación "licúa" las cuotas: pagas mañana con plata que vale menos que hoy.
          Argentina en 2024 promedió ~12% mensual.
        </p>
      </div>
    </div>
  )
}

// ── Página principal ─────────────────────────────────────────
export function CalculadoraPage() {
  const [valores, setValores] = useState({
    precioContado:     500000,
    descuentoContado:  10,
    cuotas:            12,
    teaAnual:          120,
    inflacionMensual:  5,
  })

  const resultado = useMemo(() => {
    if (!valores.precioContado || valores.precioContado <= 0) return null
    try {
      return calcular(valores)
    } catch { return null }
  }, [valores])

  const maximo = resultado
    ? Math.max(resultado.precioConDescuento, resultado.totalACobrar, resultado.totalVP)
    : 0

  return (
    <div className="animate-in fade-in duration-500">
      <PageWrapper>
        <PageHeader
          titulo="🧮 ¿Cuotas o Contado?"
          subtitulo="Calculá qué te conviene más teniendo en cuenta la inflación"
        />

        {/* Intro */}
        <div className="mb-5 bg-blue-50/60 dark:bg-blue-900/10 rounded-2xl px-4 py-3
          border border-blue-200/60 dark:border-blue-800/30">
          <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
            🇦🇷 En Argentina, la inflación cambia la ecuación. Una cuota de <b>$10.000</b> hoy vale más
            que la misma cuota dentro de 12 meses. Esta calculadora mide el <b>costo real</b> de financiarte.
          </p>
        </div>

        {/* Formulario */}
        <Card className="mb-5">
          <h3 className="text-sm font-bold text-zinc-800 dark:text-zinc-100 mb-4">⚙️ Parámetros</h3>
          <FormCalculadora valores={valores} onChange={setValores} />
        </Card>

        {/* Resultados */}
        {resultado && valores.precioContado > 0 && (
          <>
            {/* Veredicto */}
            <div className={`mb-5 rounded-2xl px-5 py-4 border-2 ${
              resultado.conveneCuotas
                ? 'bg-emerald-50 dark:bg-emerald-900/15 border-emerald-300 dark:border-emerald-700/50'
                : 'bg-amber-50 dark:bg-amber-900/15 border-amber-300 dark:border-amber-700/50'
            }`}>
              <div className="flex items-center gap-3">
                <span className="text-3xl">{resultado.conveneCuotas ? '✅' : '🏷️'}</span>
                <div>
                  <p className={`text-base font-black leading-tight ${
                    resultado.conveneCuotas
                      ? 'text-emerald-800 dark:text-emerald-300'
                      : 'text-amber-800 dark:text-amber-300'
                  }`}>
                    {resultado.conveneCuotas
                      ? '¡Las cuotas te convienen!'
                      : 'El pago en efectivo te conviene más.'}
                  </p>
                  <p className={`text-xs mt-0.5 ${
                    resultado.conveneCuotas
                      ? 'text-emerald-700 dark:text-emerald-400'
                      : 'text-amber-700 dark:text-amber-400'
                  }`}>
                    {resultado.conveneCuotas
                      ? `Pagando en cuotas, el valor real total es ${fmtPesos(resultado.totalVP)}, menos que el contado de ${fmtPesos(resultado.precioConDescuento)}.`
                      : `El contado con descuento (${fmtPesos(resultado.precioConDescuento)}) es más barato que el valor real de las cuotas (${fmtPesos(resultado.totalVP)}).`}
                  </p>
                </div>
              </div>
            </div>

            {/* Comparación visual */}
            <Card className="mb-5">
              <h3 className="text-sm font-bold text-zinc-800 dark:text-zinc-100 mb-4">📊 Comparación</h3>
              <div className="flex flex-col gap-4">
                <BarraComparacion
                  label={`Contado con ${valores.descuentoContado}% descuento`}
                  valor={resultado.precioConDescuento}
                  maximo={maximo}
                  color="#10B981"
                  emoji="💵"
                />
                <BarraComparacion
                  label={`Total a pagar en ${valores.cuotas} cuotas`}
                  valor={resultado.totalACobrar}
                  maximo={maximo}
                  color="#EF4444"
                  emoji="💳"
                />
                <BarraComparacion
                  label="Valor real de las cuotas (ajustado por inflación)"
                  valor={resultado.totalVP}
                  maximo={maximo}
                  color="#F59E0B"
                  emoji="📉"
                />
              </div>
              <p className="text-[10px] text-zinc-400 mt-4 leading-relaxed">
                💡 El "valor real" es cuánto valen hoy esos pagos futuros, descontando la inflación.
                Con inflación del {valores.inflacionMensual}% mensual, pagar $1.000 dentro de 12 meses
                equivale hoy a pagar solo {fmtPesos(1000 / Math.pow(1 + valores.inflacionMensual / 100, 12))}.
              </p>
            </Card>

            {/* Resumen numérico */}
            <Card className="mb-5">
              <h3 className="text-sm font-bold text-zinc-800 dark:text-zinc-100 mb-4">🔢 Resumen</h3>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: 'Cuota mensual', valor: fmtPesos(resultado.cuotaMensual), color: 'text-zinc-800 dark:text-zinc-100' },
                  { label: 'Total a pagar', valor: fmtPesos(resultado.totalACobrar), color: 'text-red-600 dark:text-red-400' },
                  { label: 'Interés total ($)', valor: fmtPesos(resultado.interesTotalPesos), color: 'text-red-500 dark:text-red-400' },
                  { label: 'Tasa mensual efectiva', valor: fmtPct(resultado.tasaMensual), color: 'text-zinc-600 dark:text-zinc-300' },
                  { label: 'Valor real de cuotas', valor: fmtPesos(resultado.totalVP), color: 'text-amber-600 dark:text-amber-400' },
                  { label: `Ahorro/costo vs. contado real`, valor: fmtPesos(Math.abs(resultado.ahorroRealVsContado)), color: resultado.ahorroRealVsContado > 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400' },
                ].map(item => (
                  <div key={item.label}
                    className="bg-zinc-50 dark:bg-zinc-800/50 rounded-xl p-3 border border-zinc-100 dark:border-zinc-800">
                    <p className="text-[10px] text-zinc-400 uppercase tracking-wider font-medium mb-0.5 leading-tight">
                      {item.label}
                    </p>
                    <p className={`text-base font-black leading-tight ${item.color}`}>{item.valor}</p>
                  </div>
                ))}
              </div>
            </Card>

            {/* Desglose por cuotas (colapsable) */}
            <DesgloseCuotas detalle={resultado.detallesCuotas} />
          </>
        )}

        {!resultado && (
          <div className="flex items-center justify-center h-32 text-zinc-400 text-sm text-center px-4">
            Completá el precio y las condiciones de financiación para ver el análisis.
          </div>
        )}

        <p className="text-[10px] text-zinc-400 text-center mt-4 pb-4">
          Cálculo orientativo. Los resultados reales pueden variar según el CFT del banco y condiciones específicas.
        </p>
      </PageWrapper>
    </div>
  )
}

// ── Desglose expandible ──────────────────────────────────────
function DesgloseCuotas({ detalle }) {
  const [expandido, setExpandido] = useState(false)
  if (!detalle || detalle.length === 0) return null

  const visibles = expandido ? detalle : detalle.slice(0, 4)

  return (
    <Card className="mb-5">
      <h3 className="text-sm font-bold text-zinc-800 dark:text-zinc-100 mb-4">📅 Desglose por cuota</h3>
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-zinc-100 dark:border-zinc-800">
              <th className="text-left py-2 text-zinc-400 font-medium">Mes</th>
              <th className="text-right py-2 text-zinc-400 font-medium">Cuota nominal</th>
              <th className="text-right py-2 text-zinc-400 font-medium">Valor real (hoy)</th>
            </tr>
          </thead>
          <tbody>
            {visibles.map(row => (
              <tr key={row.mes} className="border-b border-zinc-50 dark:border-zinc-800/50">
                <td className="py-2 text-zinc-600 dark:text-zinc-400">Mes {row.mes}</td>
                <td className="py-2 text-right font-medium text-zinc-800 dark:text-zinc-200">
                  {fmtPesos(row.cuota)}
                </td>
                <td className="py-2 text-right font-medium text-amber-600 dark:text-amber-400">
                  {fmtPesos(row.vpCuota)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {detalle.length > 4 && (
        <button
          onClick={() => setExpandido(e => !e)}
          className="w-full text-center text-xs font-medium text-zinc-400 hover:text-zinc-600
            dark:hover:text-zinc-300 mt-3 pt-3 border-t border-zinc-100 dark:border-zinc-800 transition-colors"
        >
          {expandido ? 'Ver menos ▲' : `Ver las ${detalle.length - 4} cuotas restantes ▼`}
        </button>
      )}
    </Card>
  )
}