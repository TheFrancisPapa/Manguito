// src/pages/Recursos/index.jsx
// Perfiles de Instagram rotan diariamente (6 por día) de un pool de 40 cuentas.
import { useState, useMemo } from 'react'
import { PageWrapper, PageHeader } from '../../components/layout'
import { TabLibros } from './TabLibros'

// ── Pool completo de cuentas de Instagram ────────────────────
// Organizadas en categorías para la vista de "Categoría del día"
const TODAS_LAS_CUENTAS = [
  // ── Ahorro y Finanzas Personales ────────────────────────────
  {
    usuario:     '@joveninversor',
    nombre:      'Agustín Natoli',
    descripcion: 'Inversiones, CEDEARs y finanzas personales para jóvenes argentinos. Contenido práctico y educativo.',
    temas:       ['CEDEARs', 'Ahorro', 'Jóvenes'],
    url:         'https://www.instagram.com/joveninversor',
    emoji:       '📈',
    color:       '#E1306C',
    categoria:   'Ahorro & Finanzas',
  },
  {
    usuario:     '@mujer_financiera',
    nombre:      'Mujer Financiera',
    descripcion: 'Finanzas personales desde una perspectiva femenina. Presupuesto, ahorro y primeros pasos en inversiones.',
    temas:       ['Presupuesto', 'Ahorro', 'Mujer'],
    url:         'https://www.instagram.com/mujer_financiera',
    emoji:       '💜',
    color:       '#833AB4',
    categoria:   'Ahorro & Finanzas',
  },
  {
    usuario:     '@luliinvierte',
    nombre:      'Lucía Aguilar',
    descripcion: 'Tips de ahorro e inversión en lenguaje simple. Ideal para empezar desde cero en el mundo financiero.',
    temas:       ['Ahorro', 'Principiantes', 'Inversión'],
    url:         'https://www.instagram.com/luliinvierte',
    emoji:       '🌱',
    color:       '#10B981',
    categoria:   'Ahorro & Finanzas',
  },
  {
    usuario:     '@ahorrandoconcami',
    nombre:      'Camila Ibarbalz',
    descripcion: 'Estrategias de ahorro para el día a día argentino. Cómo hacer rendir más la plata en contexto inflacionario.',
    temas:       ['Ahorro', 'Inflación', 'Cotidiano'],
    url:         'https://www.instagram.com/ahorrandoconcami',
    emoji:       '🐷',
    color:       '#F59E0B',
    categoria:   'Ahorro & Finanzas',
  },
  {
    usuario:     '@morisdieck',
    nombre:      'Moris Dieck',
    descripcion: 'Educación financiera en español para toda Latinoamérica. Libertad financiera, inversiones y mentalidad de abundancia.',
    temas:       ['Libertad Financiera', 'Mentalidad', 'LATAM'],
    url:         'https://www.instagram.com/morisdieck',
    emoji:       '🚀',
    color:       '#3B82F6',
    categoria:   'Ahorro & Finanzas',
  },
  {
    usuario:     '@pequenocerdocapitalista',
    nombre:      'Sofía Macías',
    descripcion: 'Autora del libro "Pequeño Cerdo Capitalista". Finanzas personales accesibles y sin tecnicismos.',
    temas:       ['Finanzas Personales', 'Libros', 'Educación'],
    url:         'https://www.instagram.com/pequenocerdocapitalista',
    emoji:       '📚',
    color:       '#EC4899',
    categoria:   'Ahorro & Finanzas',
  },
  {
    usuario:     '@karemsuarez',
    nombre:      'Karem Suárez',
    descripcion: 'Coaches de finanzas personales. Cómo salir de deudas y construir un patrimonio desde cero.',
    temas:       ['Deudas', 'Patrimonio', 'Coaching'],
    url:         'https://www.instagram.com/karemsuarez',
    emoji:       '💡',
    color:       '#F97316',
    categoria:   'Ahorro & Finanzas',
  },
  {
    usuario:     '@fedetesso',
    nombre:      'Fede Tessore',
    descripcion: 'Marketing y finanzas. Tips prácticos sobre cómo hacer crecer tu dinero y tu negocio en Argentina.',
    temas:       ['Marketing', 'Negocios', 'Finanzas'],
    url:         'https://www.instagram.com/fedetesso',
    emoji:       '💼',
    color:       '#6366F1',
    categoria:   'Ahorro & Finanzas',
  },
  {
    usuario:     '@rominaavila.finanzas',
    nombre:      'Romina Ávila',
    descripcion: 'Finanzas personales con perspectiva local. Presupuesto, ahorro e inversiones en pesos y dólares.',
    temas:       ['Presupuesto', 'Dólares', 'Argentina'],
    url:         'https://www.instagram.com/rominaavila.finanzas',
    emoji:       '💰',
    color:       '#14B8A6',
    categoria:   'Ahorro & Finanzas',
  },
  {
    usuario:     '@finanzaspablo',
    nombre:      'Pablo Aguer',
    descripcion: 'Educación financiera práctica para argentinos. Cómo proteger el poder adquisitivo y hacer crecer el capital.',
    temas:       ['Poder Adquisitivo', 'Capital', 'Argentina'],
    url:         'https://www.instagram.com/finanzaspablo',
    emoji:       '🇦🇷',
    color:       '#1D4ED8',
    categoria:   'Ahorro & Finanzas',
  },

  // ── Inversiones y Mercado ────────────────────────────────────
  {
    usuario:     '@gisecolasurdo',
    nombre:      'Giselle Colasurdo',
    descripcion: 'Trading y análisis técnico explicados de forma accesible. Mercados financieros desde una mirada argentina.',
    temas:       ['Trading', 'Análisis Técnico', 'Mercados'],
    url:         'https://www.instagram.com/gisecolasurdo',
    emoji:       '📊',
    color:       '#8B5CF6',
    categoria:   'Inversiones',
  },
  {
    usuario:     '@pablogiltrader',
    nombre:      'Pablo Gil',
    descripcion: 'Estrategias de inversión y trading con más de 20 años de experiencia. Análisis de mercados globales.',
    temas:       ['Trading', 'Estrategia', 'Global'],
    url:         'https://www.instagram.com/pablogiltrader',
    emoji:       '📉',
    color:       '#EF4444',
    categoria:   'Inversiones',
  },
  {
    usuario:     '@ramirogoncalvesok',
    nombre:      'Ramiro Goncalves',
    descripcion: 'Inversiones en Argentina y el mundo. CEDEARs, acciones locales y renta fija explicados claramente.',
    temas:       ['CEDEARs', 'Acciones', 'Renta Fija'],
    url:         'https://www.instagram.com/ramirogoncalvesok',
    emoji:       '🏦',
    color:       '#0EA5E9',
    categoria:   'Inversiones',
  },
  {
    usuario:     '@inversionesenelmundo',
    nombre:      'Sergio Turi',
    descripcion: 'Inversiones globales desde Argentina. Cómo acceder a mercados internacionales con poco capital.',
    temas:       ['Global', 'ETFs', 'Diversificación'],
    url:         'https://www.instagram.com/inversionesenelmundo',
    emoji:       '🌍',
    color:       '#059669',
    categoria:   'Inversiones',
  },
  {
    usuario:     '@ichi_fibonacci',
    nombre:      'Ichimoku Fibonacci',
    descripcion: 'Análisis técnico avanzado con indicadores Ichimoku y Fibonacci. Para inversores que quieren profundizar.',
    temas:       ['Análisis Técnico', 'Indicadores', 'Avanzado'],
    url:         'https://www.instagram.com/ichi_fibonacci',
    emoji:       '📐',
    color:       '#7C3AED',
    categoria:   'Inversiones',
  },
  {
    usuario:     '@inverarg',
    nombre:      'Invertir en Bolsa y Criptos',
    descripcion: 'El canal de referencia sobre inversiones en Argentina. CEDEARs, bolsa local, renta fija y análisis del mercado.',
    temas:       ['CEDEARs', 'Bolsa Argentina', 'Cripto'],
    url:         'https://www.instagram.com/inverarg',
    emoji:       '🇦🇷',
    color:       '#DC2626',
    categoria:   'Inversiones',
  },
  {
    usuario:     '@elartedeinvertirpodcast',
    nombre:      'El Arte de Invertir',
    descripcion: 'Podcast y contenido sobre inversión con mentalidad de largo plazo. Value investing y fundamentos sólidos.',
    temas:       ['Value Investing', 'Largo Plazo', 'Podcast'],
    url:         'https://www.instagram.com/elartedeinvertirpodcast',
    emoji:       '🎙️',
    color:       '#D97706',
    categoria:   'Inversiones',
  },
  {
    usuario:     '@ambito_financiero',
    nombre:      'Ámbito Financiero',
    descripcion: 'Noticias y análisis del mercado financiero argentino. El medio de referencia para seguir la economía local.',
    temas:       ['Noticias', 'Economía', 'Mercado Local'],
    url:         'https://www.instagram.com/ambito_financiero',
    emoji:       '📰',
    color:       '#1E40AF',
    categoria:   'Inversiones',
  },
  {
    usuario:     '@tudineroxl',
    nombre:      'Mónica Fernández',
    descripcion: 'Finanzas personales e inversiones con foco en la mujer argentina. Cómo hacer crecer el patrimonio familiar.',
    temas:       ['Finanzas Personales', 'Mujer', 'Patrimonio'],
    url:         'https://www.instagram.com/tudineroxl',
    emoji:       '👩‍💼',
    color:       '#DB2777',
    categoria:   'Inversiones',
  },
  {
    usuario:     '@inversorglobal',
    nombre:      'Inversor Global',
    descripcion: 'Estrategias de inversión global. Cómo construir una cartera diversificada internacionalmente desde Argentina.',
    temas:       ['Global', 'Cartera', 'Diversificación'],
    url:         'https://www.instagram.com/inversorglobal',
    emoji:       '🌐',
    color:       '#0369A1',
    categoria:   'Inversiones',
  },

  // ── Brokers y Mercado de Capitales ───────────────────────────
  {
    usuario:     '@sbdar',
    nombre:      'Ariel Sbdar',
    descripcion: 'CEO de Cocos Capital. Mercado de capitales argentino, inversiones y fintech desde adentro del sector.',
    temas:       ['Fintech', 'Mercado de Capitales', 'CEO'],
    url:         'https://www.instagram.com/sbdar',
    emoji:       '🥥',
    color:       '#92400E',
    categoria:   'Brokers & Capital',
  },
  {
    usuario:     '@doctordetusfinanzas',
    nombre:      'Gastón Lentini',
    descripcion: 'Conceptos financieros y de mercado explicados sin jerga. Bolsa, bonos y FCI para todos los niveles.',
    temas:       ['Bolsa', 'Bonos', 'FCI'],
    url:         'https://www.instagram.com/doctordetusfinanzas',
    emoji:       '🩺',
    color:       '#405DE6',
    categoria:   'Brokers & Capital',
  },
  {
    usuario:     '@arielhernanmamani',
    nombre:      'Ariel Mamani',
    descripcion: 'Análisis de mercados y gestión de cartera. Broker con amplia experiencia en el mercado financiero argentino.',
    temas:       ['Análisis', 'Gestión de Cartera', 'Broker'],
    url:         'https://www.instagram.com/arielhernanmamani',
    emoji:       '📋',
    color:       '#0891B2',
    categoria:   'Brokers & Capital',
  },
  {
    usuario:     '@jultarres',
    nombre:      'Julieta Tarrés',
    descripcion: 'Especialista en mercados financieros. Análisis y educación sobre bolsa y productos de inversión argentinos.',
    temas:       ['Bolsa', 'Productos Financieros', 'Educación'],
    url:         'https://www.instagram.com/jultarres',
    emoji:       '💹',
    color:       '#16A34A',
    categoria:   'Brokers & Capital',
  },
  {
    usuario:     '@czuchovicki',
    nombre:      'Claudio Zuchovicki',
    descripcion: 'Referente histórico del mercado de capitales argentino. Análisis económico y financiero con décadas de experiencia.',
    temas:       ['Mercado de Capitales', 'Macroeconomía', 'Referente'],
    url:         'https://www.instagram.com/czuchovicki',
    emoji:       '🏛️',
    color:       '#7C3AED',
    categoria:   'Brokers & Capital',
  },
  {
    usuario:     '@ramiromarra',
    nombre:      'Ramiro Marra',
    descripcion: 'Libertad económica y mercados financieros. Visión liberal sobre inversiones, economía y política económica.',
    temas:       ['Libertad Económica', 'Inversiones', 'Economía'],
    url:         'https://www.instagram.com/ramiromarra',
    emoji:       '🦁',
    color:       '#B45309',
    categoria:   'Brokers & Capital',
  },
  {
    usuario:     '@damiandipace',
    nombre:      'Damián Di Pace',
    descripcion: 'Economista y analista. Seguimiento de la economía argentina, precios, inflación y su impacto en las inversiones.',
    temas:       ['Economía Argentina', 'Precios', 'Análisis'],
    url:         'https://www.instagram.com/damiandipace',
    emoji:       '📊',
    color:       '#1D4ED8',
    categoria:   'Brokers & Capital',
  },
  {
    usuario:     '@elena.financiera',
    nombre:      'Elena Alonso',
    descripcion: 'Asesora financiera. Planificación financiera personal, gestión de deudas e inversiones para el largo plazo.',
    temas:       ['Planificación', 'Deudas', 'Largo Plazo'],
    url:         'https://www.instagram.com/elena.financiera',
    emoji:       '🎯',
    color:       '#BE185D',
    categoria:   'Brokers & Capital',
  },
  {
    usuario:     '@santiagobulat',
    nombre:      'Santiago Bulat',
    descripcion: 'Economista con visión accesible. Explica la macro argentina y su impacto en el bolsillo de los ciudadanos.',
    temas:       ['Macroeconomía', 'Economista', 'Accesible'],
    url:         'https://www.instagram.com/santiagobulat',
    emoji:       '📈',
    color:       '#0F766E',
    categoria:   'Brokers & Capital',
  },
  {
    usuario:     '@salvador.distefano',
    nombre:      'Salvador Di Stefano',
    descripcion: 'Consultor agropecuario y financiero. Análisis de commodities, tipo de cambio y economía argentina para el campo y la ciudad.',
    temas:       ['Commodities', 'Campo', 'Tipo de Cambio'],
    url:         'https://www.instagram.com/salvador.distefano',
    emoji:       '🌾',
    color:       '#A16207',
    categoria:   'Brokers & Capital',
  },

  // ── Economía Global y Crypto ──────────────────────────────────
  {
    usuario:     '@healthy.pockets',
    nombre:      'Hugo',
    descripcion: 'Finanzas saludables y cripto. Cómo combinar inversiones tradicionales con activos digitales de forma inteligente.',
    temas:       ['Cripto', 'Finanzas', 'Equilibrio'],
    url:         'https://www.instagram.com/healthy.pockets',
    emoji:       '💚',
    color:       '#10B981',
    categoria:   'Cripto & Global',
  },
  {
    usuario:     '@criptonorber',
    nombre:      'Norberto Giudice',
    descripcion: 'Criptomonedas en español. Análisis de Bitcoin, Ethereum y altcoins con foco en el contexto latinoamericano.',
    temas:       ['Bitcoin', 'Ethereum', 'Altcoins'],
    url:         'https://www.instagram.com/criptonorber',
    emoji:       '₿',
    color:       '#F59E0B',
    categoria:   'Cripto & Global',
  },
  {
    usuario:     '@dinerofacil_ok',
    nombre:      'Max Irazoqui',
    descripcion: 'Finanzas simples y cripto. Cómo ganar dinero con activos digitales sin necesitar ser un experto técnico.',
    temas:       ['Cripto', 'DeFi', 'Simple'],
    url:         'https://www.instagram.com/dinerofacil_ok',
    emoji:       '💸',
    color:       '#7C3AED',
    categoria:   'Cripto & Global',
  },
  {
    usuario:     '@camilomondragonr',
    nombre:      'Camilo Mondragon',
    descripcion: 'Inversiones y finanzas para millennials latinoamericanos. Cripto, acciones globales y libertad financiera.',
    temas:       ['Millennials', 'Global', 'Libertad Financiera'],
    url:         'https://www.instagram.com/camilomondragonr',
    emoji:       '🌎',
    color:       '#0EA5E9',
    categoria:   'Cripto & Global',
  },
  {
    usuario:     '@cryptoprofe_',
    nombre:      'Eric y Kevin',
    descripcion: 'Los profes de cripto. Educación sobre blockchain, DeFi, NFTs y el ecosistema Web3 en español.',
    temas:       ['Blockchain', 'DeFi', 'Web3'],
    url:         'https://www.instagram.com/cryptoprofe_',
    emoji:       '🎓',
    color:       '#4F46E5',
    categoria:   'Cripto & Global',
  },
  {
    usuario:     '@buenbit',
    nombre:      'Buenbit',
    descripcion: 'Exchange argentino de criptomonedas. Noticias del mercado cripto, novedades de la plataforma y educación financiera digital.',
    temas:       ['Exchange', 'Cripto AR', 'Noticias'],
    url:         'https://www.instagram.com/buenbit',
    emoji:       '🔵',
    color:       '#2563EB',
    categoria:   'Cripto & Global',
  },
  {
    usuario:     '@lemoncash.app',
    nombre:      'Lemon Cash',
    descripcion: 'La billetera cripto argentina. Contenido sobre criptomonedas, ahorro digital y cómo usar activos digitales en el día a día.',
    temas:       ['Billetera Cripto', 'Ahorro Digital', 'Cotidiano'],
    url:         'https://www.instagram.com/lemoncash.app',
    emoji:       '🍋',
    color:       '#EAB308',
    categoria:   'Cripto & Global',
  },
  {
    usuario:     '@inaki.apezteguia',
    nombre:      'Iñaki Apezteguia',
    descripcion: 'Economía global y mercados internacionales. Análisis de tendencias macro que afectan a los inversores argentinos.',
    temas:       ['Economía Global', 'Macro', 'Mercados'],
    url:         'https://www.instagram.com/inaki.apezteguia',
    emoji:       '🌐',
    color:       '#0369A1',
    categoria:   'Cripto & Global',
  },
  {
    usuario:     '@madcriptomx',
    nombre:      'Mad Cripto',
    descripcion: 'Análisis de criptomonedas en español. Tendencias del mercado cripto, oportunidades y gestión del riesgo.',
    temas:       ['Análisis Cripto', 'Tendencias', 'Riesgo'],
    url:         'https://www.instagram.com/madcriptomx',
    emoji:       '🤪',
    color:       '#DC2626',
    categoria:   'Cripto & Global',
  },
  {
    usuario:     '@liam.wickham',
    nombre:      'Liam Wickham',
    descripcion: 'Inversiones internacionales y cripto. Cómo diversificar en activos globales desde cualquier país de Latinoamérica.',
    temas:       ['Internacional', 'Diversificación', 'Cripto'],
    url:         'https://www.instagram.com/liam.wickham',
    emoji:       '🚀',
    color:       '#7C3AED',
    categoria:   'Cripto & Global',
  },
]

