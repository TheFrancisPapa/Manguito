// src/hooks/useCategorias.js

import { useState, useEffect, useCallback } from 'react'
import {
  getCategorias, crearCategoria,
  editarCategoria, borrarCategoria,
} from '../api/categorias'

export function useCategorias(tipo = null) {
  const [categorias, setCategorias] = useState([])
  const [cargando, setCargando]     = useState(true)
  const [error, setError]           = useState(null)

  const cargar = useCallback(async () => {
    try {
      setCargando(true)
      setError(null)
      const data = await getCategorias(tipo)
      setCategorias(data)
    } catch (e) {
      setError(e.message)
    } finally {
      setCargando(false)
    }
  }, [tipo])

  useEffect(() => { cargar() }, [cargar])

  // Separadas por tipo — útil para selects en formularios
  const gastos   = categorias.filter(c => c.tipo === 'gasto')
  const ingresos = categorias.filter(c => c.tipo === 'ingreso')

  async function agregar(datos) {
    const nueva = await crearCategoria(datos)
    setCategorias(prev =>
      [...prev, nueva].sort((a, b) => a.nombre.localeCompare(b.nombre))
    )
    return nueva
  }

  async function eliminar(id) {
    // Puede lanzar error si tiene movimientos — el componente lo captura
    await borrarCategoria(id)
    setCategorias(prev => prev.filter(c => c.id !== id))
  }

  return {
    categorias, gastos, ingresos,
    cargando, error,
    recargar:  cargar,
    agregar,
    editar:    async (id, d) => { await editarCategoria(id, d); cargar() },
    eliminar,
  }
}