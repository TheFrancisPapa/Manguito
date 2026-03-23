import { useState } from 'react'
import { useAuthContext } from '../../context/AuthContext'
import { useMovimientos } from '../../hooks/useMovimientos'
import { PageWrapper, PageHeader, Sidebar, BottomNav, MovCard } from '../../components/layout'
import { Card, Button, EmptyState, EMPTY_STATES, Modal } from '../../components/ui'
import { FormMovimiento } from '../../components/forms/FormMovimiento'
import { formatMoneda } from '../../lib/utils'

export function MovimientosPage() {
  const { usuario } = useAuthContext()
  const [filtroActivo, setFiltroActivo] = useState('todos')
  
  // Modales
  const [modalNuevo, setModalNuevo] = useState(false)
  const [movSeleccionado, setMovSeleccionado] = useState(null)
  
  const { movimientos, cargando, agregar, eliminar } = useMovimientos()

  const movimientosFiltrados = movimientos.filter(m => {
    if (filtroActivo === 'todos') return true
    return m.tipo === filtroActivo
  })

  // Agrupamos por mes y año para la vista
  const movimientosAgrupados = movimientosFiltrados.reduce((grupos, mov) => {
    const [anio, mes] = mov.fecha.split('-')
    const fechaObj = new Date(anio, mes - 1)
    const claveMes = fechaObj.toLocaleDateString('es-AR', { month: 'long', year: 'numeric' })
    const claveMesCap = claveMes.charAt(0).toUpperCase() + claveMes.slice(1)
    if (!grupos[claveMesCap]) grupos[claveMesCap] = []
    grupos[claveMesCap].push(mov)
    return grupos
  }, {})

  const handleGuardar = async (datos) => {
    try {
      await agregar({ ...datos, usuario_id: usuario.id })
      setModalNuevo(false)
      window.location.reload()
    } catch (error) {
      console.error(error)
    }
  }

  const handleEliminar = async () => {
    if (window.confirm('¿Seguro que querés eliminar este registro? Esto afectará tus balances.')) {
      try {
        if (eliminar) {
           await eliminar(movSeleccionado.id)
        }
        setMovSeleccionado(null)
        window.location.reload()
      } catch (error) {
        console.error("Error al eliminar", error)
        alert("Hubo un error al eliminar. Asegurate de que la función 'eliminar' esté lista en tu API y en el hook useMovimientos.")
      }
    }
  }

  return (
    <div className="animate-in fade-in duration-500">
      <Sidebar usuario={usuario} />
      <BottomNav />
      <PageWrapper>
        <PageHeader
          titulo="Movimientos"
          subtitulo="Historial completo"
          accion={<Button icono="+" onClick={() => setModalNuevo(true)} className="shadow-sm shadow-amber-500/20">Nuevo</Button>}
        />

        {/* Filtros */}
        <div className="flex bg-zinc-100 dark:bg-zinc-800 rounded-xl p-1 mt-4 mb-6">
          {['todos', 'ingreso', 'gasto'].map(f => (
            <button
              key={f}
              onClick={() => setFiltroActivo(f)}
              className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors capitalize ${
                filtroActivo === f 
                  ? 'bg-white dark:bg-zinc-900 shadow-sm text-zinc-900 dark:text-white' 
                  : 'text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        {/* Lista de Movimientos */}
        {cargando ? (
          <Card className="mt-4">
             {[0,1,2,3,4].map(i => <div key={i} className="h-12 bg-zinc-100 dark:bg-zinc-800 rounded-xl animate-pulse mb-2" />)}
          </Card>
        ) : movimientosFiltrados.length === 0 ? (
          <Card className="mt-4 py-8">
             <EmptyState 
               {...EMPTY_STATES.movimientos} 
               accion={filtroActivo === 'todos' ? <Button icono="+" onClick={() => setModalNuevo(true)}>Registrar movimiento</Button> : null} 
               titulo={filtroActivo !== 'todos' ? `No hay ${filtroActivo}s registrados` : EMPTY_STATES.movimientos.titulo}
             />
          </Card>
        ) : (
          <div className="flex flex-col gap-6">
            {Object.entries(movimientosAgrupados).map(([mes, movs]) => (
              <Card key={mes}>
                <h3 className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-3">
                  {mes}
                </h3>
                {movs.map(m => (
                  <MovCard 
                    key={m.id} 
                    movimiento={m} 
                    onClick={() => setMovSeleccionado(m)} 
                  />
                ))}
              </Card>
            ))}
          </div>
        )}
      </PageWrapper>

      {/* Modal de Nuevo Movimiento */}
      <Modal abierto={modalNuevo} onCerrar={() => setModalNuevo(false)} titulo="Nuevo movimiento">
        <FormMovimiento onSubmit={handleGuardar} onCancel={() => setModalNuevo(false)} />
      </Modal>

      {/* Modal de Detalle del Movimiento (El que faltaba) */}
      <Modal abierto={!!movSeleccionado} onCerrar={() => setMovSeleccionado(null)} titulo="Detalle del registro">
        {movSeleccionado && (
          <div className="flex flex-col gap-6">
            <div className="text-center bg-zinc-50 dark:bg-zinc-800/50 p-6 rounded-2xl border border-zinc-100 dark:border-zinc-800">
               <div className="w-14 h-14 mx-auto rounded-2xl flex items-center justify-center mb-3" style={{ background: (movSeleccionado.categorias?.color ?? '#6B7280') + '22' }}>
                 <span className="text-3xl">{movSeleccionado.categorias?.icono ?? '📦'}</span>
               </div>
               <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">{movSeleccionado.categorias?.nombre}</p>
               <h2 className={`text-4xl font-bold mt-1 ${movSeleccionado.tipo === 'ingreso' ? 'text-emerald-600' : 'text-zinc-900 dark:text-white'}`}>
                 {movSeleccionado.tipo === 'ingreso' ? '+' : '-'}{formatMoneda(movSeleccionado.monto, usuario?.moneda, true)}
               </h2>
               <p className="text-sm text-zinc-500 mt-2">
                 {new Date(movSeleccionado.fecha + 'T00:00:00').toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'long' })}
               </p>
            </div>

            {movSeleccionado.descripcion && (
              <div>
                <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-1">Descripción / Nota</p>
                <p className="text-sm text-zinc-900 dark:text-zinc-300">{movSeleccionado.descripcion}</p>
              </div>
            )}

            <div className="flex gap-3 mt-2 border-t border-zinc-100 dark:border-zinc-800 pt-4">
              <Button variante="secondary" className="flex-1" onClick={() => setMovSeleccionado(null)}>Cerrar</Button>
              <Button variante="danger" className="flex-1" onClick={handleEliminar}>Eliminar</Button>
            </div>
          </div>
        )}
      </Modal>

    </div>
  )
}