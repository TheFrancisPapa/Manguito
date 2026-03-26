import { MercadoPagoConfig, Payment } from 'mercadopago';
import { createClient } from '@supabase/supabase-js';

// Usamos el SERVICE_ROLE_KEY de Supabase para poder modificar usuarios desde el servidor
const supabase = createClient(
  process.env.VITE_SUPABASE_URL, 
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).send('Solo POST');

  // Mercado Pago a veces manda el ID en el query y otras en el body
  const paymentId = req.query['data.id'] || req.body?.data?.id;
  const topic = req.query.type || req.body?.type;

  if (topic === 'payment') {
    try {
      const client = new MercadoPagoConfig({ accessToken: process.env.MP_ACCESS_TOKEN });
      const payment = new Payment(client);
      
      // Le preguntamos a MP los detalles de este pago para evitar fraudes
      const paymentInfo = await payment.get({ id: paymentId });

      if (paymentInfo.status === 'approved') {
        const userId = paymentInfo.external_reference; // El ID que le pasamos al crear el pago

        // Actualizamos el perfil del usuario en Supabase
        const { error } = await supabase
          .from('perfiles') // Cambiá 'perfiles' por el nombre real de tu tabla de usuarios
          .update({ plan: 'premium' })
          .eq('id', userId);

        if (error) throw error;
      }
    } catch (error) {
      console.error('Error procesando el webhook:', error);
      return res.status(500).send('Error interno');
    }
  }

  // A Mercado Pago siempre hay que contestarle rápido con un 200 OK
  res.status(200).send('OK');
}