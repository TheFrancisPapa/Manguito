import { useState, useMemo, useCallback } from 'react'
import { useAuthContext } from '../../context/AuthContext'
import { useMovimientos } from '../../hooks/useMovimientos'
import { PageWrapper, PageHeader, MovCard } from '../../components/layout'
import { Card, Button, EmptyState, EMPTY_STATES, Modal } from '../../components/ui'
import { FormMovimiento } from '../../components/forms/FormMovimiento'
import { formatMoneda } from '../../lib/utils'
import { descargarCSV } from '../../lib/exportUtils'

export function MovimientosPage() {
  const { usuario } = useAuthContext()
  const [filtroActivo, setFiltroActivo] = useState('todos')

  const [modalNuevo, setModalNuevo]         = useState(false)
  const [modalEditar, setModalEditar]       = useState(false)
  const [movSeleccionado, setMovSeleccionado] = useState(null)

  // FIX: el hook exporta `borrar`, no `eliminar`
  const { movimientos, cargando, agregar, editar, borrar } = useMovimientos()

  const movimientosFiltrados = movimientos.filter(m => {
    if (filtroActivo === 'todos') return true
    return m.tipo === filtroActivo
  })

  const movimientosAgrupados = useMemo(() => {
    return movimientosFiltrados.reduce((grupos, mov) => {
      const [anio, mes] = mov.fecha.split('-')
      const fechaObj    = new Date(anio, mes - 1)
      const claveMes    = fechaObj.toLocaleDateString('es-AR', { month: 'long', year: 'numeric' })
      const claveMesCap = claveMes.charAt(0).toUpperCase() + claveMes.slice(1)
      if (!grupos[claveMesCap]) grupos[claveMesCap] = []
      grupos[claveMesCap].push(mov)
      return grupos
    }, {})
  }, [movimientosFiltrados])

  const resetModals = useCallback(() => {
    setModalNuevo(false)
    setModalEditar(false)
    setMovSeleccionado(null)
  }, [])

  const handleEliminar = async () => {
    if (!movSeleccionado) return
    if (window.confirm(`¿Eliminás "${movSeleccionado.descripcion || movSeleccionado.categorias?.nombre}"? Esta acción no se puede deshacer.`)) {
      await borrar(movSeleccionado.id)
      resetModals()
    }
  }

  const handleGuardar = async (datos) => {
    await agregar({ ...datos, usuario_id: usuario.id })
    setModalNuevo(false)
  }

  const handleEditarSubmit = async (datos) => {
    await editar(movSeleccionado.id, datos)
    resetModals()
  }

  return (
    <div className="animate-in fade-in duration-500">
      <PageWrapper>
        <PageHeader
          titulo="Movimientos"
          subtitulo="Historial completo"
          accion={
            <div className="flex items-center gap-2">
              <Button 
                variante="secondary" 
                onClick={() => descargarCSV(movimientosFiltrados)}
                className="!px-3 !py-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm hover:bg-zinc-50 dark:hover:bg-zinc-800"
                title="Descargar historial filtrado en Excel/CSV"
              >
                📥
              </Button>
              <Button icono="+" onClick={() => setModalNuevo(true)} className="shadow-sm shadow-amber-500/20">Nuevo</Button>
            </div>
          }
        />

        {/* Filtros */}
        <div className="flex bg-zinc-100 dark:bg-zinc-800 rounded-xl p-1 mt-4 mb-6">
          {['todos', 'ingreso', 'gasto'].map(f => (
            <button
              key={f}
              onClick={() => setFiltroActivo(f)}
              className={`flex-1 py-1.5 px-4 rounded-lg text-xs font-medium transition-colors capitalize ${
                filtroActivo === f
                  ? 'bg-white dark:bg-zinc-900 shadow-sm text-zinc-900 dark:text-white'
                  : 'text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        {/* Lista */}
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
                  <MovCard key={m.id} movimiento={m} onClick={() => setMovSeleccionado(m)} />
                ))}
              </Card>
            ))}
          </div>
        )}
      </PageWrapper>

      {/* 
          MODAL UNIFICADO (Portal Estable) 
          Mantenemos un único nodo de Modal para evitar Error 310.
      */}
      <Modal 
        abierto={modalNuevo || modalEditar || !!movSeleccionado} 
        onCerrar={resetModals} 
        titulo={modalNuevo ? "Nuevo movimiento" : modalEditar ? "Editar movimiento" : "Detalle del movimiento"}
      >
        {modalNuevo && (
          <FormMovimiento onSubmit={handleGuardar} onCancel={() => setModalNuevo(false)} />
        )}
        
        {modalEditar && movSeleccionado && (
          <FormMovimiento 
            valoresIniciales={movSeleccionado} 
            onSubmit={handleEditarSubmit} 
            onCancel={() => setModalEditar(false)} 
          />
        )}
        
        {(!modalNuevo && !modalEditar && movSeleccionado) && (
          <div className="flex flex-col gap-6 animate-in slide-in-from-bottom-4 fade-in duration-300">
            <div className="text-center p-6 bg-zinc-50 dark:bg-zinc-800/30 rounded-3xl border border-zinc-100 dark:border-zinc-800/50">
              <div className="w-16 h-16 mx-auto rounded-2xl flex items-center justify-center mb-4 shadow-sm"
                style={{ background: (movSeleccionado.categorias?.color ?? '#6B7280') + '22' }}>
                <span className="text-3xl">{movSeleccionado.categorias?.icono ?? '📦'}</span>
              </div>
              <p className="text-sm font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                {movSeleccionado.categorias?.nombre}
              </p>
              <h2 className={`text-3xl md:text-4xl font-black mt-2 tracking-tight break-all ${
                movSeleccionado.tipo === 'ingreso' ? 'text-emerald-600 dark:text-emerald-400' : 'text-zinc-900 dark:text-white'
              }`}>
                {movSeleccionado.tipo === 'ingreso' ? '+' : '-'}{formatMoneda(movSeleccionado.monto, usuario?.moneda, true)}
              </h2>
              <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-3 font-medium">
                {new Date(movSeleccionado.fecha + 'T00:00:00').toLocaleDateString('es-AR', {
                  weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
                })}
              </p>
            </div>

            {movSeleccionado.descripcion && (
              <div className="px-2">
                <p className="text-xs font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider mb-2">Nota</p>
                <p className="text-sm text-zinc-800 dark:text-zinc-200 bg-zinc-50 dark:bg-zinc-800/30 p-4 rounded-2xl leading-relaxed">
                  {movSeleccionado.descripcion}
                </p>
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-3 mt-6">
              <Button variante="secondary" className="flex-1 py-3 text-sm md:text-base font-medium order-3 sm:order-1" onClick={() => setMovSeleccionado(null)}>
                Cerrar
              </Button>
              <Button variante="primary" className="flex-1 py-3 text-sm md:text-base font-semibold order-1 sm:order-2" onClick={() => setModalEditar(true)}>
                Editar
              </Button>
              <Button variante="danger" className="flex-1 py-3 text-sm md:text-base font-semibold order-2 sm:order-3" onClick={handleEliminar}>
                Eliminar
              </Button>
            </div>
          </div>
        )}
      </Modal>

    </div>
  )
}