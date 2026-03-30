import crypto from 'crypto'
import { MercadoPagoConfig, Payment } from 'mercadopago'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
)

/**
 * Verifica la firma HMAC-SHA256 enviada por MercadoPago.
 * Docs: https://www.mercadopago.com.ar/developers/es/docs/your-integrations/notifications/webhooks
 *
 * El template firmado es: "id:<paymentId>;request-id:<xRequestId>;ts:<timestamp>;"
 */
function verificarFirmaMP(req, paymentId) {
  const secret = process.env.MP_WEBHOOK_SECRET
  // Si no hay secret configurado en las env vars, logueamos advertencia
  // pero no bloqueamos (para no romper ambientes de desarrollo sin config).
  // En producción MP_WEBHOOK_SECRET DEBE estar definido.
  if (!secret) {
    console.warn('[webhook-mp] MP_WEBHOOK_SECRET no configurado. Verificación de firma omitida.')
    return true
  }

  const xSignature = req.headers['x-signature'] ?? ''
  const xRequestId = req.headers['x-request-id'] ?? ''

  if (!xSignature) {
    console.warn('[webhook-mp] Header x-signature ausente.')
    return false
  }

  // Parsear ts y v1 del header
  const partes = Object.fromEntries(
    xSignature.split(',').map(part => {
      const [k, v] = part.split('=')
      return [k?.trim(), v?.trim()]
    })
  )
  const { ts, v1 } = partes

  if (!ts || !v1) return false

  // Verificar que el timestamp no sea más viejo que 5 minutos (replay attack)
  const ahora = Math.floor(Date.now() / 1000)
  if (Math.abs(ahora - parseInt(ts)) > 300) {
    console.warn('[webhook-mp] Timestamp del webhook demasiado antiguo.')
    return false
  }

  // Construir el string que fue firmado por MP
  const manifest = `id:${paymentId};request-id:${xRequestId};ts:${ts};`

  const hashEsperado = crypto
    .createHmac('sha256', secret)
    .update(manifest)
    .digest('hex')

  // Comparación en tiempo constante para prevenir timing attacks
  try {
    return crypto.timingSafeEqual(
      Buffer.from(v1, 'hex'),
      Buffer.from(hashEsperado, 'hex'),
    )
  } catch {
    // Buffer.from puede tirar si v1 no es hex válido
    return false
  }
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).send('Solo POST')

  const paymentId = req.query['data.id'] || req.body?.data?.id
  const topic = req.query.type || req.body?.type

  // ── NUEVO: verificación de firma antes de procesar nada ───────
  if (!verificarFirmaMP(req, paymentId)) {
    console.warn('[webhook-mp] Firma inválida — request rechazado.')
    // Respondemos 200 igual para que MP no reintente indefinidamente
    // (es el comportamiento recomendado por su documentación)
    return res.status(200).send('OK')
  }
  // ─────────────────────────────────────────────────────────────

  if (topic === 'payment' && paymentId) {
    try {
      const client = new MercadoPagoConfig({ accessToken: process.env.MP_ACCESS_TOKEN })
      const payment = new Payment(client)
      const paymentInfo = await payment.get({ id: paymentId })

      if (paymentInfo.status === 'approved') {
        const userId = paymentInfo.external_reference

        if (!userId) {
          console.error('[webhook-mp] external_reference vacío en pago aprobado:', paymentId)
          return res.status(200).send('OK')
        }

        const { error } = await supabase
          .from('usuarios')
          .update({ plan: 'pro' })
          .eq('id', userId)

        if (error) {
          console.error('[webhook-mp] Error actualizando plan:', error)
          return res.status(500).send('Error interno')
        }

        console.log('[webhook-mp] Plan actualizado a pro para usuario:', userId)
      }
    } catch (error) {
      console.error('[webhook-mp] Error procesando webhook:', error)
      return res.status(500).send('Error interno')
    }
  }

  res.status(200).send('OK')
}