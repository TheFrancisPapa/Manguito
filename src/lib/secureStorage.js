/**
 * src/lib/secureStorage.js
 * ═══════════════════════════════════════════════════════════════
 *  🔐 Manguito Secure Storage — AES-256-GCM + IndexedDB + DOMPurify
 *
 *  AMENAZAS MITIGADAS:
 *    ✅ XSS con acceso a localStorage         → localStorage PROHIBIDO
 *    ✅ Lectura de datos en texto plano        → AES-256-GCM (Web Crypto API)
 *    ✅ Inyección de HTML/JS en datos leídos   → DOMPurify antes de retornar
 *    ✅ Reuso de IV (nonce)                    → IV aleatorio de 96 bits c/escritura
 *    ✅ Manipulación de ciphertext (MITM)      → GCM incluye autenticación (AEAD)
 *    ✅ Extracción de la clave desde RAM       → CryptoKey no extractable
 *    ✅ Persistencia de datos sensibles planos → Todo en IndexedDB cifrado
 *
 *  USO BÁSICO:
 *    import { secureStorage } from './secureStorage'
 *
 *    await secureStorage.setItem('perfilFiscal', { categoria: 'D', ... })
 *    const perfil = await secureStorage.getItem('perfilFiscal')
 *    await secureStorage.removeItem('perfilFiscal')
 *    await secureStorage.clear()
 *
 *  NOTA ARQUITECTURAL:
 *    La clave AES se deriva de un secreto fijo + UID del usuario (si disponible).
 *    Esto NO es seguridad perfecta contra alguien con acceso físico al dispositivo,
 *    pero protege contra:
 *      - Ataques XSS que roban localStorage
 *      - Extensiones maliciosas con acceso a localStorage
 *      - Dumps de memoria de sessionStorage/localStorage
 *    Para datos ultra-sensibles (contraseñas, tokens), usar Supabase/backend.
 * ═══════════════════════════════════════════════════════════════
 */

// ── DOMPurify (cargado dinámicamente para no bloquear el bundle) ──────────────
let _purify = null

async function getPurify() {
  if (_purify) return _purify
  // Si ya está disponible globalmente (ej: CDN en index.html)
  if (typeof window !== 'undefined' && window.DOMPurify) {
    _purify = window.DOMPurify
    return _purify
  }
  // Import dinámico (asumiendo que está en package.json)
  try {
    const mod = await import('dompurify')
    _purify = mod.default || mod
    return _purify
  } catch {
    // Fallback: sanitizador mínimo si DOMPurify no está disponible
    console.warn('[secureStorage] DOMPurify no disponible. Usando sanitizador básico.')
    _purify = {
      sanitize: (str) => String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#x27;')
        .replace(/\//g, '&#x2F;'),
    }
    return _purify
  }
}

// ── Constantes ────────────────────────────────────────────────────────────────
const DB_NAME      = 'manguito_secure_db'
const DB_VERSION   = 1
const STORE_NAME   = 'encrypted_store'
const KEY_MATERIAL = 'manguito_aes_key_v1'   // Identificador en IDB para la CryptoKey exportada
const SALT_KEY     = 'manguito_salt_v1'

const AES_ALGO     = 'AES-GCM'
const AES_KEY_LEN  = 256
const IV_LENGTH    = 12  // 96 bits recomendado para AES-GCM
const SALT_LENGTH  = 16  // 128 bits para PBKDF2

// ── Inicialización de IndexedDB ────────────────────────────────────────────────

function openDB() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION)

    req.onupgradeneeded = (e) => {
      const db = e.target.result
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'key' })
      }
      // Store separado para la clave AES cifrada (derivada con PBKDF2)
      if (!db.objectStoreNames.contains('_key_store')) {
        db.createObjectStore('_key_store', { keyPath: 'id' })
      }
    }

    req.onsuccess = (e) => resolve(e.target.result)
    req.onerror   = (e) => reject(new Error(`IDB open error: ${e.target.error}`))
  })
}

