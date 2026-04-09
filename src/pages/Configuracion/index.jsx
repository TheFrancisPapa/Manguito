// src/pages/Configuracion/index.jsx — iOS Settings style
import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthContext } from '../../context/AuthContext.jsx'
import { useTheme } from '../../hooks/useTheme.js'
import { logout, actualizarPerfil } from '../../api/auth.js'
import { supabase } from '../../lib/supabase.js'
import { PageWrapper, PageHeader } from '../../components/layout/index.js'
import { Card, Button, Spinner } from '../../components/ui/index.js'

// ─── Monedas disponibles ─────────────────────────────────────
const MONEDAS = [
  { codigo: 'ARS', simbolo: '$',  nombre: 'Peso argentino'    },
  { codigo: 'USD', simbolo: 'U$D', nombre: 'Dólar estadounidense' },
  { codigo: 'EUR', simbolo: '€',  nombre: 'Euro'              },
  { codigo: 'BRL', simbolo: 'R$', nombre: 'Real brasileño'    },
  { codigo: 'CLP', simbolo: 'CL$', nombre: 'Peso chileno'     },
  { codigo: 'UYU', simbolo: '$U', nombre: 'Peso uruguayo'     },
  { codigo: 'PYG', simbolo: '₲',  nombre: 'Guaraní paraguayo' },
  { codigo: 'BOB', simbolo: 'Bs', nombre: 'Boliviano'         },
  { codigo: 'PEN', simbolo: 'S/', nombre: 'Sol peruano'       },
  { codigo: 'COP', simbolo: 'CO$', nombre: 'Peso colombiano'  },
  { codigo: 'MXN', simbolo: 'MX$', nombre: 'Peso mexicano'    },
]

// ─── Subir foto a Supabase Storage ───────────────────────────
async function subirFoto(archivo, usuarioId) {
  const ext  = archivo.name.split('.').pop()
  const path = `${usuarioId}.${ext}`
  const { error } = await supabase.storage
    .from('avatars')
    .upload(path, archivo, { upsert: true, contentType: archivo.type })
  if (error) throw error
  const { data } = supabase.storage.from('avatars').getPublicUrl(path)
  return data.publicUrl + '?t=' + Date.now()  // cache-busting
}

