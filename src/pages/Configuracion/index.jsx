// src/pages/Configuracion/index.jsx — Premium Redesign v2
import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthContext } from '../../context/AuthContext.jsx'
import { useTheme } from '../../hooks/useTheme.js'
import { logout, actualizarPerfil } from '../../api/auth.js'
import { supabase } from '../../lib/supabase.js'
import { PageWrapper } from '../../components/layout/index.js'
import { Spinner } from '../../components/ui/index.js'

const MONEDAS = [
  { codigo: 'ARS', simbolo: '$',   nombre: 'Peso argentino'          },
  { codigo: 'USD', simbolo: 'U$D', nombre: 'Dólar estadounidense'    },
  { codigo: 'EUR', simbolo: '€',   nombre: 'Euro'                    },
  { codigo: 'BRL', simbolo: 'R$',  nombre: 'Real brasileño'          },
  { codigo: 'CLP', simbolo: 'CL$', nombre: 'Peso chileno'            },
  { codigo: 'UYU', simbolo: '$U',  nombre: 'Peso uruguayo'           },
  { codigo: 'PYG', simbolo: '₲',   nombre: 'Guaraní paraguayo'       },
  { codigo: 'BOB', simbolo: 'Bs',  nombre: 'Boliviano'               },
  { codigo: 'PEN', simbolo: 'S/',  nombre: 'Sol peruano'             },
  { codigo: 'COP', simbolo: 'CO$', nombre: 'Peso colombiano'         },
  { codigo: 'MXN', simbolo: 'MX$', nombre: 'Peso mexicano'           },
]

async function subirFoto(archivo, usuarioId) {
  const ext  = archivo.name.split('.').pop()
  const path = `${usuarioId}.${ext}`
  const { error } = await supabase.storage
    .from('avatars')
    .upload(path, archivo, { upsert: true, contentType: archivo.type })
  if (error) throw error
  const { data } = supabase.storage.from('avatars').getPublicUrl(path)
  return data.publicUrl + '?t=' + Date.now()
}

// ── Setting Row ──────────────────────────────────────────────
function SettingRow({ icon, iconBg, label, children, className = '' }) {
  return (
    <div className={`flex items-center gap-3.5 py-3.5 ${className}`}>
      <div className={`w-9 h-9 rounded-[11px] flex items-center justify-center text-base flex-shrink-0 ${iconBg}`}>
        {icon}
      </div>
      <span className="flex-1 text-[15px] font-medium text-zinc-800 dark:text-zinc-100">
        {label}
      </span>
      {children}
    </div>
  )
}

// ── Section Card ─────────────────────────────────────────────
function SectionCard({ title, children, className = '' }) {
  return (
    <div className={`bg-white dark:bg-[var(--dark-card)] rounded-[22px]
      border border-zinc-100/70 dark:border-[var(--dark-border)]
      shadow-[0_1px_3px_rgba(0,0,0,0.05),0_4px_12px_rgba(0,0,0,0.04)]
      dark:shadow-none overflow-hidden ${className}`}>
      {title && (
        <div className="px-5 pt-4 pb-1">
          <p className="text-[11px] font-extrabold uppercase tracking-[0.12em]
            text-[var(--mango-dark)] dark:text-[var(--mango)]">
            {title}
          </p>
        </div>
      )}
      <div className="px-5 divide-y divide-zinc-50 dark:divide-zinc-800/50">
        {children}
      </div>
    </div>
  )
}

