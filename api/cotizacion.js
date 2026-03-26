// api/cotizacion.js
// Proxy para Yahoo Finance — evita problemas de CORS desde el browser.
// Se ejecuta en los servidores de Vercel (serverless function).

export default async function handler(req, res) {
  // Permitir solo GET
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Método no permitido' })
  }

  const { symbol } = req.query

  if (!symbol || typeof symbol !== 'string') {
    return res.status(400).json({ error: 'Se requiere el parámetro ?symbol=' })
  }

  // Sanitizamos el símbolo (solo letras, números, puntos y guiones)
  const symbolClean = symbol.replace(/[^A-Za-z0-9.\-]/g, '').toUpperCase()
  if (!symbolClean) {
    return res.status(400).json({ error: 'Símbolo inválido' })
  }

  try {
    const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbolClean)}?interval=1d&range=2d&includeAdjustedClose=true`

    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'application/json',
        'Accept-Language': 'es-AR,es;q=0.9,en;q=0.8',
      },
    })

    if (!response.ok) {
      return res.status(response.status).json({
        error: `Yahoo Finance respondió con error ${response.status}`,
        symbol: symbolClean,
      })
    }

    const data = await response.json()
    const result = data?.chart?.result?.[0]

    if (!result) {
      return res.status(404).json({
        error: 'Símbolo no encontrado en Yahoo Finance',
        symbol: symbolClean,
        sugerencia: 'Verificá que el ticker sea correcto. Ej: AAPL para Apple, BTC-USD para Bitcoin, AAPL.BA para el CEDEAR de Apple.',
      })
    }

    const meta = result.meta
    const prevClose = meta.previousClose ?? meta.chartPreviousClose ?? 0
    const currentPrice = meta.regularMarketPrice ?? 0
    const change = currentPrice - prevClose
    const changePercent = prevClose > 0 ? (change / prevClose) * 100 : 0

    // Cache de 5 minutos
    res.setHeader('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=600')

    return res.status(200).json({
      symbol: meta.symbol || symbolClean,
      shortName: meta.shortName || meta.longName || symbolClean,
      currency: meta.currency || 'USD',
      currentPrice,
      previousClose: prevClose,
      change: parseFloat(change.toFixed(4)),
      changePercent: parseFloat(changePercent.toFixed(2)),
      exchange: meta.exchangeName || '',
      marketState: meta.marketState || 'CLOSED',
    })
  } catch (error) {
    console.error(`[cotizacion] Error para ${symbolClean}:`, error.message)
    return res.status(500).json({
      error: 'Error al consultar Yahoo Finance. Intentá de nuevo en unos segundos.',
      symbol: symbolClean,
    })
  }
}