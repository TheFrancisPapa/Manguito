import { useState } from 'react'
import { PageWrapper, PageHeader } from '../../components/layout'
import { TipContextual } from '../../components/ui/TipContextual'
import { PresupuestosView } from './Presupuestos'
import { MetasView } from './Metas'

export function PlanificacionPage() {
  const [tab, setTab] = useState('limites')

  return (
    <div className="animate-in fade-in duration-500">
      <PageWrapper>
        <PageHeader 
          titulo="Planificación" 
          subtitulo="Organizá tus límites y metas de ahorro"
        />

        <TipContextual seccion="planificacion" className="mb-5" />

        <div className="flex bg-zinc-100 dark:bg-zinc-800 rounded-xl p-1 mb-5">
          <button
            onClick={() => setTab('limites')}
            className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-colors ${
              tab === 'limites'
                ? 'bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white shadow-sm'
                : 'text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'
            }`}
          >
            📊 Límites (Presupuestos)
          </button>
          <button
            onClick={() => setTab('metas')}
            className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-colors ${
              tab === 'metas'
                ? 'bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white shadow-sm'
                : 'text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'
            }`}
          >
            🎯 Metas de Ahorro
          </button>
        </div>

        {tab === 'limites' && <PresupuestosView />}
        {tab === 'metas' && <MetasView />}
      </PageWrapper>
    </div>
  )
}
