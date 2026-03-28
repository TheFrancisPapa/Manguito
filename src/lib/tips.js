// ══════════════════════════════════════════════
//  src/lib/tips.js
//  Tips financieros por sección — rotación diaria.
//  Cada sección tiene su propio banco de tips.
//  El tip del día se calcula por día del año % total.
// ══════════════════════════════════════════════

const TIPS = {
  presupuestos: [
    { emoji: '📊', texto: 'Regla 50/30/20: destiná el 50% a necesidades, el 30% a deseos y el 20% al ahorro.' },
    { emoji: '🛒', texto: 'Antes de hacer las compras del supermercado, armá una lista y respetala. Reducís gastos impulsivos hasta un 30%.' },
    { emoji: '📱', texto: 'Revisá tus suscripciones mensuales. La mayoría de las personas tiene servicios que no usa y paga sin darse cuenta.' },
    { emoji: '💡', texto: 'Pagá las cuentas de servicios apenas las recibís. Evitás recargos y tenés mejor control del flujo de caja.' },
    { emoji: '🍕', texto: 'Cocinar en casa en lugar de pedir delivery puede ahorrarte miles de pesos por mes. ¡El "delivery tax" es real!' },
    { emoji: '📆', texto: 'Revisá tu presupuesto los primeros días de cada mes, no cuando ya gastaste todo.' },
    { emoji: '🎯', texto: 'Ponete un límite semanal de efectivo. Lo que tenés en el billetera es lo que podés gastar en la semana.' },
    { emoji: '🔔', texto: 'Activá alertas en tu banco para cada movimiento. Ser consciente de cada gasto cambia el comportamiento.' },
    { emoji: '🍃', texto: 'El "latte factor": pequeños gastos diarios acumulados pueden representar más del 10% de tu ingreso mensual.' },
    { emoji: '📝', texto: 'Escribí tus gastos a mano una vez por semana. El acto físico de escribir genera más consciencia que solo verlo en una app.' },
    { emoji: '🏷️', texto: 'Antes de comprar algo de más de $5.000, esperá 48 horas. Si seguís queriéndolo, compralo. Si no, ahorraste.' },
    { emoji: '💳', texto: 'Usá solo una tarjeta de crédito. Tener varias es más difícil de rastrear y es fácil gastar de más.' },
    { emoji: '🌱', texto: 'Los presupuestos no son restrictivos, son liberadores. Sabés exactamente qué podés gastar sin culpa.' },
    { emoji: '📉', texto: 'Si superás un presupuesto un mes, no te castigues. Analizá por qué pasó y ajustá el mes siguiente.' },
    { emoji: '🧾', texto: 'Guardá los tickets de compras grandes por al menos 30 días. Los cambios y garantías requieren comprobante.' },
    { emoji: '🔍', texto: 'Comparar precios antes de comprar servicios grandes (internet, seguro, telefonía) puede ahorrarte miles al año.' },
    { emoji: '🎁', texto: 'Armá un presupuesto específico para fiestas y regalos con meses de anticipación. Diciembre no tiene que ser una crisis.' },
    { emoji: '🚗', texto: 'El costo real de un auto incluye patente, seguro, nafta, mantenimiento y garaje. Calculá todo antes de decidir.' },
    { emoji: '📊', texto: 'Un presupuesto que funciona no es el que tiene todos los números perfectos, sino el que sí podés cumplir.' },
    { emoji: '💰', texto: 'Pagarte a vos mismo primero: apenas cobres, transferí el monto de ahorro antes de gastar en cualquier otra cosa.' },
    { emoji: '🏠', texto: 'Los gastos del hogar no deberían superar el 30% de tus ingresos netos. Si superan eso, revisá opciones.' },
    { emoji: '📅', texto: 'Separá los gastos fijos (alquiler, servicios) de los variables (salidas, ropa). Los fijos no se negocian, los variables sí.' },
    { emoji: '🎯', texto: 'Un presupuesto de "gastos cero" significa que cada peso tiene un destino asignado. Así no "se escapa" la plata.' },
    { emoji: '💡', texto: 'Revisar el extracto bancario una vez por semana no toma más de 5 minutos y te da control total de tus finanzas.' },
    { emoji: '🔄', texto: 'Si tu ingreso varía (freelance, comisiones), hacé un presupuesto basado en el ingreso mínimo esperado.' },
    { emoji: '🎪', texto: 'Separá un "fondo de diversión" en tu presupuesto. Disfrutar el presente sin culpa también es parte de las finanzas sanas.' },
    { emoji: '📱', texto: 'Desactivá las notificaciones de apps de e-commerce. Las ofertas "urgentes" son diseñadas para que gastes impulsivamente.' },
    { emoji: '🧮', texto: 'El costo de oportunidad: cada peso que gastás es un peso que no está creciendo en una inversión.' },
    { emoji: '💸', texto: 'Los gastos hormiga (café, bondi, chicles) parecen mínimos pero pueden sumar hasta el 15% del ingreso mensual.' },
    { emoji: '✅', texto: 'Celebrá cuando cumplís tu presupuesto. El refuerzo positivo ayuda a mantener el hábito a largo plazo.' },
  ],

  metas: [
    { emoji: '🎯', texto: 'Una meta sin fecha es solo un sueño. Ponerle un plazo concreto la convierte en un plan real.' },
    { emoji: '🏔️', texto: 'Dividí tus metas grandes en hitos pequeños. Es más motivador y fácil de rastrear el progreso.' },
    { emoji: '💪', texto: 'El fondo de emergencia debería cubrir entre 3 y 6 meses de gastos. Es tu seguro de vida financiero.' },
    { emoji: '✈️', texto: 'Para metas de mediano plazo (1-3 años), los plazos fijos UVA o FCI en pesos son buenas opciones.' },
    { emoji: '🌱', texto: 'Automatizá tus aportes a metas. Si esperás a "ver qué sobra", generalmente no sobra nada.' },
    { emoji: '📈', texto: 'Para metas de más de 3 años, considerá invertir en activos que superen la inflación como CEDEARs o acciones.' },
    { emoji: '🏠', texto: 'Si tu meta es comprar una propiedad, empezá a ahorrar en dólares. El ladrillo en Argentina siempre cotiza en USD.' },
    { emoji: '🎓', texto: 'Invertir en tu educación es la inversión con mejor ROI. Cada habilidad nueva puede aumentar tus ingresos.' },
    { emoji: '💰', texto: 'El interés compuesto es la octava maravilla del mundo. Un peso invertido hoy vale mucho más en 10 años.' },
    { emoji: '🔥', texto: 'La regla del 1%: mejorar solo un 1% cada día en tus hábitos financieros produce resultados extraordinarios en un año.' },
    { emoji: '📱', texto: 'Ponerle una imagen a tu meta (el viaje, el auto, la casa) en el fondo de pantalla del celu mantiene la motivación.' },
    { emoji: '🎪', texto: 'Si tenés varias metas, priorizá el fondo de emergencia. Sin él, cualquier imprevisto derrumba todo lo demás.' },
    { emoji: '💡', texto: 'Automatizá los aportes el mismo día que cobres. Lo que no ves, no gastás.' },
    { emoji: '🌍', texto: 'Para metas en USD (viaje al exterior, tecnología), comprá dólares de a poco cada mes. Hacés "dollar cost averaging".' },
    { emoji: '🏆', texto: 'Celebrá cada 25% de progreso en tus metas. El reconocimiento mantiene el impulso.' },
    { emoji: '🔍', texto: 'Revisá tus metas cada 3 meses. Los objetivos cambian y el plan debe adaptarse.' },
    { emoji: '💳', texto: 'Si tenés deudas con tasas altas (tarjeta al mínimo), pagar esa deuda ES la mejor inversión posible.' },
    { emoji: '🧮', texto: 'Para calcular cuánto ahorrar: dividí el monto total por los meses que tenés. Esa es tu meta mensual.' },
    { emoji: '🌱', texto: 'Pequeños aumentos periódicos al aporte mensual (aunque sea un 5%) aceleran exponencialmente el logro de la meta.' },
    { emoji: '🎯', texto: 'Una meta concreta ("ahorro $X para tal fecha") es 42% más probable de lograrse que una vaga ("ahorrar más").' },
    { emoji: '🔄', texto: 'Si un mes no pudiste aportar, no canceles la meta. Continuá desde donde estás. Lo importante es la constancia.' },
    { emoji: '💰', texto: 'Usá el dinero extra (aguinaldo, bonos, regalo) para dar un "boost" a tus metas. Acelerará significativamente el progreso.' },
    { emoji: '📊', texto: 'Ver el progreso visual de una meta aumenta la motivación hasta un 33%. Por eso las barras de progreso funcionan.' },
    { emoji: '🌟', texto: 'No tengas demasiadas metas a la vez. Concentrarte en 2-3 metas produce mejores resultados que tener 10 a medias.' },
    { emoji: '🏃', texto: 'El primer paso es el más difícil. Aunque sean $1.000 al mes, empezar crea el hábito y el momentum.' },
    { emoji: '💡', texto: 'Considerá un "desafío de ahorro": cada semana ahorrás $X más que la semana anterior durante 52 semanas.' },
    { emoji: '🎁', texto: 'Las metas financieras no solo son para cosas materiales. "Fondo de salud" o "educación continua" también son válidas.' },
    { emoji: '📈', texto: 'A mayor plazo y menor necesidad de liquidez, mayor puede ser el riesgo y el potencial retorno de tu inversión.' },
    { emoji: '🛡️', texto: 'Tu fondo de emergencia no es para las vacaciones ni para aprovechar una oferta. Es solo para emergencias reales.' },
    { emoji: '✨', texto: 'Tener metas financieras claras reduce significativamente el estrés económico y mejora la calidad de vida general.' },
  ],

  inversiones: [
    { emoji: '📈', texto: 'Diversificar no es tener muchas inversiones, es tener inversiones que no se muevan igual cuando el mercado cae.' },
    { emoji: '₿', texto: 'Las criptomonedas son activos de alto riesgo. No inviertas más del 5-10% de tu cartera en cripto.' },
    { emoji: '🇦🇷', texto: 'Los CEDEARs permiten invertir en empresas globales (Apple, Tesla, Nvidia) desde Argentina y en pesos.' },
    { emoji: '⏰', texto: 'El tiempo en el mercado supera al "timing" del mercado. Invertir consistentemente produce mejores resultados que esperar "el momento ideal".' },
    { emoji: '💡', texto: 'Dollar cost averaging: invertir un monto fijo regularmente independientemente del precio reduce el riesgo de entrada.' },
    { emoji: '📊', texto: 'El S&P 500 tiene un retorno histórico de ~10% anual en USD. Un ETF que lo replica es la opción más simple y probada.' },
    { emoji: '🏦', texto: 'Los FCI (Fondos Comunes de Inversión) son el punto de entrada ideal para inversores principiantes en Argentina.' },
    { emoji: '🔄', texto: 'Rebalancear tu cartera una vez por año mantiene el perfil de riesgo deseado y te fuerza a comprar barato y vender caro.' },
    { emoji: '📉', texto: 'Las caídas del mercado no son pérdidas hasta que vendés. Los inversores pacientes históricamente siempre se recuperan.' },
    { emoji: '🧮', texto: 'La regla del 72: dividí 72 por la tasa anual de retorno para saber en cuántos años se duplica tu inversión.' },
    { emoji: '💼', texto: 'Un plazo fijo en pesos que no supere la inflación es una pérdida de poder adquisitivo disfrazada de ganancia.' },
    { emoji: '🌍', texto: 'Las acciones globales (especialmente EE.UU.) históricamente superan a las argentinas en retorno ajustado por riesgo.' },
    { emoji: '🔍', texto: 'Antes de invertir en una empresa, preguntate: ¿entiendo cómo gana dinero? Si no podés explicarlo simplemente, no inviertas.' },
    { emoji: '💰', texto: 'Las Letras del Tesoro (Lecaps) y obligaciones negociables (ON) son opciones de renta fija interesantes en Argentina.' },
    { emoji: '📱', texto: 'Los brokers online (Bull Market, IOL, Cocos) permiten empezar a invertir en bolsa con montos muy pequeños.' },
    { emoji: '🎯', texto: 'Define tu perfil de riesgo antes de invertir: conservador, moderado o agresivo. Cada uno tiene sus instrumentos.' },
    { emoji: '🛡️', texto: 'No inviertas dinero que puedas necesitar en los próximos 12 meses. Los mercados pueden caer y tardar en recuperarse.' },
    { emoji: '📊', texto: 'El índice Merval sigue a las empresas argentinas. El S&P 500 sigue a las 500 empresas más grandes de EE.UU.' },
    { emoji: '🌱', texto: 'Reinvertir los dividendos y ganancias en lugar de retirarlos acelera exponencialmente el crecimiento de tu cartera.' },
    { emoji: '💡', texto: 'Los ETFs (fondos indexados) tienen comisiones mucho menores que los fondos activos y históricamente mejores resultados.' },
    { emoji: '⚡', texto: 'El dólar MEP es la forma legal de comprar dólares financieros en Argentina a través del mercado de capitales.' },
    { emoji: '🏆', texto: 'Warren Buffett invierte en negocios que entiende. El mejor consejo de inversión es invertir en lo que conocés.' },
    { emoji: '🔮', texto: 'Nadie puede predecir consistentemente el mercado a corto plazo. Los que dicen que sí, mienten o tienen suerte.' },
    { emoji: '💎', texto: 'Invertir en vos mismo (cursos, libros, salud) tiene el mayor retorno de todos. Es la base de todo lo demás.' },
    { emoji: '🧩', texto: 'Una cartera equilibrada para Argentina: 40% dólares/activos USD, 30% renta fija, 20% acciones, 10% cripto.' },
    { emoji: '📅', texto: 'Revisá tu cartera máximo una vez por mes. Revisar diariamente genera ansiedad y decisiones emocionales malas.' },
    { emoji: '🌊', texto: 'En épocas de alta inflación, los activos reales (acciones, commodities, inmuebles) protegen mejor que el cash.' },
    { emoji: '🎲', texto: 'Si tu "inversión" parece un juego de azar o te prometieron retornos garantizados altísimos, es una estafa. Cuidado.' },
    { emoji: '📝', texto: 'Llevá un registro de tus inversiones con precio de compra, fecha y justificación. Te ayuda a aprender de cada decisión.' },
    { emoji: '🌟', texto: 'No existe inversión perfecta. El objetivo es construir una cartera diversificada que te permita dormir tranquilo.' },
  ],

  movimientos: [
    { emoji: '💸', texto: 'Registrar cada gasto, por pequeño que sea, te da una imagen clara de a dónde va tu dinero realmente.' },
    { emoji: '📊', texto: 'La mayoría de las personas sobreestima sus gastos en ocio y subestima los gastos en comida. ¿Vos cómo estás?' },
    { emoji: '🔄', texto: 'Los gastos recurrentes (suscripciones, servicios) son los más fáciles de olvidar y los más fáciles de reducir.' },
    { emoji: '📱', texto: 'Registrá los gastos inmediatamente cuando ocurren. Si esperás al final del día, olvidás entre el 20 y 40%.' },
    { emoji: '💡', texto: 'Categorizar tus gastos te permite ver patrones. ¿Tu mayor gasto es lo que querías que fuera?' },
    { emoji: '🏷️', texto: 'Distinguir entre gastos fijos y variables es el primer paso para saber cuánto podés reducir si es necesario.' },
    { emoji: '📉', texto: 'Si tus gastos superan tus ingresos, tenés dos opciones: gastar menos o ganar más. Idealmente, las dos.' },
    { emoji: '🎯', texto: 'Los gastos impulsivos generalmente ocurren cuando estamos aburridos, estresados o tristes. Identificá tu trigger.' },
    { emoji: '💳', texto: 'Pagar con tarjeta de crédito no es gastar "después". Es gastar ahora y pagar después con intereses potenciales.' },
    { emoji: '🌱', texto: 'Hacer un "ayuno de gastos" de 1 semana al mes (solo lo esencial) puede ahorrarte entre 10-15% del ingreso mensual.' },
    { emoji: '🧾', texto: 'Al revisar tus movimientos, preguntate: ¿me generó valor real este gasto? Si no, ¿lo haría de nuevo?' },
    { emoji: '📆', texto: 'Separar los gastos por semana en lugar de por mes hace que las cifras sean más concretas y manejables.' },
    { emoji: '🔍', texto: 'Analizar tus gastos del año pasado es la mejor manera de hacer un presupuesto realista para este año.' },
    { emoji: '💰', texto: 'El gasto promedio en delivery en Argentina creció 300% en 5 años. ¿Cuánto representa en tu presupuesto mensual?' },
    { emoji: '🎪', texto: 'Gastá conscientemente en experiencias. Las investigaciones muestran que generan más felicidad duradera que las cosas.' },
    { emoji: '📊', texto: 'Ver tus ingresos vs gastos del mes anterior te ayuda a detectar si estás mejorando o empeorando tu situación.' },
    { emoji: '🌟', texto: 'Un movimiento de ingreso no registrado es dinero "invisible". La transparencia total es clave para el control.' },
    { emoji: '💡', texto: 'Los gastos en salud preventiva (check-ups, gym, buena alimentación) reducen gastos futuros mucho mayores.' },
    { emoji: '🔔', texto: 'Poner alarmas para vencer de tarjetas y servicios evita recargos y mora. Son gastos 100% evitables.' },
    { emoji: '🏆', texto: 'Si este mes gastaste menos que el anterior en la misma categoría, ya estás mejorando. Celebralo.' },
    { emoji: '📱', texto: 'El costo de oportunidad: ese gasto en algo que no necesitabas podría haber sido una cuota de un fondo de inversión.' },
    { emoji: '🛒', texto: 'Comprar en cantidad productos no perecederos cuando hay oferta puede reducir el gasto anual en alimentos hasta un 20%.' },
    { emoji: '🎯', texto: 'Definí 3 categorías donde te "permitís gastar sin culpa" y sé más estricto con el resto.' },
    { emoji: '💸', texto: 'La inflación hace que el mismo gasto de hoy sea "más barato" que en el futuro. Esto justifica adelantar ciertas compras.' },
    { emoji: '🔄', texto: 'Revisá tus débitos automáticos cada 3 meses. Es probable que haya uno que ya no necesitás y se te olvidó cancelar.' },
    { emoji: '📉', texto: 'Reducir solo $5.000 por semana en gastos supuestos "chicos" equivale a $260.000 al año. Suma.' },
    { emoji: '🌱', texto: 'La consistencia en el registro de movimientos, aunque no sea perfecta, siempre es mejor que no registrar nada.' },
    { emoji: '💡', texto: 'Si tenés pareja o familia, revisar los movimientos juntos una vez al mes mejora la coordinación financiera del hogar.' },
    { emoji: '🎁', texto: 'Los gastos en regalos son más predecibles de lo que parecen. Cumpleaños, fiestas, Navidad: podés planificarlos.' },
    { emoji: '✅', texto: 'Completar el historial de movimientos, aunque sea tedioso, es el acto más importante de consciencia financiera.' },
  ],

  general: [
    { emoji: '🥭', texto: 'La educación financiera no se enseña en la escuela, pero puede cambiar tu vida. Dedicale 15 minutos por día.' },
    { emoji: '💪', texto: 'La riqueza no se construye ganando más, se construye gastando menos de lo que ganás de manera consistente.' },
    { emoji: '🌱', texto: 'El mejor momento para empezar a ahorrar fue ayer. El segundo mejor momento es ahora.' },
    { emoji: '🎯', texto: 'Tener claridad financiera no es ser rico, es saber exactamente cuánto tenés, cuánto debés y para dónde vas.' },
    { emoji: '📈', texto: 'La inflación es el impuesto silencioso. Mantener dinero en efectivo sin invertirlo garantiza perder poder adquisitivo.' },
    { emoji: '💡', texto: 'Mejorar tus ingresos tiene límite práctico, mejorar tu forma de gastar tiene impacto inmediato en tu situación.' },
    { emoji: '🔄', texto: 'Los hábitos financieros se construyen con repetición, no con motivación. La motivación viene y va, los hábitos quedan.' },
    { emoji: '🏆', texto: 'Compararse con los demás en materia económica es el camino más rápido a la frustración. Compárate con vos mismo.' },
  ],
}

/**
 * Devuelve el tip del día para una sección específica.
 * Rota cada 24 horas basándose en el día del año.
 */
export function getTipDelDia(seccion = 'general') {
  const tips = TIPS[seccion] || TIPS.general
  const inicio = new Date(new Date().getFullYear(), 0, 0)
  const diff = Date.now() - inicio.getTime()
  const dayOfYear = Math.floor(diff / 86_400_000)
  return tips[dayOfYear % tips.length]
}

/**
 * Devuelve N tips aleatorios (sin repetir) para una sección.
 * Útil si querés mostrar más de uno.
 */
export function getTipsAleatorios(seccion = 'general', cantidad = 3) {
  const tips = [...(TIPS[seccion] || TIPS.general)]
  const resultado = []
  for (let i = 0; i < Math.min(cantidad, tips.length); i++) {
    const idx = Math.floor(Math.random() * tips.length)
    resultado.push(...tips.splice(idx, 1))
  }
  return resultado
}

export default TIPS