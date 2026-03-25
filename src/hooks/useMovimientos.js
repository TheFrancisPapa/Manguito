import { useState, useEffect, useCallback } from 'react'
import { getMovimientos, getUltimosMovimientos, getBalance,
         getGastosXCategoria, crearMovimiento, editarMovimiento, borrarMovimiento, getEvolucionMensual } from '../api/movimientos'

export function useMovimientos(filtros = {}) {
  const [movimientos, setMovimientos] = useState([])
  const [cargando, setCargando] = useState(true)
  const [error, setError]       = useState(null)
  const key = JSON.stringify(filtros)

  const cargar = useCallback(async () => {
    try { setCargando(true); setError(null); setMovimientos(await getMovimientos(filtros)) }
    catch (e) { setError(e.message) }
    finally { setCargando(false) }
  }, [key])

  useEffect(() => { cargar() }, [cargar])

  async function agregar(datos) {
    const nuevo = await crearMovimiento(datos)
    setMovimientos(prev => [nuevo, ...prev]); return nuevo
  }
  async function editar(id, cambios) {
    const actualizado = await editarMovimiento(id, cambios)
    setMovimientos(prev => prev.map(m => m.id === id ? actualizado : m)); return actualizado
  }
  async function borrar(id) {
    await borrarMovimiento(id); setMovimientos(prev => prev.filter(m => m.id !== id))
  }
  return { movimientos, cargando, error, agregar, editar, borrar, recargar: cargar }
}

export function useUltimosMovimientos(n = 5) {
  const [movimientos, setMovimientos] = useState([])
  const [cargando, setCargando]       = useState(true)

  const cargar = useCallback(() => {
    setCargando(true)
    getUltimosMovimientos(n)
      .then(setMovimientos).catch(console.error).finally(() => setCargando(false))
  }, [n])

  useEffect(() => { cargar() }, [cargar])
  return { movimientos, cargando, recargar: cargar }
}

export function useBalance(desde, hasta) {
  const [balance, setBalance]   = useState(null)
  const [cargando, setCargando] = useState(true)
  useEffect(() => {
    if (!desde || !hasta) return
    setCargando(true)
    getBalance(desde, hasta).then(setBalance).catch(console.error).finally(() => setCargando(false))
  }, [desde, hasta])
  return { balance, cargando }
}

export function useGastosXCategoria(desde, hasta) {
  const [datos, setDatos]       = useState([])
  const [cargando, setCargando] = useState(true)
  useEffect(() => {
    if (!desde || !hasta) return
    setCargando(true)
    getGastosXCategoria(desde, hasta)
      .then(obj => setDatos(Object.values(obj))).catch(console.error).finally(() => setCargando(false))
  }, [desde, hasta])
  return { datos, cargando }
}

export function useEvolucionMensual(meses = 6) {
  const [datos, setDatos]       = useState([])
  const [cargando, setCargando] = useState(true)

  const cargar = useCallback(() => {
    setCargando(true)
    getEvolucionMensual(meses)
      .then(setDatos).catch(console.error).finally(() => setCargando(false))
  }, [meses])

  useEffect(() => { cargar() }, [cargar])
  return { datos, cargando, recargar: cargar }
}