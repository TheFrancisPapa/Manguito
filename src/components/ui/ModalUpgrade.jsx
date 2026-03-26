import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Modal } from './Modal'
import { Button } from './Button'
import { useAuthContext } from '../../context/AuthContext'

export function ModalUpgrade({ abierto, onCerrar, feature = 'Esta función' }) {
  const navigate = useNavigate()
  const { usuario } = useAuthContext()
  const [cargando, setCargando] = useState(false)

  const handlePagar = async () => {
    if (!usuario?.id) return
    setCargando(true)
    try {
      const response = await fetch('/api/pago/crear', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId: usuario.id }), 
      })

      const data = await response.json()

      if (data.init_point) {
        window.location.href = data.init_point
      } else {
        console.error('Error: No se recibió el punto de inicio de pago', data)
      }
    } catch (error) {
      console.error('Error al conectar con el servicio de pagos:', error)
    } finally {
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
          {feature} es un beneficio exclusivo del plan Pro. Mejorá tu cuenta para desbloquear todo el potencial de la app y sacarle jugo a tus finanzas.
        </p>
        
        <div className="flex flex-col w-full gap-3">
          <Button 
            className="w-full bg-emerald-500 hover:bg-emerald-600 text-white shadow-emerald-500/20"
            onClick={handlePagar}
            disabled={cargando}
          >
            {cargando ? 'Cargando...' : 'Pasarme a Pro por $100'}
          </Button>
          <Button 
            variante="ghost" 
            className="w-full text-zinc-500" 
            onClick={() => navigate('/configuracion/planes')}
          >
            Ver todos los planes
          </Button>
        </div>
      </div>
    </Modal>
  )
}
