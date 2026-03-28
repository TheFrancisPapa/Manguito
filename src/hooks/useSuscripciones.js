// src/hooks/useSuscripciones.js
import { useState, useEffect, useCallback } from 'react'
import { getSuscripciones, crearSuscripcion, editarSuscripcion, borrarSuscripcion, calcularResumenSuscripciones } from '../api/suscripciones'

export function useSuscripciones(dolarBlue = null) {
  const [suscripciones, setSuscripciones] = useState([])
  const [cargando, setCargando]           = useState(true)
  const [error, setError]                 = useState(null)

  const cargar = useCallback(async () => {
    try {
      setCargando(true)
      setError(null)
      setSuscripciones(await getSuscripciones())
    } catch (e) {
      setError(e.message)
    } finally {
      setCargando(false)
    }
  }, [])

  useEffect(() => { cargar() }, [cargar])

  const resumen = calcularResumenSuscripciones(suscripciones, dolarBlue?.venta ?? 1000)

  return {
    suscripciones,
    resumen,
    cargando,
    error,
    recargar: cargar,
    crear:    async (d)    => { const s = await crearSuscripcion(d);   setSuscripciones(p => [...p, s]); return s },
    editar:   async (id,d) => { const s = await editarSuscripcion(id,d); setSuscripciones(p => p.map(x => x.id === id ? s : x)); return s },
    borrar:   async (id)   => { await borrarSuscripcion(id); setSuscripciones(p => p.filter(x => x.id !== id)) },
    toggleActiva: async (id) => {
      const s = suscripciones.find(x => x.id === id)
      if (!s) return
      const actualizada = await editarSuscripcion(id, { activa: !s.activa })
      setSuscripciones(p => p.map(x => x.id === id ? actualizada : x))
    },
  }
}