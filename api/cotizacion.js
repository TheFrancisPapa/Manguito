// api/cotizacion.js
// Proxy para Yahoo Finance — evita problemas de CORS desde el browser.
// Se ejecuta en los servidores de Vercel (serverless function).
//
// Params:
//   ?symbol=AAPL         → precio actual
//   ?symbol=AAPL&date=2024-01-15 → precio histórico (cierre del día más cercano)

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Método no permitido' })
  }

  const { symbol, date } = req.query

  if (!symbol || typeof symbol !== 'string') {
    return res.status(400).json({ error: 'Se requiere el parámetro ?symbol=' })
  }

  // Sanitizamos el símbolo (letras, números, puntos y guiones)
  const symbolClean = symbol.replace(/[^A-Za-z0-9.\-]/g, '').toUpperCase()
  if (!symbolClean) {
    return res.status(400).json({ error: 'Símbolo inválido' })
  }

  // Validamos la fecha si viene
  let fechaValida = null
  if (date) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return res.status(400).json({ error: 'Formato de fecha inválido. Usá YYYY-MM-DD' })
    }
    const dateObj = new Date(date + 'T12:00:00Z')
    if (isNaN(dateObj.getTime())) {
      return res.status(400).json({ error: 'Fecha inválida' })
    }
    // No podemos pedir precio futuro
    if (dateObj > new Date()) {
      return res.status(400).json({ error: 'No se puede obtener precio de una fecha futura' })
    }
    fechaValida = dateObj
  }

  try {
    let apiUrl

    if (fechaValida) {
      // Precio histórico: pedimos un rango de ~7 días ANTES de la fecha objetivo
      // para cubrir fines de semana y feriados (nos quedamos con el último cierre disponible)
      const period2 = Math.floor(fechaValida.getTime() / 1000) + 86400      // fecha + 1 día
      const period1 = Math.floor(fechaValida.getTime() / 1000) - 8 * 86400  // fecha - 8 días
      apiUrl = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbolClean)}?interval=1d&period1=${period1}&period2=${period2}`
    } else {
      // Precio actual
      apiUrl = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbolClean)}?interval=1d&range=2d&includeAdjustedClose=true`
    }

    const response = await fetch(apiUrl, {
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
        sugerencia: 'Verificá el ticker. Ej: AAPL para Apple, BTC-USD para Bitcoin, AAPL.BA para el CEDEAR.',
      })
    }

    const meta = result.meta

    // ── Extraer precio ────────────────────────────────────────────
    let precioFinal
    let isHistorical = false
    let actualDate = null

    if (fechaValida && result.timestamp?.length > 0) {
      // Precio histórico: buscamos el cierre más cercano ANTES o EN la fecha solicitada
      const timestamps = result.timestamp
      const closes     = result.indicators?.quote?.[0]?.close || []
      const targetTs   = fechaValida.getTime() / 1000

      // Recorremos de atrás para adelante buscando el último cierre válido <= target
      let bestIdx = -1
      for (let i = timestamps.length - 1; i >= 0; i--) {
        if (timestamps[i] <= targetTs + 86400 && closes[i] != null) {
          bestIdx = i
          break
        }
      }

      if (bestIdx >= 0) {
        precioFinal = closes[bestIdx]
        actualDate  = new Date(timestamps[bestIdx] * 1000).toISOString().split('T')[0]
        isHistorical = true
      } else {
        // Fallback al precio actual si no hay datos históricos
        precioFinal  = meta.regularMarketPrice ?? 0
        isHistorical = false
      }
    } else {
      // Precio actual
      const prevClose = meta.previousClose ?? meta.chartPreviousClose ?? 0
      precioFinal     = meta.regularMarketPrice ?? 0
      const change    = precioFinal - prevClose
      const changePct = prevClose > 0 ? (change / prevClose) * 100 : 0

      res.setHeader('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=600')

      return res.status(200).json({
        symbol:        meta.symbol || symbolClean,
        shortName:     meta.shortName || meta.longName || symbolClean,
        currency:      meta.currency || 'USD',
        currentPrice:  precioFinal,
        previousClose: prevClose,
        change:        parseFloat(change.toFixed(4)),
        changePercent: parseFloat(changePct.toFixed(2)),
        exchange:      meta.exchangeName || '',
        marketState:   meta.marketState || 'CLOSED',
        isHistorical:  false,
      })
    }

    // Respuesta para precio histórico
    return res.status(200).json({
      symbol:        meta.symbol || symbolClean,
      shortName:     meta.shortName || meta.longName || symbolClean,
      currency:      meta.currency || 'USD',
      currentPrice:  precioFinal,
      exchange:      meta.exchangeName || '',
      isHistorical:  isHistorical,
      requestedDate: date || null,
      actualDate:    actualDate,  // la fecha real del cierre que encontramos
    })

  } catch (error) {
    console.error(`[cotizacion] Error para ${symbolClean}:`, error.message)
    return res.status(500).json({
      error: 'Error al consultar Yahoo Finance. Intentá de nuevo en unos segundos.',
      symbol: symbolClean,
    })
  }
}