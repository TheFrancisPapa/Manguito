/**
 * src/services/movimientosRouter.js
 * ─────────────────────────────────────────────────────────────
 * EL ENRUTADOR DINÁMICO DE FUENTES DE DATOS.
 *
 * Esta es la única pieza que los hooks deben conocer.
 * Internamente decide de dónde traer los datos, los combina
 * y los devuelve ya normalizados.
 *
 * LÓGICA DE DECISIÓN:
 *
 *   1. Siempre consulta el adaptador de Supabase (fuente manual).
 *   2. Si el usuario tiene bancos conectados (feature flag en DB),
 *      también consulta el adaptador de Belvo en paralelo.
 *   3. Combina ambas fuentes y deduplica.
 *   4. Los hooks reciben el resultado unificado, sin saber la fuente.
 *
 * AGREGAR UN BANCO NUEVO:
 *   1. Crear src/services/adapters/nuevoAdapter.js
 *   2. Agregar al array `ADAPTADORES_BANCARIOS` más abajo.
 *   3. Listo. El router lo incluirá automáticamente.
 *
 * ─────────────────────────────────────────────────────────────
 */

import { supabase }      from '../lib/supabase'
import { supabaseAdapter } from './adapters/supabaseAdapter'
import { belvoAdapter }    from './adapters/belvoAdapter'
import { deduplicar }      from './normalizers/transaccionNormalizer'
import { SYNC_STATUS }     from './types'

// ── Registro de adaptadores bancarios ────────────────────────
// Agregar adaptadores aquí para que el router los use automáticamente.
const ADAPTADORES_BANCARIOS = [
  { proveedor: 'belvo',  adaptador: belvoAdapter  },
  // { proveedor: 'plaid',  adaptador: plaidAdapter  },  // Futuro
  // { proveedor: 'galileo', adaptador: galileoAdapter }, // Futuro
]

// ── Feature Flag ──────────────────────────────────────────────

/**
 * Verifica si un usuario tiene conexiones bancarias activas.
 * Esta es la compuerta que activa el enrutamiento dinámico.
 *
 * Cache en memoria por sesión para no hacer el request en cada
 * llamada a getMovimientos. Se invalida al desconectar un banco.
 */
const _cacheConexiones = new Map() // usuario_id → { tiene: boolean, ts: number }
const CACHE_TTL_MS = 60_000 // 1 minuto

async function tieneConexionesBancarias(usuario_id) {
  const cached = _cacheConexiones.get(usuario_id)
  if (cached && Date.now() - cached.ts < CACHE_TTL_MS) {
    return cached.tiene
  }

  const { count } = await supabase
    .from('conexiones_bancarias')
    .select('id', { count: 'exact', head: true })
    .eq('usuario_id', usuario_id)
    .neq('status', SYNC_STATUS.ERROR)

  const tiene = (count ?? 0) > 0
  _cacheConexiones.set(usuario_id, { tiene, ts: Date.now() })
  return tiene
}

/** Invalida el cache cuando el usuario conecta/desconecta un banco */
export function invalidarCacheConexiones(usuario_id) {
  _cacheConexiones.delete(usuario_id)
}

// ── Router principal ──────────────────────────────────────────

