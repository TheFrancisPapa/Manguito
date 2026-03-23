export const CATEGORIAS_DEFAULT = [
  { nombre: 'Alimentación',    tipo: 'gasto',   icono: '🛒', color: '#F59E0B' },
  { nombre: 'Transporte',      tipo: 'gasto',   icono: '🚗', color: '#3B82F6' },
  { nombre: 'Vivienda',        tipo: 'gasto',   icono: '🏠', color: '#8B5CF6' },
  { nombre: 'Salud',           tipo: 'gasto',   icono: '💊', color: '#EF4444' },
  { nombre: 'Educación',       tipo: 'gasto',   icono: '📚', color: '#06B6D4' },
  { nombre: 'Entretenimiento', tipo: 'gasto',   icono: '🎬', color: '#EC4899' },
  { nombre: 'Ropa',            tipo: 'gasto',   icono: '👕', color: '#F97316' },
  { nombre: 'Servicios',       tipo: 'gasto',   icono: '💡', color: '#84CC16' },
  { nombre: 'Otros gastos',    tipo: 'gasto',   icono: '📦', color: '#6B7280' },
  { nombre: 'Sueldo',          tipo: 'ingreso', icono: '💰', color: '#10B981' },
  { nombre: 'Freelance',       tipo: 'ingreso', icono: '💻', color: '#059669' },
  { nombre: 'Inversiones',     tipo: 'ingreso', icono: '📈', color: '#047857' },
  { nombre: 'Otros ingresos',  tipo: 'ingreso', icono: '✨', color: '#6EE7B7' },
]

export async function seedCategorias(supabase, usuarioId) {
  const rows = CATEGORIAS_DEFAULT.map(c => ({ ...c, usuario_id: usuarioId, es_default: true }))
  const { error } = await supabase.from('categorias').insert(rows)
  if (error) throw new Error(`seedCategorias: ${error.message}`)
  console.log(`✅ ${rows.length} categorías insertadas`)
}

function hace(diasAtras) {
  const d = new Date(); d.setDate(d.getDate() - diasAtras)
  return d.toISOString().split('T')[0]
}

export async function seedMovimientos(supabase, usuarioId, catMap) {
  const rows = [
    { tipo: 'ingreso', monto: 850000, descripcion: 'Sueldo marzo',          fecha: hace(25), categoria_id: catMap['Sueldo'] },
    { tipo: 'ingreso', monto: 180000, descripcion: 'Proyecto web cliente',  fecha: hace(15), categoria_id: catMap['Freelance'] },
    { tipo: 'ingreso', monto: 22000,  descripcion: 'Dividendos FCI',        fecha: hace(10), categoria_id: catMap['Inversiones'] },
    { tipo: 'gasto', monto: 280000, descripcion: 'Alquiler marzo',   fecha: hace(28), categoria_id: catMap['Vivienda'],  es_recurrente: true, recurrencia: 'mensual' },
    { tipo: 'gasto', monto: 18500,  descripcion: 'Gas',              fecha: hace(20), categoria_id: catMap['Servicios'] },
    { tipo: 'gasto', monto: 9200,   descripcion: 'Internet',         fecha: hace(18), categoria_id: catMap['Servicios'], es_recurrente: true, recurrencia: 'mensual' },
    { tipo: 'gasto', monto: 7400,   descripcion: 'Luz',              fecha: hace(14), categoria_id: catMap['Servicios'] },
    { tipo: 'gasto', monto: 64000,  descripcion: 'Super semana 1',   fecha: hace(27), categoria_id: catMap['Alimentación'] },
    { tipo: 'gasto', monto: 8500,   descripcion: 'Verdulería',       fecha: hace(24), categoria_id: catMap['Alimentación'] },
    { tipo: 'gasto', monto: 12300,  descripcion: 'Carnicería',       fecha: hace(22), categoria_id: catMap['Alimentación'] },
    { tipo: 'gasto', monto: 71000,  descripcion: 'Super semana 2',   fecha: hace(20), categoria_id: catMap['Alimentación'] },
    { tipo: 'gasto', monto: 9800,   descripcion: 'Almacén',          fecha: hace(17), categoria_id: catMap['Alimentación'] },
    { tipo: 'gasto', monto: 58000,  descripcion: 'Super semana 3',   fecha: hace(13), categoria_id: catMap['Alimentación'] },
    { tipo: 'gasto', monto: 11200,  descripcion: 'Delivery pizza',   fecha: hace(9),  categoria_id: catMap['Alimentación'] },
    { tipo: 'gasto', monto: 67000,  descripcion: 'Super semana 4',   fecha: hace(6),  categoria_id: catMap['Alimentación'] },
    { tipo: 'gasto', monto: 8000,   descripcion: 'SUBE recarga',     fecha: hace(26), categoria_id: catMap['Transporte'] },
    { tipo: 'gasto', monto: 15000,  descripcion: 'Nafta',            fecha: hace(19), categoria_id: catMap['Transporte'] },
    { tipo: 'gasto', monto: 8000,   descripcion: 'SUBE recarga',     fecha: hace(12), categoria_id: catMap['Transporte'] },
    { tipo: 'gasto', monto: 6200,   descripcion: 'Remis aeropuerto', fecha: hace(7),  categoria_id: catMap['Transporte'] },
    { tipo: 'gasto', monto: 45000,  descripcion: 'Prepaga',          fecha: hace(25), categoria_id: catMap['Salud'], es_recurrente: true, recurrencia: 'mensual' },
    { tipo: 'gasto', monto: 12000,  descripcion: 'Consulta médica',  fecha: hace(16), categoria_id: catMap['Salud'] },
    { tipo: 'gasto', monto: 8700,   descripcion: 'Farmacia',         fecha: hace(11), categoria_id: catMap['Salud'] },
    { tipo: 'gasto', monto: 7200,   descripcion: 'Netflix',          fecha: hace(23), categoria_id: catMap['Entretenimiento'], es_recurrente: true, recurrencia: 'mensual' },
    { tipo: 'gasto', monto: 4800,   descripcion: 'Spotify',          fecha: hace(23), categoria_id: catMap['Entretenimiento'], es_recurrente: true, recurrencia: 'mensual' },
    { tipo: 'gasto', monto: 38000,  descripcion: 'Cena restaurante', fecha: hace(8),  categoria_id: catMap['Entretenimiento'] },
    { tipo: 'gasto', monto: 22000,  descripcion: 'Cine + salida',    fecha: hace(3),  categoria_id: catMap['Entretenimiento'] },
    { tipo: 'gasto', monto: 35000,  descripcion: 'Curso online',     fecha: hace(21), categoria_id: catMap['Educación'] },
    { tipo: 'gasto', monto: 48000,  descripcion: 'Zapatillas',       fecha: hace(5),  categoria_id: catMap['Ropa'] },
  ].map(r => ({ usuario_id: usuarioId, es_recurrente: false, ...r }))
  const { error } = await supabase.from('movimientos').insert(rows)
  if (error) throw new Error(`seedMovimientos: ${error.message}`)
  console.log(`✅ ${rows.length} movimientos insertados`)
}

