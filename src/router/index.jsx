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

function Root() {
  return <AuthProvider><Outlet /></AuthProvider>
}

export const router = createBrowserRouter([
  {
    element: <Root />,
    children: [
      { path: '/', element: <Navigate to="/dashboard" replace /> },
      { path: '/login',              element: <PublicRoute><LoginPage /></PublicRoute> },
      { path: '/registro',           element: <PublicRoute><RegistroPage /></PublicRoute> },
      { path: '/recuperar-password', element: <PublicRoute><RecuperarPassword /></PublicRoute> },
      { path: '/reset-password',     element: <PublicRoute><ResetPassword /></PublicRoute> },
      { path: '/dashboard',    element: <PrivateRoute><DashboardPage /></PrivateRoute> },
      { path: '/movimientos',  element: <PrivateRoute><MovimientosPage /></PrivateRoute> },
      { path: '/presupuestos', element: <PrivateRoute><PresupuestosPage /></PrivateRoute> },
      { path: '/metas',        element: <PrivateRoute><MetasPage /></PrivateRoute> },
      { path: '/chat',         element: <PrivateRoute><ChatPage /></PrivateRoute> },
      { path: '/configuracion',element: <PrivateRoute><ConfiguracionPage /></PrivateRoute> },
      { path: '*', element: <Navigate to="/dashboard" replace /> },
    ]
  }
])