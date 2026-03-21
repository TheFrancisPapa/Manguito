// database/seed/run_seed.js
// ─────────────────────────────────────────────────────────
//  Orquestador del seed de Manguito.
//  Importá y llamá desde src/api/auth.js al registrarse.
// ─────────────────────────────────────────────────────────

import { supabase }           from '../../src/lib/supabase'
import { seedCategorias }     from './categorias'
import { seedMovimientos }    from './movimientos'
import { seedPresupuestos }   from './presupuestos'
import { seedMetas }          from './metas'

/**
 * SEED DE SISTEMA
 * Se llama siempre, automáticamente, al completar el registro.
 * Solo inserta las categorías base. Sin esto el formulario
 * de "nuevo movimiento" queda vacío.
 */
export async function seedSistema(usuarioId) {
  await seedCategorias(supabase, usuarioId)
}

/**
 * SEED DE DEMO
 * Solo si el usuario eligió "ver con datos de ejemplo"
 * en la pantalla de onboarding.
 *
 * El orden importa: movimientos y presupuestos dependen
 * de que las categorías ya existan.
 */
export async function seedDemo(usuarioId) {
  // 1. Traer las categorías del usuario (ya creadas por seedSistema)
  const { data: cats, error: catError } = await supabase
    .from('categorias')
    .select('id, nombre, tipo')
    .eq('usuario_id', usuarioId)

  if (catError) throw catError

  // Mapa nombre → id para referenciar sin hacer joins
  const catMap = Object.fromEntries(cats.map(c => [c.nombre, c.id]))

  // 2. Insertar en orden
  await seedMovimientos(supabase, usuarioId, catMap)
  await seedPresupuestos(supabase, usuarioId, catMap)
  await seedMetas(supabase, usuarioId)

  // 3. Marcar onboarding completo
  await supabase
    .from('usuarios')
    .update({ onboarding_ok: true })
    .eq('id', usuarioId)

  console.log('🥭 Seed de demo completo para', usuarioId)
}

/**
 * LIMPIAR DEMO
 * Si el usuario quiere empezar de cero después de ver el demo.
 * Borra movimientos, presupuestos y metas pero NO las categorías
 * (esas son del sistema y siempre se quedan).
 */
export async function limpiarDemo(usuarioId) {
  await Promise.all([
    supabase.from('movimientos') .delete().eq('usuario_id', usuarioId),
    supabase.from('presupuestos').delete().eq('usuario_id', usuarioId),
    supabase.from('metas')       .delete().eq('usuario_id', usuarioId),
  ])
  console.log('🧹 Demo limpiado para', usuarioId)
}