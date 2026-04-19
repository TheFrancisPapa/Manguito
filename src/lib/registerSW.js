// src/lib/registerSW.js
// Registro del Service Worker con manejo de actualizaciones
// y comunicación bidireccional con el SW.

/**
 * Registra el Service Worker y configura:
 * - Detección de actualizaciones disponibles
 * - Evict periódico de caché (para el límite de 7 días de Apple)
 * - Notificación al usuario cuando hay una versión nueva
 */
export async function registerServiceWorker() {
  if (!('serviceWorker' in navigator)) {
    console.log('[SW] Service Worker no soportado en este browser')
    return null
  }

  try {
    const registration = await navigator.serviceWorker.register('/sw.js', {
      scope: '/',
      // updateViaCache: 'none' fuerza que el browser siempre verifique
      // si hay una versión nueva del sw.js, ignorando HTTP cache.
      // Crítico para iOS: sin esto, el SW viejo puede persistir indefinidamente.
      updateViaCache: 'none',
    })

    console.log('[SW] Registrado con scope:', registration.scope)

    // ── Detectar cuando hay un nuevo SW esperando ──────────────
    registration.addEventListener('updatefound', () => {
      const nuevoSW = registration.installing

      nuevoSW?.addEventListener('statechange', () => {
        if (
          nuevoSW.state === 'installed' &&
          navigator.serviceWorker.controller
        ) {
          // Hay un nuevo SW listo — notificar a la app
          window.dispatchEvent(
            new CustomEvent('sw:update-available', { detail: { registration } })
          )
          console.log('[SW] Nueva versión disponible')
        }
      })
    })

    // ── Verificar actualización al volver a la app (iOS: tab switching) ──
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') {
        registration.update()
          .then(() => console.log('[SW] Actualización verificada al volver'))
          .catch(() => {})

        // También pedimos al SW que evict caches viejos
        ping('EVICT_STALE')
      }
    })

    // ── Evict periódico: cada 12 horas de uso activo ──────────
    const EVICT_INTERVAL = 12 * 60 * 60 * 1000
    setInterval(() => ping('EVICT_STALE'), EVICT_INTERVAL)

    return registration
  } catch (error) {
    console.error('[SW] Error al registrar:', error)
    return null
  }
}

/**
 * Envía un mensaje al Service Worker activo.
 * @param {string} type - Tipo de mensaje (ej: 'EVICT_STALE', 'SKIP_WAITING')
 * @param {Object} [data] - Datos adicionales
 * @returns {Promise<any>} Respuesta del SW (si usa MessageChannel)
 */
export function ping(type, data = {}) {
  return new Promise((resolve) => {
    const controller = navigator.serviceWorker.controller
    if (!controller) return resolve(null)

    const channel = new MessageChannel()
    channel.port1.onmessage = ({ data }) => resolve(data)

    controller.postMessage({ type, ...data }, [channel.port2])
  })
}

/**
 * Activa el nuevo Service Worker que está esperando (skipWaiting).
 * Llamar cuando el usuario acepta actualizar la app.
 * @param {ServiceWorkerRegistration} registration
 */
export function activarActualizacion(registration) {
  const waiting = registration?.waiting
  if (!waiting) return

  waiting.postMessage({ type: 'SKIP_WAITING' })

  // Recargar cuando el nuevo SW tome el control
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    window.location.reload()
  }, { once: true })
}

// ── manifest.json config recomendada ─────────────────────────
// Guardar como /public/manifest.json
export const MANIFEST_CONFIG = {
  name: 'Manguito 🥭',
  short_name: 'Manguito',
  description: 'Tu asistente de finanzas personales para Argentina',
  start_url: '/',
  display: 'standalone',
  // 'standalone' en iOS hace que la PWA se vea como una app nativa
  // sin la barra de URL de Safari

  orientation: 'portrait',
  theme_color: '#F5A623',
  background_color: '#FEFAF4',

  // Íconos — iOS usa apple-touch-icon del HTML, ignorar este array para iOS
  // pero es necesario para Android y otras plataformas
  icons: [
    { src: '/favicon.png',        sizes: '192x192', type: 'image/png' },
    { src: '/Mango.png',          sizes: '512x512', type: 'image/png' },
    { src: '/Mango.png',          sizes: '512x512', type: 'image/png', purpose: 'maskable' },
  ],

  // Categories ayuda a los stores de PWA a categorizarla
  categories: ['finance', 'productivity'],
}