import { useState, useEffect } from 'react'
import { Button, Input, Select, Spinner } from '../ui/index.js'
import { useCategorias } from '../../hooks/index.js'

export function FormMovimiento({ onSubmit, onCancel, valoresIniciales = null }) {
  const [tipo, setTipo] = useState(valoresIniciales?.tipo ?? 'gasto')
  const [monto, setMonto] = useState(valoresIniciales?.monto ?? '')
  const [descripcion, setDescripcion] = useState(valoresIniciales?.descripcion ?? '')
  
  const hoyLocal = new Date().toLocaleDateString('sv-SE')
  const [fecha, setFecha] = useState(valoresIniciales?.fecha ?? hoyLocal)
  
  const [categoriaId, setCategoriaId] = useState(valoresIniciales?.categoria_id ?? '')
  const [cargando, setCargando] = useState(false)
  const [error, setError] = useState(null)

  const { gastos, ingresos, cargando: cargandoCat } = useCategorias()
  const categoriasOptions = tipo === 'gasto' ? gastos : ingresos

  useEffect(() => {
    if (!valoresIniciales && categoriasOptions.length > 0 && !categoriaId) {
      setCategoriaId(categoriasOptions[0].id)
    }
  }, [categoriasOptions, categoriaId, valoresIniciales])

  async function handleSubmit(e) {
    e.preventDefault()
    setError(null)

    if (!monto || monto <= 0) {
      setError('El monto debe ser mayor a 0.')
      return
    }
    if (!categoriaId) {
      setError('Seleccioná una categoría.')
      return
    }

    setCargando(true)
    try {
      await onSubmit({
        tipo,
        monto: Number(monto),
        descripcion,
        fecha,
        categoria_id: categoriaId,
        es_recurrente: false,
      })
    } catch (err) {
      setError(err.message || 'Error al guardar el movimiento.')
      setCargando(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="flex bg-zinc-100 dark:bg-zinc-800 rounded-xl p-1 mb-2">
        <button
          type="button"
          onClick={() => { setTipo('gasto'); setCategoriaId('') }}
          className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
            tipo === 'gasto' 
              ? 'bg-white dark:bg-zinc-900 text-red-600 shadow-sm' 
              : 'text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'
          }`}
        >
          Gasto
        </button>
        <button
          type="button"
          onClick={() => { setTipo('ingreso'); setCategoriaId('') }}
          className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
            tipo === 'ingreso' 
              ? 'bg-white dark:bg-zinc-900 text-emerald-600 shadow-sm' 
              : 'text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'
          }`}
        >
          Ingreso
        </button>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Input
          label="Monto"
          type="number" // El tipo number abre el teclado numérico en celulares
          inputMode="decimal" // Específico para forzar teclado con coma/punto
          step="0.01"
          min="0.01"
          placeholder="0.00"
          prefijo="$"
          value={monto}
          onChange={(e) => setMonto(e.target.value)}
          required
        />
        <Input
          label="Fecha"
          type="date"
          value={fecha}
          onChange={(e) => setFecha(e.target.value)}
          required
        />
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-xs font-medium text-zinc-500 dark:text-zinc-400">Categoría</label>
        {cargandoCat ? (
          <div className="h-10 bg-zinc-100 dark:bg-zinc-800 rounded-xl animate-pulse flex items-center px-3 text-sm text-zinc-400">Cargando...</div>
        ) : (
          <Select
            value={categoriaId}
            onChange={(e) => setCategoriaId(e.target.value)}
            required
            className="w-full"
          >
            <option value="" disabled>Seleccioná una categoría</option>
            {categoriasOptions.map(c => (
              <option key={c.id} value={c.id}>
                {c.icono} {c.nombre}
              </option>
            ))}
          </Select>
        )}
      </div>

      <Input
        label="Descripción (opcional)"
        placeholder="Ej: Supermercado, Alquiler, etc."
        value={descripcion}
        onChange={(e) => setDescripcion(e.target.value)}
      />

      {error && (
        <p className="text-xs text-red-500 bg-red-50 dark:bg-red-900/20 rounded-xl px-3 py-2 border border-red-100 dark:border-red-900">
          {error}
        </p>
      )}

      <div className="flex gap-3 mt-4">
        <Button
          type="button"
          variante="secondary"
          className="flex-1"
          onClick={onCancel}
          disabled={cargando}
        >
          Cancelar
        </Button>
        <Button
          type="submit"
          className="flex-1"
          cargando={cargando}
        >
          Guardar
        </Button>
      </div>
    </form>
  )
}