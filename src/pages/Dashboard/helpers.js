import { useMemo } from 'react'

export function useRangoMes(offsetMeses = 0) {
  return useMemo(() => {
    const hoy = new Date()
    const d = new Date(hoy.getFullYear(), hoy.getMonth() + offsetMeses, 1)
    const desde = d.toLocaleDateString('sv-SE')
    const hasta =
      offsetMeses === 0
        ? hoy.toLocaleDateString('sv-SE')
        : new Date(d.getFullYear(), d.getMonth() + 1, 0).toLocaleDateString('sv-SE')
    return { desde, hasta }
  }, [offsetMeses])
}

export function fmtAbrev(n) {
  const abs = Math.abs(n)
  if (abs >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`
  if (abs >= 100_000)   return `$${(n / 1_000).toFixed(0)}K`
  return Number(n).toLocaleString('es-AR', { maximumFractionDigits: 0, style: 'currency', currency: 'ARS' })
}

export function fmtCompleto(n) {
  return Number(n).toLocaleString('es-AR', {
    style: 'currency', currency: 'ARS', maximumFractionDigits: 0,
  })
}