function idbGet(db, storeName, key) {
  return new Promise((resolve, reject) => {
    const tx  = db.transaction(storeName, 'readonly')
    const req = tx.objectStore(storeName).get(key)
    req.onsuccess = () => resolve(req.result)
    req.onerror   = () => reject(req.error)
  })
}

function idbPut(db, storeName, value) {
  return new Promise((resolve, reject) => {
    const tx  = db.transaction(storeName, 'readwrite')
    const req = tx.objectStore(storeName).put(value)
    req.onsuccess = () => resolve(req.result)
    req.onerror   = () => reject(req.error)
  })
}

function idbDelete(db, storeName, key) {
  return new Promise((resolve, reject) => {
    const tx  = db.transaction(storeName, 'readwrite')
    const req = tx.objectStore(storeName).delete(key)
    req.onsuccess = () => resolve()
    req.onerror   = () => reject(req.error)
  })
}

function idbClear(db, storeName) {
  return new Promise((resolve, reject) => {
    const tx  = db.transaction(storeName, 'readwrite')
    const req = tx.objectStore(storeName).clear()
    req.onsuccess = () => resolve()
    req.onerror   = () => reject(req.error)
  })
}

// ── Gestión de claves AES ──────────────────────────────────────────────────────

/**
 * Genera (o recupera) el salt de PBKDF2 almacenado en IDB.
 * El salt se guarda EN CLARO porque su función es evitar ataques
 * de diccionario/rainbow table, no ser secreto.
 */
async function getOrCreateSalt(db) {
  const stored = await idbGet(db, '_key_store', SALT_KEY)
  if (stored?.salt) {
    return new Uint8Array(stored.salt)
  }
  const salt = crypto.getRandomValues(new Uint8Array(SALT_LENGTH))
  await idbPut(db, '_key_store', { id: SALT_KEY, salt: Array.from(salt) })
  return salt
}

/**
 * Genera el "password" base para PBKDF2 combinando:
 *   1. Una constante de la app (hardcoded aquí, pero puede venir de env)
 *   2. El user-agent del dispositivo (binding de dispositivo)
 *   3. El userId si está disponible (binding de usuario)
 *
 * Esto no hace la clave 100% secreta, pero sí la hace específica
 * del dispositivo + usuario, protegiendo contra exfiltración genérica de IDB.
 */
function buildKeyPassword(userId = '') {
  const APP_SECRET   = 'manguito_2025_v1_arg_finance'  // Constante de dominio
  const deviceBind   = navigator.userAgent.slice(0, 60) // Parcial del UA
  const combined     = `${APP_SECRET}::${deviceBind}::${userId}`
  return combined
}

/**
 * Deriva una CryptoKey AES-256-GCM usando PBKDF2.
 * La clave resultante es NON-EXTRACTABLE (no puede salir de la memoria del browser).
 */
async function deriveAESKey(password, salt) {
  const encoder   = new TextEncoder()
  const rawKey    = await crypto.subtle.importKey(
    'raw',
    encoder.encode(password),
    'PBKDF2',
    false,
    ['deriveKey'],
  )

  return crypto.subtle.deriveKey(
    {
      name:       'PBKDF2',
      salt,
      iterations: 310_000,  // OWASP 2023 recomendado para SHA-256
      hash:       'SHA-256',
    },
    rawKey,
    { name: AES_ALGO, length: AES_KEY_LEN },
    false,           // ← NON-EXTRACTABLE: la clave nunca puede leerse como bytes
    ['encrypt', 'decrypt'],
  )
}

// ── Cifrado / Descifrado ───────────────────────────────────────────────────────

/**
 * Cifra un valor arbitrario con AES-256-GCM.
 * Genera un IV aleatorio de 96 bits por operación.
 * El formato de salida: iv (12 bytes) + ciphertext concatenados → Base64
 */
