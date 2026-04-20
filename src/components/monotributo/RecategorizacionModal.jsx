// src/components/monotributo/RecategorizacionModal.jsx
// Asistente de Recategorización Proactivo del documento estratégico
// Aparece cuando el usuario está cerca del límite de su categoría

import { useMemo } from 'react'
import { createPortal } from 'react-dom'
import { CATEGORIAS_MONOTRIBUTO } from '../../lib/monotributo'

function fmtMonto(n) {
  return Number(n).toLocaleString('es-AR', {
    style: 'currency', currency: 'ARS', maximumFractionDigits: 0,
  })
}

/**
 * RecategorizacionModal
 *
 * Props:
 *   alerta     — objeto retornado por calcularAlertaMonotributo()
 *   abierto    — boolean
 *   onCerrar   — () => void
 */
export function RecategorizacionModal({ alerta, abierto, onCerrar }) {
  const categorias = CATEGORIAS_MONOTRIBUTO[alerta?.tipoActividad || 'servicios'] || []

  const plan = useMemo(() => {
    if (!alerta) return null
    const { categoria, tipoActividad, proyeccionAnual, ingresoAcumulado, mesesRestantes } = alerta

    const idxActual = categorias.findIndex(c => c.categoria === categoria)
    const catActual = categorias[idxActual]
    const catSiguiente = categorias[idxActual + 1] || null
    const catAnterior  = categorias[idxActual - 1] || null

    // ¿Conviene recategorizar hacia arriba?
    const necesitaSubir = proyeccionAnual > catActual?.limiteAnual
    // ¿Podría bajar? (si el acumulado proyectado cabe en la categoría anterior)
    const puedeBajar = catAnterior && proyeccionAnual < catAnterior.limiteAnual * 0.85

    // Cuántos meses hasta el cierre del semestre (recategorización ARCA)
    const mesActual = new Date().getMonth() + 1
    const mesProxRecateg = mesActual <= 6 ? 6 : 12
    const mesesHastaRecateg = mesProxRecateg - mesActual

    // Cuánto puede facturar por mes para NO pasar de categoría
    const margenMensual = catActual
      ? Math.max(0, (catActual.limiteAnual - ingresoAcumulado) / Math.max(mesesRestantes, 1))
      : 0

    return {
      necesitaSubir,
      puedeBajar,
      catActual,
      catSiguiente,
      catAnterior,
      mesesHastaRecateg,
      margenMensual,
      diferenciaCuota: catSiguiente
        ? catSiguiente.cuotaMensual - catActual?.cuotaMensual
        : null,
    }
  }, [alerta, categorias])

  if (!abierto || !alerta || !plan) return null

  const nivelColor = {
    seguro:    { bg: 'bg-emerald-500', text: 'text-emerald-600 dark:text-emerald-400', light: 'bg-emerald-50 dark:bg-emerald-900/15' },
    atencion:  { bg: 'bg-amber-500',   text: 'text-amber-700 dark:text-amber-400',     light: 'bg-amber-50 dark:bg-amber-900/15'   },
    peligro:   { bg: 'bg-orange-500',  text: 'text-orange-700 dark:text-orange-400',   light: 'bg-orange-50 dark:bg-orange-900/15' },
    critico:   { bg: 'bg-red-500',     text: 'text-red-700 dark:text-red-400',         light: 'bg-red-50 dark:bg-red-900/15'       },
    excedido:  { bg: 'bg-red-700',     text: 'text-red-700 dark:text-red-400',         light: 'bg-red-50 dark:bg-red-900/20'       },
  }[alerta.nivel] || nivelColor.seguro

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4" onClick={onCerrar}>
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />

      <div
        className="relative w-full max-w-lg bg-white dark:bg-zinc-900 rounded-3xl shadow-2xl
          border border-zinc-100 dark:border-zinc-800
          max-h-[88vh] overflow-y-auto
          animate-in slide-in-from-bottom-6 fade-in duration-350"
        onClick={e => e.stopPropagation()}
      >
        {/* Header con semáforo */}
        <div className={`${nivelColor.light} px-5 pt-5 pb-4 rounded-t-3xl`}>
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl ${nivelColor.light} border border-current/20`}>
                {alerta.emoji}
              </div>
              <div>
                <p className="text-[10px] font-extrabold uppercase tracking-widest text-zinc-400">
                  Asistente Monotributo
                </p>
                <h2 className={`text-lg font-black font-display ${nivelColor.text} leading-tight`}>
                  {alerta.nivel === 'excedido' ? '¡Superaste el límite!' :
                   alerta.nivel === 'critico'  ? 'Zona crítica de facturación' :
                   alerta.nivel === 'peligro'  ? 'Cuidado con el tope' :
                   alerta.nivel === 'atencion' ? 'Presupuestá con cuidado' :
                   'Estás en orden'}
                </h2>
              </div>
            </div>
            <button onClick={onCerrar}
              className="w-8 h-8 flex items-center justify-center rounded-full bg-white/60 dark:bg-zinc-800 text-zinc-500 text-xs active:scale-90 transition-all">
              ✕
            </button>
          </div>

          {/* Barra de progreso */}
          <div className="mt-4">
            <div className="flex justify-between text-[10px] text-zinc-500 mb-1.5 font-medium">
              <span>Facturación YTD: {fmtMonto(alerta.ingresoAcumulado)}</span>
              <span className="font-bold">Tope: {fmtMonto(alerta.limiteAnual)}</span>
            </div>
            <div className="h-3 bg-white/60 dark:bg-zinc-800 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-700 ${nivelColor.bg}`}
                style={{ width: `${Math.min(alerta.porcentajeUsado, 100)}%` }}
              />
            </div>
            <div className="flex justify-between text-[10px] mt-1 font-bold">
              <span className={nivelColor.text}>{alerta.porcentajeUsado.toFixed(1)}% utilizado</span>
              {alerta.margenRestante > 0 && (
                <span className="text-zinc-400">Queda: {fmtMonto(alerta.margenRestante)}</span>
              )}
            </div>
          </div>
        </div>

        {/* Cuerpo del modal */}
        <div className="px-5 py-4 flex flex-col gap-4">

          {/* Proyección anual */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-zinc-50 dark:bg-zinc-800/40 rounded-2xl p-3">
              <p className="text-[9px] font-extrabold uppercase tracking-wider text-zinc-400 mb-1">
                Proyección anual
              </p>
              <p className={`text-base font-black ${
                alerta.proyeccionAnual > alerta.limiteAnual
                  ? 'text-red-600 dark:text-red-400'
                  : 'text-zinc-800 dark:text-white'
              }`}>
                {fmtMonto(alerta.proyeccionAnual)}
              </p>
              <p className="text-[9px] text-zinc-400 mt-0.5">
                basado en promedio de {alerta.mesesRegistrados} meses
              </p>
            </div>
            <div className="bg-zinc-50 dark:bg-zinc-800/40 rounded-2xl p-3">
              <p className="text-[9px] font-extrabold uppercase tracking-wider text-zinc-400 mb-1">
                Margen mensual
              </p>
              <p className="text-base font-black text-emerald-600 dark:text-emerald-400">
                {fmtMonto(plan.margenMensual)}/mes
              </p>
              <p className="text-[9px] text-zinc-400 mt-0.5">
                para no superar el tope
              </p>
            </div>
          </div>

          {/* Recategorización sugerida */}
          {plan.necesitaSubir && plan.catSiguiente && (
            <div className="bg-amber-50 dark:bg-amber-900/15 border border-amber-200 dark:border-amber-800/40 rounded-2xl p-4">
              <p className="text-xs font-extrabold text-amber-700 dark:text-amber-400 uppercase tracking-wider mb-2">
                📋 Recategorizarte conviene
              </p>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-bold text-zinc-800 dark:text-white">
                    Categoría {alerta.categoria} → {plan.catSiguiente.categoria}
                  </p>
                  <p className="text-[11px] text-zinc-500 mt-0.5">
                    Nuevo tope: {fmtMonto(plan.catSiguiente.limiteAnual)}/año
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] text-zinc-400">Cuota nueva</p>
                  <p className="text-sm font-black text-zinc-800 dark:text-white">
                    {fmtMonto(plan.catSiguiente.cuotaMensual)}/mes
                  </p>
                  {plan.diferenciaCuota && (
                    <p className="text-[10px] text-red-500">
                      +{fmtMonto(plan.diferenciaCuota)}/mes
                    </p>
                  )}
                </div>
              </div>
              {plan.mesesHastaRecateg > 0 && (
                <div className="mt-3 pt-2.5 border-t border-amber-200/60 dark:border-amber-800/30">
                  <p className="text-[10px] text-amber-700 dark:text-amber-400 font-medium">
                    ⏰ Próxima recategorización ARCA en <strong>{plan.mesesHastaRecateg} meses</strong>.
                    Hacelo antes para evitar exclusión de oficio.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Opción de bajar categoría */}
          {plan.puedeBajar && plan.catAnterior && (
            <div className="bg-emerald-50 dark:bg-emerald-900/15 border border-emerald-200 dark:border-emerald-800/40 rounded-2xl p-4">
              <p className="text-xs font-extrabold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider mb-2">
                💡 Podés ahorrar recategorizando a la baja
              </p>
              <p className="text-sm text-zinc-700 dark:text-zinc-300">
                Tu proyección ({fmtMonto(alerta.proyeccionAnual)}) entra en Categoría <strong>{plan.catAnterior.categoria}</strong>.
                Ahorrarías <strong>{fmtMonto(plan.catActual.cuotaMensual - plan.catAnterior.cuotaMensual)}/mes</strong> en cuota.
              </p>
            </div>
          )}

          {/* Consejo del mes */}
          <div className="bg-zinc-50 dark:bg-zinc-800/30 rounded-2xl p-4 border border-zinc-100 dark:border-zinc-800">
            <p className="text-[10px] font-extrabold uppercase tracking-wider text-[var(--mango-dark)] dark:text-[var(--mango)] mb-2">
              🎯 Acción recomendada
            </p>
            <p className="text-xs text-zinc-700 dark:text-zinc-300 leading-relaxed">
              {alerta.mensaje}
            </p>
          </div>

          {/* Link a ARCA */}
          <a
            href="https://www.afip.gob.ar/monotributo/categorias.asp"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 py-3 rounded-2xl
              bg-zinc-100 dark:bg-zinc-800 text-xs font-bold text-zinc-600 dark:text-zinc-300
              hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
          >
            🏛️ Ver categorías vigentes en ARCA
          </a>
        </div>
      </div>
    </div>,
    document.body
  )
}