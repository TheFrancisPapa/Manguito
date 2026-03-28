const CATALOGO_SUSCRIPCIONES = [
  { id: 'netflix-basico', precios: { ars_mp: 4699, ars_debito: 4699, ars_credito: 5639 } },
  { id: 'netflix-estandar', precios: { ars_mp: 7199, ars_debito: 7199, ars_credito: 8639, usd_astropay: 15.49, usd_wise: 15.49, usd_cripto: 15.49 } },
  { id: 'netflix-premium', precios: { ars_mp: 10499, ars_debito: 10499, ars_credito: 12599, usd_astropay: 22.99, usd_wise: 22.99, usd_cripto: 22.99 } },
  { id: 'disney-plus', precios: { ars_mp: 4299, ars_debito: 4299, ars_credito: 5159, usd_astropay: 7.99, usd_wise: 7.99, usd_cripto: 7.99 } },
  { id: 'hbo-max', precios: { ars_mp: 3499, ars_debito: 3499, ars_credito: 4199 } },
  { id: 'hbo-max-premium', precios: { ars_mp: 6499, ars_debito: 6499, ars_credito: 7799, usd_astropay: 15.99, usd_wise: 15.99, usd_cripto: 15.99 } },
  { id: 'amazon-prime', precios: { usd_astropay: 8.99, usd_wise: 8.99, usd_cripto: 8.99 } },
  { id: 'apple-tv', precios: { usd_astropay: 9.99, usd_wise: 9.99, usd_cripto: 9.99 } },
  { id: 'star-plus', precios: { ars_mp: 7699, ars_debito: 7699, ars_credito: 9239 } },
  { id: 'paramountplus', precios: { ars_mp: 2799, ars_debito: 2799, ars_credito: 3359, usd_astropay: 5.99, usd_wise: 5.99, usd_cripto: 5.99 } },
  { id: 'spotify-individual', precios: { ars_mp: 3699, ars_debito: 3699, ars_credito: 4439 } },
  { id: 'spotify-duo', precios: { ars_mp: 4899, ars_debito: 4899, ars_credito: 5879 } },
  { id: 'youtube-music', precios: { ars_mp: 2899, ars_debito: 2899, ars_credito: 3479 } },
  { id: 'apple-music', precios: { usd_astropay: 10.99, usd_wise: 10.99, usd_cripto: 10.99 } },
  { id: 'icloud-50gb', precios: { usd_astropay: 0.99, usd_wise: 0.99, usd_cripto: 0.99 } },
  { id: 'icloud-200gb', precios: { usd_astropay: 2.99, usd_wise: 2.99, usd_cripto: 2.99 } },
  { id: 'google-one-100gb', precios: { ars_mp: 999, ars_debito: 999, ars_credito: 1199, usd_astropay: 1.99, usd_wise: 1.99, usd_cripto: 1.99 } },
  { id: 'google-one-2tb', precios: { ars_mp: 5999, ars_debito: 5999, ars_credito: 7199, usd_astropay: 9.99, usd_wise: 9.99, usd_cripto: 9.99 } },
  { id: 'dropbox-plus', precios: { usd_astropay: 11.99, usd_wise: 11.99, usd_cripto: 11.99 } },
  { id: 'chatgpt-plus', precios: { usd_astropay: 20, usd_wise: 20, usd_cripto: 20 } },
  { id: 'claude-pro', precios: { usd_astropay: 20, usd_wise: 20, usd_cripto: 20 } },
  { id: 'microsoft-365', precios: { ars_mp: 4699, ars_debito: 4699, ars_credito: 5639, usd_astropay: 6.99, usd_wise: 6.99, usd_cripto: 6.99 } },
  { id: 'notion-plus', precios: { usd_astropay: 10, usd_wise: 10, usd_cripto: 10 } },
  { id: 'adobe-cc', precios: { usd_astropay: 54.99, usd_wise: 54.99, usd_cripto: 54.99 } },
  { id: 'canva-pro', precios: { ars_mp: 6999, ars_debito: 6999, ars_credito: 8399, usd_astropay: 14.99, usd_wise: 14.99, usd_cripto: 14.99 } },
  { id: 'xbox-game-pass', precios: { ars_mp: 4699, ars_debito: 4699, ars_credito: 5639 } },
  { id: 'playstation-plus', precios: { ars_mp: 4399, ars_debito: 4399, ars_credito: 5279, usd_astropay: 7.99, usd_wise: 7.99, usd_cripto: 7.99 } },
  { id: 'nintendo-online', precios: { usd_astropay: 3.99, usd_wise: 3.99, usd_cripto: 3.99 } },
  { id: 'youtube-premium', precios: { ars_mp: 2899, ars_debito: 2899, ars_credito: 3479 } },
  { id: 'espn-premium', precios: { ars_mp: 2999, ars_debito: 2999, ars_credito: 3599 } },
  { id: 'directv-go', precios: { ars_mp: 8999, ars_debito: 8999, ars_credito: 10799 } },
  { id: 'duolingo-plus', precios: { ars_mp: 3999, ars_debito: 3999, ars_credito: 4799, usd_astropay: 6.99, usd_wise: 6.99, usd_cripto: 6.99 } },
  { id: 'coursera-plus', precios: { usd_astropay: 59, usd_wise: 59, usd_cripto: 59 } },
  { id: 'nordvpn', precios: { usd_astropay: 13.99, usd_wise: 13.99, usd_cripto: 13.99 } },
  { id: '1password', precios: { usd_astropay: 2.99, usd_wise: 2.99, usd_cripto: 2.99 } },
];

const values = [];
CATALOGO_SUSCRIPCIONES.forEach(s => {
  Object.entries(s.precios).forEach(([m, p]) => {
    if (p !== null) {
      const moneda = m.startsWith('ars') ? 'ARS' : 'USD';
      values.push(`('${s.id}', '${m}', ${p}, '${moneda}')`);
    }
  });
});

console.log('insert into public.catalogo_precios_billetera (servicio_id, metodo_pago, precio, moneda) values');
console.log(values.join(',\n') + ';');
