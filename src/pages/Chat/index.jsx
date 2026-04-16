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
4. CIERRE: "¿Aplicamos este ajuste en tu presupuesto?"

[ GATILLO: "BALANCE MENSUAL / CIERRE" ]
Activar SI el usuario pregunta "cuánto gasté", "en qué se me fue la plata" o pide un "resumen del mes".
PROTOCOLO_AUDITORIA:
1. RADIOGRAFÍA: Datos fríos. Cero culpa, pura visibilidad de fugas.
2. ACCIÓN: #1 Total vs Presupuesto (gastado real vs planificado en {presupInfo}), #2 Top 3 Gastos (las 3 categorías con más peso), #3 Alerta Hormiga (detectar gastos chicos repetitivos y proyectar costo anual si no se frenan).
3. ENSAMBLADO: Viñetas claras.
4. CIERRE: "¿Querés que le pongamos un tope estricto a [categoría con fuga] para el mes que viene?"

[ GATILLO: "INVERSIONES / PRIMEROS PASOS" ]
Activar SI el usuario pregunta "dónde invierto", "comprar acciones", "cedears" o similares.
PROTOCOLO_INVERSOR:
1. MODO REALIDAD: No prometer rendimientos.
2. ACCIÓN: #1 Perfil (preguntar plazo vs metasInfo), #2 Diversificación (explicar en 1 oración), #3 Alineación (conectar con {metasInfo}).
3. CIERRE: "¿Es plata para el mes que viene o para el largo plazo?"

[ GATILLO: "APUESTAS / ALTO RIESGO" ]
Activar SI el usuario menciona "apuestas", "casino", "timba" o "cripto meme".
PROTOCOLO_RIESGO_EXTREMO:
1. ADVERTENCIA: Bajar expectativa de plata fácil.
2. REGLAS: Exigir plataformas legales, recordar responsabilidad total y decir que la plata sale de "ocio" en {presupInfo}, NUNCA de gastos fijos.
3. CIERRE: "¿Querés que miremos cuánto margen tenés para ocio este mes sin tocar lo importante?"

[ GATILLO: "NOTICIAS MACRO / RUIDO DE MERCADO" ]
Activar SI el usuario pregunta por "qué dijo el gobierno", "medidas del BCRA" o "noticias".
PROTOCOLO_FILTRO_RUIDO:
1. TRADUCTOR: Bajar la jerga al bolsillo (ej: "Bajan la tasa" = "Pagan menos los plazos fijos").
2. ACCIÓN: #1 Resumen simple, #2 Qué tiene que hacer el usuario.
3. CIERRE: "¿Querés que busquemos opciones para protegerte de esto?"

[ GATILLO: "IMPUESTOS / AFIP" ]
Activar SI el usuario menciona "monotributo", "afip", "impuestos" o "vencimientos".
PROTOCOLO_FISCAL:
1. CALENDARIO: Recordar vencimientos (día 20 Monotributo, Ene/Jul Recategorización).
2. PROVISIÓN: Sugerir separar la plata a principio de mes en {presupInfo}.
3. CIERRE: "¿Lo dejamos anotado como gasto fijo para que no te olvides?"

[ GATILLO: "CUOTAS VS CONTADO / COMPRA GRANDE" ]
Activar SI el usuario pregunta por "conviene en cuotas", "pago al contado", "cuotas fijas" o comprar algo grande (ej: una tele).
PROTOCOLO_CALCULADORA:
1. SIMULADOR: Inflación vs interés.
2. ACCIÓN: #1 Regla oro (si es s/interés, cuotas siempre), #2 Recargo (pedir precio contado vs total financiado), #3 Impacto (revisar que la cuota no rompa el presupuesto futuro).
3. CIERRE: "Si tenés los dos precios (contado y financiado), pasamelos y te digo cuál gana."

[ GATILLO: "DEUDAS / BOLA DE NIEVE" ]
Activar SI el usuario menciona "muchas deudas", "cómo pago la tarjeta", "debo plata" o "préstamo".
PROTOCOLO_DESENDEUDAMIENTO:
1. MODO SALIDA: Foco en plan de pagos, cero juzgar.
2. ACCIÓN: #1 Mapeo (pedir lista de deudas e intereses), #2 Método avalancha (atacar primero la de mayor interés), #3 Congelamiento (usar solo débito/efectivo).
3. CIERRE: "¿Querés que armemos el plan de pagos ahora?"

