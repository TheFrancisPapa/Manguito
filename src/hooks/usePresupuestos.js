import { useState, useEffect, useCallback } from 'react'
import { getPresupuestosMesActual, crearPresupuesto, editarPresupuesto,
         desactivarPresupuesto, clonarPresupuestosMesAnterior } from '../api/presupuestos'

export function usePresupuestos() {
  const [presupuestos, setPresupuestos] = useState([])
  const [cargando, setCargando]         = useState(true)
  const [error, setError]               = useState(null)

  const cargar = useCallback(async () => {
    try { setCargando(true); setError(null); setPresupuestos(await getPresupuestosMesActual()) }
    catch (e) { setError(e.message) }
    finally { setCargando(false) }
  }, [])

  useEffect(() => { cargar() }, [cargar])

  const resumen = {
    total:     presupuestos.length,
    excedidos: presupuestos.filter(p => p.porcentaje > 100).length,
    alertas:   presupuestos.filter(p => p.porcentaje >= p.alerta_pct && p.porcentaje <= 100).length,
    holgados:  presupuestos.filter(p => p.porcentaje < p.alerta_pct).length,
  }

  return {
    presupuestos, resumen, cargando, error, recargar: cargar,
    crear:      async (d)    => { await crearPresupuesto(d);            cargar() },
    editar:     async (id,d) => { await editarPresupuesto(id, d);       cargar() },
    desactivar: async (id)   => { await desactivarPresupuesto(id);      cargar() },
    clonarMes:  async ()     => { await clonarPresupuestosMesAnterior(); cargar() },
  }
}