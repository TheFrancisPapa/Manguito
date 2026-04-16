// src/pages/Chat/index.jsx
// ManguitoAI — Asistente de economía y finanzas para Argentina
// Reemplaza la página de mantenimiento con un chat completamente funcional.

import { useState, useRef, useEffect, useCallback, useMemo } from 'react'
import { useAuthContext } from '../../context/AuthContext'
import { supabase } from '../../lib/supabase'
import { useBalance, useUltimosMovimientos } from '../../hooks/useMovimientos'
import { useMetas } from '../../hooks/useMetas'
import { usePresupuestos } from '../../hooks/usePresupuestos'
import { PageWrapper } from '../../components/layout'

// ─── Rango del mes actual ───────────────────────────────────
function useRangoMesActual() {
  return useMemo(() => {
    const hoy = new Date()
    const desde = new Date(hoy.getFullYear(), hoy.getMonth(), 1).toLocaleDateString('sv-SE')
    const hasta = hoy.toLocaleDateString('sv-SE')
    return { desde, hasta }
  }, [])
}

// ─── Sugerencias de preguntas ───────────────────────────────
const SUGERENCIAS = [
  { emoji: '💵', texto: '¿Cómo cubrirme de la inflación?' },
  { emoji: '📈', texto: '¿Qué son los CEDEARs y cómo funciona el dólar MEP?' },
  { emoji: '🏦', texto: '¿Plazo fijo o FCI, qué conviene hoy?' },
  { emoji: '🇦🇷', texto: 'Explicame la situación económica de Argentina' },
  { emoji: '🧾', texto: '¿Cómo armar un fondo de emergencia?' },
  { emoji: '₿', texto: '¿Vale la pena invertir en cripto?' },
  { emoji: '🏠', texto: '¿Conviene comprar o alquilar en Argentina?' },
  { emoji: '💳', texto: '¿Cuándo conviene pagar en cuotas?' },
]

