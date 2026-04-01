/**
 * Catálogo de suscripciones digitales disponibles en Argentina
 * con precios por método de pago, agrupados por servicio.
 *
 * Estructura:
 *   - Cada objeto representa UN SERVICIO (Netflix, Spotify, etc.)
 *   - Dentro de `planes` están los distintos niveles con sus precios
 *   - `imagen` está preparada para que le agregues la ruta del logo oficial
 *
 * Métodos de pago soportados:
 *   ars_mp       → Mercado Pago (ARS)
 *   ars_debito   → Tarjeta de débito local (ARS)
 *   ars_credito  → Tarjeta de crédito 1 cuota (ARS, incluye impuestos PAIS/percepción)
 *   usd_astropay → AstroPay / tarjeta prepaga USD
 *   usd_wise     → Wise / tarjeta internacional USD
 *   usd_cripto   → Cripto (USDT/USDC)
 *
 * null = no disponible con ese método
 * Última actualización de base: Marzo 2025
 */

export const METODOS_PAGO = [
  { id: 'ars_mp',       label: 'Mercado Pago',            emoji: '💙', moneda: 'ARS', tipo: 'digital' },
  { id: 'ars_debito',   label: 'Débito local',            emoji: '🏦', moneda: 'ARS', tipo: 'banco' },
  { id: 'ars_credito',  label: 'Crédito (con impuestos)', emoji: '💳', moneda: 'ARS', tipo: 'banco' },
  { id: 'usd_astropay', label: 'AstroPay / Prepaga USD',  emoji: '🟣', moneda: 'USD', tipo: 'prepaga' },
  { id: 'usd_wise',     label: 'Wise / Tarjeta USD',      emoji: '🌐', moneda: 'USD', tipo: 'internacional' },
  { id: 'usd_dolarapp', label: 'DolarApp',                emoji: '💲', moneda: 'USD', tipo: 'prepaga' },
  { id: 'usd_cripto',   label: 'Cripto (USDT/USDC)',      emoji: '₿',  moneda: 'USD', tipo: 'cripto' },
]