const CUENTAS_YOUTUBE = [
  {
    usuario:     '@inverarg',
    nombre:      'Inverarg',
    descripcion: 'El canal de referencia sobre inversiones en Argentina. CEDEARs, bolsa local, renta fija y análisis del mercado argentino en profundidad.',
    temas:       ['CEDEARs', 'Bolsa Argentina', 'Análisis', 'Renta Fija'],
    url:         'https://www.youtube.com/@inverarg',
    emoji:       '🇦🇷',
    color:       '#FF0000',
    suscriptores: '90K+',
  },
  {
    usuario:     '@andresgarzam',
    nombre:      'Andrés Garza M.',
    descripcion: 'Educación financiera de alta calidad. Inversiones, libertad financiera, negocios y mentalidad de prosperidad con perspectiva latinoamericana.',
    temas:       ['Libertad Financiera', 'Inversiones', 'Negocios', 'Mentalidad'],
    url:         'https://www.youtube.com/@andresgarzam',
    emoji:       '🚀',
    color:       '#FF0000',
    suscriptores: '500K+',
  },
  {
    usuario:     '@emprendeaprendefinanzas',
    nombre:      'Emprende & Aprende Finanzas',
    descripcion: 'Finanzas personales y emprendimiento para el contexto argentino. Cómo hacer crecer tu dinero en un país con inflación.',
    temas:       ['Emprendimiento', 'Inflación', 'Finanzas Personales'],
    url:         'https://www.youtube.com/@emprendeaprendefinanzas',
    emoji:       '💡',
    color:       '#FF0000',
    suscriptores: '30K+',
  },
  {
    usuario:     '@criptointeligente',
    nombre:      'Cripto Inteligente',
    descripcion: 'Todo sobre criptomonedas en Argentina. Bitcoin, Ethereum, cómo empezar a invertir en cripto de forma segura y sin estafas.',
    temas:       ['Cripto', 'Bitcoin', 'Ethereum', 'Seguridad'],
    url:         'https://www.youtube.com/@criptointeligente',
    emoji:       '₿',
    color:       '#FF0000',
    suscriptores: '45K+',
  },
  {
    usuario:     '@robertovelasquezfinanciero',
    nombre:      'Roberto Velásquez',
    descripcion: 'Análisis macroeconómico y de mercados para Argentina y Latinoamérica. Ideal para inversores más avanzados.',
    temas:       ['Macroeconomía', 'Análisis Avanzado', 'Latinoamérica'],
    url:         'https://www.youtube.com/@robertovelasquezfinanciero',
    emoji:       '📊',
    color:       '#FF0000',
    suscriptores: '20K+',
  },
]

