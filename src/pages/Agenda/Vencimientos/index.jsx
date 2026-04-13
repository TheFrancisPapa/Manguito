// src/pages/Vencimientos/index.jsx
import { useState, useMemo } from 'react'
import { useAuthContext } from '../../../context/AuthContext'
import { useVencimientos } from '../../../hooks/useVencimientos'
import { getVencimientosProximos } from '../../../api/vencimientos'
import { PageWrapper, PageHeader } from '../../../components/layout'
import { Card, Button, EmptyState, Modal, Input, Select } from '../../../components/ui'

const CATEGORIAS = [
  { id: 'servicios',  label: 'Servicios',    icono: '💡' },
  { id: 'alquiler',   label: 'Alquiler',     icono: '🏠' },
  { id: 'tarjeta',    label: 'Tarjeta',      icono: '💳' },
  { id: 'impuestos',  label: 'Impuestos',    icono: '🏛️' },
  { id: 'seguro',     label: 'Seguro',       icono: '🛡️' },
  { id: 'cuota',      label: 'Cuota/Préstamo', icono: '💰' },
  { id: 'suscripcion',label: 'Suscripción',  icono: '📱' },
  { id: 'otro',       label: 'Otro',         icono: '📋' },
]

const COLORES = ['#3B82F6','#EF4444','#10B981','#F59E0B','#8B5CF6','#EC4899','#06B6D4','#6B7280']

const fmtMonto = (m) => m != null
  ? `$${Number(m).toLocaleString('es-AR', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`
  : 'Variable'

const FORM_INIT = {
  nombre: '', monto: '', icono: '📅', color: '#3B82F6',
  dia_vencimiento: '', categoria: 'servicios', alertar_dias: 3, notas: '',
}

export function FormVencimiento({ onSubmit, onCancel, inicial = null }) {
  const [form, setForm]     = useState(inicial ? {
    nombre: inicial.nombre, monto: inicial.monto ?? '', icono: inicial.icono,
    color: inicial.color, dia_vencimiento: inicial.dia_vencimiento,
    categoria: inicial.categoria, alertar_dias: inicial.alertar_dias, notas: inicial.notas ?? '',
  } : FORM_INIT)
  const [cargando, setCargando] = useState(false)
  const [error, setError]       = useState(null)

  const set = (k) => (e) => { setForm(f => ({ ...f, [k]: e.target?.value ?? e })); setError(null) }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!form.nombre.trim()) { setError('Ingresá un nombre.'); return }
    if (!form.dia_vencimiento || form.dia_vencimiento < 1 || form.dia_vencimiento > 31) {
      setError('El día debe estar entre 1 y 31.'); return
    }
    setCargando(true)
    try {
      await onSubmit({
        nombre:          form.nombre.trim(),
        monto:           form.monto ? Number(form.monto) : null,
        icono:           form.icono || '📅',
        color:           form.color,
        dia_vencimiento: Number(form.dia_vencimiento),
        categoria:       form.categoria,
        alertar_dias:    Number(form.alertar_dias),
        notas:           form.notas.trim() || null,
      })
    } catch (err) {
      setError(err.message)
      setCargando(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      {/* Nombre e icono */}
      <div className="flex gap-3">
        <Input label="Emoji" value={form.icono} onChange={set('icono')} maxLength={2}
          className="w-20 text-center text-xl" />
        <Input label="Nombre del pago" placeholder="Ej: Alquiler" required
          value={form.nombre} onChange={set('nombre')} className="flex-1" />
      </div>

      {/* Categoría */}
      <Select label="Categoría" value={form.categoria} onChange={set('categoria')}>
        {CATEGORIAS.map(c => (
          <option key={c.id} value={c.id}>{c.icono} {c.label}</option>
        ))}
      </Select>

      {/* Monto y día */}
      <div className="grid grid-cols-2 gap-3">
        <Input label="Monto (opcional)" type="number" inputMode="decimal"
          prefijo="$" placeholder="Variable"
          value={form.monto} onChange={set('monto')} />
        <Input label="Día del mes" type="number" inputMode="numeric"
          min="1" max="31" placeholder="Ej: 10" required
          value={form.dia_vencimiento} onChange={set('dia_vencimiento')} />
      </div>

      {/* Alertar días antes */}
      <div className="flex flex-col gap-1">
        <label className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
          Alertar {form.alertar_dias} días antes
        </label>
        <input type="range" min="1" max="10" value={form.alertar_dias}
          onChange={set('alertar_dias')} className="accent-amber-400" />
        <div className="flex justify-between text-[10px] text-zinc-400">
          <span>1 día</span><span>10 días</span>
        </div>
      </div>

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

      {/* Notas */}
      <Input label="Notas (opcional)" placeholder="Ej: Pagar antes del viernes"
        value={form.notas} onChange={set('notas')} />

      {error && (
        <p className="text-xs text-red-500 bg-red-50 dark:bg-red-900/20 rounded-xl px-3 py-2 border border-red-100 dark:border-red-900">
          {error}
        </p>
      )}

      <div className="flex gap-3 mt-2">
        <Button type="button" variante="secondary" className="flex-1" onClick={onCancel} disabled={cargando}>
          Cancelar
        </Button>
        <Button type="submit" className="flex-1" cargando={cargando}>
          {inicial ? 'Guardar cambios' : 'Agregar vencimiento'}
        </Button>
      </div>
    </form>
  )
}

