/**
 * Función para exportar un arreglo de movimientos a un archivo CSV.
 * Incluye BOM de UTF-8 para que Excel lo abra correctamente sin problemas de acentos.
 * Escapa comillas y usa punto y coma (;) o comas (,) según estándar.
 */
export function descargarCSV(movimientos) {
  if (!movimientos || movimientos.length === 0) {
    console.warn("No hay movimientos para exportar.");
    return;
  }

  // Encabezados del CSV
  const encabezados = ['Ficha', 'Fecha', 'Tipo', 'Categoría', 'Descripción', 'Monto'];

  // Procesamos los datos
  const filas = movimientos.map(m => {
    // Extraemos campos seguros (con fallbacks si están vacíos)
    const id = m.id || '';
    const fecha = m.fecha ? new Date(m.fecha + 'T00:00:00').toLocaleDateString('es-AR') : '';
    const tipo = m.tipo ? m.tipo.toUpperCase() : '';
    const categoria = m.categorias?.nombre || '';
    
    // Función para escapar strings en CSV
    const escaparCampo = (campo) => {
      if (!campo) return '';
      // Si el campo tiene comas, comillas o saltos de línea, hay que envolverlo en comillas y duplicar las internas
      const str = String(campo);
      if (str.includes(',') || str.includes('"') || str.includes('\n')) {
        return `"${str.replace(/"/g, '""')}"`;
      }
      return str;
    };

    const descripcion = escaparCampo(m.descripcion);
    
    // Formateamos el monto usando el mismo formato que usa Excel para números.
    // Excel en español espera coma para decimales. 
    // Mantenemos el signo negativo si es gasto para mejor cálculo en Excel.
    let montoNum = Number(m.monto || 0);
    // Si queremos que los gastos sean negativos en excel (muy util):
    if (m.tipo === 'gasto') montoNum = -Math.abs(montoNum);
    else montoNum = Math.abs(montoNum);
    
    // Reemplazamos el punto de los decimales (de JS) por la coma (que usa Excel ES)
    const montoExcel = String(montoNum).replace('.', ',');

    return [id, fecha, tipo, escaparCampo(categoria), descripcion, montoExcel].join(',');
  });

  // Juntamos encabezados + filas
  const csvContent = [encabezados.join(','), ...filas].join('\n');

  // Añadimos el BOM (Byte Order Mark) para UTF-8 clave para acentos en Excel
  const bom = new Uint8Array([0xEF, 0xBB, 0xBF]);
  const blob = new Blob([bom, csvContent], { type: 'text/csv;charset=utf-8;' });

  // Crear enlace de descarga temporal y simular click
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  // Nombramos el archivo con la fecha actual
  const hoy = new Date().toISOString().split('T')[0];
  link.setAttribute('href', url);
  link.setAttribute('download', `manguito_movimientos_${hoy}.csv`);
  
  // Lo añadimos al DOM (invisible), clickeamos, y limpiamos
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