export function ConfiguracionPage() {
  const navigate = useNavigate()
  const { usuario, session, recargarPerfil } = useAuthContext()
  const { theme, toggleTheme } = useTheme()
  const inputFotoRef = useRef(null)
  const esOscuro = theme === 'dark'

  // ── estado local
  const [nombre,  setNombre]   = useState(usuario?.nombre  ?? '')
  const [moneda,  setMoneda]   = useState(usuario?.moneda  ?? 'ARS')
  const [preview, setPreview]  = useState(usuario?.avatar_url ?? null)

  const [guardando,    setGuardando]    = useState(false)
  const [subiendoFoto, setSubiendoFoto] = useState(false)
  const [feedback,     setFeedback]     = useState(null)

  // ── selección de foto ────────────────────────────────────────
  async function handleFotoChange(e) {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 2 * 1024 * 1024) {
      setFeedback({ tipo: 'error', msg: 'La imagen no puede superar los 2 MB.' })
      return
    }
    setPreview(URL.createObjectURL(file))
    setSubiendoFoto(true)
    setFeedback(null)
    try {
      const url = await subirFoto(file, session?.user?.id ?? usuario?.id)
      await actualizarPerfil({ avatar_url: url })
      if (recargarPerfil) await recargarPerfil()
      setPreview(url)
      setFeedback({ tipo: 'ok', msg: 'Foto actualizada ✓' })
    } catch (err) {
      console.error(err)
      setFeedback({ tipo: 'error', msg: 'No se pudo subir la foto. ¿Existe el bucket "avatars" en Supabase?' })
    } finally {
      setSubiendoFoto(false)
    }
  }

  // ── guardar perfil ───────────────────────────────────────────
  async function handleGuardar(e) {
    e.preventDefault()
    if (!nombre.trim()) {
      setFeedback({ tipo: 'error', msg: 'El nombre no puede estar vacío.' })
      return
    }
    setGuardando(true)
    setFeedback(null)
    try {
      await actualizarPerfil({ nombre: nombre.trim(), moneda })
      if (recargarPerfil) await recargarPerfil()
      setFeedback({ tipo: 'ok', msg: '¡Cambios guardados!' })
    } catch (err) {
      setFeedback({ tipo: 'error', msg: err.message || 'Error al guardar.' })
    } finally {
      setGuardando(false)
    }
  }

  // ── cerrar sesión ────────────────────────────────────────────
  async function handleLogout() {
    await logout()
    navigate('/login')
  }

  const inicial = nombre?.[0]?.toUpperCase() ?? '🥭'
  const monedaActual = MONEDAS.find(m => m.codigo === moneda)

  // ── iOS Settings Row helper ──────────────────────────────────
  const SettingsRow = ({ children, className = '' }) => (
    <div className={`flex items-center justify-between py-3.5 ${className}`}>
      {children}
    </div>
  )

  return (
    <div className="animate-in fade-in duration-500">
      <PageWrapper>
        <PageHeader titulo="Mi perfil" subtitulo="Configuración de tu cuenta" />

        <div className="max-w-lg flex flex-col gap-5">

          {/* ── Foto de perfil ── */}
          <Card>
            <h3 className="text-[10px] font-extrabold text-[var(--mango-dark)] dark:text-[var(--mango)]
              uppercase tracking-[0.1em] mb-4">
              Foto de perfil
            </h3>
            <div className="flex items-center gap-5">
              <div className="relative flex-shrink-0">
                <div className="w-20 h-20 rounded-2xl overflow-hidden
                  bg-gradient-to-br from-[var(--mango)] to-[var(--mango-dark)]
                  border-2 border-white dark:border-zinc-800 shadow-lg">
                   {preview ? (
                    <img src={preview} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center
                      text-3xl font-bold text-white">
                      {inicial}
                    </div>
                  )}
                  {subiendoFoto && (
                    <div className="absolute inset-0 bg-black/50 rounded-2xl flex items-center justify-center">
                      <Spinner size={20} colorClass="text-white" />
                    </div>
                  )}
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <input
                  ref={inputFotoRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className="hidden"
                  onChange={handleFotoChange}
                />
                <Button
                  variante="secondary"
                  tamaño="sm"
                  onClick={() => inputFotoRef.current?.click()}
                  disabled={subiendoFoto}
                >
                  {subiendoFoto ? 'Subiendo...' : '📷 Cambiar foto'}
                </Button>
                {preview && !subiendoFoto && (
                  <button
                    onClick={async () => {
                      setPreview(null)
                      await actualizarPerfil({ avatar_url: null })
                    }}
                    className="text-xs text-zinc-400 hover:text-red-500 transition-colors">
                    Eliminar foto
                  </button>
                )}
                <p className="text-xs text-zinc-400 dark:text-zinc-500">JPG, PNG o WEBP · máx 2 MB</p>
              </div>
            </div>
          </Card>

          {/* ── Datos personales — iOS grouped style ── */}
          <Card>
            <h3 className="text-[10px] font-extrabold text-[var(--mango-dark)] dark:text-[var(--mango)]
              uppercase tracking-[0.1em] mb-4">
              Datos personales
            </h3>
            <form onSubmit={handleGuardar} className="flex flex-col gap-0">
              {/* Nombre */}
              <SettingsRow className="border-b border-zinc-100 dark:border-zinc-800/60">
                <label className="text-sm font-medium text-zinc-600 dark:text-zinc-300">Nombre</label>
                <input
                  value={nombre}
                  onChange={e => setNombre(e.target.value)}
                  placeholder="Tu nombre"
                  className="text-right text-sm font-medium text-zinc-900 dark:text-white
                    bg-transparent border-none outline-none w-40
                    placeholder:text-zinc-300 dark:placeholder:text-zinc-600"
                />
              </SettingsRow>

              {/* Fecha de Nacimiento */}
              <SettingsRow className="border-b border-zinc-100 dark:border-zinc-800/60">
                <label className="text-sm font-medium text-zinc-600 dark:text-zinc-300">Fecha de nacimiento</label>
                <input
                  type="date"
                  value={usuario?.fecha_nacimiento ?? ''}
                  onChange={async (e) => {
                    try {
                      setFeedback(null)
                      await actualizarPerfil({ fecha_nacimiento: e.target.value })
                      if (recargarPerfil) await recargarPerfil()
                      setFeedback({ tipo: 'ok', msg: 'Fecha actualizada ✓' })
                    } catch (err) {
                      setFeedback({ tipo: 'error', msg: 'No se pudo actualizar la fecha.' })
                    }
                  }}
                  className="text-right text-sm font-medium text-zinc-900 dark:text-white
                    bg-transparent border-none outline-none
                    [color-scheme:light_dark]"
                />
              </SettingsRow>

              {/* Email (solo lectura) */}
              <SettingsRow className="border-b border-zinc-100 dark:border-zinc-800/60">
                <label className="text-sm font-medium text-zinc-600 dark:text-zinc-300">Email</label>
                <span className="text-sm text-zinc-400 dark:text-zinc-500 truncate max-w-[200px]">
                  {usuario?.email ?? ''}
                </span>
              </SettingsRow>

              {/* Moneda */}
              <SettingsRow>
                <label className="text-sm font-medium text-zinc-600 dark:text-zinc-300">Moneda</label>
                <select
                  value={moneda}
                  onChange={e => setMoneda(e.target.value)}
                  className="text-right text-sm font-medium text-zinc-900 dark:text-white
                    bg-transparent border-none outline-none cursor-pointer
                    appearance-none pr-0"
                >
                  {MONEDAS.map(m => (
                    <option key={m.codigo} value={m.codigo}>
                      {m.simbolo} {m.nombre}
                    </option>
                  ))}
                </select>
              </SettingsRow>

              {/* Feedback */}
              {feedback && (
                <div className={`text-xs rounded-xl px-3 py-2 border mt-3 ${
                  feedback.tipo === 'ok'
                    ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 border-emerald-100 dark:border-emerald-900'
                    : 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 border-red-100 dark:border-red-900'
                }`}>
                  {feedback.msg}
                </div>
              )}

              <Button type="submit" cargando={guardando} className="mt-4">
                Guardar cambios
              </Button>
            </form>
          </Card>

          {/* ── Apariencia ── */}
          <Card>
            <h3 className="text-[10px] font-extrabold text-[var(--mango-dark)] dark:text-[var(--mango)]
              uppercase tracking-[0.1em] mb-4">
              Apariencia
            </h3>
            <div className="flex items-center justify-between p-4
              bg-zinc-50 dark:bg-zinc-800/40
              rounded-[18px] border border-zinc-100/60 dark:border-zinc-800/60">
              <div>
                <p className="text-sm font-semibold text-zinc-800 dark:text-white">
                  Modo {esOscuro ? 'oscuro' : 'claro'}
                </p>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                  {esOscuro ? 'Descansá la vista de noche.' : 'Más claridad para el día.'}
                </p>
              </div>
              <button
                onClick={toggleTheme}
                className={`relative inline-flex h-8 w-14 flex-shrink-0 cursor-pointer rounded-full
                  border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none
                  ${esOscuro ? 'bg-[var(--mango)]' : 'bg-zinc-200 dark:bg-zinc-700'}`}>
                <span className={`pointer-events-none flex h-7 w-7 transform items-center justify-center
                  rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out
                  ${esOscuro ? 'translate-x-6' : 'translate-x-0'}`}>
                  {esOscuro ? '🌙' : '☀️'}
                </span>
              </button>
            </div>
          </Card>

          {/* ── Suscripción ── */}
          <Card>
            <h3 className="text-[10px] font-extrabold text-[var(--mango-dark)] dark:text-[var(--mango)]
              uppercase tracking-[0.1em] mb-4">
              Suscripción
            </h3>
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between py-2">
                <div>
                  <p className="text-sm font-semibold text-zinc-800 dark:text-white">Plan Actual</p>
                  <p className="text-xs text-zinc-400 dark:text-zinc-500 capitalize">
                    Plan {usuario?.plan || 'Básico'}
                  </p>
                </div>
                <span className="inline-flex items-center gap-1.5 px-3 py-1
                  bg-emerald-50 dark:bg-emerald-900/20
                  text-emerald-700 dark:text-emerald-400
                  rounded-full text-xs font-semibold
                  border border-emerald-200/60 dark:border-emerald-800/40">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-live-dot" />
                  Activa
                </span>
              </div>
              <Button variante="secondary" className="w-full" onClick={() => navigate('/configuracion/planes')}>
                🚀 Gestionar mi suscripción
              </Button>
            </div>
          </Card>

          {/* ── Cuenta ── */}
          <Card>
            <h3 className="text-[10px] font-extrabold text-[var(--mango-dark)] dark:text-[var(--mango)]
              uppercase tracking-[0.1em] mb-4">
              Cuenta
            </h3>
            <Button
              variante="danger"
              className="w-full"
              onClick={handleLogout}
              icono="🚪"
            >
              Cerrar sesión
            </Button>
          </Card>

          <p className="text-xs text-zinc-400 dark:text-zinc-500 text-center pb-4">
            Manguito 🥭 · Hecho con ❤️ en Argentina
          </p>
        </div>
      </PageWrapper>
    </div>
  )
}