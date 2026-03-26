import { createBrowserRouter, Navigate, Outlet } from 'react-router-dom'
import { AuthProvider } from '../context/AuthContext'
import { PrivateRoute, PublicRoute } from './guards'

import { LoginPage }         from '../pages/Login'
import { RegistroPage }      from '../pages/Registro'
import { RecuperarPassword } from '../pages/RecuperarPassword'
import { ResetPassword }     from '../pages/ResetPassword'
import { DashboardPage }     from '../pages/Dashboard'
import { MovimientosPage }   from '../pages/Movimientos'
import { PresupuestosPage }  from '../pages/Presupuestos'
import { MetasPage }         from '../pages/Metas'
import { ConfiguracionPage } from '../pages/Configuracion'
import { ChatPage }          from '../pages/Chat'
import { CotizacionesPage }  from '../pages/Cotizaciones'
import { PlanesPage }        from '../pages/Configuracion/Planes'
import { LandingPage }       from '../pages/Landing'

function Root() {
  return <AuthProvider><Outlet /></AuthProvider>
}

export const router = createBrowserRouter([
  {
    element: <Root />,
    children: [
      { path: '/', element: <LandingPage /> },
      { path: '/login',              element: <PublicRoute><LoginPage /></PublicRoute> },
      { path: '/registro',           element: <PublicRoute><RegistroPage /></PublicRoute> },
      { path: '/recuperar-password', element: <PublicRoute><RecuperarPassword /></PublicRoute> },
      { path: '/reset-password',     element: <PublicRoute><ResetPassword /></PublicRoute> },
      { path: '/dashboard',    element: <PrivateRoute><DashboardPage /></PrivateRoute> },
      { path: '/movimientos',  element: <PrivateRoute><MovimientosPage /></PrivateRoute> },
      { path: '/presupuestos', element: <PrivateRoute><PresupuestosPage /></PrivateRoute> },
      { path: '/metas',        element: <PrivateRoute><MetasPage /></PrivateRoute> },
      { path: '/chat',         element: <PrivateRoute><ChatPage /></PrivateRoute> },
      { path: '/cotizaciones', element: <PrivateRoute><CotizacionesPage /></PrivateRoute> },
      { path: '/configuracion',       element: <PrivateRoute><ConfiguracionPage /></PrivateRoute> },
      { path: '/configuracion/planes', element: <PrivateRoute><PlanesPage /></PrivateRoute> },
      { path: '*', element: <Navigate to="/dashboard" replace /> },
    ]
  }
])