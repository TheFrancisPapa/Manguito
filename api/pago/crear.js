import { MercadoPagoConfig, Preference } from 'mercadopago';

export default async function handler(req, res) {
  // Solo aceptamos peticiones POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  // Inicializamos Mercado Pago con tu token de servidor
  const client = new MercadoPagoConfig({ accessToken: process.env.MP_ACCESS_TOKEN });
  const preference = new Preference(client);

  try {
    const tipoPlan = req.body.tipoPlan || 'mensual';
    const precios = {
      mensual: 4999,
      anual: 39999
    };
    const precio = precios[tipoPlan] || precios.mensual;
    const title = tipoPlan === 'anual' ? 'Manguito Pro (Anual)' : 'Manguito Pro (Mensual)';

    const result = await preference.create({
      body: {
        items: [
          {
            id: 'plan_premium',
            title: title,
            quantity: 1,
            unit_price: precio,
            currency_id: 'ARS',
          }
        ],
        // Le pasamos el ID del usuario para saber de quién es el pago cuando vuelva el aviso
        external_reference: req.body.userId,
        payer: {
          email: req.body.email
        },
        back_urls: {
          success: 'https://manguito-xi.vercel.app/dashboard',
          failure: 'https://manguito-xi.vercel.app/configuracion',
          pending: 'https://manguito-xi.vercel.app/configuracion'
        },
        auto_return: 'approved',
        // Acá le decimos a MP a dónde mandar el aviso de pago por detrás
        notification_url: 'https://manguito-xi.vercel.app/api/pago/webhook'
      }
    });

    // Le devolvemos al frontend la URL para redirigir al usuario a pagar
    res.status(200).json({ init_point: result.init_point });
  } catch (error) {
    console.error('Error creando preferencia:', error);
    res.status(500).json({ error: 'Fallo al crear el pago' });
  }
}