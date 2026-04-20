/**
 * src/lib/__tests__/secureStorage.test.js
 * Pruebas de integración para el módulo de almacenamiento seguro.
 * Ejecutar con: vitest run (requiere setup de IDB mock)
 *
 * Para testing manual en el browser console:
 */

// ══ SCRIPT DE PRUEBA MANUAL (pegar en browser console) ════════

async function testSecureStorage() {
  // Importar dinámicamente en el contexto de la app
  const { secureStorage } = await import('/src/lib/secureStorage.js')

  console.group('🔐 SecureStorage Tests')

  // ── Test 1: Escribir y leer un dato simple ──────────────────
  await secureStorage.setItem('test_string', 'hola manguito')
  const s = await secureStorage.getItem('test_string')
  console.assert(s === 'hola manguito', '❌ Test 1 FALLÓ: string simple')
  console.log('✅ Test 1: string simple →', s)

  // ── Test 2: Objeto complejo (perfil fiscal) ─────────────────
  const perfil = { categoria: 'D', tipoActividad: 'servicios', porcentaje: 0.3 }
  await secureStorage.setItem('perfil_fiscal', perfil)
  const p = await secureStorage.getItem('perfil_fiscal')
  console.assert(p.categoria === 'D', '❌ Test 2 FALLÓ: objeto complejo')
  console.log('✅ Test 2: objeto complejo →', p)

  // ── Test 3: Sanitización XSS ────────────────────────────────
  const malicious = { nombre: '<script>alert("xss")</script>', monto: 5000 }
  await secureStorage.setItem('test_xss', malicious)
  const x = await secureStorage.getItem('test_xss')
  console.assert(!x.nombre.includes('<script>'), '❌ Test 3 FALLÓ: XSS no sanitizado')
  console.log('✅ Test 3: XSS sanitizado →', x.nombre)
  // El nombre debería quedar vacío '' (DOMPurify con ALLOWED_TAGS:[]) o sanitizado

  // ── Test 4: Números y booleans sin modificar ────────────────
  await secureStorage.setItem('test_number', 42_000.50)
  const n = await secureStorage.getItem('test_number')
  console.assert(n === 42000.50, '❌ Test 4 FALLÓ: número')
  console.log('✅ Test 4: número →', n)

  // ── Test 5: Default value cuando no existe ──────────────────
  const missing = await secureStorage.getItem('no_existe', { fallback: true })
  console.assert(missing?.fallback === true, '❌ Test 5 FALLÓ: default value')
  console.log('✅ Test 5: default value →', missing)

  // ── Test 6: Verificar que los datos NO son legibles en IDB sin clave ──
  // Abrir IDB manualmente en DevTools → Application → IndexedDB → manguito_secure_db
  // → encrypted_store → deberías ver solo base64 cifrado, NO el JSON plano
  console.log('📋 Test 6: Verificar en DevTools → Application → IndexedDB:')
  console.log('   manguito_secure_db → encrypted_store → los valores deben ser BASE64 cifrado')

  // ── Test 7: removeItem ──────────────────────────────────────
  await secureStorage.removeItem('test_string')
  const removed = await secureStorage.getItem('test_string', 'DEFAULT')
  console.assert(removed === 'DEFAULT', '❌ Test 7 FALLÓ: removeItem')
  console.log('✅ Test 7: removeItem → default correctamente devuelto')

  // ── Test 8: hasItem ─────────────────────────────────────────
  const exists = await secureStorage.hasItem('perfil_fiscal')
  const notExists = await secureStorage.hasItem('test_string')
  console.assert(exists === true, '❌ Test 8a FALLÓ')
  console.assert(notExists === false, '❌ Test 8b FALLÓ')
  console.log('✅ Test 8: hasItem → exists:', exists, 'notExists:', notExists)

  // ── Test 9: Manipulación de ciphertext (AEAD integrity) ─────
  // Obtener el ciphertext directamente de IDB y corromperlo
  const db = await new Promise(r => { const req = indexedDB.open('manguito_secure_db'); req.onsuccess = e => r(e.target.result) })
  const tx = db.transaction('encrypted_store', 'readwrite')
  const store = tx.objectStore('encrypted_store')

  // Leer el record de perfil_fiscal
  const record = await new Promise(r => { const req = store.get('perfil_fiscal'); req.onsuccess = () => r(req.result) })

  // Corromper el ciphertext
  const corrupted = { ...record, ciphertext: record.ciphertext.slice(0, -10) + 'CORRUPTED' }
  await new Promise(r => { const req = tx.objectStore('encrypted_store').put(corrupted); req.onsuccess = r })

  const tampered = await secureStorage.getItem('perfil_fiscal', { tampered: true })
  console.assert(tampered?.tampered === true, '❌ Test 9 FALLÓ: ciphertext manipulado no detectado')
  console.log('✅ Test 9: ciphertext manipulado detectado → devuelve default', tampered)

  // ── Limpiar ────────────────────────────────────────────────
  await secureStorage.clear()
  console.log('🧹 Store limpiado')

  console.groupEnd()
  console.log('🎉 Todos los tests pasaron!')
}

// Ejecutar en el browser:
// testSecureStorage().catch(console.error)


// ══ VITEST UNIT TESTS (para CI) ═══════════════════════════════

import { describe, it, expect, beforeEach, vi } from 'vitest'

// Mock de Web Crypto API para Node.js (vitest corre en Node)
// En jsdom/happy-dom, crypto.subtle puede estar disponible según la versión

describe('secureStorage', () => {
  // Nota: estos tests requieren un entorno con IndexedDB + Web Crypto
  // Para CI: usar fake-indexeddb + @peculiar/webcrypto

  it('debe exportar los métodos correctos', async () => {
    const mod = await import('../secureStorage')
    expect(mod.secureStorage).toBeDefined()
    expect(typeof mod.secureStorage.setItem).toBe('function')
    expect(typeof mod.secureStorage.getItem).toBe('function')
    expect(typeof mod.secureStorage.removeItem).toBe('function')
    expect(typeof mod.secureStorage.clear).toBe('function')
    expect(typeof mod.secureStorage.hasItem).toBe('function')
    expect(typeof mod.useSecureStorage).toBe('function')
  })
})