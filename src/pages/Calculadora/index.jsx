// src/pages/Calculadora/index.jsx
// Actualizado: agrega División de Cuenta como tercera pestaña
import { useState, useMemo } from 'react'
import { PageWrapper, PageHeader } from '../../components/layout'
import { Card } from '../../components/ui'
import { useBalance } from '../../hooks/useMovimientos'
import { CalculadoraDivision } from '../../components/ui'

// ─── Helpers ─────────────────────────────────────────────────
const fmtPesos = (n) =>
  n == null || isNaN(n)
    ? '—'
    : `$\u00A0${Number(n).toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`

const fmtPct = (n) => (n == null || isNaN(n) ? '—' : `${Number(n).toFixed(2)}%`)

function calcularCuotaFrancesa(capital, tasaMensual, cuotas) {
  if (tasaMensual === 0) return capital / cuotas
  const r = tasaMensual, n = cuotas
  return capital * (r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1)
}

function valorPresente(cuota, inflacionMensual, mes) {
  return cuota / Math.pow(1 + inflacionMensual, mes)
}

function calcular({ precioContado, cuotas, teaAnual, inflacionMensual, descuentoContado }) {
  const precioConDescuento = precioContado * (1 - descuentoContado / 100)
  const tasaMensual = Math.pow(1 + teaAnual / 100, 1 / 12) - 1
  const cuotaMensual = calcularCuotaFrancesa(precioContado, tasaMensual, cuotas)
  const totalACobrar = cuotaMensual * cuotas
  const interesTotalPesos = totalACobrar - precioContado
  const cftAnual = (Math.pow(cuotaMensual * cuotas / precioContado, 12 / cuotas) - 1) * 100

  let totalVP = 0
  const detallesCuotas = []
  for (let i = 1; i <= cuotas; i++) {
    const vp = valorPresente(cuotaMensual, inflacionMensual / 100, i)
    totalVP += vp
    detallesCuotas.push({ mes: i, cuota: cuotaMensual, vpCuota: vp })
  }

  return {
    precioConDescuento, cuotaMensual, totalACobrar,
    interesTotalPesos, cftAnual: isFinite(cftAnual) ? cftAnual : null,
    totalVP, ahorroRealVsContado: precioContado - totalVP,
    conveneCuotas: totalVP < precioConDescuento,
    detallesCuotas, tasaMensual: tasaMensual * 100,
  }
}

