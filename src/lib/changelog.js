// ══════════════════════════════════════════════
//  src/lib/changelog.js
//  Registro de versiones de Manguito.
//
//  CÓMO AGREGAR UNA NUEVA VERSIÓN:
//  1. Agregá un objeto nuevo AL PRINCIPIO del array.
//  2. Incrementá el campo `version` (ej: "1.2.0").
//  3. Completá `fecha`, `titulo` y `cambios`.
//  4. En `cambios`, cada ítem tiene:
//     - tipo: 'nuevo' | 'mejora' | 'fix'
//     - texto: descripción breve del cambio
//  5. ¡Listo! La próxima vez que el usuario entre
//     verá automáticamente el modal con las novedades.
// ══════════════════════════════════════════════

export const CHANGELOG = [
  {
    version: '1.1.0',
    fecha: '2025-01-15',
    titulo: '¡Llegó el Asesor IA y las Cotizaciones! 🥭',
    cambios: [
      { tipo: 'nuevo',  texto: 'ManguitoAI: tu asistente de finanzas e inversiones con inteligencia artificial.' },
      { tipo: 'nuevo',  texto: 'Página de Cotizaciones: dólar blue, MEP, CCL y otras divisas en tiempo real.' },
      { tipo: 'nuevo',  texto: 'Conversor de dólares y divisas integrado en la página de Cotizaciones.' },
      { tipo: 'nuevo',  texto: 'Gráfico de evolución mensual en el Dashboard (últimos 6 meses).' },
      { tipo: 'mejora', texto: 'El Dashboard ahora saluda con el nombre del usuario y la hora del día.' },
      { tipo: 'mejora', texto: 'Las metas de ahorro ahora muestran los días restantes hasta la fecha límite.' },
      { tipo: 'fix',    texto: 'Corregido el formulario de movimientos: la fecha ahora usa la zona horaria local.' },
      { tipo: 'fix',    texto: 'Arreglados estilos visuales en modo oscuro en las tarjetas de presupuesto.' },
    ],
  },
  {
    version: '1.0.0',
    fecha: '2025-01-01',
    titulo: '¡Manguito está online! 🎉',
    cambios: [
      { tipo: 'nuevo', texto: 'Registro e inicio de sesión con email/contraseña.' },
      { tipo: 'nuevo', texto: 'Dashboard con resumen de ingresos, gastos y saldo del mes.' },
      { tipo: 'nuevo', texto: 'Registro de movimientos con categorías personalizables.' },
      { tipo: 'nuevo', texto: 'Presupuestos mensuales por categoría con alertas configurables.' },
      { tipo: 'nuevo', texto: 'Metas de ahorro con seguimiento de progreso.' },
      { tipo: 'nuevo', texto: 'Soporte para modo oscuro / claro.' },
    ],
  },
]

// La versión más reciente es siempre la primera del array
export const VERSION_ACTUAL = CHANGELOG[0].version

// Devuelve true si hay novedades que el usuario no vio todavía
import { secureStorage } from './secureStorage'
const CHANGELOG_KEY = 'changelog_ultima_version'
 
export async function hayNovedades() {
  const ultimaVista = await secureStorage.getItem(CHANGELOG_KEY, null)
  return ultimaVista !== VERSION_ACTUAL
}
export async function marcarComoVisto() {
  await secureStorage.setItem(CHANGELOG_KEY, VERSION_ACTUAL)
}
export async function getCambiosNuevos() {
  const ultimaVista = await secureStorage.getItem(CHANGELOG_KEY, null)
  if (!ultimaVista) return CHANGELOG
  const idx = CHANGELOG.findIndex(v => v.version === ultimaVista)
  if (idx <= 0) return [CHANGELOG[0]]
  return CHANGELOG.slice(0, idx)
}