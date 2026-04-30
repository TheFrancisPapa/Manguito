// src/pages/Dashboard/index.jsx — Sistema Bento Grid
import { useState, useCallback } from 'react'
import { PageWrapper } from '../../components/layout'
import { MobileDrawer } from '../../components/layout/MobileDrawer'
import { Modal } from '../../components/ui/Modal'
import { FormMovimiento } from '../../components/forms/FormMovimiento'
import { useAuthContext } from '../../context/AuthContext'
import {
  useMovimientos,
  useBalance,
  useEvolucionMensual,
  useGastosXCategoria,
} from '../../hooks/useMovimientos'
import { usePresupuestos } from '../../hooks/usePresupuestos'
import { useMetas }        from '../../hooks/useMetas'
import { useRangoMes }     from './helpers'

import { BentoBalance }    from '../../components/bento/BentoBalance'
import { BentoChart }      from '../../components/bento/BentoChart'
import { BentoDolar }      from './components/BentoDolar'
import { BentoPresupuestos } from '../../components/bento/BentoPresupuestos'
import { BentoGastos }     from './components/BentoGastos'
import { BentoMetas }      from './components/BentoMetas'
import { BentoAcciones }   from './components/BentoAcciones'
import { BentoMovimientos } from './components/BentoMovimientos'
import { TipContextual }   from '../../components/ui/TipContextual'

export function DashboardPage() {
  const { usuario } = useAuthContext()
  const [drawerAbierto, setDrawerAbierto] = useState(false)
  const [modalAbierto, setModalAbierto]   = useState(false)
  const [tipoDefault, setTipoDefault]     = useState('gasto')

  // ── Rangos de fechas ──────────────────────────────────────────
  const { desde, hasta }               = useRangoMes(0)   // mes actual
  const { desde: desdePrev, hasta: hastaPrev } = useRangoMes(-1)  // mes anterior

  // ── Datos ─────────────────────────────────────────────────────
  const { agregar }                      = useMovimientos({ desde, hasta })
  const { balance,  cargando: cBal }     = useBalance(desde, hasta)
  const { balance: balancePrevio }       = useBalance(desdePrev, hastaPrev)
  const { datos: evolucion, cargando: cEvo } = useEvolucionMensual(6)
  const { presupuestos }                 = usePresupuestos()
  const { datos: gastosRaw, cargando: cGastos } = useGastosXCategoria(desde, hasta)
  const { metas, cargando: cMetas }      = useMetas()

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
      <main
        role="main"
        aria-label="Panel principal de Manguito"
        className="bento-grid pb-4"
      >
        <TipContextual seccion="movimientos" className="col-span-12" />

        {/* ── Balance con variación real ── */}
        <BentoBalance
          balance={balance}
          balancePrevio={balancePrevio}
          cargando={cBal}
          className="animate-fade-up"
        />

        {/* ── Dólar blue ── */}
        <BentoDolar className="animate-fade-up animation-delay-100 col-span-12 md:col-span-5" />

        {/* ── Presupuestos ── */}
        <BentoPresupuestos 
          presupuestos={presupuestos} 
          className="animate-fade-up animation-delay-200 col-span-12 md:col-span-12" 
        />

        {/* ── Gráfico evolución ── */}
        <BentoChart 
          datos={evolucion} 
          cargando={cEvo} 
          className="animate-fade-up animation-delay-300" 
        />

        {/* ── Top gastos reales ── */}
        <BentoGastos 
          gastos={gastosRaw} 
          cargando={cGastos} 
          className="animate-fade-up animation-delay-400" 
        />

        {/* ── Metas reales ── */}
        <BentoMetas 
          metas={metas} 
          cargando={cMetas} 
          className="animate-fade-up animation-delay-500" 
        />

        {/* ── Acciones (botones + AI) ── */}
        <BentoAcciones
          onNuevoGasto={() => abrirModal('gasto')}
          onNuevoIngreso={() => abrirModal('ingreso')}
          className="animate-fade-up animation-delay-600 lg:col-span-4"
        />

        {/* ── Últimos movimientos ── */}
        <BentoMovimientos className="animate-fade-up animation-delay-700" />
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

// ─── Wrapper ──────────────────────────────────────────────────
export default function DashboardPageWrapped() {
  return (
    <div className="animate-in fade-in duration-500 min-h-screen mesh-bg">
      <PageWrapper className="!bg-transparent px-2 md:px-0 pt-2 md:pt-0">
        <DashboardPage />
      </PageWrapper>
    </div>
  )
}