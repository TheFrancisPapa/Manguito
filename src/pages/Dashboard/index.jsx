import { useState } from 'react'
import { useAuthContext } from '../../context/AuthContext'
import { useBalance, useGastosXCategoria,
         useUltimosMovimientos, useMovimientos } from '../../hooks/useMovimientos'
import { usePresupuestos } from '../../hooks/usePresupuestos'
import { useMetas } from '../../hooks/useMetas'
import { PageWrapper, PageHeader, Sidebar,
         BottomNav, MovCard, PresupCard }    from '../../components/layout'
import { Card, CardHeader, Button,
         EmptyState, EMPTY_STATES, Modal }   from '../../components/ui'
import { ResumenBalance, GraficoTorta,
         BarraMeta }                         from '../../components/charts'
import { FormMovimiento } from '../../components/forms/FormMovimiento'

function rangoMes() {
  const hoy = new Date()
  const desde = new Date(hoy.getFullYear(), hoy.getMonth(), 1).toLocaleDateString('sv-SE')
  const hasta = hoy.toLocaleDateString('sv-SE')
  return { desde, hasta }
}

export function DashboardPage() {
  const { usuario } = useAuthContext()
  const { desde, hasta } = rangoMes()

  const { balance,   cargando: cBal }            = useBalance(desde, hasta)
  const { datos: gastosXCat, cargando: cTorta }  = useGastosXCategoria(desde, hasta)
  const { movimientos, cargando: cMovs,
          recargar: recargarMovs }               = useUltimosMovimientos(5)
  const { presupuestos, resumen, cargando: cPresup,
          recargar: recargarPresup }             = usePresupuestos()
  const { metas, cargando: cMetas }              = useMetas('activa')

  // Solo para agregar — no duplicar datos cargados
  const { agregar } = useMovimientos()
  const [modalMovs, setModalMovs] = useState(false)

  const mesActual = new Date().toLocaleDateString('es-AR', { month: 'long', year: 'numeric' })
  const mesCapitalizado = mesActual.charAt(0).toUpperCase() + mesActual.slice(1)

  async function handleGuardarMovimiento(datos) {
    await agregar(datos)
    setModalMovs(false)
    // Refrescar sin recargar la página
    recargarMovs()
    recargarPresup()
  }

  return (
    <div>
      <Sidebar usuario={usuario} />
      <BottomNav />
      <PageWrapper>
        <PageHeader
          titulo={`Hola, ${usuario?.nombre?.split(' ')[0] || 'che'} 👋`}
          subtitulo={mesCapitalizado}
          accion={
            <Button icono="+" onClick={() => setModalMovs(true)}
              className="shadow-sm shadow-amber-500/20">
              Nuevo
            </Button>
          }
        />

        <div className="mb-6">
          <ResumenBalance balance={balance} moneda={usuario?.moneda} cargando={cBal} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Card className="flex flex-col h-full">
            <CardHeader titulo="Gastos por categoría" />
            <div className="flex-1 flex items-center justify-center min-h-[250px]">
              <GraficoTorta datos={gastosXCat} moneda={usuario?.moneda} cargando={cTorta} />
            </div>
          </Card>

          <Card className="flex flex-col h-full">
            <CardHeader
              titulo="Tus límites"
              subtitulo={
                resumen.excedidos > 0 ? `${resumen.excedidos} excedido/s 🚨`
                : resumen.alertas  > 0 ? `${resumen.alertas} en alerta ⚠️`
                : 'Todo bajo control'
              }
              accion={
                <a href="/presupuestos"
                  className="text-xs font-medium text-amber-600 hover:text-amber-700 transition-colors">
                  Ver todos
                </a>
              }
            />
            <div className="flex flex-col gap-1 flex-1 justify-center">
              {cPresup ? (
                [0,1,2].map(i => (
                  <div key={i} className="h-16 bg-zinc-100 dark:bg-zinc-800 rounded-xl animate-pulse mb-2" />
                ))
              ) : presupuestos.length === 0 ? (
                <EmptyState {...EMPTY_STATES.presupuestos}
                  accion={
                    <Button variante="secondary" onClick={() => window.location.href='/presupuestos'}>
                      Crear límite
                    </Button>
                  }
                />
              ) : (
                presupuestos.slice(0, 3).map(p => (
                  <PresupCard key={p.id} presupuesto={p}
                    onClick={() => window.location.href='/presupuestos'} />
                ))
              )}
            </div>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mt-4">
          <Card className="lg:col-span-2">
            <CardHeader titulo="Últimos movimientos"
              accion={
                <a href="/movimientos"
                  className="text-xs font-medium text-amber-600 hover:text-amber-700 transition-colors">
                  Historial
                </a>
              }
            />
            <div className="mt-2">
              {cMovs ? (
                [0,1,2,3].map(i => (
                  <div key={i} className="h-14 bg-zinc-100 dark:bg-zinc-800 rounded-xl animate-pulse mb-2" />
                ))
              ) : movimientos.length === 0 ? (
                <EmptyState {...EMPTY_STATES.movimientos}
                  accion={<Button icono="+" onClick={() => setModalMovs(true)}>Registrar ahora</Button>}
                />
              ) : (
                movimientos.map(m => <MovCard key={m.id} movimiento={m} />)
              )}
            </div>
          </Card>

          <div className="flex flex-col gap-4">
            {!cMetas && metas.length > 0 ? (
              <>
                <div className="flex items-center justify-between px-1">
                  <h2 className="text-xs font-bold text-zinc-500 uppercase tracking-wider">
                    Tus objetivos
                  </h2>
                  <a href="/metas"
                    className="text-xs font-medium text-amber-600 hover:text-amber-700 transition-colors">
                    Ver más
                  </a>
                </div>
                {metas.slice(0, 2).map(m => (
                  <BarraMeta key={m.id} meta={m} moneda={usuario?.moneda} />
                ))}
              </>
            ) : !cMetas && (
              <Card className="bg-amber-50 dark:bg-amber-900/10 border-amber-100 dark:border-amber-900/30 text-center py-8">
                <span className="text-4xl mb-3 block">🎯</span>
                <h3 className="font-semibold text-zinc-900 dark:text-white mb-1">Ponete una meta</h3>
                <p className="text-xs text-zinc-500 mb-4 px-4">
                  Ahorrar es más fácil cuando sabés para qué.
                </p>
                <Button variante="secondary" onClick={() => window.location.href='/metas'}
                  className="bg-white dark:bg-zinc-900">
                  Crear mi primera meta
                </Button>
              </Card>
            )}
          </div>
        </div>
      </PageWrapper>

      <Modal abierto={modalMovs} onCerrar={() => setModalMovs(false)} titulo="Nuevo movimiento">
        <FormMovimiento
          onSubmit={handleGuardarMovimiento}
          onCancel={() => setModalMovs(false)}
        />
      </Modal>
    </div>
  )
}