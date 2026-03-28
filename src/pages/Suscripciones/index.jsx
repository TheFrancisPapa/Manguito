// src/pages/Suscripciones/index.jsx
import { useState } from 'react'
import { useAuthContext } from '../../context/AuthContext'
import { useSuscripciones } from '../../hooks/useSuscripciones'
import { SUSCRIPCIONES_POPULARES, exportarSuscripcionesCSV } from '../../api/suscripciones'
import { PageWrapper, PageHeader } from '../../components/layout'
import { Card, CardHeader, Button, EmptyState, Modal, Input, Select } from '../../components/ui'
import { exportarSuscripcionesCSV as exportarCSV } from '../../lib/exportar'

const CATEGORIAS = [
  { id: 'streaming', label: 'Streaming',  icono: '🎬' },
  { id: 'musica',    label: 'Música',     icono: '🎵' },
  { id: 'nube',      label: 'Nube',       icono: '☁️' },
  { id: 'ia',        label: 'IA',         icono: '🤖' },
  { id: 'software',  label: 'Software',   icono: '💻' },
  { id: 'salud',     label: 'Salud/Gym',  icono: '🏋️' },
  { id: 'educacion', label: 'Educación',  icono: '📚' },
  { id: 'juegos',    label: 'Juegos',     icono: '🎮' },
  { id: 'otro',      label: 'Otro',       icono: '📦' },
]

const COLORES = ['#8B5CF6','#EC4899','#1DB954','#E50914','#3478F6','#F59E0B','#EF4444','#10B981']

const FORM_INIT = {
  nombre: '', monto: '', moneda: 'USD', icono: '📱', color: '#8B5CF6',
  ciclo: 'mensual', dia_cobro: '', categoria: 'streaming', url: '', notas: '',
}

function fmtMes(m) {
  return `$${Number(m).toLocaleString('es-AR', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`
}