async function encrypt(aesKey, value) {
  const encoder   = new TextEncoder()
  const plaintext = encoder.encode(JSON.stringify(value))
  const iv        = crypto.getRandomValues(new Uint8Array(IV_LENGTH))

  const cipherBuffer = await crypto.subtle.encrypt(
    { name: AES_ALGO, iv },
    aesKey,
    plaintext,
  )

  // Combinar IV + ciphertext en un solo ArrayBuffer
  const combined = new Uint8Array(IV_LENGTH + cipherBuffer.byteLength)
  combined.set(iv, 0)
  combined.set(new Uint8Array(cipherBuffer), IV_LENGTH)

  // Retornar como Base64 para almacenar en IDB como string
  return btoa(String.fromCharCode(...combined))
}

/**
 * Descifra el valor almacenado.
 * Extrae el IV de los primeros 12 bytes y descifra el resto.
 * GCM verifica la autenticidad del ciphertext automáticamente.
 */
async function decrypt(aesKey, base64Ciphertext) {
  const bytes    = Uint8Array.from(atob(base64Ciphertext), c => c.charCodeAt(0))
  const iv       = bytes.slice(0, IV_LENGTH)
  const cipher   = bytes.slice(IV_LENGTH)

  const plainBuffer = await crypto.subtle.decrypt(
    { name: AES_ALGO, iv },
    aesKey,
    cipher,
  )

  const decoder = new TextDecoder()
  return JSON.parse(decoder.decode(plainBuffer))
}

// ── Sanitización XSS ──────────────────────────────────────────────────────────

/**
 * Sanitiza strings recursivamente usando DOMPurify.
 * Para objetos/arrays, recorre cada string anidado.
 * Los datos de Manguito son números/booleans/strings — sanitizar solo strings
 * evita falsos positivos en montos, fechas, etc.
 */
async function sanitizeValue(value) {
  const DOMPurify = await getPurify()

  if (typeof value === 'string') {
    return DOMPurify.sanitize(value, {
      ALLOWED_TAGS:  [],   // Sin HTML permitido en datos financieros
      ALLOWED_ATTR:  [],
      FORCE_BODY:    false,
    })
  }

  if (Array.isArray(value)) {
    return Promise.all(value.map(v => sanitizeValue(v)))
  }

  if (value !== null && typeof value === 'object') {
    const sanitized = {}
    for (const [k, v] of Object.entries(value)) {
      sanitized[k] = await sanitizeValue(v)
    }
    return sanitized
  }

  return value // números, booleans, null → sin cambios
}

// ── Clase principal SecureStorage ─────────────────────────────────────────────

class SecureStorage {
  constructor() {
    this._db     = null
    this._key    = null
    this._ready  = null  // Promise de inicialización
  }

  /**
   * Inicializa IDB + deriva la clave AES.
   * Se llama automáticamente en el primer uso.
   * Es idempotente: múltiples llamadas devuelven la misma Promise.
   */
  async _init(userId = '') {
    if (this._ready) return this._ready

    this._ready = (async () => {
      this._db  = await openDB()
      const salt = await getOrCreateSalt(this._db)
      const pwd  = buildKeyPassword(userId)
      this._key  = await deriveAESKey(pwd, salt)
    })()

    return this._ready
  }

  /**
   * Reinicializa la clave con el userId del usuario logueado.
   * Llamar después del login para "atar" la clave al usuario.
   */
  async bindUser(userId) {
    this._ready = null  // Reset para re-derivar con el userId
    this._key   = null
    await this._init(userId)
  }

  /**
   * Guarda un valor cifrado en IndexedDB.
   *
   * @param {string} key   - Clave del dato (ej: 'perfilFiscal')
   * @param {*}      value - Valor a cifrar (string, number, object, array)
   */
  async setItem(key, value) {
    await this._init()

    if (!this._key) throw new Error('[secureStorage] Clave AES no inicializada')
    if (typeof key !== 'string' || !key.trim()) throw new TypeError('[secureStorage] key debe ser un string no vacío')

    const ciphertext = await encrypt(this._key, value)

    await idbPut(this._db, STORE_NAME, {
      key,
      ciphertext,
      updatedAt: Date.now(),
    })
  }

