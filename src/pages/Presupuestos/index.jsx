import { useState, useEffect } from 'react'
import { useAuthContext } from '../../context/AuthContext'
import { usePresupuestos } from '../../hooks/usePresupuestos'
import { useCategorias } from '../../hooks/useCategorias'
import { PageWrapper, PageHeader, Sidebar, BottomNav, PresupCard } from '../../components/layout'
import { Card, Button, EmptyState, Modal, Input, Select } from '../../components/ui'

// ─── Formulario para crear / editar ─────────────────────────
function FormPresupuesto({ categorias, onSubmit, onCancel, inicial = null }) {
  const hoy = new Date()
  const [form, setForm] = useState({
    categoria_id: inicial?.categoria_id ?? '',
    limite_monto: inicial?.limite_monto ?? '',
    alerta_pct:   inicial?.alerta_pct   ?? 80,
  })
  const [cargando, setCargando] = useState(false)
  const [error, setError]       = useState(null)

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }))

  async function handleSubmit(e) {
    e.preventDefault()
    if (!form.categoria_id) { setError('Elegí una categoría.'); return }
    if (!form.limite_monto || form.limite_monto <= 0) { setError('El límite debe ser mayor a 0.'); return }
    setCargando(true)
    try {
      await onSubmit({
        categoria_id: form.categoria_id,
        limite_monto: Number(form.limite_monto),
        alerta_pct:   Number(form.alerta_pct),
        periodo: 'mensual',
        mes:  hoy.getMonth() + 1,
        anio: hoy.getFullYear(),
      })
    } catch (err) { setError(err.message); setCargando(false) }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <Select label="Categoría" value={form.categoria_id} onChange={set('categoria_id')} required>
        <option value="" disabled>Seleccioná una categoría</option>
        {categorias.map(c => (
          <option key={c.id} value={c.id}>{c.icono} {c.nombre}</option>
        ))}
      </Select>

      <Input label="Límite mensual" type="number" inputMode="decimal" step="0.01" min="1"
        prefijo="$" placeholder="0.00" value={form.limite_monto} onChange={set('limite_monto')} required />

      <div className="flex flex-col gap-1">
        <label className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
          Alerta al {form.alerta_pct}% del límite
        </label>
        <input type="range" min="50" max="95" step="5" value={form.alerta_pct}
          onChange={set('alerta_pct')}
          className="accent-amber-400 w-full" />
        <div className="flex justify-between text-xs text-zinc-400">
          <span>50%</span><span>95%</span>
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
          {inicial ? 'Guardar cambios' : 'Crear límite'}
        </Button>
      </div>
    </form>
  )
}

// ─── Modal de confirmación de borrado ───────────────────────
function ModalConfirmar({ abierto, onCerrar, onConfirmar, mensaje }) {
  const [cargando, setCargando] = useState(false)
  async function handleConfirmar() {
    setCargando(true)
    try { await onConfirmar() } finally { setCargando(false) }
  }
  return (
    <Modal abierto={abierto} onCerrar={onCerrar} titulo="Confirmar" ancho="max-w-sm">
      <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-6">{mensaje}</p>
      <div className="flex gap-3">
        <Button variante="secondary" className="flex-1" onClick={onCerrar} disabled={cargando}>
          Cancelar
        </Button>
        <Button variante="danger" className="flex-1" cargando={cargando} onClick={handleConfirmar}>
          Desactivar
        </Button>
      </div>
    </Modal>
  )
}

