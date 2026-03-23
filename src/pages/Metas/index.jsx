import { useState } from 'react'
import { useAuthContext } from '../../context/AuthContext'
import { useMetas }       from '../../hooks/useMetas'
import { PageWrapper, PageHeader, Sidebar, BottomNav, MetaCard } from '../../components/layout'
import { Card, Button, EmptyState, EMPTY_STATES, Modal,
         Input, Badge }  from '../../components/ui'

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
  const { metas, cargando, crear, editar, aportar, pausar, reanudar, cancelar } = useMetas()

  const [modalCrear,    setModalCrear]    = useState(false)
  const [metaAportar,   setMetaAportar]   = useState(null)
  const [metaEditar,    setMetaEditar]    = useState(null)
  const [metaCancelar,  setMetaCancelar]  = useState(null)
  const [filtro,        setFiltro]        = useState('activa') // 'activa' | 'completada' | 'todas'

  const metasFiltradas = filtro === 'todas' ? metas : metas.filter(m => m.estado === filtro)

  return (
    <>
      <Sidebar usuario={usuario} />
      <BottomNav />
      <PageWrapper>
        <PageHeader
          titulo="Mis metas"
          subtitulo="Objetivos de ahorro"
          accion={<Button icono="+" onClick={() => setModalCrear(true)}>Nueva meta</Button>}
        />

        {/* Filtros */}
        <div className="flex bg-zinc-100 dark:bg-zinc-800 rounded-xl p-1 mb-6">
          {[
            { key: 'activa',    label: 'Activas'    },
            { key: 'completada',label: 'Completadas' },
            { key: 'todas',     label: 'Todas'      },
          ].map(({ key, label }) => (
            <button key={key} onClick={() => setFiltro(key)}
              className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors
                ${filtro === key
                  ? 'bg-white dark:bg-zinc-900 shadow-sm text-zinc-900 dark:text-white'
                  : 'text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'}`}>
              {label}
            </button>
          ))}
        </div>

        {/* Contenido */}
        {cargando ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[0,1,2].map(i => (
              <div key={i} className="h-44 bg-zinc-100 dark:bg-zinc-800 rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : metasFiltradas.length === 0 ? (
          <Card>
            <EmptyState
              icono={filtro === 'completada' ? '🏆' : '🎯'}
              titulo={filtro === 'completada' ? 'Todavía no completaste ninguna meta' : 'Sin metas activas'}
              descripcion={filtro === 'completada'
                ? 'Cuando alcances una meta, aparecerá acá.'
                : 'Creá tu primera meta de ahorro y empezá a seguir tu progreso.'}
              accion={filtro !== 'completada'
                ? <Button icono="+" onClick={() => setModalCrear(true)}>Crear meta</Button>
                : null
              }
            />
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {metasFiltradas.map(meta => (
              <div key={meta.id} className="flex flex-col gap-2">
                <MetaCard meta={meta} onClick={() => setMetaEditar(meta)} />

                {/* Acciones debajo de cada card */}
                {meta.estado === 'activa' && (
                  <div className="flex gap-2 px-1">
                    <Button tamaño="sm" variante="secondary" className="flex-1"
                      onClick={() => setMetaAportar(meta)}>
                      + Aportar
                    </Button>
                    <Button tamaño="sm" variante="ghost"
                      onClick={() => pausar(meta.id)}
                      title="Pausar meta">
                      ⏸
                    </Button>
                    <Button tamaño="sm" variante="ghost"
                      onClick={() => setMetaCancelar(meta.id)}
                      title="Cancelar meta"
                      className="hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20">
                      ✕
                    </Button>
                  </div>
                )}
                {meta.estado === 'pausada' && (
                  <div className="flex gap-2 px-1">
                    <Button tamaño="sm" variante="secondary" className="flex-1"
                      onClick={() => reanudar(meta.id)}>
                      ▶ Reanudar
                    </Button>
                    <Button tamaño="sm" variante="ghost"
                      onClick={() => setMetaCancelar(meta.id)}
                      className="hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20">
                      ✕
                    </Button>
                  </div>
                )}
                {meta.estado === 'completada' && (
                  <p className="text-xs text-center text-emerald-600 dark:text-emerald-400 font-medium">
                    🎉 ¡Meta alcanzada!
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </PageWrapper>

      {/* Modales */}
      <Modal abierto={modalCrear} onCerrar={() => setModalCrear(false)} titulo="Nueva meta de ahorro">
        <FormMeta
          onSubmit={async (d) => { await crear(d); setModalCrear(false) }}
          onCancel={() => setModalCrear(false)}
        />
      </Modal>

      <Modal abierto={!!metaEditar} onCerrar={() => setMetaEditar(null)}
        titulo="Editar meta">
        {metaEditar && (
          <FormMeta
            inicial={metaEditar}
            onSubmit={async (d) => { await editar(metaEditar.id, d); setMetaEditar(null) }}
            onCancel={() => setMetaEditar(null)}
          />
        )}
      </Modal>

      <ModalAportar
        meta={metaAportar}
        onSubmit={async (monto) => { await aportar(metaAportar.id, monto); setMetaAportar(null) }}
        onCerrar={() => setMetaAportar(null)}
      />

      <ModalConfirmar
        abierto={!!metaCancelar}
        onCerrar={() => setMetaCancelar(null)}
        titulo="Cancelar meta"
        mensaje="¿Querés cancelar esta meta? El progreso se perderá."
        labelConfirmar="Sí, cancelar"
        onConfirmar={async () => { await cancelar(metaCancelar); setMetaCancelar(null) }}
      />
    </>
  )
}