export async function seedPresupuestos(supabase, usuarioId, catMap) {
  const hoy = new Date(), mes = hoy.getMonth() + 1, anio = hoy.getFullYear()
  const rows = [
    { categoria_id: catMap['Alimentación'],    limite_monto: 280000, alerta_pct: 80, periodo: 'mensual', mes, anio, activo: true },
    { categoria_id: catMap['Entretenimiento'], limite_monto: 60000,  alerta_pct: 80, periodo: 'mensual', mes, anio, activo: true },
    { categoria_id: catMap['Transporte'],      limite_monto: 60000,  alerta_pct: 80, periodo: 'mensual', mes, anio, activo: true },
    { categoria_id: catMap['Salud'],           limite_monto: 130000, alerta_pct: 80, periodo: 'mensual', mes, anio, activo: true },
    { categoria_id: catMap['Servicios'],       limite_monto: 50000,  alerta_pct: 80, periodo: 'mensual', mes, anio, activo: true },
  ].map(r => ({ ...r, usuario_id: usuarioId }))
  const { error } = await supabase.from('presupuestos').insert(rows)
  if (error) throw new Error(`seedPresupuestos: ${error.message}`)
  console.log(`✅ ${rows.length} presupuestos insertados`)
}

export async function seedMetas(supabase, usuarioId) {
  const anio = new Date().getFullYear()
  const rows = [
    { nombre: 'Fondo de emergencia', descripcion: '3 meses cubiertos',  monto_objetivo: 900000,  monto_actual: 720000, fecha_limite: null,            icono: '🛡️', color: '#10B981', estado: 'activa', prioridad: 1 },
    { nombre: 'Vacaciones Bariloche', descripcion: '10 días en julio',  monto_objetivo: 600000,  monto_actual: 210000, fecha_limite: `${anio}-07-01`, icono: '✈️', color: '#3B82F6', estado: 'activa', prioridad: 2 },
    { nombre: 'Notebook nueva',       descripcion: 'MacBook Air M3',    monto_objetivo: 1800000, monto_actual: 90000,  fecha_limite: null,            icono: '💻', color: '#8B5CF6', estado: 'activa', prioridad: 3 },
  ].map(r => ({ ...r, usuario_id: usuarioId }))
  const { error } = await supabase.from('metas').insert(rows)
  if (error) throw new Error(`seedMetas: ${error.message}`)
  console.log(`✅ ${rows.length} metas insertadas`)
}