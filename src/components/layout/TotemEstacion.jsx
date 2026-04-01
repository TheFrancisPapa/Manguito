// src/components/layout/TotemEstacion.jsx
// Tótem de precios estilo estación de servicio real

const MARCA_CONFIG = {
  ypf: {
    nombre: 'YPF',
    bg: 'linear-gradient(180deg, #0B1E3D 0%, #0D2B5A 40%, #0B1E3D 100%)',
    accent: '#3B8BEB',
    accentGlow: 'rgba(59,139,235,0.35)',
    border: 'rgba(59,139,235,0.25)',
    priceColor: '#5CBBFF',
    divider: 'rgba(59,139,235,0.15)',
    combustibles: [
      { tipo: 'super',          nombre: 'Super' },
      { tipo: 'premium',        nombre: 'Infinia' },
      { tipo: 'gasoil',         nombre: 'Diesel 500' },
      { tipo: 'gasoil_premium', nombre: 'Infinia Diesel' },
    ],
  },
  shell: {
    nombre: 'Shell',
    bg: 'linear-gradient(180deg, #1A0A0A 0%, #2D0F0F 40%, #1A0A0A 100%)',
    accent: '#DD1D21',
    accentGlow: 'rgba(221,29,33,0.30)',
    border: 'rgba(221,29,33,0.25)',
    priceColor: '#FF6B6B',
    divider: 'rgba(221,29,33,0.15)',
    combustibles: [
      { tipo: 'super',          nombre: 'Super' },
      { tipo: 'premium',        nombre: 'V-Power' },
      { tipo: 'gasoil',         nombre: 'V-Power Diesel' },
      { tipo: 'gasoil_premium', nombre: 'Evolux Diesel' },
    ],
  },
  axion: {
    nombre: 'Axion',
    bg: 'linear-gradient(180deg, #1A1205 0%, #2B1E08 40%, #1A1205 100%)',
    accent: '#F5A623',
    accentGlow: 'rgba(245,166,35,0.30)',
    border: 'rgba(245,166,35,0.25)',
    priceColor: '#FFD06B',
    divider: 'rgba(245,166,35,0.15)',
    combustibles: [
      { tipo: 'super',          nombre: 'Super' },
      { tipo: 'premium',        nombre: 'Quantum' },
      { tipo: 'gasoil',         nombre: 'Diesel' },
      { tipo: 'gasoil_premium', nombre: 'Quantum Diesel' },
    ],
  },
  puma: {
    nombre: 'Puma',
    bg: 'linear-gradient(180deg, #1A1A05 0%, #2B2B08 40%, #1A1A05 100%)',
    accent: '#C8B400',
    accentGlow: 'rgba(200,180,0,0.30)',
    border: 'rgba(200,180,0,0.25)',
    priceColor: '#F0E060',
    divider: 'rgba(200,180,0,0.15)',
    combustibles: [
      { tipo: 'super',          nombre: 'Puma Super' },
      { tipo: 'premium',        nombre: 'Premium' },
      { tipo: 'gasoil',         nombre: 'Puma Diesel' },
      { tipo: 'gasoil_premium', nombre: 'ION Diesel' },
    ],
  },
}

function fmtPrecioTotem(n) {
  if (!n) return '— —'
  return Number(n).toLocaleString('es-AR', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })
}

export function TotemEstacion({ marca, precios = {}, onActualizar }) {
  const config = MARCA_CONFIG[marca]
  if (!config) return null

  return (
    <div
      className="rounded-2xl overflow-hidden transition-all duration-300 hover:scale-[1.01]"
      style={{
        background: config.bg,
        border: `1.5px solid ${config.border}`,
        boxShadow: `0 4px 24px rgba(0,0,0,0.5), 0 0 40px ${config.accentGlow}`,
      }}
    >
      {/* ── Header: Logo de la marca ── */}
      <div
        className="flex items-center justify-center py-4 px-5"
        style={{ borderBottom: `1px solid ${config.divider}` }}
      >
        {/* Placeholder para logo — reemplazar src con el logo oficial */}
        <div className="flex items-center gap-3">
          <img
            src={`/logos/${marca}.png`}
            alt={`Logo ${config.nombre}`}
            className="h-9 w-auto object-contain"
            onError={(e) => { e.currentTarget.style.display = 'none' }}
          />
          {/* Fallback: nombre estilizado si no carga la imagen */}
          <span
            className="font-black text-2xl tracking-tight"
            style={{
              color: config.accent,
              textShadow: `0 0 20px ${config.accentGlow}, 0 0 6px ${config.accentGlow}`,
              fontFamily: 'var(--font-display)',
            }}
          >
            {config.nombre}
          </span>
        </div>
      </div>

      {/* ── Filas de combustible ── */}
      <div className="flex flex-col">
        {config.combustibles.map((c, i) => {
          const precio = precios[c.tipo]?.[marca]

          return (
            <div
              key={c.tipo}
              className="group flex items-center justify-between px-5 py-3.5"
              style={{
                borderBottom:
                  i < config.combustibles.length - 1
                    ? `1px solid ${config.divider}`
                    : 'none',
              }}
            >
              {/* Nombre del combustible */}
              <span
                className="text-sm font-bold uppercase tracking-wide"
                style={{ color: 'rgba(255,255,255,0.65)' }}
              >
                {c.nombre}
              </span>

              {/* Precio estilo LED */}
              <div className="flex items-center gap-2">
                <div className="flex items-baseline gap-0.5">
                  <span
                    className="text-sm font-bold"
                    style={{ color: 'rgba(255,255,255,0.3)' }}
                  >
                    $
                  </span>
                  <span
                    className="text-2xl font-black tabular-nums tracking-tight"
                    style={{
                      color: config.priceColor,
                      textShadow: `0 0 12px ${config.accentGlow}, 0 0 4px ${config.accentGlow}`,
                      fontFamily: 'var(--font-display)',
                      letterSpacing: '-0.02em',
                    }}
                  >
                    {fmtPrecioTotem(precio)}
                  </span>
                </div>

                {/* Botón editar — visible en hover / touch */}
                {onActualizar && (
                  <button
                    onClick={() => onActualizar(c.tipo, marca, precio)}
                    className="opacity-0 group-hover:opacity-100 focus:opacity-100
                      w-7 h-7 rounded-lg flex items-center justify-center
                      text-[10px] transition-all duration-200 active:scale-90"
                    style={{
                      background: `${config.accent}15`,
                      border: `1px solid ${config.accent}30`,
                      color: config.accent,
                    }}
                    title="Actualizar precio"
                  >
                    ✏️
                  </button>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* ── Footer: precio por litro ── */}
      <div
        className="px-5 py-2.5 text-center"
        style={{
          borderTop: `1px solid ${config.divider}`,
          background: 'rgba(0,0,0,0.2)',
        }}
      >
        <span
          className="text-[10px] uppercase tracking-widest font-bold"
          style={{ color: 'rgba(255,255,255,0.2)' }}
        >
          Precio por litro · ARS
        </span>
      </div>
    </div>
  )
}
