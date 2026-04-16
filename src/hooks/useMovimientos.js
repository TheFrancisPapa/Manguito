/**
 * src/hooks/useMovimientos.js  (VERSIÓN REFACTORIZADA)
 * ─────────────────────────────────────────────────────────────
 * Drop-in replacement del hook original.
 *
 * CAMBIOS vs. la versión anterior:
 *  - Los métodos ahora pasan por `movimientosRouter` en lugar de
 *    llamar a Supabase directamente.
 *  - La API pública del hook (lo que expone a los componentes)
 *    ES IDÉNTICA a la versión anterior. Cero cambios en los
 *    componentes que ya lo usan.
 *  - Se agrega `fuentes` al estado para que los componentes
 *    puedan mostrar de dónde vienen los datos (opcional).
 *
 * MIGRACIÓN:
 *  Reemplazar este archivo sobre el original.
 *  Los componentes existentes no necesitan ningún cambio.
 * ─────────────────────────────────────────────────────────────
 */

import { useState, useEffect, useCallback } from 'react'
import { movimientosRouter }   from '../services/movimientosRouter'
import { useAuthContext }      from '../context/AuthContext'
import { otorgarXP, XP_POR_ACCION } from '../lib/gamificacion'

// ── getBalance y getEvolucionMensual siguen usando Supabase directamente
// porque son RPCs que no tienen equivalente en los bancos aún.
// Los dejamos en src/api/movimientos.js y los importamos acá.
import {
  getGastosXCategoria,
} from '../api/movimientos'

// ── Constante para evitar recrear el objeto en cada render ────
const FILTRO_VACIO = {}

// ─────────────────────────────────────────────────────────────
//  useMovimientos
// ─────────────────────────────────────────────────────────────
export function useMovimientos(filtros = FILTRO_VACIO) {
  const { usuario } = useAuthContext()
  const [movimientos, setMovimientos] = useState([])
  const [cargando, setCargando]       = useState(true)
  const [error, setError]             = useState(null)
  const [fuentes, setFuentes]         = useState([]) // Nuevo: qué fuentes están activas

  const key = JSON.stringify(filtros)

  const cargar = useCallback(async () => {
    try {
      setCargando(true)
      setError(null)

      const data = await movimientosRouter.getMovimientos(
        usuario?.id ?? null,
        filtros,
      )

      setMovimientos(data)

      // Detectar qué fuentes están presentes en los resultados
      const fuentesPresentes = [...new Set(data.map(m => m.fuente))]
      setFuentes(fuentesPresentes)
    } catch (e) {
      setError(e.message)
    } finally {
      setCargando(false)
    }
  }, [key, usuario?.id]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => { cargar() }, [cargar])

  // ── Escritura ────────────────────────────────────────────────

  async function agregar(datos) {
    const nuevo = await movimientosRouter.crearMovimiento(datos)
    setMovimientos(prev => [nuevo, ...prev])

    // ← agregar esto
    const resultado = await otorgarXP('Registraste un movimiento', XP_POR_ACCION.movimiento)
    if (resultado?.logrosNuevos?.length > 0) {
      // mostrar notificación de logro (ver abajo)
    }
    return nuevo
  }

  async function editar(id, cambios) {
    const actualizado = await movimientosRouter.editarMovimiento(id, cambios)
    setMovimientos(prev =>
      prev.map(m => m.id === id ? actualizado : m)
    )
    return actualizado
  }

  async function borrar(id) {
    await movimientosRouter.borrarMovimiento(id)
    setMovimientos(prev => prev.filter(m => m.id !== id))
  }

  return {
    // ── API pública idéntica a la versión original ────────────
    movimientos,
    cargando,
    error,
    agregar,
    editar,
    borrar,
    recargar: cargar,
    // ── Nuevo: metadata de fuentes (opcional, no rompe nada) ──
    fuentes,
    tieneDatosBancarios: fuentes.some(f => f !== 'manual'),
  }
}

// ─────────────────────────────────────────────────────────────
//  useUltimosMovimientos
//  Sin cambios en la API pública.
// ─────────────────────────────────────────────────────────────
export function useUltimosMovimientos(n = 5) {
  const { usuario } = useAuthContext()
  const [movimientos, setMovimientos] = useState([])
  const [cargando, setCargando]       = useState(true)

  const cargar = useCallback(() => {
    setCargando(true)
    movimientosRouter
      .getMovimientos(usuario?.id ?? null, { limite: n })
      .then(setMovimientos)
      .catch(console.error)
      .finally(() => setCargando(false))
  }, [n, usuario?.id])

  useEffect(() => { cargar() }, [cargar])
  return { movimientos, cargando, recargar: cargar }
}

// ─────────────────────────────────────────────────────────────
//  useBalance  — sin cambios
// ─────────────────────────────────────────────────────────────
export function useBalance(desde, hasta) {
  const [balance, setBalance]   = useState(null)
  const [cargando, setCargando] = useState(true)

  useEffect(() => {
    if (!desde || !hasta) return
    setCargando(true)
    movimientosRouter
      .getBalance(desde, hasta)
      .then(setBalance)
      .catch(console.error)
      .finally(() => setCargando(false))
  }, [desde, hasta])

  return { balance, cargando }
}

// ─────────────────────────────────────────────────────────────
//  useGastosXCategoria  — sin cambios
// ─────────────────────────────────────────────────────────────
export function useGastosXCategoria(desde, hasta) {
  const [datos, setDatos]       = useState([])
  const [cargando, setCargando] = useState(true)

  useEffect(() => {
    if (!desde || !hasta) return
    setCargando(true)
    getGastosXCategoria(desde, hasta)
      .then(obj => setDatos(Object.values(obj)))
      .catch(console.error)
      .finally(() => setCargando(false))
  }, [desde, hasta])

  return { datos, cargando }
}

// ─────────────────────────────────────────────────────────────
//  useEvolucionMensual  — sin cambios
// ─────────────────────────────────────────────────────────────
export function useEvolucionMensual(meses = 6) {
  const [datos, setDatos]       = useState([])
  const [cargando, setCargando] = useState(true)

  const cargar = useCallback(() => {
    setCargando(true)
    movimientosRouter
      .getEvolucionMensual(meses)
      .then(setDatos)
      .catch(console.error)
      .finally(() => setCargando(false))
  }, [meses])

  useEffect(() => { cargar() }, [cargar])
  return { datos, cargando, recargar: cargar }
}