// ─── System prompt ──────────────────────────────────────────
function buildSystemPrompt(usuario, balance, metas, presupuestos) {
  const nombre = usuario?.nombre?.split(' ')[0] || 'usuario'
  const moneda = usuario?.moneda || 'ARS'

  const balanceInfo = balance
    ? `Ingresos este mes: $${Number(balance.total_ingresos || 0).toLocaleString('es-AR')} | Gastos: $${Number(balance.total_gastos || 0).toLocaleString('es-AR')} | Saldo neto: $${Number((balance.total_ingresos || 0) - (balance.total_gastos || 0)).toLocaleString('es-AR')}`
    : 'Sin datos financieros disponibles aún.'

  const metasInfo = metas.filter(m => m.estado === 'activa').length > 0
    ? metas.filter(m => m.estado === 'activa').map(m =>
        `${m.nombre} (${Math.round((m.monto_actual / m.monto_objetivo) * 100)}% completada)`
      ).join(', ')
    : 'Sin metas activas.'

  const presupInfo = presupuestos.filter(p => p.porcentaje > 80).length > 0
    ? `Presupuestos en alerta: ${presupuestos.filter(p => p.porcentaje > 80).map(p => p.categoria_nombre).join(', ')}`
    : 'Todos los presupuestos en orden.'

  const mesActualNombre = new Date().toLocaleString('es-AR', { month: 'long' })

  return `<ROL>
Nombre: ManguitoAI
Trabajo: Asistente financiero de la app Manguito
País: Argentina

[ REGLAS CORE ] => ESTRICTO CUMPLIMIENTO
1. Longitud máxima = 3 a 5 oraciones OR 3 a 5 bullets.
2. Nivel de dificultad = 0. Explicá todo como a un amigo que no entiende de economía.
3. Tecnicismos = Evitarlos. Si se usan -> (explicar en < 3 palabras).
4. Foco = Acción directa. Cero historia o relleno.
5. Temas complejos = Resumir en los 3 datos más urgentes.

[ DATOS DEL USUARIO ]
> Nombre: ${nombre}
> Moneda base: ${moneda}
> Balance ${mesActualNombre}: ${balanceInfo}
> Metas activas: ${metasInfo}
> Presupuesto: ${presupInfo}

[ DOMINIO DE CONOCIMIENTO ]
+ Economía ARG (Dólar, Inflación, BCRA)
+ Inversiones (CEDEARs, FCI, Plazo Fijo, Cripto)
+ Finanzas Personales & Mercado Inmobiliario

[ FORMATO Y ESTILO ]
* Dialecto: Español rioplatense (voseo).
* Tono: Cálido, directo y honesto ("No lo sé" es 100% válido).
* Emojis: <= 2 por mensaje.
* Énfasis: Usar **negritas** solo para números o acciones clave.
* Restricción: Rendimiento futuro != ganancia garantizada (nunca prometer nada).
* Cierre condicional: SI el tema tratado es complejo -> "¿Querés que profundice en algo?"

[ GATILLOS LÓGICOS ]
[ GATILLO: "SITUACIÓN PAÍS" ]
Activar SI el usuario pregunta por "cómo está la economía", "situación país" o "qué onda el dólar".
PROTOCOLO_CALLE:
1. PRIORIDAD: #1 Dólar (Blue vs MEP), #2 Inflación (mes + anual), #3 Termómetro diario (kilo de pan o litro de nafta).
2. ENSAMBLADO: Lista (máx 3 items), números crudos, impacto directo, cero filosofía.
3. CIERRE OBLIGATORIO: "¿Querés ver cómo ajustar tu presupuesto para este mes?"

[ GATILLO: "ALERTA ROJA / FIN DE MES" ]
Activar SI el usuario menciona "no llego", "me quedé sin plata", "estoy en rojo" o "tarjeta reventada".
PROTOCOLO_SALVAVIDAS:
1. EMPATÍA: Cero sermones. Validar la situación y pasar a la acción.
2. ANÁLISIS: #1 Diagnóstico (calcular pesos por día hasta fin de mes usando {balanceInfo}), #2 Freno de mano (identificar 2 gastos freezables en {presupInfo}), #3 Deuda (si menciona tarjeta, advertir costo de pago mínimo en 1 oración).
3. ENSAMBLADO: Bullet points. Contener primero, solucionar después.
4. CIERRE: "¿Querés que armemos un presupuesto de emergencia para los días que quedan?"

[ GATILLO: "EL IMPREVISTO / GASTO SORPRESA" ]
Activar SI el usuario menciona "se me rompió", "tuve que pagar", "gasto extra" o "emergencia".
PROTOCOLO_CONTINGENCIA:
1. RECALCULO: No juzgar el gasto. Buscar de dónde sacar la plata rápido.
2. ACCIÓN: #1 Fondo emergencia (revisar liquidez en {balanceInfo}), #2 Reasignación (mirar {presupInfo} y recortar 2 categorías de ocio/salidas), #3 Plan B (sugerir cuotas o financiamiento si el monto es grande).
3. ENSAMBLADO: Tranquilidad primero, solución matemática después.
4. CIERRE: "¿Aplicamos este ajuste en tu presupuesto?"`
}

