import { useState } from 'react'
import { useAuthContext }                          from '../../context/AuthContext'
import { useBalance, useGastosXCategoria,
         useUltimosMovimientos, useMovimientos }   from '../../hooks/useMovimientos'
import { usePresupuestos }                         from '../../hooks/usePresupuestos'
import { useMetas }                                from '../../hooks/useMetas'
import { PageWrapper, PageHeader, Sidebar,
         BottomNav, MovCard, PresupCard }          from '../../components/layout'
import { Card, CardHeader, Button,
         EmptyState, EMPTY_STATES, Modal }         from '../../components/ui'
import { ResumenBalance, GraficoTorta, BarraMeta } from '../../components/charts'
import { FormMovimiento }                          from '../../components/FormMovimiento'

// Pequeño helper para sacar el rango del mes actual considerando zona horaria local
function rangoMes() {
  const hoy = new Date()
  const primerDia = new Date(hoy.getFullYear(), hoy.getMonth(), 1)
  
  // Usamos sv-SE porque devuelve formato YYYY-MM-DD local
  const desde = primerDia.toLocaleDateString('sv-SE')
  const hasta = hoy.toLocaleDateString('sv-SE')
  
  return { desde, hasta }
}

export function DashboardPage() {
  const { usuario }                              = useAuthContext()
  const { desde, hasta }                         = rangoMes()
  
  // Hooks de datos
  const { balance, cargando: cBal }              = useBalance(desde, hasta)
  const { datos: gastosXCat, cargando: cTorta }  = useGastosXCategoria(desde, hasta)
  const { movimientos, cargando: cMovs }         = useUltimosMovimientos(5)
  const { presupuestos, resumen, cargando: cPresup } = usePresupuestos()
  const { metas, cargando: cMetas }              = useMetas('activa')
  
  // Hook para agregar movimientos nuevos
  const { agregar: agregarMovimiento }           = useMovimientos()

  // Estado UI
  const [modalMovs, setModalMovs]                = useState(false)

  const mesActual = new Date().toLocaleDateString('es-AR', { month: 'long', year: 'numeric' })

  // Función para manejar el guardado del formulario
  const handleGuardarMovimiento = async (datos) => {
    try {
      await agregarMovimiento({
        ...datos,
        usuario_id: usuario.id
      })
      // Si todo sale bien, cerramos el modal
      setModalMovs(false)
      // Acá podrías forzar una recarga de los datos del dashboard si quisieras
      // llamando a las funciones recargar() de tus hooks.
      // (Por ahora, como tenés useEffects, se van a actualizar si cambia algún filtro, 
      // pero quizás tengas que implementar un mecanismo para recargar todo post-guardado)
      window.location.reload() // Manera rápida de refrescar por ahora
    } catch (error) {
      console.error("Error al guardar:", error)
      throw error // Lo relanzamos para que el FormMovimiento lo ataje y muestre el error
    }
  }

  return (
    <>
      <Sidebar usuario={usuario} />
      <BottomNav />
      <PageWrapper>
        <PageHeader
          titulo={`Hola, ${usuario?.nombre?.split(' ')[0]} 👋`}
          subtitulo={mesActual}
          accion={<Button icono="+" onClick={() => setModalMovs(true)}>Nuevo</Button>}
        />

        <ResumenBalance balance={balance} moneda={usuario?.moneda} cargando={cBal} />

        <div className="grid md:grid-cols-2 gap-4 mt-4">
          <Card>
            <CardHeader titulo="Gastos por categoría" />
            <GraficoTorta datos={gastosXCat} moneda={usuario?.moneda} cargando={cTorta} />
          </Card>
          <Card>
            <CardHeader
              titulo="Presupuestos"
              subtitulo={resumen.excedidos > 0 ? `${resumen.excedidos} excedido/s 🚨` : resumen.alertas > 0 ? `${resumen.alertas} en alerta ⚠️` : undefined}
              accion={<a href="/presupuestos" className="text-xs text-zinc-400 hover:text-zinc-600">Ver todos</a>}
            />
            {cPresup
              ? [0,1,2].map(i => <div key={i} className="h-10 bg-zinc-100 dark:bg-zinc-800 rounded-xl animate-pulse mb-2" />)
              : presupuestos.length === 0
              ? <EmptyState {...EMPTY_STATES.presupuestos} accion={<Button variante="secondary" onClick={() => window.location.href='/presupuestos'}>Crear presupuesto</Button>} />
              : presupuestos.slice(0, 4).map(p => <PresupCard key={p.id} presupuesto={p} onClick={() => window.location.href='/presupuestos'} />)
            }
          </Card>
        </div>

        <Card className="mt-4">
          <CardHeader titulo="Últimos movimientos" accion={<a href="/movimientos" className="text-xs text-zinc-400 hover:text-zinc-600">Ver todos</a>} />
          {cMovs
            ? [0,1,2].map(i => <div key={i} className="h-12 bg-zinc-100 dark:bg-zinc-800 rounded-xl animate-pulse mb-2" />)
            : movimientos.length === 0
            ? <EmptyState {...EMPTY_STATES.movimientos} accion={<Button icono="+" onClick={() => setModalMovs(true)}>Registrar movimiento</Button>} />
            : movimientos.map(m => <MovCard key={m.id} movimiento={m} />)
          }
        </Card>

        {!cMetas && metas.length > 0 && (
          <div className="mt-4">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-xs font-medium text-zinc-500 uppercase tracking-wider">Metas de ahorro</h2>
              <a href="/metas" className="text-xs text-zinc-400 hover:text-zinc-600">Ver todas</a>
            </div>
            <div className="grid md:grid-cols-2 gap-3">
              {metas.slice(0, 2).map(m => <BarraMeta key={m.id} meta={m} moneda={usuario?.moneda} />)}
            </div>
          </div>
        )}
      </PageWrapper>

      <Modal abierto={modalMovs} onCerrar={() => setModalMovs(false)} titulo="Nuevo movimiento">
        <FormMovimiento 
          onSubmit={handleGuardarMovimiento} 
          onCancel={() => setModalMovs(false)} 
        />
      </Modal>
    </>
  )
}