// ── Función de rotación diaria ───────────────────────────────
const PERFILES_POR_DIA = 6

/**
 * Devuelve los N perfiles del día basándose en el día del año.
 * Rota cíclicamente por el pool completo, asegurando variedad
 * y que no se repitan en el mismo día.
 */
function getPerfilesDelDia() {
  const inicio = new Date(new Date().getFullYear(), 0, 0)
  const diff = Date.now() - inicio.getTime()
  const diaDelAnio = Math.floor(diff / 86_400_000)

  // Creamos un índice de inicio para este día
  const total = TODAS_LAS_CUENTAS.length
  const inicio_idx = (diaDelAnio * PERFILES_POR_DIA) % total

  // Seleccionamos los perfiles con wrap-around
  const seleccionados = []
  for (let i = 0; i < PERFILES_POR_DIA; i++) {
    seleccionados.push(TODAS_LAS_CUENTAS[(inicio_idx + i) % total])
  }

  return seleccionados
}

/**
 * Devuelve el número del día del año para mostrar en UI.
 * Útil para que el usuario sepa cuándo cambia la selección.
 */
function getDiaDelAnio() {
  const inicio = new Date(new Date().getFullYear(), 0, 0)
  const diff = Date.now() - inicio.getTime()
  return Math.floor(diff / 86_400_000)
}

