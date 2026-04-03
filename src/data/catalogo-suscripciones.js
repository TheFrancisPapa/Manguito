/**
 * Catálogo de suscripciones digitales disponibles en Argentina
 * con precios en pesos argentinos (Mercado Pago).
 *
 * Método de pago: Mercado Pago (ARS)
 * null = sin precio cargado aún (la comunidad puede agregarlo)
 * Última actualización: Abril 2025
 *
 * NOTA: ESPN y Star+ ya no existen como servicios independientes.
 * Están integrados dentro de Disney+.
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
    id:        'netflix',
    nombre:    'Netflix',
    icono:     '🎬',
    color:     '#E50914',
    categoria: 'streaming',
    ciclo:     'mensual',
    url:       'https://netflix.com',
    imagen:    '/logos/Netflix.png',
    planes: [
      {
        id:          'netflix-basico',
        nombre:      'Básico',
        descripcion: 'Plan con publicidad. HD disponible.',
        precios: { ars_mp: 13768 },
      },
      {
        id:          'netflix-estandar',
        nombre:      'Estándar',
        descripcion: 'Full HD, 2 dispositivos. Sin publicidad.',
        precios: { ars_mp: 22948 },
      },
      {
        id:          'netflix-premium',
        nombre:      'Premium',
        descripcion: '4K Ultra HD, 4 dispositivos, audio espacial.',
        precios: { ars_mp: 30598 },
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
    imagen:    '/logos/Disney+.png',
    planes: [
      {
        id:          'disney-plus-estandar',
        nombre:      'Estándar',
        descripcion: 'Disney, Marvel, Star Wars, Pixar, National Geographic, Star+ y ESPN. Todo en uno.',
        precios: { ars_mp: null },
      },
    ],
  },

  {
    id:        'hbo-max',
    nombre:    'Hbo Max',
    icono:     '🎭',
    color:     '#5822FF',
    categoria: 'streaming',
    ciclo:     'mensual',
    url:       'https://www.hbomax.com',
    imagen:    '/logos/HBOMax.png',
    planes: [
      {
        id:          'hbo-max-basico',
        nombre:      'Básico',
        descripcion: 'HBO, Warner, DC y más. Con anuncios.',
        precios: { ars_mp: 11307 },
      },
      {
        id:          'hbo-max-estandar',
        nombre:      'Estándar',
        descripcion: 'Sin publicidad, 2 dispositivos.',
        precios: { ars_mp: 14673 },
      },
      {
        id:          'hbo-max-platino',
        nombre:      'Platino',
        descripcion: '4K, sin publicidad, 4 dispositivos.',
        precios: { ars_mp: 17580 },
      },
    ],
  },

  {
    id:        'hbo-max-anual',
    nombre:    'Max (HBO) — Anual',
    icono:     '🎭',
    color:     '#5822FF',
    categoria: 'streaming',
    ciclo:     'anual',
    url:       'https://max.com',
    imagen:    '/logos/HBOMax.png',
    planes: [
      {
        id:          'hbo-max-basico-anual',
        nombre:      'Básico Anual',
        descripcion: 'HBO, Warner, DC. Con anuncios. Pago anual.',
        precios: { ars_mp: 98670 },
      },
      {
        id:          'hbo-max-estandar-anual',
        nombre:      'Estándar Anual',
        descripcion: 'Sin publicidad, 2 dispositivos. Pago anual.',
        precios: { ars_mp: 123150 },
      },
      {
        id:          'hbo-max-platino-anual',
        nombre:      'Platino Anual',
        descripcion: '4K, sin publicidad, 4 dispositivos. Pago anual.',
        precios: { ars_mp: 146712 },
      },
    ],
  },

  {
    id:        'crunchyroll',
    nombre:    'Crunchyroll',
    icono:     '⛩️',
    color:     '#FF6600',
    categoria: 'streaming',
    ciclo:     'mensual',
    url:       'https://crunchyroll.com',
    imagen:    '/logos/Crunchyroll.png',
    planes: [
      {
        id:          'crunchyroll-fan',
        nombre:      'Fan',
        descripcion: 'Acceso a anime sin publicidad.',
        precios: { ars_mp: 7954 },
      },
      {
        id:          'crunchyroll-mega-fan',
        nombre:      'Mega Fan',
        descripcion: 'Offline + extras y beneficios adicionales.',
        precios: { ars_mp: 9331 },
      },
    ],
  },

  {
    id:        'crunchyroll-anual',
    nombre:    'Crunchyroll — Anual',
    icono:     '⛩️',
    color:     '#FF6600',
    categoria: 'streaming',
    ciclo:     'anual',
    url:       'https://crunchyroll.com',
    imagen:    '/logos/Crunchyroll.png',
    planes: [
      {
        id:          'crunchyroll-fan-anual',
        nombre:      'Fan Anual',
        descripcion: 'Pago anual con ahorro.',
        precios: { ars_mp: 57220 },
      },
      {
        id:          'crunchyroll-mega-fan-anual',
        nombre:      'Mega Fan Anual',
        descripcion: 'Pago anual con ahorro + extras.',
        precios: { ars_mp: 67165 },
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
    imagen:    '/logos/ParamountPlus.png',
    planes: [
      {
        id:          'paramountplus-estandar',
        nombre:      'Estándar',
        descripcion: 'Series, películas y deportes CBS.',
        precios: { ars_mp: 8535 },
      },
    ],
  },

  {
    id:        'paramountplus-anual',
    nombre:    'Paramount+ — Anual',
    icono:     '⛰️',
    color:     '#0064FF',
    categoria: 'streaming',
    ciclo:     'anual',
    url:       'https://paramountplus.com',
    imagen:    '/logos/ParamountPlus.png',
    planes: [
      {
        id:          'paramountplus-estandar-anual',
        nombre:      'Estándar Anual',
        descripcion: 'Pago anual con ahorro.',
        precios: { ars_mp: 76816 },
      },
    ],
  },

  {
    id:        'amazon-prime',
    nombre:    'Prime Video',
    icono:     '📦',
    color:     '#FF9900',
    categoria: 'streaming',
    ciclo:     'mensual',
    url:       'https://primevideo.com',
    imagen:    '/logos/PrimeVideo.png',
    planes: [
      {
        id:          'amazon-prime-estandar',
        nombre:      'Prime',
        descripcion: 'Prime Video + envíos gratis en Amazon.',
        precios: { ars_mp: 9943 },
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
    imagen:    '/logos/AppleTV.png',
    planes: [
      {
        id:          'apple-tv-estandar',
        nombre:      'Individual',
        descripcion: 'Series y películas originales de Apple.',
        precios: { ars_mp: 15754 },
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
    imagen:    '/logos/YouTube.png',
    planes: [
      {
        id:          'youtube-premium-lite',
        nombre:      'Lite',
        descripcion: 'Sin anuncios solo en YouTube.',
        precios: { ars_mp: 3364 },
      },
      {
        id:          'youtube-premium-individual',
        nombre:      'Individual',
        descripcion: 'Sin anuncios, reproducción en segundo plano, downloads, YouTube Music.',
        precios: { ars_mp: 5200 },
      },
      {
        id:          'youtube-premium-familiar',
        nombre:      'Familiar',
        descripcion: 'Hasta 6 miembros del grupo familiar.',
        precios: { ars_mp: 10402 },
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
    imagen:    '/logos/Spotify.png',
    planes: [
      {
        id:          'spotify-individual',
        nombre:      'Individual',
        descripcion: 'Música sin límites, sin anuncios.',
        precios: { ars_mp: 5047 },
      },
      {
        id:          'spotify-estudiantes',
        nombre:      'Estudiantes',
        descripcion: 'Descuento para estudiantes verificados.',
        precios: { ars_mp: 2752 },
      },
      {
        id:          'spotify-duo',
        nombre:      'Duo',
        descripcion: '2 cuentas premium. Deben vivir juntas.',
        precios: { ars_mp: 6730 },
      },
      {
        id:          'spotify-familiar',
        nombre:      'Familiar',
        descripcion: 'Hasta 6 cuentas. Mismo hogar.',
        precios: { ars_mp: 8413 },
      },
    ],
  },

  {
    id:        'spotify-anual',
    nombre:    'Spotify — Anual',
    icono:     '🎵',
    color:     '#1DB954',
    categoria: 'musica',
    ciclo:     'anual',
    url:       'https://spotify.com',
    imagen:    '/logos/Spotify.png',
    planes: [
      {
        id:          'spotify-individual-anual',
        nombre:      'Individual Anual',
        descripcion: 'Pago anual con ahorro.',
        precios: { ars_mp: 50475 },
      },
      {
        id:          'spotify-duo-anual',
        nombre:      'Duo Anual',
        descripcion: '2 cuentas. Pago anual.',
        precios: { ars_mp: 80616 },
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
    imagen:    '/logos/AppleMusic.png',
    planes: [
      {
        id:          'apple-music-estudiantes',
        nombre:      'Estudiantes',
        descripcion: 'Para estudiantes universitarios verificados.',
        precios: { ars_mp: 4526 },
      },
      {
        id:          'apple-music-individual',
        nombre:      'Individual',
        descripcion: '100M de canciones, audio espacial Dolby.',
        precios: { ars_mp: 7483 },
      },
      {
        id:          'apple-music-familiar',
        nombre:      'Familiar',
        descripcion: 'Hasta 6 miembros del grupo familiar.',
        precios: { ars_mp: 12487 },
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
    imagen:    '/logos/YoutubeMusic.png',
    planes: [
      {
        id:          'youtube-music-estandar',
        nombre:      'Individual',
        descripcion: 'Música sin anuncios. Incluido con YouTube Premium.',
        precios: { ars_mp: 3823 },
      },
      {
        id:          'youtube-music-familiar',
        nombre:      'Familiar',
        descripcion: 'Hasta 6 miembros del grupo familiar.',
        precios: { ars_mp: 6424 },
      },
    ],
  },

  {
    id:        'deezer',
    nombre:    'Deezer',
    icono:     '🎧',
    color:     '#A238FF',
    categoria: 'musica',
    ciclo:     'mensual',
    url:       'https://deezer.com',
    imagen:    '/logos/Deezer.png',
    planes: [
      {
        id:          'deezer-student',
        nombre:      'Student',
        descripcion: 'Para estudiantes verificados.',
        precios: { ars_mp: 1987 },
      },
      {
        id:          'deezer-premium',
        nombre:      'Premium',
        descripcion: 'Música sin anuncios, calidad HiFi.',
        precios: { ars_mp: 3823 },
      },
      {
        id:          'deezer-family',
        nombre:      'Family',
        descripcion: 'Hasta 6 miembros del grupo familiar.',
        precios: { ars_mp: 6424 },
      },
    ],
  },

  {
    id:        'deezer-anual',
    nombre:    'Deezer — Anual',
    icono:     '🎧',
    color:     '#A238FF',
    categoria: 'musica',
    ciclo:     'anual',
    url:       'https://deezer.com',
    imagen:    '/logos/Deezer.png',
    planes: [
      {
        id:          'deezer-premium-anual',
        nombre:      'Premium Anual',
        descripcion: 'Pago anual con ahorro.',
        precios: { ars_mp: 34423 },
      },
      {
        id:          'deezer-family-anual',
        nombre:      'Family Anual',
        descripcion: 'Hasta 6 miembros. Pago anual.',
        precios: { ars_mp: 57832 },
      },
    ],
  },

  {
    id:        'amazon-music',
    nombre:    'Amazon Music',
    icono:     '🎵',
    color:     '#FF9900',
    categoria: 'musica',
    ciclo:     'mensual',
    url:       'https://music.amazon.com',
    imagen:    '/logos/AmazonMusic.png',
    planes: [
      {
        id:          'amazon-music-individual',
        nombre:      'Individual',
        descripcion: 'Más de 100M de canciones sin anuncios.',
        precios: { ars_mp: 3823 },
      },
      {
        id:          'amazon-music-family',
        nombre:      'Family',
        descripcion: 'Hasta 6 miembros del grupo familiar.',
        precios: { ars_mp: 6424 },
      },
    ],
  },

  {
    id:        'tidal',
    nombre:    'Tidal',
    icono:     '🌊',
    color:     '#000000',
    categoria: 'musica',
    ciclo:     'mensual',
    url:       'https://tidal.com',
    imagen:    '/logos/Tidal.png',
    planes: [
      {
        id:          'tidal-individual',
        nombre:      'Individual',
        descripcion: 'Audio de alta fidelidad, sin anuncios.',
        precios: { ars_mp: 581 },
      },
      {
        id:          'tidal-individual-dj',
        nombre:      'Individual + DJ Extensión',
        descripcion: 'Con acceso a herramientas DJ integradas.',
        precios: { ars_mp: 872 },
      },
      {
        id:          'tidal-family',
        nombre:      'Family',
        descripcion: 'Hasta 6 miembros del grupo familiar.',
        precios: { ars_mp: 901 },
      },
    ],
  },

  // ── VIDEOJUEGOS ───────────────────────────────────────────────
  {
    id:        'playstation-plus',
    nombre:    'PlayStation Plus',
    icono:     '🎯',
    color:     '#003087',
    categoria: 'juegos',
    ciclo:     'mensual',
    url:       'https://playstation.com/plus',
    imagen:    '/logos/PlayStationPlus.png',
    planes: [
      {
        id:          'ps-plus-essential',
        nombre:      'Essential',
        descripcion: 'Juegos mensuales, multijugador online.',
        precios: { ars_mp: 14477 },
      },
      {
        id:          'ps-plus-extra',
        nombre:      'Extra',
        descripcion: 'Essential + catálogo de hasta 400 juegos PS4/PS5.',
        precios: { ars_mp: 21725 },
      },
      {
        id:          'ps-plus-deluxe',
        nombre:      'Deluxe',
        descripcion: 'Extra + clásicos PS1/PS2/PS3 y juegos de prueba.',
        precios: { ars_mp: 25348 },
      },
    ],
  },

  {
    id:        'playstation-plus-anual',
    nombre:    'PlayStation Plus — Anual',
    icono:     '🎯',
    color:     '#003087',
    categoria: 'juegos',
    ciclo:     'anual',
    url:       'https://playstation.com/plus',
    imagen:    '/logos/PlayStationPlus.png',
    planes: [
      {
        id:          'ps-plus-essential-anual',
        nombre:      'Essential Anual',
        descripcion: 'Pago anual con ahorro.',
        precios: { ars_mp: 117755 },
      },
      {
        id:          'ps-plus-extra-anual',
        nombre:      'Extra Anual',
        descripcion: 'Catálogo extendido. Pago anual.',
        precios: { ars_mp: 195666 },
      },
      {
        id:          'ps-plus-deluxe-anual',
        nombre:      'Deluxe Anual',
        descripcion: 'Todo incluido. Pago anual.',
        precios: { ars_mp: 226468 },
      },
    ],
  },

  {
    id:        'xbox-game-pass',
    nombre:    'Xbox Game Pass',
    icono:     '🎮',
    color:     '#107C10',
    categoria: 'juegos',
    ciclo:     'mensual',
    url:       'https://xbox.com/gamepass',
    imagen:    '/logos/XboxGamePass.png',
    planes: [
      {
        id:          'xbox-game-pass-essential',
        nombre:      'Essential',
        descripcion: 'Catálogo de juegos online para consola.',
        precios: { ars_mp: 11069 },
      },
      {
        id:          'xbox-game-pass-premium',
        nombre:      'Premium',
        descripcion: 'Essential + EA Play + Xbox Cloud Gaming.',
        precios: { ars_mp: 14759 },
      },
      {
        id:          'xbox-game-pass-pc',
        nombre:      'PC',
        descripcion: 'Más de 100 juegos para PC + EA Play.',
        precios: { ars_mp: 18449 },
      },
      {
        id:          'xbox-game-pass-ultimate',
        nombre:      'Ultimate',
        descripcion: 'Todo incluido: consola, PC, Cloud Gaming y EA Play.',
        precios: { ars_mp: 30749 },
      },
    ],
  },

  {
    id:        'nintendo-online',
    nombre:    'Nintendo Switch Online',
    icono:     '🍄',
    color:     '#E60012',
    categoria: 'juegos',
    ciclo:     'mensual',
    url:       'https://nintendo.com/online',
    imagen:    '/logos/NintendoOnline.png',
    planes: [
      {
        id:          'nintendo-online-individual-mensual',
        nombre:      'Individual (mensual)',
        descripcion: 'Multijugador online, juegos NES/SNES clásicos.',
        precios: { ars_mp: 7010 },
      },
    ],
  },

  {
    id:        'nintendo-online-anual',
    nombre:    'Nintendo Switch Online — Anual',
    icono:     '🍄',
    color:     '#E60012',
    categoria: 'juegos',
    ciclo:     'anual',
    url:       'https://nintendo.com/online',
    imagen:    '/logos/NintendoOnline.png',
    planes: [
      {
        id:          'nintendo-online-individual-anual',
        nombre:      'Individual Anual',
        descripcion: 'Multijugador online + juegos clásicos.',
        precios: { ars_mp: 34808 },
      },
      {
        id:          'nintendo-online-individual-expansion',
        nombre:      'Individual + Expansion Pack',
        descripcion: 'Incluye juegos N64, GameBoy, GBA y DLCs.',
        precios: { ars_mp: 87206 },
      },
      {
        id:          'nintendo-online-familiar-anual',
        nombre:      'Familiar Anual',
        descripcion: 'Hasta 8 cuentas Nintendo. Pago anual.',
        precios: { ars_mp: 60884 },
      },
      {
        id:          'nintendo-online-familiar-expansion',
        nombre:      'Familiar + Expansion Pack',
        descripcion: 'Hasta 8 cuentas con todos los beneficios.',
        precios: { ars_mp: 139481 },
      },
    ],
  },

  // ── DEPORTES ──────────────────────────────────────────────────
  {
    id:        'f1-tv',
    nombre:    'F1 TV',
    icono:     '🏎️',
    color:     '#E10600',
    categoria: 'deportes',
    ciclo:     'mensual',
    url:       'https://f1tv.formula1.com',
    imagen:    '/logos/F1TV.png',
    planes: [
      {
        id:          'f1-tv-access',
        nombre:      'Access',
        descripcion: 'Highlights, documentales y contenido on-demand.',
        precios: { ars_mp: 7866 },
      },
      {
        id:          'f1-tv-pro',
        nombre:      'Pro',
        descripcion: 'En vivo, radio del equipo, cámaras de los pilotos.',
        precios: { ars_mp: 18008 },
      },
      {
        id:          'f1-tv-premium',
        nombre:      'Premium',
        descripcion: 'Todo lo de Pro con funciones avanzadas.',
        precios: { ars_mp: 26820 },
      },
    ],
  },

  {
    id:        'f1-tv-anual',
    nombre:    'F1 TV — Anual',
    icono:     '🏎️',
    color:     '#E10600',
    categoria: 'deportes',
    ciclo:     'anual',
    url:       'https://f1tv.formula1.com',
    imagen:    '/logos/F1TV.png',
    planes: [
      {
        id:          'f1-tv-access-anual',
        nombre:      'Access Anual',
        descripcion: 'Pago anual con ahorro.',
        precios: { ars_mp: 67592 },
      },
      {
        id:          'f1-tv-pro-anual',
        nombre:      'Pro Anual',
        descripcion: 'En vivo. Pago anual con ahorro.',
        precios: { ars_mp: 157744 },
      },
      {
        id:          'f1-tv-premium-anual',
        nombre:      'Premium Anual',
        descripcion: 'Todo incluido. Pago anual.',
        precios: { ars_mp: 236628 },
      },
    ],
  },

  {
    id:        'nba-league-pass',
    nombre:    'NBA League Pass',
    icono:     '🏀',
    color:     '#17408B',
    categoria: 'deportes',
    ciclo:     'mensual',
    url:       'https://nba.com/leaguepass',
    imagen:    '/logos/NBALeaguePass.png',
    planes: [
      {
        id:          'nba-one-team',
        nombre:      'One Team',
        descripcion: 'Seguí todos los partidos de tu equipo favorito.',
        precios: { ars_mp: 24480 },
      },
      {
        id:          'nba-standard',
        nombre:      'Standard',
        descripcion: 'Todos los partidos de la temporada.',
        precios: { ars_mp: 27540 },
      },
      {
        id:          'nba-premium',
        nombre:      'Premium',
        descripcion: 'Todos los partidos sin publicidad + beneficios extra.',
        precios: { ars_mp: 35341 },
      },
    ],
  },

  {
    id:        'nfl-game-pass',
    nombre:    'NFL Game Pass',
    icono:     '🏈',
    color:     '#013369',
    categoria: 'deportes',
    ciclo:     'mensual',
    url:       'https://nfl.com/gamepass',
    imagen:    '/logos/NFLGamePass.png',
    planes: [
      {
        id:          'nfl-season-pro',
        nombre:      'Season Pro',
        descripcion: 'Todos los partidos de la temporada en vivo y on-demand.',
        precios: { ars_mp: 31531 },
      },
      {
        id:          'nfl-season-pro-ultimate',
        nombre:      'Season Pro Ultimate',
        descripcion: 'Season Pro con contenido exclusivo y sin publicidad.',
        precios: { ars_mp: 33785 },
      },
    ],
  },

  {
    id:        'ufc-fight-pass',
    nombre:    'UFC Fight Pass',
    icono:     '🥊',
    color:     '#D20A0A',
    categoria: 'deportes',
    ciclo:     'mensual',
    url:       'https://ufcfightpass.com',
    imagen:    '/logos/UFC_Fight_Pass.png',
    planes: [
      {
        id:          'ufc-fight-pass-standard',
        nombre:      'Standard',
        descripcion: 'Eventos en vivo, Fight Library y contenido exclusivo.',
        precios: { ars_mp: 22516 },
      },
      {
        id:          'ufc-fight-pass-ultimate',
        nombre:      'Ultimate',
        descripcion: 'Todo sin restricciones, máxima calidad.',
        precios: { ars_mp: 78861 },
      },
    ],
  },

  {
    id:        'ufc-fight-pass-anual',
    nombre:    'UFC Fight Pass — Anual',
    icono:     '🥊',
    color:     '#D20A0A',
    categoria: 'deportes',
    ciclo:     'anual',
    url:       'https://ufcfightpass.com',
    imagen:    '/logos/UFC_Fight_Pass.png',
    planes: [
      {
        id:          'ufc-fight-pass-standard-anual',
        nombre:      'Standard Anual',
        descripcion: 'Pago anual con ahorro.',
        precios: { ars_mp: 216343 },
      },
      {
        id:          'ufc-fight-pass-ultimate-anual',
        nombre:      'Ultimate Anual',
        descripcion: 'Sin restricciones. Pago anual.',
        precios: { ars_mp: 755005 },
      },
    ],
  },

  {
    id:        'wwe-network',
    nombre:    'WWE Network',
    icono:     '🤼',
    color:     '#000000',
    categoria: 'deportes',
    ciclo:     'mensual',
    url:       'https://wwe.com/network',
    imagen:    '/logos/WWENetwork.png',
    planes: [
      {
        id:          'wwe-network-monthly',
        nombre:      'Monthly',
        descripcion: 'PPVs, shows históricos y contenido exclusivo WWE.',
        precios: { ars_mp: 22516 },
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
    imagen:    '/logos/ChatGPT.png',
    planes: [
      {
        id:          'chatgpt-plus',
        nombre:      'Plus',
        descripcion: 'GPT-4o ilimitado, DALL-E, análisis de archivos.',
        precios: { ars_mp: 45076 },
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
    imagen:    '/logos/Claude.png',
    planes: [
      {
        id:          'claude-pro',
        nombre:      'Pro',
        descripcion: 'Claude con más uso, Projects y archivos.',
        precios: { ars_mp: 45076 },
      },
      {
        id:          'claude-max',
        nombre:      'Max',
        descripcion: 'Uso máximo con todos los modelos disponibles.',
        precios: { ars_mp: 225381 },
      },
      {
        id:          'claude-team',
        nombre:      'Team',
        descripcion: 'Para equipos con colaboración y administración.',
        precios: { ars_mp: 67614 },
      },
    ],
  },

  {
    id:        'claude-anual',
    nombre:    'Claude — Anual',
    icono:     '🟠',
    color:     '#D97706',
    categoria: 'ia',
    ciclo:     'anual',
    url:       'https://claude.ai',
    imagen:    '/logos/Claude.png',
    planes: [
      {
        id:          'claude-pro-anual',
        nombre:      'Pro Anual',
        descripcion: 'Pago anual con ahorro.',
        precios: { ars_mp: 450762 },
      },
      {
        id:          'claude-team-anual',
        nombre:      'Team Anual',
        descripcion: 'Para equipos. Pago anual con ahorro.',
        precios: { ars_mp: 676144 },
      },
    ],
  },

  {
    id:        'copilot',
    nombre:    'Microsoft Copilot',
    icono:     '🪄',
    color:     '#0078D4',
    categoria: 'ia',
    ciclo:     'mensual',
    url:       'https://copilot.microsoft.com',
    imagen:    '/logos/Copilot.png',
    planes: [
      {
        id:          'copilot-pro',
        nombre:      'Pro',
        descripcion: 'IA integrada en todas las apps de Microsoft 365.',
        precios: { ars_mp: 20786 },
      },
    ],
  },

  {
    id:        'copilot-anual',
    nombre:    'Microsoft Copilot — Anual',
    icono:     '🪄',
    color:     '#0078D4',
    categoria: 'ia',
    ciclo:     'anual',
    url:       'https://copilot.microsoft.com',
    imagen:    '/logos/Copilot.png',
    planes: [
      {
        id:          'copilot-pro-anual',
        nombre:      'Pro Anual',
        descripcion: 'Pago anual con ahorro.',
        precios: { ars_mp: 207869 },
      },
    ],
  },

  {
    id:        'gemini',
    nombre:    'Google Gemini',
    icono:     '✨',
    color:     '#4285F4',
    categoria: 'ia',
    ciclo:     'mensual',
    url:       'https://gemini.google.com',
    imagen:    '/logos/Google-gemini.png',
    planes: [
      {
        id:          'gemini-pro',
        nombre:      'Pro',
        descripcion: 'Gemini Advanced con 2 TB de Google One incluidos.',
        precios: { ars_mp: 45054 },
      },
      {
        id:          'gemini-ultra',
        nombre:      'Ultra',
        descripcion: 'Acceso máximo con todos los modelos y funciones.',
        precios: { ars_mp: 563431 },
      },
    ],
  },

  {
    id:        'grok',
    nombre:    'Grok (xAI)',
    icono:     '🧠',
    color:     '#1D9BF0',
    categoria: 'ia',
    ciclo:     'mensual',
    url:       'https://grok.x.ai',
    imagen:    '/logos/Grok.png',
    planes: [
      {
        id:          'grok-supergrok',
        nombre:      'SuperGrok',
        descripcion: 'Acceso a Grok con mayor cantidad de consultas.',
        precios: { ars_mp: 67614 },
      },
      {
        id:          'grok-supergrok-heavy',
        nombre:      'SuperGrok Heavy',
        descripcion: 'Máxima potencia con los modelos más avanzados de xAI.',
        precios: { ars_mp: 676144 },
      },
    ],
  },

  {
    id:        'grok-anual',
    nombre:    'Grok (xAI) — Anual',
    icono:     '🧠',
    color:     '#1D9BF0',
    categoria: 'ia',
    ciclo:     'anual',
    url:       'https://grok.x.ai',
    imagen:    '/logos/Grok.png',
    planes: [
      {
        id:          'grok-supergrok-anual',
        nombre:      'SuperGrok Anual',
        descripcion: 'Pago anual con ahorro.',
        precios: { ars_mp: 676144 },
      },
      {
        id:          'grok-supergrok-heavy-anual',
        nombre:      'SuperGrok Heavy Anual',
        descripcion: 'Máxima potencia. Pago anual.',
        precios: { ars_mp: 6761437 },
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
    imagen:    '/logos/Icloud.png',
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
    imagen:    '/logos/GoogleOne.png',
    planes: [
      {
        id:          'google-one-100gb',
        nombre:      '100 GB',
        descripcion: 'Google Drive, Gmail y Fotos compartidos.',
        precios: { ars_mp: null },
      },
      {
        id:          'google-one-2tb',
        nombre:      '2 TB',
        descripcion: '2 TB de almacenamiento en Google.',
        precios: { ars_mp: null },
      },
    ],
  },

  // ── SOFTWARE ────────────────────────────────────────────────────
  {
    id:        'microsoft-365',
    nombre:    'Microsoft 365',
    icono:     '📊',
    color:     '#0078D4',
    categoria: 'software',
    ciclo:     'mensual',
    url:       'https://microsoft.com/m365',
    imagen:    '/logos/Microsoft365.png',
    planes: [
      {
        id:          'microsoft-365-personal',
        nombre:      'Personal',
        descripcion: 'Word, Excel, PowerPoint + 1 TB OneDrive.',
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
    imagen:    '/logos/Canva.png',
    planes: [
      {
        id:          'canva-pro',
        nombre:      'Pro',
        descripcion: 'Diseño ilimitado, marca kit, fondo remover.',
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
    imagen:    '/logos/Adobe.png',
    planes: [
      {
        id:          'adobe-cc-todas',
        nombre:      'Todas las apps',
        descripcion: 'Photoshop, Illustrator, Premiere y más de 20 apps.',
        precios: { ars_mp: null },
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
    imagen:    '/logos/Duolingo.png',
    planes: [
      {
        id:          'duolingo-super',
        nombre:      'Super',
        descripcion: 'Sin anuncios, corazones ilimitados, modo legendario.',
        precios: { ars_mp: null },
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
    imagen:    '/logos/Coursera.png',
    planes: [
      {
        id:          'coursera-plus',
        nombre:      'Plus',
        descripcion: 'Acceso a +7.000 cursos de universidades top del mundo.',
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
    imagen:    '/logos/NordVPN.png',
    planes: [
      {
        id:          'nordvpn-plus',
        nombre:      'Plus',
        descripcion: 'VPN + gestión de contraseñas + protección de datos.',
        precios: { ars_mp: null },
      },
    ],
  },
]

export const CATEGORIAS_CATALOGO = [
  { id: 'todos',      label: 'Todos',       emoji: '🌐' },
  { id: 'streaming',  label: 'Streaming',   emoji: '🎬' },
  { id: 'musica',     label: 'Música',      emoji: '🎵' },
  { id: 'juegos',     label: 'Gaming',      emoji: '🎮' },
  { id: 'deportes',   label: 'Deportes',    emoji: '⚽' },
  { id: 'ia',         label: 'IA',          emoji: '🤖' },
  { id: 'nube',       label: 'Nube',        emoji: '☁️' },
  { id: 'software',   label: 'Software',    emoji: '💻' },
  { id: 'educacion',  label: 'Educación',   emoji: '📚' },
]