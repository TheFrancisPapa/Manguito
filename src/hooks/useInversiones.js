import { useState, useEffect, useCallback } from 'react'
import {
  getInversiones, crearInversion, editarInversion, borrarInversion,
  fetchPrecios, fetchDolarRate, calcularPortfolio,
} from '../api/inversiones'
import { getVentas, crearVenta, borrarVenta } from '../api/ventas'

export function useInversiones() {
  const [inversiones,      setInversiones]      = useState([])
  const [ventas,           setVentas]           = useState([])
  const [cotizaciones,     setCotizaciones]     = useState({})
  const [dolarRate,        setDolarRate]        = useState(null)
  const [portfolio,        setPortfolio]        = useState(null)
  const [cargando,         setCargando]         = useState(true)
  const [cargandoPrecios,  setCargandoPrecios]  = useState(false)
  const [error,            setError]            = useState(null)

  // ── Carga inicial desde DB ───────────────────
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

  // ── Fetch de precios ─────────────────────────
  const actualizarPrecios = useCallback(async (invs) => {
    if (!invs || invs.length === 0) return
    const invConPrecio = invs.filter(i => i.simbolo && i.tipo !== 'fci' && i.tipo !== 'otro')
    if (invConPrecio.length === 0) return

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
  }, [])

  // ── Efectos ──────────────────────────────────
  useEffect(() => { cargar() }, [cargar])

  useEffect(() => {
    if (inversiones.length > 0) {
      actualizarPrecios(inversiones)
    } else if (!cargando) {
      fetchDolarRate().then(setDolarRate).catch(console.error)
      setPortfolio(calcularPortfolio([], {}, null))
    }
  }, [inversiones, cargando, actualizarPrecios])

  // ── CRUD inversiones ─────────────────────────
  const crear = async (datos, usuario_id) => {
    if (!usuario_id) throw new Error('No se encontró sesión de usuario')
    const nueva = await crearInversion({ ...datos, usuario_id })
    const nuevaLista = [nueva, ...inversiones]
    setInversiones(nuevaLista)
    actualizarPrecios(nuevaLista)
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
    if (nuevaLista.length > 0) {
      setPortfolio(calcularPortfolio(nuevaLista, cotizaciones, dolarRate))
    } else {
      setPortfolio(calcularPortfolio([], {}, dolarRate))
    }
  }

  // ── CRUD ventas ──────────────────────────────
  const registrarVenta = async (datos, usuario_id) => {
    if (!usuario_id) throw new Error('No se encontró sesión de usuario')
    const venta = await crearVenta({ ...datos, usuario_id })
    setVentas(prev => [venta, ...prev])

    // Si la venta viene de una inversión existente,
    // descontamos la cantidad o la eliminamos si vendió todo
    if (datos.inversion_id) {
      const inv = inversiones.find(i => i.id === datos.inversion_id)
      if (inv) {
        const cantidadRestante = Number(inv.cantidad) - Number(datos.cantidad)
        if (cantidadRestante <= 0.00000001) {
          // Vendió todo: eliminamos la inversión
          await borrarInversion(datos.inversion_id)
          const nuevaLista = inversiones.filter(i => i.id !== datos.inversion_id)
          setInversiones(nuevaLista)
          setPortfolio(calcularPortfolio(nuevaLista, cotizaciones, dolarRate))
        } else {
          // Venta parcial: actualizamos la cantidad
          const actualizada = await editarInversion(datos.inversion_id, {
            cantidad: cantidadRestante,
          })
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