// ─── Burbuja de mensaje ──────────────────────────────────────
function BurbujaChat({ msg, isLast }) {
  const esUser = msg.role === 'user'

  // Render simple: negritas con **, listas con -
  const renderText = (text) => {
    const parts = text.split(/(\*\*[^*]+\*\*|\n)/g)
    return parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={i}>{part.slice(2, -2)}</strong>
      }
      if (part === '\n') return <br key={i} />
      return part
    })
  }

  const renderContent = (text) => {
    const lines = text.split('\n')
    const result = []
    let listItems = []

    const flushList = () => {
      if (listItems.length > 0) {
        result.push(
          <ul key={result.length} className="my-1.5 space-y-1 pl-1">
            {listItems.map((li, i) => (
              <li key={i} className="flex gap-2 items-start">
                <span className="text-[var(--mango)] font-black mt-0.5 flex-shrink-0 text-xs">•</span>
                <span>{renderText(li)}</span>
              </li>
            ))}
          </ul>
        )
        listItems = []
      }
    }

    lines.forEach((line, idx) => {
      const trimmed = line.trim()
      if (trimmed.startsWith('- ') || trimmed.startsWith('• ')) {
        listItems.push(trimmed.slice(2))
      } else if (trimmed.match(/^\d+\.\s/)) {
        listItems.push(trimmed.replace(/^\d+\.\s/, ''))
      } else {
        flushList()
        if (trimmed) {
          result.push(
            <p key={idx} className="mb-1 last:mb-0 leading-relaxed">
              {renderText(trimmed)}
            </p>
          )
        }
      }
    })
    flushList()
    return result
  }

  if (esUser) {
    return (
      <div className={`flex justify-end ${isLast ? '' : ''}`}>
        <div className="max-w-[82%] sm:max-w-[70%]
          bg-gradient-to-br from-[var(--mango)] to-[var(--mango-dark)]
          text-[var(--charcoal)]
          px-4 py-3 rounded-[18px] rounded-tr-[6px]
          shadow-[0_2px_12px_rgba(245,166,35,0.3)]
          text-sm font-medium leading-relaxed">
          {msg.content}
        </div>
      </div>
    )
  }

  return (
    <div className="flex gap-2.5 items-start">
      {/* Avatar IA */}
      <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[var(--mango)]/20 to-[var(--mango-dark)]/20
        flex items-center justify-center text-base flex-shrink-0 mt-0.5
        border border-[var(--mango)]/20">
        🥭
      </div>

      <div className="max-w-[85%] sm:max-w-[75%]
        bg-white dark:bg-[var(--dark-card)]
        border border-zinc-100 dark:border-zinc-800
        px-4 py-3 rounded-[18px] rounded-tl-[6px]
        shadow-[var(--shadow-xs)]
        text-sm text-zinc-800 dark:text-zinc-100 leading-relaxed">
        {msg.typing ? (
          <TypingIndicator />
        ) : (
          renderContent(msg.content)
        )}
      </div>
    </div>
  )
}

// ─── Indicador de escritura ─────────────────────────────────
function TypingIndicator() {
  return (
    <div className="flex items-center gap-1 py-1 px-1">
      {[0, 1, 2].map(i => (
        <div key={i}
          className="w-2 h-2 rounded-full bg-[var(--mango)]"
          style={{
            animation: `bounce 1.2s ease-in-out ${i * 0.2}s infinite`,
          }}
        />
      ))}
      <style>{`
        @keyframes bounce {
          0%, 60%, 100% { transform: translateY(0); opacity: 0.4; }
          30% { transform: translateY(-6px); opacity: 1; }
        }
      `}</style>
    </div>
  )
}

