/**
 * src/lib/monotributo.js
 * ─────────────────────────────────────────────────────────────
 * Módulo de Trazabilidad Tributaria — Monotributo Argentino
 *
 * Dos responsabilidades:
 *   1. calcularAlertaMonotributo() → detecta proximidad al límite anual
 *   2. calcularReservaFiscal()     → separa el 30% de cada ingreso
 *
 * ⚠️  Los topes se actualizan por Resolución General AFIP cada trimestre.
 *     Última actualización de este archivo: Julio 2025 (RG AFIP 5559/2025)
 *     Revisá: https://www.afip.gob.ar/monotributo
 * ─────────────────────────────────────────────────────────────
 */

// ── Tabla de categorías vigentes ─────────────────────────────
// Fuente: RG AFIP — Ingresos brutos anuales máximos (ARS)
// Dos actividades: 'bienes' (venta de cosas muebles) y 'servicios'
export const CATEGORIAS_MONOTRIBUTO = {
  // ── Venta de bienes muebles ──────────────────────────────────
  bienes: [
    { categoria: 'A', limiteAnual: 7_003_990.53,  cuotaMensual: 5_544.36  },
    { categoria: 'B', limiteAnual: 10_505_985.80, cuotaMensual: 6_205.63  },
    { categoria: 'C', limiteAnual: 14_703_979.12, cuotaMensual: 8_090.47  },
    { categoria: 'D', limiteAnual: 18_901_972.43, cuotaMensual: 9_887.07  },
    { categoria: 'E', limiteAnual: 23_099_965.75, cuotaMensual: 12_869.66 },
    { categoria: 'F', limiteAnual: 27_297_959.07, cuotaMensual: 15_510.09 },
    { categoria: 'G', limiteAnual: 31_495_952.38, cuotaMensual: 19_029.42 },
    { categoria: 'H', limiteAnual: 36_770_950.30, cuotaMensual: 32_390.91 },
  ],

  // ── Locaciones y/o prestaciones de servicios ────────────────
  servicios: [
    { categoria: 'A', limiteAnual: 7_003_990.53,  cuotaMensual: 5_544.36  },
    { categoria: 'B', limiteAnual: 10_505_985.80, cuotaMensual: 6_205.63  },
    { categoria: 'C', limiteAnual: 14_703_979.12, cuotaMensual: 8_090.47  },
    { categoria: 'D', limiteAnual: 18_901_972.43, cuotaMensual: 9_887.07  },
    { categoria: 'E', limiteAnual: 23_099_965.75, cuotaMensual: 12_869.66 },
    { categoria: 'F', limiteAnual: 27_297_959.07, cuotaMensual: 15_510.09 },
    { categoria: 'G', limiteAnual: 31_495_952.38, cuotaMensual: 19_029.42 },
  ],
}

// ── Umbrales de alerta ────────────────────────────────────────
export const UMBRALES = {
  SEGURO:    0.70,   // < 70% → verde, todo en orden
  ATENCION:  0.80,   // 70-80% → amarillo, empezá a prestar atención
  PELIGRO:   0.90,   // 80-90% → naranja, reconsiderá gastos / adelantá facturación
  CRITICO:   1.00,   // > 90% → rojo, peligro inminente de exceder la categoría
}

export const PORCENTAJE_RESERVA_DEFAULT = 0.30  // 30% de cada ingreso

// ─────────────────────────────────────────────────────────────
//  FUNCIÓN PRINCIPAL 1 — ALERTA DE TOPE ANUAL
// ─────────────────────────────────────────────────────────────

/**
 * Analiza si el usuario está cerca del límite de facturación anual.
 *
 * @param {Object}   params
 * @param {number[]} params.ingresosMensuales
 *   Array de ingresos del año en curso, índice 0 = Enero.
 *   Puede tener entre 1 y 12 elementos (lo que va del año).
 *   Ejemplo: [150_000, 200_000, 180_000]  → 3 meses registrados
 *
 * @param {string}   params.categoria
 *   Categoría actual del monotributista: 'A' a 'H'.
 *
 * @param {'bienes'|'servicios'} params.tipoActividad
 *   Tipo de actividad principal.
 *
 * @param {number}   [params.mesActual]
 *   Mes actual (1-12). Si se omite, usa el mes real del sistema.
 *
 * @returns {Object} resultado con todos los datos para renderizar la UI
 */
