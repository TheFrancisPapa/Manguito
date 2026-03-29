// api/conexiones/belvo-link.js
// Proxy seguro para Belvo Connect Widget.
//
// El widget es el formulario oficial de Belvo donde el usuario
// ingresa su usuario/contraseña bancaria. Nosotros solo generamos
// el token de acceso — nunca vemos las credenciales del banco.
//
// Flujo:
//   1. Frontend llama a POST /api/conexiones/belvo-link
//   2. Este serverless llama a Belvo con las credenciales del servidor
//   3. Devuelve { access_token } al frontend
//   4. Frontend inicializa el widget con ese token
//   5. Belvo maneja todo lo demás de forma segura (OAuth-like)
//
// Variables de entorno requeridas (en Vercel):
//   BELVO_SECRET_ID
//   BELVO_SECRET_PASSWORD
//   BELVO_ENV = 'sandbox' | 'production'

const BELVO_HOSTS = {
  sandbox:    'https://sandbox.belvo.com',
  production: 'https://api.belvo.com',
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' })
  }

  const secretId  = process.env.BELVO_SECRET_ID
  const secretPwd = process.env.BELVO_SECRET_PASSWORD
  const env       = process.env.BELVO_ENV ?? 'sandbox'

  if (!secretId || !secretPwd) {
    console.error('[belvo-link] Faltan variables de entorno BELVO_SECRET_ID / BELVO_SECRET_PASSWORD')
    return res.status(500).json({ error: 'Servicio de conexión bancaria no configurado' })
  }

  const baseUrl = BELVO_HOSTS[env] ?? BELVO_HOSTS.sandbox

  try {
    // 1. Crear un "access token" de sesión para el widget
    //    Documentación: https://developers.belvo.com/reference/token-create
    const tokenRes = await fetch(`${baseUrl}/api/token/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Basic ' + Buffer.from(`${secretId}:${secretPwd}`).toString('base64'),
      },
      body: JSON.stringify({
        id: secretId,
        password: secretPwd,
        scopes: 'read_institutions,write_links,read_balances,read_transactions',
      }),
    })

    if (!tokenRes.ok) {
      const err = await tokenRes.json().catch(() => ({}))
      console.error('[belvo-link] Error al crear token:', err)
      return res.status(tokenRes.status).json({
        error: 'No se pudo inicializar la conexión bancaria',
      })
    }

    const tokenData = await tokenRes.json()

    res.setHeader('Cache-Control', 'no-store')
    return res.status(200).json({
      access_token: tokenData.access,
      // El widget de Belvo usa este token para autenticarse
    })

  } catch (error) {
    console.error('[belvo-link] Error interno:', error.message)
    return res.status(500).json({ error: 'Error al conectar con el servicio bancario' })
  }
}