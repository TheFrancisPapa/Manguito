import { useRouteError } from 'react-router-dom'
import { Button } from './Button'

export function ErrorBoundary() {
  const error = useRouteError()
  
  // Si falla la carga de un módulo (típico en despliegues nuevos)
  const isChunkError = 
    error?.message?.includes('Failed to fetch dynamically imported module') ||
    error?.name === 'ChunkLoadError'

  if (isChunkError) {
    // Reintentar recargando la página entera para obtener los nuevos assets
    window.location.reload()
    return null
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex items-center justify-center p-6 text-center animate-in fade-in duration-500">
      <div className="max-w-md w-full bg-white dark:bg-zinc-900 p-8 rounded-3xl border border-zinc-100 dark:border-zinc-800 shadow-xl">
        <div className="w-16 h-16 bg-red-50 dark:bg-red-900/20 rounded-2xl flex items-center justify-center mx-auto mb-6 text-3xl">
          ⚠️
        </div>
        <h1 className="text-2xl font-black text-zinc-900 dark:text-white mb-3 tracking-tight">
          ¡Ups! Algo salió mal
        </h1>
        <p className="text-zinc-500 dark:text-zinc-400 mb-8 leading-relaxed">
          Hubo un error inesperado en la aplicación. No te preocupes, tus datos están seguros.
        </p>
        
        <div className="flex flex-col gap-3">
          <Button 
            className="w-full font-bold py-3" 
            onClick={() => window.location.reload()}
          >
            🔄 Recargar aplicación
          </Button>
          <Button 
            variante="secondary" 
            className="w-full py-3" 
            onClick={() => window.location.href = '/dashboard'}
          >
            Volver al inicio
          </Button>
        </div>
        
        {process.env.NODE_ENV === 'development' && (
          <div className="mt-8 pt-6 border-t border-zinc-100 dark:border-zinc-800 text-left">
            <p className="text-[10px] uppercase font-bold text-zinc-400 tracking-widest mb-2">Error Details</p>
            <pre className="text-[10px] text-red-500 bg-red-50 dark:bg-red-900/20 p-3 rounded-lg overflow-x-auto font-mono">
              {error?.message || 'Unknown error'}
            </pre>
          </div>
        )}
      </div>
    </div>
  )
}