export function calcularAlertaMonotributo({
  ingresosMensuales = [],
  categoria,
  tipoActividad = 'servicios',
  mesActual = new Date().getMonth() + 1,
}) {
  // ── 1. Validaciones ─────────────────────────────────────────
  if (!ingresosMensuales.length) {
    return _resultadoVacio(categoria, tipoActividad)
  }

  const categoriaUpper = categoria?.toUpperCase()
  const tabla          = CATEGORIAS_MONOTRIBUTO[tipoActividad]

  if (!tabla) {
    throw new Error(`tipoActividad inválido: "${tipoActividad}". Usá "bienes" o "servicios".`)
  }

  const datosCat = tabla.find(c => c.categoria === categoriaUpper)

  if (!datosCat) {
    throw new Error(
      `Categoría "${categoriaUpper}" no válida para "${tipoActividad}". ` +
      `Opciones: ${tabla.map(c => c.categoria).join(', ')}.`
    )
  }

  // ── 2. Suma de ingresos acumulados ──────────────────────────
  const ingresoAcumulado = ingresosMensuales
    .map(m => Math.max(0, Number(m) || 0))   // sanitize: sin negativos ni NaN
    .reduce((sum, m) => sum + m, 0)

  const { limiteAnual, cuotaMensual } = datosCat

  // ── 3. Proporción usada ──────────────────────────────────────
  const proporcionUsada = ingresoAcumulado / limiteAnual

  // ── 4. Proyección del cierre anual ──────────────────────────
  // Tomamos el promedio de los meses registrados y proyectamos al año completo.
  // Si ya pasaron 12 meses, usamos el total real.
  const mesesRegistrados = Math.min(ingresosMensuales.length, 12)
  const promedioMensual  = ingresoAcumulado / mesesRegistrados
  const mesesRestantes   = Math.max(0, 12 - mesActual)
  const proyeccionAnual  = ingresoAcumulado + promedioMensual * mesesRestantes

  // ── 5. Estado de alerta ──────────────────────────────────────
  const estado = _determinarEstado(proporcionUsada, proyeccionAnual, limiteAnual)

  // ── 6. ¿Conviene recategorizar? ──────────────────────────────
  const recategorizacion = _sugerirRecategorizacion(
    proyeccionAnual,
    tabla,
    categoriaUpper,
  )

  // ── 7. Margen disponible ─────────────────────────────────────
  const margenRestante       = Math.max(0, limiteAnual - ingresoAcumulado)
  const margenMensualRestante = mesesRestantes > 0
    ? margenRestante / mesesRestantes
    : 0

  return {
    // ── Datos de entrada normalizados
    categoria:     categoriaUpper,
    tipoActividad,

    // ── Límites
    limiteAnual,
    cuotaMensual,

    // ── Acumulado real
    ingresoAcumulado,
    mesesRegistrados,
    promedioMensual: Math.round(promedioMensual),

    // ── Proyección
    proyeccionAnual:  Math.round(proyeccionAnual),
    mesesRestantes,

    // ── Margen disponible
    margenRestante:        Math.round(margenRestante),
    margenMensualRestante: Math.round(margenMensualRestante),

    // ── Porcentaje usado (para barra de progreso)
    porcentajeUsado:     parseFloat((proporcionUsada * 100).toFixed(1)),
    porcentajeProyectado: parseFloat(Math.min((proyeccionAnual / limiteAnual) * 100, 150).toFixed(1)),

    // ── Estado semafórico
    ...estado,

    // ── Recategorización sugerida
    recategorizacion,

    // ── Mensaje de acción
    mensaje: _generarMensaje(estado.nivel, margenRestante, mesesRestantes, recategorizacion),

    // ── Timestamp del cálculo
    calculadoEn: new Date().toISOString(),
  }
}


// ─────────────────────────────────────────────────────────────
//  FUNCIÓN PRINCIPAL 2 — RESERVA FISCAL AUTOMÁTICA
// ─────────────────────────────────────────────────────────────

