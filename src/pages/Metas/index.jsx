import { useState } from 'react'
import { useAuthContext } from '../../context/AuthContext'
import { useMetas } from '../../hooks/useMetas'
import { PageWrapper, PageHeader } from '../../components/layout'
import { Card, Button, EmptyState, Modal, Input, ModalUpgrade, EmojiSuggester } from '../../components/ui'
import { BarraMeta } from '../../components/charts'

// ─── Página principal ────────────────────────────────────────
export function MetasPage() {
  const { usuario } = useAuthContext()
  const { metas, cargando, agregar, aportar, borrar: eliminar } = useMetas()
  const [modalAbierto, setModalAbierto] = useState(false)
  const [modalAporteAbierto, setModalAporteAbierto] = useState(false)
  const [metaSeleccionada, setMetaSeleccionada] = useState(null)
  const [modalUpgrade, setModalUpgrade] = useState(false)
  const plan = usuario?.plan || 'basico'

  const handleAbrirModalNuevo = () => {
    const metasActivas = metas.filter(m => m.estado === 'activa').length
    if (plan === 'basico' && metasActivas >= 1) {
      setModalUpgrade(true)
      return
    }
    setModalAbierto(true)
  }

  // Estado para nueva meta — simplified
  const [formData, setFormData] = useState({
    nombre: '',
    monto_objetivo: '',
    icono: '',
    color: '#F59E0B',
    fecha_limite: ''
  })

  // Estado para aporte
  const [montoAporte, setMontoAporte] = useState('')

  // ✅ Create goal
  const handleCrearMeta = async (e) => {
    e.preventDefault()
    await agregar({ ...formData, icono: formData.icono || '🎯', monto_actual: 0, estado: 'activa' })
    setModalAbierto(false)
    setFormData({ nombre: '', monto_objetivo: '', icono: '', color: '#F59E0B', fecha_limite: '' })
  }

  const handleAbrirAporte = (meta) => {
    setMetaSeleccionada(meta)
    setMontoAporte('')
    setModalAporteAbierto(true)
  }

  // ✅ Add contribution
  const handleAportar = async (e) => {
    e.preventDefault()
    await aportar(metaSeleccionada.id, Number(montoAporte))
    setModalAporteAbierto(false)
  }

  // Summary stats
  const activas = metas.filter(m => m.estado === 'activa')
  const completadas = metas.filter(m => m.estado === 'completada')
  const cercanas = activas.filter(m => (m.monto_actual / m.monto_objetivo) >= 0.8)

  return (
    <div className="animate-in fade-in duration-500">
      <PageWrapper>
        <PageHeader
          titulo="Mis Metas"
          subtitulo={
            cargando ? 'Cargando...'
              : cercanas.length > 0
                ? `${cercanas.length} meta${cercanas.length > 1 ? 's' : ''} casi completada${cercanas.length > 1 ? 's' : ''} 🔥`
                : 'Ahorrar con propósito'
          }
          accion={<Button icono="+" onClick={handleAbrirModalNuevo} className="shadow-sm shadow-amber-500/20">Nueva Meta</Button>}
        />

        {/* Summary pills */}
        {!cargando && metas.length > 0 && (
          <div className="flex gap-3 mb-5 overflow-x-auto pb-1">
            <div className="flex-shrink-0 px-3 py-2 rounded-[14px]
              bg-[var(--mango)]/10 border border-[var(--mango)]/20">
              <p className="text-[9px] font-extrabold text-[var(--mango-dark)] dark:text-[var(--mango)] uppercase">Activas</p>
              <p className="text-lg font-black text-[var(--mango-dark)] dark:text-[var(--mango)]">{activas.length}</p>
            </div>
            {cercanas.length > 0 && (
              <div className="flex-shrink-0 px-3 py-2 rounded-[14px]
                bg-emerald-50/80 dark:bg-emerald-900/10
                border border-emerald-100/60 dark:border-emerald-800/20">
                <p className="text-[9px] font-extrabold text-emerald-600 dark:text-emerald-400 uppercase">¡Casi!</p>
                <p className="text-lg font-black text-emerald-700 dark:text-emerald-400">{cercanas.length}</p>
              </div>
            )}
            {completadas.length > 0 && (
              <div className="flex-shrink-0 px-3 py-2 rounded-[14px]
                bg-emerald-50/80 dark:bg-emerald-900/10
                border border-emerald-100/60 dark:border-emerald-800/20">
                <p className="text-[9px] font-extrabold text-emerald-600 dark:text-emerald-400 uppercase">Cumplidas</p>
                <p className="text-lg font-black text-emerald-700 dark:text-emerald-400">{completadas.length}</p>
              </div>
            )}
          </div>
        )}

        {cargando ? (
          <div className="grid md:grid-cols-2 gap-4 mt-2">
            {[1, 2, 3, 4].map(i => <Card key={i} className="h-40 animate-pulse bg-zinc-100 dark:bg-zinc-800" />)}
          </div>
        ) : metas.length === 0 ? (
          <Card className="mt-2 py-12">
            <EmptyState
              titulo="No tenés metas activas"
              descripcion="Ponerle nombre a tu ahorro hace que sea más fácil alcanzarlo."
              accion={<Button icono="+" onClick={handleAbrirModalNuevo}>Crear primera meta</Button>}
            />
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 gap-4 mt-2">
            {metas.map(meta => (
              <div key={meta.id} className="relative group">
                <BarraMeta
                  meta={meta}
                  moneda={usuario?.moneda}
                  onAportar={() => handleAbrirAporte(meta)}
                />
                {/* Delete button */}
                {meta.estado === 'activa' && (
                  <button
                    onClick={() => {
                      if(window.confirm('¿Seguro que querés eliminar esta meta?')) {
                        eliminar(meta.id)
                      }
                    }}
                    className="absolute top-4 right-4 p-2 text-zinc-400 hover:text-red-500
                      opacity-0 group-hover:opacity-100 transition-opacity
                      bg-white dark:bg-[var(--dark-card)] rounded-full shadow-sm"
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

      {/* Modal Nueva Meta — Simplified */}
      <Modal abierto={modalAbierto} onCerrar={() => setModalAbierto(false)} titulo="Crear nueva meta">
        <form onSubmit={handleCrearMeta} className="flex flex-col gap-4">
          {/* Name */}
          <Input
            label="¿Para qué ahorramos?"
            placeholder="Ej: Viaje, Auto, Fondo de emergencia..."
            required
            autoFocus
            value={formData.nombre}
            onChange={e => setFormData({...formData, nombre: e.target.value})}
          />

          {/* Amount */}
          <Input
            label="Monto a alcanzar"
            type="number"
            prefijo="$"
            required
            min="1"
            step="0.01"
            value={formData.monto_objetivo}
            onChange={e => setFormData({...formData, monto_objetivo: e.target.value})}
          />

          {/* Smart Emoji Suggester */}
          {formData.nombre.trim().length >= 2 && (
            <EmojiSuggester
              texto={formData.nombre}
              valor={formData.icono}
              onChange={emoji => setFormData({...formData, icono: emoji})}
              label="Elegí un ícono para tu meta"
            />
          )}

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Fecha límite (Opcional)"
              type="date"
              value={formData.fecha_limite}
              onChange={e => setFormData({...formData, fecha_limite: e.target.value})}
            />

            {/* Color selector */}
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
           <div className="text-center py-4 bg-zinc-50 dark:bg-zinc-800/50 rounded-[18px] border border-zinc-100 dark:border-zinc-800">
             <span className="text-3xl block mb-2">{metaSeleccionada?.icono}</span>
             <p className="text-sm text-zinc-500 dark:text-zinc-400">
               Te faltan <b className="text-zinc-800 dark:text-white">${Number(metaSeleccionada?.monto_objetivo - metaSeleccionada?.monto_actual).toLocaleString('es-AR')}</b> para llegar.
             </p>
             {metaSeleccionada && (metaSeleccionada.monto_actual / metaSeleccionada.monto_objetivo) >= 0.8 && (
               <p className="text-xs text-emerald-600 dark:text-emerald-400 font-bold mt-1">
                 ¡Estás muy cerca! 🔥
               </p>
             )}
           </div>

           <Input label="Monto del aporte" type="number" prefijo="$" required min="0.01" step="0.01" autoFocus inputMode="decimal"
            value={montoAporte} onChange={e => setMontoAporte(e.target.value)} />

           <div className="flex gap-3 mt-2">
            <Button type="button" variante="secondary" className="flex-1" onClick={() => setModalAporteAbierto(false)}>Cancelar</Button>
            <Button type="submit" className="flex-1">Sumar Aporte</Button>
          </div>
        </form>
      </Modal>
      <ModalUpgrade
        abierto={modalUpgrade}
        onCerrar={() => setModalUpgrade(false)}
        feature="Tener múltiples metas activas al mismo tiempo"
      />
    </div>
  )
}