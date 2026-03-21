// src/hooks/useMetas.js

import { useState, useEffect, useCallback } from 'react'
import {
  getMetas, crearMeta, editarMeta,
  aportarAMeta, pausarMeta, reanudarMeta,
  cancelarMeta, borrarMeta,
} from '../api/metas'

export function useMetas(estado = null) {
  const [metas, setMetas]       = useState([])
  const [cargando, setCargando] = useState(true)
  const [error, setError]       = useState(null)

  const cargar = useCallback(async () => {
    try {
      setCargando(true)
      setError(null)
      const data = await getMetas(estado)
      setMetas(data)
    } catch (e) {
      setError(e.message)
    } finally {
      setCargando(false)
    }
  }, [estado])

  useEffect(() => { cargar() }, [cargar])

  async function aportar(id, monto) {
    const actualizada = await aportarAMeta(id, monto)
    setMetas(prev => prev.map(m => m.id === id ? actualizada : m))
    return actualizada
  }

  return {
    metas,
    cargando,
    error,
    recargar:  cargar,
    crear:     async (d)     => { await crearMeta(d);      cargar() },
    editar:    async (id, d) => { await editarMeta(id, d); cargar() },
    aportar,
    pausar:    async (id) => { await pausarMeta(id);    cargar() },
    reanudar:  async (id) => { await reanudarMeta(id);  cargar() },
    cancelar:  async (id) => { await cancelarMeta(id);  cargar() },
    borrar:    async (id) => { await borrarMeta(id);    cargar() },
  }
}