import { useState } from 'react'
import { useAuthContext } from '../../context/AuthContext'
import { useMetas } from '../../hooks/useMetas'
import { PageWrapper, PageHeader, Sidebar, BottomNav } from '../../components/layout'
import { Card, Button, EmptyState, Modal, Input } from '../../components/ui'
import { BarraMeta } from '../../components/charts'

const ICONOS_SUGERIDOS = ['🎯','✈️','🛡️','💻','🚗','🏠','📚','💍','🎸','🐶','🌍','💪']
const COLORES_SUGERIDOS = ['#10B981','#3B82F6','#8B5CF6','#F59E0B','#EF4444','#EC4899','#06B6D4','#F97316']

// ─── Formulario crear / editar meta ─────────────────────────
function FormMeta({ onSubmit, onCancel, inicial = null }) {
  const [form, setForm] = useState({
    nombre:         inicial?.nombre         ?? '',
    descripcion:    inicial?.descripcion    ?? '',
    monto_objetivo: inicial?.monto_objetivo ?? '',
    fecha_limite:   inicial?.fecha_limite   ?? '',
    icono:          inicial?.icono          ?? '🎯',
    color:          inicial?.color          ?? '#10B981',
    prioridad:      inicial?.prioridad      ?? 1,
  })
  const [cargando, setCargando] = useState(false)
  const [error, setError]       = useState(null)

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }))
  const setVal = (k, v) => setForm(f => ({ ...f, [k]: v }))

  async function handleSubmit(e) {
    e.preventDefault()
    if (!form.nombre.trim()) { setError('Poné un nombre para tu meta.'); return }
    if (!form.monto_objetivo || form.monto_objetivo <= 0) {
      setError('El monto objetivo debe ser mayor a 0.'); return
    }
    setCargando(true)
    try {
      await onSubmit({
        nombre:         form.nombre,
        descripcion:    form.descripcion || null,
        monto_objetivo: Number(form.monto_objetivo),
        fecha_limite:   form.fecha_limite || null,
        icono:          form.icono,
        color:          form.color,
        prioridad:      Number(form.prioridad),
      })
    } catch (err) { setError(err.message); setCargando(false) }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      {/* Ícono y nombre */}
      <div className="flex gap-3 items-end">
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-zinc-500 dark:text-zinc-400">Emoji</label>
          <input
            value={form.icono}
            onChange={set('icono')}
            maxLength={2}
            className="w-14 h-10 text-center text-xl border border-zinc-200 dark:border-zinc-700
              rounded-xl bg-white dark:bg-zinc-900 outline-none focus:border-amber-400"
          />
        </div>
        <Input label="Nombre de la meta" placeholder="Ej: Notebook nueva"
          value={form.nombre} onChange={set('nombre')} required className="flex-1" autoFocus />
      </div>

      {/* Sugerencias de ícono */}
      <div className="flex flex-wrap gap-1.5">
        {ICONOS_SUGERIDOS.map(em => (
          <button key={em} type="button"
            onClick={() => setVal('icono', em)}
            className={`w-8 h-8 text-lg rounded-lg transition-colors
              ${form.icono === em
                ? 'bg-amber-100 dark:bg-amber-900/30 ring-1 ring-amber-400'
                : 'hover:bg-zinc-100 dark:hover:bg-zinc-800'}`}>
            {em}
          </button>
        ))}
      </div>

      <Input label="Descripción (opcional)" placeholder="¿Para qué es esta meta?"
        value={form.descripcion} onChange={set('descripcion')} />

      <div className="grid grid-cols-2 gap-3">
        <Input label="Monto objetivo" type="number" inputMode="decimal" step="0.01" min="1"
          prefijo="$" placeholder="0.00" value={form.monto_objetivo}
          onChange={set('monto_objetivo')} required />
        <Input label="Fecha límite (opcional)" type="date"
          value={form.fecha_limite} onChange={set('fecha_limite')} />
      </div>

      {/* Color */}
      <div className="flex flex-col gap-2">
        <label className="text-xs font-medium text-zinc-500 dark:text-zinc-400">Color</label>
        <div className="flex gap-2 flex-wrap">
          {COLORES_SUGERIDOS.map(c => (
            <button key={c} type="button"
              onClick={() => setVal('color', c)}
              className={`w-7 h-7 rounded-full transition-all
                ${form.color === c ? 'scale-125 ring-2 ring-offset-1 ring-zinc-400' : 'hover:scale-110'}`}
              style={{ background: c }}
            />
          ))}
        </div>
      </div>

      {/* Prioridad */}
      <div className="flex flex-col gap-1">
        <label className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
          Prioridad — {['', 'Muy alta', 'Alta', 'Media', 'Baja', 'Muy baja'][form.prioridad]}
        </label>
        <input type="range" min="1" max="5" value={form.prioridad} onChange={set('prioridad')}
          className="accent-amber-400 w-full" />
        <div className="flex justify-between text-xs text-zinc-400">
          <span>Más importante</span><span>Menos importante</span>
        </div>
      </div>

      {error && (
        <p className="text-xs text-red-500 bg-red-50 dark:bg-red-900/20 rounded-xl px-3 py-2
          border border-red-100 dark:border-red-900">{error}</p>
      )}

      <div className="flex gap-3 mt-2">
        <Button type="button" variante="secondary" className="flex-1"
          onClick={onCancel} disabled={cargando}>Cancelar</Button>
        <Button type="submit" className="flex-1" cargando={cargando}>
          {inicial ? 'Guardar cambios' : 'Crear meta'}
        </Button>
      </div>
    </form>
  )
}

