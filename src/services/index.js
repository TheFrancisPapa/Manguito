/**
 * src/services/index.js
 * ─────────────────────────────────────────────────────────────
 * Punto de entrada del módulo de servicios.
 * Centraliza todos los imports para que los hooks usen siempre
 * este archivo y nunca los adaptadores directamente.
 * ─────────────────────────────────────────────────────────────
 */

export { movimientosRouter }          from './movimientosRouter'
export { invalidarCacheConexiones }   from './movimientosRouter'
export { FUENTE, TIPO_MOV, SYNC_STATUS } from './types'
export { fromBelvo, deduplicar }      from './normalizers/transaccionNormalizer'

// Los adaptadores NO se exportan desde acá.
// Solo el router los conoce. Eso garantiza que ningún componente
// llame directamente a Belvo o Supabase saltándose el router.