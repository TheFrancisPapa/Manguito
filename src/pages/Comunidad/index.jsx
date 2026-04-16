// src/pages/Comunidad/index.jsx — Comunidad Manguito
import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../../lib/supabase'
import { useAuthContext } from '../../context/AuthContext'
import { PageWrapper, PageHeader } from '../../components/layout/PageWrapper'

export { ComunidadPage }

// ── Categorías ───────────────────────────────────────────────
const CATEGORIAS = [
  { key: 'todos',     label: 'Todos',      icono: '🌐', color: 'var(--mango)' },
  { key: 'consejo',   label: 'Consejos',   icono: '💡', color: '#10b981' },
  { key: 'mejora',    label: 'Mejoras',    icono: '🚀', color: '#6366f1' },
  { key: 'queja',     label: 'Quejas',     icono: '⚠️', color: '#ef4444' },
  { key: 'discusion', label: 'Discusión',  icono: '💬', color: '#3b82f6' },
]

const CAT_COLORS = {
  consejo:   { bg: 'bg-emerald-100 dark:bg-emerald-900/30', text: 'text-emerald-700 dark:text-emerald-400' },
  mejora:    { bg: 'bg-indigo-100 dark:bg-indigo-900/30',   text: 'text-indigo-700 dark:text-indigo-400' },
  queja:     { bg: 'bg-red-100 dark:bg-red-900/30',         text: 'text-red-700 dark:text-red-400' },
  discusion: { bg: 'bg-blue-100 dark:bg-blue-900/30',       text: 'text-blue-700 dark:text-blue-400' },
}

// ── Filtro de palabras prohibidas ─────────────────────────────
const PALABRAS_PROHIBIDAS = [
  'puto', 'puta', 'forro', 'forra', 'pelotudo', 'pelotuda',
  'hijo de puta', 'la concha', 'mogolico', 'mogolica',
  'retrasado', 'retrasada', 'negro de mierda', 'negra de mierda',
  'trolo', 'trola', 'ortiva', 'gato', 'gata', 'turro', 'turra',
  'sorete', 'culo', 'verga', 'conchudo', 'conchuda',
  'boludo', 'boluda', 'tarado', 'tarada', 'idiota', 'imbecil',
  'prostituta', 'prostituto', 'porn', 'xxx', 'sexo',
  'drogas', 'merca', 'falopa', 'porro',
  'nazi', 'facho', 'zurdito', 'zurda', 'gorila',
  'estafa', 'scam', 'hack', 'hackear',
]

function contienePalabraProhibida(texto) {
  const lower = texto.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
  return PALABRAS_PROHIBIDAS.some(p => {
    const normalized = p.normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    return lower.includes(normalized)
  })
}

// ── Tiempo relativo ──────────────────────────────────────────
function tiempoRelativo(fecha) {
  const ahora = new Date()
  const diff = ahora - new Date(fecha)
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'Ahora'
  if (mins < 60) return `Hace ${mins} min`
  const horas = Math.floor(mins / 60)
  if (horas < 24) return `Hace ${horas}h`
  const dias = Math.floor(horas / 24)
  if (dias < 7) return `Hace ${dias}d`
  return new Date(fecha).toLocaleDateString('es-AR', { day: 'numeric', month: 'short' })
}

