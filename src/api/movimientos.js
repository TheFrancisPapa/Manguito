import { supabase } from '../lib/supabase'

export async function getMovimientos(filtros = {}) {
  let q = supabase
    .from('movimientos')
    .select('*, categorias ( nombre, icono, color )')
    .order('fecha', { ascending: false })
  if (filtros.tipo)         q = q.eq('tipo', filtros.tipo)
  if (filtros.categoria_id) q = q.eq('categoria_id', filtros.categoria_id)
  if (filtros.desde)        q = q.gte('fecha', filtros.desde)
  if (filtros.hasta)        q = q.lte('fecha', filtros.hasta)
  if (filtros.limite)       q = q.limit(filtros.limite)
  const { data, error } = await q
  if (error) throw error
  return data
}

export const getUltimosMovimientos = (n = 5) => getMovimientos({ limite: n })

export async function getBalance(desde, hasta) {
  const { data, error } = await supabase.rpc('balance_usuario', {
    p_desde: desde, p_hasta: hasta,
  })
  if (error) throw error
  return data[0]
}

export async function getGastosXCategoria(desde, hasta) {
  const { data, error } = await supabase
    .from('movimientos')
    .select('monto, categorias ( nombre, icono, color )')
    .eq('tipo', 'gasto').gte('fecha', desde).lte('fecha', hasta)
  if (error) throw error
  return data.reduce((acc, mov) => {
    const nombre = mov.categorias.nombre
    if (!acc[nombre]) acc[nombre] = { nombre, monto: 0, ...mov.categorias }
    acc[nombre].monto += Number(mov.monto)
    return acc
  }, {})
}

export async function crearMovimiento({ tipo, monto, descripcion, fecha,
  categoria_id, es_recurrente = false, recurrencia = null }) {
  const { data, error } = await supabase
    .from('movimientos')
    .insert({ tipo, monto, descripcion, fecha, categoria_id, es_recurrente, recurrencia })
    .select('*, categorias ( nombre, icono, color )').single()
  if (error) throw error
  return data
}

export async function editarMovimiento(id, campos) {
  const { data, error } = await supabase
    .from('movimientos')
    .update({ ...campos, updated_at: new Date().toISOString() })
    .eq('id', id).select('*, categorias ( nombre, icono, color )').single()
  if (error) throw error
  return data
}

export async function borrarMovimiento(id) {
  const { error } = await supabase.from('movimientos').delete().eq('id', id)
  if (error) throw error
}

export async function getRecurrentes() {
  const { data, error } = await supabase
    .from('movimientos')
    .select('*, categorias ( nombre, icono, color )')
    .eq('es_recurrente', true).order('monto', { ascending: false })
  if (error) throw error
  return data
}