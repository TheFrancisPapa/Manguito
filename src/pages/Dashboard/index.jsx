// src/pages/Dashboard/index.jsx
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuthContext } from '../../context/AuthContext'
import { useBalance, useGastosXCategoria, useUltimosMovimientos, useEvolucionMensual } from '../../hooks/useMovimientos'
import { crearMovimiento } from '../../api/movimientos'
import { usePresupuestos } from '../../hooks/usePresupuestos'
import { useMetas } from '../../hooks/useMetas'
import { useInversiones } from '../../hooks/useInversiones'
import { PageWrapper, PageHeader, Sidebar, BottomNav, MovCard, PresupCard } from '../../components/layout'
import { Card, CardHeader, Button, EmptyState, EMPTY_STATES, Modal } from '../../components/ui'
import { ResumenBalance, GraficoTorta, BarraMeta, LineaTemporal } from '../../components/charts'
import { FormMovimiento } from '../../components/forms/FormMovimiento'
import { ChangelogModal } from '../../components/ui/ChangelogModal'

function useRangoMes() {
  const [rango] = useState(() => {
    const hoy = new Date()
    const primerDia = new Date(hoy.getFullYear(), hoy.getMonth(), 1)
    return {
      desde: primerDia.toLocaleDateString('sv-SE'),
      hasta: hoy.toLocaleDateString('sv-SE'),
    }
  })
  return rango
}

function obtenerSaludo(nombre) {
  const hora = new Date().getHours()
  const primerNombre = nombre?.split(' ')[0] || 'che'
  if (hora >= 5 && hora < 12)  return { saludo: `Buenos días, ${primerNombre}`, emoji: '🌅' }
  if (hora >= 12 && hora < 20) return { saludo: `Buenas tardes, ${primerNombre}`, emoji: '☀️' }
  return { saludo: `Buenas noches, ${primerNombre}`, emoji: '🌙' }
}

// Mini card de inversiones para el Dashboard
function MiniInversiones({ portfolio, dolarRate, cargando, navigate }) {
  if (cargando) {
    return <div className="h-20 bg-zinc-100 dark:bg-zinc-800 rounded-2xl animate-pulse" />
  }

  const fmtARS = (n) => n == null ? '—' : `$\u00A0${Number(n).toLocaleString('es-AR', { maximumFractionDigits: 0 })}`
  const fmtUSD = (n) => n == null ? '—' : `U$D\u00A0${Number(n).toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`

  const positivo = (portfolio?.gananciaARS ?? 0) >= 0
  const tienePortfolio = portfolio && portfolio.totalValorARS > 0

  if (!tienePortfolio) {
    return (
      <div
        onClick={() => navigate('/inversiones')}
        className="flex items-center justify-between p-4 bg-white dark:bg-zinc-900 border border-dashed border-zinc-200 dark:border-zinc-700 rounded-2xl cursor-pointer hover:border-[var(--mango)]/50 transition-colors">
        <div className="flex items-center gap-3">
          <span className="text-2xl">📈</span>
          <div>
            <p className="text-sm font-semibold text-zinc-600 dark:text-zinc-400">Registrá tus inversiones</p>
            <p className="text-xs text-zinc-400">Acciones, cripto, CEDEARs y más</p>
          </div>
        </div>
        <span className="text-zinc-300 dark:text-zinc-600 text-lg">→</span>
      </div>
    )
  }

  return (
    <div
      onClick={() => navigate('/inversiones')}
      className="flex items-center justify-between p-4 bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-2xl cursor-pointer hover:border-[var(--mango)]/40 transition-all group">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-[var(--mango)]/10 flex items-center justify-center text-lg">📈</div>
        <div>
          <p className="text-xs text-zinc-400 uppercase tracking-wider font-medium">Cartera</p>
          <p className="text-base font-black text-zinc-900 dark:text-white">{fmtARS(portfolio.totalValorARS)}</p>
          <p className="text-xs text-zinc-400">{fmtUSD(portfolio.totalValorUSD)}</p>
        </div>
      </div>
      <div className="text-right">
        <div className={`inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-xs font-bold ${
          positivo
            ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400'
            : 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400'
        }`}>
          {positivo ? '▲' : '▼'} {Math.abs(portfolio.gananciaTotalPct ?? 0).toFixed(2)}%
        </div>
        <p className="text-xs text-zinc-400 mt-1 group-hover:text-[var(--mango-dark)] transition-colors">Ver cartera →</p>
      </div>
    </div>
  )
}

