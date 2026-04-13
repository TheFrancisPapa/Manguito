import { useState, useMemo, useEffect } from 'react'
import { useAuthContext } from '../../../context/AuthContext'
import { usePresupuestos } from '../../../hooks/usePresupuestos'
import { useCategorias } from '../../../hooks/useCategorias'
import { PresupCard } from '../../../components/layout'
import { Card, Button, EmptyState, Modal, Input, ModalUpgrade, EmojiSuggester, sugerirCategorias } from '../../../components/ui'

// ─── Form simplificado: Nombre + Monto → Sugerencia de emoji y categoría ────
function FormPresupuesto({ categorias, onSubmit, onCancel, inicial = null }) {
  const hoy = new Date()

  // Step flow: 1 = nombre+monto, 2 = elegir categoría
  const [step, setStep]     = useState(1)
  const [nombre, setNombre] = useState(inicial?.nombre ?? '')
  const [monto, setMonto]   = useState(inicial?.limite_monto ?? '')
  const [icono, setIcono]   = useState(inicial?.icono ?? '')
  const [categoriaId, setCategoriaId] = useState(inicial?.categoria_id ?? '')
  const [alertaPct, setAlertaPct]     = useState(inicial?.alerta_pct ?? 80)
  const [crearNueva, setCrearNueva]   = useState(false)

  const [cargando, setCargando] = useState(false)
  const [error, setError]       = useState(null)

  // Sugerencia de categorías basada en el nombre
  const catSugeridas = useMemo(
    () => sugerirCategorias(nombre, categorias),
    [nombre, categorias]
  )

  // Auto-seleccionar la primera sugerida
  useEffect(() => {
    if (step === 2 && catSugeridas.length > 0 && !categoriaId) {
      setCategoriaId(catSugeridas[0].id)
      if (!icono) setIcono(catSugeridas[0].icono)
    }
  }, [step, catSugeridas])

  function handleNext() {
    if (!nombre.trim()) { setError('Poné un nombre para el presupuesto.'); return }
    if (!monto || monto <= 0) { setError('El monto tiene que ser mayor a 0.'); return }
    setError(null)
    setStep(2)
  }

  function handleSelectCat(cat) {
    setCategoriaId(cat.id)
    setIcono(cat.icono)
    setCrearNueva(false)
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!categoriaId && !crearNueva) {
      setError('Elegí o creá una categoría.')
      return
    }
    setCargando(true)
    try {
      await onSubmit({
        categoria_id: categoriaId || null,
        limite_monto: Number(monto),
        alerta_pct:   Number(alertaPct),
        periodo: 'mensual',
        mes:  hoy.getMonth() + 1,
        anio: hoy.getFullYear(),
        // For creating new category if needed
        _crearCategoria: crearNueva ? { nombre: nombre.trim(), icono, tipo: 'gasto' } : null,
      })
    } catch (err) { setError(err.message); setCargando(false) }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      {step === 1 && (
        <>
          {/* Step 1: Nombre + Monto */}
          <Input
            label="¿Para qué es el presupuesto?"
            placeholder="Ej: Compras del super, Nafta, Salidas..."
            value={nombre}
            onChange={e => setNombre(e.target.value)}
            autoFocus
            required
          />

          <Input
            label="Límite mensual"
            type="number"
            inputMode="decimal"
            step="0.01"
            min="1"
            prefijo="$"
            placeholder="0.00"
            value={monto}
            onChange={e => setMonto(e.target.value)}
            required
          />

          {/* Emoji suggester basado en el nombre */}
          {nombre.trim().length >= 2 && (
            <EmojiSuggester
              texto={nombre}
              valor={icono}
              onChange={setIcono}
              label="Elegí un ícono para este presupuesto"
            />
          )}

          {error && (
            <p className="text-xs text-red-500 bg-red-50 dark:bg-red-900/20 rounded-xl px-3 py-2
              border border-red-100 dark:border-red-900">{error}</p>
          )}

          <div className="flex gap-3 mt-2">
            <Button type="button" variante="secondary" className="flex-1"
              onClick={onCancel}>Cancelar</Button>
            <Button type="button" className="flex-1" onClick={handleNext}>
              Siguiente →
            </Button>
          </div>
        </>
      )}

      {step === 2 && (
        <>
          {/* Step 2: Category association */}
          <div className="text-center p-4 rounded-[18px] bg-zinc-50 dark:bg-zinc-800/50
            border border-zinc-100 dark:border-zinc-800">
            <span className="text-3xl">{icono || '📋'}</span>
            <p className="font-bold text-sm mt-2 text-zinc-800 dark:text-white font-display">{nombre}</p>
            <p className="text-xs text-zinc-400 mt-1">Límite: ${Number(monto).toLocaleString('es-AR')}/mes</p>
          </div>

          <p className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">
            ¿A qué categoría pertenece?
          </p>

          {/* Categorías sugeridas */}
          {catSugeridas.length > 0 && (
            <div className="space-y-2">
              <p className="text-[10px] font-bold text-[var(--mango-dark)] dark:text-[var(--mango)] uppercase tracking-wider">
                Sugeridas
              </p>
              {catSugeridas.map(cat => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => handleSelectCat(cat)}
                  className={`w-full flex items-center gap-3 p-3 rounded-[14px] transition-all press-scale
                    ${categoriaId === cat.id && !crearNueva
                      ? 'bg-[var(--mango)]/10 border-2 border-[var(--mango)] shadow-sm'
                      : 'bg-white dark:bg-zinc-800/50 border-2 border-transparent hover:border-zinc-200 dark:hover:border-zinc-700'
                    }`}
                >
                  <span className="text-xl">{cat.icono}</span>
                  <span className="text-sm font-semibold text-zinc-700 dark:text-zinc-200">{cat.nombre}</span>
                  {categoriaId === cat.id && !crearNueva && (
                    <span className="ml-auto text-[var(--mango)] font-bold text-sm">✓</span>
                  )}
                </button>
              ))}
            </div>
          )}

          {/* Todas las categorías */}
          <details className="group">
            <summary className="text-xs font-semibold text-zinc-400 cursor-pointer
              hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors list-none
              flex items-center gap-1">
              <span className="group-open:rotate-90 transition-transform">▶</span>
              Ver todas las categorías ({categorias.length})
            </summary>
            <div className="mt-2 grid grid-cols-2 gap-2">
              {categorias.map(cat => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => handleSelectCat(cat)}
                  className={`flex items-center gap-2 p-2.5 rounded-[12px] transition-all text-left
                    ${categoriaId === cat.id && !crearNueva
                      ? 'bg-[var(--mango)]/10 border-2 border-[var(--mango)]'
                      : 'bg-zinc-50 dark:bg-zinc-800/40 border-2 border-transparent hover:border-zinc-200 dark:hover:border-zinc-700'
                    }`}
                >
                  <span className="text-lg">{cat.icono}</span>
                  <span className="text-xs font-medium text-zinc-700 dark:text-zinc-300 truncate">{cat.nombre}</span>
                </button>
              ))}
            </div>
          </details>

          {/* Crear nueva categoría */}
          <button
            type="button"
            onClick={() => { setCrearNueva(true); setCategoriaId('') }}
            className={`w-full flex items-center justify-center gap-2 p-3 rounded-[14px]
              transition-all border-2 border-dashed
              ${crearNueva
                ? 'bg-emerald-50/80 dark:bg-emerald-900/10 border-emerald-300 dark:border-emerald-700 text-emerald-700 dark:text-emerald-400'
                : 'border-zinc-200 dark:border-zinc-700 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 hover:border-zinc-300'
              }`}
          >
            <span>➕</span>
            <span className="text-xs font-bold">
              {crearNueva
                ? `Crear nueva categoría "${nombre.trim()}"`
                : 'No encuentro la categoría, crear una nueva'}
            </span>
          </button>

          {/* Alert pct slider */}
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
              Alertarme al {alertaPct}% del límite
            </label>
            <input type="range" min="50" max="95" step="5" value={alertaPct}
              onChange={e => setAlertaPct(e.target.value)}
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
              onClick={() => setStep(1)}>← Volver</Button>
            <Button type="submit" className="flex-1" cargando={cargando}>
              {inicial ? 'Guardar cambios' : 'Crear límite'}
            </Button>
          </div>
        </>
      )}
    </form>
  )
}

