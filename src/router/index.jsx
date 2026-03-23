import { createBrowserRouter, Navigate } from 'react-router-dom'
import { AuthProvider } from '../context/AuthContext'
import { PrivateRoute, PublicRoute } from './guards'

// Pages
import { LoginPage }        from '../pages/Login'
import { RegistroPage }     from '../pages/Registro'
import { DashboardPage }    from '../pages/Dashboard'
import { MovimientosPage }  from '../pages/Movimientos'
import { PresupuestosPage } from '../pages/Presupuestos'
import { MetasPage }        from '../pages/Metas'

// Wrapper que inyecta el AuthProvider en toda la app
function Root({ children }) {
  return <AuthProvider>{children}</AuthProvider>
}

export const router = createBrowserRouter([
  {
    element: <Root><></></Root>,  // root wrapper — AuthProvider necesita estar arriba
    children: [
      { path: '/', element: <Navigate to="/dashboard" replace /> },

      // Rutas públicas
      { path: '/login',    element: <PublicRoute><LoginPage /></PublicRoute> },
      { path: '/registro', element: <PublicRoute><RegistroPage /></PublicRoute> },

      // Rutas protegidas
      { path: '/dashboard',    element: <PrivateRoute><DashboardPage /></PrivateRoute> },
      { path: '/movimientos',  element: <PrivateRoute><MovimientosPage /></PrivateRoute> },
      { path: '/presupuestos', element: <PrivateRoute><PresupuestosPage /></PrivateRoute> },
      { path: '/metas',        element: <PrivateRoute><MetasPage /></PrivateRoute> },
      { path: '/configuracion',element: <PrivateRoute><div className="p-8 text-zinc-400">Configuración — próximamente</div></PrivateRoute> },

      // Catch-all
      { path: '*', element: <Navigate to="/dashboard" replace /> },
    ]
  }
])