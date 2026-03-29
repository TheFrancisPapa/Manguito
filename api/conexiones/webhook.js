// api/conexiones/webhook.js
// Receptor de webhooks de Belvo.
//
// Belvo puede avisar proactivamente cuando hay transacciones nuevas
// en lugar de esperar que el usuario presione "sincronizar".
//
// Configurar en el panel de Belvo:
//   URL: https://manguito-xi.vercel.app/api/conexiones/webhook
//   Secret: variable BELVO_WEBHOOK_SECRET
//
// Tipos de eventos relevantes:
//   'transactions.ready'   → Hay txs nuevas para procesar
//   'link.needs_action'    → El banco requiere re-autenticación

import crypto from 'crypto'
import { createClient } from '@supabase/supabase-js'

function getSupabase() {
  return createClient(
    process.env.VITE_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
  )
}

/**
 * Verifica que el webhook viene realmente de Belvo.
 * Belvo firma los requests con HMAC-SHA256 usando el webhook secret.
 */
function verificarFirma(payload, signatureHeader, secret) {
  if (!secret || !signatureHeader) return false
  const expectedSig = crypto
    .createHmac('sha256', secret)
    .update(payload)
    .digest('hex')
  return crypto.timingSafeEqual(
    Buffer.from(signatureHeader, 'hex'),
    Buffer.from(expectedSig, 'hex'),
  )
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' })
  }

  // Verificar autenticidad del webhook
  const rawBody = JSON.stringify(req.body)
  const firma   = req.headers['x-belvo-signature'] ?? ''
  const secret  = process.env.BELVO_WEBHOOK_SECRET

  if (secret && !verificarFirma(rawBody, firma, secret)) {
    console.warn('[webhook] Firma inválida — posible request no autorizado')
    return res.status(401).json({ error: 'Firma inválida' })
  }

  const { event_type, link_id, account } = req.body ?? {}
  console.log('[webhook] Evento recibido:', event_type, '/ link:', link_id)

  try {
    const supabase = getSupabase()

    switch (event_type) {
      case 'transactions.ready': {
        // Hay txs nuevas — buscamos a qué usuario pertenece este link
        const { data: conexion } = await supabase
          .from('conexiones_bancarias')
          .select('usuario_id, id')
          .eq('link_id', link_id)
          .single()

        if (!conexion) {
          console.warn('[webhook] Link no encontrado:', link_id)
          break
        }

        // Disparar sincronización interna (reutilizamos el mismo endpoint)
        // Llamada interna al serverless de sync
        await fetch(`${process.env.VERCEL_URL ?? 'http://localhost:3000'}/api/conexiones/sync`, {
          method:  'POST',
          headers: { 'Content-Type': 'application/json' },
          body:    JSON.stringify({
            usuario_id: conexion.usuario_id,
            link_id,
          }),
        })
        break
      }

      case 'link.needs_action': {
        // El banco requiere que el usuario vuelva a autenticarse
        await supabase
          .from('conexiones_bancarias')
          .update({ status: 'needs_auth' })
          .eq('link_id', link_id)

        console.log('[webhook] Link marcado como needs_auth:', link_id)
        break
      }

      case 'link.disconnected': {
        // El banco revocó el acceso
        await supabase
          .from('conexiones_bancarias')
          .update({ status: 'error', metadata: { motivo: 'Banco desconectado' } })
          .eq('link_id', link_id)
        break
      }

      default:
        console.log('[webhook] Evento no manejado:', event_type)
    }

    // Siempre respondemos 200 para que Belvo no reintente
    return res.status(200).json({ recibido: true })

  } catch (error) {
    console.error('[webhook] Error procesando evento:', error.message)
    // Retornamos 500 para que Belvo reintente si es crítico
    return res.status(500).json({ error: 'Error interno' })
  }
}