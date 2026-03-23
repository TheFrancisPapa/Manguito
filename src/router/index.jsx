import { createBrowserRouter, Navigate } from 'react-router-dom'
import { PrivateRoute, PublicRoute } from './guards.jsx'

// Pages
import { LoginPage }     from '../pages/Login/index.jsx'
import { DashboardPage } from '../pages/Dashboard/index.jsx'
import { MovimientosPage } from '../pages/Movimientos/index.jsx'

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Navigate to="/dashboard" replace />
  },
  {
    path: '/login',
    element: <PublicRoute><LoginPage /></PublicRoute>
  },
  {
    path: '/dashboard',
    element: <PrivateRoute><DashboardPage /></PrivateRoute>
  },
  {
    path: '/movimientos',
    element: <PrivateRoute><MovimientosPage /></PrivateRoute> 
  },
  {
    path: '/presupuestos',
    element: <PrivateRoute><div>Próximamente: Presupuestos</div></PrivateRoute>
  },
  {
    path: '/metas',
    element: <PrivateRoute><div>Próximamente: Metas</div></PrivateRoute>
  },
  {
    path: '/configuracion',
    element: <PrivateRoute><div>Próximamente: Config</div></PrivateRoute>
  }
])