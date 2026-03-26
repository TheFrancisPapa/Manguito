import { useState } from 'react'
import { useAuthContext } from '../../context/AuthContext'
import { useMetas } from '../../hooks/useMetas'
import { PageWrapper, PageHeader, Sidebar, BottomNav } from '../../components/layout'
import { Card, Button, EmptyState, Modal, Input } from '../../components/ui'
import { BarraMeta } from '../../components/charts'



// ─── Página principal ────────────────────────────────────────
export function MetasPage() {
  const { usuario } = useAuthContext()
  const { metas, cargando, agregar, aportar, borrar: eliminar } = useMetas()
  const [modalAbierto, setModalAbierto] = useState(false)
  const [modalAporteAbierto, setModalAporteAbierto] = useState(false)
  const [metaSeleccionada, setMetaSeleccionada] = useState(null)
  const plan = usuario?.plan || 'basico'

  const handleAbrirModalNuevo = () => {
    const metasActivas = metas.filter(m => m.estado === 'activa').length
    if (plan === 'basico' && metasActivas >= 1) {
      alert('Con el Plan Básico solo podés tener 1 meta activa a la vez. ¡Pasate a Pro para ir por más!')
      return
    }
    setModalAbierto(true)
  }
  
  // Estado para nueva meta
  const [formData, setFormData] = useState({
    nombre: '',
    monto_objetivo: '',
    icono: '🎯',
    color: '#F59E0B', // Ámbar por defecto
    fecha_limite: ''
  })

  // Estado para aporte
  const [montoAporte, setMontoAporte] = useState('')

  // ✅ handleCrearMeta
  const handleCrearMeta = async (e) => {
    e.preventDefault()
    await agregar({ ...formData, monto_actual: 0, estado: 'activa' })
    setModalAbierto(false)
    setFormData({ nombre: '', monto_objetivo: '', icono: '🎯', color: '#F59E0B', fecha_limite: '' })
  }

  const handleAbrirAporte = (meta) => {
    setMetaSeleccionada(meta)
    setMontoAporte('')
    setModalAporteAbierto(true)
  }

  // ✅ handleAportar
  const handleAportar = async (e) => {
    e.preventDefault()
    await aportar(metaSeleccionada.id, Number(montoAporte))
    setModalAporteAbierto(false)
  }

  return (
    <div className="animate-in fade-in duration-500">
      <Sidebar usuario={usuario} />
      <BottomNav />
      <PageWrapper>
        <PageHeader
          titulo="Mis Metas"
          subtitulo="Ahorrar con propósito"
          accion={<Button icono="+" onClick={handleAbrirModalNuevo} className="shadow-sm shadow-amber-500/20">Nueva Meta</Button>}
        />

        {cargando ? (
          <div className="grid md:grid-cols-2 gap-4 mt-6">
            {[1, 2, 3, 4].map(i => <Card key={i} className="h-40 animate-pulse bg-zinc-100 dark:bg-zinc-800" />)}
          </div>
        ) : metas.length === 0 ? (
          <Card className="mt-6 py-12">
            <EmptyState 
              titulo="No tenés metas activas" 
              descripcion="Ponerle nombre a tu ahorro hace que sea más fácil alcanzarlo."
              accion={<Button icono="+" onClick={handleAbrirModalNuevo}>Crear primera meta</Button>} 
            />
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 gap-6 mt-6">
            {metas.map(meta => (
              <div key={meta.id} className="relative group">
                <BarraMeta 
                  meta={meta} 
                  moneda={usuario?.moneda} 
                  onAportar={() => handleAbrirAporte(meta)}
                />
                {/* Botón sutil para eliminar, aparece en hover */}
                {meta.estado === 'activa' && (
                  <button 
                    onClick={() => {
                      if(window.confirm('¿Seguro que querés eliminar esta meta?')) {
                        eliminar(meta.id)
                      }
                    }}
                    className="absolute top-4 right-4 p-2 text-zinc-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity bg-white dark:bg-zinc-900 rounded-full shadow-sm"
                    title="Eliminar meta"
                  >
                    🗑️
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </PageWrapper>

      {/* Modal Nueva Meta */}
      <Modal abierto={modalAbierto} onCerrar={() => setModalAbierto(false)} titulo="Crear nueva meta">
        <form onSubmit={handleCrearMeta} className="flex flex-col gap-4">
          <div className="flex gap-3">
            <div className="w-20">
              <Input label="Emoji" value={formData.icono} onChange={e => setFormData({...formData, icono: e.target.value})} maxLength={2} className="text-center text-xl" />
            </div>
            <div className="flex-1">
              <Input label="¿Para qué ahorramos?" placeholder="Ej: Viaje, Auto, Fondo..." required autoFocus
                value={formData.nombre} onChange={e => setFormData({...formData, nombre: e.target.value})} />
            </div>
          </div>
          
          <Input label="Monto a alcanzar" type="number" prefijo="$" required min="1" step="0.01"
            value={formData.monto_objetivo} onChange={e => setFormData({...formData, monto_objetivo: e.target.value})} />
          
          <div className="grid grid-cols-2 gap-3">
             <Input label="Fecha límite (Opcional)" type="date"
              value={formData.fecha_limite} onChange={e => setFormData({...formData, fecha_limite: e.target.value})} />
             
             {/* Selector de color simple */}
             <div className="flex flex-col gap-1">
                <label className="text-xs font-medium text-zinc-500 dark:text-zinc-400">Color</label>
                <div className="flex gap-2 h-11 items-center bg-zinc-50 dark:bg-zinc-800/50 rounded-xl px-2 border border-zinc-100 dark:border-zinc-800">
                  {['#F59E0B', '#10B981', '#3B82F6', '#8B5CF6', '#EC4899'].map(c => (
                    <button key={c} type="button" onClick={() => setFormData({...formData, color: c})}
                      className={`w-6 h-6 rounded-full transition-transform ${formData.color === c ? 'scale-125 ring-2 ring-offset-2 ring-offset-white dark:ring-offset-zinc-900 ring-zinc-400' : 'hover:scale-110'}`}
                      style={{backgroundColor: c}}
                    />
                  ))}
                </div>
             </div>
          </div>

          <div className="flex gap-3 mt-4">
            <Button type="button" variante="secondary" className="flex-1" onClick={() => setModalAbierto(false)}>Cancelar</Button>
            <Button type="submit" className="flex-1 shadow-md shadow-amber-500/20">Guardar Meta</Button>
          </div>
        </form>
      </Modal>

      {/* Modal Aportar */}
      <Modal abierto={modalAporteAbierto} onCerrar={() => setModalAporteAbierto(false)} titulo={`Aportar a ${metaSeleccionada?.nombre}`}>
        <form onSubmit={handleAportar} className="flex flex-col gap-4">
           <div className="text-center py-4 bg-zinc-50 dark:bg-zinc-800/50 rounded-xl border border-zinc-100 dark:border-zinc-800">
             <span className="text-3xl block mb-2">{metaSeleccionada?.icono}</span>
             <p className="text-sm text-zinc-500">Te faltan <b>${Number(metaSeleccionada?.monto_objetivo - metaSeleccionada?.monto_actual).toLocaleString('es-AR')}</b> para llegar.</p>
           </div>
           
           <Input label="Monto del aporte" type="number" prefijo="$" required min="0.01" step="0.01" autoFocus inputMode="decimal"
            value={montoAporte} onChange={e => setMontoAporte(e.target.value)} />
            
           <div className="flex gap-3 mt-2">
            <Button type="button" variante="secondary" className="flex-1" onClick={() => setModalAporteAbierto(false)}>Cancelar</Button>
            <Button type="submit" className="flex-1">Sumar Aporte</Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}