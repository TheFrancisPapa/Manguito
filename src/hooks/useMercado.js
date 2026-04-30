// src/hooks/useMercado.js — Hook principal del buscador de precios Mercado
// Maneja búsqueda full-text, precios por producto, carga de precios, y ubicación manual

import { useState, useEffect, useCallback, useRef } from 'react'
import { supabase } from '../lib/supabase'

// ── Provincias de Argentina ──────────────────────────────────
export const PROVINCIAS_AR = [
  'Buenos Aires', 'CABA', 'Catamarca', 'Chaco', 'Chubut', 'Córdoba',
  'Corrientes', 'Entre Ríos', 'Formosa', 'Jujuy', 'La Pampa', 'La Rioja',
  'Mendoza', 'Misiones', 'Neuquén', 'Río Negro', 'Salta', 'San Juan',
  'San Luis', 'Santa Cruz', 'Santa Fe', 'Santiago del Estero',
  'Tierra del Fuego', 'Tucumán',
]

// ── Ciudades principales por provincia (seed inicial) ────────
export const CIUDADES_POR_PROVINCIA = {
  'Corrientes': ['Corrientes', 'Goya', 'Paso de los Libres', 'Curuzú Cuatiá', 'Mercedes', 'Monte Caseros', 'Esquina', 'Bella Vista', 'Santo Tomé', 'Ituzaingó'],
  'Buenos Aires': ['La Plata', 'Mar del Plata', 'Bahía Blanca', 'Tandil', 'Quilmes', 'Lanús', 'Avellaneda', 'Morón', 'San Isidro', 'Tigre'],
  'CABA': ['CABA'],
  'Córdoba': ['Córdoba', 'Villa Carlos Paz', 'Río Cuarto', 'Villa María'],
  'Santa Fe': ['Rosario', 'Santa Fe', 'Rafaela', 'Venado Tuerto'],
  'Mendoza': ['Mendoza', 'San Rafael', 'Godoy Cruz'],
  'Tucumán': ['San Miguel de Tucumán', 'Yerba Buena', 'Banda del Río Salí'],
  'Chaco': ['Resistencia', 'Presidencia Roque Sáenz Peña', 'Villa Ángela'],
  'Misiones': ['Posadas', 'Oberá', 'Eldorado', 'Puerto Iguazú'],
  'Entre Ríos': ['Paraná', 'Concordia', 'Gualeguaychú'],
  'Salta': ['Salta', 'San Ramón de la Nueva Orán', 'Tartagal'],
  'Jujuy': ['San Salvador de Jujuy', 'Palpalá', 'San Pedro'],
  'Formosa': ['Formosa', 'Clorinda'],
}

// ── Categorías de productos ─────────────────────────────────
export const CATEGORIAS_PRODUCTO = [
  { id: 'almacen',         nombre: 'Almacén',           emoji: '🏪' },
  { id: 'bebidas',         nombre: 'Bebidas',           emoji: '🥤' },
  { id: 'lacteos',         nombre: 'Lácteos',           emoji: '🥛' },
  { id: 'carnes',          nombre: 'Carnes',            emoji: '🥩' },
  { id: 'verduras_frutas', nombre: 'Verduras y Frutas', emoji: '🥬' },
  { id: 'limpieza',        nombre: 'Limpieza',          emoji: '🧹' },
  { id: 'higiene',         nombre: 'Higiene',           emoji: '🧴' },
  { id: 'panaderia',       nombre: 'Panadería',         emoji: '🍞' },
  { id: 'congelados',      nombre: 'Congelados',        emoji: '🧊' },
  { id: 'ropa',            nombre: 'Ropa',              emoji: '👕' },
  { id: 'calzado',         nombre: 'Calzado',           emoji: '👟' },
  { id: 'electronica',     nombre: 'Electrónica',       emoji: '📱' },
  { id: 'hogar',           nombre: 'Hogar',             emoji: '🏠' },
  { id: 'farmacia',        nombre: 'Farmacia',          emoji: '💊' },
  { id: 'libreria',        nombre: 'Librería',          emoji: '📚' },
  { id: 'otro',            nombre: 'Otro',              emoji: '📦' },
]