export function DashboardPage() {
  const { usuario }   = useAuthContext()
  const navigate      = useNavigate()

  const { desde, hasta } = useRangoMes()
  const { balance, cargando: cBal }                    = useBalance(desde, hasta)
  const { datos: gastosXCat, cargando: cTorta }        = useGastosXCategoria(desde, hasta)
  const { movimientos, cargando: cMovs, recargar: recargarMovs } = useUltimosMovimientos(5)
  const { presupuestos, resumen, cargando: cPresup }   = usePresupuestos()
  const { metas, cargando: cMetas }                    = useMetas('activa')
  const { datos: evolucion, cargando: cEvo }           = useEvolucionMensual(6)
  const { portfolio, dolarRate, cargando: cInv }       = useInversiones()

  const [modalMovs, setModalMovs] = useState(false)

  const mesActual = new Date().toLocaleDateString('es-AR', { month: 'long', year: 'numeric' })
  const mesCapitalizado = mesActual.charAt(0).toUpperCase() + mesActual.slice(1)
  const { saludo, emoji } = obtenerSaludo(usuario?.nombre)

  const hoyStr = new Date().toLocaleDateString('sv-SE').slice(5)
  const esCumple = usuario?.fecha_nacimiento?.slice(5) === hoyStr

  const handleGuardarMovimiento = async (datos) => {
    await crearMovimiento({ ...datos, usuario_id: usuario.id })
    setModalMovs(false)
    recargarMovs()
  }

  return (
    <div className="animate-in fade-in duration-500">
      <ChangelogModal />
      <Sidebar usuario={usuario} />
      <BottomNav />

      <PageWrapper>
        {/* Banner cumpleaños */}
        {esCumple && (
          <div className="bg-gradient-to-r from-amber-400 to-orange-500 text-white p-4 rounded-2xl mb-5
            shadow-lg flex items-center gap-3 animate-in slide-in-from-top-4 duration-700">
            <span className="text-4xl animate-bounce flex-shrink-0">🎂</span>
            <div>
              <h3 className="font-extrabold text-lg leading-tight">¡Feliz Cumple, {usuario?.nombre?.split(' ')[0]}!</h3>
              <p className="text-sm opacity-90 mt-0.5">Date un gustito hoy 😉</p>
            </div>
          </div>
        )}

        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-xl font-bold text-zinc-900 dark:text-white leading-tight">
              {saludo} {emoji}
            </h1>
            <p className="text-sm text-zinc-400 mt-0.5">Resumen de {mesCapitalizado}</p>
          </div>
          <Button icono="+" onClick={() => setModalMovs(true)} tamaño="md">
            Nuevo
          </Button>
        </div>

        {/* Balance */}
        <div className="mb-4">
          <ResumenBalance balance={balance} moneda={usuario?.moneda} cargando={cBal} />
        </div>

        {/* Mini cartera de inversiones */}
        <div className="mb-4">
          <MiniInversiones
            portfolio={portfolio}
            dolarRate={dolarRate}
            cargando={cInv}
            navigate={navigate}
          />
        </div>

        {/* Gastos por categoría */}
        <Card className="mb-4">
          <CardHeader titulo="Gastos por categoría" />
          <div className="mt-2 min-h-[200px] flex items-center justify-center">
            <GraficoTorta datos={gastosXCat} moneda={usuario?.moneda} cargando={cTorta} />
          </div>
        </Card>

        {/* Evolución mensual */}
        <Card className="mb-4">
          <CardHeader titulo="Evolución mensual" subtitulo="Últimos 6 meses" />
          <div className="mt-2">
            <LineaTemporal datos={evolucion} moneda={usuario?.moneda} cargando={cEvo} />
          </div>
        </Card>

        {/* Últimos movimientos */}
        <Card className="mb-4">
          <CardHeader
            titulo="Últimos movimientos"
            accion={
              <Link to="/movimientos"
                className="text-xs font-semibold text-amber-600 dark:text-amber-400 hover:text-amber-700">
                Ver todo →
              </Link>
            }
          />
          <div className="mt-2">
            {cMovs ? (
              [0, 1, 2, 3].map(i => (
                <div key={i} className="h-14 bg-zinc-100 dark:bg-zinc-800 rounded-xl animate-pulse mb-2" />
              ))
            ) : movimientos.length === 0 ? (
              <EmptyState
                {...EMPTY_STATES.movimientos}
                accion={<Button icono="+" onClick={() => setModalMovs(true)}>Registrar ahora</Button>}
              />
            ) : (
              movimientos.map(m => <MovCard key={m.id} movimiento={m} />)
            )}
          </div>
        </Card>

        {/* Presupuestos */}
        <Card className="mb-4">
          <CardHeader
            titulo="Tus Límites"
            subtitulo={
              resumen.excedidos > 0
                ? `${resumen.excedidos} excedido${resumen.excedidos > 1 ? 's' : ''} 🚨`
                : 'Todo bajo control'
            }
            accion={
              <Link to="/presupuestos"
                className="text-xs font-semibold text-amber-600 dark:text-amber-400 hover:text-amber-700">
                Ver todos →
              </Link>
            }
          />
          <div className="mt-2">
            {cPresup ? (
              [0, 1, 2].map(i => (
                <div key={i} className="h-14 bg-zinc-100 dark:bg-zinc-800 rounded-xl animate-pulse mb-2" />
              ))
            ) : presupuestos.length === 0 ? (
              <EmptyState
                {...EMPTY_STATES.presupuestos}
                accion={
                  <Button variante="secondary" onClick={() => navigate('/presupuestos')}>
                    Crear límite
                  </Button>
                }
              />
            ) : (
              presupuestos.slice(0, 3).map(p => (
                <PresupCard key={p.id} presupuesto={p} onClick={() => navigate('/presupuestos')} />
              ))
            )}
          </div>
        </Card>

        {/* Metas */}
        {!cMetas && metas.length > 0 ? (
          <div className="mb-4">
            <div className="flex items-center justify-between mb-3 px-1">
              <h2 className="text-xs font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">
                Tus Objetivos
              </h2>
              <Link to="/metas" className="text-xs font-semibold text-amber-600 dark:text-amber-400">
                Ver más →
              </Link>
            </div>
            <div className="flex flex-col gap-3">
              {metas.slice(0, 2).map(m => (
                <BarraMeta key={m.id} meta={m} moneda={usuario?.moneda} />
              ))}
            </div>
          </div>
        ) : !cMetas && metas.length === 0 ? (
          <Card className="mb-4 bg-amber-50/50 dark:bg-amber-900/5 border-amber-100 dark:border-amber-900/20 text-center py-8">
            <span className="text-4xl mb-3 block">🎯</span>
            <h3 className="font-semibold text-zinc-900 dark:text-white mb-1 text-sm">Ponete una meta</h3>
            <p className="text-xs text-zinc-500 mb-4 px-4">Ahorrar es más fácil cuando sabés para qué.</p>
            <Button variante="secondary" onClick={() => navigate('/metas')}>
              Crear primera meta
            </Button>
          </Card>
        ) : null}

      </PageWrapper>

      <Modal abierto={modalMovs} onCerrar={() => setModalMovs(false)} titulo="Nuevo movimiento">
        <FormMovimiento onSubmit={handleGuardarMovimiento} onCancel={() => setModalMovs(false)} />
      </Modal>
    </div>
  )
}