/**
 * Calcula la reserva fiscal a separar de un ingreso puntual.
 *
 * La regla: al registrar un ingreso, separa automáticamente el 30%
 * hacia una meta de reserva fiscal para cubrir:
 *   - Cuota del Monotributo (componente impositivo + obra social + jubilación)
 *   - Eventual recategorización con cuota más alta
 *   - Buffer para pago de Ganancias si excede el régimen simplificado
 *
 * @param {Object}  params
 * @param {number}  params.ingresoNuevo     Monto del nuevo ingreso registrado (ARS)
 * @param {number}  [params.porcentaje]     Porcentaje a reservar (default: 0.30 = 30%)
 * @param {number}  [params.reservaActual]  Saldo actual de la meta de reserva fiscal
 * @param {string}  [params.categoria]      Categoría del monotributista (para referencia)
 * @param {Object}  [params.datosMeta]      Meta de reserva en Supabase (para cálculo de progreso)
 *
 * @returns {Object} desglose del movimiento de reserva
 */
export function calcularReservaFiscal({
  ingresoNuevo,
  porcentaje   = PORCENTAJE_RESERVA_DEFAULT,
  reservaActual = 0,
  categoria    = null,
  datosMeta    = null,
}) {
  const ingreso = Math.max(0, Number(ingresoNuevo) || 0)

  if (ingreso <= 0) {
    return {
      ingresoNuevo:   0,
      montoAReservar: 0,
      montoLibre:     0,
      porcentaje:     porcentaje,
      reservaActual,
      reservaProyectada: reservaActual,
      descripcion: 'Sin ingreso para procesar.',
    }
  }

  // ── Cálculo core: 30% a reserva, 70% libre ──────────────────
  const montoAReservar = parseFloat((ingreso * porcentaje).toFixed(2))
  const montoLibre     = parseFloat((ingreso * (1 - porcentaje)).toFixed(2))
  const reservaProyectada = reservaActual + montoAReservar

  // ── Desglose orientativo del 30% ────────────────────────────
  // Ayuda al usuario a entender para qué sirve cada porción.
  const desglose = _calcularDesgloseReserva(montoAReservar, categoria)

  // ── Progreso de la meta de reserva ──────────────────────────
  const progreso = datosMeta
    ? _calcularProgresoMeta(reservaProyectada, datosMeta)
    : null

  return {
    // ── Montos
    ingresoNuevo:      ingreso,
    montoAReservar,
    montoLibre,

    // ── Porcentaje aplicado
    porcentaje,
    porcentajeDisplay: `${(porcentaje * 100).toFixed(0)}%`,

    // ── Estado de la reserva
    reservaActual,
    reservaProyectada: parseFloat(reservaProyectada.toFixed(2)),
    deltaReserva:      montoAReservar,

    // ── Desglose orientativo (no es obligatorio, es guía)
    desglose,

    // ── Progreso de la meta (si se pasó datosMeta)
    progreso,

    // ── Descripción para el movimiento en Supabase
    descripcionMovimiento: `Reserva fiscal ${(porcentaje * 100).toFixed(0)}% — Monotributo${categoria ? ` Cat. ${categoria.toUpperCase()}` : ''}`,

    // ── Datos para crear el movimiento y el aporte a la meta
    movimientoReserva: {
      tipo:        'gasto',    // sale del balance corriente
      monto:       montoAReservar,
      descripcion: `Reserva fiscal — ${(porcentaje * 100).toFixed(0)}% del ingreso`,
      // El componente que consuma esto puede asignar la categoria_id correcta
    },
  }
}


// ─────────────────────────────────────────────────────────────
//  FUNCIÓN COMBINADA — Un solo punto de entrada
// ─────────────────────────────────────────────────────────────

/**
 * Procesa un nuevo ingreso: calcula alerta de tope Y reserva fiscal
 * en una sola llamada. Ideal para llamar al crear un movimiento de ingreso.
 *
 * @param {Object} params
 * @param {number}   params.ingresoNuevo         Nuevo ingreso a registrar
 * @param {number[]} params.ingresosMensualesYTD  Ingresos del año hasta ahora
 * @param {string}   params.categoria             Categoría Monotributo ('A'-'H')
 * @param {'bienes'|'servicios'} params.tipoActividad
 * @param {number}   [params.reservaActual]       Saldo actual de la reserva
 * @param {number}   [params.porcentajeReserva]   Default 0.30
 *
 * @returns {{ alerta, reserva }}
 */
