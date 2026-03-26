import { supabase } from '../lib/supabase'

// ──────────────────────────────────────────────
//  CRUD — Supabase
// ──────────────────────────────────────────────

export async function getInversiones() {
  const { data, error } = await supabase
    .from('inversiones')
    .select('*')
    .order('fecha_compra', { ascending: false })
  if (error) throw error
  return data
}

export async function crearInversion(campos) {
  const { data, error } = await supabase
    .from('inversiones')
    .insert(campos)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function editarInversion(id, campos) {
  const { data, error } = await supabase
    .from('inversiones')
    .update({ ...campos, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function borrarInversion(id) {
  const { error } = await supabase.from('inversiones').delete().eq('id', id)
  if (error) throw error
}

// ──────────────────────────────────────────────
//  Mapeo de símbolos cripto → IDs de CoinGecko
// ──────────────────────────────────────────────
export const CRYPTO_GECKO_IDS = {
  BTC: 'bitcoin',
  ETH: 'ethereum',
  SOL: 'solana',
  USDT: 'tether',
  USDC: 'usd-coin',
  BNB: 'binancecoin',
  ADA: 'cardano',
  DOGE: 'dogecoin',
  AVAX: 'avalanche-2',
  DOT: 'polkadot',
  MATIC: 'matic-network',
  LINK: 'chainlink',
  UNI: 'uniswap',
  ATOM: 'cosmos',
  XRP: 'ripple',
  SHIB: 'shiba-inu',
  LTC: 'litecoin',
  BCH: 'bitcoin-cash',
  NEAR: 'near',
  ARB: 'arbitrum',
}

// Lista para el selector de cripto
export const CRYPTOS_POPULARES = [
  { simbolo: 'BTC',  nombre: 'Bitcoin',  icono: '₿' },
  { simbolo: 'ETH',  nombre: 'Ethereum', icono: 'Ξ' },
  { simbolo: 'SOL',  nombre: 'Solana',   icono: '◎' },
  { simbolo: 'USDT', nombre: 'Tether',   icono: '💲' },
  { simbolo: 'BNB',  nombre: 'BNB',      icono: '⬡' },
  { simbolo: 'ADA',  nombre: 'Cardano',  icono: '₳' },
  { simbolo: 'DOGE', nombre: 'Dogecoin', icono: '🐕' },
  { simbolo: 'AVAX', nombre: 'Avalanche',icono: '🔺' },
  { simbolo: 'XRP',  nombre: 'XRP',      icono: '✕' },
  { simbolo: 'MATIC',nombre: 'Polygon',  icono: '⬡' },
]

// ──────────────────────────────────────────────
//  Obtención de precios en tiempo real
// ──────────────────────────────────────────────

/**
 * Obtiene precios actuales para una lista de inversiones.
 * - Cripto: usa CoinGecko (gratis, sin API key, sin CORS)
 * - Acciones/CEDEARs: usa proxy Vercel → Yahoo Finance
 * Retorna un mapa { SIMBOLO: { currentPrice, changePercent, currency, ... } }
 */
export async function fetchPrecios(inversiones) {
  const precios = {}
  const promesas = []

  // ── Cripto via CoinGecko ──────────────────
  const cryptos = inversiones.filter(i => i.tipo === 'crypto' && i.simbolo)
  if (cryptos.length > 0) {
    const geckoIds = cryptos
      .map(i => CRYPTO_GECKO_IDS[i.simbolo.toUpperCase()])
      .filter(Boolean)
    const uniqueIds = [...new Set(geckoIds)]

    if (uniqueIds.length > 0) {
      promesas.push(
        fetch(
          `https://api.coingecko.com/api/v3/simple/price?ids=${uniqueIds.join(',')}&vs_currencies=usd&include_24hr_change=true&include_market_cap=true`
        )
          .then(r => r.json())
          .then(data => {
            cryptos.forEach(inv => {
              const geckoId = CRYPTO_GECKO_IDS[inv.simbolo.toUpperCase()]
              if (data[geckoId]) {
                precios[inv.simbolo.toUpperCase()] = {
                  currentPrice:  data[geckoId].usd,
                  changePercent: data[geckoId].usd_24h_change ?? 0,
                  change: 0, // no disponible directamente
                  currency: 'USD',
                  shortName: inv.nombre,
                  source: 'coingecko',
                }
              }
            })
          })
          .catch(err => console.warn('CoinGecko error:', err))
      )
    }
  }

  // ── Acciones y CEDEARs via proxy Yahoo Finance ──
  const stocks = inversiones.filter(
    i => ['accion', 'cedear'].includes(i.tipo) && i.simbolo
  )
  const symbolsUnicos = [...new Set(stocks.map(i => i.simbolo.toUpperCase()))]

  symbolsUnicos.forEach(symbol => {
    promesas.push(
      fetch(`/api/cotizacion?symbol=${encodeURIComponent(symbol)}`)
        .then(r => r.json())
        .then(data => {
          if (!data.error) {
            precios[symbol] = {
              currentPrice:  data.currentPrice,
              changePercent: data.changePercent,
              change:        data.change,
              currency:      data.currency,
              shortName:     data.shortName,
              exchange:      data.exchange,
              marketState:   data.marketState,
              source:        'yahoo',
            }
          }
        })
        .catch(err => console.warn(`Yahoo Finance error para ${symbol}:`, err))
    )
  })

  await Promise.all(promesas)
  return precios
}

/**
 * Obtiene el tipo de cambio del dólar blue desde DolarAPI.
 */
export async function fetchDolarRate() {
  const res = await fetch('https://dolarapi.com/v1/dolares/blue')
  if (!res.ok) throw new Error('No se pudo obtener el dólar blue')
  return res.json()
}

// ──────────────────────────────────────────────
//  Cálculo del portfolio
// ──────────────────────────────────────────────

/**
 * Calcula el valor total del portfolio y las ganancias.
 * Todas las posiciones en USD/EUR se convierten a ARS usando el dólar blue.
 */
export function calcularPortfolio(inversiones, cotizaciones, dolarBlue) {
  const dolarVenta = dolarBlue?.venta ?? 1000

  let totalValorARS = 0
  let totalCostoARS = 0
  const detalles = []

  inversiones.forEach(inv => {
    const cot = cotizaciones[inv.simbolo?.toUpperCase()]
    const precioActualUSD = cot?.currentPrice ?? null

    // Costo de compra convertido a ARS
    let costoUnitarioARS
    if (inv.moneda_compra === 'ARS') {
      costoUnitarioARS = inv.precio_compra
    } else {
      // Simplificamos: usamos el dólar blue actual para la conversión
      costoUnitarioARS = inv.precio_compra * dolarVenta
    }
    const costoTotalARS = inv.cantidad * costoUnitarioARS

    // Valor actual en ARS
    let valorActualARS = null
    let valorActualUSD = null
    let gananciaUSD = null
    let gananciaPct = null

    if (precioActualUSD !== null) {
      valorActualUSD = inv.cantidad * precioActualUSD
      valorActualARS = valorActualUSD * dolarVenta

      gananciaUSD = valorActualUSD - inv.cantidad * (
        inv.moneda_compra === 'ARS'
          ? inv.precio_compra / dolarVenta
          : inv.precio_compra
      )
      gananciaPct = inv.precio_compra > 0
        ? ((precioActualUSD - (inv.moneda_compra === 'ARS' ? inv.precio_compra / dolarVenta : inv.precio_compra))
            / (inv.moneda_compra === 'ARS' ? inv.precio_compra / dolarVenta : inv.precio_compra)) * 100
        : null

      totalValorARS += valorActualARS
    }
    totalCostoARS += costoTotalARS

    detalles.push({
      ...inv,
      cotizacion:    cot ?? null,
      precioActualUSD,
      valorActualUSD,
      valorActualARS,
      costoTotalARS,
      gananciaUSD,
      gananciaPct,
    })
  })

  const gananciaARS   = totalValorARS - totalCostoARS
  const gananciaTotalPct = totalCostoARS > 0 ? (gananciaARS / totalCostoARS) * 100 : 0

  return {
    totalValorARS,
    totalCostoARS,
    gananciaARS,
    gananciaTotalPct,
    totalValorUSD: totalValorARS / dolarVenta,
    dolarVenta,
    detalles,
  }
}