// src/api/presupuestos.js
import { supabase } from '../lib/supabase'

export async function getPresupuestosMesActual() {
  const { data, error } = await supabase.rpc('presupuestos_mes_actual')
  if (error) throw error
  return data
}

export async function crearPresupuesto({
  categoria_id, limite_monto, alerta_pct = 80,
  periodo = 'mensual', mes = null, anio = new Date().getFullYear(),
}) {
  const mesReal = periodo === 'mensual' ? (mes ?? new Date().getMonth() + 1) : null
  const { data, error } = await supabase
    .from('presupuestos')
    .insert({ categoria_id, limite_monto, alerta_pct, periodo, mes: mesReal, anio, activo: true })
    .select().single()
  if (error) {
    if (error.code === '23505')
      throw new Error('Ya tenés un presupuesto para esa categoría en ese período.')
    throw error
  }
  return data
}

export async function editarPresupuesto(id, campos) {
  const { data, error } = await supabase
    .from('presupuestos').update(campos).eq('id', id).select().single()
  if (error) throw error
  return data
}

export async function desactivarPresupuesto(id) {
  const { error } = await supabase
    .from('presupuestos').update({ activo: false }).eq('id', id)
  if (error) throw error
}

export async function clonarPresupuestosMesAnterior() {
  const hoy = new Date()
  const mesActual  = hoy.getMonth() + 1
  const anioActual = hoy.getFullYear()
  const mesPasado  = mesActual === 1 ? 12 : mesActual - 1
  const anioPasado = mesActual === 1 ? anioActual - 1 : anioActual

  const { data: ant, error: e1 } = await supabase
    .from('presupuestos')
    .select('categoria_id, limite_monto, alerta_pct')
    .eq('periodo', 'mensual').eq('mes', mesPasado)
    .eq('anio', anioPasado).eq('activo', true)
  if (e1) throw e1
  if (!ant.length) return []

  const { data, error: e2 } = await supabase
    .from('presupuestos')
    .upsert(ant.map(p => ({ ...p, periodo: 'mensual', mes: mesActual, anio: anioActual, activo: true })),
      { onConflict: 'usuario_id,categoria_id,periodo,mes,anio', ignoreDuplicates: true })
    .select()
  if (e2) throw e2
  return data
}