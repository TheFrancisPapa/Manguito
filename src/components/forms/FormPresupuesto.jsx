import { useState } from 'react'
import { Button, Input, Select } from '../ui/index.js'
import { useCategorias } from '../../hooks/index.js'

export function FormPresupuesto({ onSubmit, onCancel, inicial = null }) {
  const hoy = new Date()
  const [form, setForm] = useState({
    categoria_id: inicial?.categoria_id ?? '',
    limite_monto: inicial?.limite_monto ?? '',
    alerta_pct:   inicial?.alerta_pct   ?? 80,
  })
  const [cargandoSubmit, setCargandoSubmit] = useState(false)
  const [errorLocal, setErrorLocal] = useState(null)

  const { gastos, cargando: cargandoCat } = useCategorias()

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }))

  async function handleSubmit(e) {
    e.preventDefault()
    setErrorLocal(null)

    if (!form.categoria_id || !form.limite_monto || form.limite_monto <= 0) {
      setErrorLocal('Elegí una categoría y un monto válido.')
      return
    }

    setCargandoSubmit(true)
    try {
      await onSubmit({
        categoria_id: form.categoria_id,
        limite_monto: Number(form.limite_monto),
        alerta_pct:   Number(form.alerta_pct),
        periodo: 'mensual',
        mes:  hoy.getMonth() + 1,
        anio: hoy.getFullYear(),
      })
    } catch (err) {
      setErrorLocal(err.message || 'Error al guardar el presupuesto.')
      setCargandoSubmit(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <label className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
          Categoría a limitar
        </label>
        {cargandoCat ? (
          <div className="h-10 bg-zinc-100 dark:bg-zinc-800 rounded-xl animate-pulse" />
        ) : (
          <Select 
            value={form.categoria_id} 
            onChange={set('categoria_id')} 
            required
          >
            <option value="" disabled>Seleccioná una categoría</option>
            {gastos.map(c => (
              <option key={c.id} value={c.id}>
                {c.icono} {c.nombre}
              </option>
            ))}
          </Select>
        )}
      </div>

      <Input
        label="Límite mensual"
        type="number"
        inputMode="decimal"
        step="0.01"
        min="0.01"
        placeholder="0.00"
        prefijo="$"
        value={form.limite_monto}
        onChange={set('limite_monto')}
        required
        autoFocus
      />

      <div className="flex flex-col gap-1">
        <label className="text-xs font-medium text-zinc-500 dark:text-zinc-400 flex justify-between">
          <span>Alerta al {form.alerta_pct}%</span>
        </label>
        <input type="range" min="50" max="95" step="5" value={form.alerta_pct}
          onChange={set('alerta_pct')}
          className="accent-amber-400 w-full" />
      </div>

      {errorLocal && (
        <p className="text-xs text-red-500 bg-red-50 dark:bg-red-900/20 rounded-xl px-3 py-2 border border-red-100 dark:border-red-900/50">
          {errorLocal}
        </p>
      )}

      <div className="flex gap-3 mt-4">
        <Button
          type="button"
          variante="secondary"
          className="flex-1"
          onClick={onCancel}
          disabled={cargandoSubmit}
        >
          Cancelar
        </Button>
        <Button type="submit" className="flex-1" cargando={cargandoSubmit}>
          Guardar límite
        </Button>
      </div>
    </form>
  )
}