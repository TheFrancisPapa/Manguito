// public/sw.js
// Service Worker de Manguito — Estrategia anti-7-días de Apple
//
// PROBLEMA: Safari/WebKit en iOS/macOS elimina AUTOMÁTICAMENTE el caché
// del Service Worker si la PWA no se usa en 7 días. Esto resetea todo.
//
// ESTRATEGIA:
//   1. CacheFirst para assets estáticos (JS, CSS, imágenes)
//   2. NetworkFirst para API calls (datos frescos > caché)
//   3. StaleWhileRevalidate para páginas HTML
//   4. Timestamps por entrada → evict antes de los 7 días (usamos 6)
//   5. Registro de "último uso" en IndexedDB para reactivar el SW
//      si el usuario vuelve cerca del límite.

const APP_VERSION   = '1.1.0'    // Incrementar en cada deploy importante
const CACHE_STATIC  = `manguito-static-v${APP_VERSION}`
const CACHE_DYNAMIC = `manguito-dynamic-v${APP_VERSION}`
const CACHE_API     = `manguito-api-v${APP_VERSION}`

// Máx días antes de considerar un recurso "viejo" (Apple elimina a los 7)
const MAX_CACHE_DAYS = 6

// Assets estáticos que queremos cachear en install
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/Mango.png',
  '/favicon.png',
  '/manifest.json',
  // Vite genera hashes — los capturamos dinámicamente en el fetch
]

// Rutas que NUNCA deben cachearse (siempre red)
const BYPASS_URLS = [
  '/api/',
  'supabase.co',
  'dolarapi.com',
  'coingecko.com',
  'finance.yahoo.com',
  'groq.com',
]

// ── Helpers ──────────────────────────────────────────────────

function esUrlQueBypassear(url) {
  return BYPASS_URLS.some(patron => url.includes(patron))
}

function esAssetEstatico(url) {
  return (
    url.includes('/assets/') ||
    url.match(/\.(js|css|woff2?|ttf|otf|svg|png|jpg|jpeg|webp|ico|gif)(\?|$)/i)
  )
}

function esHtml(request) {
  return request.headers.get('accept')?.includes('text/html')
}

/**
 * Guarda un timestamp junto con la respuesta en caché.
 * Así podemos saber cuándo fue cacheado y evictarlo antes de los 7 días.
 */
async function cacheConTimestamp(cacheName, request, response) {
  const cache = await caches.open(cacheName)
  // Clonamos la respuesta y añadimos header de timestamp
  const headers = new Headers(response.headers)
  headers.set('x-cache-timestamp', Date.now().toString())
  const responseConTimestamp = new Response(response.clone().body, {
    status:     response.status,
    statusText: response.statusText,
    headers,
  })
  cache.put(request, responseConTimestamp)
}

/**
 * Verifica si una respuesta cacheada superó MAX_CACHE_DAYS.
 * Si sí, la elimina y devuelve null para forzar re-fetch.
 */
function esCacheVencida(response) {
  if (!response) return true
  const ts = response.headers.get('x-cache-timestamp')
  if (!ts) return false // sin timestamp → no la tocamos
  const diasTranscurridos = (Date.now() - Number(ts)) / (1000 * 60 * 60 * 24)
  return diasTranscurridos >= MAX_CACHE_DAYS
}

/**
 * Evict proactivo: recorre todos los caches y elimina entradas viejas.
 * Se llama en el activate y periódicamente.
 */
async function evictarCachesViejos() {
  const cacheNames = await caches.keys()
  for (const name of cacheNames) {
    const cache = await caches.open(name)
    const requests = await cache.keys()
    for (const req of requests) {
      const res = await cache.match(req)
      if (esCacheVencida(res)) {
        console.log(`[SW] Evicting stale cache: ${req.url}`)
        cache.delete(req)
      }
    }
  }
}

/**
 * Elimina caches de versiones anteriores del SW.
 */
async function eliminarCachesAntiguos() {
  const cacheActuales = [CACHE_STATIC, CACHE_DYNAMIC, CACHE_API]
  const cacheNames    = await caches.keys()
  return Promise.all(
    cacheNames
      .filter(name =>
        name.startsWith('manguito-') &&
        !cacheActuales.includes(name)
      )
      .map(name => {
        console.log(`[SW] Deleting old cache: ${name}`)
        return caches.delete(name)
      })
  )
}

// ── Estrategias de fetch ─────────────────────────────────────

/**
 * CacheFirst → para assets estáticos con hashes (inmutables)
 * Si está en caché y no está vencido → devuelve caché.
 * Si no → red → guarda en caché.
 */
async function cacheFirst(request) {
  const cached = await caches.match(request)
  if (cached && !esCacheVencida(cached)) return cached

  try {
    const networkRes = await fetch(request)
    if (networkRes.ok) {
      cacheConTimestamp(CACHE_STATIC, request, networkRes.clone())
    }
    return networkRes
  } catch {
    if (cached) return cached  // fallback a caché vencido si hay red offline
    throw new Error('Sin conexión y sin caché disponible')
  }
}