// Tarjeta individual de vencimiento
function TarjetaVencimiento({ v, diasRestantes, onClick }) {
  const urgente  = diasRestantes !== undefined && diasRestantes <= v.alertar_dias
  const hoy      = diasRestantes === 0
  const diaStr   = `Día ${v.dia_vencimiento} de cada mes`

  return (
    <div onClick={onClick}
      className={`flex items-center gap-4 p-4 rounded-2xl border cursor-pointer
        transition-all hover:shadow-md active:scale-[0.99] group
        ${urgente
          ? 'bg-amber-50 dark:bg-amber-900/15 border-amber-200 dark:border-amber-800/50'
          : 'bg-white dark:bg-zinc-900 border-zinc-100 dark:border-zinc-800 hover:border-zinc-200 dark:hover:border-zinc-700'}`}>

      {/* Ícono */}
      <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0"
        style={{ background: v.color + '20' }}>
        {v.icono}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="font-bold text-sm text-zinc-900 dark:text-white truncate leading-tight">
          {v.nombre}
        </p>
        <p className="text-xs text-zinc-400 mt-0.5">{diaStr}</p>
        {v.notas && (
          <p className="text-xs text-zinc-400 italic truncate mt-0.5">{v.notas}</p>
        )}
      </div>

      {/* Monto y estado */}
      <div className="text-right flex-shrink-0">
        <p className="text-sm font-bold" style={{ color: v.color }}>
          {fmtMonto(v.monto)}
        </p>
        {diasRestantes !== undefined && (
          <p className={`text-[10px] font-semibold mt-0.5 ${
            hoy      ? 'text-red-500'
            : urgente ? 'text-amber-600 dark:text-amber-400'
            : 'text-zinc-400'
          }`}>
            {hoy ? '🚨 Vence hoy' : `En ${diasRestantes} días`}
          </p>
        )}
      </div>
    </div>
  )
}

