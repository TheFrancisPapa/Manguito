import { useState } from 'react'
import { useAuthContext } from '../../context/AuthContext'
import { Button, Input } from '../../components/ui'

export function LoginPage() {
  const { login, loginConGoogle, registrar, error } = useAuthContext()
  const [modo, setModo]         = useState('login')
  const [cargando, setCargando] = useState(false)
  const [form, setForm]         = useState({ nombre: '', email: '', password: '', moneda: 'ARS', usarDemo: true })
  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }))

  async function handleSubmit(e) {
    e.preventDefault(); setCargando(true)
    try {
      if (modo === 'login') await login({ email: form.email, password: form.password })
      else await registrar(form)
    } catch (_) {}
    finally { setCargando(false) }
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <span style={{ fontSize: 52 }}>🥭</span>
          <h1 className="text-2xl font-semibold mt-2">Manguito</h1>
          <p className="text-sm text-zinc-400 mt-1">Tus finanzas, simples.</p>
        </div>

        <div className="flex bg-zinc-100 dark:bg-zinc-800 rounded-xl p-1 mb-6">
          {['login', 'registro'].map(m => (
            <button key={m} onClick={() => setModo(m)}
              className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors
                ${modo === m ? 'bg-white dark:bg-zinc-900 text-zinc-800 dark:text-zinc-100' : 'text-zinc-400 hover:text-zinc-600'}`}>
              {m === 'login' ? 'Iniciar sesión' : 'Registrarse'}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {modo === 'registro' && (
            <Input label="Tu nombre" placeholder="Ej: Juanita" value={form.nombre} onChange={set('nombre')} required />
          )}
          <Input label="Email" type="email" placeholder="tu@email.com" value={form.email} onChange={set('email')} required />
          <Input label="Contraseña" type="password" placeholder="········" value={form.password} onChange={set('password')} required />

          {modo === 'registro' && (
            <>
              <div className="flex flex-col gap-1">
                <label className="text-xs font-medium text-zinc-500">Moneda principal</label>
                <select value={form.moneda} onChange={set('moneda')}
                  className="border border-zinc-200 dark:border-zinc-700 rounded-xl px-3 py-2 text-sm bg-white dark:bg-zinc-900 outline-none focus:border-amber-400">
                  <option value="ARS">🇦🇷 Peso argentino (ARS)</option>
                  <option value="USD">🇺🇸 Dólar (USD)</option>
                  <option value="EUR">🇪🇺 Euro (EUR)</option>
                  <option value="UYU">🇺🇾 Peso uruguayo (UYU)</option>
                </select>
              </div>
              <label className="flex items-start gap-2.5 cursor-pointer">
                <input type="checkbox" checked={form.usarDemo}
                  onChange={e => setForm(f => ({ ...f, usarDemo: e.target.checked }))}
                  className="mt-0.5 accent-amber-400" />
                <span className="text-sm text-zinc-600 dark:text-zinc-400">Cargar datos de ejemplo para explorar la app</span>
              </label>
            </>
          )}

          {error && (
            <p className="text-xs text-red-500 bg-red-50 dark:bg-red-900/20 rounded-xl px-3 py-2 border border-red-100 dark:border-red-900">
              {error}
            </p>
          )}

          <Button type="submit" cargando={cargando} className="w-full mt-1">
            {modo === 'login' ? 'Entrar' : 'Crear cuenta'}
          </Button>
        </form>

        <div className="flex items-center gap-3 my-5">
          <div className="flex-1 h-px bg-zinc-200 dark:bg-zinc-700" />
          <span className="text-xs text-zinc-400">o</span>
          <div className="flex-1 h-px bg-zinc-200 dark:bg-zinc-700" />
        </div>

        <Button variante="secondary" className="w-full" onClick={loginConGoogle} icono="🔑">
          Continuar con Google
        </Button>
      </div>
    </div>
  )
}