// ══════════════════════════════════════════════════════════════
// Página principal
// ══════════════════════════════════════════════════════════════
function ComunidadPage() {
  const { usuario } = useAuthContext()
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [filtro, setFiltro] = useState('todos')
  const [modalAbierto, setModalAbierto] = useState(false)
  const [misLikes, setMisLikes] = useState(new Set())

  // ── Cargar posts ─────────────────────────────────────────
  const cargarPosts = useCallback(async () => {
    setLoading(true)
    let query = supabase
      .from('community_posts')
      .select(`
        *,
        usuarios ( nombre, avatar_url )
      `)
      .order('created_at', { ascending: false })

    if (filtro !== 'todos') {
      query = query.eq('categoria', filtro)
    }

    const { data, error } = await query
    if (!error && data) setPosts(data)
    setLoading(false)
  }, [filtro])

  // ── Cargar mis likes ─────────────────────────────────────
  const cargarMisLikes = useCallback(async () => {
    if (!usuario?.id) return
    const { data } = await supabase
      .from('community_likes')
      .select('post_id')
      .eq('user_id', usuario.id)
    if (data) {
      setMisLikes(new Set(data.map(l => l.post_id)))
    }
  }, [usuario?.id])

  useEffect(() => { cargarPosts() }, [cargarPosts])
  useEffect(() => { cargarMisLikes() }, [cargarMisLikes])

  // ── Toggle like ──────────────────────────────────────────
  const toggleLike = async (postId) => {
    if (!usuario?.id) return
    const yaLikeo = misLikes.has(postId)

    if (yaLikeo) {
      await supabase.from('community_likes')
        .delete().eq('post_id', postId).eq('user_id', usuario.id)
      // Decrementar contador
      await supabase.from('community_posts')
        .update({ likes: Math.max(0, (posts.find(p => p.id === postId)?.likes || 1) - 1) })
        .eq('id', postId)
    } else {
      await supabase.from('community_likes')
        .insert({ post_id: postId, user_id: usuario.id })
      // Incrementar contador
      await supabase.from('community_posts')
        .update({ likes: (posts.find(p => p.id === postId)?.likes || 0) + 1 })
        .eq('id', postId)
    }

    // Refrescar
    cargarPosts()
    cargarMisLikes()
  }

  // ── Borrar post propio ───────────────────────────────────
  const borrarPost = async (postId) => {
    if (!confirm('¿Seguro que querés borrar este post?')) return
    await supabase.from('community_posts').delete().eq('id', postId)
    cargarPosts()
  }

  // ── Callback al crear ────────────────────────────────────
  const onPostCreado = () => {
    setModalAbierto(false)
    cargarPosts()
  }

  return (
    <PageWrapper>
      <PageHeader
        titulo="Comunidad 🌐"
        subtitulo="Consejos, ideas y propuestas de la comunidad Manguito"
        accion={
          <button
            onClick={() => setModalAbierto(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-2xl
              bg-gradient-to-r from-[var(--mango)] to-[var(--mango-dark)]
              text-white text-sm font-bold shadow-lg shadow-[var(--mango)]/25
              active:scale-95 transition-all"
          >
            ✏️ Nuevo Post
          </button>
        }
      />

      {/* ── Filtros por categoría ──────────────────────────── */}
      <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-4 -mx-1 px-1">
        {CATEGORIAS.map(cat => {
          const activo = filtro === cat.key
          return (
            <button
              key={cat.key}
              onClick={() => setFiltro(cat.key)}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-2xl text-xs font-bold
                whitespace-nowrap transition-all duration-200 border flex-shrink-0
                ${activo
                  ? 'bg-[var(--mango)]/15 dark:bg-[var(--mango)]/10 border-[var(--mango)]/30 text-[var(--mango-dark)] dark:text-[var(--mango)] shadow-sm'
                  : 'bg-white dark:bg-zinc-800/60 border-zinc-200/60 dark:border-zinc-700/40 text-zinc-500 dark:text-zinc-400 hover:border-[var(--mango)]/20'
                }`}
            >
              <span>{cat.icono}</span>
              <span>{cat.label}</span>
            </button>
          )
        })}
      </div>

      {/* ── Feed de posts ──────────────────────────────────── */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <div className="w-8 h-8 border-3 border-[var(--mango)] border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-zinc-400">Cargando comunidad...</p>
        </div>
      ) : posts.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <span className="text-5xl">🥭</span>
          <p className="text-zinc-400 dark:text-zinc-500 text-sm font-medium text-center">
            {filtro === 'todos'
              ? 'Todavía no hay posts. ¡Sé el primero en compartir algo!'
              : `No hay posts en la categoría "${CATEGORIAS.find(c => c.key === filtro)?.label}".`
            }
          </p>
          <button
            onClick={() => setModalAbierto(true)}
            className="px-4 py-2 rounded-xl bg-[var(--mango)]/10 text-[var(--mango-dark)] dark:text-[var(--mango)]
              text-sm font-bold active:scale-95 transition-all"
          >
            Crear el primer post
          </button>
        </div>
      ) : (
        <div className="flex flex-col gap-3 pb-8">
          {posts.map(post => (
            <PostCard
              key={post.id}
              post={post}
              esPropio={post.user_id === usuario?.id}
              likeo={misLikes.has(post.id)}
              onLike={() => toggleLike(post.id)}
              onBorrar={() => borrarPost(post.id)}
            />
          ))}
        </div>
      )}

      {/* ── Modal de nuevo post ────────────────────────────── */}
      {modalAbierto && (
        <NuevoPostModal
          usuario={usuario}
          onCerrar={() => setModalAbierto(false)}
          onCreado={onPostCreado}
        />
      )}
    </PageWrapper>
  )
}

// ══════════════════════════════════════════════════════════════
// Componente: PostCard
// ══════════════════════════════════════════════════════════════
function PostCard({ post, esPropio, likeo, onLike, onBorrar }) {
  const cat = CAT_COLORS[post.categoria] || CAT_COLORS.discusion
  const catInfo = CATEGORIAS.find(c => c.key === post.categoria)
  const nombre = post.es_anonimo ? 'Anónimo' : (post.usuarios?.nombre || 'Usuario')
  const avatar = post.es_anonimo ? '👤' : (post.usuarios?.nombre?.[0]?.toUpperCase() || '🥭')

  return (
    <article className="bg-white dark:bg-[var(--dark-card)] rounded-2xl p-4 border border-zinc-100 dark:border-zinc-800/60 shadow-sm transition-all hover:shadow-md">
      {/* Header */}
      <div className="flex items-center gap-3 mb-3">
        {/* Avatar */}
        <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-sm font-bold flex-shrink-0
          ${post.es_anonimo
            ? 'bg-zinc-200 dark:bg-zinc-700 text-zinc-500 dark:text-zinc-400'
            : 'bg-gradient-to-br from-[var(--mango)] to-[var(--mango-dark)] text-white'
          }`}>
          {post.es_anonimo ? '👤' : (
            post.usuarios?.avatar_url
              ? <img src={post.usuarios.avatar_url} alt="" className="w-full h-full object-cover rounded-xl" />
              : avatar
          )}
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold text-zinc-900 dark:text-white truncate">{nombre}</p>
          <p className="text-[10px] text-zinc-400 dark:text-zinc-500">{tiempoRelativo(post.created_at)}</p>
        </div>

        {/* Badge categoría */}
        <span className={`text-[9px] font-extrabold uppercase tracking-wider px-2 py-1 rounded-full ${cat.bg} ${cat.text}`}>
          {catInfo?.icono} {catInfo?.label}
        </span>
      </div>

      {/* Contenido */}
      <h3 className="text-sm font-bold text-zinc-800 dark:text-zinc-100 mb-1.5 leading-snug">{post.titulo}</h3>
      <p className="text-[13px] text-zinc-500 dark:text-zinc-400 leading-relaxed whitespace-pre-wrap">{post.contenido}</p>

      {/* Footer */}
      <div className="flex items-center justify-between mt-3 pt-3 border-t border-zinc-100 dark:border-zinc-800/40">
        <button
          onClick={onLike}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold
            transition-all duration-200 active:scale-90
            ${likeo
              ? 'bg-red-50 dark:bg-red-900/20 text-red-500 dark:text-red-400 border border-red-200/50 dark:border-red-800/30'
              : 'bg-zinc-50 dark:bg-zinc-800/50 text-zinc-400 dark:text-zinc-500 border border-zinc-200/50 dark:border-zinc-700/30 hover:text-red-400'
            }`}
        >
          {likeo ? '❤️' : '🤍'} {post.likes || 0}
        </button>

        {esPropio && (
          <button
            onClick={onBorrar}
            className="text-[10px] text-zinc-400 dark:text-zinc-600 hover:text-red-400 transition-colors font-medium px-2 py-1"
          >
            🗑️ Borrar
          </button>
        )}
      </div>
    </article>
  )
}

// ══════════════════════════════════════════════════════════════
// Componente: NuevoPostModal
// ══════════════════════════════════════════════════════════════
function NuevoPostModal({ usuario, onCerrar, onCreado }) {
  const [categoria, setCategoria] = useState('consejo')
  const [titulo, setTitulo] = useState('')
  const [contenido, setContenido] = useState('')
  const [esAnonimo, setEsAnonimo] = useState(false)
  const [enviando, setEnviando] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    // Validaciones
    if (!titulo.trim() || !contenido.trim()) {
      setError('Completá el título y el contenido.')
      return
    }
    if (titulo.trim().length > 120) {
      setError('El título es muy largo (máximo 120 caracteres).')
      return
    }
    if (contenido.trim().length > 1000) {
      setError('El contenido es muy largo (máximo 1000 caracteres).')
      return
    }

    // Filtro de palabras prohibidas (más estricto para posts anónimos)
    if (contienePalabraProhibida(titulo) || contienePalabraProhibida(contenido)) {
      setError('Tu post contiene palabras que no están permitidas. Revisalo y volvé a intentar. 🙏')
      return
    }

    setEnviando(true)
    const { error: insertError } = await supabase.from('community_posts').insert({
      user_id: usuario.id,
      categoria,
      titulo: titulo.trim(),
      contenido: contenido.trim(),
      es_anonimo: esAnonimo,
    })

    if (insertError) {
      setError('Hubo un error al publicar. Intentá de nuevo.')
      setEnviando(false)
      return
    }

    onCreado()
  }

  const categoriasForm = CATEGORIAS.filter(c => c.key !== 'todos')

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm animate-fadeIn"
        onClick={onCerrar}
      />

      {/* Modal */}
      <div className="fixed inset-x-4 bottom-0 top-auto z-50 sm:inset-auto sm:top-1/2 sm:left-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2 sm:w-full sm:max-w-lg">
        <form
          onSubmit={handleSubmit}
          className="bg-white dark:bg-[var(--dark-card)] rounded-t-3xl sm:rounded-3xl shadow-2xl
            border border-zinc-200/60 dark:border-zinc-700/40 overflow-hidden animate-slideUp"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-5 pt-5 pb-3">
            <h2 className="text-lg font-bold text-zinc-900 dark:text-white font-display">Nuevo Post ✏️</h2>
            <button
              type="button"
              onClick={onCerrar}
              className="w-8 h-8 flex items-center justify-center rounded-full
                bg-zinc-100 dark:bg-zinc-800 text-zinc-400 text-xs active:scale-90 transition-all"
            >
              ✕
            </button>
          </div>

          <div className="px-5 pb-5 flex flex-col gap-4">
            {/* Categoría */}
            <div className="flex gap-2 flex-wrap">
              {categoriasForm.map(cat => {
                const activo = categoria === cat.key
                return (
                  <button
                    key={cat.key}
                    type="button"
                    onClick={() => setCategoria(cat.key)}
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold
                      transition-all border
                      ${activo
                        ? `${CAT_COLORS[cat.key].bg} ${CAT_COLORS[cat.key].text} border-current/20 shadow-sm`
                        : 'bg-zinc-50 dark:bg-zinc-800/50 text-zinc-400 border-zinc-200/50 dark:border-zinc-700/30'
                      }`}
                  >
                    {cat.icono} {cat.label}
                  </button>
                )
              })}
            </div>

            {/* Título */}
            <div>
              <input
                type="text"
                placeholder="Título del post..."
                value={titulo}
                onChange={e => setTitulo(e.target.value)}
                maxLength={120}
                className="w-full px-4 py-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/60
                  border border-zinc-200/60 dark:border-zinc-700/40
                  text-sm text-zinc-900 dark:text-white placeholder-zinc-400
                  focus:outline-none focus:border-[var(--mango)] focus:ring-2 focus:ring-[var(--mango)]/20
                  transition-all"
              />
              <p className="text-[10px] text-zinc-400 mt-1 text-right">{titulo.length}/120</p>
            </div>

            {/* Contenido */}
            <div>
              <textarea
                placeholder="¿Qué querés compartir con la comunidad?"
                value={contenido}
                onChange={e => setContenido(e.target.value)}
                maxLength={1000}
                rows={4}
                className="w-full px-4 py-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/60
                  border border-zinc-200/60 dark:border-zinc-700/40
                  text-sm text-zinc-900 dark:text-white placeholder-zinc-400
                  focus:outline-none focus:border-[var(--mango)] focus:ring-2 focus:ring-[var(--mango)]/20
                  transition-all resize-none"
              />
              <p className="text-[10px] text-zinc-400 mt-1 text-right">{contenido.length}/1000</p>
            </div>

            {/* Toggle anónimo */}
            <label className="flex items-center gap-3 cursor-pointer select-none py-1">
              <div className="relative">
                <input
                  type="checkbox"
                  checked={esAnonimo}
                  onChange={e => setEsAnonimo(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-10 h-6 bg-zinc-200 dark:bg-zinc-700 rounded-full
                  peer-checked:bg-[var(--mango)] transition-colors" />
                <div className="absolute left-0.5 top-0.5 w-5 h-5 bg-white rounded-full shadow
                  transition-transform peer-checked:translate-x-4" />
              </div>
              <div>
                <p className="text-sm font-semibold text-zinc-700 dark:text-zinc-200">Publicar anónimamente 👤</p>
                <p className="text-[10px] text-zinc-400">Tu nombre no aparecerá en el post</p>
              </div>
            </label>

            {/* Error */}
            {error && (
              <div className="px-4 py-3 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200/50 dark:border-red-800/30">
                <p className="text-xs text-red-600 dark:text-red-400 font-medium">{error}</p>
              </div>
            )}

            {/* Botón enviar */}
            <button
              type="submit"
              disabled={enviando || !titulo.trim() || !contenido.trim()}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-[var(--mango)] to-[var(--mango-dark)]
                text-white text-sm font-bold shadow-lg shadow-[var(--mango)]/25
                disabled:opacity-50 disabled:cursor-not-allowed
                active:scale-[0.98] transition-all"
            >
              {enviando ? 'Publicando...' : '🥭 Publicar'}
            </button>
          </div>
        </form>
      </div>
    </>
  )
}