// ─── Bienvenida ─────────────────────────────────────────────
function Bienvenida({ nombre, onSugerencia }) {
  return (
    <div className="flex flex-col items-center justify-center py-8 px-4 text-center animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Ícono animado */}
      <div className="relative mb-6">
        <div className="absolute inset-0 bg-[var(--mango)] blur-3xl opacity-20 rounded-full scale-150 animate-pulse" />
        <div className="relative w-20 h-20 rounded-3xl bg-gradient-to-br from-[var(--mango)]/20 to-[var(--mango-dark)]/10
          border border-[var(--mango)]/25 flex items-center justify-center text-4xl
          shadow-[0_8px_32px_rgba(245,166,35,0.2)]">
          🥭
        </div>
        {/* Dot verde "en línea" */}
        <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-emerald-500
          border-2 border-white dark:border-[var(--dark-bg)]
          flex items-center justify-center">
          <div className="w-2 h-2 rounded-full bg-white animate-pulse" />
        </div>
      </div>

      <h2 className="text-xl font-black font-display text-zinc-900 dark:text-white mb-2">
        Hola{nombre ? `, ${nombre}` : ''}! Soy ManguitoAI
      </h2>
      <p className="text-sm text-zinc-500 dark:text-zinc-400 max-w-xs leading-relaxed mb-8">
        Preguntame sobre economía, inflación, inversiones, el dólar, o cómo manejar mejor tu plata.
      </p>

      {/* Sugerencias */}
      <div className="w-full max-w-lg grid grid-cols-1 sm:grid-cols-2 gap-2">
        {SUGERENCIAS.map((s, i) => (
          <button
            key={i}
            onClick={() => onSugerencia(s.texto)}
            className="flex items-center gap-3 px-4 py-3 rounded-2xl text-left
              bg-white dark:bg-[var(--dark-card)]
              border border-zinc-100 dark:border-zinc-800
              hover:border-[var(--mango)]/40 hover:bg-[var(--mango)]/5 dark:hover:bg-[var(--mango)]/5
              transition-all active:scale-[0.98] press-scale
              shadow-[var(--shadow-xs)]
              animate-stagger opacity-0"
            style={{ animationDelay: `${i * 60}ms`, animationFillMode: 'forwards' }}
          >
            <span className="text-xl flex-shrink-0">{s.emoji}</span>
            <span className="text-xs font-medium text-zinc-600 dark:text-zinc-300 leading-tight">
              {s.texto}
            </span>
          </button>
        ))}
      </div>

      <p className="text-[10px] text-zinc-400 mt-6 max-w-xs">
        💡 ManguitoAI no constituye asesoramiento financiero profesional. Consultá un asesor habilitado para decisiones importantes.
      </p>
    </div>
  )
}