// ─── Calculadora de Fondo de Emergencia ──────────────────────
function CalculadoraFondoEmergencia() {
  const hoy = new Date()
  const desde = new Date(hoy.getFullYear(), hoy.getMonth() - 2, 1).toLocaleDateString('sv-SE')
  const hasta = hoy.toLocaleDateString('sv-SE')
  const { balance } = useBalance(desde, hasta)

  const [meses, setMeses]           = useState(3)
  const [gastoManual, setGastoManual] = useState('')
  const [ahorroActual, setAhorroActual] = useState('')

  const gastoPromedio = useMemo(() => {
    if (gastoManual) return Number(gastoManual)
    if (balance?.total_gastos) return Number(balance.total_gastos) / 3
    return 0
  }, [balance, gastoManual])

  const objetivo        = gastoPromedio * meses
  const acumulado       = Number(ahorroActual) || 0
  const falta           = Math.max(objetivo - acumulado, 0)
  const pct             = objetivo > 0 ? Math.min((acumulado / objetivo) * 100, 100) : 0
  const mesesParaLograr = falta > 0 && gastoPromedio > 0 ? Math.ceil(falta / (gastoPromedio * 0.1)) : 0

  return (
    <div className="flex flex-col gap-5">
      <div className="bg-emerald-50/60 dark:bg-emerald-900/10 rounded-2xl px-4 py-3 border border-emerald-200/60 dark:border-emerald-800/30">
        <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
          🛡️ El fondo de emergencia es tu colchón financiero. Debería cubrir entre <b>3 y 6 meses</b> de gastos.
        </p>
      </div>

      <Card>
        <h3 className="text-sm font-bold text-zinc-800 dark:text-zinc-100 mb-4">⚙️ Configuración</h3>
        <div className="flex flex-col gap-4">
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
                Meses de cobertura: <span className="font-bold text-zinc-700 dark:text-zinc-200">{meses}</span>
              </label>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                meses <= 3 ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'
              }`}>
                {meses <= 3 ? 'Básico' : meses <= 5 ? 'Recomendado' : 'Excelente'}
              </span>
            </div>
            <input type="range" min="1" max="12" value={meses}
              onChange={e => setMeses(Number(e.target.value))}
              className="accent-emerald-500 w-full" />
            <div className="flex justify-between text-[10px] text-zinc-400 mt-0.5">
              <span>1 mes</span><span>6 meses ✅</span><span>12 meses</span>
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
              Gasto mensual promedio
              {balance?.total_gastos && !gastoManual && (
                <span className="ml-1 text-[9px] text-emerald-600 dark:text-emerald-400 font-bold">
                  (detectado automáticamente)
                </span>
              )}
            </label>
            <div className="relative flex items-center">
              <span className="absolute left-3 text-zinc-400 text-sm">$</span>
              <input
                type="number"
                value={gastoManual || (gastoPromedio > 0 ? Math.round(gastoPromedio) : '')}
                onChange={e => setGastoManual(e.target.value)}
                placeholder={gastoPromedio > 0 ? Math.round(gastoPromedio).toString() : 'Ingresá tus gastos mensuales'}
                className="w-full bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700
                  rounded-xl pl-8 pr-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400/40
                  text-zinc-900 dark:text-white placeholder:text-zinc-400"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
              ¿Cuánto ya tenés ahorrado? (opcional)
            </label>
            <div className="relative flex items-center">
              <span className="absolute left-3 text-zinc-400 text-sm">$</span>
              <input
                type="number"
                value={ahorroActual}
                onChange={e => setAhorroActual(e.target.value)}
                placeholder="0"
                className="w-full bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700
                  rounded-xl pl-8 pr-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400/40
                  text-zinc-900 dark:text-white placeholder:text-zinc-400"
              />
            </div>
          </div>
        </div>
      </Card>

      {gastoPromedio > 0 && (
        <>
          <div className={`rounded-2xl border-2 p-5 ${
            pct >= 100
              ? 'bg-emerald-50 dark:bg-emerald-900/15 border-emerald-300 dark:border-emerald-700/50'
              : pct >= 50
                ? 'bg-amber-50 dark:bg-amber-900/15 border-amber-300 dark:border-amber-700/50'
                : 'bg-red-50 dark:bg-red-900/15 border-red-200 dark:border-red-800/50'
          }`}>
            <div className="flex items-center justify-between mb-3">
              <p className="text-base font-black text-zinc-800 dark:text-zinc-100">
                {pct >= 100 ? '🎉 ¡Fondo completo!' : pct >= 50 ? '📈 Buen progreso' : '🚨 Empezando desde cero'}
              </p>
              <span className="text-2xl font-black" style={{
                color: pct >= 100 ? '#10B981' : pct >= 50 ? '#F59E0B' : '#EF4444'
              }}>
                {pct.toFixed(0)}%
              </span>
            </div>

            <div className="h-3 bg-zinc-200 dark:bg-zinc-700 rounded-full overflow-hidden mb-4">
              <div
                className="h-full rounded-full transition-all duration-700"
                style={{
                  width: `${pct}%`,
                  background: pct >= 100 ? '#10B981' : pct >= 50 ? '#F59E0B' : '#EF4444'
                }}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="text-[10px] text-zinc-400 uppercase tracking-wider font-medium mb-0.5">Objetivo</p>
                <p className="text-lg font-black text-zinc-800 dark:text-zinc-100">{fmtPesos(objetivo)}</p>
                <p className="text-[10px] text-zinc-400">{meses} meses × {fmtPesos(gastoPromedio)}/mes</p>
              </div>
              <div>
                <p className="text-[10px] text-zinc-400 uppercase tracking-wider font-medium mb-0.5">Te falta</p>
                <p className={`text-lg font-black ${falta === 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
                  {falta === 0 ? '¡Nada! ✅' : fmtPesos(falta)}
                </p>
                {mesesParaLograr > 0 && (
                  <p className="text-[10px] text-zinc-400">~{mesesParaLograr} meses ahorrando el 10%</p>
                )}
              </div>
            </div>
          </div>

          {pct < 100 && (
            <Card>
              <h3 className="text-sm font-bold text-zinc-800 dark:text-zinc-100 mb-3">💡 Para armar tu fondo</h3>
              <div className="flex flex-col gap-2">
                {[
                  { pct: 5,  label: 'Ahorro conservador (5%)', monto: gastoPromedio * 0.05 },
                  { pct: 10, label: 'Ahorro recomendado (10%)', monto: gastoPromedio * 0.10 },
                  { pct: 20, label: 'Ahorro agresivo (20%)',    monto: gastoPromedio * 0.20 },
                ].map(op => (
                  <div key={op.pct} className="flex items-center justify-between py-2 px-3
                    bg-zinc-50 dark:bg-zinc-800/50 rounded-xl">
                    <span className="text-xs font-medium text-zinc-600 dark:text-zinc-400">{op.label}</span>
                    <div className="text-right">
                      <span className="text-sm font-bold text-zinc-800 dark:text-zinc-100">
                        {fmtPesos(op.monto)}/mes
                      </span>
                      <p className="text-[10px] text-zinc-400">
                        Listo en {falta > 0 ? Math.ceil(falta / op.monto) : 0} meses
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </>
      )}
    </div>
  )
}

// ─── Calculadora Cuotas vs Contado ────────────────────────────
function BarraComparacion({ label, valor, maximo, color, emoji }) {
  const pct = maximo > 0 ? Math.min((valor / maximo) * 100, 100) : 0
  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs text-zinc-500 font-medium">{emoji} {label}</span>
        <span className="text-sm font-bold text-zinc-800 dark:text-zinc-200">{fmtPesos(valor)}</span>
      </div>
      <div className="h-2 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
        <div className="h-full rounded-full transition-all duration-700"
          style={{ width: `${pct}%`, backgroundColor: color }} />
      </div>
    </div>
  )
}

function FormCalculadora({ valores, onChange }) {
  const set = (k) => (e) => onChange({ ...valores, [k]: parseFloat(e.target.value) || 0 })
  const CUOTAS = [1, 3, 6, 9, 12, 18, 24, 36, 48]

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <div className="flex flex-col gap-1">
        <label className="text-xs font-medium text-zinc-500 dark:text-zinc-400">💰 Precio de contado ($)</label>
        <input type="number" value={valores.precioContado || ''}
          onChange={set('precioContado')} placeholder="Ej: 500000"
          className="w-full bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700
            rounded-xl px-3 py-2.5 text-sm text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[var(--mango)]/40" />
      </div>
      <div className="flex flex-col gap-1">
        <label className="text-xs font-medium text-zinc-500 dark:text-zinc-400">🏷️ Descuento contado (%)</label>
        <input type="number" value={valores.descuentoContado || ''}
          onChange={set('descuentoContado')} placeholder="Ej: 10" min="0" max="50" step="0.5"
          className="w-full bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700
            rounded-xl px-3 py-2.5 text-sm text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[var(--mango)]/40" />
      </div>
      <div className="flex flex-col gap-1">
        <label className="text-xs font-medium text-zinc-500 dark:text-zinc-400">🗓️ Cantidad de cuotas</label>
        <div className="grid grid-cols-5 gap-1">
          {CUOTAS.map(n => (
            <button key={n} type="button" onClick={() => onChange({ ...valores, cuotas: n })}
              className={`py-2 rounded-xl text-xs font-bold border-2 transition-all ${
                valores.cuotas === n
                  ? 'border-[var(--mango)] bg-[var(--mango)]/10 text-[var(--mango-dark)]'
                  : 'border-zinc-100 dark:border-zinc-800 text-zinc-500 hover:border-zinc-300'}`}>
              {n}x
            </button>
          ))}
        </div>
      </div>
      <div className="flex flex-col gap-1">
        <label className="text-xs font-medium text-zinc-500 dark:text-zinc-400">🏦 TEA del banco (%)</label>
        <input type="number" value={valores.teaAnual || ''}
          onChange={set('teaAnual')} placeholder="Ej: 120 (0 para sin interés)" min="0"
          className="w-full bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700
            rounded-xl px-3 py-2.5 text-sm text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[var(--mango)]/40" />
      </div>
      <div className="flex flex-col gap-1 sm:col-span-2">
        <label className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
          📈 Inflación mensual estimada: <span className="font-bold text-zinc-700 dark:text-zinc-200">{valores.inflacionMensual}%</span>
        </label>
        <input type="range" min="2" max="20" step="0.5" value={valores.inflacionMensual}
          onChange={set('inflacionMensual')} className="accent-amber-400 w-full" />
        <div className="flex justify-between text-[10px] text-zinc-400">
          <span>2% (baja)</span><span>10% (moderada)</span><span>20% (alta)</span>
        </div>
      </div>
    </div>
  )
}

function DesgloseCuotas({ detalle }) {
  const [expandido, setExpandido] = useState(false)
  if (!detalle?.length) return null
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
                <td className="py-2 text-right font-medium text-zinc-800 dark:text-zinc-200">{fmtPesos(row.cuota)}</td>
                <td className="py-2 text-right font-medium text-amber-600 dark:text-amber-400">{fmtPesos(row.vpCuota)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {detalle.length > 4 && (
        <button onClick={() => setExpandido(e => !e)}
          className="w-full text-center text-xs font-medium text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 mt-3 pt-3 border-t border-zinc-100 dark:border-zinc-800 transition-colors">
          {expandido ? 'Ver menos ▲' : `Ver las ${detalle.length - 4} cuotas restantes ▼`}
        </button>
      )}
    </Card>
  )
}

// ─── Página principal con tabs ────────────────────────────────
export function CalculadoraPage() {
  const [tab, setTab] = useState('cuotas')
  const [valores, setValores] = useState({
    precioContado: 500000, descuentoContado: 10, cuotas: 12,
    teaAnual: 120, inflacionMensual: 5,
  })

  const resultado = useMemo(() => {
    if (!valores.precioContado || valores.precioContado <= 0) return null
    try { return calcular(valores) } catch { return null }
  }, [valores])

  const maximo = resultado
    ? Math.max(resultado.precioConDescuento, resultado.totalACobrar, resultado.totalVP)
    : 0

  return (
    <div className="animate-in fade-in duration-500">
      <PageWrapper>
        <PageHeader titulo="🧮 Calculadoras" subtitulo="Herramientas para decidir mejor" />

        {/* Tabs */}
        <div className="flex bg-zinc-100 dark:bg-zinc-800 rounded-xl p-1 mb-6">
          <button onClick={() => setTab('cuotas')}
            className={`flex-1 py-2 rounded-lg text-xs font-semibold transition-colors ${
              tab === 'cuotas'
                ? 'bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white shadow-sm'
                : 'text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'}`}>
            💳 Cuotas
          </button>
          <button onClick={() => setTab('fondo')}
            className={`flex-1 py-2 rounded-lg text-xs font-semibold transition-colors ${
              tab === 'fondo'
                ? 'bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white shadow-sm'
                : 'text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'}`}>
            🛡️ Emergencia
          </button>
          <button onClick={() => setTab('division')}
            className={`flex-1 py-2 rounded-lg text-xs font-semibold transition-colors ${
              tab === 'division'
                ? 'bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white shadow-sm'
                : 'text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'}`}>
            👥 División
          </button>
        </div>

        {tab === 'fondo' && <CalculadoraFondoEmergencia />}

        {/* ── DIVISIÓN DE CUENTA ── */}
        {tab === 'division' && (
          <div className="flex flex-col gap-4">
            <div className="bg-blue-50/60 dark:bg-blue-900/10 rounded-2xl px-4 py-3 border border-blue-200/60 dark:border-blue-800/30">
              <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                👥 Dividí gastos de manera justa. Podés excluir personas, marcar quién pagó y ver cuánto debe cada uno.
              </p>
            </div>
            <Card>
              <CalculadoraDivision />
            </Card>
          </div>
        )}

        {tab === 'cuotas' && (
          <>
            <div className="mb-5 bg-blue-50/60 dark:bg-blue-900/10 rounded-2xl px-4 py-3 border border-blue-200/60 dark:border-blue-800/30">
              <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                🇦🇷 En Argentina, la inflación cambia la ecuación. Esta calculadora mide el <b>costo real</b> de financiarte en cuotas.
              </p>
            </div>

            <Card className="mb-5">
              <h3 className="text-sm font-bold text-zinc-800 dark:text-zinc-100 mb-4">⚙️ Parámetros</h3>
              <FormCalculadora valores={valores} onChange={setValores} />
            </Card>

            {resultado && valores.precioContado > 0 && (
              <>
                <div className={`mb-5 rounded-2xl px-5 py-4 border-2 ${
                  resultado.conveneCuotas
                    ? 'bg-emerald-50 dark:bg-emerald-900/15 border-emerald-300 dark:border-emerald-700/50'
                    : 'bg-amber-50 dark:bg-amber-900/15 border-amber-300 dark:border-amber-700/50'}`}>
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">{resultado.conveneCuotas ? '✅' : '🏷️'}</span>
                    <div>
                      <p className={`text-base font-black leading-tight ${
                        resultado.conveneCuotas
                          ? 'text-emerald-800 dark:text-emerald-300'
                          : 'text-amber-800 dark:text-amber-300'}`}>
                        {resultado.conveneCuotas ? '¡Las cuotas te convienen!' : 'El pago en efectivo te conviene más.'}
                      </p>
                      <p className={`text-xs mt-0.5 ${resultado.conveneCuotas ? 'text-emerald-700 dark:text-emerald-400' : 'text-amber-700 dark:text-amber-400'}`}>
                        {resultado.conveneCuotas
                          ? `Valor real de cuotas (${fmtPesos(resultado.totalVP)}) < contado (${fmtPesos(resultado.precioConDescuento)})`
                          : `Contado (${fmtPesos(resultado.precioConDescuento)}) < valor real de cuotas (${fmtPesos(resultado.totalVP)})`}
                      </p>
                    </div>
                  </div>
                </div>

                <Card className="mb-5">
                  <h3 className="text-sm font-bold text-zinc-800 dark:text-zinc-100 mb-4">📊 Comparación</h3>
                  <div className="flex flex-col gap-4">
                    <BarraComparacion label={`Contado con ${valores.descuentoContado}% desc.`} valor={resultado.precioConDescuento} maximo={maximo} color="#10B981" emoji="💵" />
                    <BarraComparacion label={`Total en ${valores.cuotas} cuotas`} valor={resultado.totalACobrar} maximo={maximo} color="#EF4444" emoji="💳" />
                    <BarraComparacion label="Valor real (ajustado por inflación)" valor={resultado.totalVP} maximo={maximo} color="#F59E0B" emoji="📉" />
                  </div>
                </Card>

                <Card className="mb-5">
                  <h3 className="text-sm font-bold text-zinc-800 dark:text-zinc-100 mb-4">🔢 Resumen</h3>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { label: 'Cuota mensual', valor: fmtPesos(resultado.cuotaMensual), color: 'text-zinc-800 dark:text-zinc-100' },
                      { label: 'Total a pagar', valor: fmtPesos(resultado.totalACobrar), color: 'text-red-600 dark:text-red-400' },
                      { label: 'Interés total', valor: fmtPesos(resultado.interesTotalPesos), color: 'text-red-500 dark:text-red-400' },
                      { label: 'Tasa mensual efectiva', valor: fmtPct(resultado.tasaMensual), color: 'text-zinc-600 dark:text-zinc-300' },
                      { label: 'Valor real de cuotas', valor: fmtPesos(resultado.totalVP), color: 'text-amber-600 dark:text-amber-400' },
                      { label: 'Ahorro/costo real', valor: fmtPesos(Math.abs(resultado.ahorroRealVsContado)), color: resultado.ahorroRealVsContado > 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400' },
                    ].map(item => (
                      <div key={item.label} className="bg-zinc-50 dark:bg-zinc-800/50 rounded-xl p-3 border border-zinc-100 dark:border-zinc-800">
                        <p className="text-[10px] text-zinc-400 uppercase tracking-wider font-medium mb-0.5 leading-tight">{item.label}</p>
                        <p className={`text-base font-black leading-tight ${item.color}`}>{item.valor}</p>
                      </div>
                    ))}
                  </div>
                </Card>

                <DesgloseCuotas detalle={resultado.detallesCuotas} />
              </>
            )}

            {!resultado && (
              <div className="flex items-center justify-center h-32 text-zinc-400 text-sm text-center px-4">
                Completá el precio y las condiciones de financiación para ver el análisis.
              </div>
            )}

            <p className="text-[10px] text-zinc-400 text-center mt-4 pb-4">
              Cálculo orientativo. Los resultados reales pueden variar según el CFT del banco.
            </p>
          </>
        )}
      </PageWrapper>
    </div>
  )
}