// src/pages/Dashboard/index.jsx — Sistema Bento Grid
import { useState, useCallback } from 'react'
import { PageWrapper } from '../../components/layout'
import { MobileDrawer } from '../../components/layout/MobileDrawer'
import { Modal } from '../../components/ui/Modal'
import { FormMovimiento } from '../../components/forms/FormMovimiento'
import { useAuthContext } from '../../context/AuthContext'
import { useMovimientos, useBalance, useEvolucionMensual } from '../../hooks/useMovimientos'
import { usePresupuestos } from '../../hooks/usePresupuestos'
import { useRangoMes } from './helpers'

import { BentoBalance } from '../../components/bento/BentoBalance'
import { BentoChart } from '../../components/bento/BentoChart'
import { BentoDolar } from './components/BentoDolar'
import { BentoPresupuestos } from '../../components/bento/BentoPresupuestos'
import { BentoGastos } from './components/BentoGastos'
import { BentoMetas } from './components/BentoMetas'
import { BentoAcciones } from './components/BentoAcciones'
import { BentoMovimientos } from './components/BentoMovimientos'

export function DashboardPage() {
  const { usuario } = useAuthContext()
  const [drawerAbierto, setDrawerAbierto] = useState(false)
  const [modalAbierto, setModalAbierto]   = useState(false)
  const [tipoDefault, setTipoDefault]     = useState('gasto')

  const { desde, hasta } = useRangoMes(0)
  const { agregar } = useMovimientos({ desde, hasta })
  const { balance, cargando: cBal } = useBalance(desde, hasta)
  const { datos: evolucion, cargando: cEvo } = useEvolucionMensual(6)
  const { presupuestos } = usePresupuestos()

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
        {/* ── Celda principal: balance ── */}
        <BentoBalance balance={balance} cargando={cBal} />

        {/* ── Dólar blue ── */}
        <BentoDolar />

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