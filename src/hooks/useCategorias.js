import { useState, useEffect, useCallback } from 'react'
import { getCategorias, crearCategoria, editarCategoria, borrarCategoria } from '../api/categorias'

export function useCategorias(tipo = null) {
  const [categorias, setCategorias] = useState([])
  const [cargando, setCargando]     = useState(true)
  const [error, setError]           = useState(null)

  const cargar = useCallback(async () => {
    try { setCargando(true); setError(null); setCategorias(await getCategorias(tipo)) }
    catch (e) { setError(e.message) }
    finally { setCargando(false) }
  }, [tipo])

  useEffect(() => { cargar() }, [cargar])

  async function agregar(datos) {
    const nueva = await crearCategoria(datos)
    setCategorias(prev => [...prev, nueva].sort((a,b) => a.nombre.localeCompare(b.nombre)))
    return nueva
  }
  async function eliminar(id) {
    await borrarCategoria(id); setCategorias(prev => prev.filter(c => c.id !== id))
  }

  return {
    categorias,
    gastos:   categorias.filter(c => c.tipo === 'gasto'),
    ingresos: categorias.filter(c => c.tipo === 'ingreso'),
    cargando, error, recargar: cargar, agregar, eliminar,
    editar: async (id,d) => { await editarCategoria(id,d); cargar() },
  }
}