/**
 * src/hooks/useMonotributo.js
 * ─────────────────────────────────────────────────────────────
 * Hook React que conecta el módulo de Trazabilidad Tributaria
 * con los datos reales del usuario (ingresos de Supabase + perfil).
 *
 * Uso básico:
 *   const { alerta, reserva, procesarIngreso } = useMonotributo()
 * ─────────────────────────────────────────────────────────────
 */

import { useState, useEffect, useCallback, useMemo } from 'react'
import { supabase } from '../lib/supabase'
import { useAuthContext } from '../context/AuthContext'
import { useBalance } from './useMovimientos'
import { useSecureStorage } from '../lib/secureStorage'
import {
  calcularAlertaMonotributo,
  calcularReservaFiscal,
  procesarIngresoMonotributo,
  detectarCategoriaCorrecta,
  PORCENTAJE_RESERVA_DEFAULT,
} from '../lib/monotributo'

// ── Clave de persistencia del perfil fiscal ──────────────────
const STORAGE_KEY_FISCAL = 'manguito_perfil_fiscal'

/**
 * Carga y persiste el perfil fiscal del usuario en localStorage
 * (fallback cuando no hay tabla dedicada en la DB).
 */
export function useMonotributo() {
  const { usuario } = useAuthContext()

  // ── Perfil fiscal (categoría, tipo de actividad) ─────────────
  const [perfilFiscal, setPerfilFiscal, , { loading: cargandoPerfil }] = useSecureStorage(STORAGE_KEY_FISCAL, {
    categoria:          null,   // 'A' ... 'H'
    tipoActividad:      'servicios',
    porcentajeReserva:  PORCENTAJE_RESERVA_DEFAULT,
    nombreMetaReserva:  'Reserva Fiscal Monotributo',
    metaReservaId:      null,   // id de la meta en Supabase
  })

  // ── Ingresos del año actual desde Supabase ────────────────────
  const anioActual = new Date().getFullYear()
  const desdeAnio  = `${anioActual}-01-01`
  const hastaAnio  = `${anioActual}-12-31`

  const [ingresosMensuales, setIngresosMensuales] = useState([])
  const [cargandoIngresos, setCargandoIngresos]   = useState(true)
  const [errorIngresos, setErrorIngresos]         = useState(null)

  // ── Reserva fiscal acumulada (desde la meta en Supabase) ──────
  const [reservaActual, setReservaActual]   = useState(0)
  const [datosMeta, setDatosMeta]           = useState(null)
  const [cargandoMeta, setCargandoMeta]     = useState(false)

  // ─────────────────────────────────────────────────────────────
  //  Carga de ingresos mensuales del año desde Supabase
  // ─────────────────────────────────────────────────────────────
  const cargarIngresosMensuales = useCallback(async () => {
    if (!usuario?.id) return
    setCargandoIngresos(true)
    setErrorIngresos(null)

    try {
      const { data, error } = await supabase
        .from('movimientos')
        .select('fecha, monto, tipo')
        .eq('tipo', 'ingreso')
        .gte('fecha', desdeAnio)
        .lte('fecha', hastaAnio)
        .order('fecha', { ascending: true })

      if (error) throw error

      // Agrupar por mes (índice 0 = enero)
      const porMes = Array(12).fill(0)
      ;(data ?? []).forEach(mov => {
        const mes = new Date(mov.fecha + 'T12:00:00').getMonth() // 0-indexed
        porMes[mes] += Number(mov.monto) || 0
      })

      // Recortar al mes actual (no incluir meses futuros con 0)
      const mesActualIdx = new Date().getMonth()
      setIngresosMensuales(porMes.slice(0, mesActualIdx + 1))
    } catch (e) {
      setErrorIngresos(e.message)
    } finally {
      setCargandoIngresos(false)
    }
  }, [usuario?.id, desdeAnio, hastaAnio])

  // ─────────────────────────────────────────────────────────────
  //  Carga / creación de la meta de reserva fiscal
  // ─────────────────────────────────────────────────────────────
  const cargarMetaReserva = useCallback(async () => {
    if (!usuario?.id || !perfilFiscal.metaReservaId) return
    setCargandoMeta(true)
    try {
      const { data, error } = await supabase
        .from('metas')
        .select('*')
        .eq('id', perfilFiscal.metaReservaId)
        .single()

      if (error || !data) {
        setReservaActual(0)
        setDatosMeta(null)
      } else {
        setReservaActual(Number(data.monto_actual) || 0)
        setDatosMeta(data)
      }
    } finally {
      setCargandoMeta(false)
    }
  }, [usuario?.id, perfilFiscal.metaReservaId])

  useEffect(() => { cargarIngresosMensuales() }, [cargarIngresosMensuales])
  useEffect(() => { cargarMetaReserva() }, [cargarMetaReserva])

  // ─────────────────────────────────────────────────────────────
  //  Cálculo reactivo — se recalcula si cambian ingresos o perfil
  // ─────────────────────────────────────────────────────────────
  const alerta = useMemo(() => {
    if (!perfilFiscal.categoria || !ingresosMensuales.length) return null
    return calcularAlertaMonotributo({
      ingresosMensuales,
      categoria:     perfilFiscal.categoria,
      tipoActividad: perfilFiscal.tipoActividad,
    })
  }, [ingresosMensuales, perfilFiscal.categoria, perfilFiscal.tipoActividad])

  const categoriaDetectada = useMemo(() => {
    if (!alerta) return null
    return detectarCategoriaCorrecta(alerta.proyeccionAnual, perfilFiscal.tipoActividad)
  }, [alerta, perfilFiscal.tipoActividad])

  // ─────────────────────────────────────────────────────────────
  //  Procesar un ingreso nuevo: reserva + alertas
  // ─────────────────────────────────────────────────────────────

  /**
   * Llama a esto cuando el usuario registra un nuevo ingreso.
   * Calcula cuánto separar y devuelve los datos para crear el
   * movimiento de reserva y el aporte a la meta en Supabase.
   *
   * @param {number} ingresoNuevo  Monto del ingreso recién registrado
   * @returns {Object} { alerta, reserva }
   */
  const procesarIngreso = useCallback((ingresoNuevo) => {
    if (!perfilFiscal.categoria) {
      console.warn('[useMonotributo] Configurá la categoría fiscal primero.')
      return null
    }

    return procesarIngresoMonotributo({
      ingresoNuevo,
      ingresosMensualesYTD: ingresosMensuales,
      categoria:       perfilFiscal.categoria,
      tipoActividad:   perfilFiscal.tipoActividad,
      reservaActual,
      porcentajeReserva: perfilFiscal.porcentajeReserva,
    })
  }, [ingresosMensuales, perfilFiscal, reservaActual])

  /**
   * Aplica la reserva fiscal en la base de datos:
   *   1. Crea un movimiento de gasto "Reserva fiscal" en la tabla movimientos
   *   2. Aporta el monto a la meta de reserva
   *
   * @param {number} ingresoNuevo
   * @param {string} [categoriaMovimientoId]  ID de categoría "Impuestos/Fiscal"
   */
  const aplicarReservaFiscal = useCallback(async (ingresoNuevo, categoriaMovimientoId = null) => {
    if (!usuario?.id) return null

    const resultado = procesarIngreso(ingresoNuevo)
    if (!resultado) return null

    const { reserva } = resultado
    const hoy = new Date().toLocaleDateString('sv-SE')

    try {
      // ── 1. Crear movimiento de reserva fiscal ──────────────
      const movPayload = {
        tipo:         'gasto',
        monto:        reserva.montoAReservar,
        descripcion:  reserva.descripcionMovimiento,
        fecha:        hoy,
        categoria_id: categoriaMovimientoId,
        es_recurrente: false,
      }

      const { data: movData, error: movError } = await supabase
        .from('movimientos')
        .insert(movPayload)
        .select('*')
        .single()

      if (movError) throw movError

      // ── 2. Aportar a la meta de reserva (si existe) ────────
      if (perfilFiscal.metaReservaId) {
        const nuevoMonto = reservaActual + reserva.montoAReservar
        await supabase
          .from('metas')
          .update({
            monto_actual: nuevoMonto,
            updated_at:   new Date().toISOString(),
          })
          .eq('id', perfilFiscal.metaReservaId)

        setReservaActual(nuevoMonto)
      }

      // ── 3. Refrescar ingresos del año ──────────────────────
      await cargarIngresosMensuales()

      return { movimiento: movData, reserva, alerta: resultado.alerta }
    } catch (e) {
      console.error('[useMonotributo] Error al aplicar reserva:', e)
      return null
    }
  }, [usuario?.id, procesarIngreso, reservaActual, perfilFiscal.metaReservaId, cargarIngresosMensuales])

  // ─────────────────────────────────────────────────────────────
  //  Configurar perfil fiscal
  // ─────────────────────────────────────────────────────────────
  const configurarPerfil = useCallback(async (cambios) => {
    await setPerfilFiscal(prev => ({ ...prev, ...cambios }))
  }, [setPerfilFiscal])

  /**
   * Crea la meta de reserva fiscal en Supabase si no existe.
   * @param {number} montoObjetivo  Objetivo de reserva anual sugerido
   */
  const crearMetaReserva = useCallback(async (montoObjetivo) => {
    if (!usuario?.id) return null

    const { data, error } = await supabase
      .from('metas')
      .insert({
        nombre:         perfilFiscal.nombreMetaReserva,
        descripcion:    'Reserva automática para cuotas y recategorización del Monotributo.',
        monto_objetivo: montoObjetivo,
        monto_actual:   0,
        icono:          '🏛️',
        color:          '#6366F1',
        estado:         'activa',
        prioridad:      1,
      })
      .select()
      .single()

    if (error) {
      console.error('[useMonotributo] Error creando meta:', error)
      return null
    }

    configurarPerfil({ metaReservaId: data.id })
    setDatosMeta(data)
    return data
  }, [usuario?.id, perfilFiscal.nombreMetaReserva, configurarPerfil])

  // ─────────────────────────────────────────────────────────────
  return {
    // ── Estado
    perfilFiscal,
    ingresosMensuales,
    reservaActual,
    datosMeta,

    // ── Cálculos derivados (se recalculan solos)
    alerta,
    categoriaDetectada,

    // ── Loading
    cargando: cargandoIngresos || cargandoMeta || cargandoPerfil,
    errorIngresos,

    // ── Acciones
    procesarIngreso,
    aplicarReservaFiscal,
    configurarPerfil,
    crearMetaReserva,
    recargar: cargarIngresosMensuales,
  }
}