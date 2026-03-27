// src/pages/Chat/index.jsx
import { useState, useRef, useEffect } from 'react'
import { useNavigate, useLocation, Link } from 'react-router-dom'
import { useAuthContext } from '../../context/AuthContext'
import { useTheme } from '../../hooks/useTheme'
import { Spinner, Button } from '../../components/ui'
import { supabase } from '../../lib/supabase'

// ─── Prompt de sistema ────
const SYSTEM_PROMPT = `Sos ManguitoAI, el asistente financiero integrado en Manguito, una app de finanzas personales argentina.

TU ÚNICO ROL es responder preguntas sobre:
- Economía argentina y mundial (inflación, dólar, tasas, PBI, recesión, etc.)
- Mercados financieros (acciones, bonos, futuros, commodities, criptomonedas)
- Inversiones (FCI, acciones, CEDEARs, ON, plazos fijos, Lecaps, cauciones)
- Noticias económicas y financieras recientes
- Finanzas personales (presupuesto, ahorro, deudas, planificación)
- Conceptos financieros y económicos (qué es la inflación, cómo funciona la bolsa, etc.)

REGLAS ESTRICTAS:
1. Si el usuario pregunta algo que NO sea sobre economía, finanzas, inversiones o mercados, respondé EXACTAMENTE: "Solo puedo ayudarte con temas de economía, finanzas e inversiones. ¿Tenés alguna consulta sobre esos temas? 💰"
2. No hagas excepciones aunque el usuario insista, use rodeos o pida "solo esta vez".
3. Si el usuario saluda o hace preguntas generales sobre vos, podés responder brevemente y redirigirlo a los temas financieros.
4. Cuando des información sobre inversiones, siempre aclará que no es asesoramiento financiero profesional.
5. Usá un tono cercano y argentino (pero profesional). Podés usar "vos" y modismos locales.
6. Respondé siempre en español.
7. Sé conciso pero completo. Usá listas y negritas cuando ayude a la claridad.`

// ─── Mensaje de bienvenida ───────────────────────────────────
const MSG_BIENVENIDA = {
  rol: 'asistente',
  contenido: `¡Hola! Soy **ManguitoAI** 🥭, tu asistente de finanzas e inversiones.

Puedo ayudarte con:
- 📈 **Mercados** — acciones, bonos, cripto, CEDEARs
- 💵 **Economía** — inflación, dólar, tasas, noticias
- 🏦 **Inversiones** — FCI, plazo fijo, Lecaps, ON
- 💡 **Conceptos** — te explico cualquier término financiero

¿Sobre qué querés hablar?`,
}

