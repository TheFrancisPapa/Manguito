import { supabase } from '../lib/supabase'

export async function getVentas() {
  const { data, error } = await supabase
    .from('ventas')
    .select('*')
    .order('fecha_venta', { ascending: false })
  if (error) throw error
  return data
}

export async function crearVenta(campos) {
  const { data, error } = await supabase
    .from('ventas')
    .insert(campos)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function borrarVenta(id) {
  const { error } = await supabase.from('ventas').delete().eq('id', id)
  if (error) throw error
}

/**
 * Calcula la ganancia/pérdida de una venta.
 * Tiene en cuenta la moneda de compra vs venta.
 */
export function calcularGananciaVenta({ cantidad, precio_venta, moneda_venta,
  precio_compra_ref, moneda_compra_ref, dolarBlue }) {
  if (!precio_compra_ref) return null
  const dolar = dolarBlue?.venta ?? 1000

  // Convertir ambos a USD para comparar
  const precioVentaUSD = moneda_venta === 'ARS'
    ? precio_venta / dolar
    : precio_venta

  const precioCompraUSD = moneda_compra_ref === 'ARS'
    ? precio_compra_ref / dolar
    : precio_compra_ref

  const gananciaUSDTotal = (precioVentaUSD - precioCompraUSD) * cantidad
  const gananciaPct = precioCompraUSD > 0
    ? ((precioVentaUSD - precioCompraUSD) / precioCompraUSD) * 100
    : null

  return {
    gananciaUSD: gananciaUSDTotal,
    gananciaARS: gananciaUSDTotal * dolar,
    gananciaPct,
    precioVentaUSD,
    precioCompraUSD,
  }
}