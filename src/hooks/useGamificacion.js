import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { calcularNivel, getRango } from '../lib/gamificacion'

export function useGamificacion() {
  const [datos, setDatos] = useState(null)
  const [cargando, setCargando] = useState(true)

  const cargar = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const [{ data: perfil }, { data: logros }] = await Promise.all([
      supabase.from('usuarios')
        .select('xp, racha_actual, racha_maxima, nombre')
        .eq('id', user.id)
        .single(),
      supabase.from('usuario_logros')
        .select('*, logros(*)')
        .eq('usuario_id', user.id)
        .order('desbloqueado_en', { ascending: false }),
    ])

    if (!perfil) return

    const xp = perfil.xp ?? 0
    const nivelInfo = calcularNivel(xp)
    const rango = getRango(xp)

    setDatos({
      xp,
      ...nivelInfo,
      rango,
      racha: perfil.racha_actual ?? 0,
      rachMaxima: perfil.racha_maxima ?? 0,
      logros: logros ?? [],
    })
    setCargando(false)
  }, [])

  useEffect(() => { cargar() }, [cargar])

  return { datos, cargando, recargar: cargar }
}