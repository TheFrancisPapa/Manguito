// src/router/index.jsx — ACTUALIZADO con nuevas rutas
import { createBrowserRouter, Navigate, Outlet } from 'react-router-dom'
import { lazy, Suspense } from 'react'
import { AuthProvider } from '../context/AuthContext'
import { PrivateRoute, PublicRoute } from './guards'
import { PageLoader, ErrorBoundary } from '../components/ui'

// ── Rutas públicas ───────────────────────────────────────────
const LoginPage         = lazy(() => import('../pages/Login').then(m => ({ default: m.LoginPage })))
const RegistroPage      = lazy(() => import('../pages/Registro').then(m => ({ default: m.RegistroPage })))
const RecuperarPassword = lazy(() => import('../pages/RecuperarPassword').then(m => ({ default: m.RecuperarPassword })))
const ResetPassword     = lazy(() => import('../pages/ResetPassword').then(m => ({ default: m.ResetPassword })))
const LandingPage       = lazy(() => import('../pages/Landing').then(m => ({ default: m.LandingPage })))

// ── Rutas privadas ───────────────────────────────────────────
const DashboardPage     = lazy(() => import('../pages/Dashboard').then(m => ({ default: m.DashboardPage })))
const MovimientosPage   = lazy(() => import('../pages/Movimientos').then(m => ({ default: m.MovimientosPage })))
const PlanificacionPage = lazy(() => import('../pages/Planificacion').then(m => ({ default: m.PlanificacionPage })))
const AgendaPage        = lazy(() => import('../pages/Agenda').then(m => ({ default: m.AgendaPage })))
const ConfiguracionPage = lazy(() => import('../pages/Configuracion').then(m => ({ default: m.ConfiguracionPage })))
const ChatPage          = lazy(() => import('../pages/Chat').then(m => ({ default: m.ChatPage })))
const CotizacionesPage  = lazy(() => import('../pages/Cotizaciones').then(m => ({ default: m.CotizacionesPage })))
const InversionesPage   = lazy(() => import('../pages/Inversiones').then(m => ({ default: m.InversionesPage })))
const PlanesPage        = lazy(() => import('../pages/Configuracion/Planes').then(m => ({ default: m.PlanesPage })))
const RecursosPage      = lazy(() => import('../pages/Recursos').then(m => ({ default: m.RecursosPage })))
const NaftaPage         = lazy(() => import('../pages/Nafta').then(m => ({ default: m.NaftaPage })))
const CalculadoraPage   = lazy(() => import('../pages/Calculadora').then(m => ({ default: m.CalculadoraPage })))
const ComunidadPage     = lazy(() => import('../pages/Comunidad').then(m => ({ default: m.ComunidadPage })))
const MercadoPage       = lazy(() => import('../pages/Mercado').then(m => ({ default: m.MercadoPage })))

// ── NUEVAS PÁGINAS (Ya unificadas) ─────────────────────────

import { AppLayout, AppShell } from '../components/layout'

function PrivateRoot() {
  return (
    <PrivateRoute>
      <AppLayout />
    </PrivateRoute>
  )
}

function Root() {
  return (
    <AuthProvider>
      <Suspense fallback={<PageLoader />}>
        <AppShell>
          <Outlet />
        </AppShell>
      </Suspense>
    </AuthProvider>
  )
}

export const router = createBrowserRouter([
  {
    element: <Root />,
    errorElement: <ErrorBoundary />,
    children: [
      // ── Públicas ────────────────────────────────────────────
      { path: '/',                     element: <LandingPage /> },
      { path: '/login',                element: <PublicRoute><LoginPage /></PublicRoute> },
      { path: '/registro',             element: <PublicRoute><RegistroPage /></PublicRoute> },
      { path: '/recuperar-password',   element: <PublicRoute><RecuperarPassword /></PublicRoute> },
      { path: '/reset-password',       element: <PublicRoute><ResetPassword /></PublicRoute> },

      // ── Privadas ────────────────────────────────────────────
      {
        element: <PrivateRoot />,
        children: [
          { path: '/dashboard',            element: <DashboardPage /> },
          { path: '/movimientos',          element: <MovimientosPage /> },
          { path: '/planificacion',        element: <PlanificacionPage /> },
          { path: '/agenda',               element: <AgendaPage /> },
          { path: '/chat',                 element: <ChatPage /> },
          { path: '/cotizaciones',         element: <CotizacionesPage /> },
          { path: '/inversiones',          element: <InversionesPage /> },
          { path: '/configuracion',        element: <ConfiguracionPage /> },
          { path: '/configuracion/planes', element: <PlanesPage /> },
          { path: '/recursos',             element: <RecursosPage /> },
          { path: '/nafta',                element: <NaftaPage /> },
          { path: '/calculadora',          element: <CalculadoraPage /> },
          { path: '/comunidad',            element: <ComunidadPage /> },
          { path: '/mercado',              element: <MercadoPage /> },
        ]
      },

      // ── NUEVAS (Ya unificadas) ──────────────────────────────

      { path: '*',                     element: <Navigate to="/dashboard" replace /> },
    ]
  }
])
// Prefetch de las rutas más visitadas cuando el navegador esté idle
if (typeof window !== 'undefined') {
  const prefetchRoutes = [
    () => import('../pages/Dashboard'),
    () => import('../pages/Movimientos'),
    () => import('../pages/Cotizaciones'),
  ]

  window.requestIdleCallback?.(() => {
    prefetchRoutes.forEach(fn => fn().catch(() => { }))
  }, { timeout: 3000 })
}