function FormSuscripcion({ onSubmit, onCancel, inicial = null }) {
  const [form, setForm]     = useState(inicial ? {
    nombre: inicial.nombre, monto: inicial.monto, moneda: inicial.moneda,
    icono: inicial.icono, color: inicial.color, ciclo: inicial.ciclo,
    dia_cobro: inicial.dia_cobro ?? '', categoria: inicial.categoria,
    url: inicial.url ?? '', notas: inicial.notas ?? '',
  } : FORM_INIT)
  const [cargando, setCargando] = useState(false)
  const [error, setError]       = useState(null)

  const set = (k) => (e) => { setForm(f => ({ ...f, [k]: e.target?.value ?? e })); setError(null) }

  const handlePopular = (p) => {
    setForm(f => ({ ...f, nombre: p.nombre, icono: p.icono, color: p.color, categoria: p.categoria, moneda: p.moneda }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!form.nombre.trim()) { setError('Ingresá un nombre.'); return }
    if (!form.monto || Number(form.monto) <= 0) { setError('El monto debe ser mayor a 0.'); return }
    setCargando(true)
    try {
      await onSubmit({
        nombre:    form.nombre.trim(),
        monto:     Number(form.monto),
        moneda:    form.moneda,
        icono:     form.icono || '📱',
        color:     form.color,
        ciclo:     form.ciclo,
        dia_cobro: form.dia_cobro ? Number(form.dia_cobro) : null,
        categoria: form.categoria,
        url:       form.url.trim() || null,
        notas:     form.notas.trim() || null,
        activa:    true,
      })
    } catch (err) {
      setError(err.message)
      setCargando(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 max-h-[70vh] overflow-y-auto pr-1">
      {/* Populares */}
      {!inicial && (
        <div>
          <label className="text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-2 block">
            Acceso rápido
          </label>
          <div className="grid grid-cols-5 gap-1.5">
            {SUSCRIPCIONES_POPULARES.map(p => (
              <button key={p.nombre} type="button" onClick={() => handlePopular(p)}
                className={`flex flex-col items-center gap-1 p-2 rounded-xl border-2 transition-all ${
                  form.nombre === p.nombre
                    ? 'border-[var(--mango)] bg-[var(--mango)]/8'
                    : 'border-zinc-100 dark:border-zinc-800 hover:border-zinc-300'
                }`}>
                <span className="text-lg">{p.icono}</span>
                <span className="text-[9px] font-bold text-zinc-500">{p.nombre}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="flex gap-3">
        <Input label="Emoji" value={form.icono} onChange={set('icono')} maxLength={2}
          className="w-20 text-center text-xl" />
        <Input label="Nombre del servicio" placeholder="Ej: Netflix" required
          value={form.nombre} onChange={set('nombre')} className="flex-1" />
      </div>

      <Select label="Categoría" value={form.categoria} onChange={set('categoria')}>
        {CATEGORIAS.map(c => <option key={c.id} value={c.id}>{c.icono} {c.label}</option>)}
      </Select>

      <div className="grid grid-cols-3 gap-3">
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-zinc-500 dark:text-zinc-400">Moneda</label>
          <select value={form.moneda} onChange={set('moneda')}
            className="bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700
              rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--mango)]/40
              text-zinc-900 dark:text-white appearance-none cursor-pointer">
            <option value="ARS">$ ARS</option>
            <option value="USD">U$D USD</option>
            <option value="EUR">€ EUR</option>
          </select>
        </div>
        <Input label="Precio" type="number" inputMode="decimal" step="0.01" min="0.01"
          placeholder="0.00" required value={form.monto} onChange={set('monto')} />
        <Select label="Ciclo" value={form.ciclo} onChange={set('ciclo')}>
          <option value="mensual">Mensual</option>
          <option value="trimestral">Trimestral</option>
          <option value="anual">Anual</option>
        </Select>
      </div>

      <Input label="Día de cobro (opcional)" type="number" inputMode="numeric"
        min="1" max="31" placeholder="Ej: 15"
        value={form.dia_cobro} onChange={set('dia_cobro')} />

      {/* Color */}
      <div className="flex flex-col gap-1">
        <label className="text-xs font-medium text-zinc-500 dark:text-zinc-400">Color</label>
        <div className="flex gap-2">
          {COLORES.map(c => (
            <button key={c} type="button" onClick={() => setForm(f => ({ ...f, color: c }))}
              className={`w-7 h-7 rounded-full transition-transform ${form.color === c ? 'scale-125 ring-2 ring-offset-2 ring-offset-white dark:ring-offset-zinc-900 ring-zinc-400' : 'hover:scale-110'}`}
              style={{ backgroundColor: c }} />
          ))}
        </div>
      </div>

      {error && (
        <p className="text-xs text-red-500 bg-red-50 dark:bg-red-900/20 rounded-xl px-3 py-2 border border-red-100 dark:border-red-900">
          {error}
        </p>
      )}

      <div className="flex gap-3 mt-2">
        <Button type="button" variante="secondary" className="flex-1" onClick={onCancel} disabled={cargando}>Cancelar</Button>
        <Button type="submit" className="flex-1" cargando={cargando}>
          {inicial ? 'Guardar cambios' : 'Agregar suscripción'}
        </Button>
      </div>
    </form>
  )
}

function TarjetaSuscripcion({ s, costoMensual, onEditar, onToggle }) {
  const cicloLabel = s.ciclo === 'mensual' ? '/mes' : s.ciclo === 'trimestral' ? '/trim.' : '/año'
  const monedaSimbolo = s.moneda === 'ARS' ? '$' : s.moneda === 'USD' ? 'U$D' : '€'

  return (
    <div className={`flex items-center gap-4 p-4 rounded-2xl border transition-all group
      ${s.activa
        ? 'bg-white dark:bg-zinc-900 border-zinc-100 dark:border-zinc-800'
        : 'bg-zinc-50/50 dark:bg-zinc-900/50 border-zinc-100 dark:border-zinc-800 opacity-60'}`}>
      <div className="w-11 h-11 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
        style={{ background: s.color + '20' }}>
        {s.icono}
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-bold text-sm text-zinc-900 dark:text-white truncate leading-tight">{s.nombre}</p>
        <p className="text-xs text-zinc-400 mt-0.5">
          {monedaSimbolo}{Number(s.monto).toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}{cicloLabel}
          {s.dia_cobro && ` · día ${s.dia_cobro}`}
        </p>
      </div>
      <div className="flex items-center gap-2 flex-shrink-0">
        <div className="text-right">
          <p className="text-sm font-bold" style={{ color: s.activa ? s.color : '#9CA3AF' }}>
            {fmtMes(costoMensual)}/mes
          </p>
          <p className="text-[10px] text-zinc-400">aprox. en ARS</p>
        </div>
        {/* Toggle activa */}
        <button onClick={onToggle}
          className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full
            border-2 border-transparent transition-colors duration-200
            ${s.activa ? 'bg-[var(--mango)]' : 'bg-zinc-200 dark:bg-zinc-700'}`}
          title={s.activa ? 'Pausar' : 'Activar'}>
          <span className={`pointer-events-none flex h-5 w-5 items-center justify-center rounded-full bg-white shadow
            transform transition-transform ${s.activa ? 'translate-x-5' : 'translate-x-0'}`}>
            <span className="text-[10px]">{s.activa ? '✓' : '·'}</span>
          </span>
        </button>
        {/* Editar */}
        <button onClick={onEditar}
          className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200
            hover:bg-zinc-100 dark:hover:bg-zinc-800 opacity-0 group-hover:opacity-100 transition-all">
          ✏️
        </button>
      </div>
    </div>
  )
}

export function SuscripcionesPage() {
  const { usuario } = useAuthContext()
  const { suscripciones, resumen, cargando, crear, editar, borrar, toggleActiva } = useSuscripciones()
  const [modalNuevo, setModalNuevo]   = useState(false)
  const [seleccionada, setSeleccionada] = useState(null)

  const handleGuardar = async (datos) => {
    if (seleccionada) {
      await editar(seleccionada.id, datos)
    } else {
      await crear({ ...datos, usuario_id: usuario?.id })
    }
    setModalNuevo(false)
    setSeleccionada(null)
  }

  const handleEliminar = async () => {
    if (!seleccionada) return
    if (window.confirm(`¿Eliminás "${seleccionada.nombre}"?`)) {
      await borrar(seleccionada.id)
      setSeleccionada(null)
      setModalNuevo(false)
    }
  }

  return (
    <div className="animate-in fade-in duration-500">
      <PageWrapper>
        <PageHeader
          titulo="📱 Suscripciones"
          subtitulo="¿Cuánto gastás en servicios digitales?"
          accion={
            <div className="flex gap-2">
              {suscripciones.length > 0 && (
                <Button variante="secondary" tamaño="sm"
                  onClick={() => exportarCSV(suscripciones)}>
                  📤 CSV
                </Button>
              )}
              <Button icono="+" onClick={() => { setSeleccionada(null); setModalNuevo(true) }}>
                Agregar
              </Button>
            </div>
          }
        />

        {/* Resumen */}
        {resumen.activas > 0 && (
          <div className="grid grid-cols-3 gap-3 mb-5">
            <div className="bg-purple-50 dark:bg-purple-900/15 border border-purple-100 dark:border-purple-900/20 rounded-2xl p-3">
              <p className="text-[10px] font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400 mb-0.5">Activas</p>
              <p className="text-2xl font-black text-purple-700 dark:text-purple-400">{resumen.activas}</p>
            </div>
            <div className="bg-red-50 dark:bg-red-900/15 border border-red-100 dark:border-red-900/20 rounded-2xl p-3">
              <p className="text-[10px] font-bold uppercase tracking-wider text-red-600 dark:text-red-400 mb-0.5">Por mes</p>
              <p className="text-lg font-black text-red-700 dark:text-red-400 leading-tight">
                ${Math.round(resumen.totalMensualARS / 1000)}K
              </p>
              <p className="text-[9px] text-red-500/60">
                ${Number(resumen.totalMensualARS).toLocaleString('es-AR', { maximumFractionDigits: 0 })}
              </p>
            </div>
            <div className="bg-amber-50 dark:bg-amber-900/15 border border-amber-100 dark:border-amber-900/20 rounded-2xl p-3">
              <p className="text-[10px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400 mb-0.5">Al año</p>
              <p className="text-lg font-black text-amber-700 dark:text-amber-400 leading-tight">
                ${Math.round(resumen.totalAnualARS / 1000)}K
              </p>
            </div>
          </div>
        )}

        {/* Lista */}
        {cargando ? (
          <div className="flex flex-col gap-3">
            {[0,1,2].map(i => <div key={i} className="h-20 bg-zinc-100 dark:bg-zinc-800 rounded-2xl animate-pulse" />)}
          </div>
        ) : suscripciones.length === 0 ? (
          <Card className="py-12">
            <EmptyState
              icono="📱"
              titulo="Sin suscripciones cargadas"
              descripcion="Agregá tus servicios mensuales para ver cuánto estás gastando realmente."
              accion={<Button icono="+" onClick={() => setModalNuevo(true)}>Agregar suscripción</Button>}
            />
          </Card>
        ) : (
          <div className="flex flex-col gap-3">
            {resumen.detalle.map(s => (
              <TarjetaSuscripcion
                key={s.id}
                s={s}
                costoMensual={s.costoMensualARS}
                onEditar={() => { setSeleccionada(s); setModalNuevo(true) }}
                onToggle={() => toggleActiva(s.id)}
              />
            ))}
            {/* Suscripciones inactivas */}
            {suscripciones.filter(s => !s.activa).map(s => {
              const costoMensual = s.ciclo === 'mensual' ? s.monto : s.ciclo === 'trimestral' ? s.monto / 3 : s.monto / 12
              return (
                <TarjetaSuscripcion
                  key={s.id}
                  s={s}
                  costoMensual={costoMensual * (s.moneda === 'ARS' ? 1 : 1000)}
                  onEditar={() => { setSeleccionada(s); setModalNuevo(true) }}
                  onToggle={() => toggleActiva(s.id)}
                />
              )
            })}
          </div>
        )}
      </PageWrapper>

      <Modal
        abierto={modalNuevo}
        onCerrar={() => { setModalNuevo(false); setSeleccionada(null) }}
        titulo={seleccionada ? 'Editar suscripción' : 'Nueva suscripción'}
        ancho="max-w-md"
      >
        <FormSuscripcion
          inicial={seleccionada}
          onSubmit={handleGuardar}
          onCancel={() => { setModalNuevo(false); setSeleccionada(null) }}
        />
        {seleccionada && (
          <button onClick={handleEliminar}
            className="w-full mt-3 py-2.5 rounded-xl text-sm font-medium text-red-500
              hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
            🗑️ Eliminar esta suscripción
          </button>
        )}
      </Modal>
    </div>
  )
}