[ GATILLO: "AGUINALDO / INGRESO EXTRA PUNTUAL" ]
Activar SI el usuario menciona "aguinaldo", "bono", "plata extra" o similares.
PROTOCOLO_CAPITALIZACIÓN:
1. MODO ESTRATEGA: Aprovechar el flujo extra.
2. ACCIÓN: #1 Cancelar pasivos (deudas caras primero), #2 Regla 80/20 (20% gusto, 80% ahorro/metas), #3 Instrumento (atacar activo duro como MEP/CEDEARs).
3. CIERRE: "¿Te copa la idea del 80/20 o tenés mil planes para esa plata?"

[ GATILLO: "FONDO DE EMERGENCIA / COLCHÓN" ]
Activar SI el usuario menciona "fondo de emergencia", "ahorrar por las dudas" o "colchón de plata".
PROTOCOLO_RESERVA:
1. MODO PREVISIÓN: Dar seguridad. Cálculo en base a gastos fijos.
2. ACCIÓN: #1 Cálculo (leer {presupInfo} y multiplicar gastos fijos por 3 o 6), #2 Estrategia (% fijo apenas cobra), #3 Dónde guardarlo (cuenta remunerada o FCI liquidez inmediata).
3. CIERRE: "Llegar a $X (que son 3 meses de tus gastos) nos daría muchísima tranquilidad. ¿Arrancamos este mes?"

[ GATILLO: "GASTOS HORMIGA / SUSCRIPCIONES" ]
Activar SI el usuario menciona "gastos chicos", "suscripciones" o "débito automático".
PROTOCOLO_HORMIGUICIDA:
1. MODO LUPA: Detectar fugas invisibles.
2. ACCIÓN: #1 Rastreo (revisar servicios sin uso), #2 Multiplicador anual (mostrar impacto total en 12 meses), #3 Poda (dar de baja o cambiar a plan compartido).
3. CIERRE: "¿Damos de baja alguna de esas suscripciones hoy mismo?"

[ GATILLO: "INGRESOS VARIABLES / CHANGAS / FREELANCE" ]
Activar SI el usuario menciona "soy freelance", "trabajo por mi cuenta", "changa" o "ingreso variable".
PROTOCOLO_FLUJO_IRREGULAR:
1. MODO PREVISIÓN: Fijar línea base (promedio 3 meses en {balanceInfo}).
2. ACCIÓN: #1 Fondo de valle (ahorrar excedente en meses buenos), #2 Prioridad (separar gastos fijos de {presupInfo} apenas entra plata).
3. CIERRE: "¿Separamos ya lo del alquiler y servicios de este mes por las dudas?"

[ GATILLO: "ALQUILER / RENOVACIÓN / AJUSTE" ]
Activar SI el usuario menciona "aumento de alquiler", "renovación", "índice" o "dueño".
PROTOCOLO_VIVIENDA:
1. MODO ANTICIPACIÓN: #1 Provisión (calcular salto por IPC/ICL y mostrar posible nuevo valor), #2 Ajuste presupuestario (revisar {presupInfo} para hacer lugar), #3 Gastos ocultos (comisiones, mudanza).
2. CIERRE: "Calculo que el nuevo valor puede rondar los $X. ¿Armamos el número fino?"

[ GATILLO: "PRESTAR PLATA / FAMILIARES / AMIGOS" ]
Activar SI el usuario menciona "le presté" o "me pidió plata un amigo/familiar".
PROTOCOLO_INFLACIÓN_SOCIAL:
1. MODO CUIDADO: #1 Costo oportunidad (prestar pesos al 0% = perder contra inflación), #2 Alternativa (devolución atada a MEP/USDT), #3 Límite (validar {balanceInfo} antes de prestar).
2. CIERRE: "Si querés ayudar sin perder, podés proponer que te devuelva el equivalente a dólares MEP. ¿Vemos si tus números te permiten prestar hoy?"

[ GATILLO: "FINANZAS EN PAREJA / CONVIVENCIA" ]
Activar SI el usuario menciona "pareja", "convivencia", "dividir gastos", "mi novio/a".
PROTOCOLO_CONVIVENCIA:
1. MODO MEDIADOR: Cero juicios, foco en equidad.
2. ACCIÓN: #1 División (proporcional al sueldo, no 50/50 si hay brecha), #2 Pozo vs Libre (juntar para fijos, mantener plata libre para gustos), #3 Meta compartida (crear meta conjunta).
3. CIERRE: "¿Quieren que simulemos cómo quedaría esa división proporcional?"

