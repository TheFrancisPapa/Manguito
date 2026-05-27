// api/noticias.js — Feed de noticias financieras + resumen con IA
// Dos acciones:
//   1. (default) Fetch y parseo de RSS de múltiples fuentes financieras
//   2. (_action: 'resumir') Resumen IA de un artículo usando Groq

import { createClient } from '@supabase/supabase-js'

// ── Configuración ─────────────────────────────────────────────
const LIMITS = {
  basico: 5,
  pro: 15,
}

const RSS_FEEDS = [
  { url: 'https://www.ambito.com/rss/economia.xml', fuente: 'Ámbito Financiero', categoriaDefault: 'argentina' },
  { url: 'https://www.ambito.com/rss/finanzas.xml', fuente: 'Ámbito Financiero', categoriaDefault: 'argentina' },
  { url: 'https://finance.yahoo.com/news/rssurl', fuente: 'Yahoo Finance', categoriaDefault: 'global' },
  { url: 'https://www.infobae.com/feeds/rss/economia/', fuente: 'Infobae Economía', categoriaDefault: 'argentina' },
  { url: 'https://www.cronista.com/files/rss/mercados-online.xml', fuente: 'El Cronista', categoriaDefault: 'argentina' },
  { url: 'https://www.coindesk.com/arc/outboundfeeds/rss/', fuente: 'CoinDesk', categoriaDefault: 'crypto' },
]

const CRYPTO_KEYWORDS = [
  'bitcoin', 'btc', 'ethereum', 'eth', 'crypto', 'cripto', 'criptomoneda',
  'blockchain', 'altcoin', 'defi', 'nft', 'solana', 'cardano', 'binance',
  'stablecoin', 'usdt', 'usdc', 'dogecoin', 'litecoin', 'ripple', 'xrp',
]

const ACCIONES_KEYWORDS = [
  'acciones', 'acción', 'stocks', 'shares', 'bolsa', 'merval', 'nasdaq',
  's&p 500', 's&p500', 'dow jones', 'wall street', 'cedear', 'cedears',
  'apple', 'google', 'amazon', 'tesla', 'microsoft', 'nvidia', 'meta',
  'ypf', 'galicia', 'pampa energía', 'tenaris', 'globant',
]

const CACHE_TTL_MS = 5 * 60 * 1000 // 5 minutos

// ── Cache en memoria ──────────────────────────────────────────
let cache = {
  data: null,
  timestamp: 0,
}

// ── Utilidades Supabase (mismo patrón que chat.js) ────────────
function getSupabaseAdmin() {
  return createClient(
    process.env.VITE_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
  )
}

async function getAuthUser(req, supabase) {
  const authHeader = req.headers.authorization ?? ''
  if (!authHeader.startsWith('Bearer ')) return null
  const token = authHeader.slice(7).trim()
  if (!token) return null
  const { data: { user }, error } = await supabase.auth.getUser(token)
  if (error || !user) return null
  return user
}

async function getUserPlan(userId, supabase) {
  const { data, error } = await supabase
    .from('usuarios').select('plan').eq('id', userId).single()
  if (error || !data) return 'basico'
  return data.plan || 'basico'
}

async function checkRateLimit(userId, supabase) {
  const plan = await getUserPlan(userId, supabase)
  const limit = LIMITS[plan] || LIMITS.basico
  const todayStart = new Date()
  todayStart.setHours(0, 0, 0, 0)
  const { count, error } = await supabase
    .from('ai_usage').select('*', { count: 'exact', head: true })
    .eq('user_id', userId).gte('created_at', todayStart.toISOString())
  if (error) return { allowed: true, used: 0, limit, plan }
  return { allowed: (count || 0) < limit, used: count || 0, limit, plan }
}

async function recordUsage(userId, supabase) {
  await supabase.from('ai_usage').insert({ user_id: userId })
}

