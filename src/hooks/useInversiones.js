import { useState, useEffect, useCallback } from 'react'
import {
  getInversiones, crearInversion, editarInversion, borrarInversion,
  fetchPrecios, fetchDolarRate, calcularPortfolio,
} from '../api/inversiones'

export function useInversiones() {
  const [inversiones,      setInversiones]      = useState([])
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
      const data = await getInversiones()
      setInversiones(data)
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
      // No hay inversiones, igual buscamos el dólar para el portfolio vacío
      fetchDolarRate().then(setDolarRate).catch(console.error)
      setPortfolio(calcularPortfolio([], {}, null))
    }
  }, [inversiones, cargando, actualizarPrecios])

  // ── CRUD ─────────────────────────────────────
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

  return {
    inversiones,
    cotizaciones,
    dolarRate,
    portfolio,
    cargando,
    cargandoPrecios,
    error,
    recargar:        cargar,
    refrescarPrecios: () => actualizarPrecios(inversiones),
    crear,
    editar,
    borrar,
  }
}