// ─── Página principal ────────────────────────────────────────
export function PresupuestosView() {
  const { usuario } = useAuthContext()
  const {
    presupuestos,
    resumen,
    cargando,
    recargar,
    crear,
    desactivar
  } = usePresupuestos()
  const { gastos: categoriasGastos, agregar: agregarCategoria } = useCategorias()
  const plan = usuario?.plan || 'basico'

  const [modalNuevo, setModalNuevo] = useState(false)
  const [modalUpgrade, setModalUpgrade] = useState(false)
  const [errorLocal, setErrorLocal] = useState('')
  const handleAbrirModalNuevo = () => {
    if (plan === 'basico' && presupuestos.length >= 3) {
      setModalUpgrade(true)
      return
    }
    setModalNuevo(true)
  }

  async function handleGuardar(datos) {
    setErrorLocal('')

    let categoriaId = datos.categoria_id

    // Si el user quiere crear una nueva categoría
    if (datos._crearCategoria) {
      try {
        const nueva = await agregarCategoria(datos._crearCategoria)
        categoriaId = nueva.id
      } catch (err) {
        setErrorLocal('No se pudo crear la categoría: ' + err.message)
        return
      }
    }

    if (!categoriaId) {
      setErrorLocal('Elegí una categoría para este presupuesto.')
      return
    }

    // Validación: evitar duplicados
    const yaExiste = presupuestos.find(p => p.categoria_id === categoriaId)
    if (yaExiste) {
      setErrorLocal('Ya tenés un límite establecido para esta categoría.')
      return
    }

    try {
      await crear({
        categoria_id: categoriaId,
        limite_monto: datos.limite_monto,
        alerta_pct: datos.alerta_pct,
        periodo: datos.periodo,
        mes: datos.mes,
        anio: datos.anio,
        usuario_id: usuario.id,
      })
      setModalNuevo(false)
    } catch (err) {
      console.error(err)
      setErrorLocal(err.message || 'Hubo un error al guardar el presupuesto.')
    }
  }

  const subtitulo = cargando ? 'Cargando...'
    : resumen.excedidos > 0
      ? `Tenés ${resumen.excedidos} categoría${resumen.excedidos > 1 ? 's' : ''} en rojo 🚨`
      : resumen.alertas > 0
        ? `${resumen.alertas} presupuesto${resumen.alertas > 1 ? 's' : ''} en alerta ⚠️`
        : 'Todo bajo control este mes 😎'

  return (
    <>
      <div className="animate-in fade-in duration-500 w-full">
        <div className="flex justify-end mb-4">
          <Button icono="+" onClick={handleAbrirModalNuevo} className="shadow-sm shadow-amber-500/20">Nuevo Límite</Button>
        </div>

        {/* Summary pills */}
        {!cargando && presupuestos.length > 0 && (
          <div className="flex gap-3 mb-5 overflow-x-auto pb-1">
            <div className="flex-shrink-0 px-3 py-2 rounded-[14px]
              bg-emerald-50/80 dark:bg-emerald-900/10
              border border-emerald-100/60 dark:border-emerald-800/20">
              <p className="text-[9px] font-extrabold text-emerald-600 dark:text-emerald-400 uppercase">OK</p>
              <p className="text-lg font-black text-emerald-700 dark:text-emerald-400">{resumen.holgados}</p>
            </div>
            {resumen.alertas > 0 && (
              <div className="flex-shrink-0 px-3 py-2 rounded-[14px]
                bg-amber-50/80 dark:bg-amber-900/10
                border border-amber-100/60 dark:border-amber-800/20">
                <p className="text-[9px] font-extrabold text-amber-600 dark:text-amber-400 uppercase">Alerta</p>
                <p className="text-lg font-black text-amber-700 dark:text-amber-400">{resumen.alertas}</p>
              </div>
            )}
            {resumen.excedidos > 0 && (
              <div className="flex-shrink-0 px-3 py-2 rounded-[14px]
                bg-red-50/80 dark:bg-red-900/10
                border border-red-100/60 dark:border-red-800/20
                animate-pulse-subtle">
                <p className="text-[9px] font-extrabold text-red-600 dark:text-red-400 uppercase">Excedido</p>
                <p className="text-lg font-black text-red-600 dark:text-red-400">{resumen.excedidos}</p>
              </div>
            )}
          </div>
        )}

        {cargando ? (
           <Card className="mt-2">
             <div className="flex flex-col gap-4">
               {[1, 2, 3].map(i => <div key={i} className="h-20 animate-pulse bg-zinc-100 dark:bg-zinc-800 rounded-xl" />)}
             </div>
           </Card>
        ) : presupuestos.length === 0 ? (
          <Card className="mt-2 py-12">
            <EmptyState
              {...{
                icono: '📊',
                titulo: 'Sin presupuestos activos',
                descripcion: 'Poné límites a tus gastos y no te pases del presupuesto.',
              }}
              accion={<Button icono="+" onClick={handleAbrirModalNuevo}>Crear mi primer límite</Button>}
            />
          </Card>
        ) : (
          <Card className="mt-2">
            <div className="flex flex-col">
              {presupuestos.map(p => (
                <div key={p.id} className="relative group border-b last:border-0 border-zinc-100 dark:border-zinc-800/50">
                  <PresupCard presupuesto={p} />
                  <button
                    onClick={() => {
                      if(window.confirm(`¿Eliminar el límite de ${p.categoria_nombre}?`)) {
                        desactivar(p.id)
                      }
                    }}
                    className="absolute top-1/2 -translate-y-1/2 right-2 p-2
                      text-zinc-300 hover:text-red-500
                      opacity-0 group-hover:opacity-100 transition-opacity
                      bg-white dark:bg-[var(--dark-card)] rounded-full shadow-sm"
                    title="Eliminar"
                  >
                    🗑️
                  </button>
                </div>
              ))}
            </div>
          </Card>
        )}
      </div>

      <Modal abierto={modalNuevo} onCerrar={() => {setModalNuevo(false); setErrorLocal('');}} titulo="Definir nuevo límite" ancho="max-w-md">
        {errorLocal && (
          <div className="mb-4 bg-red-50 dark:bg-red-900/20 text-red-600 text-sm px-3 py-2 rounded-xl border border-red-100 dark:border-red-900/50">
            {errorLocal}
          </div>
        )}
        <FormPresupuesto
          categorias={categoriasGastos}
          onSubmit={handleGuardar}
          onCancel={() => setModalNuevo(false)}
        />
      </Modal>
      <ModalUpgrade
        abierto={modalUpgrade}
        onCerrar={() => setModalUpgrade(false)}
        feature="Crear presupuestos ilimitados"
      />
    </>
  )
}
