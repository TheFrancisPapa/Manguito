import { useState, useEffect, useCallback } from 'react'
import { useAuthContext } from '../../context/AuthContext'
import { supabase } from '../../lib/supabase'
import { Button, Modal } from '../../components/ui'
import { sanitizeText, hasBadWords } from '../../lib/badwords'

export function TabLibros() {
  const { usuario } = useAuthContext()
  const [libros, setLibros] = useState([])
  const [cargando, setCargando] = useState(true)
  const [modalAbierto, setModalAbierto] = useState(false)
  const [enviando, setEnviando] = useState(false)
  const [errorEnvio, setErrorEnvio] = useState('')
  const [votosUsuario, setVotosUsuario] = useState({}) // { libroId: 'like' | 'dislike' }

  const cargarLibros = useCallback(async () => {
    try {
      setCargando(true)
      const { data, error } = await supabase
        .from('recomendaciones_libros')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setLibros(data || [])
    } catch (err) {
      console.error('Error cargando libros:', err)
    } finally {
      setCargando(false)
    }
  }, [])

  const cargarVotosUsuario = useCallback(async () => {
    if (!usuario?.id) return
    try {
      const { data, error } = await supabase
        .from('votos_libros')
        .select('recomendacion_id, tipo')
        .eq('usuario_id', usuario.id)

      if (error) throw error
      
      const votosMap = {}
      if (data) {
        data.forEach(voto => {
          votosMap[voto.recomendacion_id] = voto.tipo
        })
      }
      setVotosUsuario(votosMap)
    } catch (err) {
      console.error('Error cargando votos:', err)
    }
  }, [usuario?.id])

  useEffect(() => {
    cargarLibros()
    cargarVotosUsuario()
  }, [cargarLibros, cargarVotosUsuario])

  const handleVotar = async (libro, tipo) => {
    if (!usuario?.id) return alert('Debes iniciar sesión para votar')

    const votoActual = votosUsuario[libro.id]
    
    // Optimistic UI update
    let newLikes = libro.likes
    let newDislikes = libro.dislikes
    let newVotosUsuario = { ...votosUsuario }

    // Si ya tiene ese voto, lo quita (toggle off)
    if (votoActual === tipo) {
      delete newVotosUsuario[libro.id]
      if (tipo === 'like') newLikes--
      if (tipo === 'dislike') newDislikes--
    } else {
      // Si cambia el voto o es nuevo
      newVotosUsuario[libro.id] = tipo
      if (tipo === 'like') {
        newLikes++
        if (votoActual === 'dislike') newDislikes--
      } else {
        newDislikes++
        if (votoActual === 'like') newLikes--
      }
    }

    // Actualizamos estado local optimísticamente
    setVotosUsuario(newVotosUsuario)
    setLibros(libros.map(l => l.id === libro.id ? { ...l, likes: newLikes, dislikes: newDislikes } : l))

    try {
      // Si estamos quitando el voto
      if (votoActual === tipo) {
        await supabase
          .from('votos_libros')
          .delete()
          .eq('usuario_id', usuario.id)
          .eq('recomendacion_id', libro.id)
      } else {
        // Insertamos o actualizamos
        await supabase
          .from('votos_libros')
          .upsert({
            usuario_id: usuario.id,
            recomendacion_id: libro.id,
            tipo: tipo
          }, { onConflict: 'usuario_id, recomendacion_id' })
      }

      // Actualizamos los conteos en la tabla principal
      await supabase
        .from('recomendaciones_libros')
        .update({ likes: newLikes, dislikes: newDislikes })
        .eq('id', libro.id)

    } catch (err) {
      console.error('Error al votar:', err)
      // Revertimos estado en caso de error
      cargarLibros()
      cargarVotosUsuario()
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!usuario?.id) return alert('Debes iniciar sesión')
    
    setErrorEnvio('')
    const form = e.target
    const titulo = form.titulo.value.trim()
    const autor = form.autor.value.trim()
    const ensenanzaRaw = form.ensenanza.value.trim()
    const estrellas = parseInt(form.estrellas.value)

    if (!titulo || !autor || !ensenanzaRaw) return

    if (hasBadWords(titulo) || hasBadWords(autor)) {
      setErrorEnvio('Por favor, mantén el lenguaje respetuoso en el título y autor.')
      return
    }

    // Sanitizamos la enseñanza
    const ensenanza = sanitizeText(ensenanzaRaw)

    try {
      setEnviando(true)
      const { data, error } = await supabase
        .from('recomendaciones_libros')
        .insert([{
          usuario_id: usuario.id,
          titulo,
          autor,
          ensenanza,
          estrellas
        }])
        .select()

      if (error) throw error
      
      if (data && data[0]) {
        setLibros([data[0], ...libros])
      }
      setModalAbierto(false)
    } catch (err) {
      console.error('Error guardando libro:', err)
      setErrorEnvio('Ocurrió un error al guardar la recomendación.')
    } finally {
      setEnviando(false)
    }
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-2 bg-[var(--mango)]/10 dark:bg-[var(--mango)]/5 rounded-2xl px-4 py-4 border border-[var(--mango)]/20">
        <div>
          <h3 className="font-bold text-zinc-900 dark:text-white">Club de Lectura</h3>
          <p className="text-sm text-zinc-600 dark:text-zinc-400">Recomienda y descubre libros que mejoran tu vida financiera y personal.</p>
        </div>
        <Button onClick={() => setModalAbierto(true)} icono="+" className="whitespace-nowrap flex-shrink-0">
          Añadir Libro
        </Button>
      </div>

      {cargando ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1,2,3,4].map(i => (
            <div key={i} className="h-48 bg-zinc-100 dark:bg-zinc-800 animate-pulse rounded-2xl" />
          ))}
        </div>
      ) : libros.length === 0 ? (
        <div className="text-center py-12 bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-2xl">
          <p className="text-4xl mb-3">📚</p>
          <h4 className="font-bold text-zinc-900 dark:text-white">Aún no hay recomendaciones</h4>
          <p className="text-sm text-zinc-500 mt-1">Sé el primero en recomendar un libro a la comunidad.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {libros.map(libro => (
            <div key={libro.id} className="flex flex-col gap-3 p-5 bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-2xl hover:border-[var(--mango)]/40 transition-colors shadow-sm">
              <div className="flex justify-between items-start gap-3">
                <div className="min-w-0">
                  <h4 className="font-bold text-zinc-900 dark:text-white truncate">{libro.titulo}</h4>
                  <p className="text-xs text-zinc-500 font-mono mt-0.5">por {libro.autor}</p>
                </div>
                <div className="flex items-center gap-1 bg-yellow-50 dark:bg-yellow-900/20 text-yellow-600 dark:text-yellow-500 px-2 py-1 rounded-full text-xs font-bold shrink-0">
                  <span>★</span> {libro.estrellas}
                </div>
              </div>

              <div className="flex-1 bg-zinc-50 dark:bg-zinc-800/50 p-3 rounded-xl border border-zinc-100 dark:border-zinc-800/80">
                <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1">Enseñanza principal:</p>
                <p className="text-sm text-zinc-700 dark:text-zinc-300 italic">"{libro.ensenanza}"</p>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-zinc-100 dark:border-zinc-800 mt-1">
                <div className="text-[10px] text-zinc-400">
                  {new Date(libro.created_at).toLocaleDateString('es-AR', { day: 'numeric', month: 'short', year: 'numeric' })}
                </div>
                
                <div className="flex gap-2">
                  <button 
                    onClick={() => handleVotar(libro, 'like')}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                      votosUsuario[libro.id] === 'like' 
                        ? 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-400' 
                        : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500 hover:bg-zinc-200 dark:hover:bg-zinc-700'
                    }`}
                  >
                    👍 <span>{libro.likes || 0}</span>
                  </button>
                  <button 
                    onClick={() => handleVotar(libro, 'dislike')}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                      votosUsuario[libro.id] === 'dislike' 
                        ? 'bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-400' 
                        : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500 hover:bg-zinc-200 dark:hover:bg-zinc-700'
                    }`}
                  >
                    👎 <span>{libro.dislikes || 0}</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal abierto={modalAbierto} onCerrar={() => setModalAbierto(false)} titulo="Añadir Recomendación" ancho="max-w-md">
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="block text-xs font-bold text-zinc-600 dark:text-zinc-400 mb-1">Título del Libro *</label>
            <input required name="titulo" type="text" maxLength={100} placeholder="Ej. El Inversor Inteligente" className="w-full px-3 py-2 bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[var(--mango)]" />
          </div>
          
          <div>
            <label className="block text-xs font-bold text-zinc-600 dark:text-zinc-400 mb-1">Autor *</label>
            <input required name="autor" type="text" maxLength={100} placeholder="Ej. Benjamin Graham" className="w-full px-3 py-2 bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[var(--mango)]" />
          </div>

          <div>
            <label className="block text-xs font-bold text-zinc-600 dark:text-zinc-400 mb-1">Valoración (Estrellas)</label>
            <div className="flex gap-4">
              {[1, 2, 3, 4, 5].map(num => (
                <label key={num} className="flex items-center gap-1 cursor-pointer">
                  <input type="radio" name="estrellas" value={num} defaultChecked={num === 5} className="accent-[var(--mango)]" />
                  <span className="text-sm font-bold">{num}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-zinc-600 dark:text-zinc-400 mb-1">Principal Enseñanza *</label>
            <textarea required name="ensenanza" rows={4} maxLength={500} placeholder="¿Qué lección te dejó? Escríbelo aquí..." className="w-full px-3 py-2 bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[var(--mango)] resize-none" />
            <p className="text-[10px] text-zinc-400 mt-1">El contenido es moderado automáticamente para mantener un espacio seguro.</p>
          </div>

          {errorEnvio && <p className="text-xs text-red-500 font-bold">{errorEnvio}</p>}

          <div className="flex justify-end gap-3 mt-4">
            <Button type="button" variante="secondary" onClick={() => setModalAbierto(false)}>Cancelar</Button>
            <Button type="submit" cargando={enviando}>Publicar</Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
