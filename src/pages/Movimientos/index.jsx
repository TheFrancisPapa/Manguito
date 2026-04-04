// src/pages/Movimientos/index.jsx
// Rediseñado siguiendo el design system de Stitch
// - Month selector pill
// - Filter tabs pill-shaped
// - Grupos por fecha
// - Cards con íconos circulares de color

import { useState, useMemo, useCallback } from 'react'
import { useAuthContext } from '../../context/AuthContext'
import { useMovimientos } from '../../hooks/useMovimientos'
import { PageWrapper, PageHeader, MovCard } from '../../components/layout'
import { Card, Button, EmptyState, EMPTY_STATES, Modal } from '../../components/ui'
import { FormMovimiento } from '../../components/forms/FormMovimiento'
import { formatMoneda } from '../../lib/utils'
import { descargarCSV } from '../../lib/exportUtils'

// ─── Tokens de color Stitch ──────────────────────────────────
const C = {
  primary:          '#725800',
  primaryContainer: '#f9c940',
  onPrimaryContainer:'#584300',
  tertiary:         '#436500',
  error:            '#d32f2f',
  background:       '#fdfaf2',
  surfaceContainer: '#f4f1e8',
  onSurface:        '#2f2f2f',
  onSurfaceVariant: '#5b5b5b',
  outline:          '#777777',
  surfaceVariant:   '#f1eee4',
}

// ─── Colores por categoría ────────────────────────────────────
function getCategoriaBg(icono) {
  const map = {
    '🍔': '#fff3e0', '🛒': '#fff8e1', '🚗': '#e3f2fd', '💊': '#fce4ec',
    '📚': '#f3e5f5', '🎬': '#ede7f6', '🏠': '#e8f5e9', '💻': '#e0f2f1',
    '💰': '#e8f5e9', '💸': '#ffebee', '🎵': '#f8bbd0', '✈️': '#e1f5fe',
  }
  return map[icono] ?? '#f5f5f5'
}

// ─── Helpers ──────────────────────────────────────────────────
function getNombreMes(fecha) {
  const [anio, mes] = fecha.split('-')
  return new Date(anio, mes - 1).toLocaleDateString('es-AR', { month: 'long', year: 'numeric' })
}

function agruparPorFecha(movimientos) {
  const hoy = new Date().toLocaleDateString('sv-SE')
  const ayer = new Date(Date.now() - 86400000).toLocaleDateString('sv-SE')

  return movimientos.reduce((grupos, mov) => {
    let key
    if (mov.fecha === hoy) key = 'Hoy'
    else if (mov.fecha === ayer) key = 'Ayer'
    else {
      const d = new Date(mov.fecha + 'T00:00:00')
      key = d.toLocaleDateString('es-AR', { day: 'numeric', month: 'long' })
    }
    if (!grupos[key]) grupos[key] = []
    grupos[key].push(mov)
    return grupos
  }, {})
}

// ─── Item de movimiento estilo Stitch ─────────────────────────
function MovimientoItem({ movimiento, onClick }) {
  const { tipo, monto, descripcion, fecha, categorias: cat } = movimiento
  const esIngreso = tipo === 'ingreso'
  const icono = cat?.icono ?? '📦'
  const bg = getCategoriaBg(icono)

  return (
    <div
      onClick={onClick}
      className="flex items-center justify-between bg-white p-4 rounded-2xl shadow-sm border cursor-pointer transition-all hover:shadow-md active:scale-[0.98]"
      style={{ borderColor: C.surfaceVariant }}
    >
      <div className="flex items-center gap-4">
        {/* Ícono circular */}
        <div
          className="w-11 h-11 rounded-full flex items-center justify-center text-xl flex-shrink-0"
          style={{ backgroundColor: bg }}
        >
          {icono}
        </div>
        <div>
          <p className="font-bold text-sm leading-tight" style={{ color: C.onSurface }}>
            {descripcion || cat?.nombre || 'Movimiento'}
          </p>
          <p className="text-[11px] font-medium mt-0.5" style={{ color: C.outline }}>
            {cat?.nombre}
          </p>
        </div>
      </div>
      <p
        className="font-bold text-sm"
        style={{ color: esIngreso ? C.tertiary : C.error }}
      >
        {esIngreso ? '+' : '-'}{formatMoneda(monto, 'ARS', false)}
      </p>
    </div>
  )
}

