import { supabase } from '../lib/supabase'

export async function getVencimientos() {
  const { data, error } = await supabase
    .from('vencimientos')
    .select('*')
    .eq('activo', true)
    .order('dia_vencimiento')
  if (error) throw error
  return data
}

export async function crearVencimiento(campos) {
  const { data, error } = await supabase
    .from('vencimientos')
    .insert(campos)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function editarVencimiento(id, campos) {
  const { data, error } = await supabase
    .from('vencimientos')
    .update({ ...campos, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function borrarVencimiento(id) {
  const { error } = await supabase.from('vencimientos').delete().eq('id', id)
  if (error) throw error
}

/**
 * Devuelve los vencimientos que caen dentro de los próximos N días.
 * Tiene en cuenta el mes actual y el siguiente para evitar falsos negativos.
 */
export function getVencimientosProximos(vencimientos, diasUmbral = 7) {
  const hoy = new Date()
  const diaHoy = hoy.getDate()
  const mesHoy = hoy.getMonth()
  const anioHoy = hoy.getFullYear()

  return vencimientos
    .map(v => {
      let diaVence = v.dia_vencimiento
      // Normalizar días que no existen en el mes actual (ej: 31 en febrero)
      const diasEnMes = new Date(anioHoy, mesHoy + 1, 0).getDate()
      diaVence = Math.min(diaVence, diasEnMes)

      let fechaVence = new Date(anioHoy, mesHoy, diaVence)
      // Si ya pasó este mes, calcular para el mes siguiente
      if (diaVence < diaHoy) {
        fechaVence = new Date(anioHoy, mesHoy + 1, Math.min(v.dia_vencimiento,
          new Date(anioHoy, mesHoy + 2, 0).getDate()))
      }

      const diasRestantes = Math.ceil((fechaVence - hoy) / 86_400_000)
      return { ...v, diasRestantes, fechaVence }
    })
    .filter(v => v.diasRestantes <= diasUmbral && v.diasRestantes >= 0)
    .sort((a, b) => a.diasRestantes - b.diasRestantes)
}