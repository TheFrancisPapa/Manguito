// src/api/categorias.js
import { supabase } from '../lib/supabase'

export async function getCategorias(tipo = null) {
  let q = supabase.from('categorias').select('*').order('nombre')
  if (tipo) q = q.eq('tipo', tipo)
  const { data, error } = await q
  if (error) throw error
  return data
}

export const getCategoriasGasto   = () => getCategorias('gasto')
export const getCategoriasIngreso = () => getCategorias('ingreso')

export async function crearCategoria({ nombre, tipo, icono, color }) {
  const { data, error } = await supabase
    .from('categorias')
    .insert({ nombre, tipo, icono, color, es_default: false })
    .select()
    .single()
  if (error) {
    if (error.code === '23505')
      throw new Error(`Ya tenés una categoría "${nombre}" de tipo ${tipo}.`)
    throw error
  }
  return data
}

export async function editarCategoria(id, campos) {
  const { data, error } = await supabase
    .from('categorias').update(campos).eq('id', id).select().single()
  if (error) throw error
  return data
}

export async function borrarCategoria(id) {
  const { error } = await supabase.from('categorias').delete().eq('id', id)
  if (error) {
    if (error.code === '23503')
      throw new Error('No podés borrar esta categoría porque tiene movimientos.')
    throw error
  }
}