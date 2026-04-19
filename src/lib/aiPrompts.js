// src/lib/aiPrompts.js
// Prompts de sistema y constructores de contexto para cada sección de la app.
// Centraliza toda la "inteligencia" de ManguitoAI en un solo lugar.

// ── Instrucción base compartida ───────────────────────────────
const BASE = `Sos ManguitoAI, el asistente financiero de Manguito para usuarios argentinos.
Analizás datos reales del usuario y generás insights CONCRETOS y ACCIONABLES.
Contexto: Argentina, inflación alta, dólar blue, economía informal.
Responde en español rioplatense (vos, ustedes).
Respondé SOLO con un objeto JSON válido, sin markdown, sin backticks, sin texto extra.`

// ─────────────────────────────────────────────────────────────
// 1. DIAGNÓSTICO FINANCIERO (Dashboard / Movimientos)
// ─────────────────────────────────────────────────────────────
export const PROMPT_DIAGNOSTICO = `${BASE}

Generá un diagnóstico financiero con este formato JSON exacto:
{
  "salud": "excellent" | "good" | "warning" | "critical",
  "puntaje": número del 0 al 100,
  "resumen": "Una oración directa que resuma la situación",
  "insights": [
    {
      "tipo": "positivo" | "negativo" | "consejo" | "accion" | "alerta",
      "titulo": "Título corto (máx 40 chars)",
      "texto": "Insight concreto y accionable (máx 120 chars)"
    }
  ],
  "consejo_principal": "El consejo más importante del mes (máx 150 chars)"
}
Generá 3-4 insights específicos con los datos reales.`

export function buildDiagnosticoPrompt({ balance, movimientos = [], presupuestos = [], metas = [], moneda = 'ARS' }) {
  const ingresos = Number(balance?.total_ingresos ?? 0)
  const gastos   = Number(balance?.total_gastos ?? 0)
  const saldo    = ingresos - gastos
  const tasaAhorro = ingresos > 0 ? ((saldo / ingresos) * 100).toFixed(1) : 0

  const gastosXCat = movimientos
    .filter(m => m.tipo === 'gasto')
    .reduce((acc, m) => {
      const cat = m.categorias?.nombre || 'Sin categoría'
      acc[cat] = (acc[cat] || 0) + Number(m.monto)
      return acc
    }, {})

  const topGastos = Object.entries(gastosXCat)
    .sort(([,a],[,b]) => b - a)
    .slice(0, 4)
    .map(([cat, monto]) => `${cat}: $${Math.round(monto).toLocaleString('es-AR')}`)
    .join(' | ')

  const presupResumen = presupuestos
    .slice(0, 4)
    .map(p => `${p.categoria_nombre}: ${p.porcentaje?.toFixed(0)}% de $${Math.round(p.limite_monto).toLocaleString('es-AR')}`)
    .join(' | ')

  const metasResumen = metas
    .filter(m => m.estado === 'activa')
    .slice(0, 3)
    .map(m => `${m.nombre}: ${((m.monto_actual/m.monto_objetivo)*100).toFixed(0)}%`)
    .join(' | ')

  return `Analizá mis finanzas del mes:
- Ingresos: $${Math.round(ingresos).toLocaleString('es-AR')} ARS
- Gastos: $${Math.round(gastos).toLocaleString('es-AR')} ARS
- Saldo: $${Math.round(saldo).toLocaleString('es-AR')} ARS
- Tasa de ahorro: ${tasaAhorro}%
- Top gastos: ${topGastos || 'Sin datos'}
- Presupuestos: ${presupResumen || 'Sin presupuestos'}
- Metas activas: ${metasResumen || 'Sin metas'}
- Cantidad movimientos: ${movimientos.length}
Generá un diagnóstico financiero honesto y accionable.`
}

// ─────────────────────────────────────────────────────────────
// 2. ANÁLISIS DE INVERSIONES
// ─────────────────────────────────────────────────────────────
export const PROMPT_INVERSIONES = `${BASE}

Analizás una cartera de inversiones argentina y generás recomendaciones.
Tené en cuenta: CEDEARs, acciones locales, cripto, FCI, contexto macro argentino.
Formato JSON exacto:
{
  "salud": "excellent" | "good" | "warning" | "critical",
  "puntaje": número del 0 al 100,
  "resumen": "Una oración sobre el estado general de la cartera",
  "insights": [
    {
      "tipo": "positivo" | "negativo" | "consejo" | "inversion" | "alerta",
      "titulo": "Título corto",
      "texto": "Análisis concreto (máx 130 chars)"
    }
  ],
  "consejo_principal": "La acción más importante a tomar con la cartera (máx 150 chars)"
}
Generá 3-4 insights específicos sobre la cartera real.`

