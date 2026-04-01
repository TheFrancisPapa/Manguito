/**
 * Catálogo de suscripciones digitales disponibles en Argentina
 * con precios en pesos argentinos (Mercado Pago).
 *
 * Estructura:
 *   - Cada objeto representa UN SERVICIO (Netflix, Spotify, etc.)
 *   - Dentro de `planes` están los distintos niveles con sus precios
 *   - `imagen` está preparada para que le agregues la ruta del logo oficial
 *
 * Método de pago: Mercado Pago (ARS)
 * null = sin precio cargado aún (la comunidad puede agregarlo)
 * Última actualización de base: Abril 2025
 */

export const METODOS_PAGO = [
  { id: 'ars_mp', label: 'Mercado Pago', emoji: '💙', moneda: 'ARS', tipo: 'digital' },
]

export const CICLOS_DISPONIBLES = [
  { id: 'mensual',    label: 'Mensual' },
  { id: 'trimestral', label: 'Trimestral (3 meses)' },
  { id: 'semestral',  label: 'Semestral (6 meses)' },
  { id: 'anual',      label: 'Anual' },
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
    imagen:      null,
    planes: [
      {
        id:          'netflix-basico',
        nombre:      'Básico con anuncios',
        descripcion: 'Plan con publicidad. HD disponible.',
        precios: { ars_mp: 4699 },
      },
      {
        id:          'netflix-estandar',
        nombre:      'Estándar',
        descripcion: 'Full HD, 2 dispositivos. Sin publicidad.',
        precios: { ars_mp: 7199 },
      },
      {
        id:          'netflix-premium',
        nombre:      'Premium',
        descripcion: '4K Ultra HD, 4 dispositivos, audio espacial.',
        precios: { ars_mp: 10499 },
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
    imagen:    null,
    planes: [
      {
        id:          'disney-plus-estandar',
        nombre:      'Estándar',
        descripcion: 'Disney, Marvel, Star Wars, Pixar y National Geographic.',
        precios: { ars_mp: 4299 },
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
    imagen:    null,
    planes: [
      {
        id:          'hbo-max-basico',
        nombre:      'Con publicidad',
        descripcion: 'HBO, Warner, DC y más. Con anuncios.',
        precios: { ars_mp: 3499 },
      },
      {
        id:          'hbo-max-premium',
        nombre:      'Ultimate',
        descripcion: '4K, sin publicidad, 4 dispositivos.',
        precios: { ars_mp: 6499 },
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
    imagen:    null,
    planes: [
      {
        id:          'amazon-prime-estandar',
        nombre:      'Prime',
        descripcion: 'Prime Video + envíos gratis en Amazon.',
        precios: { ars_mp: null },
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
    imagen:    null,
    planes: [
      {
        id:          'apple-tv-estandar',
        nombre:      'Estándar',
        descripcion: 'Series y películas originales de Apple.',
        precios: { ars_mp: null },
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
    imagen:    null,
    planes: [
      {
        id:          'star-plus-combo',
        nombre:      'Combo',
        descripcion: 'Disney + Star+ combinados. ESPN incluido.',
        precios: { ars_mp: 7699 },
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
    imagen:    null,
    planes: [
      {
        id:          'paramountplus-esencial',
        nombre:      'Esencial',
        descripcion: 'Series, películas y deportes CBS.',
        precios: { ars_mp: 2799 },
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
    imagen:    null,
    planes: [
      {
        id:          'youtube-premium-individual',
        nombre:      'Individual',
        descripcion: 'Sin anuncios, reproducción en segundo plano, downloads.',
        precios: { ars_mp: 2899 },
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
    imagen:    null,
    planes: [
      {
        id:          'spotify-individual',
        nombre:      'Individual',
        descripcion: 'Música sin límites, sin anuncios.',
        precios: { ars_mp: 3699 },
      },
      {
        id:          'spotify-duo',
        nombre:      'Duo',
        descripcion: '2 cuentas premium. Deben vivir juntas.',
        precios: { ars_mp: 4899 },
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
    imagen:    null,
    planes: [
      {
        id:          'youtube-music-premium',
        nombre:      'Premium',
        descripcion: 'Música sin anuncios + YouTube Premium incluido.',
        precios: { ars_mp: 2899 },
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
    imagen:    null,
    planes: [
      {
        id:          'apple-music-individual',
        nombre:      'Individual',
        descripcion: '100M de canciones, audio espacial Dolby.',
        precios: { ars_mp: null },
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
    imagen:    null,
    planes: [
      {
        id:          'icloud-50gb',
        nombre:      '50 GB',
        descripcion: 'Almacenamiento de fotos, docs y backup en Apple.',
        precios: { ars_mp: null },
      },
      {
        id:          'icloud-200gb',
        nombre:      '200 GB',
        descripcion: '200 GB compartibles con hasta 5 personas.',
        precios: { ars_mp: null },
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
    imagen:    null,
    planes: [
      {
        id:          'google-one-100gb',
        nombre:      '100 GB',
        descripcion: 'Google Drive, Gmail y Fotos compartidos.',
        precios: { ars_mp: 999 },
      },
      {
        id:          'google-one-2tb',
        nombre:      '2 TB',
        descripcion: '2 TB de almacenamiento en Google.',
        precios: { ars_mp: 5999 },
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
    imagen:    null,
    planes: [
      {
        id:          'dropbox-plus',
        nombre:      'Plus',
        descripcion: '2 TB de almacenamiento en la nube.',
        precios: { ars_mp: null },
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
    imagen:    null,
    planes: [
      {
        id:          'chatgpt-plus',
        nombre:      'Plus',
        descripcion: 'GPT-4o ilimitado, DALL-E, análisis de archivos.',
        precios: { ars_mp: null },
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
    imagen:    null,
    planes: [
      {
        id:          'claude-pro',
        nombre:      'Pro',
        descripcion: 'Claude Opus y Sonnet ilimitados, Projects.',
        precios: { ars_mp: null },
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
    imagen:    null,
    planes: [
      {
        id:          'microsoft-365-personal',
        nombre:      'Personal',
        descripcion: 'Word, Excel, PowerPoint + 1 TB OneDrive.',
        precios: { ars_mp: 4699 },
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
    imagen:    null,
    planes: [
      {
        id:          'notion-plus',
        nombre:      'Plus',
        descripcion: 'Bloques ilimitados, invitados, historial 30 días.',
        precios: { ars_mp: null },
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
    imagen:    null,
    planes: [
      {
        id:          'adobe-cc-todas',
        nombre:      'Todas las apps',
        descripcion: 'Photoshop, Illustrator, Premiere y más de 20 apps.',
        precios: { ars_mp: null },
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
    imagen:    null,
    planes: [
      {
        id:          'canva-pro',
        nombre:      'Pro',
        descripcion: 'Diseño ilimitado, marca kit, fondo remover.',
        precios: { ars_mp: 6999 },
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
    imagen:    null,
    planes: [
      {
        id:          'xbox-game-pass-ultimate',
        nombre:      'Ultimate',
        descripcion: 'Más de 100 juegos, Xbox Cloud Gaming y EA Play.',
        precios: { ars_mp: 4699 },
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
    imagen:    null,
    planes: [
      {
        id:          'playstation-plus-essential',
        nombre:      'Essential',
        descripcion: 'Juegos mensuales, multijugador online.',
        precios: { ars_mp: 4399 },
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
    imagen:    null,
    planes: [
      {
        id:          'nintendo-online-individual',
        nombre:      'Individual',
        descripcion: 'Multijugador online, juegos NES/SNES clásicos.',
        precios: { ars_mp: null },
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
    imagen:    null,
    planes: [
      {
        id:          'espn-premium-anual',
        nombre:      'Anual',
        descripcion: 'Fútbol, tenis, NBA y más deportes en vivo.',
        precios: { ars_mp: 2999 },
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
    imagen:    null,
    planes: [
      {
        id:          'directv-go-futbol',
        nombre:      'Pack Fútbol',
        descripcion: 'ESPN, Fox Sports, TNT Sports y más en streaming.',
        precios: { ars_mp: 8999 },
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
    imagen:    null,
    planes: [
      {
        id:          'duolingo-super',
        nombre:      'Super',
        descripcion: 'Aprende idiomas sin anuncios, con corazones ilimitados.',
        precios: { ars_mp: 3999 },
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
    imagen:    null,
    planes: [
      {
        id:          'coursera-plus',
        nombre:      'Plus',
        descripcion: 'Acceso a +7,000 cursos de universidades top del mundo.',
        precios: { ars_mp: null },
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
    imagen:    null,
    planes: [
      {
        id:          'nordvpn-plus',
        nombre:      'Plus',
        descripcion: 'VPN + gestión de contraseñas + protección de datos.',
        precios: { ars_mp: null },
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
    imagen:    null,
    planes: [
      {
        id:          '1password-individual',
        nombre:      'Individual',
        descripcion: 'Gestor de contraseñas con vault ilimitado.',
        precios: { ars_mp: null },
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