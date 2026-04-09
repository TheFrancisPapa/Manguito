/**
 * src/services/normalizers/transaccionNormalizer.js
 * ─────────────────────────────────────────────────────────────
 * Traduce las estructuras de datos de distintos proveedores
 * bancarios al formato canónico MovimientoCanónico de Manguito.
 *
 * Cada proveedor tiene su propio "dialecto".
 * Este archivo es el diccionario de traducción.
 *
 * Agregar un banco nuevo = agregar una función `fromXxx` acá.
 * ─────────────────────────────────────────────────────────────
 */

import { FUENTE, TIPO_MOV } from '../types'
// IDs se generan determinísticamente via generarIdEstable(), no necesitamos uuid.

// ── Helpers internos ──────────────────────────────────────────

/**
 * Genera un UUID v4 determinista para una transacción bancaria.
 * Necesario para deduplicación: misma transacción → mismo ID.
 * Usa el ID propio del proveedor, no genera UUIDs al azar.
 *
 * En un sistema real se usaría una función hash (SHA-256 truncado).
 * Aquí usamos el fuente_id como sufijo para ser predecible.
 */
function generarIdEstable(proveedor, idExterno) {
  // Formato: "belvo_tx_<hash>" — predecible y sin colisiones con UUIDs de Supabase
  return `${proveedor}_tx_${idExterno}`
}

/**
 * Mapea categorías de Belvo a las categorías default de Manguito.
 * Belvo clasifica en inglés; nosotros usamos los nombres de
 * la tabla `categorias` en español.
 *
 * Ampliar este mapa cuando se agreguen más categorías.
 */
const BELVO_CATEGORY_MAP = {
  'Food & Groceries':    'Alimentación',
  'Restaurants':         'Alimentación',
  'Transportation':      'Transporte',
  'Ride Sharing':        'Transporte',
  'Fuel':                'Transporte',
  'Health':              'Salud',
  'Pharmacy':            'Salud',
  'Education':           'Educación',
  'Entertainment':       'Entretenimiento',
  'Streaming Services':  'Entretenimiento',
  'Shopping':            'Ropa',
  'Utilities':           'Servicios',
  'Telecommunications':  'Servicios',
  'Salary':              'Sueldo',
  'Freelance':           'Freelance',
  'Investments':         'Inversiones',
}

// ── Normalizador de Belvo ─────────────────────────────────────

/**
 * Transforma una transacción cruda de la API de Belvo
 * al formato canónico de Manguito.
 *
 * Documentación de Belvo:
 * https://developers.belvo.com/reference/detailtransaction
 *
 * @param {Object} tx          - Objeto `transaction` de Belvo
 * @param {string} usuario_id  - UUID del usuario en Manguito
 * @param {Map}    catMap      - Mapa { nombreCat: uuid } de las categorías del usuario
 * @returns {import('../types').MovimientoCanónico}
 */
export function fromBelvo(tx, usuario_id, catMap = new Map()) {
  // Belvo usa "INFLOW" para ingresos y "OUTFLOW" para gastos
  const tipo = tx.type === 'INFLOW' ? TIPO_MOV.INGRESO : TIPO_MOV.GASTO

  // El monto en Belvo siempre es positivo — el tipo define la dirección
  const monto = Math.abs(Number(tx.amount))

  // Intentamos mapear la categoría de Belvo a una categoría local
  const belvoCategory  = tx.category ?? ''
  const nombreCatLocal = BELVO_CATEGORY_MAP[belvoCategory] ?? null
  const categoria_id   = nombreCatLocal ? (catMap.get(nombreCatLocal) ?? null) : null

  // Descripción: preferimos el "concept" (texto del extracto) al description
  const descripcion = (tx.reference ?? tx.description ?? 'Transacción bancaria').slice(0, 200)

  // Fecha: Belvo usa ISO 8601, tomamos solo YYYY-MM-DD
  const fecha = (tx.accounting_date ?? tx.value_date ?? new Date().toISOString()).slice(0, 10)

  return {
    id:           generarIdEstable('belvo', tx.id),
    usuario_id,
    tipo,
    monto,
    descripcion,
    fecha,
    categoria_id,
    categorias:   categoria_id ? { nombre: nombreCatLocal } : null,
    es_recurrente: false,
    recurrencia:  null,
    fuente:       FUENTE.BELVO,
    fuente_id:    tx.id,           // ID original en Belvo para deduplicación
    sincronizado: true,
    metadata: {
      institucion:    tx.account?.institution?.name ?? null,
      cuenta_numero:  tx.account?.number ?? null,
      categoria_banco: belvoCategory,
      moneda_original: tx.currency ?? 'ARS',
      referencia:     tx.reference ?? null,
      status:         tx.status ?? null,
    },
    created_at:  tx.created_at ?? new Date().toISOString(),
    updated_at:  new Date().toISOString(),
  }
}

// ── Stubs para proveedores futuros ────────────────────────────
// Cuando se integre Plaid o Galileo, agregar fromPlaid() y fromGalileo() acá.

/**
 * Placeholder para futuras integraciones.
 * @param {Object} tx
 * @param {string} usuario_id
 * @param {Map} catMap
 * @returns {import('../types').MovimientoCanónico}
 */
export function fromPlaid(tx, usuario_id, catMap = new Map()) {
  throw new Error('Adaptador Plaid no implementado aún.')
}

// ── Deduplicador ──────────────────────────────────────────────

/**
 * Dado un array de movimientos canónicos (pueden venir de
 * múltiples fuentes), elimina duplicados.
 *
 * Regla de deduplicación:
 *   - Si un movimiento manual (fuente=manual) tiene el mismo
 *     fuente_id que uno bancario, el MANUAL tiene prioridad
 *     (el usuario puede haberlo editado/corregido).
 *   - Entre movimientos del mismo banco, el más reciente gana.
 *
 * @param {import('../types').MovimientoCanónico[]} movimientos
 * @returns {import('../types').MovimientoCanónico[]}
 */
export function deduplicar(movimientos) {
  const mapaFuenteId = new Map()
  const mapaId       = new Map()

  // Primero pasamos los manuales (prioridad alta)
  const manuales = movimientos.filter(m => m.fuente === FUENTE.MANUAL)
  const bancarios = movimientos.filter(m => m.fuente !== FUENTE.MANUAL)

  for (const m of manuales) {
    mapaId.set(m.id, m)
    if (m.fuente_id) mapaFuenteId.set(m.fuente_id, m)
  }

  for (const m of bancarios) {
    // Si ya existe una entrada manual que referencia esta tx bancaria, la omitimos
    if (m.fuente_id && mapaFuenteId.has(m.fuente_id)) continue
    // Si el mismo ID bancario viene dos veces, el que tiene updated_at más reciente gana
    const existente = mapaId.get(m.id)
    if (existente && existente.updated_at >= m.updated_at) continue
    mapaId.set(m.id, m)
  }

  return Array.from(mapaId.values())
    .sort((a, b) => b.fecha.localeCompare(a.fecha))
}