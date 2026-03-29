/**
 * src/services/types.js
 * ─────────────────────────────────────────────────────────────
 * Contratos de datos canónicos de Manguito.
 *
 * REGLA: cualquier fuente de datos (Supabase, Belvo, BBVA, Naranja X,
 * etc.) DEBE normalizar su salida a estas formas antes de llegar
 * a los hooks. Los hooks nunca conocen de dónde vienen los datos.
 *
 * Es el "idioma común" del sistema.
 * ─────────────────────────────────────────────────────────────
 */

// ── Identificadores de fuente ─────────────────────────────────
export const FUENTE = {
  MANUAL:   'manual',   // Cargado a mano en Manguito
  BELVO:    'belvo',    // Sincronizado vía Belvo
  GALILEO:  'galileo',  // Alternativa futura
  PLAID:    'plaid',    // Alternativa futura (EE.UU./UY)
}

// ── Tipos de movimiento ───────────────────────────────────────
export const TIPO_MOV = {
  INGRESO: 'ingreso',
  GASTO:   'gasto',
}

// ── Estados de sincronización ─────────────────────────────────
export const SYNC_STATUS = {
  IDLE:       'idle',
  SYNCING:    'syncing',
  SUCCESS:    'success',
  ERROR:      'error',
  NEEDS_AUTH: 'needs_auth',  // El banco pide re-autenticación
}

/**
 * @typedef {Object} MovimientoCanónico
 * Forma unificada de un movimiento, independiente de la fuente.
 *
 * @property {string}  id             - UUID único (puede ser de Supabase o generado desde banco)
 * @property {string}  usuario_id     - UUID del usuario propietario
 * @property {'ingreso'|'gasto'} tipo
 * @property {number}  monto          - Siempre positivo
 * @property {string}  descripcion    - Texto legible para el usuario
 * @property {string}  fecha          - ISO date YYYY-MM-DD
 * @property {string|null} categoria_id  - null si viene del banco y no fue categorizado
 * @property {Object|null} categorias  - Join de la tabla categorías (puede ser null)
 * @property {boolean} es_recurrente
 * @property {string|null} recurrencia
 * @property {string}  fuente         - De dónde vino (ver FUENTE)
 * @property {string|null} fuente_id  - ID original del banco para deduplicación
 * @property {boolean} sincronizado   - false si fue cargado a mano
 * @property {Object|null} metadata   - Datos extras del banco (comercio, categoría del banco, etc.)
 * @property {string}  created_at
 * @property {string}  updated_at
 */

/**
 * @typedef {Object} ConexionBancaria
 * Representa una cuenta bancaria vinculada.
 *
 * @property {string}  id
 * @property {string}  usuario_id
 * @property {string}  proveedor      - 'belvo', 'plaid', etc.
 * @property {string}  institucion_id - ID de la institución en el proveedor
 * @property {string}  institucion_nombre
 * @property {string}  link_id        - Token del proveedor para hacer requests
 * @property {string}  status         - Ver SYNC_STATUS
 * @property {string|null} ultima_sync
 * @property {Object}  metadata       - Datos adicionales del proveedor
 */

/**
 * @typedef {Object} FuenteDeDatos
 * Interfaz que cada adaptador debe implementar.
 *
 * @property {string}   nombre
 * @property {Function} getMovimientos   - (filtros) => Promise<MovimientoCanónico[]>
 * @property {Function} crearMovimiento  - (datos) => Promise<MovimientoCanónico>
 * @property {Function} editarMovimiento - (id, datos) => Promise<MovimientoCanónico>
 * @property {Function} borrarMovimiento - (id) => Promise<void>
 * @property {Function} soportaEscritura - () => boolean
 */