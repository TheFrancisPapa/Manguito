import { useState, useEffect, useCallback } from 'react'
import { getMetas, crearMeta, editarMeta, aportarAMeta,
         pausarMeta, reanudarMeta, cancelarMeta, borrarMeta } from '../api/metas'
import { otorgarXP, XP_POR_ACCION } from '../lib/gamificacion'

export function useMetas(estado = null) {
  const [metas, setMetas]       = useState([])
  const [cargando, setCargando] = useState(true)
  const [error, setError]       = useState(null)

  const cargar = useCallback(async () => {
    try { setCargando(true); setError(null); setMetas(await getMetas(estado)) }
    catch (e) { setError(e.message) }
    finally { setCargando(false) }
  }, [estado])

  useEffect(() => { cargar() }, [cargar])

  async function aportar(id, monto) {
   const actualizada = await aportarAMeta(id, monto)
    setMetas(prev => prev.map(m => m.id === id ? actualizada : m))

    // ← si se completó la meta
    if (actualizada.estado === 'completada') {
      await otorgarXP('Meta de ahorro cumplida', XP_POR_ACCION.meta_cumplida)
    }

    return actualizada
  }

  return {
    metas, cargando, error, recargar: cargar,
    crear:    async (d)    => { await crearMeta(d);     await otorgarXP('Creaste una meta de ahorro', XP_POR_ACCION.meta_creada); cargar() },
    editar:   async (id,d) => { await editarMeta(id,d); cargar() },
    aportar,
    pausar:   async (id)   => { await pausarMeta(id);   cargar() },
    reanudar: async (id)   => { await reanudarMeta(id); cargar() },
    cancelar: async (id)   => { await cancelarMeta(id); cargar() },
    borrar:   async (id)   => { await borrarMeta(id);   cargar() },
  }
}