/**
 * Formatea un número como moneda.
 * @param {number} valor - El monto a formatear.
 * @param {string} moneda - El código de moneda (ej: 'ARS', 'USD'). Por defecto 'ARS'.
 * @param {boolean} mostrarCentavos - Si debe mostrar los decimales. Por defecto false.
 * @returns {string} El monto formateado (ej: "$ 1.500")
 */
export function formatMoneda(valor, moneda = 'ARS', mostrarCentavos = false) {
  if (valor === null || valor === undefined || isNaN(valor)) return '$ 0';
  
  return Number(valor).toLocaleString('es-AR', {
    style: 'currency',
    currency: moneda,
    minimumFractionDigits: mostrarCentavos ? 2 : 0,
    maximumFractionDigits: mostrarCentavos ? 2 : 0,
  });
}