export function VencimientosPage() {
  const { usuario } = useAuthContext()
  const { vencimientos, cargando, crear, editar, borrar } = useVencimientos()
  const [modalNuevo, setModalNuevo] = useState(false)
  const [seleccionado, setSeleccionado] = useState(null)

  // Calcular cuáles vencen pronto (próximos 10 días)
  const proximos = useMemo(
    () => getVencimientosProximos(vencimientos, 10),
    [vencimientos]
  )

  // Enriquecer todos con días restantes para mostrar en la lista
  const enriquecidos = useMemo(() => {
    const hoy = new Date()
    const diaHoy = hoy.getDate()
    const mesHoy = hoy.getMonth()
    const anioHoy = hoy.getFullYear()

    return vencimientos.map(v => {
      const diasEnMes = new Date(anioHoy, mesHoy + 1, 0).getDate()
      let diaVence = Math.min(v.dia_vencimiento, diasEnMes)
      let fechaVence = new Date(anioHoy, mesHoy, diaVence)
      if (diaVence < diaHoy) {
        fechaVence = new Date(anioHoy, mesHoy + 1, Math.min(v.dia_vencimiento, new Date(anioHoy, mesHoy + 2, 0).getDate()))
      }
      const diasRestantes = Math.ceil((fechaVence - hoy) / 86_400_000)
      return { ...v, diasRestantes }
    }).sort((a, b) => a.diasRestantes - b.diasRestantes)
  }, [vencimientos])

  const handleGuardar = async (datos) => {
    if (seleccionado) {
      await editar(seleccionado.id, datos)
    } else {
      await crear({ ...datos, usuario_id: usuario?.id })
    }
    setModalNuevo(false)
    setSeleccionado(null)
  }

  const handleEliminar = async () => {
    if (!seleccionado) return
    if (window.confirm(`¿Eliminás "${seleccionado.nombre}"?`)) {
      await borrar(seleccionado.id)
      setSeleccionado(null)
    }
  }

  return (
    <div className="animate-in fade-in duration-500">
      <PageWrapper>
        <PageHeader
          titulo="📅 Agenda de Vencimientos"
          subtitulo="Nunca más pagues intereses por olvidar"
          accion={
            <Button icono="+" onClick={() => { setSeleccionado(null); setModalNuevo(true) }}>
              Agregar
            </Button>
          }
        />

        {/* Alertas urgentes */}
        {proximos.length > 0 && (
          <div className="mb-5 bg-amber-50 dark:bg-amber-900/15 border border-amber-200 dark:border-amber-800/40
            rounded-2xl p-4">
            <p className="text-xs font-bold text-amber-700 dark:text-amber-400 uppercase tracking-wider mb-3">
              ⚠️ Próximos a vencer
            </p>
            <div className="flex flex-col gap-2">
              {proximos.map(v => (
                <div key={v.id} className="flex items-center justify-between py-1">
                  <div className="flex items-center gap-2">
                    <span>{v.icono}</span>
                    <span className="text-sm font-semibold text-zinc-800 dark:text-zinc-100">{v.nombre}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    {v.monto && <span className="text-sm font-bold" style={{ color: v.color }}>{fmtMonto(v.monto)}</span>}
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                      v.diasRestantes === 0
                        ? 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400'
                        : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                    }`}>
                      {v.diasRestantes === 0 ? '¡Hoy!' : `${v.diasRestantes}d`}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Lista completa */}
        {cargando ? (
          <div className="flex flex-col gap-3">
            {[0,1,2].map(i => <div key={i} className="h-20 bg-zinc-100 dark:bg-zinc-800 rounded-2xl animate-pulse" />)}
          </div>
        ) : vencimientos.length === 0 ? (
          <Card className="py-12">
            <EmptyState
              icono="📅"
              titulo="Sin vencimientos cargados"
              descripcion="Agregá tus pagos recurrentes para que Manguito te avise antes de que venzan."
              accion={<Button icono="+" onClick={() => setModalNuevo(true)}>Agregar mi primer vencimiento</Button>}
            />
          </Card>
        ) : (
          <div className="flex flex-col gap-3">
            {enriquecidos.map(v => (
              <TarjetaVencimiento
                key={v.id}
                v={v}
                diasRestantes={v.diasRestantes}
                onClick={() => { setSeleccionado(v); setModalNuevo(true) }}
              />
            ))}
          </div>
        )}
      </PageWrapper>

      {/* Modal crear/editar */}
      <Modal
        abierto={modalNuevo}
        onCerrar={() => { setModalNuevo(false); setSeleccionado(null) }}
        titulo={seleccionado ? 'Editar vencimiento' : 'Nuevo vencimiento'}
        ancho="max-w-md"
      >
        <FormVencimiento
          inicial={seleccionado}
          onSubmit={handleGuardar}
          onCancel={() => { setModalNuevo(false); setSeleccionado(null) }}
        />
        {seleccionado && (
          <button onClick={handleEliminar}
            className="w-full mt-3 py-2.5 rounded-xl text-sm font-medium text-red-500
              hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
            🗑️ Eliminar este vencimiento
          </button>
        )}
      </Modal>
    </div>
  )
}
