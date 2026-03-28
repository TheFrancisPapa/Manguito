// src/hooks/useVencimientos.js
import { useState, useEffect, useCallback } from 'react'
import { getVencimientos, crearVencimiento, editarVencimiento, borrarVencimiento } from '../api/vencimientos'

export function useVencimientos() {
  const [vencimientos, setVencimientos] = useState([])
  const [cargando, setCargando]         = useState(true)
  const [error, setError]               = useState(null)

  const cargar = useCallback(async () => {
    try {
      setCargando(true)
      setError(null)
      setVencimientos(await getVencimientos())
    } catch (e) {
      setError(e.message)
    } finally {
      setCargando(false)
    }
  }, [])

  useEffect(() => { cargar() }, [cargar])

  return {
    vencimientos,
    cargando,
    error,
    recargar: cargar,
    crear:  async (d)    => { const v = await crearVencimiento(d);   setVencimientos(p => [...p, v].sort((a,b) => a.dia_vencimiento - b.dia_vencimiento)); return v },
    editar: async (id,d) => { const v = await editarVencimiento(id,d); setVencimientos(p => p.map(x => x.id === id ? v : x)); return v },
    borrar: async (id)   => { await borrarVencimiento(id); setVencimientos(p => p.filter(x => x.id !== id)) },
  }
}