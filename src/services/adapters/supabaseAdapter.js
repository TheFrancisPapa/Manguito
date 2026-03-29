/**
 * src/services/adapters/supabaseAdapter.js
 * ─────────────────────────────────────────────────────────────
 * Adaptador de FUENTE MANUAL.
 *
 * Envuelve las funciones existentes de src/api/movimientos.js
 * y devuelve datos en formato MovimientoCanónico.
 *
 * IMPORTANTE: No modifica ni importa las funciones originales
 * de los hooks — solo agrega la capa de normalización.
 * El código existente en src/api/movimientos.js NO CAMBIA.
 * ─────────────────────────────────────────────────────────────
 */

import { supabase } from '../../lib/supabase'
import { FUENTE, TIPO_MOV } from '../types'

// ── Normalización ─────────────────────────────────────────────

/**
 * Convierte un registro crudo de Supabase al formato canónico.
 * Los movimientos de Supabase ya están casi en formato correcto;
 * solo agregamos los campos de trazabilidad de fuente.
 *
 * @param {Object} raw - Fila de la tabla `movimientos`
 * @returns {import('../types').MovimientoCanónico}
 */
function normalizar(raw) {
  return {
    ...raw,
    fuente:      FUENTE.MANUAL,
    fuente_id:   null,          // No aplica para entradas manuales
    sincronizado: false,
    metadata:    null,
  }
}

// ── Queries base ──────────────────────────────────────────────

function baseQuery() {
  return supabase
    .from('movimientos')
    .select('*, categorias ( nombre, icono, color )')
}

// ── Adaptador ─────────────────────────────────────────────────

export const supabaseAdapter = {
  nombre: 'Supabase (Manual)',

  /** @returns {boolean} */
  soportaEscritura: () => true,

  /**
   * @param {Object} filtros
   * @returns {Promise<import('../types').MovimientoCanónico[]>}
   */
  async getMovimientos(filtros = {}) {
    let q = baseQuery().order('fecha', { ascending: false })

    if (filtros.tipo)         q = q.eq('tipo', filtros.tipo)
    if (filtros.categoria_id) q = q.eq('categoria_id', filtros.categoria_id)
    if (filtros.desde)        q = q.gte('fecha', filtros.desde)
    if (filtros.hasta)        q = q.lte('fecha', filtros.hasta)
    if (filtros.limite)       q = q.limit(filtros.limite)

    const { data, error } = await q
    if (error) throw error
    return (data ?? []).map(normalizar)
  },

  /**
   * @param {Object} datos
   * @returns {Promise<import('../types').MovimientoCanónico>}
   */
  async crearMovimiento(datos) {
    const { fuente, fuente_id, sincronizado, metadata, ...datosDB } = datos
    const { data, error } = await supabase
      .from('movimientos')
      .insert(datosDB)
      .select('*, categorias ( nombre, icono, color )')
      .single()
    if (error) throw error
    return normalizar(data)
  },

  /**
   * @param {string} id
   * @param {Object} cambios
   * @returns {Promise<import('../types').MovimientoCanónico>}
   */
  async editarMovimiento(id, cambios) {
    const { fuente, fuente_id, sincronizado, metadata, ...cambiosDB } = cambios
    const { data, error } = await supabase
      .from('movimientos')
      .update({ ...cambiosDB, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select('*, categorias ( nombre, icono, color )')
      .single()
    if (error) throw error
    return normalizar(data)
  },

  /**
   * @param {string} id
   * @returns {Promise<void>}
   */
  async borrarMovimiento(id) {
    const { error } = await supabase.from('movimientos').delete().eq('id', id)
    if (error) throw error
  },

  /**
   * Calcula el balance en un rango de fechas.
   * Solo el adaptador de Supabase puede usar RPCs de la DB.
   */
  async getBalance(desde, hasta) {
    const { data, error } = await supabase.rpc('balance_usuario', {
      p_desde: desde,
      p_hasta: hasta,
    })
    if (error) throw error
    return data[0]
  },

  /**
   * Retorna la evolución mensual usando RPC.
   */
  async getEvolucionMensual(meses = 6) {
    const { data, error } = await supabase.rpc('evolucion_mensual', { p_meses: meses })
    if (error) throw error
    return data.map(row => ({
      label: new Date(row.mes + 'T12:00:00').toLocaleDateString('es-AR', {
        month: 'short', year: '2-digit',
      }),
      ingresos: Number(row.ingresos),
      gastos:   Number(row.gastos),
    }))
  },
}