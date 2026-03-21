// src/hooks/useMovimientos.js

import { useState, useEffect, useCallback } from 'react'
import {
  getMovimientos, getUltimosMovimientos,
  getBalance, getGastosXCategoria,
  crearMovimiento, editarMovimiento, borrarMovimiento,
} from '../api/movimientos'

// Hook principal — lista con filtros
export function useMovimientos(filtros = {}) {
  const [movimientos, setMovimientos] = useState([])
  const [cargando, setCargando]       = useState(true)
  const [error, setError]             = useState(null)

  // Re-ejecutar si cambian los filtros
  const key = JSON.stringify(filtros)

  const cargar = useCallback(async () => {
    try {
      setCargando(true)
      setError(null)
      const data = await getMovimientos(filtros)
      setMovimientos(data)
    } catch (e) {
      setError(e.message)
    } finally {
      setCargando(false)
    }
  }, [key])

  useEffect(() => { cargar() }, [cargar])

  async function agregar(datos) {
    const nuevo = await crearMovimiento(datos)
    // Insertar al inicio — lista está ordenada por fecha desc
    setMovimientos(prev => [nuevo, ...prev])
    return nuevo
  }

  async function editar(id, cambios) {
    const actualizado = await editarMovimiento(id, cambios)
    setMovimientos(prev => prev.map(m => m.id === id ? actualizado : m))
    return actualizado
  }

  async function borrar(id) {
    await borrarMovimiento(id)
    setMovimientos(prev => prev.filter(m => m.id !== id))
  }

  return { movimientos, cargando, error, agregar, editar, borrar, recargar: cargar }
}

// Hook liviano para el widget del Dashboard
export function useUltimosMovimientos(n = 5) {
  const [movimientos, setMovimientos] = useState([])
  const [cargando, setCargando]       = useState(true)

  useEffect(() => {
    getUltimosMovimientos(n)
      .then(setMovimientos)
      .catch(console.error)
      .finally(() => setCargando(false))
  }, [n])

  return { movimientos, cargando }
}

// Hook para el balance del período actual
export function useBalance(desde, hasta) {
  const [balance, setBalance]   = useState(null)
  const [cargando, setCargando] = useState(true)

  useEffect(() => {
    if (!desde || !hasta) return
    setCargando(true)
    getBalance(desde, hasta)
      .then(setBalance)
      .catch(console.error)
      .finally(() => setCargando(false))
  }, [desde, hasta])

  return { balance, cargando }
}

// Hook para la torta de gastos por categoría
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