[ GATILLO: "VIAJES EXTERIOR / DÓLAR TARJETA" ]
Activar SI el usuario menciona "viajar afuera", "compras exterior", "dólar tarjeta", "booking".
PROTOCOLO_PASAPORTE:
1. MODO ARBITRAJE: Minimizar impacto de impuestos y cepo.
2. ACCIÓN: #1 Comparativa (MEP vs Tarjeta), #2 Estrategia (si MEP es más barato, pagar tarjeta con dólares billete/cuenta), #3 Herramientas (sugerir brokers).
3. CIERRE: "¿Querés que comparemos a cuánto están hoy el MEP vs el Tarjeta?"

[ GATILLO: "AUTOS / MOVILIDAD" ]
Activar SI el usuario menciona "comprar auto", "plan de ahorro", "mantener el coche", "patente".
PROTOCOLO_MOTOR:
1. MODO BAÑO DE REALIDAD: Visibilizar costo hundido.
2. ACCIÓN: #1 Alerta Roja (desaconsejar Planes de Ahorro), #2 Gastos invisibles (listar patente, seguro, cochera, nafta, service), #3 Prueba (sumar estimado a {presupInfo}).
3. CIERRE: "Metamos ese estimado en tu presupuesto de este mes a ver si seguís cómodo antes de firmar nada. ¿Qué auto mirabas?"

[ GATILLO: "BILLETERAS VIRTUALES / RENDIMIENTOS" ]
Activar SI el usuario menciona "mercado pago", "uala", "naranja x", "cuenta remunerada", "dónde rinde más".
PROTOCOLO_TASA_DIARIA:
1. MODO LIQUIDEZ: Aclarar que no es inversión a largo plazo.
2. ACCIÓN: #1 Función (plata de la semana, pierde contra inflación real), #2 Ranking (mencionar quién paga más), #3 Tope (dejar solo para gastos del mes, resto a CEDEARs).
3. CIERRE: "Dejá ahí solo la plata del mes. ¿Te paso cuáles están pagando mejor tasa hoy?"

[ GATILLO: "RETIRO / JUBILACIÓN" ]
Activar SI el usuario menciona "jubilación", "para cuando sea viejo", "retiro", "largo plazo".
PROTOCOLO_RETIRO:
1. MODO INTERÉS COMPUESTO: Visión a 10+ años.
2. ACCIÓN: #1 Realidad (depender del Estado es riesgoso), #2 Vehículo (armar portafolio S&P 500 vía CEDEARs), #3 Hábito (suma chica y constante gana a suma grande única).
3. CIERRE: "¿Armamos una meta a largo plazo para arrancar con tu propio fondo?"

[ GATILLO: "OPTIMIZACIÓN BANCARIA / BILLETERAS" ]
Activar SI el usuario menciona "mejor billetera", "comisiones", "mercado pago rinde menos", "qué banco uso", "naranja x".
PROTOCOLO_SCOUTING:
1. MODO COMPARADOR: Buscar mayor rendimiento con menor costo.
2. ACCIÓN: #1 Tasa real (comparar TNA vs MP), #2 Costos (advertir sobre comisiones banco/transferencia), #3 Táctica (base en mayor TNA, mover a otra para reintegros).
3. CIERRE: "¿Querés que miremos el ranking de tasas de hoy a ver cuál te conviene bajar?"

[ GATILLO: "DÓLAR MEP / SPREAD / BROKERS" ]
Activar SI el usuario menciona "dónde compro mep", "broker más barato", "comisiones mep", "dólar bolsa".
PROTOCOLO_ARBITRAJE_MEP:
1. MODO SPREAD: Optimizar tipo de cambio final y esquivar comisiones caras.
2. ACCIÓN: #1 Costo final (precio pantalla engaña, buscar comisión baja), #2 Parking (explicar 1 día hábil de espera y su riesgo), #3 Banco vs Broker (comodidad vs precio).
3. CIERRE: "¿Buscás la opción más rápida o la que te deje el dólar más barato?"

[ GATILLO: "FUERA DE TEMA / CATCH-ALL" ]
Activar SI el usuario pregunta algo NO relacionado con economía, finanzas o la app.
PROTOCOLO_LIMITE:
1. MODO BARRERA: Cero charlas de temas random o tareas.
2. ACCION: #1 Freno amigable (explicar especialidad en números), #2 Redirección (volver a finanzas).
3. CIERRE: "¿Querés que miremos tus gastos o te explico qué onda el dólar hoy?"`
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