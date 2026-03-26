import { MercadoPagoConfig, Payment } from 'mercadopago';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.VITE_SUPABASE_URL, 
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).send('Solo POST');

  const paymentId = req.query['data.id'] || req.body?.data?.id;
  const topic = req.query.type || req.body?.type;

  if (topic === 'payment') {
    try {
      const client = new MercadoPagoConfig({ accessToken: process.env.MP_ACCESS_TOKEN });
      const payment = new Payment(client);
      const paymentInfo = await payment.get({ id: paymentId });

      if (paymentInfo.status === 'approved') {
        const userId = paymentInfo.external_reference;

        // FIX: era 'premium', pero la DB solo acepta 'basico' | 'pro'
        const { error } = await supabase
          .from('usuarios')
          .update({ plan: 'pro' })
          .eq('id', userId);

        if (error) throw error;
      }
    } catch (error) {
      console.error('Error procesando el webhook:', error);
      return res.status(500).send('Error interno');
    }
  }

  res.status(200).send('OK');
}