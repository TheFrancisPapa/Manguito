// src/components/ui/Spinner.jsx
// Usado en botones cargando, páginas cargando y cualquier estado async.

export function Spinner({ size = 20, className = '' }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className={`animate-spin ${className}`}
    >
      <circle
        cx="12" cy="12" r="10"
        stroke="currentColor"
        strokeWidth="3"
        strokeOpacity="0.2"
      />
      <path
        d="M12 2a10 10 0 0 1 10 10"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
      />
    </svg>
  )
}

// Pantalla completa de carga — para pages que esperan datos
export function PageLoader() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-3">
      <span style={{ fontSize: 32 }}>🥭</span>
      <Spinner size={24} className="text-amber-400" />
    </div>
  )
}