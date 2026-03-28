import { supabase } from '../lib/supabase'

export async function getSuscripciones() {
  const { data, error } = await supabase
    .from('suscripciones')
    .select('*')
    .order('nombre')
  if (error) throw error
  return data
}

export async function crearSuscripcion(campos) {
  const { data, error } = await supabase
    .from('suscripciones')
    .insert(campos)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function editarSuscripcion(id, campos) {
  const { data, error } = await supabase
    .from('suscripciones')
    .update({ ...campos, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function borrarSuscripcion(id) {
  const { error } = await supabase.from('suscripciones').delete().eq('id', id)
  if (error) throw error
}

/**
 * Calcula el resumen financiero de todas las suscripciones activas.
 * Normaliza todo a costo mensual en la moneda de cada ítem.
 */
export function calcularResumenSuscripciones(suscripciones, dolarBlue = 1000) {
  const activas = suscripciones.filter(s => s.activa)

  let totalMensualARS = 0

  const detalle = activas.map(s => {
    let costoMensual = s.monto
    if (s.ciclo === 'trimestral') costoMensual = s.monto / 3
    if (s.ciclo === 'anual') costoMensual = s.monto / 12

    // Convertir a ARS para el total
    const costoMensualARS = s.moneda === 'ARS' ? costoMensual : costoMensual * dolarBlue
    totalMensualARS += costoMensualARS

    return { ...s, costoMensual, costoMensualARS }
  })

  return {
    activas: activas.length,
    totalMensualARS,
    totalAnualARS: totalMensualARS * 12,
    detalle,
  }
}

// Suscripciones populares predefinidas para ayudar al usuario
export const SUSCRIPCIONES_POPULARES = [
  { nombre: 'Netflix',   icono: '🎬', color: '#E50914', categoria: 'streaming', moneda: 'USD' },
  { nombre: 'Spotify',   icono: '🎵', color: '#1DB954', categoria: 'musica',    moneda: 'USD' },
  { nombre: 'Disney+',   icono: '✨', color: '#113CCF', categoria: 'streaming', moneda: 'USD' },
  { nombre: 'HBO Max',   icono: '🎭', color: '#5822FF', categoria: 'streaming', moneda: 'USD' },
  { nombre: 'YouTube Premium', icono: '▶️', color: '#FF0000', categoria: 'streaming', moneda: 'USD' },
  { nombre: 'iCloud',    icono: '☁️', color: '#3478F6', categoria: 'nube',      moneda: 'USD' },
  { nombre: 'Google One',icono: '🔵', color: '#4285F4', categoria: 'nube',      moneda: 'USD' },
  { nombre: 'ChatGPT',   icono: '🤖', color: '#74AA9C', categoria: 'ia',        moneda: 'USD' },
  { nombre: 'Adobe CC',  icono: '🎨', color: '#FF0000', categoria: 'software',  moneda: 'USD' },
  { nombre: 'Gym',       icono: '🏋️', color: '#F59E0B', categoria: 'salud',     moneda: 'ARS' },
]