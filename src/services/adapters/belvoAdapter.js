/**
 * src/services/adapters/belvoAdapter.js
 * ─────────────────────────────────────────────────────────────
 * Adaptador para transacciones bancarias vía Belvo.
 *
 * ARQUITECTURA DE SEGURIDAD:
 *   El frontend NUNCA llama a la API de Belvo directamente.
 *   Todo pasa por funciones serverless en /api/conexiones/
 *   que guardan el SECRET KEY de Belvo en variables de entorno
 *   del servidor (Vercel).
 *
 *   Frontend → /api/conexiones/sync  → Belvo API
 *                                    → Supabase (guarda txs)
 *
 * ESTADO ACTUAL: stub activo.
 * Para activar: descomentar las llamadas reales y configurar
 * BELVO_SECRET_ID + BELVO_SECRET_PASSWORD en Vercel.
 * ─────────────────────────────────────────────────────────────
 */

import { supabase } from '../../lib/supabase'
import { FUENTE, SYNC_STATUS } from '../types'
import { fromBelvo, deduplicar } from '../normalizers/transaccionNormalizer'

// ── Helpers ───────────────────────────────────────────────────

/**
 * Obtiene las conexiones bancarias activas del usuario desde Supabase.
 * La tabla `conexiones_bancarias` se crea en database/005_conexiones_bancarias.sql
 *
 * @param {string} usuario_id
 * @returns {Promise<import('../types').ConexionBancaria[]>}
 */
async function getConexionesActivas(usuario_id) {
  const { data, error } = await supabase
    .from('conexiones_bancarias')
    .select('*')
    .eq('usuario_id', usuario_id)
    .eq('proveedor', 'belvo')
    .neq('status', SYNC_STATUS.ERROR)

  if (error) {
    console.warn('[belvoAdapter] No se pudieron cargar conexiones:', error.message)
    return []
  }
  return data ?? []
}

/**
 * Obtiene las categorías del usuario para el mapeo automático.
 * @param {string} usuario_id
 * @returns {Promise<Map<string, string>>} Mapa { nombreCat: uuid }
 */
async function getCatMap(usuario_id) {
  const { data } = await supabase
    .from('categorias')
    .select('id, nombre')
    .eq('usuario_id', usuario_id)

  const map = new Map()
  ;(data ?? []).forEach(c => map.set(c.nombre, c.id))
  return map
}

/**
 * Lee las transacciones bancarias YA sincronizadas en Supabase
 * (guardadas por el serverless /api/conexiones/sync).
 */
async function getTxSincronizadas(usuario_id, filtros = {}) {
  let q = supabase
    .from('transacciones_bancarias')
    .select('*')
    .eq('usuario_id', usuario_id)
    .order('fecha', { ascending: false })

  if (filtros.desde) q = q.gte('fecha', filtros.desde)
  if (filtros.hasta) q = q.lte('fecha', filtros.hasta)
  if (filtros.limite) q = q.limit(filtros.limite)

  const { data, error } = await q
  if (error) throw error
  return data ?? []
}

// ── Adaptador ─────────────────────────────────────────────────

export const belvoAdapter = {
  nombre: 'Belvo (Open Finance)',

  /** Solo lectura — no se puede crear un gasto en el banco desde Manguito */
  soportaEscritura: () => false,

  /**
   * Devuelve movimientos bancarios en formato canónico.
   *
   * Flujo:
   *  1. Verifica si el usuario tiene bancos conectados
   *  2. Lee las transacciones ya sincronizadas en `transacciones_bancarias`
   *  3. Las normaliza al formato canónico
   *
   * La sincronización real (llamada a Belvo) se hace por separado
   * vía belvoAdapter.sincronizar() o desde el webhook del servidor.
   *
   * @param {string} usuario_id
   * @param {Object} filtros
   * @returns {Promise<import('../types').MovimientoCanónico[]>}
   */
  async getMovimientos(usuario_id, filtros = {}) {
    const conexiones = await getConexionesActivas(usuario_id)
    if (conexiones.length === 0) return []

    const catMap = await getCatMap(usuario_id)
    const txsBancarias = await getTxSincronizadas(usuario_id, filtros)

    return txsBancarias.map(tx => fromBelvo(tx, usuario_id, catMap))
  },

  /**
   * Dispara una sincronización con Belvo a través del proxy serverless.
   * El serverless se encarga de llamar a Belvo, guardar las txs en
   * `transacciones_bancarias` y retornar el resultado.
   *
   * @param {string} usuario_id
   * @param {string} [link_id]    - Si se pasa, solo sincroniza esa conexión
   * @returns {Promise<{ sincronizados: number, errores: number }>}
   */
  async sincronizar(usuario_id, link_id = null) {
    const res = await fetch('/api/conexiones/sync', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ usuario_id, link_id }),
    })

    if (!res.ok) {
      const err = await res.json().catch(() => ({}))
      throw new Error(err.error ?? `Error ${res.status} al sincronizar`)
    }

    return res.json()
  },

  /**
   * Genera un token de sesión de Belvo Connect Widget.
   * El widget es el formulario oficial de Belvo donde el usuario
   * ingresa sus credenciales bancarias de forma segura.
   * Manguito NUNCA ve esas credenciales.
   *
   * @returns {Promise<{ access_token: string, link_token: string }>}
   */
  async crearLinkToken() {
    const res = await fetch('/api/conexiones/belvo-link', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    })
    if (!res.ok) throw new Error('No se pudo iniciar la conexión bancaria')
    return res.json()
  },

  /**
   * Desconecta un banco y borra su link en Belvo.
   * @param {string} conexion_id  - ID en la tabla `conexiones_bancarias`
   */
  async desconectar(conexion_id) {
    const res = await fetch(`/api/conexiones/desconectar`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ conexion_id }),
    })
    if (!res.ok) throw new Error('No se pudo desconectar el banco')
  },

  /**
   * Stub — las operaciones de escritura no aplican para transacciones bancarias.
   * Si el usuario quiere "editar" una tx bancaria, en realidad crea un
   * movimiento manual que la sobreescribe en la vista (ver deduplicar()).
   */
  async crearMovimiento() {
    throw new Error('No se puede crear un movimiento directamente en el banco.')
  },
  async editarMovimiento() {
    throw new Error('Editar crea un movimiento manual que sobreescribe la tx bancaria.')
  },
  async borrarMovimiento() {
    throw new Error('No se pueden eliminar transacciones bancarias sincronizadas.')
  },
}