// ─── Página principal ─────────────────────────────────────────
export function MovimientosPage() {
  const { usuario } = useAuthContext()

  // Estado del mes actual (navegable)
  const [mesOffset, setMesOffset] = useState(0)
  const [filtroActivo, setFiltroActivo] = useState('todos')
  const [modalNuevo, setModalNuevo] = useState(false)
  const [modalEditar, setModalEditar] = useState(false)
  const [movSeleccionado, setMovSeleccionado] = useState(null)

  // Rango del mes seleccionado
  const { desde, hasta, nombreMes } = useMemo(() => {
    const hoy = new Date()
    const d = new Date(hoy.getFullYear(), hoy.getMonth() + mesOffset, 1)
    const desde = d.toLocaleDateString('sv-SE')
    const hasta = mesOffset === 0
      ? hoy.toLocaleDateString('sv-SE')
      : new Date(d.getFullYear(), d.getMonth() + 1, 0).toLocaleDateString('sv-SE')
    const nombreMes = d.toLocaleDateString('es-AR', { month: 'long', year: 'numeric' })
    return { desde, hasta, nombreMes }
  }, [mesOffset])

  const { movimientos, cargando, agregar, editar, borrar } = useMovimientos({ desde, hasta })

  // Filtrar por tipo
  const movimientosFiltrados = movimientos.filter(m => {
    if (filtroActivo === 'todos') return true
    return m.tipo === filtroActivo
  })

  // Agrupar por fecha
  const movimientosAgrupados = useMemo(
    () => agruparPorFecha(movimientosFiltrados),
    [movimientosFiltrados]
  )

  // Totales
  const totalIngresos = movimientosFiltrados
    .filter(m => m.tipo === 'ingreso')
    .reduce((s, m) => s + Number(m.monto), 0)
  const totalGastos = movimientosFiltrados
    .filter(m => m.tipo === 'gasto')
    .reduce((s, m) => s + Number(m.monto), 0)

  const resetModals = useCallback(() => {
    setModalNuevo(false)
    setModalEditar(false)
    setMovSeleccionado(null)
  }, [])

  const handleEliminar = async () => {
    if (!movSeleccionado) return
    if (window.confirm(`¿Eliminás este movimiento?`)) {
      await borrar(movSeleccionado.id)
      resetModals()
    }
  }

  const handleGuardar = async (datos) => {
    await agregar({ ...datos, usuario_id: usuario.id })
    setModalNuevo(false)
  }

  const handleEditarSubmit = async (datos) => {
    await editar(movSeleccionado.id, datos)
    resetModals()
  }

  return (
    <div
      className="animate-in fade-in duration-500 min-h-screen"
      style={{ backgroundColor: C.background }}
    >
      {/* ── Header fijo ── */}
      <header
        className="fixed top-0 w-full z-50 backdrop-blur-md border-b"
        style={{
          backgroundColor: `${C.background}cc`,
          borderColor: C.surfaceVariant,
        }}
      >
        <div className="flex items-center justify-between px-4 h-16 max-w-md mx-auto">
          <div className="w-10" /> {/* Spacer */}
          <h1
            className="font-bold text-lg"
            style={{ color: C.onSurface, fontFamily: 'Montserrat, sans-serif' }}
          >
            Movimientos
          </h1>
          <button
            onClick={() => descargarCSV(movimientosFiltrados)}
            className="w-10 h-10 flex items-center justify-center rounded-full transition-colors active:scale-90"
            style={{ color: C.outline }}
            title="Exportar CSV"
          >
            📥
          </button>
        </div>
      </header>

      <main className="pt-20 pb-28 px-4 max-w-md mx-auto space-y-5">

        {/* ── Selector de mes (pill) ── */}
        <section>
          <div
            className="flex items-center justify-between p-2 rounded-full border"
            style={{
              backgroundColor: 'rgba(255,255,255,0.5)',
              borderColor: C.surfaceVariant,
            }}
          >
            <button
              onClick={() => setMesOffset(o => o - 1)}
              className="p-2 rounded-full transition-colors active:scale-90"
              style={{ color: C.onSurface }}
            >
              ‹
            </button>
            <span
              className="font-bold text-sm capitalize"
              style={{ color: C.onSurface, fontFamily: 'Montserrat, sans-serif' }}
            >
              {nombreMes}
            </span>
            <button
              onClick={() => setMesOffset(o => Math.min(o + 1, 0))}
              className="p-2 rounded-full transition-colors active:scale-90"
              style={{ color: mesOffset >= 0 ? '#ccc' : C.onSurface }}
              disabled={mesOffset >= 0}
            >
              ›
            </button>
          </div>
        </section>

        {/* ── Resumen del período ── */}
        {!cargando && movimientos.length > 0 && (
          <div className="grid grid-cols-2 gap-3">
            <div
              className="p-4 rounded-2xl"
              style={{ backgroundColor: '#e8f5e9' }}
            >
              <p className="text-[10px] font-black uppercase tracking-wider" style={{ color: C.tertiary }}>
                Ingresos
              </p>
              <p className="text-lg font-black mt-1" style={{ color: C.tertiary, fontFamily: 'Montserrat, sans-serif' }}>
                {formatMoneda(totalIngresos, 'ARS', false)}
              </p>
            </div>
            <div
              className="p-4 rounded-2xl"
              style={{ backgroundColor: '#ffebee' }}
            >
              <p className="text-[10px] font-black uppercase tracking-wider" style={{ color: C.error }}>
                Gastos
              </p>
              <p className="text-lg font-black mt-1" style={{ color: C.error, fontFamily: 'Montserrat, sans-serif' }}>
                {formatMoneda(totalGastos, 'ARS', false)}
              </p>
            </div>
          </div>
        )}

        {/* ── Tabs de filtro (pill) ── */}
        <section>
          <div
            className="flex p-1 rounded-full gap-1"
            style={{ backgroundColor: C.surfaceContainer }}
          >
            {[
              { id: 'todos', label: 'Total' },
              { id: 'ingreso', label: 'Ingresos' },
              { id: 'gasto', label: 'Gastos' },
            ].map(f => (
              <button
                key={f.id}
                onClick={() => setFiltroActivo(f.id)}
                className="flex-1 py-2.5 rounded-full font-semibold text-sm transition-all"
                style={{
                  backgroundColor: filtroActivo === f.id ? 'white' : 'transparent',
                  color: filtroActivo === f.id ? C.onSurface : C.onSurfaceVariant,
                  boxShadow: filtroActivo === f.id ? '0 1px 4px rgba(0,0,0,0.1)' : 'none',
                  fontWeight: filtroActivo === f.id ? 700 : 500,
                }}
              >
                {f.label}
              </button>
            ))}
          </div>
        </section>

        {/* ── Lista de movimientos agrupados ── */}
        {cargando ? (
          <div className="space-y-3">
            {[0, 1, 2, 3].map(i => (
              <div
                key={i}
                className="h-16 rounded-2xl animate-pulse"
                style={{ backgroundColor: C.surfaceContainer }}
              />
            ))}
          </div>
        ) : movimientosFiltrados.length === 0 ? (
          <div
            className="flex flex-col items-center py-16 rounded-2xl border-2 border-dashed"
            style={{ borderColor: '#e0d9c8' }}
          >
            <span className="text-4xl mb-3">💸</span>
            <p className="font-bold text-sm" style={{ color: C.outline }}>
              {filtroActivo === 'todos'
                ? 'Sin movimientos este período'
                : `Sin ${filtroActivo === 'ingreso' ? 'ingresos' : 'gastos'}`}
            </p>
            {filtroActivo === 'todos' && (
              <button
                onClick={() => setModalNuevo(true)}
                className="mt-4 px-5 py-2 rounded-full text-sm font-bold transition-all active:scale-95"
                style={{ backgroundColor: C.primaryContainer, color: C.onPrimaryContainer }}
              >
                + Registrar movimiento
              </button>
            )}
          </div>
        ) : (
          <section className="space-y-8">
            {Object.entries(movimientosAgrupados).map(([fecha, movs]) => (
              <div key={fecha} className="space-y-3">
                <h3
                  className="text-[10px] font-black uppercase tracking-widest px-1"
                  style={{ color: C.outline }}
                >
                  {fecha}
                </h3>
                <div className="space-y-2">
                  {movs.map(m => (
                    <MovimientoItem
                      key={m.id}
                      movimiento={m}
                      onClick={() => setMovSeleccionado(m)}
                    />
                  ))}
                </div>
              </div>
            ))}
          </section>
        )}
      </main>

      {/* ── FAB ── */}
      <button
        onClick={() => setModalNuevo(true)}
        className="fixed bottom-24 right-6 w-14 h-14 rounded-full shadow-lg flex items-center justify-center active:scale-90 transition-transform z-50"
        style={{
          backgroundColor: C.primaryContainer,
          color: C.onPrimaryContainer,
          boxShadow: `0 8px 24px ${C.primaryContainer}80`,
        }}
        aria-label="Agregar movimiento"
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" strokeWidth="2.8" strokeLinecap="round">
          <line x1="12" y1="4" x2="12" y2="20" />
          <line x1="4" y1="12" x2="20" y2="12" />
        </svg>
      </button>

      {/* ── Modal unificado ── */}
      <Modal
        abierto={modalNuevo || modalEditar || !!movSeleccionado}
        onCerrar={resetModals}
        titulo={modalNuevo ? 'Nuevo movimiento' : modalEditar ? 'Editar movimiento' : 'Detalle'}
      >
        {modalNuevo && (
          <FormMovimiento onSubmit={handleGuardar} onCancel={() => setModalNuevo(false)} />
        )}
        {modalEditar && movSeleccionado && (
          <FormMovimiento
            valoresIniciales={movSeleccionado}
            onSubmit={handleEditarSubmit}
            onCancel={() => setModalEditar(false)}
          />
        )}
        {(!modalNuevo && !modalEditar && movSeleccionado) && (
          <div className="flex flex-col gap-6 animate-in slide-in-from-bottom-4 fade-in duration-300">
            <div
              className="text-center p-6 rounded-2xl"
              style={{ backgroundColor: C.surfaceContainer }}
            >
              <div
                className="w-16 h-16 mx-auto rounded-full flex items-center justify-center mb-4 text-3xl"
                style={{ backgroundColor: getCategoriaBg(movSeleccionado.categorias?.icono) }}
              >
                {movSeleccionado.categorias?.icono ?? '📦'}
              </div>
              <p className="text-sm font-bold" style={{ color: C.outline }}>
                {movSeleccionado.categorias?.nombre}
              </p>
              <h2
                className="text-3xl font-black mt-2"
                style={{
                  fontFamily: 'Montserrat, sans-serif',
                  color: movSeleccionado.tipo === 'ingreso' ? C.tertiary : C.error,
                }}
              >
                {movSeleccionado.tipo === 'ingreso' ? '+' : '-'}
                {formatMoneda(movSeleccionado.monto, usuario?.moneda, true)}
              </h2>
              <p className="text-sm mt-2" style={{ color: C.outline }}>
                {new Date(movSeleccionado.fecha + 'T00:00:00').toLocaleDateString('es-AR', {
                  weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
                })}
              </p>
            </div>

            {movSeleccionado.descripcion && (
              <p
                className="text-sm px-4 py-3 rounded-2xl"
                style={{ backgroundColor: C.surfaceContainer, color: C.onSurface }}
              >
                {movSeleccionado.descripcion}
              </p>
            )}

            <div className="flex gap-3">
              <button
                onClick={() => setMovSeleccionado(null)}
                className="flex-1 py-3 rounded-full font-bold text-sm border transition-all active:scale-95"
                style={{ borderColor: C.surfaceVariant, color: C.outline }}
              >
                Cerrar
              </button>
              <button
                onClick={() => setModalEditar(true)}
                className="flex-1 py-3 rounded-full font-bold text-sm transition-all active:scale-95"
                style={{ backgroundColor: C.primaryContainer, color: C.onPrimaryContainer }}
              >
                Editar
              </button>
              <button
                onClick={handleEliminar}
                className="flex-1 py-3 rounded-full font-bold text-sm transition-all active:scale-95"
                style={{ backgroundColor: '#ffebee', color: C.error }}
              >
                Eliminar
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}