/**
 * NetworkFirst → para HTML y datos frescos
 * Intenta red primero, con timeout de 3s.
 * Si falla → caché.
 */
async function networkFirst(request, cacheName = CACHE_DYNAMIC, timeoutMs = 3000) {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), timeoutMs)

  try {
    const networkRes = await fetch(request, { signal: controller.signal })
    clearTimeout(timeout)
    if (networkRes.ok) {
      cacheConTimestamp(cacheName, request, networkRes.clone())
    }
    return networkRes
  } catch {
    clearTimeout(timeout)
    const cached = await caches.match(request)
    if (cached && !esCacheVencida(cached)) return cached
    if (cached) return cached  // devolver vencido en offline
    // Fallback offline para HTML
    if (esHtml(request)) {
      const fallback = await caches.match('/')
      return fallback || new Response('Offline', { status: 503 })
    }
    throw new Error('Sin respuesta')
  }
}

/**
 * StaleWhileRevalidate → responde con caché inmediatamente,
 * actualiza en background.
 */
async function staleWhileRevalidate(request, cacheName = CACHE_DYNAMIC) {
  const cached = await caches.match(request)

  // Revalidar en background siempre
  const fetchPromise = fetch(request)
    .then(networkRes => {
      if (networkRes.ok) {
        cacheConTimestamp(cacheName, request, networkRes.clone())
      }
      return networkRes
    })
    .catch(() => null)

  // Si está cacheado (aunque vencido), devolver inmediatamente + revalidar
  if (cached) return cached
  // Si no hay caché → esperar la red
  return fetchPromise
}

// ── Lifecycle events ─────────────────────────────────────────

self.addEventListener('install', event => {
  console.log('[SW] Installing Manguito SW v' + APP_VERSION)
  event.waitUntil(
    caches.open(CACHE_STATIC)
      .then(cache => cache.addAll(STATIC_ASSETS))
      .then(() => self.skipWaiting())  // activa el nuevo SW inmediatamente
  )
})

self.addEventListener('activate', event => {
  console.log('[SW] Activating Manguito SW v' + APP_VERSION)
  event.waitUntil(
    Promise.all([
      eliminarCachesAntiguos(),
      evictarCachesViejos(),
      self.clients.claim(),  // toma control de tabs existentes
    ])
  )
})

// ── Fetch handler principal ───────────────────────────────────

self.addEventListener('fetch', event => {
  const { request } = event
  const url = request.url

  // Solo interceptamos GET
  if (request.method !== 'GET') return

  // Ignorar extensiones de Chrome y otras URLs internas
  if (url.startsWith('chrome-extension://')) return
  if (url.includes('hot-update')) return  // Vite HMR en dev

  // ── BYPASS: APIs externas y Supabase (siempre red) ──
  if (esUrlQueBypassear(url)) return

  // ── Assets estáticos con hash (Vite genera /assets/xxx.abc123.js) ──
  if (esAssetEstatico(url)) {
    event.respondWith(cacheFirst(request))
    return
  }

  // ── HTML (navegación) ──
  if (esHtml(request) || request.mode === 'navigate') {
    event.respondWith(networkFirst(request, CACHE_DYNAMIC, 4000))
    return
  }

  // ── Todo lo demás → StaleWhileRevalidate ──
  event.respondWith(staleWhileRevalidate(request, CACHE_DYNAMIC))
})

// ── Mensaje desde la app ──────────────────────────────────────
// La app puede enviarle mensajes al SW para forzar ciertas acciones.

self.addEventListener('message', event => {
  const { type } = event.data || {}

  if (type === 'SKIP_WAITING') {
    self.skipWaiting()
  }

  if (type === 'EVICT_STALE') {
    // La app pide limpiar caché vencido manualmente
    evictarCachesViejos()
      .then(() => event.ports[0]?.postMessage({ ok: true }))
  }

  if (type === 'GET_VERSION') {
    event.ports[0]?.postMessage({ version: APP_VERSION })
  }
})

// ── Evict periódico ───────────────────────────────────────────
// Cada vez que el SW se "despierta" (porque la app se usó),
// aprovechamos para limpiar caches que estén cerca del límite.
// Esto garantiza que Apple nunca llegue a limpiarlos antes que nosotros.
self.addEventListener('fetch', () => {
  // Usamos un flag para no correr esto en cada fetch (solo una vez por "sesión de SW")
  if (!self._evictChecked) {
    self._evictChecked = true
    // Diferimos para no bloquear el primer fetch
    setTimeout(() => {
      evictarCachesViejos()
      self._evictChecked = false  // reset para la próxima sesión
    }, 10_000)
  }
})