export function buildInversionesPrompt({ portfolio, inversiones = [], dolarRate }) {
  if (!portfolio || inversiones.length === 0) {
    return 'No tengo inversiones cargadas. ¿Qué me recomendás para empezar a invertir en Argentina con inflación alta?'
  }

  const tipos = [...new Set(inversiones.map(i => i.tipo))]
  const detalles = inversiones.slice(0, 6).map(inv => {
    const detalle = portfolio.detalles?.find(d => d.id === inv.id)
    const ganPct  = detalle?.gananciaPct != null ? `${detalle.gananciaPct.toFixed(1)}%` : 'sin precio'
    return `${inv.nombre} (${inv.tipo}): ${inv.cantidad} uds, compré a ${inv.moneda_compra} ${inv.precio_compra}, resultado: ${ganPct}`
  }).join(' | ')

  return `Analizá mi cartera de inversiones:
- Valor total: U$D ${portfolio.totalValorUSD?.toFixed(0) ?? 0} (aprox. $${Math.round(portfolio.totalValorARS ?? 0).toLocaleString('es-AR')} ARS)
- Invertido: $${Math.round(portfolio.totalCostoARS ?? 0).toLocaleString('es-AR')} ARS
- Ganancia/Pérdida: ${portfolio.gananciaTotalPct?.toFixed(1) ?? 0}%
- Tipos de activos: ${tipos.join(', ')}
- Dólar blue: $${dolarRate?.venta?.toLocaleString('es-AR') ?? 'N/D'}
- Posiciones: ${detalles}
Generá un análisis de la cartera con recomendaciones concretas.`
}

// ─────────────────────────────────────────────────────────────
// 3. OPTIMIZACIÓN DE PRESUPUESTOS
// ─────────────────────────────────────────────────────────────
export const PROMPT_PRESUPUESTOS = `${BASE}

Analizás los presupuestos del usuario y sugerís optimizaciones.
Tené en cuenta la inflación argentina y el contexto local.
Formato JSON exacto:
{
  "salud": "excellent" | "good" | "warning" | "critical",
  "puntaje": número del 0 al 100,
  "resumen": "Estado general de los presupuestos en una oración",
  "insights": [
    {
      "tipo": "positivo" | "negativo" | "consejo" | "accion" | "alerta",
      "titulo": "Título corto",
      "texto": "Insight específico sobre algún presupuesto (máx 130 chars)"
    }
  ],
  "consejo_principal": "Qué cambiar o ajustar en los presupuestos (máx 150 chars)"
}
Sé específico: mencioná categorías y montos reales.`

export function buildPresupuestosPrompt({ presupuestos, balance }) {
  if (!presupuestos.length) {
    return 'No tengo presupuestos configurados. ¿Cómo me recomendás organizarlos con mis ingresos y gastos típicos?'
  }

  const ingresos = Number(balance?.total_ingresos ?? 0)

  const resumen = presupuestos.map(p => {
    const estado = p.porcentaje > 100 ? 'EXCEDIDO' : p.porcentaje >= p.alerta_pct ? 'EN ALERTA' : 'OK'
    return `${p.categoria_nombre}: ${estado} - gastado $${Math.round(p.gastado).toLocaleString('es-AR')} de $${Math.round(p.limite_monto).toLocaleString('es-AR')} (${p.porcentaje?.toFixed(0)}%)`
  }).join(' | ')

  const excedidos = presupuestos.filter(p => p.porcentaje > 100).length
  const alertas   = presupuestos.filter(p => p.porcentaje >= p.alerta_pct && p.porcentaje <= 100).length

  return `Analizá mis presupuestos del mes:
- Ingresos totales: $${Math.round(ingresos).toLocaleString('es-AR')} ARS
- Presupuestos excedidos: ${excedidos}
- En alerta: ${alertas}
- Detalle por categoría: ${resumen}
Sugerí cómo optimizar mis límites de gasto.`
}

// ─────────────────────────────────────────────────────────────
// 4. ESTRATEGIA DE METAS DE AHORRO
// ─────────────────────────────────────────────────────────────
export const PROMPT_METAS = `${BASE}

Analizás las metas de ahorro y sugerís estrategias para alcanzarlas más rápido.
Considerá el contexto argentino: inflación, dólar, devaluación del peso.
Formato JSON exacto:
{
  "salud": "excellent" | "good" | "warning" | "critical",
  "puntaje": número del 0 al 100,
  "resumen": "Estado general de las metas en una oración",
  "insights": [
    {
      "tipo": "positivo" | "negativo" | "consejo" | "accion" | "ahorro",
      "titulo": "Título corto",
      "texto": "Insight específico sobre alguna meta (máx 130 chars)"
    }
  ],
  "consejo_principal": "La estrategia más importante para alcanzar las metas (máx 150 chars)"
}
Sé específico con nombres de metas y montos reales.`

