// src/pages/Movimientos/index.jsx
// Redesign v3 — Uses PageWrapper, full dark mode, iOS aesthetics

import { useState, useMemo, useCallback } from 'react'
import { useAuthContext } from '../../context/AuthContext'
import { useMovimientos } from '../../hooks/useMovimientos'
import { PageWrapper, PageHeader } from '../../components/layout'
import { Button, Modal } from '../../components/ui'
import { FormMovimiento } from '../../components/forms/FormMovimiento'
import { formatMoneda } from '../../lib/utils'
import { descargarCSV } from '../../lib/exportUtils'

// ─── Colores por categoría ────────────────────────────────────
function getCategoriaBg(icono) {
  const map = {
    '🍔': '#fff3e0', '🛒': '#fff8e1', '🚗': '#e3f2fd', '💊': '#fce4ec',
    '📚': '#f3e5f5', '🎬': '#ede7f6', '🏠': '#e8f5e9', '💻': '#e0f2f1',
    '💰': '#e8f5e9', '💸': '#ffebee', '🎵': '#f8bbd0', '✈️': '#e1f5fe',
  }
  return map[icono] ?? 'rgba(245,166,35,0.1)'
}

function getCategoriaBgDark(icono) {
  const map = {
    '🍔': 'rgba(255,152,0,0.12)', '🛒': 'rgba(255,193,7,0.12)', '🚗': 'rgba(33,150,243,0.12)',
    '💊': 'rgba(233,30,99,0.12)', '📚': 'rgba(156,39,176,0.12)', '🎬': 'rgba(103,58,183,0.12)',
    '🏠': 'rgba(76,175,80,0.12)', '💻': 'rgba(0,150,136,0.12)', '💰': 'rgba(76,175,80,0.12)',
    '💸': 'rgba(244,67,54,0.12)', '🎵': 'rgba(233,30,99,0.12)', '✈️': 'rgba(3,169,244,0.12)',
  }
  return map[icono] ?? 'rgba(245,166,35,0.08)'
}

// ─── Helpers ──────────────────────────────────────────────────
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

// ─── Item de movimiento ───────────────────────────────────────
function MovimientoItem({ movimiento, onClick, delay = 0 }) {
  const { tipo, monto, descripcion, categorias: cat } = movimiento
  const esIngreso = tipo === 'ingreso'
  const icono = cat?.icono ?? '📦'

  return (
    <div
      onClick={onClick}
      className="flex items-center justify-between
        bg-white dark:bg-[var(--dark-card)]
        p-4 rounded-[18px]
        shadow-[var(--shadow-xs)]
        border border-zinc-100/60 dark:border-[var(--dark-border)]
        cursor-pointer transition-all
        hover:shadow-[var(--shadow-sm)] hover:border-[var(--mango)]/15
        active:scale-[0.98] press-scale
        animate-stagger opacity-0"
      style={{ animationDelay: `${delay}ms`, animationFillMode: 'forwards' }}
    >
      <div className="flex items-center gap-3.5">
        <div
          className="w-11 h-11 rounded-full flex items-center justify-center text-xl flex-shrink-0"
          style={{ backgroundColor: `var(--cat-bg, ${getCategoriaBg(icono)})` }}
        >
          <span className="[.dark_&]:hidden">{icono}</span>
          <span className="hidden [.dark_&]:inline">{icono}</span>
        </div>
        <div>
          <p className="font-bold text-sm leading-tight text-zinc-800 dark:text-white">
            {descripcion || cat?.nombre || 'Movimiento'}
          </p>
          <p className="text-[11px] font-medium mt-0.5 text-zinc-400 dark:text-zinc-500">
            {cat?.nombre}
          </p>
        </div>
      </div>
      <p className={`font-black text-sm font-mono-num ${
        esIngreso
          ? 'text-emerald-600 dark:text-emerald-400'
          : 'text-red-500 dark:text-red-400'
      }`}>
        {esIngreso ? '+' : '-'}{formatMoneda(monto, 'ARS', false)}
      </p>
    </div>
  )
}

