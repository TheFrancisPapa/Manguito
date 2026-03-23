import { useState } from 'react'
import { useAuthContext }       from '../../context/AuthContext'
import { usePresupuestos }      from '../../hooks/usePresupuestos'
import { useCategorias }        from '../../hooks/useCategorias'
import { PageWrapper, PageHeader, Sidebar, BottomNav, PresupCard } from '../../components/layout'
import { Card, CardHeader, Button, EmptyState, EMPTY_STATES, Modal,
         Input, Select, Badge }  from '../../components/ui'

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
  const { usuario }   = useAuthContext()
  const { gastos: categoriasGasto } = useCategorias()
  const { presupuestos, resumen, cargando, crear, desactivar, clonarMes } = usePresupuestos()

  const [modalCrear,    setModalCrear]    = useState(false)
  const [modalDesact,   setModalDesact]   = useState(null)  // id del presupuesto
  const [modalClonar,   setModalClonar]   = useState(false)

  const mesActual = new Date().toLocaleDateString('es-AR', { month: 'long', year: 'numeric' })

  return (
    <>
      <Sidebar usuario={usuario} />
      <BottomNav />
      <PageWrapper>
        <PageHeader
          titulo="Presupuestos"
          subtitulo={mesActual.charAt(0).toUpperCase() + mesActual.slice(1)}
          accion={
            <div className="flex gap-2">
              {presupuestos.length > 0 && (
                <Button variante="secondary" tamaño="sm" onClick={() => setModalClonar(true)}>
                  Clonar mes anterior
                </Button>
              )}
              <Button icono="+" onClick={() => setModalCrear(true)}>Nuevo</Button>
            </div>
          }
        />

        {/* Resumen arriba */}
        {!cargando && presupuestos.length > 0 && (
          <div className="grid grid-cols-3 gap-3 mb-6">
            <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-2xl p-3 text-center">
              <p className="text-xl font-semibold text-emerald-700 dark:text-emerald-400">
                {resumen.holgados}
              </p>
              <p className="text-xs text-emerald-600 dark:text-emerald-500 mt-0.5">Bajo control</p>
            </div>
            <div className="bg-amber-50 dark:bg-amber-900/20 rounded-2xl p-3 text-center">
              <p className="text-xl font-semibold text-amber-700 dark:text-amber-400">
                {resumen.alertas}
              </p>
              <p className="text-xs text-amber-600 dark:text-amber-500 mt-0.5">En alerta</p>
            </div>
            <div className="bg-red-50 dark:bg-red-900/20 rounded-2xl p-3 text-center">
              <p className="text-xl font-semibold text-red-700 dark:text-red-400">
                {resumen.excedidos}
              </p>
              <p className="text-xs text-red-600 dark:text-red-500 mt-0.5">Excedidos</p>
            </div>
          </div>
        )}

        {/* Lista */}
        {cargando ? (
          <Card>
            {[0,1,2,3].map(i => (
              <div key={i} className="h-16 bg-zinc-100 dark:bg-zinc-800 rounded-xl animate-pulse mb-2" />
            ))}
          </Card>
        ) : presupuestos.length === 0 ? (
          <Card>
            <EmptyState {...EMPTY_STATES.presupuestos}
              accion={<Button icono="+" onClick={() => setModalCrear(true)}>Crear mi primer límite</Button>}
            />
          </Card>
        ) : (
          <Card>
            <div className="flex flex-col">
              {presupuestos.map(p => (
                <div key={p.id} className="group relative">
                  <PresupCard presupuesto={p} />
                  {/* Botón desactivar — aparece al hover */}
                  <button
                    onClick={() => setModalDesact(p.id)}
                    className="absolute right-0 top-1/2 -translate-y-1/2
                      opacity-0 group-hover:opacity-100 transition-opacity
                      text-xs text-zinc-400 hover:text-red-500 px-2 py-1 rounded-lg
                      hover:bg-red-50 dark:hover:bg-red-900/20"
                    title="Desactivar presupuesto"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          </Card>
        )}
      </PageWrapper>

      {/* Modal crear */}
      <Modal abierto={modalCrear} onCerrar={() => setModalCrear(false)} titulo="Nuevo límite de gasto">
        <FormPresupuesto
          categorias={categoriasGasto}
          onSubmit={async (d) => { await crear(d); setModalCrear(false) }}
          onCancel={() => setModalCrear(false)}
        />
      </Modal>

      {/* Modal confirmar desactivar */}
      <ModalConfirmar
        abierto={!!modalDesact}
        onCerrar={() => setModalDesact(null)}
        mensaje="¿Desactivar este presupuesto? Podés volver a crearlo cuando quieras."
        onConfirmar={async () => { await desactivar(modalDesact); setModalDesact(null) }}
      />

      {/* Modal confirmar clonar */}
      <ModalConfirmar
        abierto={modalClonar}
        onCerrar={() => setModalClonar(false)}
        mensaje="¿Copiar los presupuestos del mes anterior para este mes?"
        onConfirmar={async () => { await clonarMes(); setModalClonar(false) }}
      />
    </>
  )
}