export function procesarIngresoMonotributo({
  ingresoNuevo,
  ingresosMensualesYTD = [],
  categoria,
  tipoActividad = 'servicios',
  reservaActual = 0,
  porcentajeReserva = PORCENTAJE_RESERVA_DEFAULT,
}) {
  // Agregar el nuevo ingreso al array del mes actual antes de calcular
  const mesActual = new Date().getMonth() // 0-indexed
  const ingresosActualizados = [...ingresosMensualesYTD]

  // Si el mes actual ya tiene datos, sumamos al último; si no, agregamos nuevo
  if (ingresosActualizados.length <= mesActual) {
    ingresosActualizados.push(Number(ingresoNuevo))
  } else {
    ingresosActualizados[mesActual] =
      (ingresosActualizados[mesActual] || 0) + Number(ingresoNuevo)
  }

  const alerta = calcularAlertaMonotributo({
    ingresosMensuales: ingresosActualizados,
    categoria,
    tipoActividad,
    mesActual: mesActual + 1,
  })

  const reserva = calcularReservaFiscal({
    ingresoNuevo,
    porcentaje:   porcentajeReserva,
    reservaActual,
    categoria,
  })

  return { alerta, reserva }
}


// ─────────────────────────────────────────────────────────────
//  FUNCIÓN UTILITARIA — Detectar categoría por ingresos
// ─────────────────────────────────────────────────────────────

/**
 * Dada una proyección anual, sugiere qué categoría debería tener el usuario.
 * Útil para el onboarding o para la pantalla de configuración.
 *
 * @param {number} ingresoAnualProyectado
 * @param {'bienes'|'servicios'} tipoActividad
 * @returns {{ categoriaActual, categoriaCorrecta, debeRecategorizar }}
 */
export function detectarCategoriaCorrecta(ingresoAnualProyectado, tipoActividad = 'servicios') {
  const tabla = CATEGORIAS_MONOTRIBUTO[tipoActividad]
  if (!tabla) return null

  const categoriaCorrecta = tabla.find(
    c => ingresoAnualProyectado <= c.limiteAnual
  ) || null

  return {
    categoriaCorrecta:   categoriaCorrecta?.categoria ?? 'EXCEDE_MONOTRIBUTO',
    limiteCategoria:     categoriaCorrecta?.limiteAnual ?? null,
    excedeMontributo:    categoriaCorrecta === null,
    mensaje: categoriaCorrecta
      ? `Con ingresos proyectados de ${_fmt(ingresoAnualProyectado)}/año, correspondería la Categoría ${categoriaCorrecta.categoria}.`
      : `Los ingresos proyectados de ${_fmt(ingresoAnualProyectado)}/año superan el tope máximo del Monotributo. Considerá pasar a Responsable Inscripto.`,
  }
}


// ─────────────────────────────────────────────────────────────
//  HELPERS INTERNOS
// ─────────────────────────────────────────────────────────────

function _determinarEstado(proporcionUsada, proyeccionAnual, limiteAnual) {
  const proporcionProyectada = proyeccionAnual / limiteAnual

  if (proporcionUsada >= 1.0) {
    return { nivel: 'excedido', color: '#DC2626', emoji: '🚨' }
  }
  if (proporcionUsada >= UMBRALES.CRITICO * 0.9 || proporcionProyectada >= 1.0) {
    return { nivel: 'critico', color: '#EF4444', emoji: '🔴' }
  }
  if (proporcionUsada >= UMBRALES.PELIGRO || proporcionProyectada >= 0.90) {
    return { nivel: 'peligro', color: '#F97316', emoji: '🟠' }
  }
  if (proporcionUsada >= UMBRALES.ATENCION || proporcionProyectada >= 0.80) {
    return { nivel: 'atencion', color: '#F59E0B', emoji: '⚠️' }
  }
  return { nivel: 'seguro', color: '#10B981', emoji: '✅' }
}

