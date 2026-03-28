/**
 * src/lib/exportar.js
 * Utilidades de exportación de datos financieros.
 * Exporta a CSV (abre perfecto en Excel) sin librerías externas.
 */

/**
 * Convierte un array de objetos a formato CSV.
 * Maneja comas y saltos de línea dentro de los valores.
 */
function toCSV(filas, columnas) {
  const encabezado = columnas.map(c => `"${c.label}"`).join(',')
  const datos = filas.map(fila =>
    columnas.map(c => {
      const val = c.get(fila) ?? ''
      return `"${String(val).replace(/"/g, '""')}"`
    }).join(',')
  )
  return [encabezado, ...datos].join('\n')
}

/**
 * Descarga un string como archivo.
 */
function descargarArchivo(contenido, nombreArchivo, tipo = 'text/csv;charset=utf-8;') {
  const BOM = '\uFEFF' // BOM para que Excel lea bien el UTF-8
  const blob = new Blob([BOM + contenido], { type: tipo })
  const url  = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href     = url
  link.download = nombreArchivo
  link.click()
  URL.revokeObjectURL(url)
}

/**
 * Exporta movimientos a CSV.
 * @param {Array} movimientos - Array de movimientos con categorias joinadas
 * @param {string} periodo - Etiqueta del período (ej: "Marzo 2025")
 */
export function exportarMovimientosCSV(movimientos, periodo = '') {
  const COLUMNAS = [
    { label: 'Fecha',       get: m => m.fecha },
    { label: 'Tipo',        get: m => m.tipo === 'ingreso' ? 'Ingreso' : 'Gasto' },
    { label: 'Categoría',   get: m => m.categorias?.nombre ?? '' },
    { label: 'Descripción', get: m => m.descripcion ?? '' },
    { label: 'Monto',       get: m => Number(m.monto).toFixed(2) },
    { label: 'Recurrente',  get: m => m.es_recurrente ? 'Sí' : 'No' },
  ]

  const csv      = toCSV(movimientos, COLUMNAS)
  const sufijo   = periodo ? `_${periodo.replace(/\s/g, '-')}` : ''
  const filename = `manguito_movimientos${sufijo}.csv`
  descargarArchivo(csv, filename)
}

/**
 * Exporta resumen mensual a CSV (ingresos, gastos, saldo por mes).
 */
export function exportarResumenMensualCSV(evolucion) {
  const COLUMNAS = [
    { label: 'Mes',      get: r => r.label },
    { label: 'Ingresos', get: r => Number(r.ingresos).toFixed(2) },
    { label: 'Gastos',   get: r => Number(r.gastos).toFixed(2) },
    { label: 'Saldo',    get: r => (Number(r.ingresos) - Number(r.gastos)).toFixed(2) },
  ]

  const csv = toCSV(evolucion, COLUMNAS)
  descargarArchivo(csv, 'manguito_resumen_mensual.csv')
}

/**
 * Exporta suscripciones a CSV.
 */
export function exportarSuscripcionesCSV(suscripciones) {
  const COLUMNAS = [
    { label: 'Nombre',    get: s => s.nombre },
    { label: 'Monto',     get: s => Number(s.monto).toFixed(2) },
    { label: 'Moneda',    get: s => s.moneda },
    { label: 'Ciclo',     get: s => s.ciclo },
    { label: 'Categoría', get: s => s.categoria },
    { label: 'Activa',    get: s => s.activa ? 'Sí' : 'No' },
  ]

  const csv = toCSV(suscripciones, COLUMNAS)
  descargarArchivo(csv, 'manguito_suscripciones.csv')
}