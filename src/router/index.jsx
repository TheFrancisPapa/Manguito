import { createBrowserRouter, Navigate, Outlet } from 'react-router-dom'
import { lazy, Suspense } from 'react'
import { AuthProvider } from '../context/AuthContext'
import { PrivateRoute, PublicRoute } from './guards'
import { PageLoader } from '../components/ui'

const LoginPage         = lazy(() => import('../pages/Login').then(m => ({ default: m.LoginPage })))
const RegistroPage      = lazy(() => import('../pages/Registro').then(m => ({ default: m.RegistroPage })))
const RecuperarPassword = lazy(() => import('../pages/RecuperarPassword').then(m => ({ default: m.RecuperarPassword })))
const ResetPassword     = lazy(() => import('../pages/ResetPassword').then(m => ({ default: m.ResetPassword })))
const DashboardPage     = lazy(() => import('../pages/Dashboard').then(m => ({ default: m.DashboardPage })))
const MovimientosPage   = lazy(() => import('../pages/Movimientos').then(m => ({ default: m.MovimientosPage })))
const PresupuestosPage  = lazy(() => import('../pages/Presupuestos').then(m => ({ default: m.PresupuestosPage })))
const MetasPage         = lazy(() => import('../pages/Metas').then(m => ({ default: m.MetasPage })))
const ConfiguracionPage = lazy(() => import('../pages/Configuracion').then(m => ({ default: m.ConfiguracionPage })))
const ChatPage          = lazy(() => import('../pages/Chat').then(m => ({ default: m.ChatPage })))
const CotizacionesPage  = lazy(() => import('../pages/Cotizaciones').then(m => ({ default: m.CotizacionesPage })))
const InversionesPage   = lazy(() => import('../pages/Inversiones').then(m => ({ default: m.InversionesPage })))
const PlanesPage        = lazy(() => import('../pages/Configuracion/Planes').then(m => ({ default: m.PlanesPage })))
const LandingPage       = lazy(() => import('../pages/Landing').then(m => ({ default: m.LandingPage })))

function Root() {
  return (
    <AuthProvider>
      <Suspense fallback={<PageLoader />}>
        <Outlet />
      </Suspense>
    </AuthProvider>
  )
}

export const router = createBrowserRouter([
  {
    element: <Root />,
    children: [
      { path: '/',                     element: <LandingPage /> },
      { path: '/login',                element: <PublicRoute><LoginPage /></PublicRoute> },
      { path: '/registro',             element: <PublicRoute><RegistroPage /></PublicRoute> },
      { path: '/recuperar-password',   element: <PublicRoute><RecuperarPassword /></PublicRoute> },
      { path: '/reset-password',       element: <PublicRoute><ResetPassword /></PublicRoute> },
      { path: '/dashboard',            element: <PrivateRoute><DashboardPage /></PrivateRoute> },
      { path: '/movimientos',          element: <PrivateRoute><MovimientosPage /></PrivateRoute> },
      { path: '/presupuestos',         element: <PrivateRoute><PresupuestosPage /></PrivateRoute> },
      { path: '/metas',                element: <PrivateRoute><MetasPage /></PrivateRoute> },
      { path: '/chat',                 element: <PrivateRoute><ChatPage /></PrivateRoute> },
      { path: '/cotizaciones',         element: <PrivateRoute><CotizacionesPage /></PrivateRoute> },
      { path: '/inversiones',          element: <PrivateRoute><InversionesPage /></PrivateRoute> },
      { path: '/configuracion',        element: <PrivateRoute><ConfiguracionPage /></PrivateRoute> },
      { path: '/configuracion/planes', element: <PrivateRoute><PlanesPage /></PrivateRoute> },
      { path: '*',                     element: <Navigate to="/dashboard" replace /> },
    ]
  }
])