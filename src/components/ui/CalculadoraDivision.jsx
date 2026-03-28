// src/components/ui/CalculadoraDivision.jsx
// Mini calculadora para dividir gastos entre personas.
// Standalone - puede usarse en cualquier contexto.

import { useState, useMemo } from 'react'

const fmt = (n) => `$${Number(n).toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`

export function CalculadoraDivision({ onRegistrarDeuda }) {
  const [total,    setTotal]    = useState('')
  const [personas, setPersonas] = useState([
    { nombre: 'Yo', pago: false, excluir: false },
    { nombre: '',   pago: false, excluir: false },
  ])
  const [pagador, setPagador]  = useState(0)   // índice de quien pagó
  const [resultado, setResultado] = useState(null)

  const agregarPersona = () => {
    setPersonas(prev => [...prev, { nombre: '', pago: false, excluir: false }])
  }

  const actualizarPersona = (idx, campo, valor) => {
    setPersonas(prev => prev.map((p, i) => i === idx ? { ...p, [campo]: valor } : p))
  }

  const eliminarPersona = (idx) => {
    if (personas.length <= 2) return
    setPersonas(prev => prev.filter((_, i) => i !== idx))
    if (pagador >= idx && pagador > 0) setPagador(p => p - 1)
  }

  const calcular = () => {
    const montoTotal = parseFloat(total)
    if (!montoTotal || montoTotal <= 0) return

    const activas = personas.filter((p, i) => !p.excluir)
    const porPersona = montoTotal / activas.length

    const deudas = activas
      .map((p, i) => {
        const idxOriginal = personas.findIndex((pp, ii) => !pp.excluir && ii === personas.indexOf(activas[i]))
        return {
          nombre: p.nombre || `Persona ${i + 1}`,
          debe: personas.indexOf(p) === pagador ? 0 : porPersona,
          esPagador: personas.indexOf(p) === pagador,
        }
      })

    setResultado({
      total: montoTotal,
      porPersona,
      pagador: personas[pagador]?.nombre || `Persona ${pagador + 1}`,
      deudas,
    })
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Total */}
      <div className="flex flex-col gap-1">
        <label className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
          Total a dividir
        </label>
        <div className="relative flex items-center">
          <span className="absolute left-3 text-zinc-400 text-sm">$</span>
          <input
            type="number"
            inputMode="decimal"
            value={total}
            onChange={e => setTotal(e.target.value)}
            placeholder="0.00"
            className="w-full bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700
              rounded-xl pl-8 pr-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--mango)]/40
              text-zinc-900 dark:text-white placeholder:text-zinc-400"
          />
        </div>
      </div>

      {/* Personas */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
            Personas ({personas.filter(p => !p.excluir).length} que pagan)
          </label>
          <button
            onClick={agregarPersona}
            className="text-xs font-bold text-[var(--mango-dark)] dark:text-[var(--mango)] hover:underline"
          >
            + Agregar
          </button>
        </div>
        <div className="flex flex-col gap-2">
          {personas.map((p, idx) => (
            <div key={idx} className="flex items-center gap-2">
              <input
                type="text"
                value={p.nombre}
                onChange={e => actualizarPersona(idx, 'nombre', e.target.value)}
                placeholder={`Persona ${idx + 1}`}
                className="flex-1 bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700
                  rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--mango)]/40
                  text-zinc-900 dark:text-white placeholder:text-zinc-400"
              />
              {/* Marcador: quien pagó */}
              <button
                onClick={() => setPagador(idx)}
                title="Marcar como quien pagó"
                className={`w-8 h-8 rounded-lg text-sm flex items-center justify-center transition-all ${
                  pagador === idx
                    ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400'
                    : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-400 hover:bg-zinc-200'
                }`}
              >
                💳
              </button>
              {/* Excluir */}
              <button
                onClick={() => actualizarPersona(idx, 'excluir', !p.excluir)}
                title={p.excluir ? 'Incluir' : 'Excluir del pago'}
                className={`w-8 h-8 rounded-lg text-sm flex items-center justify-center transition-all ${
                  p.excluir
                    ? 'bg-red-100 dark:bg-red-900/30 text-red-500'
                    : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-400 hover:bg-zinc-200'
                }`}
              >
                {p.excluir ? '✕' : '✓'}
              </button>
              {/* Eliminar */}
              {personas.length > 2 && (
                <button
                  onClick={() => eliminarPersona(idx)}
                  className="w-8 h-8 rounded-lg text-sm flex items-center justify-center
                    bg-zinc-100 dark:bg-zinc-800 text-zinc-400 hover:text-red-500 hover:bg-red-50
                    dark:hover:bg-red-900/20 transition-all"
                >
                  🗑️
                </button>
              )}
            </div>
          ))}
        </div>
        <p className="text-[10px] text-zinc-400 mt-1.5 px-1">
          💳 = quien pagó · ✓/✕ = incluir/excluir del pago
        </p>
      </div>

      <button
        onClick={calcular}
        disabled={!total || parseFloat(total) <= 0}
        className="w-full py-3 rounded-xl text-sm font-bold
          bg-gradient-to-r from-[var(--mango)] to-[var(--mango-dark)]
          text-[var(--charcoal)] hover:opacity-90 active:scale-[0.98] transition-all
          disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Calcular división
      </button>

      {/* Resultado */}
      {resultado && (
        <div className="flex flex-col gap-2 pt-2 border-t border-zinc-100 dark:border-zinc-800">
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
              Resultado
            </p>
            <p className="text-xs text-zinc-400">
              {fmt(resultado.porPersona)} por persona
            </p>
          </div>

          {resultado.deudas.map((d, i) => (
            <div key={i}
              className={`flex items-center justify-between px-3 py-2.5 rounded-xl ${
                d.esPagador
                  ? 'bg-emerald-50 dark:bg-emerald-900/15 border border-emerald-200 dark:border-emerald-800/40'
                  : 'bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-100 dark:border-zinc-800'
              }`}>
              <div className="flex items-center gap-2">
                <span className="text-base">{d.esPagador ? '💳' : '👤'}</span>
                <p className="text-sm font-semibold text-zinc-800 dark:text-zinc-100">
                  {d.nombre}
                </p>
                {d.esPagador && (
                  <span className="text-[9px] bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600
                    px-1.5 py-0.5 rounded-full font-bold">
                    pagó
                  </span>
                )}
              </div>
              {d.esPagador ? (
                <p className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
                  +{fmt(resultado.total - resultado.porPersona)}
                </p>
              ) : (
                <div className="flex items-center gap-2">
                  <p className="text-sm font-bold text-red-600 dark:text-red-400">
                    -{fmt(d.debe)}
                  </p>
                  {onRegistrarDeuda && (
                    <button
                      onClick={() => onRegistrarDeuda(d.nombre, d.debe, resultado.pagador)}
                      className="text-[10px] bg-zinc-100 dark:bg-zinc-700 text-zinc-600 dark:text-zinc-300
                        px-2 py-1 rounded-lg font-medium hover:bg-zinc-200 dark:hover:bg-zinc-600 transition-colors"
                    >
                      📝 Anotar
                    </button>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}