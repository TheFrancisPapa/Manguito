// api/conexiones/sync.js
// Sincroniza transacciones bancarias desde Belvo hacia Supabase.
//
// Esta función:
//  1. Lee los links activos del usuario en la tabla `conexiones_bancarias`
//  2. Por cada link, llama a la API de Belvo para obtener las txs recientes
//  3. Guarda/actualiza las txs en la tabla `transacciones_bancarias`
//  4. Actualiza el status y la fecha de última sync
//
// Se puede llamar desde:
//  - El frontend (botón "Sincronizar ahora")
//  - Un cron job de Vercel (sync automático diario)
//  - El webhook de Belvo (cuando Belvo tiene datos nuevos)
//
// Variables de entorno requeridas:
//   BELVO_SECRET_ID
//   BELVO_SECRET_PASSWORD
//   BELVO_ENV
//   VITE_SUPABASE_URL       (acceso al schema público)
//   SUPABASE_SERVICE_ROLE_KEY

import { createClient } from '@supabase/supabase-js'

const BELVO_HOSTS = {
  sandbox:    'https://sandbox.belvo.com',
  production: 'https://api.belvo.com',
}

const DIAS_ATRAS_DEFAULT = 90 // Cuántos días de historial traer en la primera sync

function getBelvoHeaders() {
  const { BELVO_SECRET_ID: id, BELVO_SECRET_PASSWORD: pwd } = process.env
  return {
    'Content-Type':  'application/json',
    'Authorization': 'Basic ' + Buffer.from(`${id}:${pwd}`).toString('base64'),
  }
}

function getSupabase() {
  return createClient(
    process.env.VITE_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,  // Service role para escribir sin RLS
  )
}

/**
 * Obtiene transacciones de un link de Belvo.
 * Maneja la paginación automáticamente.
 *
 * @param {string} link_id
 * @param {string} fecha_desde  YYYY-MM-DD
 * @param {string} fecha_hasta  YYYY-MM-DD
 * @returns {Promise<Object[]>}  Array de transacciones de Belvo
 */
async function fetchTransaccionesBelvo(link_id, fecha_desde, fecha_hasta) {
  const baseUrl = BELVO_HOSTS[process.env.BELVO_ENV ?? 'sandbox']
  const headers = getBelvoHeaders()
  const txs     = []
  let   nextUrl = `${baseUrl}/api/transactions/?link=${link_id}&date_from=${fecha_desde}&date_to=${fecha_hasta}&page_size=100`

  // Belvo pagina con cursor — iteramos hasta no haber más páginas
  while (nextUrl) {
    const res = await fetch(nextUrl, { headers })

    if (!res.ok) {
      const err = await res.json().catch(() => ({}))
      throw new Error(`Belvo API error ${res.status}: ${err.detail ?? 'unknown'}`)
    }

    const data = await res.json()
    txs.push(...(data.results ?? []))
    nextUrl = data.next ?? null  // null = última página
  }

  return txs
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' })
  }

  const supabase   = getSupabase()
  const { usuario_id, link_id: linkIdFiltro } = req.body ?? {}

  if (!usuario_id) {
    return res.status(400).json({ error: 'Se requiere usuario_id' })
  }

  if (!process.env.BELVO_SECRET_ID) {
    return res.status(500).json({ error: 'Servicio bancario no configurado' })
  }

  try {
    // 1. Obtener conexiones activas del usuario ──────────────
    let query = supabase
      .from('conexiones_bancarias')
      .select('*')
      .eq('usuario_id', usuario_id)
      .eq('proveedor', 'belvo')
      .neq('status', 'error')

    if (linkIdFiltro) {
      query = query.eq('link_id', linkIdFiltro)
    }

    const { data: conexiones, error: errConn } = await query
    if (errConn) throw errConn
    if (!conexiones?.length) {
      return res.status(200).json({ sincronizados: 0, errores: 0, mensaje: 'Sin conexiones activas' })
    }

    let totalSincronizados = 0
    let totalErrores       = 0

    // 2. Por cada conexión, sincronizar transacciones ─────────
    for (const conexion of conexiones) {
      try {
        // Calcular rango de fechas
        const hoy         = new Date()
        const fechaHasta  = hoy.toISOString().slice(0, 10)
        const fechaDesde  = conexion.ultima_sync
          ? new Date(new Date(conexion.ultima_sync).getTime() - 86_400_000) // -1 día por si acaso
            .toISOString().slice(0, 10)
          : new Date(hoy.getTime() - DIAS_ATRAS_DEFAULT * 86_400_000)
            .toISOString().slice(0, 10)

        // Marcar como "sincronizando"
        await supabase
          .from('conexiones_bancarias')
          .update({ status: 'syncing' })
          .eq('id', conexion.id)

        // Llamar a Belvo
        const txsBelvo = await fetchTransaccionesBelvo(
          conexion.link_id,
          fechaDesde,
          fechaHasta,
        )

        if (txsBelvo.length === 0) {
          await supabase
            .from('conexiones_bancarias')
            .update({ status: 'success', ultima_sync: new Date().toISOString() })
            .eq('id', conexion.id)
          continue
        }

        // Preparar para inserción en Supabase (upsert por fuente_id)
        const rowsParaUpsert = txsBelvo.map(tx => ({
          usuario_id,
          conexion_id:    conexion.id,
          fuente_id:      tx.id,
          tipo:           tx.type === 'INFLOW' ? 'ingreso' : 'gasto',
          monto:          Math.abs(Number(tx.amount)),
          descripcion:    (tx.reference ?? tx.description ?? 'Transacción').slice(0, 200),
          fecha:          (tx.accounting_date ?? tx.value_date).slice(0, 10),
          moneda:         tx.currency ?? 'ARS',
          categoria_banco: tx.category ?? null,
          status:         tx.status ?? null,
          metadata:       JSON.stringify({
            account_id:   tx.account?.id,
            institution:  tx.account?.institution?.name,
            reference:    tx.reference,
            value_date:   tx.value_date,
          }),
          created_at:     tx.created_at ?? new Date().toISOString(),
          synced_at:      new Date().toISOString(),
        }))

        // Upsert: si la tx ya existía la actualiza, si no la crea
        const { error: errUpsert } = await supabase
          .from('transacciones_bancarias')
          .upsert(rowsParaUpsert, {
            onConflict: 'usuario_id,fuente_id',
            ignoreDuplicates: false,
          })

        if (errUpsert) throw errUpsert

        totalSincronizados += txsBelvo.length

        // Actualizar estado de conexión
        await supabase
          .from('conexiones_bancarias')
          .update({
            status:       'success',
            ultima_sync:  new Date().toISOString(),
            metadata:     { ...conexion.metadata, ultima_cantidad: txsBelvo.length },
          })
          .eq('id', conexion.id)

      } catch (errConexion) {
        console.error(`[sync] Error en conexión ${conexion.id}:`, errConexion.message)
        totalErrores++

        await supabase
          .from('conexiones_bancarias')
          .update({
            status: 'error',
            metadata: { ...conexion.metadata, ultimo_error: errConexion.message },
          })
          .eq('id', conexion.id)
      }
    }

    res.setHeader('Cache-Control', 'no-store')
    return res.status(200).json({
      sincronizados: totalSincronizados,
      errores:       totalErrores,
    })

  } catch (error) {
    console.error('[sync] Error general:', error.message)
    return res.status(500).json({ error: 'Error interno al sincronizar' })
  }
}