// ─── Modal aportar ───────────────────────────────────────────
function ModalAportar({ meta, onSubmit, onCerrar }) {
  const [monto, setMonto]     = useState('')
  const [cargando, setCargando] = useState(false)
  const [error, setError]     = useState(null)
  const falta = meta ? meta.monto_objetivo - meta.monto_actual : 0

  async function handleSubmit(e) {
    e.preventDefault()
    if (!monto || monto <= 0) { setError('El aporte debe ser mayor a 0.'); return }
    if (Number(monto) > falta) { setError(`El máximo que podés aportar es $${falta.toLocaleString('es-AR')}.`); return }
    setCargando(true)
    try { await onSubmit(Number(monto)) }
    catch (err) { setError(err.message); setCargando(false) }
  }

  return (
    <Modal abierto={!!meta} onCerrar={onCerrar} titulo={`Aportar a: ${meta?.nombre}`} ancho="max-w-sm">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <p className="text-sm text-zinc-500">
          Falta <span className="font-semibold text-zinc-800 dark:text-zinc-200">
            ${falta.toLocaleString('es-AR')}
          </span> para alcanzar la meta.
        </p>
        <Input label="Monto a aportar" type="number" inputMode="decimal" min="1"
          max={falta} prefijo="$" placeholder="0.00" value={monto}
          onChange={e => setMonto(e.target.value)} autoFocus required />
        {error && (
          <p className="text-xs text-red-500 bg-red-50 dark:bg-red-900/20 rounded-xl px-3 py-2
            border border-red-100 dark:border-red-900">{error}</p>
        )}
        <div className="flex gap-3">
          <Button type="button" variante="secondary" className="flex-1"
            onClick={onCerrar} disabled={cargando}>Cancelar</Button>
          <Button type="submit" className="flex-1" cargando={cargando}>Aportar</Button>
        </div>
      </form>
    </Modal>
  )
}

// ─── Modal confirmar cancelar ────────────────────────────────
function ModalConfirmar({ abierto, onCerrar, onConfirmar, titulo, mensaje, labelConfirmar = 'Confirmar', variante = 'danger' }) {
  const [cargando, setCargando] = useState(false)
  async function handleConfirmar() {
    setCargando(true)
    try { await onConfirmar() } finally { setCargando(false) }
  }
  return (
    <Modal abierto={abierto} onCerrar={onCerrar} titulo={titulo} ancho="max-w-sm">
      <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-6">{mensaje}</p>
      <div className="flex gap-3">
        <Button variante="secondary" className="flex-1" onClick={onCerrar} disabled={cargando}>
          Cancelar
        </Button>
        <Button variante={variante} className="flex-1" cargando={cargando} onClick={handleConfirmar}>
          {labelConfirmar}
        </Button>
      </div>
    </Modal>
  )
}

// ─── Página principal ────────────────────────────────────────
export function MetasPage() {
  const { usuario } = useAuthContext()
  const { metas, cargando, agregar, aportar, completar, eliminar } = useMetas()
  const [modalAbierto, setModalAbierto] = useState(false)
  const [modalAporteAbierto, setModalAporteAbierto] = useState(false)
  const [metaSeleccionada, setMetaSeleccionada] = useState(null)
  
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
          accion={<Button icono="+" onClick={() => setModalAbierto(true)} className="shadow-sm shadow-amber-500/20">Nueva Meta</Button>}
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
              accion={<Button icono="+" onClick={() => setModalAbierto(true)}>Crear primera meta</Button>} 
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
                        eliminar(meta.id).then(() => window.location.reload())
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