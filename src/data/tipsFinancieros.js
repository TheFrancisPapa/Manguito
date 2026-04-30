export const tipsFinancieros = {
  movimientos: [
    "Diferencia entre necesidad y deseo: La necesidad te mantiene vivo y funcional. El deseo mejora tu estilo de vida, pero puede empobrecerte si no lo controlas.",
    "Registrar cada gasto te hace consciente: Muchos pequeños gastos 'hormiga' destruyen un presupuesto mensual si no los mides.",
    "Antes de comprar algo no planificado, aplica la regla de las 48 horas. Si después de dos días aún lo quieres y puedes pagarlo, adelante.",
    "El crédito no es dinero extra: Usar la tarjeta de crédito significa gastar el dinero que aún no has ganado. Úsala con responsabilidad.",
    "Revisa tus suscripciones mensuales: Aquellos servicios que no has usado en los últimos 30 días están drenando tu cuenta silenciosamente.",
    "No compres para impresionar a gente a la que no le importas: El verdadero lujo es la tranquilidad financiera, no aparentar un estatus que no tienes.",
    "Compara por precio unitario: En el supermercado, fíjate en el precio por kilo o por litro, no en el precio final del paquete. Las marcas a veces reducen el tamaño pero mantienen el precio.",
    "Evita las compras emocionales: Estar muy feliz, triste o estresado nubla tu juicio financiero. Nunca compres nada caro en esos estados.",
    "Paga tus tarjetas de crédito siempre en su totalidad a fin de mes. Pagar el 'pago mínimo' es el camino directo a la deuda perpetua.",
    "Paga en efectivo cuando salgas de fiesta o a eventos: Te limitará físicamente a no gastar más de lo que llevas en el bolsillo."
  ],
  inversiones: [
    "Generar mucho dinero no significa riqueza. La riqueza es el dinero que retienes e inviertes, no el que gastas.",
    "Ahorrar no genera riqueza: El ahorro protege tu dinero a corto plazo de emergencias, pero la inflación reduce su valor. Las inversiones lo multiplican.",
    "El interés compuesto es la octava maravilla del mundo. Quien lo entiende, lo gana; quien no, lo paga.",
    "Diversificar no es solo no poner todos los huevos en una misma canasta, es ponerlos en canastas de diferentes materiales y ubicaciones.",
    "El mejor momento para empezar a invertir fue hace 10 años. El segundo mejor momento es hoy.",
    "Tu tolerancia al riesgo define tu portafolio: No inviertas en criptomonedas o acciones volátiles si vas a perder el sueño cada vez que el mercado baje un 5%.",
    "El tiempo en el mercado le gana a intentar predecir el mercado (Time in the market beats timing the market).",
    "Los mercados bajistas (Bear Markets) son rebajas de liquidación para el inversor a largo plazo.",
    "Nunca inviertas dinero que vas a necesitar en el corto plazo (menos de 2 años). Las inversiones son para el futuro, no para pagar el alquiler del mes que viene.",
    "Las comisiones de los brokers y fondos de inversión importan: Un 1% de comisión anual puede comerse hasta el 25% de tus ganancias en 30 años."
  ],
  planificacion: [
    "Regla 50/30/20: Intenta destinar el 50% de tus ingresos a necesidades, 30% a deseos y 20% a ahorro e inversión.",
    "Págate a ti mismo primero: Ahorra e invierte tan pronto como recibas tus ingresos, no esperes a ver qué te sobra a fin de mes.",
    "Fondo de emergencia: Antes de invertir fuertemente, asegúrate de tener entre 3 y 6 meses de tus gastos fijos ahorrados en un instrumento de alta liquidez.",
    "Tus metas deben ser SMART: Específicas, Medibles, Alcanzables, Relevantes y con un Tiempo determinado. 'Quiero ser rico' no es una meta, 'Ahorrar $1000 este año' sí.",
    "Audita tu vida una vez al año: Revisa tus pólizas de seguros, comisiones bancarias y renegocia tu contrato de internet. Es dinero gratis esperando a ser reclamado.",
    "Planificar no es restringirse, es darle instrucciones a tu dinero hacia dónde ir en lugar de preguntarte a dónde se fue.",
    "Deudas buenas vs Deudas malas: Una hipoteca a tasa fija para una casa puede ser buena; una tarjeta de crédito al 80% anual para comprar ropa es destructiva.",
    "Método bola de nieve para salir de deudas: Paga primero la deuda más pequeña para ganar motivación psicológica, mientras pagas el mínimo de las demás.",
    "Visualiza tu jubilación: Cuanto antes empieces a planificar tu retiro, menos esfuerzo mensual te requerirá gracias al interés compuesto."
  ],
  general: [
    "La educación financiera es la mejor inversión que puedes hacer. Nunca dejes de aprender.",
    "No inviertas en cosas que no entiendes. Si no puedes explicarle a un niño cómo funciona, no pongas tu dinero ahí.",
    "Tu mayor activo es tu capacidad para generar ingresos. Invierte constantemente en tus habilidades, tu salud física y mental.",
    "Tu círculo social impacta tu riqueza: Si te rodeas de 4 personas con buenos hábitos financieros, tú serás la quinta.",
    "El dinero no compra la felicidad, pero sí compra libertad. Libertad para decidir qué hacer con tu tiempo, y eso es lo más cercano a la felicidad.",
    "La riqueza silenciosa es real: Las personas verdaderamente ricas no suelen usar ropa llena de logos gigantes, prefieren activos que no se deprecian.",
    "Ser barato y ser frugal no es lo mismo: El barato busca siempre el precio menor sin importar la calidad. El frugal busca maximizar el valor de cada peso.",
    "Compara tu progreso solo contigo mismo: Siempre habrá alguien en redes sociales que parezca tener más dinero o éxito. Enfócate en tu propio camino."
  ]
};

export function getRandomTip(seccion) {
  const tips = tipsFinancieros[seccion] || tipsFinancieros.general;
  const randomIndex = Math.floor(Math.random() * tips.length);
  return tips[randomIndex];
}
