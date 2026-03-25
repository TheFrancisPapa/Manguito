import { useState } from 'react'
import { useAuthContext } from '../../context/AuthContext'
import { useBalance, useGastosXCategoria, useUltimosMovimientos, useMovimientos } from '../../hooks/useMovimientos'
import { usePresupuestos } from '../../hooks/usePresupuestos'
import { useMetas } from '../../hooks/useMetas'
import { PageWrapper, PageHeader, Sidebar, BottomNav, MovCard, PresupCard } from '../../components/layout'
import { Card, CardHeader, Button, EmptyState, EMPTY_STATES, Modal } from '../../components/ui'
import { ResumenBalance, GraficoTorta, BarraMeta } from '../../components/charts'
import { FormMovimiento } from '../../components/forms/FormMovimiento'

function rangoMes() {
  const hoy = new Date()
  const primerDia = new Date(hoy.getFullYear(), hoy.getMonth(), 1)
  return { 
    desde: primerDia.toLocaleDateString('sv-SE'), 
    hasta: hoy.toLocaleDateString('sv-SE') 
  }
}

function obtenerSaludoDinámico(nombre) {
  const hora = new Date().getHours()
  const primerNombre = nombre?.split(' ')[0] || 'che'
  
  if (hora >= 5 && hora < 12) return { saludo: `Buenos días, ${primerNombre}`, emoji: '🌅' }
  if (hora >= 12 && hora < 20) return { saludo: `Buenas tardes, ${primerNombre}`, emoji: '☀️' }
  return { saludo: `Buenas noches, ${primerNombre}`, emoji: '🌙' }
}

export function DashboardPage() {
  const { usuario } = useAuthContext()
  const { desde, hasta } = rangoMes()
  
  const { balance, cargando: cBal } = useBalance(desde, hasta)
  const { datos: gastosXCat, cargando: cTorta } = useGastosXCategoria(desde, hasta)
  const { movimientos, cargando: cMovs } = useUltimosMovimientos(5)
  const { presupuestos, resumen, cargando: cPresup } = usePresupuestos()
  const { metas, cargando: cMetas } = useMetas('activa')
  
  const { agregar: agregarMovimiento } = useMovimientos()
  const [modalMovs, setModalMovs] = useState(false)

  const mesActual = new Date().toLocaleDateString('es-AR', { month: 'long', year: 'numeric' })
  const mesCapitalizado = mesActual.charAt(0).toUpperCase() + mesActual.slice(1)
  
  const { saludo, emoji } = obtenerSaludoDinámico(usuario?.nombre)

  const handleGuardarMovimiento = async (datos) => {
    try {
      await agregarMovimiento({ ...datos, usuario_id: usuario.id })
      setModalMovs(false)
      window.location.reload() 
    } catch (error) {
      console.error(error)
    }
  }

  return (
    <div className="animate-in fade-in duration-500">
      <Sidebar usuario={usuario} />
      <BottomNav />
      <PageWrapper>
        
        <PageHeader
          titulo={`${saludo} ${emoji}`}
          subtitulo={`Resumen de ${mesCapitalizado}`}
          accion={<Button icono="+" onClick={() => setModalMovs(true)} className="shadow-sm shadow-amber-500/20">Nuevo</Button>}
        />

        <div className="mb-6 animate-in slide-in-from-bottom-4 fade-in duration-700" style={{ animationFillMode: 'both' }}>
          <ResumenBalance balance={balance} moneda={usuario?.moneda} cargando={cBal} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-4">
          <Card className="flex flex-col h-full animate-in slide-in-from-bottom-4 fade-in duration-700" style={{ animationDelay: '100ms', animationFillMode: 'both' }}>
            <CardHeader titulo="Gastos por categoría" />
            <div className="flex-1 flex items-center justify-center min-h-[250px]">
              <GraficoTorta datos={gastosXCat} moneda={usuario?.moneda} cargando={cTorta} />
            </div>
          </Card>
          
          <Card className="flex flex-col h-full animate-in slide-in-from-bottom-4 fade-in duration-700" style={{ animationDelay: '200ms', animationFillMode: 'both' }}>
            <CardHeader
              titulo="Tus Límites"
              subtitulo={resumen.excedidos > 0 ? `${resumen.excedidos} excedidos 🚨` : 'Todo bajo control'}
              accion={<a href="/presupuestos" className="text-xs font-medium text-amber-600 hover:text-amber-700">Ver todos</a>}
            />
            <div className="flex flex-col gap-1 flex-1 justify-center mt-2">
              {cPresup ? (
                [0,1,2].map(i => <div key={i} className="h-16 bg-zinc-100 dark:bg-zinc-800 rounded-xl animate-pulse mb-2" />)
              ) : presupuestos.length === 0 ? (
                <EmptyState {...EMPTY_STATES.presupuestos} accion={<Button variante="secondary" onClick={() => window.location.href='/presupuestos'}>Crear límite</Button>} />
              ) : (
                presupuestos.slice(0, 3).map(p => <PresupCard key={p.id} presupuesto={p} onClick={() => window.location.href='/presupuestos'} />)
              )}
            </div>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mt-4">
          <Card className="lg:col-span-2 animate-in slide-in-from-bottom-4 fade-in duration-700" style={{ animationDelay: '300ms', animationFillMode: 'both' }}>
            <CardHeader titulo="Últimos movimientos" accion={<a href="/movimientos" className="text-xs font-medium text-amber-600">Historial</a>} />
            <div className="mt-4">
              {cMovs ? (
                [0,1,2,3].map(i => <div key={i} className="h-14 bg-zinc-100 dark:bg-zinc-800 rounded-xl animate-pulse mb-2" />)
              ) : movimientos.length === 0 ? (
                <EmptyState {...EMPTY_STATES.movimientos} accion={<Button icono="+" onClick={() => setModalMovs(true)}>Registrar ahora</Button>} />
              ) : (
                movimientos.map(m => <MovCard key={m.id} movimiento={m} />)
              )}
            </div>
          </Card>

          <div className="flex flex-col gap-4 animate-in slide-in-from-bottom-4 fade-in duration-700" style={{ animationDelay: '400ms', animationFillMode: 'both' }}>
            {!cMetas && metas.length > 0 && (
              <>
                <div className="flex items-center justify-between px-1">
                  <h2 className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Tus Objetivos</h2>
                  <a href="/metas" className="text-xs font-medium text-amber-600">Ver más</a>
                </div>
                {metas.slice(0, 2).map(m => <BarraMeta key={m.id} meta={m} moneda={usuario?.moneda} />)}
              </>
            )}
            
            {!cMetas && metas.length === 0 && (
               <Card className="bg-amber-50 dark:bg-amber-900/10 border-amber-100 dark:border-amber-900/30 text-center py-8">
                 <span className="text-4xl mb-3 block animate-bounce">🎯</span>
                 <h3 className="font-semibold text-zinc-900 dark:text-white mb-1">Ponete una meta</h3>
                 <p className="text-xs text-zinc-500 mb-4 px-4">Ahorrar es más fácil cuando sabés para qué.</p>
                 <Button variante="secondary" onClick={() => window.location.href='/metas'} className="bg-white dark:bg-zinc-900 shadow-sm">Crear primera meta</Button>
               </Card>
            )}
          </div>
        </div>

      </PageWrapper>

      <Modal abierto={modalMovs} onCerrar={() => setModalMovs(false)} titulo="Nuevo movimiento">
        <FormMovimiento onSubmit={handleGuardarMovimiento} onCancel={() => setModalMovs(false)} />
      </Modal>
    </div>
  )
}