// src/pages/Recursos/index.jsx
import { useState } from 'react'
import { PageWrapper, PageHeader } from '../../components/layout'
import { Card } from '../../components/ui'

// ── Base de datos de cuentas ─────────────────────────────────
const CUENTAS_INSTAGRAM = [
  {
    usuario:     '@joveninversor',
    nombre:      'Joven Inversor',
    descripcion: 'Inversiones, bolsa y finanzas personales para jóvenes argentinos. Contenido educativo sobre CEDEARs y acciones locales.',
    temas:       ['CEDEARs', 'Bolsa', 'Ahorro', 'Jóvenes'],
    url:         'https://www.instagram.com/joveninversor',
    emoji:       '📈',
    color:       '#E1306C',
  },
  {
    usuario:     '@mujer_financiera',
    nombre:      'Mujer Financiera',
    descripcion: 'Finanzas personales desde una perspectiva femenina. Presupuesto, ahorro y primeros pasos en inversiones.',
    temas:       ['Presupuesto', 'Ahorro', 'Inversiones', 'Mujer'],
    url:         'https://www.instagram.com/mujer_financiera',
    emoji:       '💜',
    color:       '#833AB4',
  },
  {
    usuario:     '@doctordetusfinanzas',
    nombre:      'Doctor de tus Finanzas',
    descripcion: 'Conceptos financieros explicados de forma simple. Desde qué es la inflación hasta cómo invertir en Argentina.',
    temas:       ['Educación', 'Conceptos', 'Argentina'],
    url:         'https://www.instagram.com/doctordetusfinanzas',
    emoji:       '🩺',
    color:       '#405DE6',
  },
  {
    usuario:     '@habitosfinancieros',
    nombre:      'Hábitos Financieros',
    descripcion: 'Tips prácticos para mejorar tu relación con el dinero día a día. Hábitos pequeños, resultados grandes.',
    temas:       ['Hábitos', 'Mentalidad', 'Tips'],
    url:         'https://www.instagram.com/habitosfinancieros',
    emoji:       '🌱',
    color:       '#F77737',
  },
  {
    usuario:     '@inversion_simple_arg',
    nombre:      'Inversión Simple Argentina',
    descripcion: 'Todo sobre el mercado de capitales argentino. Cómo empezar a invertir sin saber nada previo.',
    temas:       ['Mercado de Capitales', 'Principiantes', 'Argentina'],
    url:         'https://www.instagram.com/inversion_simple_arg',
    emoji:       '🏦',
    color:       '#FCAF45',
  },
  {
    usuario:     '@ecointeligente',
    nombre:      'Eco Inteligente',
    descripcion: 'Economía argentina explicada de forma accesible. Macro, inflación, tipo de cambio y su impacto en tu bolsillo.',
    temas:       ['Macroeconomía', 'Inflación', 'Dólar'],
    url:         'https://www.instagram.com/ecointeligente',
    emoji:       '📊',
    color:       '#4CAF50',
  },
  {
    usuario:     '@lanaplatuya',
    nombre:      'La Plata Tuya',
    descripcion: 'Dinero personal desde cero. Presupuestos, deudas, primeros ahorros y cómo hacer rendir más la plata.',
    temas:       ['Principiantes', 'Deudas', 'Presupuesto'],
    url:         'https://www.instagram.com/lanaplatuya',
    emoji:       '💰',
    color:       '#00BCD4',
  },
  {
    usuario:     '@inversiones_con_cafe',
    nombre:      'Inversiones con Café',
    descripcion: 'Charlas de inversiones simples, como una conversación con un amigo. CEDEARs, bonos y FCI explicados sin jerga.',
    temas:       ['CEDEARs', 'Bonos', 'FCI', 'Casual'],
    url:         'https://www.instagram.com/inversiones_con_cafe',
    emoji:       ☕,
    color:       '#795548',
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

// ── Componente de tarjeta de cuenta ─────────────────────────
function TarjetaCuenta({ cuenta, plataforma }) {
  const esYoutube = plataforma === 'youtube'

  return (
    <div className="flex flex-col gap-3 p-4 bg-white dark:bg-zinc-900
      border border-zinc-100 dark:border-zinc-800 rounded-2xl
      hover:border-zinc-200 dark:hover:border-zinc-700
      hover:shadow-md transition-all group">

      {/* Header */}
      <div className="flex items-start gap-3">
        <div className="w-11 h-11 rounded-2xl flex items-center justify-center text-xl flex-shrink-0"
          style={{ background: cuenta.color + '15' }}>
          {typeof cuenta.emoji === 'string' ? cuenta.emoji : '📱'}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="font-bold text-sm text-zinc-900 dark:text-white leading-tight">
              {cuenta.nombre}
            </p>
            {esYoutube && cuenta.suscriptores && (
              <span className="text-[9px] bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400
                px-1.5 py-0.5 rounded-full font-bold flex-shrink-0">
                🔴 {cuenta.suscriptores} subs
              </span>
            )}
          </div>
          <p className="text-[10px] text-zinc-400 font-mono mt-0.5">{cuenta.usuario}</p>
        </div>
      </div>

      {/* Descripción */}
      <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
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
        className={`flex items-center justify-center gap-2 py-2.5 rounded-xl
          text-xs font-bold transition-all active:scale-[0.98]
          ${esYoutube
            ? 'bg-red-500 hover:bg-red-600 text-white'
            : 'bg-[#E1306C] hover:bg-[#C01657] text-white'
          }`}
      >
        {esYoutube ? '▶️ Ver en YouTube' : '📸 Ver en Instagram'}
      </a>
    </div>
  )
}

// ── Página principal ─────────────────────────────────────────
export function RecursosPage() {
  const [tab, setTab] = useState('instagram')

  return (
    <div className="animate-in fade-in duration-500">
      <PageWrapper>
        <PageHeader
          titulo="📚 Recursos"
          subtitulo="Cuentas y canales para seguir aprendiendo"
        />

        {/* Intro */}
        <div className="mb-5 bg-[var(--mango)]/8 dark:bg-[var(--mango)]/5 rounded-2xl px-4 py-3
          border border-[var(--mango)]/15">
          <p className="text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed">
            🎓 La educación financiera es la mejor inversión. Estos creadores explican en español
            conceptos clave sobre ahorro, inversiones y finanzas personales para el contexto argentino.
          </p>
        </div>

        {/* Tabs */}
        <div className="flex bg-zinc-100 dark:bg-zinc-800 rounded-xl p-1 mb-5">
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

        {/* Grid de cuentas */}
        {tab === 'instagram' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {CUENTAS_INSTAGRAM.map(cuenta => (
              <TarjetaCuenta key={cuenta.usuario} cuenta={cuenta} plataforma="instagram" />
            ))}
          </div>
        )}

        {tab === 'youtube' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {CUENTAS_YOUTUBE.map(cuenta => (
              <TarjetaCuenta key={cuenta.usuario} cuenta={cuenta} plataforma="youtube" />
            ))}
          </div>
        )}

        <p className="text-[10px] text-zinc-400 text-center mt-8 pb-4">
          Estas cuentas son recomendaciones educativas. Manguito no tiene relación comercial con ninguna de ellas.
        </p>
      </PageWrapper>
    </div>
  )
}