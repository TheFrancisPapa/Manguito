import { useState } from 'react'
import { useAuthContext } from '../../context/AuthContext.jsx'
import { useMovimientos } from '../../hooks/useMovimientos.js'
import { PageWrapper, PageHeader, Sidebar, BottomNav, MovCard } from '../../components/layout/index.js'
import { Card, Button, EmptyState, EMPTY_STATES, Modal } from '../../components/ui/index.js'
import { FormMovimiento } from '../../components/forms/FormMovimiento.jsx'

export function MovimientosPage() {
  const { usuario } = useAuthContext()
  const [filtroActivo, setFiltroActivo] = useState('todos') // 'todos', 'ingreso', 'gasto'
  const [modalMovs, setModalMovs] = useState(false)
  
  // Usamos tu hook para traer los movimientos. Por ahora no le pasamos fechas 
  // para que traiga todos (podríamos limitarlo más adelante si hay miles)
  const { movimientos, cargando, agregar: agregarMovimiento } = useMovimientos()

  // Filtramos la lista según el botón que esté activo
  const movimientosFiltrados = movimientos.filter(m => {
    if (filtroActivo === 'todos') return true
    return m.tipo === filtroActivo
  })

  // Agrupamos los movimientos por Mes y Año (Ej: "Marzo 2026") para que la lista sea más leíble
  const movimientosAgrupados = movimientosFiltrados.reduce((grupos, mov) => {
    // Extraemos el mes y año de la fecha (asumiendo formato YYYY-MM-DD)
    const [anio, mes] = mov.fecha.split('-')
    const fechaObj = new Date(anio, mes - 1)
    const claveMes = fechaObj.toLocaleDateString('es-AR', { month: 'long', year: 'numeric' })
    
    // Capitalizamos la primera letra (ej: "marzo 2026" -> "Marzo 2026")
    const claveMesCap = claveMes.charAt(0).toUpperCase() + claveMes.slice(1)

    if (!grupos[claveMesCap]) {
      grupos[claveMesCap] = []
    }
    grupos[claveMesCap].push(mov)
    return grupos
  }, {})

  const handleGuardarMovimiento = async (datos) => {
    try {
      await agregarMovimiento({
        ...datos,
        usuario_id: usuario.id
      })
      setModalMovs(false)
      window.location.reload() // Refrescamos rápido por ahora
    } catch (error) {
      console.error("Error al guardar:", error)
      throw error 
    }
  }

  return (
    <>
      <Sidebar usuario={usuario} />
      <BottomNav />
      <PageWrapper>
        <PageHeader
          titulo="Movimientos"
          subtitulo="Historial completo"
          accion={<Button icono="+" onClick={() => setModalMovs(true)}>Nuevo</Button>}
        />

        {/* Filtros tipo Toggle */}
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
          <Card className="mt-4">
             <EmptyState 
               {...EMPTY_STATES.movimientos} 
               accion={filtroActivo === 'todos' ? <Button icono="+" onClick={() => setModalMovs(true)}>Registrar movimiento</Button> : null} 
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
                    // Acá a futuro podemos abrir un modal para editar/borrar
                    onClick={() => console.log('Tocado:', m)} 
                  />
                ))}
              </Card>
            ))}
          </div>
        )}
      </PageWrapper>

      {/* Reutilizamos el modal que armamos antes */}
      <Modal abierto={modalMovs} onCerrar={() => setModalMovs(false)} titulo="Nuevo movimiento">
        <FormMovimiento 
          onSubmit={handleGuardarMovimiento} 
          onCancel={() => setModalMovs(false)} 
        />
      </Modal>
    </>
  )
}