// src/components/bento/BentoBrecha.jsx
// Widget de brecha cambiaria: MEP vs Tarjeta
// El "Modo Inflación" del documento — muestra cuál conviene usar

import { useState, useEffect } from 'react'
import { BentoCell, BentoLabel } from './BentoCell'

function fmtPrecio(n) {
  if (!n) return '—'
  return Number(n).toLocaleString('es-AR', { minimumFractionDigits: 0, maximumFractionDigits: 0 })
}

export function BentoBrecha() {
  const [data, setData] = useState({ mep: null, tarjeta: null, oficial: null })
  const [cargando, setCargando] = useState(true)

  useEffect(() => {
    async function cargar() {
      try {
        const [resDolares] = await Promise.all([
          fetch('https://dolarapi.com/v1/dolares'),
        ])
        const dolares = await resDolares.json()
        const mep     = dolares.find(d => d.casa === 'bolsa')
        const tarjeta = dolares.find(d => d.casa === 'tarjeta')
        const oficial = dolares.find(d => d.casa === 'oficial')
        setData({ mep, tarjeta, oficial })
      } catch {}
      finally { setCargando(false) }
    }
    cargar()
  }, [])

  const brecha = data.mep && data.tarjeta && data.tarjeta.venta > 0
    ? (((data.tarjeta.venta - data.mep.venta) / data.mep.venta) * 100)
    : null

  const conviene = brecha !== null
    ? (brecha > 0 ? 'MEP' : 'Tarjeta')
    : null

  if (cargando) {
    return (
      <BentoCell className="col-span-12 md:col-span-5 flex flex-col gap-2">
        <div className="h-3 w-24 rounded bg-zinc-100 dark:bg-zinc-800 animate-pulse" />
        <div className="h-8 w-32 rounded bg-zinc-100 dark:bg-zinc-800 animate-pulse" />
        <div className="h-3 w-40 rounded bg-zinc-100 dark:bg-zinc-800 animate-pulse" />
      </BentoCell>
    )
  }

  return (
    <BentoCell className="col-span-12 md:col-span-5 relative overflow-hidden">
      {/* Fondo decorativo */}
      <div className="absolute -right-4 -bottom-4 text-[80px] opacity-[0.04] select-none pointer-events-none">💱</div>

      <BentoLabel>Brecha Cambiaria · USD</BentoLabel>

      <div className="grid grid-cols-3 gap-2 mt-1">
        {/* MEP */}
        <div className="flex flex-col">
          <p className="text-[9px] font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 mb-1">
            MEP / Bolsa
          </p>
          <p className="text-lg font-black text-zinc-900 dark:text-white tabular-nums font-mono-num">
            ${fmtPrecio(data.mep?.venta)}
          </p>
          <p className="text-[9px] text-zinc-400">compra ${fmtPrecio(data.mep?.compra)}</p>
        </div>

        {/* Tarjeta */}
        <div className="flex flex-col">
          <p className="text-[9px] font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 mb-1">
            Tarjeta
          </p>
          <p className="text-lg font-black text-red-600 dark:text-red-400 tabular-nums font-mono-num">
            ${fmtPrecio(data.tarjeta?.venta)}
          </p>
          <p className="text-[9px] text-zinc-400">
            {brecha !== null && brecha > 0 ? `+${brecha.toFixed(1)}% más caro` : `${Math.abs(brecha ?? 0).toFixed(1)}% más barato`}
          </p>
        </div>

        {/* Recomendación */}
        <div className="flex flex-col items-end justify-between">
          {conviene && (
            <div className={`px-2.5 py-1.5 rounded-xl text-center ${
              conviene === 'MEP'
                ? 'bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800/40'
                : 'bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700'
            }`}>
              <p className="text-[8px] font-extrabold uppercase tracking-wider text-zinc-400">Conviene</p>
              <p className={`text-sm font-black mt-0.5 ${
                conviene === 'MEP'
                  ? 'text-emerald-700 dark:text-emerald-400'
                  : 'text-zinc-700 dark:text-zinc-200'
              }`}>
                {conviene === 'MEP' ? '📈 MEP' : '💳 Tarjeta'}
              </p>
              {brecha !== null && (
                <p className="text-[8px] text-zinc-400 mt-0.5">
                  ahorrás {Math.abs(brecha).toFixed(1)}%
                </p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Footer informativo */}
      <div className="mt-3 pt-2.5 border-t border-zinc-100 dark:border-zinc-800/60">
        <p className="text-[9px] text-zinc-400 leading-relaxed">
          💡 Para suscripciones y compras en USD: pagá con {conviene === 'MEP' ? 'dólar MEP (broker) si tenés acceso' : 'tarjeta (es más conveniente hoy)'}
        </p>
      </div>
    </BentoCell>
  )
}