// ─── Página principal ────────────────────────────────────────
export function ChatPage() {
  const { usuario, session } = useAuthContext()
  const nombre = usuario?.nombre?.split(' ')[0] || ''

  const { desde, hasta } = useRangoMesActual()
  const { balance } = useBalance(desde, hasta)
  const { metas } = useMetas('activa')
  const { presupuestos } = usePresupuestos()

  const [mensajes, setMensajes] = useState([])
  const [input, setInput] = useState('')
  const [cargando, setCargando] = useState(false)
  const [error, setError] = useState(null)
  const [tokenCount, setTokenCount] = useState(0)

  const bottomRef = useRef(null)
  const inputRef = useRef(null)
  const abortRef = useRef(null)

  // Scroll al fondo cuando hay mensajes nuevos
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [mensajes])

  const systemPrompt = useMemo(
    () => buildSystemPrompt(usuario, balance, metas || [], presupuestos || []),
    [usuario, balance, metas, presupuestos]
  )

  const enviarMensaje = useCallback(async (texto) => {
    const textoFinal = (texto || input).trim()
    if (!textoFinal || cargando) return

    setInput('')
    setError(null)

    const msgUsuario = { role: 'user', content: textoFinal, id: Date.now() }
    const msgTyping  = { role: 'assistant', content: '', typing: true, id: Date.now() + 1 }

    setMensajes(prev => [...prev, msgUsuario, msgTyping])
    setCargando(true)

    // Historial para la API (excluir el placeholder de typing)
    const historialAPI = [
      ...mensajes.map(m => ({ role: m.role, content: m.content })),
      { role: 'user', content: textoFinal },
    ]

    try {
      const token = session?.access_token || ''

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          system: systemPrompt,
          messages: historialAPI,
          max_tokens: 600,
        }),
      })

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}))
        throw new Error(errData.error || `Error ${res.status}`)
      }

      const data = await res.json()
      const respuesta = data.text || 'No pude generar una respuesta. Intentá de nuevo.'

      // Reemplazar el placeholder de typing con la respuesta real
      setMensajes(prev =>
        prev.map(m =>
          m.typing
            ? { ...m, content: respuesta, typing: false }
            : m
        )
      )

      // Contar tokens aproximados
      setTokenCount(prev => prev + textoFinal.length + respuesta.length)
    } catch (err) {
      console.error('[ManguitoAI]', err)
      setError(err.message || 'Hubo un error al consultar la IA. Revisá tu conexión.')

      // Quitar el placeholder de typing
      setMensajes(prev => prev.filter(m => !m.typing))
    } finally {
      setCargando(false)
      setTimeout(() => inputRef.current?.focus(), 100)
    }
  }, [input, cargando, mensajes, session, systemPrompt])

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      enviarMensaje()
    }
  }

  const limpiarChat = () => {
    setMensajes([])
    setError(null)
    setTokenCount(0)
  }

  const hayMensajes = mensajes.length > 0

  return (
    <div className="flex flex-col h-screen bg-[var(--cream-soft)] dark:bg-[var(--dark-bg)]">

      {/* ── Header ── */}
      <header className="sticky top-0 z-30 flex-shrink-0
        bg-[var(--cream-soft)]/90 dark:bg-[var(--dark-bg)]/90 backdrop-blur-2xl
        border-b border-zinc-100 dark:border-zinc-800/60">
        <div className="max-w-2xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-2xl bg-gradient-to-br from-[var(--mango)]/20 to-[var(--mango-dark)]/20
              border border-[var(--mango)]/25 flex items-center justify-center text-lg relative">
              🥭
              <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-500
                border-2 border-white dark:border-[var(--dark-bg)] animate-live-dot" />
            </div>
            <div>
              <p className="text-sm font-bold font-display text-zinc-900 dark:text-white leading-tight">
                ManguitoAI
              </p>
              <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold leading-tight">
                En línea · Economía & Finanzas
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Token counter (sutil) */}
            {tokenCount > 0 && (
              <span className="text-[9px] text-zinc-400 bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 rounded-full font-mono hidden sm:block">
                ~{Math.round(tokenCount / 4)} tokens
              </span>
            )}

            {hayMensajes && (
              <button
                onClick={limpiarChat}
                className="text-xs font-semibold text-zinc-400 hover:text-red-500 transition-colors
                  px-3 py-1.5 rounded-xl hover:bg-red-50 dark:hover:bg-red-900/20"
                title="Limpiar chat"
              >
                Limpiar
              </button>
            )}
          </div>
        </div>
      </header>

      {/* ── Mensajes ── */}
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-2xl mx-auto px-4 py-4">
          {!hayMensajes ? (
            <Bienvenida
              nombre={nombre}
              onSugerencia={(texto) => enviarMensaje(texto)}
            />
          ) : (
            <div className="flex flex-col gap-4 pb-2">
              {mensajes.map((msg, i) => (
                <BurbujaChat
                  key={msg.id || i}
                  msg={msg}
                  isLast={i === mensajes.length - 1}
                />
              ))}
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="mt-3 flex items-center gap-3 px-4 py-3 rounded-2xl
              bg-red-50 dark:bg-red-900/15 border border-red-200 dark:border-red-800/40
              text-red-600 dark:text-red-400 text-sm animate-in slide-in-from-bottom-2">
              <span className="text-base flex-shrink-0">⚠️</span>
              <div className="flex-1">
                <p className="font-semibold text-xs">Error al conectar con la IA</p>
                <p className="text-xs opacity-80 mt-0.5">{error}</p>
              </div>
              <button
                onClick={() => setError(null)}
                className="text-xs underline font-bold flex-shrink-0"
              >
                OK
              </button>
            </div>
          )}

          {/* Sugerencias rápidas post-respuesta */}
          {hayMensajes && !cargando && !error && mensajes.length < 6 && (
            <div className="mt-4 flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
              {SUGERENCIAS.slice(4).map((s, i) => (
                <button
                  key={i}
                  onClick={() => enviarMensaje(s.texto)}
                  className="flex-shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-2xl
                    bg-white dark:bg-[var(--dark-card)]
                    border border-zinc-100 dark:border-zinc-800
                    hover:border-[var(--mango)]/40 hover:bg-[var(--mango)]/5
                    transition-all text-xs font-medium text-zinc-500 dark:text-zinc-400 press-scale"
                >
                  <span>{s.emoji}</span>
                  <span>{s.texto}</span>
                </button>
              ))}
            </div>
          )}

          <div ref={bottomRef} className="h-4" />
        </div>
      </main>

      {/* ── Input ── */}
      <footer className="flex-shrink-0 border-t border-zinc-100 dark:border-zinc-800/60
        bg-[var(--cream-soft)]/95 dark:bg-[var(--dark-bg)]/95 backdrop-blur-xl"
        style={{ paddingBottom: 'calc(env(safe-area-inset-bottom) + 12px)' }}>
        <div className="max-w-2xl mx-auto px-4 py-3">

          {/* Contexto financiero (colapsable, solo si hay datos) */}
          {balance && hayMensajes && (
            <div className="mb-2 flex items-center gap-2 px-3 py-1.5 rounded-xl
              bg-[var(--mango)]/8 dark:bg-[var(--mango)]/5
              border border-[var(--mango)]/15">
              <span className="text-[10px]">📊</span>
              <span className="text-[10px] text-zinc-500 dark:text-zinc-400 truncate">
                Contexto cargado: balance del mes, {(metas || []).filter(m => m.estado === 'activa').length} metas activas, {(presupuestos || []).length} presupuestos
              </span>
            </div>
          )}

          <div className="flex gap-2 items-end">
            <div className="flex-1 relative">
              <textarea
                ref={inputRef}
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={cargando}
                placeholder="Preguntame sobre economía, inversiones, el dólar..."
                rows={1}
                className="w-full bg-white dark:bg-[var(--dark-card)]
                  border-2 border-zinc-100 dark:border-zinc-700/50
                  rounded-[18px] px-4 py-3 pr-12
                  text-sm font-medium text-zinc-900 dark:text-white
                  placeholder:text-zinc-400 dark:placeholder:text-zinc-600
                  focus:outline-none focus:border-[var(--mango)]/60
                  focus:shadow-[0_0_0_3px_rgba(245,166,35,0.12)]
                  transition-all resize-none disabled:opacity-60
                  shadow-[var(--shadow-xs)]"
                style={{
                  maxHeight: '140px',
                  overflow: 'auto',
                }}
                onInput={e => {
                  e.target.style.height = 'auto'
                  e.target.style.height = Math.min(e.target.scrollHeight, 140) + 'px'
                }}
              />

              {/* Contador de caracteres */}
              {input.length > 200 && (
                <span className="absolute bottom-2.5 right-12 text-[9px] text-zinc-400 font-mono">
                  {input.length}
                </span>
              )}
            </div>

            {/* Botón enviar */}
            <button
              onClick={() => enviarMensaje()}
              disabled={!input.trim() || cargando}
              className="w-12 h-12 rounded-[16px] flex items-center justify-center
                bg-gradient-to-br from-[var(--mango)] to-[var(--mango-dark)]
                shadow-[0_4px_16px_rgba(245,166,35,0.4)]
                disabled:opacity-40 disabled:cursor-not-allowed
                active:scale-95 transition-all press-scale flex-shrink-0"
            >
              {cargando ? (
                <svg className="animate-spin w-5 h-5 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-20" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3"/>
                  <path className="opacity-80" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                </svg>
              ) : (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path d="M22 2L11 13" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M22 2L15 22L11 13L2 9L22 2Z" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              )}
            </button>
          </div>

          <p className="text-[9px] text-zinc-400 text-center mt-2">
            ManguitoAI puede cometer errores · No es asesoramiento financiero profesional
          </p>
        </div>
      </footer>
    </div>
  )
}