import DOMPurify from 'dompurify'

// Diccionario básico de profanidad (versión reducida para propósitos de demostración y filtro inicial)
const badwords = [
  "puta", "puto", "mierda", "carajo", "concha", "pija", "verga", "culiado", "culiada", "boludo", "boluda",
  "pelotudo", "pelotuda", "forro", "forra", "cagador", "cagadora", "choto", "chota", "putazo", "trola", "trolo",
  "putita", "putito", "caca", "pedo", "culo", "teta", "tetas", "mamada", "pajero", "pajera",
  "orto", "culo", "guarango", "guaranga", "malparido", "malparida", "hijoputa", "hijaputa",
  "maricon", "maricona", "puton", "putona", "gato", "gata", "ramera", "putañero", "putañera",
  "putas", "putos", "mierdas", "carajos", "conchas", "pijas", "vergas", "culiados", "culiadas",
  "boludos", "boludas", "pelotudos", "pelotudas", "forros", "forras", "cagadores", "cagadoras",
  "chotos", "chotas", "putazos", "trolas", "trolos", "putitas", "putitos", "cacas", "pedos",
  "culos", "tetas", "mamadas", "pajeros", "pajeras", "ortos", "guarangos", "guarangas",
  "malparidos", "malparidas", "hijoputas", "hijaputas", "maricones", "mariconas", "putones",
  "putonas", "gatos", "gatas", "ramerass", "putañeros", "putañeras"
  // Agrega más palabras según sea necesario
];

/**
 * Filtra malas palabras de un texto y lo sanitiza contra ataques XSS
 * @param {string} text - El texto a sanitizar
 * @returns {string} - Texto limpio
 */
export function sanitizeText(text) {
  if (!text) return '';

  // 1. Sanitizar HTML (evitar XSS)
  let cleanHtml = DOMPurify.sanitize(text, {
    ALLOWED_TAGS: [], // No permitimos HTML, solo texto plano
    ALLOWED_ATTR: []
  });

  // 2. Filtrar malas palabras
  let cleanText = cleanHtml;
  badwords.forEach(word => {
    // Usamos una expresión regular case-insensitive y que busque la palabra completa
    const regex = new RegExp(`\\b${word}\\b`, 'gi');
    // Reemplazamos la palabra por asteriscos de la misma longitud
    cleanText = cleanText.replace(regex, match => '*'.repeat(match.length));
  });

  return cleanText;
}

/**
 * Verifica si un texto contiene malas palabras
 * @param {string} text - El texto a verificar
 * @returns {boolean} - true si contiene malas palabras, false de lo contrario
 */
export function hasBadWords(text) {
  if (!text) return false;
  const lowerText = text.toLowerCase();
  return badwords.some(word => {
    const regex = new RegExp(`\\b${word}\\b`, 'i');
    return regex.test(lowerText);
  });
}