function _sugerirRecategorizacion(proyeccionAnual, tabla, categoriaActual) {
  const catActualDatos = tabla.find(c => c.categoria === categoriaActual)
  if (!catActualDatos) return null

  // Si la proyección supera el límite actual, buscar la categoría siguiente
  if (proyeccionAnual > catActualDatos.limiteAnual) {
    const catSiguiente = tabla.find(c => proyeccionAnual <= c.limiteAnual)
    return catSiguiente
      ? {
          necesaria: true,
          categoriaDestino: catSiguiente.categoria,
          nuevaCuota: catSiguiente.cuotaMensual,
          nuevasCuotasText: `Categoría ${catSiguiente.categoria} — cuota $${catSiguiente.cuotaMensual.toLocaleString('es-AR', { maximumFractionDigits: 2 })} /mes`,
        }
      : {
          necesaria: true,
          categoriaDestino: 'RESP_INSCRIPTO',
          nuevaCuota: null,
          nuevasCuotasText: 'Superás el tope del Monotributo. Considerá pasarte a Responsable Inscripto.',
        }
  }

  return { necesaria: false }
}

function _calcularDesgloseReserva(montoTotal, categoria) {
  // Distribución orientativa del 30%:
  //   - 15% Cuota Monotributo (impuesto + componentes)
  //   - 10% Buffer recategorización / escalada
  //   - 5%  Imprevistos fiscales (multas, intereses, actualizaciones)
  return {
    cuotaMonotributo: parseFloat((montoTotal * 0.50).toFixed(2)),  // 50% del 30% = 15% del ingreso
    bufferRecategorizacion: parseFloat((montoTotal * 0.34).toFixed(2)), // 10% del ingreso
    imprevistosFiscales: parseFloat((montoTotal * 0.16).toFixed(2)),   //  5% del ingreso
  }
}

function _calcularProgresoMeta(reservaProyectada, datosMeta) {
  if (!datosMeta?.monto_objetivo) return null
  const pct = (reservaProyectada / datosMeta.monto_objetivo) * 100
  return {
    porcentaje:    parseFloat(pct.toFixed(1)),
    montoObjetivo: datosMeta.monto_objetivo,
    montoActual:   reservaProyectada,
    completa:      reservaProyectada >= datosMeta.monto_objetivo,
  }
}

function _generarMensaje(nivel, margenRestante, mesesRestantes, recategorizacion) {
  const margenFmt = _fmt(margenRestante)
  switch (nivel) {
    case 'seguro':
      return `Todo en orden. Te quedan ${margenFmt} de margen para el año.`
    case 'atencion':
      return mesesRestantes > 0
        ? `Atención: te quedan ${margenFmt} hasta el tope. Promediás ${_fmt(margenRestante / mesesRestantes)}/mes disponibles.`
        : `Cerrás el año con ${margenFmt} de margen.`
    case 'peligro':
      return `Peligro: quedan ${margenFmt}. Considerá distribuir facturación o adelantar gastos deducibles.`
    case 'critico':
      return recategorizacion?.necesaria
        ? `Crítico: quedan ${margenFmt}. Deberías recategorizarte a ${recategorizacion.categoriaDestino}.`
        : `Crítico: estás al límite del tope anual con ${margenFmt} de margen.`
    case 'excedido':
      return `Superaste el límite anual de tu categoría. Recategorizate en AFIP lo antes posible.`
    default:
      return ''
  }
}

function _resultadoVacio(categoria, tipoActividad) {
  return {
    categoria,
    tipoActividad,
    ingresoAcumulado:     0,
    mesesRegistrados:     0,
    promedioMensual:      0,
    proyeccionAnual:      0,
    mesesRestantes:       12 - new Date().getMonth(),
    margenRestante:       0,
    margenMensualRestante: 0,
    porcentajeUsado:      0,
    porcentajeProyectado: 0,
    nivel:   'sin_datos',
    color:   '#9CA3AF',
    emoji:   '📊',
    mensaje: 'Registrá ingresos para comenzar el seguimiento.',
    recategorizacion: null,
    calculadoEn: new Date().toISOString(),
  }
}

function _fmt(n) {
  return Number(n).toLocaleString('es-AR', {
    style: 'currency',
    currency: 'ARS',
    maximumFractionDigits: 0,
  })
}