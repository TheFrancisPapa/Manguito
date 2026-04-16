import { supabase } from './supabase'

// Cuánto XP da cada acción
export const XP_POR_ACCION = {
  movimiento:        20,
  movimiento_racha:  10,  // bonus por racha activa
  meta_creada:       75,
  meta_cumplida:     300,
  presupuesto_ok:    50,  // fin de mes sin exceder
  inversion:         150,
  login_diario:      5,
}

// XP necesario para cada nivel (curva exponencial suave)
export function xpParaNivel(nivel) {
  return Math.floor(500 * Math.pow(1.4, nivel - 1))
}

export function calcularNivel(xpTotal) {
  let nivel = 1
  let xpAcumulado = 0
  while (xpAcumulado + xpParaNivel(nivel) <= xpTotal) {
    xpAcumulado += xpParaNivel(nivel)
    nivel++
  }
  return {
    nivel,
    xpEnNivelActual: xpTotal - xpAcumulado,
    xpParaSiguiente: xpParaNivel(nivel),
    xpAcumuladoTotal: xpTotal,
  }
}

export const RANGOS = [
  { desde: 0,    nombre: 'Aprendiz Financiero', icono: '🌱' },
  { desde: 500,  nombre: 'Guardador',            icono: '🌿' },
  { desde: 1500, nombre: 'Ahorrador Constante',  icono: '🥭' },
  { desde: 3000, nombre: 'Inversor Inteligente', icono: '💡' },
  { desde: 6000, nombre: 'Maestro Manguito',     icono: '🏆' },
]

export function getRango(xpTotal) {
  return [...RANGOS].reverse().find(r => xpTotal >= r.desde) ?? RANGOS[0]
}

// Función principal: otorga XP y verifica logros
export async function otorgarXP(motivo, xpBase) {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data: perfil } = await supabase
    .from('usuarios')
    .select('xp, racha_actual, racha_maxima, ultimo_registro')
    .eq('id', user.id)
    .single()

  if (!perfil) return null

  // Calcular racha
  const hoy = new Date().toLocaleDateString('sv-SE')
  const ayer = new Date(Date.now() - 86400000).toLocaleDateString('sv-SE')
  let nuevaRacha = perfil.racha_actual

  if (perfil.ultimo_registro === ayer) {
    nuevaRacha = perfil.racha_actual + 1
  } else if (perfil.ultimo_registro !== hoy) {
    nuevaRacha = 1  // se rompió la racha
  }

  // Bonus si hay racha activa
  const xpTotal = perfil.xp + xpBase + (nuevaRacha > 1 ? XP_POR_ACCION.movimiento_racha : 0)

  // Actualizar perfil
  await supabase.from('usuarios').update({
    xp: xpTotal,
    racha_actual: nuevaRacha,
    racha_maxima: Math.max(nuevaRacha, perfil.racha_maxima ?? 0),
    ultimo_registro: hoy,
  }).eq('id', user.id)

  // Guardar en historial
  await supabase.from('xp_historial').insert({
    usuario_id: user.id,
    xp: xpBase,
    motivo,
  })

  // Verificar logros desbloqueables
  const logrosNuevos = await verificarLogros(user.id, xpTotal, nuevaRacha)

  return { xpGanado: xpBase, xpTotal, racha: nuevaRacha, logrosNuevos }
}

async function verificarLogros(usuarioId, xpTotal, racha) {
  // Traer logros que aún no tiene
  const { data: yaDesbloqueados } = await supabase
    .from('usuario_logros')
    .select('logro_id')
    .eq('usuario_id', usuarioId)

  const idsYa = new Set((yaDesbloqueados ?? []).map(l => l.logro_id))

  const { data: todosLogros } = await supabase.from('logros').select('*')
  if (!todosLogros) return []

  // Stats del usuario para evaluar condiciones
  const { count: totalMovimientos } = await supabase
    .from('movimientos')
    .select('*', { count: 'exact', head: true })
    .eq('usuario_id', usuarioId)

  const { count: metasCompletadas } = await supabase
    .from('metas')
    .select('*', { count: 'exact', head: true })
    .eq('usuario_id', usuarioId)
    .eq('estado', 'completada')

  const { count: inversiones } = await supabase
    .from('inversiones')
    .select('*', { count: 'exact', head: true })
    .eq('usuario_id', usuarioId)

  const stats = {
    racha,
    movimientos: totalMovimientos ?? 0,
    metas_completadas: metasCompletadas ?? 0,
    inversiones: inversiones ?? 0,
  }

  const desbloqueados = []

  for (const logro of todosLogros) {
    if (idsYa.has(logro.id)) continue

    const cumple = (() => {
      switch (logro.condicion_tipo) {
        case 'racha':               return stats.racha >= logro.condicion_valor
        case 'movimientos':         return stats.movimientos >= logro.condicion_valor
        case 'metas_completadas':   return stats.metas_completadas >= logro.condicion_valor
        case 'inversiones':         return stats.inversiones >= logro.condicion_valor
        default: return false
      }
    })()

    if (cumple) {
      await supabase.from('usuario_logros').insert({
        usuario_id: usuarioId,
        logro_id: logro.id,
      })
      // XP de recompensa del logro
      await supabase.from('usuarios').update({
        xp: xpTotal + logro.xp_recompensa,
      }).eq('id', usuarioId)

      desbloqueados.push(logro)
    }
  }

  return desbloqueados
}