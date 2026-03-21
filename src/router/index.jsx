// src/router/index.jsx
// Todas las rutas de Manguito en un solo lugar.

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider }       from '../context/AuthContext'
import { ProtectedRoute,
         PublicRoute }        from './guards'

// Pages
import { LoginPage }          from '../pages/Login'
import { DashboardPage }      from '../pages/Dashboard'
import { MovimientosPage }    from '../pages/Movimientos'
import { PresupuestosPage }   from '../pages/Presupuestos'
import { MetasPage }          from '../pages/Metas'
import { ConfiguracionPage }  from '../pages/Configuracion'
import { OnboardingPage }     from '../pages/Onboarding'

export function AppRouter() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Rutas públicas — redirigen al dashboard si ya estás logueado */}
          <Route element={<PublicRoute />}>
            <Route path="/login"      element={<LoginPage />} />
          </Route>

          {/* Rutas protegidas — redirigen al login si no estás logueado */}
          <Route element={<ProtectedRoute />}>
            <Route path="/onboarding"  element={<OnboardingPage />} />
            <Route path="/dashboard"   element={<DashboardPage />} />
            <Route path="/movimientos" element={<MovimientosPage />} />
            <Route path="/presupuestos"element={<PresupuestosPage />} />
            <Route path="/metas"       element={<MetasPage />} />
            <Route path="/configuracion" element={<ConfiguracionPage />} />
          </Route>

          {/* Raíz → dashboard si logueado, login si no */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}