// ── Colores de categoría ─────────────────────────────────────
const CATEGORIA_COLORES = {
  'Ahorro & Finanzas': { bg: 'bg-emerald-50 dark:bg-emerald-900/15', text: 'text-emerald-700 dark:text-emerald-400', border: 'border-emerald-200 dark:border-emerald-800/30' },
  'Inversiones':       { bg: 'bg-blue-50 dark:bg-blue-900/15',       text: 'text-blue-700 dark:text-blue-400',       border: 'border-blue-200 dark:border-blue-800/30' },
  'Brokers & Capital': { bg: 'bg-purple-50 dark:bg-purple-900/15',   text: 'text-purple-700 dark:text-purple-400',   border: 'border-purple-200 dark:border-purple-800/30' },
  'Cripto & Global':   { bg: 'bg-amber-50 dark:bg-amber-900/15',     text: 'text-amber-700 dark:text-amber-400',     border: 'border-amber-200 dark:border-amber-800/30' },
}

// ── Tarjeta de cuenta de Instagram ───────────────────────────
function TarjetaInstagram({ cuenta }) {
  const catColor = CATEGORIA_COLORES[cuenta.categoria] || CATEGORIA_COLORES['Inversiones']

  return (
    <div className="flex flex-col gap-3 p-4 bg-white dark:bg-zinc-900
      border border-zinc-100 dark:border-zinc-800 rounded-2xl
      hover:border-zinc-200 dark:hover:border-zinc-700
      hover:shadow-md transition-all group">

      {/* Categoría badge */}
      <div className="flex items-center justify-between">
        <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full border ${catColor.bg} ${catColor.text} ${catColor.border}`}>
          {cuenta.categoria}
        </span>
        <span className="text-lg">{cuenta.emoji}</span>
      </div>

      {/* Info principal */}
      <div>
        <p className="font-bold text-sm text-zinc-900 dark:text-white leading-tight">
          {cuenta.nombre}
        </p>
        <p className="text-[10px] text-zinc-400 font-mono mt-0.5">{cuenta.usuario}</p>
      </div>

      {/* Descripción */}
      <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed flex-1">
        {cuenta.descripcion}
      </p>

      {/* Temas */}
      <div className="flex flex-wrap gap-1.5">
        {cuenta.temas.map(tema => (
          <span key={tema}
            className="text-[9px] font-semibold px-2 py-0.5 rounded-full
              bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400">
            {tema}
          </span>
        ))}
      </div>

      {/* Botón */}
      <a
        href={cuenta.url}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center justify-center gap-2 py-2.5 rounded-xl
          text-xs font-bold transition-all active:scale-[0.98]
          bg-gradient-to-r from-[#833AB4] via-[#E1306C] to-[#F77737]
          text-white hover:opacity-90"
      >
        📸 Ver en Instagram
      </a>
    </div>
  )
}

// ── Tarjeta de YouTube ────────────────────────────────────────
function TarjetaYoutube({ cuenta }) {
  return (
    <div className="flex flex-col gap-3 p-4 bg-white dark:bg-zinc-900
      border border-zinc-100 dark:border-zinc-800 rounded-2xl
      hover:border-zinc-200 dark:hover:border-zinc-700
      hover:shadow-md transition-all">

      <div className="flex items-start gap-3">
        <div className="w-11 h-11 rounded-2xl flex items-center justify-center text-xl flex-shrink-0"
          style={{ background: cuenta.color + '15' }}>
          {cuenta.emoji}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="font-bold text-sm text-zinc-900 dark:text-white leading-tight">
              {cuenta.nombre}
            </p>
            {cuenta.suscriptores && (
              <span className="text-[9px] bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400
                px-1.5 py-0.5 rounded-full font-bold flex-shrink-0">
                🔴 {cuenta.suscriptores} subs
              </span>
            )}
          </div>
          <p className="text-[10px] text-zinc-400 font-mono mt-0.5">{cuenta.usuario}</p>
        </div>
      </div>

      <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
        {cuenta.descripcion}
      </p>

      <div className="flex flex-wrap gap-1.5">
        {cuenta.temas.map(tema => (
          <span key={tema}
            className="text-[9px] font-semibold px-2 py-0.5 rounded-full
              bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400">
            {tema}
          </span>
        ))}
      </div>

      <a
        href={cuenta.url}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center justify-center gap-2 py-2.5 rounded-xl
          text-xs font-bold transition-all active:scale-[0.98]
          bg-red-500 hover:bg-red-600 text-white"
      >
        ▶️ Ver en YouTube
      </a>
    </div>
  )
}

// ── Contador regresivo al próximo cambio ──────────────────────
function ProximoCambio() {
  const ahora = new Date()
  const maniana = new Date(ahora)
  maniana.setDate(maniana.getDate() + 1)
  maniana.setHours(0, 0, 0, 0)
  const horasRestantes = Math.ceil((maniana - ahora) / (1000 * 60 * 60))

  return (
    <p className="text-[10px] text-zinc-400 text-center">
      🔄 Próximo cambio de perfiles en{' '}
      <span className="font-semibold text-zinc-500">
        {horasRestantes === 1 ? '1 hora' : `${horasRestantes} horas`}
      </span>
    </p>
  )
}

// ── Página principal ──────────────────────────────────────────
export function RecursosPage() {
  const [tab, setTab] = useState('libros')
  const [verTodos, setVerTodos] = useState(false)

  const perfilesDelDia = useMemo(() => getPerfilesDelDia(), [])
  const diaDelAnio = getDiaDelAnio()

  // Agrupar todos los perfiles por categoría (para la vista "Ver todos")
  const todasLasCategorias = useMemo(() => {
    return TODAS_LAS_CUENTAS.reduce((acc, cuenta) => {
      if (!acc[cuenta.categoria]) acc[cuenta.categoria] = []
      acc[cuenta.categoria].push(cuenta)
      return acc
    }, {})
  }, [])

  return (
    <div className="animate-in fade-in duration-500">
      <PageWrapper>
        <PageHeader
          titulo="📚 Recursos"
          subtitulo="Aprendé de los mejores creadores financieros"
        />

        {/* Intro */}
        <div className="mb-5 bg-[var(--mango)]/8 dark:bg-[var(--mango)]/5 rounded-2xl px-4 py-3
          border border-[var(--mango)]/15">
          <p className="text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed">
            🎓 La educación financiera es la mejor inversión. Estos creadores explican en español
            conceptos clave sobre ahorro, inversiones y finanzas para el contexto argentino y latinoamericano.
          </p>
        </div>

        {/* Tabs */}
        <div className="flex bg-zinc-100 dark:bg-zinc-800 rounded-xl p-1 mb-5">
          <button
            onClick={() => setTab('libros')}
            className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-colors ${
              tab === 'libros'
                ? 'bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white shadow-sm'
                : 'text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'
            }`}
          >
            📚 Libros
          </button>
          <button
            onClick={() => setTab('instagram')}
            className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-colors ${
              tab === 'instagram'
                ? 'bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white shadow-sm'
                : 'text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'
            }`}
          >
            📸 Instagram
          </button>
          <button
            onClick={() => setTab('youtube')}
            className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-colors ${
              tab === 'youtube'
                ? 'bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white shadow-sm'
                : 'text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'
            }`}
          >
            ▶️ YouTube
          </button>
        </div>

        {/* ── LIBROS ── */}
        {tab === 'libros' && (
          <TabLibros />
        )}

        {/* ── INSTAGRAM ── */}
        {tab === 'instagram' && (
          <>
            {!verTodos ? (
              <>
                {/* Header de selección del día */}
                <div className="flex items-center justify-between mb-3 px-1">
                  <div>
                    <h2 className="text-sm font-bold text-zinc-800 dark:text-zinc-200">
                      ✨ Selección del día
                    </h2>
                    <p className="text-[10px] text-zinc-400">
                      {PERFILES_POR_DIA} perfiles seleccionados · Cambian cada 24hs
                    </p>
                  </div>
                  <button
                    onClick={() => setVerTodos(true)}
                    className="text-xs font-bold text-[var(--mango-dark)] dark:text-[var(--mango)]
                      hover:underline transition-colors"
                  >
                    Ver todos ({TODAS_LAS_CUENTAS.length}) →
                  </button>
                </div>

                {/* Grid de perfiles del día */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                  {perfilesDelDia.map(cuenta => (
                    <TarjetaInstagram key={cuenta.usuario} cuenta={cuenta} />
                  ))}
                </div>

                <ProximoCambio />
              </>
            ) : (
              <>
                {/* Header vista completa */}
                <div className="flex items-center justify-between mb-4 px-1">
                  <h2 className="text-sm font-bold text-zinc-800 dark:text-zinc-200">
                    Todos los perfiles ({TODAS_LAS_CUENTAS.length})
                  </h2>
                  <button
                    onClick={() => setVerTodos(false)}
                    className="text-xs font-bold text-[var(--mango-dark)] dark:text-[var(--mango)]
                      hover:underline"
                  >
                    ← Volver a la selección del día
                  </button>
                </div>

                {/* Por categoría */}
                {Object.entries(todasLasCategorias).map(([categoria, cuentas]) => {
                  const colores = CATEGORIA_COLORES[categoria] || CATEGORIA_COLORES['Inversiones']
                  return (
                    <div key={categoria} className="mb-8">
                      <div className={`flex items-center gap-2 px-3 py-2 rounded-xl mb-3 border ${colores.bg} ${colores.border}`}>
                        <h3 className={`text-xs font-black uppercase tracking-wider ${colores.text}`}>
                          {categoria}
                        </h3>
                        <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-white/50 dark:bg-black/20 ${colores.text}`}>
                          {cuentas.length} perfiles
                        </span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {cuentas.map(cuenta => (
                          <TarjetaInstagram key={cuenta.usuario} cuenta={cuenta} />
                        ))}
                      </div>
                    </div>
                  )
                })}
              </>
            )}
          </>
        )}

        {/* ── YOUTUBE ── */}
        {tab === 'youtube' && (
          <>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-4 px-1">
              Canales recomendados para profundizar en finanzas e inversiones en español.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {CUENTAS_YOUTUBE.map(cuenta => (
                <TarjetaYoutube key={cuenta.usuario} cuenta={cuenta} />
              ))}
            </div>
          </>
        )}

        <p className="text-[10px] text-zinc-400 text-center mt-8 pb-4">
          Estas cuentas son recomendaciones educativas. Manguito no tiene relación comercial con ninguna de ellas.
        </p>
      </PageWrapper>
    </div>
  )
}