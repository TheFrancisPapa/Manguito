import { useState, useMemo } from 'react'
import { useAuthContext } from '../../context/AuthContext'
import { useVencimientos } from '../../hooks/useVencimientos'
import { useSuscripciones } from '../../hooks/useSuscripciones'
import { PageWrapper, PageHeader } from '../../components/layout'
import { Card, Button, EmptyState, Modal } from '../../components/ui'
import { CatalogoSuscripciones } from './Suscripciones/Catalogo'
import { FormVencimiento } from './Vencimientos'
import { FormSuscripcion } from './Suscripciones'

const fmtMonto = (m) => m != null
  ? `$${Number(m).toLocaleString('es-AR', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`
  : 'Variable'

function TarjetaAgenda({ item, onClick }) {
  const [notiActiva, setNotiActiva] = useState(true) // Mock de la funcionalidad de notificación
  const esUrgent = item.diasRestantes <= 3 // Simplificación para demo de urgencia
  
  return (
    <div onClick={onClick}
      className={`flex items-center gap-3 p-4 rounded-2xl border cursor-pointer
        transition-all hover:shadow-md active:scale-[0.99] group
        ${esUrgent 
          ? 'bg-amber-50 dark:bg-amber-900/15 border-amber-200 dark:border-amber-800/50' 
          : 'bg-white dark:bg-zinc-900 border-zinc-100 dark:border-zinc-800 hover:border-zinc-200 dark:hover:border-zinc-700'}`}>
        
      <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0"
        style={{ background: item.color + '20' }}>
        {item.icono}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="font-bold text-sm text-zinc-900 dark:text-white truncate leading-tight">
            {item.nombre}
          </p>
          <span className="text-[9px] uppercase tracking-wider font-bold text-zinc-400 border border-zinc-200 dark:border-zinc-700 px-1.5 py-0.5 rounded-md">
            {item.tipo}
          </span>
        </div>
        <p className="text-xs text-zinc-500 mt-0.5">Día {item.diaRelevante} del mes</p>
      </div>

      <div className="flex items-center gap-3">
        <div className="text-right">
          <p className="text-sm font-bold" style={{ color: item.color }}>
            {item.tipo === 'Suscripción' && item.moneda !== 'ARS' ? `${item.moneda} ` : ''}
            {fmtMonto(item.monto)}
          </p>
          <p className={`text-[10px] font-semibold mt-0.5 ${
            item.diasRestantes === 0 ? 'text-red-500' : 
            esUrgent ? 'text-amber-600 dark:text-amber-400' : 'text-zinc-400'
          }`}>
            {item.diasRestantes === 0 ? '¡Hoy!' : `Faltan ${item.diasRestantes}d`}
          </p>
        </div>

        <button 
          onClick={(e) => { e.stopPropagation(); setNotiActiva(!notiActiva); }}
          className={`p-1.5 rounded-full transition-all flex-shrink-0
            ${notiActiva ? 'bg-amber-100 text-amber-500 dark:bg-amber-500/20' : 'bg-zinc-100 text-zinc-400 dark:bg-zinc-800'}`}
          title={notiActiva ? "Notificaciones activadas (Desactivar)" : "Activar notificación"}
        >
          {notiActiva ? '🔔' : '🔕'}
        </button>
      </div>
    </div>
  )
}

