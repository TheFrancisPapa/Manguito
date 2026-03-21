// src/pages/Dashboard/index.jsx

import { useState } from 'react'
import { useAuthContext }         from '../../context/AuthContext'
import { useBalance,
         useGastosXCategoria,
         useUltimosMovimientos }  from '../../hooks/useMovimientos'
import { usePresupuestos }        from '../../hooks/usePresupuestos'
import { useMetas }               from '../../hooks/useMetas'

import { PageWrapper, PageHeader,
         Sidebar, BottomNav,
         MovCard, PresupCard }    from '../../components/layout'
import { Card, CardHeader,
         Button, EmptyState,
         EMPTY_STATES }           from '../../components/ui'
import { ResumenBalance,
         GraficoTorta,
         BarraMeta }              from '../../components/charts'

import { FormMovimiento }         from '../../components/forms'
import { Modal }                  from '../../components/ui'

// Rango del mes actual
function rangoMes() {
  const hoy   = new Date()
  const desde = new Date(hoy.getFullYear(), hoy.getMonth(), 1)
    .toISOString().split('T')[0]
  const hasta = hoy.toISOString().split('T')[0]
  return { desde, hasta }
}

export function DashboardPage() {
  const { usuario }                        = useAuthContext()
  const { desde, hasta }                   = rangoMes()
  const { balance, cargando: cBal }        = useBalance(desde, hasta)
  const { datos: gastosXCat, cargando: cTorta } = useGastosXCategoria(desde, hasta)
  const { movimientos, cargando: cMovs }   = useUltimosMovimientos(5)
  const { presupuestos, resumen,
          cargando: cPresup }              = usePresupuestos()
  const { metas, cargando: cMetas }        = useMetas('activa')

  const [modalMovs, setModalMovs]          = useState(false)

  const mesActual = new Date().toLocaleDateString('es-AR', {
    month: 'long', year: 'numeric',
  })

  return (
    <>
      <Sidebar usuario={usuario} />
      <BottomNav />

      <PageWrapper>
        <PageHeader
          titulo={`Hola, ${usuario?.nombre?.split(' ')[0]} 👋`}
          subtitulo={mesActual}
          accion={
            <Button icono="+" onClick={() => setModalMovs(true)}>
              Nuevo
            </Button>
          }
        />

        {/* ── Balance del mes ── */}
        <ResumenBalance
          balance={balance}
          moneda={usuario?.moneda}
          cargando={cBal}
        />

        {/* ── Fila: Torta + Alertas presupuestos ── */}
        <div className="grid md:grid-cols-2 gap-4 mt-4">
          <Card>
            <CardHeader titulo="Gastos por categoría" />
            <GraficoTorta
              datos={gastosXCat}
              moneda={usuario?.moneda}
              cargando={cTorta}
            />
          </Card>

          <Card>
            <CardHeader
              titulo="Presupuestos"
              subtitulo={
                resumen.excedidos > 0
                  ? `${resumen.excedidos} excedido${resumen.excedidos > 1 ? 's' : ''} 🚨`
                  : resumen.alertas > 0
                  ? `${resumen.alertas} en alerta ⚠️`
                  : undefined
              }
              accion={
                <a href="/presupuestos"
                   className="text-xs text-zinc-400 hover:text-zinc-600">
                  Ver todos
                </a>
              }
            />
            {cPresup ? (
              <div className="space-y-2">
                {[0,1,2].map(i => (
                  <div key={i}
                    className="h-10 bg-zinc-100 dark:bg-zinc-800 rounded-xl animate-pulse" />
                ))}
              </div>
            ) : presupuestos.length === 0 ? (
              <EmptyState
                {...EMPTY_STATES.presupuestos}
                accion={
                  <Button variante="secondary"
                    onClick={() => window.location.href = '/presupuestos'}>
                    Crear presupuesto
                  </Button>
                }
              />
            ) : (
              presupuestos.slice(0, 4).map(p => (
                <PresupCard
                  key={p.id}
                  presupuesto={p}
                  onClick={() => window.location.href = '/presupuestos'}
                />
              ))
            )}
          </Card>
        </div>

        {/* ── Últimos movimientos ── */}
        <Card className="mt-4">
          <CardHeader
            titulo="Últimos movimientos"
            accion={
              <a href="/movimientos"
                 className="text-xs text-zinc-400 hover:text-zinc-600">
                Ver todos
              </a>
            }
          />
          {cMovs ? (
            <div className="space-y-3">
              {[0,1,2].map(i => (
                <div key={i}
                  className="h-12 bg-zinc-100 dark:bg-zinc-800 rounded-xl animate-pulse" />
              ))}
            </div>
          ) : movimientos.length === 0 ? (
            <EmptyState
              {...EMPTY_STATES.movimientos}
              accion={
                <Button icono="+" onClick={() => setModalMovs(true)}>
                  Registrar movimiento
                </Button>
              }
            />
          ) : (
            movimientos.map(m => (
              <MovCard key={m.id} movimiento={m} />
            ))
          )}
        </Card>

        {/* ── Metas activas ── */}
        {!cMetas && metas.length > 0 && (
          <div className="mt-4">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-xs font-medium text-zinc-500 uppercase tracking-wider">
                Metas de ahorro
              </h2>
              <a href="/metas"
                 className="text-xs text-zinc-400 hover:text-zinc-600">
                Ver todas
              </a>
            </div>
            <div className="grid md:grid-cols-2 gap-3">
              {metas.slice(0, 2).map(m => (
                <BarraMeta
                  key={m.id}
                  meta={m}
                  moneda={usuario?.moneda}
                />
              ))}
            </div>
          </div>
        )}
      </PageWrapper>

      {/* Modal nuevo movimiento */}
      <Modal
        abierto={modalMovs}
        onCerrar={() => setModalMovs(false)}
        titulo="Nuevo movimiento"
      >
        <FormMovimiento onGuardar={() => setModalMovs(false)} />
      </Modal>
    </>
  )
}