export function ConfiguracionPage() {
  const navigate = useNavigate()
  const { usuario, session, recargarPerfil } = useAuthContext()
  const { theme, toggleTheme } = useTheme()
  const inputFotoRef = useRef(null)
  const esOscuro = theme === 'dark'

  const [nombre,       setNombre]       = useState(usuario?.nombre  ?? '')
  const [moneda,       setMoneda]       = useState(usuario?.moneda  ?? 'ARS')
  const [preview,      setPreview]      = useState(usuario?.avatar_url ?? null)
  const [fechaNac,     setFechaNac]     = useState(usuario?.fecha_nacimiento ?? '')
  const [editandoNombre, setEditandoNombre] = useState(false)

  const [guardando,    setGuardando]    = useState(false)
  const [subiendoFoto, setSubiendoFoto] = useState(false)
  const [feedback,     setFeedback]     = useState(null)

  const planActual = usuario?.plan || 'basico'
  const esPro = planActual === 'pro'
  const inicial = nombre?.[0]?.toUpperCase() ?? '🥭'
  const monedaActual = MONEDAS.find(m => m.codigo === moneda)

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
      setFeedback({ tipo: 'ok', msg: '¡Foto actualizada!' })
    } catch (err) {
      setFeedback({ tipo: 'error', msg: 'No se pudo subir la foto.' })
    } finally {
      setSubiendoFoto(false)
    }
  }

  async function guardarCampo(campos) {
    setGuardando(true)
    setFeedback(null)
    try {
      await actualizarPerfil(campos)
      if (recargarPerfil) await recargarPerfil()
      setFeedback({ tipo: 'ok', msg: '¡Guardado!' })
      setTimeout(() => setFeedback(null), 2000)
    } catch (err) {
      setFeedback({ tipo: 'error', msg: err.message || 'Error al guardar.' })
    } finally {
      setGuardando(false)
    }
  }

  async function handleLogout() {
    await logout()
    navigate('/login')
  }

  return (
    <div className="animate-in fade-in duration-500">
      <PageWrapper>
        {/* ── HERO SECTION ── */}
        <div className="relative mb-6 -mx-4 px-4 pt-2 pb-8 overflow-hidden">
          {/* Gradient background */}
          <div className="absolute inset-0 bg-gradient-to-br from-[var(--mango)]/12 via-amber-50/40 to-transparent
            dark:from-[var(--mango)]/8 dark:via-transparent dark:to-transparent rounded-b-[32px]" />
          <div className="absolute top-0 right-0 w-48 h-48 bg-[var(--mango)]/10 rounded-full
            blur-3xl translate-x-16 -translate-y-8 pointer-events-none" />

          <div className="relative flex flex-col items-center gap-3 pt-2">
            {/* Avatar */}
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-[var(--mango)] to-[var(--mango-dark)]
                rounded-3xl blur-xl opacity-30 scale-110" />
              <button
                onClick={() => inputFotoRef.current?.click()}
                disabled={subiendoFoto}
                className="relative w-24 h-24 rounded-3xl overflow-hidden
                  border-[3px] border-white dark:border-zinc-800
                  shadow-[0_8px_24px_rgba(245,166,35,0.35)]
                  bg-gradient-to-br from-[var(--mango)] to-[var(--mango-dark)]
                  flex items-center justify-center
                  active:scale-95 transition-transform"
              >
                {preview ? (
                  <img src={preview} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-3xl font-black text-white">{inicial}</span>
                )}
                {subiendoFoto && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                    <Spinner size={20} colorClass="text-white" />
                  </div>
                )}
                {/* Camera overlay */}
                <div className="absolute inset-0 bg-black/0 hover:bg-black/20 transition-colors
                  flex items-end justify-end p-2">
                  <div className="w-7 h-7 rounded-full bg-white/90 backdrop-blur-sm
                    flex items-center justify-center text-sm shadow-sm">
                    📷
                  </div>
                </div>
              </button>
              <input
                ref={inputFotoRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="hidden"
                onChange={handleFotoChange}
              />
            </div>

            {/* Name + plan */}
            <div className="text-center">
              <h1 className="text-2xl font-black font-display text-zinc-900 dark:text-white leading-tight">
                {nombre || 'Tu nombre'}
              </h1>
              <p className="text-sm text-zinc-400 dark:text-zinc-500 mt-0.5">
                {usuario?.email}
              </p>
            </div>

            {/* Plan badge */}
            <div className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold
              shadow-sm transition-all ${
              esPro
                ? 'bg-gradient-to-r from-[var(--mango)] to-[var(--mango-dark)] text-[var(--charcoal)] shadow-[var(--shadow-mango)]'
                : 'bg-white dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-700'
            }`}>
              <span>{esPro ? '⭐' : '🌱'}</span>
              <span>Plan {esPro ? 'Pro' : 'Básico'}</span>
              {!esPro && (
                <button
                  onClick={() => navigate('/configuracion/planes')}
                  className="ml-1 text-[var(--mango-dark)] underline underline-offset-1"
                >
                  Mejorar →
                </button>
              )}
            </div>
          </div>
        </div>

        {/* ── FEEDBACK TOAST ── */}
        {feedback && (
          <div className={`mb-4 flex items-center gap-2 px-4 py-3 rounded-2xl text-sm font-medium
            animate-in slide-in-from-top-2 fade-in duration-200 ${
            feedback.tipo === 'ok'
              ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-800/40'
              : 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 border border-red-100 dark:border-red-800/40'
          }`}>
            <span>{feedback.tipo === 'ok' ? '✓' : '⚠'}</span>
            {feedback.msg}
          </div>
        )}

        <div className="flex flex-col gap-4">

          {/* ── DATOS PERSONALES ── */}
          <SectionCard title="Datos personales">
            {/* Nombre */}
            <SettingRow icon="👤" iconBg="bg-blue-100 dark:bg-blue-900/30" label="Nombre">
              {editandoNombre ? (
                <div className="flex items-center gap-2">
                  <input
                    value={nombre}
                    onChange={e => setNombre(e.target.value)}
                    autoFocus
                    className="text-right text-sm font-semibold text-zinc-900 dark:text-white
                      bg-zinc-50 dark:bg-zinc-800 border border-[var(--mango)]/40
                      rounded-xl px-3 py-1.5 focus:outline-none w-28"
                  />
                  <button
                    onClick={async () => {
                      await guardarCampo({ nombre: nombre.trim() })
                      setEditandoNombre(false)
                    }}
                    disabled={guardando}
                    className="w-8 h-8 flex items-center justify-center rounded-xl
                      bg-[var(--mango)] text-white text-xs font-bold"
                  >
                    {guardando ? '…' : '✓'}
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setEditandoNombre(true)}
                  className="flex items-center gap-1.5 text-sm text-zinc-500 dark:text-zinc-400 font-medium"
                >
                  {nombre || '—'}
                  <span className="text-[10px] text-zinc-300 dark:text-zinc-600">✏️</span>
                </button>
              )}
            </SettingRow>

            {/* Fecha nacimiento */}
            <SettingRow icon="🎂" iconBg="bg-pink-100 dark:bg-pink-900/30" label="Nacimiento">
              <input
                type="date"
                value={fechaNac}
                onChange={e => setFechaNac(e.target.value)}
                onBlur={() => { if (fechaNac !== (usuario?.fecha_nacimiento ?? '')) guardarCampo({ fecha_nacimiento: fechaNac }) }}
                className="text-right text-sm font-medium text-zinc-500 dark:text-zinc-400
                  bg-transparent border-none outline-none cursor-pointer
                  [color-scheme:light_dark]"
              />
            </SettingRow>

            {/* Email */}
            <SettingRow icon="✉️" iconBg="bg-indigo-100 dark:bg-indigo-900/30" label="Email">
              <span className="text-sm text-zinc-400 dark:text-zinc-500 truncate max-w-[180px]">
                {usuario?.email ?? ''}
              </span>
            </SettingRow>

            {/* Moneda */}
            <SettingRow icon="💱" iconBg="bg-emerald-100 dark:bg-emerald-900/30" label="Moneda">
              <select
                value={moneda}
                onChange={e => { setMoneda(e.target.value); guardarCampo({ moneda: e.target.value }) }}
                className="text-right text-sm font-semibold text-zinc-600 dark:text-zinc-300
                  bg-transparent border-none outline-none cursor-pointer appearance-none"
              >
                {MONEDAS.map(m => (
                  <option key={m.codigo} value={m.codigo}>{m.simbolo} {m.nombre}</option>
                ))}
              </select>
            </SettingRow>
          </SectionCard>

          {/* ── APARIENCIA ── */}
          <SectionCard title="Apariencia">
            <SettingRow
              icon={esOscuro ? '🌙' : '☀️'}
              iconBg={esOscuro ? 'bg-zinc-800' : 'bg-amber-100'}
              label={esOscuro ? 'Modo oscuro' : 'Modo claro'}
            >
              <button
                onClick={toggleTheme}
                className={`relative inline-flex h-7 w-12 flex-shrink-0 cursor-pointer rounded-full
                  border-2 border-transparent transition-colors duration-200
                  ${esOscuro ? 'bg-[var(--mango)]' : 'bg-zinc-200 dark:bg-zinc-700'}`}
              >
                <span className={`pointer-events-none flex h-6 w-6 items-center justify-center
                  rounded-full bg-white shadow ring-0 transition duration-200
                  ${esOscuro ? 'translate-x-5' : 'translate-x-0'}`}>
                  <span className="text-[11px]">{esOscuro ? '🌙' : '☀️'}</span>
                </span>
              </button>
            </SettingRow>
          </SectionCard>

          {/* ── SUSCRIPCIÓN ── */}
          {esPro ? (
            <div className="relative overflow-hidden rounded-[22px] p-5
              bg-gradient-to-br from-[var(--mango)] to-[var(--mango-dark)]
              shadow-[var(--shadow-mango)]">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full
                translate-x-10 -translate-y-10 pointer-events-none" />
              <div className="relative flex items-center justify-between">
                <div>
                  <p className="text-xs font-extrabold uppercase tracking-wider text-white/70 mb-1">
                    Suscripción activa
                  </p>
                  <p className="text-xl font-black text-white font-display">Plan Pro ⭐</p>
                  <div className="flex items-center gap-1.5 mt-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="text-xs text-white/80 font-semibold">Activo</span>
                  </div>
                </div>
                <button
                  onClick={() => navigate('/configuracion/planes')}
                  className="px-4 py-2 rounded-xl bg-white/20 backdrop-blur-sm
                    text-white text-xs font-bold border border-white/25
                    hover:bg-white/30 active:scale-95 transition-all"
                >
                  Gestionar →
                </button>
              </div>
            </div>
          ) : (
            <SectionCard title="Suscripción">
              <SettingRow icon="🌱" iconBg="bg-zinc-100 dark:bg-zinc-800" label="Plan Básico">
                <button
                  onClick={() => navigate('/configuracion/planes')}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold
                    bg-gradient-to-r from-[var(--mango)] to-[var(--mango-dark)]
                    text-[var(--charcoal)] shadow-sm shadow-amber-400/30
                    active:scale-95 transition-all"
                >
                  🚀 Pro
                </button>
              </SettingRow>
            </SectionCard>
          )}

          {/* ── CUENTA ── */}
          <SectionCard title="Cuenta">
            <SettingRow icon="🚪" iconBg="bg-red-100 dark:bg-red-900/30" label="Cerrar sesión">
              <button
                onClick={handleLogout}
                className="px-4 py-2 rounded-xl text-sm font-bold text-red-500 dark:text-red-400
                  bg-red-50 dark:bg-red-900/20 border border-red-200/60 dark:border-red-800/40
                  hover:bg-red-100 dark:hover:bg-red-900/40 active:scale-95 transition-all"
              >
                Salir
              </button>
            </SettingRow>
          </SectionCard>

          {/* Footer */}
          <div className="flex flex-col items-center gap-1 py-4 pb-8">
            <div className="flex items-center gap-2">
              <img src="/Mango.png" alt="" className="w-5 h-5 object-contain" />
              <span className="text-xs font-bold text-gradient-mango">Manguito</span>
            </div>
            <p className="text-[10px] text-zinc-400 dark:text-zinc-600">
              Hecho con ❤️ en Argentina
            </p>
          </div>
        </div>
      </PageWrapper>
    </div>
  )
}