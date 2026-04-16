// src/hooks/useInversiones.js
// FIX: actualizarPrecios ya no está en las deps de useEffect para evitar re-renders infinitos.
// Se usa una ref para mantener la función actualizada sin re-disparar el efecto.

import { useState, useEffect, useCallback, useRef } from 'react'
import {
  getInversiones, crearInversion, editarInversion, borrarInversion,
  fetchPrecios, fetchDolarRate, calcularPortfolio,
} from '../api/inversiones'
import { getVentas, crearVenta, borrarVenta } from '../api/ventas'
import { otorgarXP, XP_POR_ACCION } from '../lib/gamificacion'

export function useInversiones() {
  const [inversiones,      setInversiones]      = useState([])
  const [ventas,           setVentas]           = useState([])
  const [cotizaciones,     setCotizaciones]     = useState({})
  const [dolarRate,        setDolarRate]        = useState(null)
  const [portfolio,        setPortfolio]        = useState(null)
  const [cargando,         setCargando]         = useState(true)
  const [cargandoPrecios,  setCargandoPrecios]  = useState(false)
  const [error,            setError]            = useState(null)

  // Ref para acceder siempre a la última versión de dolarRate/cotizaciones
  // sin añadirlos como deps (evita loops)
  const dolarRateRef   = useRef(null)
  const cotizacionesRef = useRef({})

  useEffect(() => { dolarRateRef.current = dolarRate },   [dolarRate])
  useEffect(() => { cotizacionesRef.current = cotizaciones }, [cotizaciones])

  // ── Fetch de precios ─────────────────────────────────────────
  const actualizarPrecios = useCallback(async (invs) => {
    if (!invs || invs.length === 0) return
    const invConPrecio = invs.filter(i => i.simbolo && i.tipo !== 'fci' && i.tipo !== 'otro')
    if (invConPrecio.length === 0) {
      // Aún así buscamos el dólar para el portfolio vacío
      try {
        const dolar = await fetchDolarRate()
        setDolarRate(dolar)
        setPortfolio(calcularPortfolio(invs, {}, dolar))
      } catch {}
      return
    }

    setCargandoPrecios(true)
    try {
      const [precios, dolar] = await Promise.all([
        fetchPrecios(invConPrecio),
        fetchDolarRate(),
      ])
      setCotizaciones(precios)
      setDolarRate(dolar)
      setPortfolio(calcularPortfolio(invs, precios, dolar))
    } catch (e) {
      console.error('Error actualizando precios:', e)
    } finally {
      setCargandoPrecios(false)
    }
  }, []) // sin deps externas que causen re-render

  // ── Carga inicial ────────────────────────────────────────────
  const cargar = useCallback(async () => {
    try {
      setCargando(true)
      setError(null)
      const [data, ventasData] = await Promise.all([
        getInversiones(),
        getVentas(),
      ])
      setInversiones(data)
      setVentas(ventasData)
    } catch (e) {
      setError(e.message)
    } finally {
      setCargando(false)
    }
  }, [])

  // ── Cargar al montar ─────────────────────────────────────────
  useEffect(() => { cargar() }, [cargar])

  // ── Actualizar precios cuando cambian las inversiones ────────
  // FIX: usamos una ref flag para no disparar en el render inicial (cargando=true)
  const primeraVezRef = useRef(true)
  useEffect(() => {
    if (cargando) return // esperar a que termine la carga inicial
    if (primeraVezRef.current) {
      primeraVezRef.current = false
      actualizarPrecios(inversiones)
      return
    }
    // Solo actualizamos si las inversiones cambiaron (no en cada re-render)
  }, [inversiones, cargando]) // eslint-disable-line react-hooks/exhaustive-deps

  // ── CRUD inversiones ─────────────────────────────────────────
  const crear = async (datos, usuario_id) => {
    if (!usuario_id) throw new Error('No se encontró sesión de usuario')
    const nueva = await crearInversion({ ...datos, usuario_id })
    const nuevaLista = [nueva, ...inversiones]
    setInversiones(nuevaLista)
    actualizarPrecios(nuevaLista)
    await otorgarXP('Registraste una inversión', XP_POR_ACCION.inversion)
    return nueva
  }

  const editar = async (id, datos) => {
    const actualizada = await editarInversion(id, datos)
    const nuevaLista = inversiones.map(i => i.id === id ? actualizada : i)
    setInversiones(nuevaLista)
    actualizarPrecios(nuevaLista)
    return actualizada
  }

  const borrar = async (id) => {
    await borrarInversion(id)
    const nuevaLista = inversiones.filter(i => i.id !== id)
    setInversiones(nuevaLista)
    setPortfolio(calcularPortfolio(nuevaLista, cotizacionesRef.current, dolarRateRef.current))
  }

  // ── CRUD ventas ──────────────────────────────────────────────
  const registrarVenta = async (datos, usuario_id) => {
    if (!usuario_id) throw new Error('No se encontró sesión de usuario')
    const venta = await crearVenta({ ...datos, usuario_id })
    setVentas(prev => [venta, ...prev])

    if (datos.inversion_id) {
      const inv = inversiones.find(i => i.id === datos.inversion_id)
      if (inv) {
        const cantidadRestante = Number(inv.cantidad) - Number(datos.cantidad)
        if (cantidadRestante <= 0.00000001) {
          await borrarInversion(datos.inversion_id)
          const nuevaLista = inversiones.filter(i => i.id !== datos.inversion_id)
          setInversiones(nuevaLista)
          setPortfolio(calcularPortfolio(nuevaLista, cotizacionesRef.current, dolarRateRef.current))
        } else {
          const actualizada = await editarInversion(datos.inversion_id, { cantidad: cantidadRestante })
          const nuevaLista = inversiones.map(i => i.id === datos.inversion_id ? actualizada : i)
          setInversiones(nuevaLista)
          actualizarPrecios(nuevaLista)
        }
      }
    }

    return venta
  }

  const eliminarVenta = async (id) => {
    await borrarVenta(id)
    setVentas(prev => prev.filter(v => v.id !== id))
  }

  return {
    inversiones,
    ventas,
    cotizaciones,
    dolarRate,
    portfolio,
    cargando,
    cargandoPrecios,
    error,
    recargar:         cargar,
    refrescarPrecios: () => actualizarPrecios(inversiones),
    crear,
    editar,
    borrar,
    registrarVenta,
    eliminarVenta,
  }
}