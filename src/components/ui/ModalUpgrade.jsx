import { Modal } from './Modal'
import { Button } from './Button'

export function ModalUpgrade({ abierto, onCerrar, feature = 'Esta función' }) {
  return (
    <Modal abierto={abierto} onCerrar={onCerrar} titulo="Función Premium">
      <div className="flex flex-col items-center text-center px-2 py-4">
        <div className="w-16 h-16 bg-emerald-500/10 text-emerald-500 rounded-3xl flex items-center justify-center text-3xl mb-5 shadow-sm">
          ⭐
        </div>
        <h3 className="text-xl font-extrabold text-zinc-900 dark:text-white mb-2 tracking-tight">
          Pasate a Manguito Pro
        </h3>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-8 leading-relaxed px-4">
          {feature} es un beneficio exclusivo del plan Pro. Mejorá tu cuenta para desbloquear todo el potencial de la app y sacarle jugo a tus finanzas.
        </p>
        
        <div className="flex w-full gap-3">
          <Button 
            variante="secondary" 
            className="flex-1" 
            onClick={onCerrar}
          >
            Quizás después
          </Button>
          <Button 
            className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white shadow-emerald-500/20"
            onClick={() => window.location.href = '/configuracion/planes'}
          >
            Ver planes
          </Button>
        </div>
      </div>
    </Modal>
  )
}
