import { useState, useEffect } from 'react'
import { BentoCell, BentoAmount, BentoHeader } from '../../../../components/bento/BentoCell'

export function BentoDolar() {
  const [dolar, setDolar] = useState(null)
  const [cargando, setCargando] = useState(true)

  useEffect(() => {
    fetch('https://dolarapi.com/v1/dolares/blue')
      .then(res => res.json())
      .then(data => {
        setDolar(data)
        setCargando(false)
      })
      .catch(() => setCargando(false))
  }, [])

  if (cargando) {
    return (
      <BentoCell className="col-span-6 md:col-span-4 flex items-center justify-center">
        <div className="animate-pulse flex items-center gap-2">
            <span className="text-2xl opacity-50 grayscale">💵</span>
            <div className="h-6 w-16 bg-zinc-100 dark:bg-zinc-800 rounded-md" />
        </div>
      </BentoCell>
    )
  }

  return (
    <BentoCell className="col-span-6 md:col-span-4 flex flex-col justify-between">
      <div className="flex items-center justify-between">
        <BentoHeader icon="💵" title="Dólar Blue" />
        <div className="flex items-center gap-1.5 -mt-3">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
        </div>
      </div>
      
      <div className="flex items-end justify-between mt-2">
        <div>
          <p className="text-[10px] text-zinc-400 font-semibold mb-0.5">Venta</p>
          <BentoAmount value={dolar ? `$${dolar.venta}` : '---'} size="lg" color="blue" />
        </div>
        <div className="text-right">
          <p className="text-[10px] text-zinc-400 font-semibold mb-0.5">Compra</p>
          <BentoAmount value={dolar ? `$${dolar.compra}` : '---'} size="md" color="default" className="text-zinc-500 dark:text-zinc-400" />
        </div>
      </div>
    </BentoCell>
  )
}
