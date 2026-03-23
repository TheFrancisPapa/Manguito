import { supabase } from '../lib/supabase'
import { seedSistema, seedDemo } from '../../database/seed/run_seed'

export async function registrar({ nombre, email, password, moneda, usarDemo }) {
  const { data, error } = await supabase.auth.signUp({
    email, password,
    options: { data: { nombre, moneda } },
  })
  if (error) throw error
  const uid = data.user.id
  await seedSistema(uid)
  if (usarDemo) await seedDemo(uid)
  return data.user
}

export async function login({ email, password }) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) throw error
  return data.user
}

export async function loginConGoogle() {
  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: { redirectTo: `${window.location.origin}/dashboard` },
  })
  if (error) throw error
}

export async function logout() {
  const { error } = await supabase.auth.signOut()
  if (error) throw error
}

export async function getUsuarioActual() {
  const { data: { user } } = await supabase.auth.getUser()
  return user
}

export function onCambioSesion(callback) {
  const { data: { subscription } } = supabase.auth.onAuthStateChange(
    (_event, session) => callback(session?.user ?? null)
  )
  return () => subscription.unsubscribe()
}

export async function getPerfil() {
  const { data, error } = await supabase
    .from('usuarios').select('*').single()
  if (error) throw error
  return data
}

export async function actualizarPerfil(campos) {
  const { data, error } = await supabase
    .from('usuarios')
    .update({ ...campos, updated_at: new Date().toISOString() })
    .select().single()
  if (error) throw error
  return data
}

export const completarOnboarding = () => actualizarPerfil({ onboarding_ok: true })

export async function recuperarPassword(email) {
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/reset-password`,
  })
  if (error) throw error
}

export async function actualizarPassword(nuevaPassword) {
  const { error } = await supabase.auth.updateUser({ password: nuevaPassword })
  if (error) throw error
}