export const CATALOGO_SUSCRIPCIONES = [

  // ── STREAMING VIDEO ──────────────────────────────────────────
  {
    id:          'netflix',
    nombre:      'Netflix',
    icono:       '🎬',
    color:       '#E50914',
    categoria:   'streaming',
    ciclo:       'mensual',
    url:         'https://netflix.com',
    imagen:      null, // Ej: '/logos/netflix.png'
    planes: [
      {
        id:          'netflix-basico',
        nombre:      'Básico con anuncios',
        descripcion: 'Plan con publicidad. HD disponible.',
        precios: {
          ars_mp:       4699,
          ars_debito:   4699,
          ars_credito:  5639,
          usd_astropay: null,
          usd_wise:     null,
          usd_dolarapp: null,
          usd_cripto:   null,
        },
      },
      {
        id:          'netflix-estandar',
        nombre:      'Estándar',
        descripcion: 'Full HD, 2 dispositivos. Sin publicidad.',
        precios: {
          ars_mp:       7199,
          ars_debito:   7199,
          ars_credito:  8639,
          usd_astropay: 15.49,
          usd_wise:     15.49,
          usd_dolarapp: null,
          usd_cripto:   15.49,
        },
      },
      {
        id:          'netflix-premium',
        nombre:      'Premium',
        descripcion: '4K Ultra HD, 4 dispositivos, audio espacial.',
        precios: {
          ars_mp:       10499,
          ars_debito:   10499,
          ars_credito:  12599,
          usd_astropay: 22.99,
          usd_wise:     22.99,
          usd_dolarapp: null,
          usd_cripto:   22.99,
        },
      },
    ],
  },

  {
    id:        'disney-plus',
    nombre:    'Disney+',
    icono:     '✨',
    color:     '#113CCF',
    categoria: 'streaming',
    ciclo:     'mensual',
    url:       'https://disneyplus.com',
    imagen:    null, // Ej: '/logos/disney-plus.png'
    planes: [
      {
        id:          'disney-plus-estandar',
        nombre:      'Estándar',
        descripcion: 'Disney, Marvel, Star Wars, Pixar y National Geographic.',
        precios: {
          ars_mp:       4299,
          ars_debito:   4299,
          ars_credito:  5159,
          usd_astropay: 7.99,
          usd_wise:     7.99,
          usd_cripto:   7.99,
        },
      },
    ],
  },

  {
    id:        'max',
    nombre:    'Max (HBO)',
    icono:     '🎭',
    color:     '#5822FF',
    categoria: 'streaming',
    ciclo:     'mensual',
    url:       'https://max.com',
    imagen:    null, // Ej: '/logos/max.png'
    planes: [
      {
        id:          'hbo-max-basico',
        nombre:      'Con publicidad',
        descripcion: 'HBO, Warner, DC y más. Con anuncios.',
        precios: {
          ars_mp:       3499,
          ars_debito:   3499,
          ars_credito:  4199,
          usd_astropay: null,
          usd_wise:     null,
          usd_cripto:   null,
        },
      },
      {
        id:          'hbo-max-premium',
        nombre:      'Ultimate',
        descripcion: '4K, sin publicidad, 4 dispositivos.',
        precios: {
          ars_mp:       6499,
          ars_debito:   6499,
          ars_credito:  7799,
          usd_astropay: 15.99,
          usd_wise:     15.99,
          usd_cripto:   15.99,
        },
      },
    ],
  },

  {
    id:        'amazon-prime',
    nombre:    'Amazon Prime',
    icono:     '📦',
    color:     '#FF9900',
    categoria: 'streaming',
    ciclo:     'mensual',
    url:       'https://primevideo.com',
    imagen:    null, // Ej: '/logos/amazon-prime.png'
    planes: [
      {
        id:          'amazon-prime-estandar',
        nombre:      'Prime',
        descripcion: 'Prime Video + envíos gratis en Amazon.',
        precios: {
          ars_mp:       null,
          ars_debito:   null,
          ars_credito:  null,
          usd_astropay: 8.99,
          usd_wise:     8.99,
          usd_cripto:   8.99,
        },
      },
    ],
  },

  {
    id:        'apple-tv',
    nombre:    'Apple TV+',
    icono:     '🍎',
    color:     '#555555',
    categoria: 'streaming',
    ciclo:     'mensual',
    url:       'https://tv.apple.com',
    imagen:    null, // Ej: '/logos/apple-tv.png'
    planes: [
      {
        id:          'apple-tv-estandar',
        nombre:      'Estándar',
        descripcion: 'Series y películas originales de Apple.',
        precios: {
          ars_mp:       null,
          ars_debito:   null,
          ars_credito:  null,
          usd_astropay: 9.99,
          usd_wise:     9.99,
          usd_cripto:   9.99,
        },
      },
    ],
  },

  {
    id:        'star-plus',
    nombre:    'Star+',
    icono:     '⭐',
    color:     '#E31F30',
    categoria: 'streaming',
    ciclo:     'mensual',
    url:       'https://starplus.com',
    imagen:    null, // Ej: '/logos/star-plus.png'
    planes: [
      {
        id:          'star-plus-combo',
        nombre:      'Combo',
        descripcion: 'Disney + Star+ combinados. ESPN incluido.',
        precios: {
          ars_mp:       7699,
          ars_debito:   7699,
          ars_credito:  9239,
          usd_astropay: null,
          usd_wise:     null,
          usd_cripto:   null,
        },
      },
    ],
  },

  {
    id:        'paramountplus',
    nombre:    'Paramount+',
    icono:     '⛰️',
    color:     '#0064FF',
    categoria: 'streaming',
    ciclo:     'mensual',
    url:       'https://paramountplus.com',
    imagen:    null, // Ej: '/logos/paramount-plus.png'
    planes: [
      {
        id:          'paramountplus-esencial',
        nombre:      'Esencial',
        descripcion: 'Series, películas y deportes CBS.',
        precios: {
          ars_mp:       2799,
          ars_debito:   2799,
          ars_credito:  3359,
          usd_astropay: 5.99,
          usd_wise:     5.99,
          usd_cripto:   5.99,
        },
      },
    ],
  },

  {
    id:        'youtube-premium',
    nombre:    'YouTube Premium',
    icono:     '▶️',
    color:     '#FF0000',
    categoria: 'streaming',
    ciclo:     'mensual',
    url:       'https://youtube.com/premium',
    imagen:    null, // Ej: '/logos/youtube.png'
    planes: [
      {
        id:          'youtube-premium-individual',
        nombre:      'Individual',
        descripcion: 'Sin anuncios, reproducción en segundo plano, downloads.',
        precios: {
          ars_mp:       2899,
          ars_debito:   2899,
          ars_credito:  3479,
          usd_astropay: null,
          usd_wise:     null,
          usd_cripto:   null,
        },
      },
    ],
  },

  // ── MÚSICA ────────────────────────────────────────────────────
  {
    id:        'spotify',
    nombre:    'Spotify',
    icono:     '🎵',
    color:     '#1DB954',
    categoria: 'musica',
    ciclo:     'mensual',
    url:       'https://spotify.com',
    imagen:    null, // Ej: '/logos/spotify.png'
    planes: [
      {
        id:          'spotify-individual',
        nombre:      'Individual',
        descripcion: 'Música sin límites, sin anuncios.',
        precios: {
          ars_mp:       3699,
          ars_debito:   3699,
          ars_credito:  4439,
          usd_astropay: null,
          usd_wise:     null,
          usd_cripto:   null,
        },
      },
      {
        id:          'spotify-duo',
        nombre:      'Duo',
        descripcion: '2 cuentas premium. Deben vivir juntas.',
        precios: {
          ars_mp:       4899,
          ars_debito:   4899,
          ars_credito:  5879,
          usd_astropay: null,
          usd_wise:     null,
          usd_cripto:   null,
        },
      },
    ],
  },

  {
    id:        'youtube-music',
    nombre:    'YouTube Music',
    icono:     '🎼',
    color:     '#FF0000',
    categoria: 'musica',
    ciclo:     'mensual',
    url:       'https://music.youtube.com',
    imagen:    null, // Ej: '/logos/youtube-music.png'
    planes: [
      {
        id:          'youtube-music-premium',
        nombre:      'Premium',
        descripcion: 'Música sin anuncios + YouTube Premium incluido.',
        precios: {
          ars_mp:       2899,
          ars_debito:   2899,
          ars_credito:  3479,
          usd_astropay: null,
          usd_wise:     null,
          usd_cripto:   null,
        },
      },
    ],
  },

  {
    id:        'apple-music',
    nombre:    'Apple Music',
    icono:     '🎶',
    color:     '#FC3C44',
    categoria: 'musica',
    ciclo:     'mensual',
    url:       'https://music.apple.com',
    imagen:    null, // Ej: '/logos/apple-music.png'
    planes: [
      {
        id:          'apple-music-individual',
        nombre:      'Individual',
        descripcion: '100M de canciones, audio espacial Dolby.',
        precios: {
          ars_mp:       null,
          ars_debito:   null,
          ars_credito:  null,
          usd_astropay: 10.99,
          usd_wise:     10.99,
          usd_cripto:   10.99,
        },
      },
    ],
  },

  // ── NUBE Y STORAGE ─────────────────────────────────────────────
  {
    id:        'icloud',
    nombre:    'iCloud+',
    icono:     '☁️',
    color:     '#3478F6',
    categoria: 'nube',
    ciclo:     'mensual',
    url:       'https://icloud.com',
    imagen:    null, // Ej: '/logos/icloud.png'
    planes: [
      {
        id:          'icloud-50gb',
        nombre:      '50 GB',
        descripcion: 'Almacenamiento de fotos, docs y backup en Apple.',
        precios: {
          ars_mp:       null,
          ars_debito:   null,
          ars_credito:  null,
          usd_astropay: 0.99,
          usd_wise:     0.99,
          usd_cripto:   0.99,
        },
      },
      {
        id:          'icloud-200gb',
        nombre:      '200 GB',
        descripcion: '200 GB compartibles con hasta 5 personas.',
        precios: {
          ars_mp:       null,
          ars_debito:   null,
          ars_credito:  null,
          usd_astropay: 2.99,
          usd_wise:     2.99,
          usd_cripto:   2.99,
        },
      },
    ],
  },

  {
    id:        'google-one',
    nombre:    'Google One',
    icono:     '🔵',
    color:     '#4285F4',
    categoria: 'nube',
    ciclo:     'mensual',
    url:       'https://one.google.com',
    imagen:    null, // Ej: '/logos/google-one.png'
    planes: [
      {
        id:          'google-one-100gb',
        nombre:      '100 GB',
        descripcion: 'Google Drive, Gmail y Fotos compartidos.',
        precios: {
          ars_mp:       999,
          ars_debito:   999,
          ars_credito:  1199,
          usd_astropay: 1.99,
          usd_wise:     1.99,
          usd_cripto:   1.99,
        },
      },
      {
        id:          'google-one-2tb',
        nombre:      '2 TB',
        descripcion: '2 TB de almacenamiento en Google.',
        precios: {
          ars_mp:       5999,
          ars_debito:   5999,
          ars_credito:  7199,
          usd_astropay: 9.99,
          usd_wise:     9.99,
          usd_cripto:   9.99,
        },
      },
    ],
  },

  {
    id:        'dropbox',
    nombre:    'Dropbox',
    icono:     '📦',
    color:     '#0061FE',
    categoria: 'nube',
    ciclo:     'mensual',
    url:       'https://dropbox.com',
    imagen:    null, // Ej: '/logos/dropbox.png'
    planes: [
      {
        id:          'dropbox-plus',
        nombre:      'Plus',
        descripcion: '2 TB de almacenamiento en la nube.',
        precios: {
          ars_mp:       null,
          ars_debito:   null,
          ars_credito:  null,
          usd_astropay: 11.99,
          usd_wise:     11.99,
          usd_cripto:   11.99,
        },
      },
    ],
  },

  // ── IA Y PRODUCTIVIDAD ──────────────────────────────────────────
  {
    id:        'chatgpt',
    nombre:    'ChatGPT',
    icono:     '🤖',
    color:     '#10A37F',
    categoria: 'ia',
    ciclo:     'mensual',
    url:       'https://chat.openai.com',
    imagen:    null, // Ej: '/logos/chatgpt.png'
    planes: [
      {
        id:          'chatgpt-plus',
        nombre:      'Plus',
        descripcion: 'GPT-4o ilimitado, DALL-E, análisis de archivos.',
        precios: {
          ars_mp:       null,
          ars_debito:   null,
          ars_credito:  null,
          usd_astropay: 20,
          usd_wise:     20,
          usd_cripto:   20,
        },
      },
    ],
  },

  {
    id:        'claude',
    nombre:    'Claude',
    icono:     '🟠',
    color:     '#D97706',
    categoria: 'ia',
    ciclo:     'mensual',
    url:       'https://claude.ai',
    imagen:    null, // Ej: '/logos/claude.png'
    planes: [
      {
        id:          'claude-pro',
        nombre:      'Pro',
        descripcion: 'Claude Opus y Sonnet ilimitados, Projects.',
        precios: {
          ars_mp:       null,
          ars_debito:   null,
          ars_credito:  null,
          usd_astropay: 20,
          usd_wise:     20,
          usd_cripto:   20,
        },
      },
    ],
  },

  {
    id:        'microsoft-365',
    nombre:    'Microsoft 365',
    icono:     '📊',
    color:     '#0078D4',
    categoria: 'software',
    ciclo:     'mensual',
    url:       'https://microsoft.com/m365',
    imagen:    null, // Ej: '/logos/microsoft-365.png'
    planes: [
      {
        id:          'microsoft-365-personal',
        nombre:      'Personal',
        descripcion: 'Word, Excel, PowerPoint + 1 TB OneDrive.',
        precios: {
          ars_mp:       4699,
          ars_debito:   4699,
          ars_credito:  5639,
          usd_astropay: 6.99,
          usd_wise:     6.99,
          usd_cripto:   6.99,
        },
      },
    ],
  },

  {
    id:        'notion',
    nombre:    'Notion',
    icono:     '📝',
    color:     '#000000',
    categoria: 'software',
    ciclo:     'mensual',
    url:       'https://notion.so',
    imagen:    null, // Ej: '/logos/notion.png'
    planes: [
      {
        id:          'notion-plus',
        nombre:      'Plus',
        descripcion: 'Bloques ilimitados, invitados, historial 30 días.',
        precios: {
          ars_mp:       null,
          ars_debito:   null,
          ars_credito:  null,
          usd_astropay: 10,
          usd_wise:     10,
          usd_cripto:   10,
        },
      },
    ],
  },

  {
    id:        'adobe-cc',
    nombre:    'Adobe Creative Cloud',
    icono:     '🎨',
    color:     '#FF0000',
    categoria: 'software',
    ciclo:     'mensual',
    url:       'https://adobe.com',
    imagen:    null, // Ej: '/logos/adobe.png'
    planes: [
      {
        id:          'adobe-cc-todas',
        nombre:      'Todas las apps',
        descripcion: 'Photoshop, Illustrator, Premiere y más de 20 apps.',
        precios: {
          ars_mp:       null,
          ars_debito:   null,
          ars_credito:  null,
          usd_astropay: 54.99,
          usd_wise:     54.99,
          usd_cripto:   54.99,
        },
      },
    ],
  },

  {
    id:        'canva',
    nombre:    'Canva',
    icono:     '✏️',
    color:     '#00C4CC',
    categoria: 'software',
    ciclo:     'mensual',
    url:       'https://canva.com',
    imagen:    null, // Ej: '/logos/canva.png'
    planes: [
      {
        id:          'canva-pro',
        nombre:      'Pro',
        descripcion: 'Diseño ilimitado, marca kit, fondo remover.',
        precios: {
          ars_mp:       6999,
          ars_debito:   6999,
          ars_credito:  8399,
          usd_astropay: 14.99,
          usd_wise:     14.99,
          usd_cripto:   14.99,
        },
      },
    ],
  },

  // ── GAMING ─────────────────────────────────────────────────────
  {
    id:        'xbox-game-pass',
    nombre:    'Xbox Game Pass',
    icono:     '🎮',
    color:     '#107C10',
    categoria: 'juegos',
    ciclo:     'mensual',
    url:       'https://xbox.com/gamepass',
    imagen:    null, // Ej: '/logos/xbox.png'
    planes: [
      {
        id:          'xbox-game-pass-ultimate',
        nombre:      'Ultimate',
        descripcion: 'Más de 100 juegos, Xbox Cloud Gaming y EA Play.',
        precios: {
          ars_mp:       4699,
          ars_debito:   4699,
          ars_credito:  5639,
          usd_astropay: null,
          usd_wise:     null,
          usd_cripto:   null,
        },
      },
    ],
  },

  {
    id:        'playstation-plus',
    nombre:    'PlayStation Plus',
    icono:     '🎯',
    color:     '#003087',
    categoria: 'juegos',
    ciclo:     'mensual',
    url:       'https://playstation.com/plus',
    imagen:    null, // Ej: '/logos/playstation.png'
    planes: [
      {
        id:          'playstation-plus-essential',
        nombre:      'Essential',
        descripcion: 'Juegos mensuales, multijugador online.',
        precios: {
          ars_mp:       4399,
          ars_debito:   4399,
          ars_credito:  5279,
          usd_astropay: 7.99,
          usd_wise:     7.99,
          usd_cripto:   7.99,
        },
      },
    ],
  },

  {
    id:        'nintendo-online',
    nombre:    'Nintendo Online',
    icono:     '🍄',
    color:     '#E60012',
    categoria: 'juegos',
    ciclo:     'mensual',
    url:       'https://nintendo.com/online',
    imagen:    null, // Ej: '/logos/nintendo.png'
    planes: [
      {
        id:          'nintendo-online-individual',
        nombre:      'Individual',
        descripcion: 'Multijugador online, juegos NES/SNES clásicos.',
        precios: {
          ars_mp:       null,
          ars_debito:   null,
          ars_credito:  null,
          usd_astropay: 3.99,
          usd_wise:     3.99,
          usd_cripto:   3.99,
        },
      },
    ],
  },

  // ── DEPORTES ───────────────────────────────────────────────────
  {
    id:        'espn-premium',
    nombre:    'ESPN Premium',
    icono:     '⚽',
    color:     '#CC0000',
    categoria: 'deportes',
    ciclo:     'mensual',
    url:       'https://espn.com.ar',
    imagen:    null, // Ej: '/logos/espn.png'
    planes: [
      {
        id:          'espn-premium-anual',
        nombre:      'Anual',
        descripcion: 'Fútbol, tenis, NBA y más deportes en vivo.',
        precios: {
          ars_mp:       2999,
          ars_debito:   2999,
          ars_credito:  3599,
          usd_astropay: null,
          usd_wise:     null,
          usd_cripto:   null,
        },
      },
    ],
  },

  {
    id:        'directv-go',
    nombre:    'DirecTV Go',
    icono:     '📺',
    color:     '#0097D1',
    categoria: 'deportes',
    ciclo:     'mensual',
    url:       'https://directvgo.com',
    imagen:    null, // Ej: '/logos/directv.png'
    planes: [
      {
        id:          'directv-go-futbol',
        nombre:      'Pack Fútbol',
        descripcion: 'ESPN, Fox Sports, TNT Sports y más en streaming.',
        precios: {
          ars_mp:       8999,
          ars_debito:   8999,
          ars_credito:  10799,
          usd_astropay: null,
          usd_wise:     null,
          usd_cripto:   null,
        },
      },
    ],
  },

  // ── EDUCACIÓN ─────────────────────────────────────────────────
  {
    id:        'duolingo',
    nombre:    'Duolingo',
    icono:     '🦉',
    color:     '#58CC02',
    categoria: 'educacion',
    ciclo:     'mensual',
    url:       'https://duolingo.com',
    imagen:    null, // Ej: '/logos/duolingo.png'
    planes: [
      {
        id:          'duolingo-super',
        nombre:      'Super',
        descripcion: 'Aprende idiomas sin anuncios, con corazones ilimitados.',
        precios: {
          ars_mp:       3999,
          ars_debito:   3999,
          ars_credito:  4799,
          usd_astropay: 6.99,
          usd_wise:     6.99,
          usd_cripto:   6.99,
        },
      },
    ],
  },

  {
    id:        'coursera',
    nombre:    'Coursera',
    icono:     '🎓',
    color:     '#0056D2',
    categoria: 'educacion',
    ciclo:     'mensual',
    url:       'https://coursera.org',
    imagen:    null, // Ej: '/logos/coursera.png'
    planes: [
      {
        id:          'coursera-plus',
        nombre:      'Plus',
        descripcion: 'Acceso a +7,000 cursos de universidades top del mundo.',
        precios: {
          ars_mp:       null,
          ars_debito:   null,
          ars_credito:  null,
          usd_astropay: 59,
          usd_wise:     59,
          usd_cripto:   59,
        },
      },
    ],
  },

  // ── SEGURIDAD ─────────────────────────────────────────────────
  {
    id:        'nordvpn',
    nombre:    'NordVPN',
    icono:     '🛡️',
    color:     '#4687FF',
    categoria: 'software',
    ciclo:     'mensual',
    url:       'https://nordvpn.com',
    imagen:    null, // Ej: '/logos/nordvpn.png'
    planes: [
      {
        id:          'nordvpn-plus',
        nombre:      'Plus',
        descripcion: 'VPN + gestión de contraseñas + protección de datos.',
        precios: {
          ars_mp:       null,
          ars_debito:   null,
          ars_credito:  null,
          usd_astropay: 13.99,
          usd_wise:     13.99,
          usd_cripto:   13.99,
        },
      },
    ],
  },

  {
    id:        '1password',
    nombre:    '1Password',
    icono:     '🔐',
    color:     '#1A8CFF',
    categoria: 'software',
    ciclo:     'mensual',
    url:       'https://1password.com',
    imagen:    null, // Ej: '/logos/1password.png'
    planes: [
      {
        id:          '1password-individual',
        nombre:      'Individual',
        descripcion: 'Gestor de contraseñas con vault ilimitado.',
        precios: {
          ars_mp:       null,
          ars_debito:   null,
          ars_credito:  null,
          usd_astropay: 2.99,
          usd_wise:     2.99,
          usd_cripto:   2.99,
        },
      },
    ],
  },
]

export const CATEGORIAS_CATALOGO = [
  { id: 'todos',      label: 'Todos',       emoji: '🌐' },
  { id: 'streaming',  label: 'Streaming',   emoji: '🎬' },
  { id: 'musica',     label: 'Música',      emoji: '🎵' },
  { id: 'nube',       label: 'Nube',        emoji: '☁️' },
  { id: 'ia',         label: 'IA',          emoji: '🤖' },
  { id: 'software',   label: 'Software',    emoji: '💻' },
  { id: 'juegos',     label: 'Gaming',      emoji: '🎮' },
  { id: 'deportes',   label: 'Deportes',    emoji: '⚽' },
  { id: 'educacion',  label: 'Educación',   emoji: '📚' },
]