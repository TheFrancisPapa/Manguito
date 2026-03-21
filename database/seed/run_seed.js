// database/seed/run_seed.js
import { supabase } from '../../src/lib/supabase'
import { seedCategorias,
         seedMovimientos,
         seedPresupuestos,
         seedMetas }       from './categorias'   // ← todo en un archivo

export async function seedSistema(usuarioId) {
  await seedCategorias(supabase, usuarioId)
}

export async function seedDemo(usuarioId) {
  const { data: cats, error } = await supabase
    .from('categorias')
    .select('id, nombre')
    .eq('usuario_id', usuarioId)

  if (error) throw error

  const catMap = Object.fromEntries(cats.map(c => [c.nombre, c.id]))

  await seedMovimientos(supabase, usuarioId, catMap)
  await seedPresupuestos(supabase, usuarioId, catMap)
  await seedMetas(supabase, usuarioId)

  await supabase
    .from('usuarios')
    .update({ onboarding_ok: true })
    .eq('id', usuarioId)
}

export async function limpiarDemo(usuarioId) {
  await Promise.all([
    supabase.from('movimientos') .delete().eq('usuario_id', usuarioId),
    supabase.from('presupuestos').delete().eq('usuario_id', usuarioId),
    supabase.from('metas')       .delete().eq('usuario_id', usuarioId),
  ])
}