// ── Tipos de comercio ───────────────────────────────────────
export const TIPOS_COMERCIO = [
  { id: 'supermercado', nombre: 'Supermercado',  emoji: '🛒' },
  { id: 'mayorista',    nombre: 'Mayorista',     emoji: '📦' },
  { id: 'kiosco',       nombre: 'Kiosco',        emoji: '🏪' },
  { id: 'almacen',      nombre: 'Almacén',       emoji: '🏬' },
  { id: 'verduleria',   nombre: 'Verdulería',    emoji: '🥬' },
  { id: 'farmacia',     nombre: 'Farmacia',      emoji: '💊' },
  { id: 'tienda_ropa',  nombre: 'Tienda de Ropa', emoji: '👕' },
  { id: 'libreria',     nombre: 'Librería',      emoji: '📚' },
  { id: 'ferreteria',   nombre: 'Ferretería',    emoji: '🔧' },
  { id: 'electronica',  nombre: 'Electrónica',   emoji: '📱' },
  { id: 'otro',         nombre: 'Otro',          emoji: '🏷️' },
]

const STORAGE_KEY_UBICACION = 'manguito_mercado_ubicacion'

// ── Hook de ubicación manual ─────────────────────────────────
export function useUbicacion() {
  const [ubicacion, setUbicacion] = useState(() => {
    try {
      const guardado = localStorage.getItem(STORAGE_KEY_UBICACION)
      if (guardado) return JSON.parse(guardado)
    } catch {}
    return { provincia: 'Corrientes', ciudad: 'Corrientes' }
  })

  const cambiarUbicacion = useCallback((provincia, ciudad) => {
    const nueva = { provincia, ciudad }
    setUbicacion(nueva)
    try { localStorage.setItem(STORAGE_KEY_UBICACION, JSON.stringify(nueva)) } catch {}
  }, [])

  return { ubicacion, cambiarUbicacion }
}

// ── Hook principal de búsqueda ───────────────────────────────
export function useBusqueda() {
  const [query, setQuery] = useState('')
  const [resultados, setResultados] = useState([])
  const [cargando, setCargando] = useState(false)
  const [error, setError] = useState(null)
  const debounceRef = useRef(null)

  const buscar = useCallback(async (texto, ciudad = null, provincia = null) => {
    if (!texto || texto.trim().length < 2) {
      setResultados([])
      return
    }

    setCargando(true)
    setError(null)

    try {
      const { data, error: err } = await supabase.rpc('buscar_productos', {
        p_query: texto.trim(),
        p_ciudad: ciudad,
        p_provincia: provincia,
        p_limite: 20,
      })

      if (err) throw err
      setResultados(data || [])
    } catch (e) {
      console.error('Error buscando productos:', e)
      setError('Error al buscar. Intentá de nuevo.')
      setResultados([])
    } finally {
      setCargando(false)
    }
  }, [])

  // Búsqueda con debounce
  const buscarConDebounce = useCallback((texto, ciudad, provincia) => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    setQuery(texto)

    if (!texto || texto.trim().length < 2) {
      setResultados([])
      setCargando(false)
      return
    }

    setCargando(true)
    debounceRef.current = setTimeout(() => {
      buscar(texto, ciudad, provincia)
    }, 350)
  }, [buscar])

  // Cleanup
  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [])

  return { query, setQuery, resultados, cargando, error, buscar, buscarConDebounce }
}

// ── Hook para precios de un producto ─────────────────────────
export function usePreciosProducto(productoId, ciudad, provincia) {
  const [precios, setPrecios] = useState([])
  const [cargando, setCargando] = useState(false)

  const cargar = useCallback(async () => {
    if (!productoId) return

    setCargando(true)
    try {
      const { data, error } = await supabase.rpc('precios_producto_en_ciudad', {
        p_producto_id: productoId,
        p_ciudad: ciudad || null,
        p_provincia: provincia || null,
      })

      if (error) throw error
      setPrecios(data || [])
    } catch (e) {
      console.error('Error cargando precios:', e)
    } finally {
      setCargando(false)
    }
  }, [productoId, ciudad, provincia])

  useEffect(() => { cargar() }, [cargar])

  return { precios, cargando, recargar: cargar }
}

