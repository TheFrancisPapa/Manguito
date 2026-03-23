import { useState } from 'react'
import { useAuthContext } from '../../context/AuthContext.jsx'
import { logout } from '../../api/auth.js'
import { PageWrapper, PageHeader, Sidebar, BottomNav } from '../../components/layout/index.js'
import { Card, Button, Select } from '../../components/ui/index.js'

export function ConfiguracionPage() {
  const { usuario } = useAuthContext()
  const [cargando, setCargando] = useState(false)
  
  // Estado para el modo oscuro (chequea si ya está activo en el HTML o en localStorage)
  const [esOscuro, setEsOscuro] = useState(
    document.documentElement.classList.contains('dark') || 
    localStorage.getItem('theme') === 'dark'
  )

  const toggleTema = () => {
    const nuevoEstado = !esOscuro
    setEsOscuro(nuevoEstado)
    
    if (nuevoEstado) {
      document.documentElement.classList.add('dark')
      localStorage.setItem('theme', 'dark')
    } else {
      document.documentElement.classList.remove('dark')
      localStorage.setItem('theme', 'light')
    }
  }

  const handleLogout = async () => {
    if(window.confirm('¿Seguro que querés cerrar sesión?')) {
      setCargando(true)
      try {
        await logout()
        window.location.href = '/login'
      } catch (error) {
        console.error(error)
        setCargando(false)
      }
    }
  }

  const inicial = usuario?.nombre?.[0]?.toUpperCase() ?? '🥭'

  return (
    <div className="animate-in fade-in duration-500">
      <Sidebar usuario={usuario} />
      <BottomNav />
      <PageWrapper>
        <PageHeader titulo="Mi Perfil" subtitulo="Configuración de tu cuenta" />

        <div className="max-w-2xl mt-6 flex flex-col gap-6">
          
          {/* Tarjeta de Perfil */}
          <Card className="flex flex-col sm:flex-row items-center gap-6 p-6 md:p-8">
            <div className="w-24 h-24 rounded-full bg-amber-100 dark:bg-amber-900/40 flex items-center justify-center text-4xl text-amber-700 dark:text-amber-400 font-bold shadow-inner border-4 border-white dark:border-zinc-800">
              {inicial}
            </div>
            <div className="flex-1 text-center sm:text-left">
              <h2 className="text-2xl font-bold text-zinc-900 dark:text-white">{usuario?.nombre}</h2>
              <p className="text-zinc-500 dark:text-zinc-400 mt-1">{usuario?.email}</p>
              <div className="mt-4 inline-flex items-center gap-2 px-3 py-1 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 rounded-full text-xs font-medium border border-emerald-200 dark:border-emerald-800/50">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                Cuenta activa
              </div>
            </div>
          </Card>

          {/* Tarjeta de Preferencias */}
          <Card>
            <h3 className="text-lg font-semibold mb-4 text-zinc-900 dark:text-white">Preferencias</h3>
            
            <div className="flex flex-col gap-4">
              {/* Toggle de Modo Oscuro */}
              <div className="flex items-center justify-between p-4 bg-zinc-50 dark:bg-zinc-800/50 rounded-2xl border border-zinc-100 dark:border-zinc-800">
                <div>
                  <p className="font-medium text-sm text-zinc-900 dark:text-white">Apariencia Visual</p>
                  <p className="text-xs text-zinc-500 mt-0.5">Elegí entre modo claro y oscuro.</p>
                </div>
                <button 
                  onClick={toggleTema}
                  className="relative inline-flex h-8 w-14 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none bg-zinc-200 dark:bg-amber-500"
                >
                  <span className="sr-only">Cambiar tema</span>
                  <span className={`pointer-events-none flex h-7 w-7 transform items-center justify-center rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${esOscuro ? 'translate-x-6' : 'translate-x-0'}`}>
                    {esOscuro ? '🌙' : '☀️'}
                  </span>
                </button>
              </div>

              {/* Moneda */}
              <div className="flex items-center justify-between p-4 bg-zinc-50 dark:bg-zinc-800/50 rounded-2xl border border-zinc-100 dark:border-zinc-800">
                 <div>
                  <p className="font-medium text-sm text-zinc-900 dark:text-white">Moneda Principal</p>
                  <p className="text-xs text-zinc-500 mt-0.5">Símbolo para tus reportes.</p>
                </div>
                <div className="w-32">
                  <Select value={usuario?.moneda || 'ARS'} onChange={() => alert('¡Pronto vas a poder cambiar esto!')}>
                    <option value="ARS">ARS ($)</option>
                    <option value="USD">USD (U$D)</option>
                  </Select>
                </div>
              </div>
            </div>
          </Card>

          {/* Zona de Peligro */}
          <div className="mt-4">
            <Button variante="danger" className="w-full sm:w-auto py-3 px-6 shadow-md shadow-red-500/20" onClick={handleLogout} cargando={cargando} icono="👋">
              Cerrar Sesión
            </Button>
            <p className="text-xs text-zinc-400 mt-4 text-center sm:text-left">
              Manguito v1.0.0 • Hecho con amor.
            </p>
          </div>

        </div>
      </PageWrapper>
    </div>
  )
}