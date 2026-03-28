// api/nafta.js
// Proxy para obtener precios de nafta desde combustibles.ar
// Se ejecuta en los servidores de Vercel (serverless function).
//
// Params:
//   ?provincia=corrientes   → precios de esa provincia
//   (sin params)            → lista de provincias disponibles

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Método no permitido' })
  }

  const { provincia } = req.query

  // Headers de caché: los precios de nafta no cambian tan seguido
  res.setHeader('Cache-Control', 'public, s-maxage=3600, stale-while-revalidate=7200')
  res.setHeader('Access-Control-Allow-Origin', '*')

  try {
    let url

    if (provincia) {
      // Precios por provincia — normalizamos el nombre
      const provinciaClean = decodeURIComponent(provincia)
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '') // quitar tildes
        .replace(/\s+/g, '-')

      url = `https://combustibles.ar/api/precios/${encodeURIComponent(provinciaClean)}`
    } else {
      // Lista de provincias
      url = 'https://combustibles.ar/api/provincias'
    }

    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'application/json, text/html, */*',
        'Accept-Language': 'es-AR,es;q=0.9',
        'Referer': 'https://combustibles.ar/',
      },
      signal: AbortSignal.timeout(8000),
    })

    if (!response.ok) {
      // Si el API externo falla, devolvemos datos estáticos de respaldo
      return res.status(200).json({
        fuente: 'fallback',
        mensaje: 'Datos aproximados (la fuente externa no está disponible)',
        precios: PRECIOS_FALLBACK,
        provincias: PROVINCIAS,
      })
    }

    // Intentamos parsear JSON
    const contentType = response.headers.get('content-type') || ''
    if (contentType.includes('application/json')) {
      const data = await response.json()
      return res.status(200).json({ fuente: 'combustibles.ar', ...data })
    }

    // Si devuelve HTML (sitio sin API pública), usamos fallback
    return res.status(200).json({
      fuente: 'fallback',
      mensaje: 'Datos de referencia — actualizá si están desactualizados',
      precios: PRECIOS_FALLBACK,
      provincias: PROVINCIAS,
    })

  } catch (error) {
    console.error('[nafta] Error:', error.message)
    // Siempre devolvemos algo útil aunque falle el externo
    return res.status(200).json({
      fuente: 'fallback',
      mensaje: 'Datos de referencia — la fuente externa no respondió',
      precios: PRECIOS_FALLBACK,
      provincias: PROVINCIAS,
    })
  }
}

// ── Datos de respaldo (se actualizan con cada deploy) ─────────────────────────
// Precios en ARS — Junio 2025 (aproximados, varían por provincia y estación)
const PRECIOS_FALLBACK = [
  {
    tipo: 'Nafta Super',
    codigo: 'super',
    emoji: '⛽',
    color: '#3B82F6',
    precios: {
      ypf: 1250,
      shell: 1280,
      axion: 1270,
      puma: 1240,
    },
  },
  {
    tipo: 'Nafta Premium',
    codigo: 'premium',
    emoji: '🔵',
    color: '#8B5CF6',
    precios: {
      ypf: 1420,
      shell: 1460,
      axion: 1440,
      puma: 1400,
    },
  },
  {
    tipo: 'Gasoil Común',
    codigo: 'gasoil',
    emoji: '🟡',
    color: '#F59E0B',
    precios: {
      ypf: 1180,
      shell: 1200,
      axion: 1190,
      puma: 1170,
    },
  },
  {
    tipo: 'Gasoil Premium',
    codigo: 'gasoil_premium',
    emoji: '🟠',
    color: '#F97316',
    precios: {
      ypf: 1380,
      shell: 1410,
      axion: 1390,
      puma: 1360,
    },
  },
  {
    tipo: 'GNC',
    codigo: 'gnc',
    emoji: '🟢',
    color: '#10B981',
    precios: {
      estaciones_gnc: 320,
    },
  },
]

const PROVINCIAS = [
  'Buenos Aires', 'CABA', 'Catamarca', 'Chaco', 'Chubut', 'Córdoba',
  'Corrientes', 'Entre Ríos', 'Formosa', 'Jujuy', 'La Pampa', 'La Rioja',
  'Mendoza', 'Misiones', 'Neuquén', 'Río Negro', 'Salta', 'San Juan',
  'San Luis', 'Santa Cruz', 'Santa Fe', 'Santiago del Estero',
  'Tierra del Fuego', 'Tucumán',
]