// src/pages/Chat/index.jsx
// El asistente IA está temporalmente en mantenimiento.
// La UI queda lista para cuando se reactive el servicio.

import { useNavigate } from 'react-router-dom'
import { Button } from '../../components/ui'

export function ChatPage() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-[var(--cream-soft)] dark:bg-[var(--dark-bg)] flex flex-col items-center justify-center p-6 text-center">
      <div className="max-w-md w-full animate-in fade-in slide-in-from-bottom-4 duration-500">

        {/* Icono animado */}
        <div className="relative inline-flex items-center justify-center mb-8">
          <div className="absolute inset-0 bg-[var(--mango)] blur-3xl opacity-20 rounded-full animate-pulse" />
          <div className="relative w-24 h-24 rounded-3xl bg-[var(--mango)]/15 dark:bg-[var(--mango)]/10
            border border-[var(--mango)]/20 flex items-center justify-center text-5xl
            animate-float shadow-xl">
            🥭
          </div>
        </div>

        <h2 className="text-2xl font-black text-zinc-900 dark:text-white mb-3 tracking-tight">
          ManguitoAI está en mantenimiento
        </h2>

        <p className="text-zinc-500 dark:text-zinc-400 leading-relaxed mb-2">
          Estamos trabajando para mejorar el asistente financiero con IA.
          ¡Muy pronto vas a poder consultarle sobre inversiones, dólar y finanzas personales!
        </p>

        <p className="text-sm text-[var(--mango-dark)] dark:text-[var(--mango)] font-semibold mb-8">
          🛠️ Próximamente disponible
        </p>

        {/* Indicador de progreso decorativo */}
        <div className="w-full bg-zinc-100 dark:bg-zinc-800 rounded-full h-2 mb-8 overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-to-r from-[var(--mango)] to-[var(--mango-dark)] animate-shimmer"
            style={{ width: '65%' }}
          />
        </div>

        {/* Alternativas mientras tanto */}
        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-100 dark:border-zinc-800
          p-5 mb-6 text-left">
          <p className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-3">
            💡 Mientras tanto, podés...
          </p>
          <div className="flex flex-col gap-2.5">
            {[
              { emoji: '📚', texto: 'Ver recursos y cuentas educativas', ruta: '/recursos' },
              { emoji: '📊', texto: 'Revisar tus presupuestos del mes', ruta: '/presupuestos' },
              { emoji: '📈', texto: 'Ver tu cartera de inversiones', ruta: '/inversiones' },
              { emoji: '🧮', texto: 'Calcular cuotas vs contado', ruta: '/calculadora' },
              { emoji: '💱', texto: 'Ver cotizaciones del dólar', ruta: '/cotizaciones' },
            ].map(item => (
              <button
                key={item.ruta}
                onClick={() => navigate(item.ruta)}
                className="flex items-center gap-3 py-2 px-1 rounded-xl text-left
                  hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors group"
              >
                <span className="text-lg w-8 text-center">{item.emoji}</span>
                <span className="text-sm text-zinc-600 dark:text-zinc-400 group-hover:text-zinc-800
                  dark:group-hover:text-zinc-200 transition-colors">
                  {item.texto}
                </span>
                <span className="ml-auto text-zinc-300 dark:text-zinc-600 text-xs">→</span>
              </button>
            ))}
          </div>
        </div>

        <Button
          variante="secondary"
          onClick={() => navigate('/dashboard')}
          className="w-full"
        >
          Volver al inicio
        </Button>
      </div>
    </div>
  )
}