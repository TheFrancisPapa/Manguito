import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Modal } from './Modal'
import { Button } from './Button'
import { useAuthContext } from '../../context/AuthContext'
import { iniciarPago } from '../../lib/pagos'

export function ModalUpgrade({ abierto, onCerrar, feature = 'Esta función' }) {
  const navigate = useNavigate()
  const { usuario } = useAuthContext()
  const [cargando, setCargando] = useState(false)
  const [error, setError] = useState(null)

  const handlePagar = async () => {
    setCargando(true)
    setError(null)
    try {
      await iniciarPago({ userId: usuario?.id, email: usuario?.email })
    } catch (err) {
      console.error('Error al iniciar pago:', err)
      setError('No se pudo conectar con el servicio de pagos. Intentá de nuevo.')
      setCargando(false)
    }
  }

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
          {feature} es un beneficio exclusivo del plan Pro. Mejorá tu cuenta para desbloquear todo el potencial de la app.
        </p>

        {error && (
          <p className="text-xs text-red-500 bg-red-50 dark:bg-red-900/20 rounded-xl px-3 py-2 mb-4 border border-red-100 dark:border-red-900">
            {error}
          </p>
        )}

        <div className="flex flex-col w-full gap-3">
          <Button
            className="w-full"
            onClick={handlePagar}
            cargando={cargando}
          >
            Pasarme a Pro por $100
          </Button>
          <Button
            variante="ghost"
            className="w-full text-zinc-500"
            onClick={() => navigate('/configuracion/planes')}
            disabled={cargando}
          >
            Ver todos los planes
          </Button>
        </div>
      </div>
    </Modal>
  )
}