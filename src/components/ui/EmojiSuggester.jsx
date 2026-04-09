// src/components/ui/EmojiSuggester.jsx
// Smart emoji suggestion based on text input keywords
import { useState, useMemo } from 'react'

// ── Diccionario de palabras clave → emojis ──────────────────
const KEYWORD_EMOJIS = {
  // Comida & Bebida
  comida:       ['🍔', '🍽️', '🥗', '🍕', '🍳'],
  alimento:     ['🍔', '🥗', '🍽️', '🍕', '🍳'],
  restaurante:  ['🍽️', '🍕', '🍔', '🥂', '🍷'],
  super:        ['🛒', '🛍️', '🏷️', '🧺', '🥫'],
  mercado:      ['🛒', '🛍️', '🏷️', '🧺', '🥫'],
  delivery:     ['🛵', '📦', '🍔', '🍕', '📱'],
  cafe:         ['☕', '🫖', '🍵', '🧋', '🍩'],
  
  // Compras
  compra:       ['🛒', '🛍️', '🏷️', '💳', '🧺'],
  ropa:         ['👕', '👗', '👟', '🧥', '🛍️'],
  shopping:     ['🛍️', '🛒', '💳', '🏷️', '👗'],
  
  // Transporte
  transporte:   ['🚗', '🚌', '🚇', '🚕', '🛞'],
  auto:         ['🚗', '⛽', '🚙', '🔧', '🅿️'],
  nafta:        ['⛽', '🚗', '🛞', '🏎️', '🔧'],
  combustible:  ['⛽', '🚗', '🛞', '🛢️', '🔥'],
  uber:         ['🚕', '🚗', '📱', '🗺️', '🛣️'],
  taxi:         ['🚕', '🚗', '🏁', '🛣️', '📱'],
  subte:        ['🚇', '🚌', '🎫', '🛤️', '🚆'],
  bondi:        ['🚌', '🚇', '🎫', '🛤️', '🚏'],
  colectivo:    ['🚌', '🚇', '🎫', '🛤️', '🚏'],
  
  // Hogar
  casa:         ['🏠', '🔑', '🏡', '🛋️', '💡'],
  hogar:        ['🏠', '🔑', '🏡', '🛋️', '💡'],
  alquiler:     ['🏠', '🔑', '📋', '🏢', '💰'],
  luz:          ['💡', '⚡', '🔌', '🏠', '📊'],
  gas:          ['🔥', '🏠', '📊', '💨', '🔌'],
  agua:         ['💧', '🚿', '🏠', '📊', '🔌'],
  servicio:     ['📋', '🏠', '💡', '📱', '💻'],
  
  // Salud
  salud:        ['🏥', '💊', '🩺', '❤️‍🩹', '🧘'],
  medico:       ['🩺', '🏥', '💊', '🩻', '❤️'],
  farmacia:     ['💊', '🏥', '🩺', '🩹', '💉'],
  gym:          ['🏋️', '💪', '🧘', '🏃', '🤸'],
  gimnasio:     ['🏋️', '💪', '🧘', '🏃', '🤸'],
  deporte:      ['⚽', '🏋️', '🏃', '🎾', '🏊'],
  
  // Educación
  estudio:      ['📚', '🎓', '📝', '💻', '🧠'],
  universidad:  ['🎓', '📚', '🏫', '📝', '🧠'],
  curso:        ['📚', '🎓', '💻', '📝', '🧠'],
  libro:        ['📚', '📖', '📕', '🔖', '✏️'],
  
  // Entretenimiento
  entreteni:    ['🎬', '🎮', '🎵', '🎭', '🍿'],
  cine:         ['🎬', '🍿', '🎥', '🎞️', '📽️'],
  juego:        ['🎮', '🕹️', '🎲', '🎯', '🏆'],
  musica:       ['🎵', '🎧', '🎸', '🎤', '🎶'],
  streaming:    ['📺', '🎬', '📱', '🍿', '🎧'],
  netflix:      ['📺', '🎬', '🍿', '📱', '🎞️'],
  spotify:      ['🎵', '🎧', '🎶', '📱', '🎤'],
  
  // Tecnología
  tecnologia:   ['💻', '📱', '🖥️', '⌨️', '🔌'],
  celular:      ['📱', '💻', '📲', '🔋', '📡'],
  internet:     ['🌐', '📶', '📱', '💻', '🔌'],
  
  // Viaje
  viaje:        ['✈️', '🌍', '🗺️', '🏖️', '🧳'],
  vacacion:     ['🏖️', '✈️', '🌴', '🗺️', '🧳'],
  avion:        ['✈️', '🛫', '🌍', '🧳', '🗺️'],
  hotel:        ['🏨', '🛏️', '🗝️', '✈️', '🌍'],
  
  // Finanzas
  ahorro:       ['🐷', '💰', '🏦', '📈', '💎'],
  inversion:    ['📈', '💹', '🏦', '💰', '📊'],
  deuda:        ['💳', '📉', '🏦', '💸', '📋'],
  tarjeta:      ['💳', '🏦', '💰', '📱', '🔐'],
  impuesto:     ['🏛️', '📋', '💰', '📊', '🏦'],
  
  // Mascota
  mascota:      ['🐕', '🐈', '🐾', '🦴', '🐟'],
  perro:        ['🐕', '🐾', '🦴', '🐶', '🎾'],
  gato:         ['🐈', '🐾', '🐱', '🐟', '🧶'],
  
  // Personal
  regalo:       ['🎁', '🎀', '💝', '🎂', '🎉'],
  cumple:       ['🎂', '🎁', '🎉', '🎈', '🥳'],
  fiesta:       ['🎉', '🥳', '🎈', '🍻', '🎊'],
  
  // Metas comunes
  telefono:     ['📱', '💻', '📲', '🔋', '📡'],
  moto:         ['🏍️', '🛵', '⛽', '🔧', '🛞'],
  bici:         ['🚲', '🚴', '🔧', '🛞', '🏃'],
  departamento: ['🏢', '🔑', '🏠', '🏗️', '📋'],
  mudanza:      ['📦', '🏠', '🚛', '🔑', '🏢'],
  boda:         ['💒', '💍', '🥂', '🎂', '💐'],
  emergencia:   ['🚨', '🏥', '💰', '🆘', '🔴'],
  fondo:        ['🏦', '💰', '🐷', '📈', '🔐'],
}