export const movimientosRouter = {

  /**
   * Obtiene movimientos de todas las fuentes disponibles.
   *
   * @param {string|null} usuario_id  - null = la RLS de Supabase lo maneja
   * @param {Object}      filtros
   * @returns {Promise<import('./types').MovimientoCanónico[]>}
   */
  async getMovimientos(usuario_id = null, filtros = {}) {
    // ── Fuente 1: Siempre traemos los manuales de Supabase ──
    const [movManuales] = await Promise.allSettled([
      supabaseAdapter.getMovimientos(filtros),
    ])

    const manuales = movManuales.status === 'fulfilled'
      ? movManuales.value
      : []

    if (movManuales.status === 'rejected') {
      console.error('[router] Error en Supabase:', movManuales.reason)
    }

    // ── Compuerta: ¿tiene bancos conectados? ──────────────────
    if (!usuario_id) return manuales

    let hayBancos = false
    try {
      hayBancos = await tieneConexionesBancarias(usuario_id)
    } catch {
      // Si falla la verificación, mostramos solo los manuales (fail-safe)
      return manuales
    }

    if (!hayBancos) return manuales

    // ── Fuente 2: Datos bancarios en paralelo ─────────────────
    const promesasBancarias = ADAPTADORES_BANCARIOS.map(({ proveedor, adaptador }) =>
      adaptador.getMovimientos(usuario_id, filtros)
        .catch(err => {
          console.warn(`[router] Error en adaptador ${proveedor}:`, err.message)
          return [] // El fallo de un banco no rompe el resto
        })
    )

    const resultadosBancarios = await Promise.all(promesasBancarias)
    const bancarios = resultadosBancarios.flat()

    // ── Merge + deduplicación ─────────────────────────────────
    return deduplicar([...manuales, ...bancarios])
  },

  /**
   * ESCRITURA: siempre va a Supabase (fuente manual).
   * No se puede crear una transacción en el banco desde Manguito.
   */
  async crearMovimiento(datos) {
    return supabaseAdapter.crearMovimiento(datos)
  },

  /**
   * EDICIÓN: aplica en Supabase.
   * Si el ID es de una tx bancaria (empieza con "belvo_tx_"),
   * creamos un "override" manual en su lugar.
   *
   * @param {string} id
   * @param {Object} cambios
   * @returns {Promise<import('./types').MovimientoCanónico>}
   */
  async editarMovimiento(id, cambios) {
    const esTxBancaria = id.includes('_tx_')

    if (esTxBancaria) {
      // Crear un movimiento manual que "sobreescribe" la tx bancaria
      // en la vista (deduplicar() lo prioriza por ser fuente=manual)
      const { id: _id, fuente, sincronizado, ...datosLimpios } = cambios
      return supabaseAdapter.crearMovimiento({
        ...datosLimpios,
        fuente_id: id,  // Enlazamos con la tx original para deduplicación
      })
    }

    return supabaseAdapter.editarMovimiento(id, cambios)
  },

  /**
   * BORRADO: solo aplica a movimientos manuales.
   * No se pueden "borrar" txs bancarias (son solo lectura).
   */
  async borrarMovimiento(id) {
    if (id.includes('_tx_')) {
      throw new Error('Las transacciones bancarias no se pueden eliminar. Podés ocultarlas desde la configuración.')
    }
    return supabaseAdapter.borrarMovimiento(id)
  },

  // ── Delegaciones directas a Supabase ─────────────────────────
  // Estas operaciones no tienen equivalente bancario

  async getBalance(desde, hasta) {
    return supabaseAdapter.getBalance(desde, hasta)
  },

  async getEvolucionMensual(meses = 6) {
    return supabaseAdapter.getEvolucionMensual(meses)
  },

  // ── Gestión de conexiones bancarias ──────────────────────────

  async sincronizarBancos(usuario_id) {
    invalidarCacheConexiones(usuario_id)
    const resultados = await Promise.allSettled(
      ADAPTADORES_BANCARIOS.map(({ adaptador }) =>
        adaptador.sincronizar(usuario_id)
      )
    )
    return resultados.map((r, i) => ({
      proveedor: ADAPTADORES_BANCARIOS[i].proveedor,
      ok:        r.status === 'fulfilled',
      resultado: r.status === 'fulfilled' ? r.value : { error: r.reason?.message },
    }))
  },

  async crearLinkTokenBelvo() {
    return belvoAdapter.crearLinkToken()
  },

  async desconectarBanco(conexion_id, usuario_id) {
    await belvoAdapter.desconectar(conexion_id)
    invalidarCacheConexiones(usuario_id)
  },
}