  /**
   * Lee y descifra un valor desde IndexedDB.
   * Aplica DOMPurify sobre los strings del resultado.
   *
   * @param  {string} key        - Clave del dato
   * @param  {*}      defaultVal - Valor por defecto si no existe
   * @returns {*} El valor original deserializado y sanitizado
   */
  async getItem(key, defaultVal = null) {
    await this._init()

    try {
      const record = await idbGet(this._db, STORE_NAME, key)
      if (!record?.ciphertext) return defaultVal

      const decrypted = await decrypt(this._key, record.ciphertext)
      return await sanitizeValue(decrypted)
    } catch (err) {
      // GCM: si el ciphertext fue manipulado, decrypt lanza DOMException
      // Tratamos como dato corrupto → retornar default
      console.warn(`[secureStorage] No se pudo descifrar "${key}". Retornando default.`, err.name)
      return defaultVal
    }
  }

  /**
   * Elimina una entrada cifrada.
   */
  async removeItem(key) {
    await this._init()
    await idbDelete(this._db, STORE_NAME, key)
  }

  /**
   * Limpia TODOS los datos cifrados (no borra la clave AES ni el salt).
   */
  async clear() {
    await this._init()
    await idbClear(this._db, STORE_NAME)
  }

  /**
   * Verifica si una clave existe en el store.
   */
  async hasItem(key) {
    await this._init()
    const record = await idbGet(this._db, STORE_NAME, key)
    return record !== undefined
  }

  /**
   * PELIGRO: Elimina la clave AES y el salt.
   * Después de esto, TODOS los datos cifrados son irrecuperables.
   * Solo usar en "Cerrar sesión + borrar todos los datos".
   */
  async destroyKeys() {
    await this._init()
    await idbDelete(this._db, '_key_store', KEY_MATERIAL)
    await idbDelete(this._db, '_key_store', SALT_KEY)
    this._key   = null
    this._ready = null
  }
}

// ── Singleton exportado ───────────────────────────────────────────────────────
export const secureStorage = new SecureStorage()

// ── Hook React de conveniencia ────────────────────────────────────────────────

/**
 * useSecureStorage — React hook que envuelve secureStorage con estado.
 *
 * @param {string} key         - Clave del dato en IDB
 * @param {*}      initialValue - Valor inicial si no existe en IDB
 *
 * @example
 *   const [perfil, setPerfil, removePerfil] = useSecureStorage('perfilFiscal', null)
 */
import { useState, useEffect, useCallback } from 'react'

export function useSecureStorage(key, initialValue = null) {
  const [value,    setValue]    = useState(initialValue)
  const [loading,  setLoading]  = useState(true)
  const [error,    setError]    = useState(null)

  // Lectura inicial
  useEffect(() => {
    let cancelled = false
    setLoading(true)
    secureStorage.getItem(key, initialValue)
      .then(v  => { if (!cancelled) { setValue(v); setLoading(false) } })
      .catch(e => { if (!cancelled) { setError(e.message); setLoading(false) } })
    return () => { cancelled = true }
  }, [key]) // eslint-disable-line react-hooks/exhaustive-deps

  // Escritura
  const set = useCallback(async (newValue) => {
    try {
      const resolved = typeof newValue === 'function' ? newValue(value) : newValue
      await secureStorage.setItem(key, resolved)
      setValue(resolved)
    } catch (e) {
      setError(e.message)
      throw e
    }
  }, [key, value])

  // Borrado
  const remove = useCallback(async () => {
    try {
      await secureStorage.removeItem(key)
      setValue(initialValue)
    } catch (e) {
      setError(e.message)
    }
  }, [key, initialValue])

  return [value, set, remove, { loading, error }]
}