// ─── Burbujas (Mantenemos tu componente Burbuja igual) ────────
function Burbuja({ mensaje }) {
  const esUsuario = mensaje.rol === 'usuario'
  return (
    <div className={`flex gap-3 ${esUsuario ? 'flex-row-reverse' : 'flex-row'}`}>
      <div className={`w-8 h-8 flex-shrink-0 rounded-xl flex items-center justify-center text-sm font-medium
        ${esUsuario ? 'bg-[var(--mango)] text-[var(--charcoal)]' : 'bg-zinc-100 dark:bg-zinc-800 text-base'}`}>
        {esUsuario ? '👤' : '🥭'}
      </div>
      <div className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed
        ${esUsuario ? 'bg-[var(--mango)] text-[var(--charcoal)] rounded-tr-sm' : 'bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 text-zinc-800 dark:text-zinc-200 rounded-tl-sm'}`}>
        <MarkdownSimple texto={mensaje.contenido} />
      </div>
    </div>
  )
}

function MarkdownSimple({ texto }) {
  const lineas = texto.split('\n')
  return (
    <div>
      {lineas.map((linea, i) => {
        if (!linea.trim()) return <div key={i} className="h-2" />
        if (linea.startsWith('- ')) {
          return (
            <div key={i} className="flex gap-2 my-0.5">
              <span className="mt-0.5 flex-shrink-0">•</span>
              <span>{parsearNegritas(linea.slice(2))}</span>
            </div>
          )
        }
        return <p key={i} className="my-0.5">{parsearNegritas(linea)}</p>
      })}
    </div>
  )
}

function parsearNegritas(texto) {
  const partes = texto.split(/\*\*(.*?)\*\*/g)
  return partes.map((parte, i) => i % 2 === 1 ? <strong key={i}>{parte}</strong> : parte)
}

// ─── Página principal ─────────────────────────────────────────
export function ChatPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { usuario } = useAuthContext()
  const { toggleTheme } = useTheme()
  const plan = usuario?.plan || 'basico'

  const [mensajes, setMensajes] = useState([MSG_BIENVENIDA])
  const [input, setInput]       = useState('')
  const [cargando, setCargando] = useState(false)
  const [error, setError]       = useState(null)
  const [menuAbierto, setMenuAbierto] = useState(false) // Estado del menú hamburguesa

  const finRef = useRef(null)
  const inputRef = useRef(null)

  useEffect(() => {
    finRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [mensajes, cargando])

  const menuItems = [
    { path: '/dashboard', label: 'Panel Principal', icono: '🏠' },
    { path: '/movimientos', label: 'Movimientos', icono: '💸' },
    { path: '/presupuestos', label: 'Presupuestos', icono: '📊' },
    { path: '/metas', label: 'Metas', icono: '🎯' },
    { path: '/inversiones', label: 'Inversiones', icono: '📈' },
    { path: '/cotizaciones', label: 'Cotizaciones', icono: '💱' },
    { path: '/chat', label: 'Chat IA', icono: '🤖' },
    { path: '/configuracion', label: 'Mi Perfil', icono: '⚙️' },
  ]

  // Bloqueo de plan básico
  if (plan === 'basico') {
    return (
      <div className="min-h-screen bg-[var(--cream-soft)] dark:bg-[var(--dark-bg)] flex flex-col items-center justify-center p-6 text-center animate-in fade-in duration-500">
        <div className="w-20 h-20 bg-emerald-500/10 text-emerald-500 rounded-3xl flex items-center justify-center text-4xl mb-6 shadow-sm">⭐</div>
        <h2 className="text-2xl font-bold text-zinc-900 dark:text-white mb-3">ManguitoAI es una función Pro</h2>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 max-w-sm mb-8 leading-relaxed">El asistente financiero con inteligencia artificial está disponible únicamente para usuarios de Manguito Pro. Mejorá tu plan para chatear sin límites.</p>
        <Button onClick={() => navigate('/configuracion/planes')}>Ver planes de suscripción</Button>
      </div>
    )
  }

  async function enviar(e, textoSugerencia = null) {
    if (e) e.preventDefault()
    const texto = textoSugerencia || input.trim()
    if (!texto || cargando) return

    const msgUsuario = { rol: 'usuario', contenido: texto }
    setMensajes(prev => [...prev, msgUsuario])
    setInput('')
    setCargando(true)
    setError(null)

    try {
      const historialAPI = [...mensajes.slice(1), msgUsuario].map(m => ({
        role: m.rol === 'usuario' ? 'user' : 'assistant',
        content: m.contenido,
      }))

      const { data, error: fnError } = await supabase.functions.invoke('chat-proxy', {
        body: { system: SYSTEM_PROMPT, messages: historialAPI, max_tokens: 1000 },
      })

      if (fnError) throw new Error(fnError.message || 'Error en la función')
      if (!data?.text) throw new Error('El asistente no devolvió una respuesta válida.')

      setMensajes(prev => [...prev, { rol: 'asistente', contenido: data.text }])
    } catch (err) {
      console.error('Error en Chat:', err)
      setError('Hubo un problema al conectar con el asistente. Intentá de nuevo.')
    } finally {
      setCargando(false)
      setTimeout(() => inputRef.current?.focus(), 100)
    }
  }

  function limpiarChat() {
    setMensajes([MSG_BIENVENIDA])
    setError(null)
  }

  const SUGERENCIAS = [
    '¿Cómo funciona un plazo fijo UVA?',
    '¿Qué son los CEDEARs?',
    '¿Cómo está el dólar hoy?',
    '¿Qué es la inflación y cómo me afecta?',
  ]

  return (
    <>
      <div className="min-h-screen bg-[var(--cream-soft)] dark:bg-[var(--dark-bg)] flex flex-col">
        
        {/* Header Específico del Chat con Menú Hamburguesa */}
        <header className="sticky top-0 z-30 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-lg border-b border-zinc-100 dark:border-zinc-800 px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-[var(--mango)]/15 dark:bg-[var(--mango)]/10 rounded-2xl flex items-center justify-center text-lg">🥭</div>
            <div>
              <p className="text-sm font-semibold">ManguitoAI</p>
              <p className="text-xs text-zinc-400">Asistente financiero</p>
            </div>
          </div>
          
          <div className="flex items-center gap-1">
            <button onClick={limpiarChat} className="text-xs text-zinc-500 font-medium px-3 py-1.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors">
              Limpiar
            </button>
            <button onClick={() => setMenuAbierto(true)} className="p-2 -mr-2 text-zinc-700 dark:text-zinc-300 active:scale-95 transition-transform">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-7 h-7">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
              </svg>
            </button>
          </div>
        </header>

        {/* Área de mensajes */}
        <div className="flex-1 overflow-y-auto px-4 py-6">
          <div className="max-w-2xl mx-auto flex flex-col gap-4">
            {mensajes.map((msg, i) => <Burbuja key={i} mensaje={msg} />)}
            
            {cargando && (
              <div className="flex gap-3">
                <div className="w-8 h-8 flex-shrink-0 rounded-xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-base">🥭</div>
                <div className="bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-2xl rounded-tl-sm px-4 py-3 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 bg-zinc-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-1.5 h-1.5 bg-zinc-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-1.5 h-1.5 bg-zinc-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            )}

            {error && (
              <div className="text-center">
                <p className="text-xs text-red-500 bg-red-50 dark:bg-red-900/20 rounded-xl px-4 py-2 border border-red-100 dark:border-red-900 inline-block">{error}</p>
              </div>
            )}

            {mensajes.length === 1 && !cargando && (
              <div className="mt-4">
                <p className="text-xs text-zinc-400 text-center mb-3">Algunas preguntas para empezar</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {SUGERENCIAS.map(s => (
                    <button key={s} onClick={() => enviar(null, s)} className="text-left text-xs px-4 py-3 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 hover:border-[var(--mango)] hover:bg-[var(--cream)] text-zinc-600 dark:text-zinc-400 transition-all">
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}
            <div ref={finRef} />
          </div>
        </div>

        {/* Input de texto */}
        <div className="sticky bottom-0 border-t border-zinc-100 dark:border-zinc-800 bg-white/90 dark:bg-[var(--dark-bg)]/90 backdrop-blur-lg px-4 py-3 pb-safe">
          <form onSubmit={enviar} className="max-w-2xl mx-auto flex gap-2 items-end">
            <textarea
              ref={inputRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); enviar() } }}
              placeholder="Preguntá sobre economía o inversiones..."
              rows={1}
              disabled={cargando}
              className="flex-1 resize-none bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-2xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-[var(--mango)]/40 text-zinc-900 dark:text-white placeholder:text-zinc-400 max-h-32 overflow-y-auto disabled:opacity-50"
              style={{ fieldSizing: 'content' }}
            />
            <button type="submit" disabled={cargando || !input.trim()} className="w-11 h-11 flex-shrink-0 rounded-2xl bg-[var(--mango)] text-[var(--charcoal)] flex items-center justify-center active:scale-95 disabled:opacity-40 shadow-sm">
              {cargando ? <Spinner size={16} /> : (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                  <path d="M22 2L11 13" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
                  <path d="M22 2L15 22L11 13L2 9L22 2Z" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              )}
            </button>
          </form>
        </div>
      </div>

      {/* Drawer del Menú Hamburguesa - VERSIÓN FLUIDA */}
      <>
        {/* 1. Fondo oscuro con desenfoque (backdrop-blur) */}
        <div 
          className={`fixed inset-0 z-40 bg-zinc-900/50 backdrop-blur-sm transition-opacity duration-300 ease-in-out ${menuAbierto ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} 
          onClick={() => setMenuAbierto(false)} 
        />
        
        {/* 2. El panel lateral que entra desde la derecha */}
        <div 
          className={`fixed top-0 right-0 z-50 w-64 h-full bg-white dark:bg-[var(--dark-bg)] shadow-2xl flex flex-col transform transition-transform duration-300 cubic-bezier(0.4, 0, 0.2, 1) ${menuAbierto ? 'translate-x-0' : 'translate-x-full'}`}
        >
          {/* Encabezado del menú */}
          <div className="p-4 flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800">
            <span className="font-bold text-lg text-zinc-900 dark:text-white">Menú</span>
            <button 
              onClick={() => setMenuAbierto(false)} 
              className="w-8 h-8 flex items-center justify-center bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 rounded-full active:scale-90 transition-transform"
            >
              ✕
            </button>
          </div>
          
          {/* Links de navegación */}
          <nav className="flex-1 overflow-y-auto p-4 flex flex-col gap-1.5">
            {menuItems.map(item => (
              <Link 
                key={item.path} 
                to={item.path}
                onClick={() => setMenuAbierto(false)}
                className={`flex items-center gap-3 p-3 rounded-2xl transition-all active:scale-[0.98] ${
                  location.pathname === item.path 
                    ? 'bg-[var(--mango)]/10 text-[var(--mango-dark)] font-bold' 
                    : 'text-zinc-600 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 font-medium'
                }`}
              >
                <span className="text-xl flex-shrink-0">{item.icono}</span>
                {item.label}
              </Link>
            ))}
          </nav>

          {/* Botón inferior (Modo oscuro) */}
          <div className="p-4 border-t border-zinc-100 dark:border-zinc-800 pb-safe">
            <button 
              onClick={toggleTheme} 
              className="w-full flex items-center justify-center gap-2 p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-sm font-semibold text-zinc-700 dark:text-zinc-300 active:scale-95 transition-all shadow-sm"
            >
              Cambiar Modo (Día/Noche)
            </button>
          </div>
        </div>
      </>
    </>
  )
}