// ── Buscar emojis por texto ─────────────────────────────────
function buscarEmojis(texto) {
  if (!texto || texto.trim().length < 2) return []
  
  const lower = texto.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
  const palabras = lower.split(/\s+/)
  
  // Buscar match parcial en keywords
  const scores = {}
  
  for (const [keyword, emojis] of Object.entries(KEYWORD_EMOJIS)) {
    const keyNorm = keyword.normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    
    for (const palabra of palabras) {
      if (keyNorm.includes(palabra) || palabra.includes(keyNorm)) {
        const score = keyNorm === palabra ? 10 : keyNorm.startsWith(palabra) ? 5 : 1
        for (const emoji of emojis) {
          scores[emoji] = (scores[emoji] || 0) + score
        }
      }
    }
  }
  
  // Ordenar por score y tomar top 5
  const sorted = Object.entries(scores)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([emoji]) => emoji)
  
  return sorted
}

// ── Fallback emojis ─────────────────────────────────────────
const FALLBACK = ['📋', '📦', '💼', '⭐', '🔖']

// ── Componente EmojiSuggester ───────────────────────────────
export function EmojiSuggester({ texto, valor, onChange, label = 'Elegí un ícono' }) {
  const [customMode, setCustomMode] = useState(false)
  const [customEmoji, setCustomEmoji] = useState('')
  
  const sugeridos = useMemo(() => {
    const encontrados = buscarEmojis(texto)
    return encontrados.length > 0 ? encontrados : FALLBACK
  }, [texto])
  
  const handleSelect = (emoji) => {
    setCustomMode(false)
    onChange(emoji)
  }
  
  const handleCustom = () => {
    if (customEmoji.trim()) {
      onChange(customEmoji.trim())
      setCustomMode(false)
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <label className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">
        {label}
      </label>
      
      {!customMode ? (
        <div className="flex items-center gap-2">
          {sugeridos.map((emoji, i) => (
            <button
              key={emoji + i}
              type="button"
              onClick={() => handleSelect(emoji)}
              className={`w-11 h-11 rounded-[14px] flex items-center justify-center text-xl
                transition-all duration-200 press-scale
                animate-stagger opacity-0
                ${valor === emoji 
                  ? 'bg-[var(--mango)]/15 border-2 border-[var(--mango)] scale-110 shadow-sm' 
                  : 'bg-zinc-50 dark:bg-zinc-800/50 border-2 border-transparent hover:border-zinc-200 dark:hover:border-zinc-700 hover:scale-105'
                }`}
              style={{ animationDelay: `${i * 60}ms`, animationFillMode: 'forwards' }}
            >
              {emoji}
            </button>
          ))}
          
          {/* Botón personalizar */}
          <button
            type="button"
            onClick={() => setCustomMode(true)}
            className={`w-11 h-11 rounded-[14px] flex items-center justify-center text-xs font-bold
              transition-all duration-200 press-scale
              animate-stagger opacity-0
              ${!sugeridos.includes(valor) && valor !== '🎯' && valor !== '📊'
                ? 'bg-[var(--mango)]/15 border-2 border-[var(--mango)]'
                : 'bg-zinc-50 dark:bg-zinc-800/50 border-2 border-dashed border-zinc-200 dark:border-zinc-700 hover:border-[var(--mango)]/40'
              }
              text-zinc-400 dark:text-zinc-500`}
            style={{ animationDelay: `${sugeridos.length * 60}ms`, animationFillMode: 'forwards' }}
            title="Elegir emoji personalizado"
          >
            ✏️
          </button>
        </div>
      ) : (
        <div className="flex items-center gap-2 animate-fade-up">
          <input
            type="text"
            value={customEmoji}
            onChange={e => setCustomEmoji(e.target.value)}
            placeholder="Pegá tu emoji..."
            maxLength={4}
            className="field-base text-center text-2xl w-16 !py-2 !rounded-[14px]"
            autoFocus
          />
          <button
            type="button"
            onClick={handleCustom}
            disabled={!customEmoji.trim()}
            className="px-3 py-2 rounded-xl text-xs font-bold
              bg-[var(--mango)] text-white
              disabled:opacity-40 press-scale transition-all"
          >
            Usar
          </button>
          <button
            type="button"
            onClick={() => setCustomMode(false)}
            className="px-3 py-2 rounded-xl text-xs font-medium
              text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors"
          >
            Volver
          </button>
        </div>
      )}
      
      {/* Preview del seleccionado */}
      {valor && (
        <p className="text-[10px] text-zinc-400 dark:text-zinc-500">
          Seleccionado: <span className="text-base">{valor}</span>
        </p>
      )}
    </div>
  )
}

// ── Función utilitaria para sugerir categorías ──────────────
// Dado un nombre de presupuesto, sugiere categorías existentes que matchean
const CATEGORY_KEYWORDS = {
  'comida':      ['comida', 'aliment', 'restaur', 'delivery', 'super', 'mercado', 'cafe'],
  'compras':     ['compra', 'ropa', 'shopping', 'tienda'],
  'transporte':  ['transport', 'auto', 'nafta', 'combustible', 'uber', 'taxi', 'subte', 'bondi', 'colectivo', 'moto'],
  'hogar':       ['casa', 'hogar', 'alquiler', 'luz', 'gas', 'agua', 'servicio'],
  'salud':       ['salud', 'medic', 'farmacia', 'gym', 'gimnasio', 'deporte'],
  'educación':   ['estudio', 'universidad', 'curso', 'libro', 'educac'],
  'entretenimiento': ['entreteni', 'cine', 'juego', 'musica', 'streaming', 'netflix', 'spotify'],
  'tecnología':  ['tecnolog', 'celular', 'internet', 'computador', 'pc'],
}

export function sugerirCategorias(nombre, categoriasDisponibles) {
  if (!nombre || nombre.trim().length < 2) return []
  
  const lower = nombre.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
  const palabras = lower.split(/\s+/)
  
  const scores = {}
  
  for (const cat of categoriasDisponibles) {
    const catName = cat.nombre.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    let score = 0
    
    // Direct match con nombre de categoría
    for (const palabra of palabras) {
      if (catName.includes(palabra) || palabra.includes(catName)) {
        score += catName === palabra ? 20 : 10
      }
    }
    
    // Match via keyword dictionary
    for (const [catKey, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
      if (catName.includes(catKey) || catKey.includes(catName)) {
        for (const palabra of palabras) {
          for (const kw of keywords) {
            if (kw.includes(palabra) || palabra.includes(kw)) {
              score += 5
            }
          }
        }
      }
    }
    
    if (score > 0) {
      scores[cat.id] = { cat, score }
    }
  }
  
  return Object.values(scores)
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)
    .map(s => s.cat)
}

// Export buscarEmojis for external use
export { buscarEmojis }