export function AgendaPage() {
  const { usuario } = useAuthContext()
  const [tab, setTab] = useState('pagos')
  
  // Hooks
  const { vencimientos, cargando: cVencimientos, crear: crearV, editar: editarV, borrar: borrarV } = useVencimientos()
  const { suscripciones, cargando: cSuscripciones, crear: crearS, editar: editarS, borrar: borrarS } = useSuscripciones()

  const cargando = cVencimientos || cSuscripciones

  // Modals state
  const [modalVencimiento, setModalVencimiento] = useState(false)
  const [modalSuscripcion, setModalSuscripcion] = useState(false)
  const [seleccionado, setSeleccionado] = useState(null)

  // Unificar y ordenar datos
  const itemsUnificados = useMemo(() => {
    const hoy = new Date()
    const diaHoy = hoy.getDate()
    
    // Función auxiliar para calcular días restantes
    const calcDias = (diaBase) => {
      if (!diaBase) return 15; // fallback
      let d = Number(diaBase)
      if (d < diaHoy) return (30 - diaHoy) + d; // aproximación mes siguiente
      return d - diaHoy;
    }

    const v = vencimientos.map( item => ({
      ...item,
      tipo: 'Vencimiento',
      diaRelevante: item.dia_vencimiento,
      diasRestantes: calcDias(item.dia_vencimiento)
    }))

    const s = suscripciones.filter(s => s.activa).map( item => ({
      ...item,
      tipo: 'Suscripción',
      diaRelevante: item.dia_cobro || 1, // fallback si no tiene día
      diasRestantes: calcDias(item.dia_cobro || 1)
    }))

    return [...v, ...s].sort((a, b) => a.diasRestantes - b.diasRestantes)
  }, [vencimientos, suscripciones])

  // Handlers Vencimientos
  const handleGuardarV = async (datos) => {
    if (seleccionado) await editarV(seleccionado.id, datos)
    else await crearV({ ...datos, usuario_id: usuario?.id })
    setModalVencimiento(false); setSeleccionado(null)
  }
  const handleEliminarV = async () => {
    if (window.confirm(`¿Eliminás "${seleccionado.nombre}"?`)) {
      await borrarV(seleccionado.id)
      setModalVencimiento(false); setSeleccionado(null)
    }
  }

  // Handlers Suscripciones
  const handleGuardarS = async (datos) => {
    if (seleccionado) await editarS(seleccionado.id, datos)
    else await crearS({ ...datos, usuario_id: usuario?.id })
    setModalSuscripcion(false); setSeleccionado(null)
  }
  const handleEliminarS = async () => {
    if (window.confirm(`¿Eliminás "${seleccionado.nombre}"?`)) {
      await borrarS(seleccionado.id)
      setModalSuscripcion(false); setSeleccionado(null)
    }
  }

  return (
    <div className="animate-in fade-in duration-500">
      <PageWrapper>
        <PageHeader
          titulo="Agenda de Pagos"
          subtitulo="Tus vencimientos y suscripciones en un solo lugar"
          accion={
            tab === 'pagos' && (
              <div className="flex gap-2">
                <Button variante="secondary" size="sm" onClick={() => { setSeleccionado(null); setModalVencimiento(true) }}>
                  + Vencimiento
                </Button>
                <Button size="sm" onClick={() => { setSeleccionado(null); setModalSuscripcion(true) }}>
                  + Suscripción
                </Button>
              </div>
            )
          }
        />

        <div className="flex bg-zinc-100 dark:bg-zinc-800 rounded-xl p-1 mb-5">
          <button
            onClick={() => setTab('pagos')}
            className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-colors ${
              tab === 'pagos'
                ? 'bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white shadow-sm'
                : 'text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'
            }`}
          >
            📅 Próximos Pagos
          </button>
          <button
            onClick={() => setTab('catalogo')}
            className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-colors ${
              tab === 'catalogo'
                ? 'bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white shadow-sm'
                : 'text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'
            }`}
          >
            🏪 Catálogo de Subs
          </button>
        </div>

        {tab === 'pagos' && (
          <>
            {cargando ? (
              <div className="flex flex-col gap-3">
                {[0,1,2].map(i => <div key={i} className="h-20 bg-zinc-100 dark:bg-zinc-800 rounded-2xl animate-pulse" />)}
              </div>
            ) : itemsUnificados.length === 0 ? (
              <Card className="py-12">
                <EmptyState
                  icono="📅"
                  titulo="Sin pagos próximos"
                  descripcion="Agregá tus facturas, alquiler o suscripciones para que Manguito te avise."
                />
              </Card>
            ) : (
              <div className="flex flex-col gap-3">
                {itemsUnificados.map(item => (
                  <TarjetaAgenda
                    key={item.id + item.tipo}
                    item={item}
                    onClick={() => {
                      setSeleccionado(item)
                      if (item.tipo === 'Vencimiento') setModalVencimiento(true)
                      else setModalSuscripcion(true)
                    }}
                  />
                ))}
              </div>
            )}
          </>
        )}

        {tab === 'catalogo' && (
          <CatalogoSuscripciones 
            onAgregarSuscripcion={async (datos) => {
              await crearS({ ...datos, usuario_id: usuario?.id })
              setTab('pagos')
            }} 
          />
        )}
      </PageWrapper>

      {/* Modal Vencimiento */}
      <Modal abierto={modalVencimiento} onCerrar={() => { setModalVencimiento(false); setSeleccionado(null) }} titulo={seleccionado ? "Editar Vencimiento" : "Nuevo Vencimiento"}>
        <FormVencimiento inicial={seleccionado} onSubmit={handleGuardarV} onCancel={() => setModalVencimiento(false)} />
        {seleccionado && (
          <button onClick={handleEliminarV} className="w-full mt-3 py-2.5 rounded-xl text-sm font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20">
            🗑️ Eliminar Vencimiento
          </button>
        )}
      </Modal>

      {/* Modal Suscripción */}
      <Modal abierto={modalSuscripcion} onCerrar={() => { setModalSuscripcion(false); setSeleccionado(null) }} titulo={seleccionado ? "Editar Suscripción" : "Nueva Suscripción"} ancho="max-w-md">
        <FormSuscripcion inicial={seleccionado} onSubmit={handleGuardarS} onCancel={() => setModalSuscripcion(false)} />
        {seleccionado && (
          <button onClick={handleEliminarS} className="w-full mt-3 py-2.5 rounded-xl text-sm font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20">
            🗑️ Eliminar Suscripción
          </button>
        )}
      </Modal>

    </div>
  )
}