// ── Funciones de escritura (requieren auth) ──────────────────

export async function crearComercio({ nombre, tipo, direccion, ciudad, provincia, cadena }) {
  const { data, error } = await supabase
    .from('comercios')
    .insert({
      nombre: nombre.trim(),
      tipo,
      direccion: direccion?.trim() || null,
      ciudad: ciudad.trim(),
      provincia: provincia.trim(),
      cadena: cadena?.trim() || null,
    })
    .select()
    .single()

  if (error) throw error
  return data
}

export async function crearProducto({ nombre, marca, categoria, subcategoria, presentacion }) {
  const { data, error } = await supabase
    .from('productos')
    .insert({
      nombre: nombre.trim(),
      marca: marca.trim(),
      categoria,
      subcategoria: subcategoria?.trim() || null,
      presentacion: presentacion?.trim() || null,
    })
    .select()
    .single()

  if (error) throw error
  return data
}

export async function reportarPrecio({ productoId, comercioId, precio, enOferta = false, precioOferta = null }) {
  const { data, error } = await supabase
    .from('precios_productos')
    .upsert({
      producto_id: productoId,
      comercio_id: comercioId,
      precio: Number(precio),
      en_oferta: enOferta,
      precio_oferta: precioOferta ? Number(precioOferta) : null,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'producto_id,comercio_id' })
    .select()
    .single()

  if (error) throw error
  return data
}

export async function votarPrecio(precioId, tipoVoto) {
  const campo = tipoVoto === 'ok' ? 'votos_ok' : 'votos_desactual'

  // Leer valor actual
  const { data: actual } = await supabase
    .from('precios_productos')
    .select(campo)
    .eq('id', precioId)
    .single()

  if (!actual) return

  const { error } = await supabase
    .from('precios_productos')
    .update({ [campo]: (actual[campo] || 0) + 1 })
    .eq('id', precioId)

  if (error) throw error
}

// ── Hook para listar comercios ───────────────────────────────
export function useComercios(ciudad, provincia) {
  const [comercios, setComercios] = useState([])
  const [cargando, setCargando] = useState(false)

  const cargar = useCallback(async () => {
    setCargando(true)
    try {
      let q = supabase.from('comercios').select('*').order('nombre')
      if (ciudad) q = q.eq('ciudad', ciudad)
      if (provincia) q = q.eq('provincia', provincia)

      const { data, error } = await q
      if (error) throw error
      setComercios(data || [])
    } catch (e) {
      console.error('Error cargando comercios:', e)
    } finally {
      setCargando(false)
    }
  }, [ciudad, provincia])

  useEffect(() => { cargar() }, [cargar])

  return { comercios, cargando, recargar: cargar }
}

// ── Hook para productos populares ────────────────────────────
export function usePopulares(ciudad, provincia) {
  const [populares, setPopulares] = useState([])
  const [cargando, setCargando] = useState(false)

  const cargar = useCallback(async () => {
    setCargando(true)
    try {
      const { data, error } = await supabase.rpc('productos_populares', {
        p_ciudad: ciudad || null,
        p_provincia: provincia || null,
        p_limite: 8,
      })
      if (error) throw error
      setPopulares(data || [])
    } catch (e) {
      console.error('Error cargando populares:', e)
    } finally {
      setCargando(false)
    }
  }, [ciudad, provincia])

  useEffect(() => { cargar() }, [cargar])

  return { populares, cargando }
}

// ── Helpers ──────────────────────────────────────────────────
export function fmtPrecio(n) {
  if (!n && n !== 0) return '—'
  return `$${Number(n).toLocaleString('es-AR', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`
}

export function tiempoDesde(isoStr) {
  if (!isoStr) return ''
  const diff = Date.now() - new Date(isoStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'ahora'
  if (mins < 60) return `hace ${mins} min`
  const horas = Math.floor(mins / 60)
  if (horas < 24) return `hace ${horas}h`
  const dias = Math.floor(horas / 24)
  if (dias < 7) return `hace ${dias}d`
  return new Date(isoStr).toLocaleDateString('es-AR', { day: 'numeric', month: 'short' })
}