// ─── Página principal ─────────────────────────────────────────
export function MovimientosPage() {
  const { usuario } = useAuthContext()

  const [mesOffset, setMesOffset] = useState(0)
  const [filtroActivo, setFiltroActivo] = useState('todos')
  const [modalNuevo, setModalNuevo] = useState(false)
  const [modalEditar, setModalEditar] = useState(false)
  const [movSeleccionado, setMovSeleccionado] = useState(null)

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

  const movimientosFiltrados = movimientos.filter(m => {
    if (filtroActivo === 'todos') return true
    return m.tipo === filtroActivo
  })

  const movimientosAgrupados = useMemo(
    () => agruparPorFecha(movimientosFiltrados),
    [movimientosFiltrados]
  )

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
    <div className="animate-in fade-in duration-500">
      <PageWrapper>
        <PageHeader
          titulo="Movimientos"
          subtitulo={`${nombreMes} · ${movimientosFiltrados.length} registros`}
          accion={
            <div className="flex gap-2">
              <Button
                variante="ghost"
                tamaño="sm"
                onClick={() => descargarCSV(movimientosFiltrados)}
                icono="📥"
              />
              <Button
                icono="+"
                onClick={() => setModalNuevo(true)}
                className="shadow-sm shadow-amber-500/20"
              >
                Nuevo
              </Button>
            </div>
          }
        />

        {/* ── Month selector ── */}
        <div className="flex items-center justify-between p-2 rounded-full
          bg-white/60 dark:bg-zinc-800/40
          border border-zinc-100/60 dark:border-zinc-800
          mb-5">
          <button
            onClick={() => setMesOffset(o => o - 1)}
            className="w-9 h-9 rounded-full flex items-center justify-center
              text-zinc-600 dark:text-zinc-300
              hover:bg-zinc-100 dark:hover:bg-zinc-700
              active:scale-90 transition-all text-lg font-bold"
          >
            ‹
          </button>
          <span className="font-bold text-sm capitalize text-zinc-800 dark:text-white font-display">
            {nombreMes}
          </span>
          <button
            onClick={() => setMesOffset(o => Math.min(o + 1, 0))}
            className={`w-9 h-9 rounded-full flex items-center justify-center
              active:scale-90 transition-all text-lg font-bold ${
              mesOffset >= 0
                ? 'text-zinc-300 dark:text-zinc-600 cursor-not-allowed'
                : 'text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-700'
            }`}
            disabled={mesOffset >= 0}
          >
            ›
          </button>
        </div>

        {/* ── Period Summary ── */}
        {!cargando && movimientos.length > 0 && (
          <div className="grid grid-cols-2 gap-3 mb-5">
            <div className="p-4 rounded-[18px]
              bg-emerald-50/80 dark:bg-emerald-900/10
              border border-emerald-100/60 dark:border-emerald-800/20">
              <p className="text-[10px] font-extrabold uppercase tracking-[0.1em]
                text-emerald-700 dark:text-emerald-400">
                Ingresos
              </p>
              <p className="text-lg font-black mt-1 font-mono-num
                text-emerald-700 dark:text-emerald-400">
                {formatMoneda(totalIngresos, 'ARS', false)}
              </p>
            </div>
            <div className="p-4 rounded-[18px]
              bg-red-50/80 dark:bg-red-900/10
              border border-red-100/60 dark:border-red-800/20">
              <p className="text-[10px] font-extrabold uppercase tracking-[0.1em]
                text-red-600 dark:text-red-400">
                Gastos
              </p>
              <p className="text-lg font-black mt-1 font-mono-num
                text-red-600 dark:text-red-400">
                {formatMoneda(totalGastos, 'ARS', false)}
              </p>
            </div>
          </div>
        )}

        {/* ── Filter Tabs ── */}
        <div className="flex p-1 rounded-full gap-1 mb-5
          bg-zinc-100/80 dark:bg-zinc-800/50">
          {[
            { id: 'todos', label: 'Total' },
            { id: 'ingreso', label: 'Ingresos' },
            { id: 'gasto', label: 'Gastos' },
          ].map(f => (
            <button
              key={f.id}
              onClick={() => setFiltroActivo(f.id)}
              className={`flex-1 py-2.5 rounded-full text-sm transition-all font-display press-scale ${
                filtroActivo === f.id
                  ? 'bg-white dark:bg-zinc-700 text-zinc-800 dark:text-white font-bold shadow-[var(--shadow-xs)]'
                  : 'text-zinc-400 dark:text-zinc-500 font-medium'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* ── Movement List ── */}
        {cargando ? (
          <div className="space-y-3">
            {[0, 1, 2, 3].map(i => (
              <div key={i} className="h-16 rounded-[18px] animate-pulse
                bg-zinc-100 dark:bg-zinc-800" />
            ))}
          </div>
        ) : movimientosFiltrados.length === 0 ? (
          <div className="flex flex-col items-center py-16 rounded-[20px]
            border-2 border-dashed border-zinc-200 dark:border-zinc-700">
            <span className="text-4xl mb-3">💸</span>
            <p className="font-bold text-sm text-zinc-500 dark:text-zinc-400">
              {filtroActivo === 'todos'
                ? 'Sin movimientos este período'
                : `Sin ${filtroActivo === 'ingreso' ? 'ingresos' : 'gastos'}`}
            </p>
            {filtroActivo === 'todos' && (
              <Button
                icono="+"
                onClick={() => setModalNuevo(true)}
                className="mt-4"
              >
                Registrar movimiento
              </Button>
            )}
          </div>
        ) : (
          <section className="space-y-6">
            {Object.entries(movimientosAgrupados).map(([fecha, movs]) => (
              <div key={fecha} className="space-y-2.5">
                <h3 className="text-[10px] font-extrabold uppercase tracking-[0.12em]
                  text-zinc-400 dark:text-zinc-500 px-1">
                  {fecha}
                </h3>
                <div className="space-y-2">
                  {movs.map((m, i) => (
                    <MovimientoItem
                      key={m.id}
                      movimiento={m}
                      onClick={() => setMovSeleccionado(m)}
                      delay={i * 40}
                    />
                  ))}
                </div>
              </div>
            ))}
          </section>
        )}

        {/* Extra bottom padding for bottom nav */}
        <div className="h-4" />
      </PageWrapper>

      {/* ── FAB ── */}
      <button
        onClick={() => setModalNuevo(true)}
        className="fixed bottom-24 right-6 w-14 h-14 rounded-full
          flex items-center justify-center
          active:scale-90 transition-transform z-30 press-scale md:hidden"
        style={{
          background: 'var(--gradient-mango)',
          boxShadow: '0 8px 24px rgba(245,166,35,0.45)',
        }}
        aria-label="Agregar movimiento"
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none"
          stroke="white" strokeWidth="2.8" strokeLinecap="round">
          <line x1="12" y1="4" x2="12" y2="20" />
          <line x1="4" y1="12" x2="20" y2="12" />
        </svg>
      </button>

      {/* ── Modal ── */}
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
          <div className="flex flex-col gap-5">
            <div className="text-center p-6 rounded-[18px]
              bg-zinc-50 dark:bg-zinc-800/50">
              <div
                className="w-16 h-16 mx-auto rounded-full flex items-center justify-center mb-4 text-3xl"
                style={{ backgroundColor: getCategoriaBg(movSeleccionado.categorias?.icono) }}
              >
                {movSeleccionado.categorias?.icono ?? '📦'}
              </div>
              <p className="text-sm font-bold text-zinc-500 dark:text-zinc-400">
                {movSeleccionado.categorias?.nombre}
              </p>
              <h2 className={`text-3xl font-black mt-2 font-mono-num ${
                movSeleccionado.tipo === 'ingreso'
                  ? 'text-emerald-600 dark:text-emerald-400'
                  : 'text-red-500 dark:text-red-400'
              }`}>
                {movSeleccionado.tipo === 'ingreso' ? '+' : '-'}
                {formatMoneda(movSeleccionado.monto, usuario?.moneda, true)}
              </h2>
              <p className="text-sm mt-2 text-zinc-400 dark:text-zinc-500">
                {new Date(movSeleccionado.fecha + 'T00:00:00').toLocaleDateString('es-AR', {
                  weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
                })}
              </p>
            </div>

            {movSeleccionado.descripcion && (
              <p className="text-sm px-4 py-3 rounded-[14px]
                bg-zinc-50 dark:bg-zinc-800/50
                text-zinc-700 dark:text-zinc-300">
                {movSeleccionado.descripcion}
              </p>
            )}

            <div className="flex gap-3">
              <Button
                variante="secondary"
                className="flex-1"
                onClick={() => setMovSeleccionado(null)}
              >
                Cerrar
              </Button>
              <Button
                className="flex-1"
                onClick={() => setModalEditar(true)}
              >
                Editar
              </Button>
              <Button
                variante="danger"
                className="flex-1"
                onClick={handleEliminar}
              >
                Eliminar
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}