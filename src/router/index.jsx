import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider }  from '../context/AuthContext'
import { ProtectedRoute, PublicRoute } from './guards'
import { LoginPage }     from '../pages/Login'
import { DashboardPage } from '../pages/Dashboard'

function Proximamente({ nombre }) {
  return (
    <div className="min-h-screen flex items-center justify-center flex-col gap-3">
      <span style={{ fontSize: 40 }}>🥭</span>
      <p className="text-zinc-500 text-sm">Página "{nombre}" próximamente</p>
      <a href="/dashboard" className="text-xs text-amber-500 underline">Volver al dashboard</a>
    </div>
  )
}

export function AppRouter() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route element={<PublicRoute />}>
            <Route path="/login" element={<LoginPage />} />
          </Route>
          <Route element={<ProtectedRoute />}>
            <Route path="/onboarding"    element={<Proximamente nombre="Onboarding" />} />
            <Route path="/dashboard"     element={<DashboardPage />} />
            <Route path="/movimientos"   element={<Proximamente nombre="Movimientos" />} />
            <Route path="/presupuestos"  element={<Proximamente nombre="Presupuestos" />} />
            <Route path="/metas"         element={<Proximamente nombre="Metas" />} />
            <Route path="/configuracion" element={<Proximamente nombre="Configuración" />} />
          </Route>
          <Route path="/"  element={<Navigate to="/dashboard" replace />} />
          <Route path="*"  element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}