// ── Parseo de XML con regex (sin dependencias) ────────────────
function stripHtml(str) {
  if (!str) return ''
  return str
    .replace(/<!\[CDATA\[(.*?)\]\]>/gs, '$1')
    .replace(/<[^>]*>/g, '')
    .replace(/&#(\d+);/g, (_, dec) => String.fromCharCode(dec))
    .replace(/&#x([0-9a-f]+);/gi, (_, hex) => String.fromCharCode(parseInt(hex, 16)))
    .replace(/&aacute;/gi, 'á').replace(/&eacute;/gi, 'é').replace(/&iacute;/gi, 'í').replace(/&oacute;/gi, 'ó').replace(/&uacute;/gi, 'ú')
    .replace(/&ntilde;/gi, 'ñ').replace(/&uuml;/gi, 'ü')
    .replace(/&iquest;/g, '¿').replace(/&iexcl;/g, '¡')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function extractTag(xml, tag) {
  // Handle namespaced tags and CDATA
  const regex = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)</${tag}>`, 'i')
  const match = xml.match(regex)
  if (!match) return ''
  return match[1].trim()
}

function extractImageUrl(itemXml) {
  // Try <media:content url="...">
  const mediaMatch = itemXml.match(/<media:content[^>]+url=["']([^"']+)["']/i)
  if (mediaMatch) return mediaMatch[1]

  // Try <media:thumbnail url="...">
  const thumbMatch = itemXml.match(/<media:thumbnail[^>]+url=["']([^"']+)["']/i)
  if (thumbMatch) return thumbMatch[1]

  // Try <enclosure url="..." type="image/...">
  const encMatch = itemXml.match(/<enclosure[^>]+url=["']([^"']+)["'][^>]*type=["']image\/[^"']*["']/i)
  if (encMatch) return encMatch[1]

  // Try <enclosure url="..."> without explicit type check (fallback)
  const encFallback = itemXml.match(/<enclosure[^>]+url=["']([^"']+)["']/i)
  if (encFallback) return encFallback[1]

  // Try image URL inside description/content
  const imgMatch = itemXml.match(/<img[^>]+src=["']([^"']+)["']/i)
  if (imgMatch) return imgMatch[1]

  return null
}

function detectCategoria(fuente, categoriaDefault, titulo, descripcion) {
  const textoLower = `${titulo} ${descripcion}`.toLowerCase()

  // Crypto detection
  if (fuente === 'CoinDesk' || CRYPTO_KEYWORDS.some(kw => textoLower.includes(kw))) {
    return 'crypto'
  }

  // Acciones/stocks detection
  if (ACCIONES_KEYWORDS.some(kw => textoLower.includes(kw))) {
    return 'acciones'
  }

  return categoriaDefault
}

function generateId(url, titulo) {
  // Simple hash-like ID from URL + title
  const str = `${url}|${titulo}`
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash // Convert to 32bit integer
  }
  return Math.abs(hash).toString(36)
}

function parseRssFeed(xml, fuente, categoriaDefault) {
  const articles = []

  // Extract all <item> blocks
  const itemRegex = /<item[\s>]([\s\S]*?)<\/item>/gi
  let match

  while ((match = itemRegex.exec(xml)) !== null) {
    const itemXml = match[1]

    const titulo = stripHtml(extractTag(itemXml, 'title'))
    if (!titulo) continue

    // Ignorar contenido premium o reportes automatizados que requieren suscripción (muy comunes en Yahoo)
    const tituloLower = titulo.toLowerCase()
    if (
      tituloLower.startsWith('analyst report:') ||
      tituloLower.startsWith('market update:') ||
      tituloLower.includes('zacks') // Reportes de Zacks suelen ser premium en Yahoo
    ) {
      continue
    }

    const url = stripHtml(extractTag(itemXml, 'link'))
    const descripcionRaw = extractTag(itemXml, 'description')
    const descripcion = stripHtml(descripcionRaw)
    const pubDate = extractTag(itemXml, 'pubDate')
    const imagen = extractImageUrl(itemXml)

    const fecha = pubDate ? new Date(pubDate).toISOString() : new Date().toISOString()
    const categoria = detectCategoria(fuente, categoriaDefault, titulo, descripcion)

    articles.push({
      id: generateId(url || titulo, titulo),
      titulo,
      descripcion: descripcion.slice(0, 300), // Limitar longitud
      url: url || '',
      imagen,
      fecha,
      fuente,
      categoria,
    })
  }

  return articles
}

// ── Fetch de todos los RSS feeds ──────────────────────────────
async function fetchAllFeeds() {
  const now = Date.now()

  // Devolver cache si es válido
  if (cache.data && (now - cache.timestamp) < CACHE_TTL_MS) {
    return cache.data
  }

  const feedPromises = RSS_FEEDS.map(async (feed) => {
    try {
      const controller = new AbortController()
      const timeout = setTimeout(() => controller.abort(), 8000) // 8s timeout

      const response = await fetch(feed.url, {
        signal: controller.signal,
        headers: {
          'User-Agent': 'Manguito/1.0 (Financial News Aggregator)',
          'Accept': 'application/rss+xml, application/xml, text/xml, */*',
        },
      })
      clearTimeout(timeout)

      if (!response.ok) {
        console.warn(`[noticias] Feed ${feed.fuente} respondió ${response.status}`)
        return []
      }

      const xml = await response.text()
      return parseRssFeed(xml, feed.fuente, feed.categoriaDefault)
    } catch (err) {
      console.warn(`[noticias] Error fetching ${feed.fuente}: ${err.message}`)
      return []
    }
  })

  const results = await Promise.allSettled(feedPromises)
  const allArticles = results
    .filter(r => r.status === 'fulfilled')
    .flatMap(r => r.value)

  // Ordenar por fecha (más recientes primero)
  allArticles.sort((a, b) => new Date(b.fecha) - new Date(a.fecha))

  // Guardar en cache
  cache = {
    data: allArticles,
    timestamp: now,
  }

  return allArticles
}

// ── Acción: Resumen con IA ────────────────────────────────────
const SYSTEM_PROMPT_RESUMEN = `Sos un analista financiero argentino que explica noticias de forma simple y clara.
Tu trabajo es tomar una noticia financiera y explicarla para que cualquier persona la entienda, sin importar su nivel de experiencia.

Responde SIEMPRE en este formato exacto usando estos encabezados:

📋 RESUMEN
(2-3 oraciones simples explicando qué pasó)

🤔 ¿POR QUÉ IMPORTA?
(Cómo afecta esto a los inversores o a la economía, explicado de forma clara)

📊 CONTEXTO
(Un dato clave o contexto histórico que ayude a entender mejor la noticia)

💡 EN SIMPLE
(Explicación con una analogía cotidiana, como si se la explicaras a un amigo que nunca invirtió. Usá lenguaje informal argentino.)

Reglas:
- No uses jerga financiera sin explicarla
- Sé objetivo, no des consejos de inversión
- Si no tenés información suficiente, decilo honestamente
- Máximo 200 palabras en total`

async function handleResumen(req, res) {
  const supabase = getSupabaseAdmin()
  const user = await getAuthUser(req, supabase)
  if (!user) {
    return res.status(401).json({ error: 'No autorizado. Iniciá sesión para resumir noticias.' })
  }

  const rateLimit = await checkRateLimit(user.id, supabase)
  if (!rateLimit.allowed) {
    return res.status(429).json({
      error: `Alcanzaste el límite de ${rateLimit.limit} consultas de IA por día. Volvé a intentar mañana.`,
      usage: { used: rateLimit.used, limit: rateLimit.limit },
    })
  }

  const { titulo, descripcion, url } = req.body
  if (!titulo) {
    return res.status(400).json({ error: 'Se requiere el campo "titulo" para generar el resumen.' })
  }

  const apiKey = process.env.GROQ_API_KEY
  if (!apiKey) {
    console.error('[noticias] Falta GROQ_API_KEY')
    return res.status(500).json({ error: 'El servidor no está configurado correctamente.' })
  }

  try {
    const userMessage = `Noticia: "${titulo}"\n\n${descripcion ? `Descripción: ${descripcion}` : ''}${url ? `\n\nFuente: ${url}` : ''}`

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [
          { role: 'system', content: SYSTEM_PROMPT_RESUMEN },
          { role: 'user', content: userMessage },
        ],
        max_tokens: 600,
        temperature: 0.6,
      }),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      return res.status(response.status).json({
        error: `Error al contactar la IA: ${errorData.error?.message || response.statusText}`,
      })
    }

    const data = await response.json()
    const resumen = data.choices?.[0]?.message?.content || ''

    if (!resumen) {
      return res.status(200).json({
        resumen: 'No pude generar un resumen. Por favor, intentá de nuevo.',
        usage: { used: rateLimit.used, limit: rateLimit.limit },
      })
    }

    await recordUsage(user.id, supabase)

    return res.status(200).json({
      resumen,
      usage: { used: rateLimit.used + 1, limit: rateLimit.limit },
    })
  } catch (error) {
    console.error('[noticias] Error en resumen:', error.message)
    return res.status(500).json({ error: 'Error interno del servidor. Intentá de nuevo.' })
  }
}

// ── Acción: Feed de noticias ──────────────────────────────────
async function handleFeed(req, res) {
  try {
    const { categoria, limite } = req.body || {}
    const limitNum = Math.min(Math.max(Number(limite) || 30, 1), 100)

    let articles = await fetchAllFeeds()

    // Filtrar por categoría si se especificó
    if (categoria) {
      const catLower = categoria.toLowerCase()
      articles = articles.filter(a => a.categoria === catLower)
    }

    // Aplicar límite
    articles = articles.slice(0, limitNum)

    res.setHeader('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=60')
    return res.status(200).json({
      noticias: articles,
      total: articles.length,
      categorias: ['argentina', 'global', 'crypto', 'acciones'],
      cacheado: (Date.now() - cache.timestamp) < 1000, // si el cache fue recién creado
    })
  } catch (error) {
    console.error('[noticias] Error al obtener feeds:', error.message)
    return res.status(500).json({
      error: 'Error al obtener las noticias. Intentá de nuevo en unos minutos.',
      noticias: [],
    })
  }
}

// ── Handler principal ─────────────────────────────────────────
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' })
  }

  const action = req.body?._action

  if (action === 'resumir') {
    return handleResumen(req, res)
  }

  // Default: devolver feed de noticias
  return handleFeed(req, res)
}