export function buildMetasPrompt({ metas, balance }) {
  const activas    = metas.filter(m => m.estado === 'activa')
  const completadas = metas.filter(m => m.estado === 'completada')
  const ingresos   = Number(balance?.total_ingresos ?? 0)
  const gastos     = Number(balance?.total_gastos ?? 0)
  const saldoMes   = ingresos - gastos

  if (!activas.length) {
    return 'No tengo metas de ahorro activas. ¿Cuáles me recomendás crear con la situación económica argentina?'
  }

  const resumen = activas.map(m => {
    const pct = ((m.monto_actual / m.monto_objetivo) * 100).toFixed(0)
    const falta = m.monto_objetivo - m.monto_actual
    const mesesRestantes = saldoMes > 0 ? Math.ceil(falta / (saldoMes * 0.2)) : null
    const deadline = m.fecha_limite
      ? `vence ${new Date(m.fecha_limite + 'T00:00:00').toLocaleDateString('es-AR', { month: 'short', year: 'numeric' })}`
      : 'sin fecha'
    return `${m.nombre}: ${pct}% alcanzado ($${Math.round(m.monto_actual).toLocaleString('es-AR')} de $${Math.round(m.monto_objetivo).toLocaleString('es-AR')}, ${deadline}${mesesRestantes ? `, ~${mesesRestantes} meses al 20% del saldo` : ''})`
  }).join(' | ')

  return `Analizá mis metas de ahorro:
- Metas activas: ${activas.length}
- Metas completadas: ${completadas.length}
- Saldo disponible este mes: $${Math.round(saldoMes).toLocaleString('es-AR')} ARS
- Detalle: ${resumen}
Sugerí estrategias concretas para alcanzarlas más rápido.`
}

// ─────────────────────────────────────────────────────────────
// 5. ANÁLISIS DE GASTOS / PATRONES
// ─────────────────────────────────────────────────────────────
export const PROMPT_GASTOS = `${BASE}

Analizás patrones de gasto del usuario y detectás oportunidades de ahorro.
Tené en cuenta el contexto argentino: precios, inflación, hábitos locales.
Formato JSON exacto:
{
  "salud": "excellent" | "good" | "warning" | "critical",
  "puntaje": número del 0 al 100,
  "resumen": "Descripción del patrón de gasto principal",
  "insights": [
    {
      "tipo": "positivo" | "negativo" | "consejo" | "accion" | "alerta",
      "titulo": "Título corto",
      "texto": "Insight sobre el patrón o hábito detectado (máx 130 chars)"
    }
  ],
  "consejo_principal": "Dónde cortar o reasignar gastos para mejorar (máx 150 chars)"
}
Detectá patrones concretos con las categorías y montos reales.`

export function buildGastosPrompt({ movimientos = [], balance, periodo = 'este mes' }) {
  if (!movimientos.length) {
    return `No tengo movimientos registrados ${periodo}. ¿Cómo debería organizar mis gastos?`
  }

  const gastos = movimientos.filter(m => m.tipo === 'gasto')
  const ingresos = movimientos.filter(m => m.tipo === 'ingreso')

  const gastosXCat = gastos.reduce((acc, m) => {
    const cat = m.categorias?.nombre || 'Sin categoría'
    acc[cat] = (acc[cat] || 0) + Number(m.monto)
    return acc
  }, {})

  const top5 = Object.entries(gastosXCat)
    .sort(([,a],[,b]) => b - a)
    .slice(0, 5)
    .map(([cat, monto]) => `${cat}: $${Math.round(monto).toLocaleString('es-AR')}`)
    .join(' | ')

  const totalGastos  = gastos.reduce((s, m) => s + Number(m.monto), 0)
  const totalIngresos = ingresos.reduce((s, m) => s + Number(m.monto), 0)
  const cantCategorias = Object.keys(gastosXCat).length

  // Detectar gastos recurrentes (mismo nombre/categoría frecuente)
  const frecuencias = gastos.reduce((acc, m) => {
    const key = m.descripcion || m.categorias?.nombre || ''
    acc[key] = (acc[key] || 0) + 1
    return acc
  }, {})
  const frecuentes = Object.entries(frecuencias)
    .filter(([, n]) => n >= 2)
    .sort(([,a],[,b]) => b - a)
    .slice(0, 3)
    .map(([desc, n]) => `"${desc}" (${n}x)`)
    .join(', ')

  return `Analizá mis patrones de gasto de ${periodo}:
- Total gastado: $${Math.round(totalGastos).toLocaleString('es-AR')} ARS
- Total ingresos: $${Math.round(totalIngresos).toLocaleString('es-AR')} ARS
- Cantidad de movimientos: ${gastos.length} gastos, ${ingresos.length} ingresos
- Categorías usadas: ${cantCategorias}
- Top gastos por categoría: ${top5}
- Gastos frecuentes (posibles suscripciones/hábitos): ${frecuentes || 'ninguno detectado'}
Identificá patrones y oportunidades de ahorro concretas.`
}