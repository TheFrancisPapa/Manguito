// src/api/metas.js
import { supabase } from '../lib/supabase'

export async function getMetas(estado = null) {
  let q = supabase
    .from('metas').select('*')
    .order('prioridad')
    .order('fecha_limite', { ascending: true, nullsLast: true })
  if (estado) q = q.eq('estado', estado)
  const { data, error } = await q
  if (error) throw error
  return data
}

export const getMetasActivas     = () => getMetas('activa')
export const getMetasCompletadas = () => getMetas('completada')

export async function crearMeta({ nombre, descripcion = null, monto_objetivo,
  fecha_limite = null, icono = '🎯', color = '#10B981', prioridad = 1 }) {
  const { data, error } = await supabase
    .from('metas')
    .insert({ nombre, descripcion, monto_objetivo, monto_actual: 0,
              fecha_limite, icono, color, estado: 'activa', prioridad })
    .select().single()
  if (error) throw error
  return data
}

export async function editarMeta(id, campos) {
  const { data, error } = await supabase
    .from('metas')
    .update({ ...campos, updated_at: new Date().toISOString() })
    .eq('id', id).select().single()
  if (error) throw error
  return data
}

export async function aportarAMeta(id, montoAporte) {
  const { data: meta, error: e1 } = await supabase
    .from('metas').select('monto_actual, monto_objetivo').eq('id', id).single()
  if (e1) throw e1

  const nuevoMonto = Number(meta.monto_actual) + Number(montoAporte)
  const completada = nuevoMonto >= Number(meta.monto_objetivo)
  return editarMeta(id, {
    monto_actual: Math.min(nuevoMonto, meta.monto_objetivo),
    estado: completada ? 'completada' : 'activa',
  })
}

export const pausarMeta    = (id) => editarMeta(id, { estado: 'pausada'   })
export const reanudarMeta  = (id) => editarMeta(id, { estado: 'activa'    })
export const cancelarMeta  = (id) => editarMeta(id, { estado: 'cancelada' })

export async function borrarMeta(id) {
  const { error } = await supabase.from('metas').delete().eq('id', id)
  if (error) throw error
}