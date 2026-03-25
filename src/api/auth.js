import { supabase } from '../lib/supabase'
import { seedSistema, seedDemo } from '../../database/seed/run_seed'

// Registrar nuevo usuario con todos los datos del onboarding multi-step
export async function registrar({ nombre, email, password, moneda = 'ARS',
  fechaNacimiento = null, objetivo = null, usarDemo = false }) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { nombre, moneda, fecha_nacimiento: fechaNacimiento, objetivo_principal: objetivo }
    }
  })
  if (error) throw error
  const uid = data.user.id
  await seedSistema(uid)
  if (usarDemo) await seedDemo(uid)
  return data.user
}

// Alias para el Registro multi-step (mismo comportamiento)
export const registrarUsuario = registrar

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

// getUsuarioActual — lo mantenemos para compatibilidad con useAuth.js
export async function getUsuarioActual() {
  const { data: { user } } = await supabase.auth.getUser()
  return user
}

// getSession — alias más moderno
export async function getSession() {
  const { data: { session }, error } = await supabase.auth.getSession()
  if (error) throw error
  return session
}

export function onCambioSesion(callback) {
  const { data: { subscription } } = supabase.auth.onAuthStateChange(
    (_event, session) => callback(session?.user ?? null)
  )
  return () => subscription.unsubscribe()
}

export async function getPerfil() {
  const { data, error } = await supabase.from('usuarios').select('*').single()
  if (error) throw error
  return data
}

export async function actualizarPerfil(campos) {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Sesión no encontrada")

  const { data, error } = await supabase
    .from('usuarios')
    .update({ ...campos, updated_at: new Date().toISOString() })
    .eq('id', user.id)
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