// ─── Página principal ────────────────────────────────────────
export function PresupuestosPage() {
  const { usuario } = useAuthContext()
  const { presupuestos, cargando, crear, desactivar, recargar } = usePresupuestos()
  const { gastos: categoriasGastos, cargando: cargandoCat } = useCategorias()
  
  const [modalAbierto, setModalAbierto] = useState(false)
  const [errorLocal, setErrorLocal] = useState('')
  const [formData, setFormData] = useState({
    categoria_id: '',
    limite_monto: '',
    alerta_pct: 80 // Alerta por defecto al 80%
  })

  const handleCrear = async (e) => {
    e.preventDefault()
    setErrorLocal('')

    // Validación: Evitar crear dos presupuestos para la misma categoría
    const yaExiste = presupuestos.find(p => p.categoria_id === formData.categoria_id)
    if (yaExiste) {
      setErrorLocal('Ya tenés un límite establecido para esta categoría.')
      return
    }

    try {
      await crear({
        ...formData,
        usuario_id: usuario.id,
        limite_monto: Number(formData.limite_monto),
        alerta_pct: Number(formData.alerta_pct)
      })
      setModalAbierto(false)
      setFormData({ categoria_id: '', limite_monto: '', alerta_pct: 80 })
      window.location.reload()
    } catch (error) {
      console.error(error)
      setErrorLocal('Hubo un error al guardar el presupuesto.')
    }
  }

  return (
    <div className="animate-in fade-in duration-500">
      <Sidebar usuario={usuario} />
      <BottomNav />
      <PageWrapper>
        <PageHeader
          titulo="Mis Presupuestos"
          subtitulo="Límites mensuales"
          accion={<Button icono="+" onClick={() => setModalAbierto(true)} className="shadow-sm shadow-amber-500/20">Nuevo Límite</Button>}
        />

        {cargando ? (
           <Card className="mt-6">
             <div className="flex flex-col gap-4">
               {[1, 2, 3].map(i => <div key={i} className="h-16 animate-pulse bg-zinc-100 dark:bg-zinc-800 rounded-xl" />)}
             </div>
           </Card>
        ) : presupuestos.length === 0 ? (
          <Card className="mt-6 py-12">
            <EmptyState 
              titulo="Sin límites definidos" 
              descripcion="Elegí categorías clave (como Delivery o Salidas) y poneles un tope mensual."
              accion={<Button icono="+" onClick={() => setModalAbierto(true)}>Crear mi primer límite</Button>} 
            />
          </Card>
        ) : (
          <Card className="mt-6">
            <div className="flex flex-col">
              {presupuestos.map(p => (
                <div key={p.id} className="relative group">
                  <PresupCard presupuesto={p} />
                  {/* Botón eliminar en hover */}
                  <button 
                    onClick={() => {
                      if(window.confirm(`¿Eliminar el límite de ${p.categoria_nombre}?`)) {
                        desactivar(p.id).then(() => recargar())
                      }
                    }}
                    className="absolute top-1/2 -translate-y-1/2 right-2 p-2 text-zinc-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity bg-white dark:bg-zinc-900 rounded-full"
                    title="Eliminar"
                  >
                    🗑️
                  </button>
                </div>
              ))}
            </div>
          </Card>
        )}
      </PageWrapper>

      <Modal abierto={modalAbierto} onCerrar={() => {setModalAbierto(false); setErrorLocal('');}} titulo="Definir nuevo límite">
        <form onSubmit={handleCrear} className="flex flex-col gap-4">
          
          {errorLocal && (
            <div className="bg-red-50 dark:bg-red-900/20 text-red-600 text-sm px-3 py-2 rounded-xl border border-red-100 dark:border-red-900/50">
              {errorLocal}
            </div>
          )}

          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-zinc-500 dark:text-zinc-400">¿Qué gasto querés limitar?</label>
            <Select 
              value={formData.categoria_id} 
              onChange={e => setFormData({...formData, categoria_id: e.target.value})}
              required
            >
              <option value="" disabled>Seleccioná una categoría</option>
              {categoriasGastos.map(c => (
                <option key={c.id} value={c.id}>{c.icono} {c.nombre}</option>
              ))}
            </Select>
          </div>

          <Input label="Monto máximo mensual" type="number" prefijo="$" required min="1" step="0.01" autoFocus inputMode="decimal"
            value={formData.limite_monto} onChange={e => setFormData({...formData, limite_monto: e.target.value})} />
          
          <div className="bg-amber-50 dark:bg-amber-900/10 p-4 rounded-xl border border-amber-100 dark:border-amber-900/30">
            <label className="text-xs font-medium text-amber-800 dark:text-amber-400 flex justify-between mb-2">
              <span>Avisarme cuando gaste el:</span>
              <span className="font-bold">{formData.alerta_pct}%</span>
            </label>
            <input 
              type="range" min="50" max="100" step="5"
              value={formData.alerta_pct}
              onChange={e => setFormData({...formData, alerta_pct: e.target.value})}
              className="w-full accent-amber-500"
            />
          </div>

          <div className="flex gap-3 mt-2">
            <Button type="button" variante="secondary" className="flex-1" onClick={() => {setModalAbierto(false); setErrorLocal('');}}>Cancelar</Button>
            <Button type="submit" className="flex-1 shadow-md shadow-amber-500/20">Guardar Límite</Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}