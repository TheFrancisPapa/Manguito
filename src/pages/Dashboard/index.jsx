// src/pages/Dashboard/index.jsx — MEJORADO
// Mejoras del documento estratégico:
// 1. Widget "Brecha Cambiaria" (MEP vs Tarjeta)
// 2. Toggle "Modo Inflación" — valores nominales vs reales
// 3. Integración de BentoBrecha en el Bento Grid

import { useState, useCallback } from 'react'
import { PageWrapper } from '../../components/layout'
import { MobileDrawer } from '../../components/layout/MobileDrawer'
import { Modal } from '../../components/ui/Modal'
import { FormMovimiento } from '../../components/forms/FormMovimiento'
import { useAuthContext } from '../../context/AuthContext'
import { useMovimientos, useBalance, useEvolucionMensual } from '../../hooks/useMovimientos'
import { usePresupuestos } from '../../hooks/usePresupuestos'
import { useRangoMes } from './helpers'

import { BentoBalance }     from '../../components/bento/BentoBalance'
import { BentoChart }        from '../../components/bento/BentoChart'
import { BentoDolar }        from './components/BentoDolar'
import { BentoBrecha }       from '../../components/bento/BentoBrecha'
import { BentoPresupuestos } from '../../components/bento/BentoPresupuestos'
import { BentoGastos }       from './components/BentoGastos'
import { BentoMetas }        from './components/BentoMetas'
import { BentoAcciones }     from './components/BentoAcciones'
import { BentoMovimientos }  from './components/BentoMovimientos'

// ── Toggle de Modo Inflación ──────────────────────────────────
function ModoInflacionToggle({ activo, onToggle }) {
  return (
    <button
      onClick={onToggle}
      className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-[10px] font-bold
        border transition-all ${
        activo
          ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800/40 text-red-600 dark:text-red-400'
          : 'bg-zinc-100 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 text-zinc-500 dark:text-zinc-400 hover:border-zinc-300'
      }`}
      title={activo ? 'Mostrando valores ajustados por inflación — click para volver a valores nominales' : 'Activar Modo Inflación (valores reales)'}
    >
      <span>{activo ? '📉' : '📈'}</span>
      {activo ? 'Modo Real' : 'Modo Nominal'}
    </button>
  )
}

export function DashboardPage() {
  const { usuario } = useAuthContext()
  const [drawerAbierto, setDrawerAbierto] = useState(false)
  const [modalAbierto, setModalAbierto]   = useState(false)
  const [tipoDefault, setTipoDefault]     = useState('gasto')
  const [modoInflacion, setModoInflacion] = useState(false)

  const { desde, hasta } = useRangoMes(0)
  const { agregar } = useMovimientos({ desde, hasta })
  const { balance, cargando: cBal } = useBalance(desde, hasta)
  const { datos: evolucion, cargando: cEvo } = useEvolucionMensual(6)
  const { presupuestos } = usePresupuestos()

  // Índice de inflación mensual estimado (5% = 0.05) para deflactar
  // En producción esto vendría de una API de INDEC o similar
  const INFLACION_MENSUAL = 0.05

  // Ajusta valores si el modo inflación está activo
  const balanceAjustado = modoInflacion && balance ? {
    ...balance,
    total_ingresos: balance.total_ingresos / (1 + INFLACION_MENSUAL),
    total_gastos:   balance.total_gastos   / (1 + INFLACION_MENSUAL),
  } : balance

  const abrirModal = useCallback((tipo = 'gasto') => {
    setTipoDefault(tipo)
    setModalAbierto(true)
  }, [])

  const handleGuardar = useCallback(async (datos) => {
    await agregar({ ...datos, usuario_id: usuario?.id })
    setModalAbierto(false)
  }, [agregar, usuario?.id])

  return (
    <>
      {/* Toggle modo inflación — flotante en el header */}
      <div className="flex justify-end px-4 pt-2 pb-0 max-w-md mx-auto md:max-w-[600px]">
        <ModoInflacionToggle
          activo={modoInflacion}
          onToggle={() => setModoInflacion(v => !v)}
        />
      </div>

      {/* Banner cuando el modo inflación está activo */}
      {modoInflacion && (
        <div className="mx-4 mb-0 max-w-md mx-auto md:max-w-[600px]">
          <div className="flex items-center gap-2 px-3 py-2 rounded-xl
            bg-red-50 dark:bg-red-900/15 border border-red-200 dark:border-red-800/40
            text-[10px] text-red-600 dark:text-red-400 font-medium">
            <span>📉</span>
            <span>
              Modo inflación activo — valores deflactados asumiendo <strong>~5%/mes</strong> de inflación.
              Los números reflejan tu poder adquisitivo real, no el nominal.
            </span>
          </div>
        </div>
      )}

      <main
        role="main"
        aria-label="Panel principal de Manguito"
        className="bento-grid pb-4"
      >
        {/* ── Celda principal: balance (ajustado si modo inflación) ── */}
        <BentoBalance balance={balanceAjustado} cargando={cBal} />

        {/* ── Dólar blue ── */}
        <BentoDolar />

        {/* ── NUEVA: Brecha cambiaria MEP vs Tarjeta ── */}
        <BentoBrecha />

        {/* ── Presupuestos ── */}
        <BentoPresupuestos presupuestos={presupuestos} />

        {/* ── Gráfico evolución ── */}
        <BentoChart datos={evolucion} cargando={cEvo} />

        {/* ── Top gastos ── */}
        <BentoGastos />

        {/* ── Metas ── */}
        <BentoMetas />

        {/* ── Acciones (botones + AI) ── */}
        <BentoAcciones
          onNuevoGasto={() => abrirModal('gasto')}
          onNuevoIngreso={() => abrirModal('ingreso')}
        />

        {/* ── Últimos movimientos (full width) ── */}
        <BentoMovimientos />
      </main>

      {/* ── MobileDrawer ── */}
      <MobileDrawer abierto={drawerAbierto} onCerrar={() => setDrawerAbierto(false)} />

      {/* ── Modal nuevo movimiento ── */}
      <Modal
        abierto={modalAbierto}
        onCerrar={() => setModalAbierto(false)}
        titulo={tipoDefault === 'ingreso' ? '💰 Registrar ingreso' : '💸 Registrar gasto'}
        ancho="max-w-md"
      >
        <FormMovimiento
          valoresIniciales={{ tipo: tipoDefault }}
          onSubmit={handleGuardar}
          onCancel={() => setModalAbierto(false)}
        />
      </Modal>
    </>
  )
}

export default function DashboardPageWrapped() {
  return (
    <div className="animate-in fade-in duration-500 min-h-screen mesh-bg">
      <PageWrapper className="!bg-transparent px-2 md:px-0 pt-2 md:pt-0">
        <DashboardPage />
      </PageWrapper>
    </div>
  )
}