// src/components/forms/FormMovimiento.jsx
// Mejoras:
//   1. Detección automática de categoría por palabras clave en Descripción
//   2. Formateo visual del importe con separador de miles (10.000)
//      — el valor interno siempre es un número limpio

import { useState, useEffect, useRef, useCallback } from 'react'
import { Button, Select, Spinner } from '../ui/index.js'
import { useCategorias } from '../../hooks/index.js'
import { EscanerTicket } from './EscanerTicket.jsx'

// ─────────────────────────────────────────────────────────────
// 1. MAPA DE PALABRAS CLAVE → CATEGORÍA
//    Todos los términos en minúsculas, sin tildes.
//    El primer match que se encuentre gana.
// ─────────────────────────────────────────────────────────────
const KEYWORD_MAP = [
  // ── Alimentación ──────────────────────────────────────────
  {
    categoria: 'Alimentación',
    keywords: [
      'supermercado', 'super', 'coto', 'carrefour', 'disco', 'vea', 'jumbo',
      'walmart', 'dia', 'precio', 'mayorista', 'makro', 'vital', 'toledo',
      'verduleria', 'verdulería', 'panaderia', 'panadería', 'carniceria',
      'carnicería', 'pescaderia', 'almacen', 'almacén', 'kiosco', 'quiosco',
      'chino', 'minimercado', 'despensa', 'fiambreria', 'lacteos',
      'delivery food', 'comida', 'mercado', 'minimarket', 'la anonima',
      'cooperativa', 'cooperativaobrera', 'walmart', 'hipermercado',
    ],
  },
  // ── Restaurantes / Salidas ────────────────────────────────
  {
    categoria: 'Entretenimiento',
    keywords: [
      'restaurant', 'restaurante', 'delivery', 'pedidosya', 'rappi', 'rappi',
      'ifood', 'pizza', 'pizzeria', 'hamburguesa', 'burger', 'mcdonalds',
      'burgerkingue', 'subway', 'sushi', 'café', 'cafe', 'cafeteria',
      'bar', 'bodegon', 'parrilla', 'tenedor libre', 'buffet', 'comedor',
      'cine', 'cinema', 'teatro', 'show', 'evento', 'boliche', 'discoteca',
      'netflix', 'spotify', 'disney', 'hbo', 'prime', 'apple tv', 'star',
      'youtube', 'twitch', 'steam', 'playstation', 'xbox', 'nintendo',
      'salida', 'cena', 'almuerzo', 'desayuno', 'merienda', 'brunch',
    ],
  },
  // ── Transporte ────────────────────────────────────────────
  {
    categoria: 'Transporte',
    keywords: [
      'sube', 'nafta', 'combustible', 'gasoil', 'gnc', 'estacion',
      'ypf', 'shell', 'axion', 'puma', 'petroleo',
      'taxi', 'uber', 'cabify', 'remis', 'transfer', 'viaje',
      'peaje', 'autopista', 'tren', 'colectivo', 'subte', 'metro',
      'bus', 'omnibus', 'aereo', 'vuelo', 'avion', 'aerolinea',
      'parking', 'estacionamiento', 'garage', 'cochera',
      'mecanico', 'taller', 'service', 'repuesto', 'llanta', 'neumatico',
      'seguro auto', 'vtv', 'patente',
    ],
  },
  // ── Vivienda / Alquiler ────────────────────────────────────
  {
    categoria: 'Vivienda',
    keywords: [
      'alquiler', 'expensas', 'hipoteca', 'cuota vivienda',
      'inmobiliaria', 'consorcio', 'administracion edificio',
      'pintura', 'plomero', 'electricista', 'gasista', 'albanil',
      'reparacion', 'arreglo casa', 'ferreteria', 'materiales',
      'mueble', 'heladera', 'lavarropas', 'cocina', 'electrodomestico',
    ],
  },
  // ── Salud ─────────────────────────────────────────────────
  {
    categoria: 'Salud',
    keywords: [
      'farmacia', 'farmacias', 'farmacity', 'vantage', 'del pueblo',
      'medico', 'médico', 'doctor', 'clinica', 'clínica', 'hospital',
      'guardia', 'consulta', 'turno', 'analisis', 'análisis', 'laboratorio',
      'prepaga', 'osde', 'swiss', 'galeno', 'medicus', 'obra social',
      'optica', 'óptica', 'odontologia', 'dentista', 'kinesio',
      'psicologo', 'psicólogo', 'nutricionista', 'gym', 'gimnasio',
      'medicamento', 'remedio', 'pastilla', 'vitamina', 'suplemento',
    ],
  },
  // ── Educación ─────────────────────────────────────────────
  {
    categoria: 'Educación',
    keywords: [
      'escuela', 'colegio', 'jardin', 'jardín', 'guarderia',
      'universidad', 'facultad', 'uba', 'utn', 'uces', 'udesa',
      'curso', 'taller', 'seminario', 'capacitacion', 'capacitación',
      'libro', 'libreria', 'papeleria', 'cuaderno', 'utiles',
      'ingles', 'inglés', 'idioma', 'academia', 'instituto',
      'udemy', 'coursera', 'platzi', 'coder',
    ],
  },
  // ── Ropa / Indumentaria ────────────────────────────────────
  {
    categoria: 'Ropa',
    keywords: [
      'ropa', 'indumentaria', 'zapatilla', 'zapato', 'calzado',
      'vestido', 'camisa', 'pantalon', 'jean', 'remera', 'buzo',
      'campera', 'abrigo', 'ropa interior', 'bikini', 'traje',
      'zara', 'h&m', 'falabella', 'paris', 'fila', 'nike', 'adidas',
      'puma shoes', 'reebok', 'tienda', 'boutique', 'liquidacion',
    ],
  },
  // ── Servicios (luz, gas, internet…) ───────────────────────
  {
    categoria: 'Servicios',
    keywords: [
      'luz', 'edesur', 'edenor', 'energia', 'electricidad',
      'gas', 'metrogas', 'naturgy', 'camuzzi',
      'agua', 'aysa', 'absa', 'aguas',
      'internet', 'cable', 'fibertel', 'telecentro', 'claro', 'personal',
      'movistar', 'wifi', 'banda ancha', 'fibra', 'arnet',
      'telefono', 'teléfono', 'celular', 'linea', 'recarga',
      'seguro hogar', 'seguro vida', 'seguro', 'poliza',
    ],
  },
  // ── Ingresos ──────────────────────────────────────────────
  {
    categoria: 'Sueldo',
    keywords: ['sueldo', 'salario', 'haberes', 'aguinaldo', 'sac', 'cobro sueldo'],
  },
  {
    categoria: 'Freelance',
    keywords: ['freelance', 'honorarios', 'factura', 'proyecto', 'cliente', 'cobro trabajo'],
  },
  {
    categoria: 'Inversiones',
    keywords: ['dividendo', 'renta', 'interes', 'interés', 'rendimiento', 'cupon', 'bono'],
  },
]

// ─────────────────────────────────────────────────────────────
// 2. FUNCIÓN DE DETECCIÓN
//    Recibe el texto de descripción, devuelve el nombre de la
//    categoría detectada o null si no hay match.
// ─────────────────────────────────────────────────────────────
function detectarCategoria(texto) {
  if (!texto || texto.trim().length < 3) return null

  // Normalizar: minúsculas, sin tildes, sin caracteres especiales
  const normalizado = texto
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')  // quitar tildes
    .replace(/[^a-z0-9\s]/g, ' ')    // mantener solo letras y números

  for (const { categoria, keywords } of KEYWORD_MAP) {
    for (const kw of keywords) {
      // El keyword también normalizado
      const kwNorm = kw.normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      if (normalizado.includes(kwNorm)) {
        return categoria
      }
    }
  }
  return null
}

// ─────────────────────────────────────────────────────────────
// 3. FORMATEO DE IMPORTE
//    10000 → "10.000"  |  1500.50 → "1.500,50"
//    Solo se formatean los miles; el valor numérico interno
//    es siempre el número limpio.
// ─────────────────────────────────────────────────────────────
function formatearImporte(valor) {
  if (!valor) return ''
  // Eliminar todo excepto dígitos y coma (para decimales)
  const limpio = String(valor).replace(/[^\d,]/g, '')
  if (!limpio) return ''

  const partes = limpio.split(',')
  const entero = partes[0].replace(/\B(?=(\d{3})+(?!\d))/g, '.')
  return partes.length > 1 ? `${entero},${partes[1]}` : entero
}

function limpiarImporte(valorFormateado) {
  // "10.000,50" → 10000.50
  const sinPuntos = String(valorFormateado).replace(/\./g, '')
  const conPunto  = sinPuntos.replace(',', '.')
  const num = parseFloat(conPunto)
  return isNaN(num) ? '' : num
}

// ─────────────────────────────────────────────────────────────
// 4. SUB-COMPONENTE: Badge de categoría detectada
// ─────────────────────────────────────────────────────────────
function BadgeDeteccion({ nombreCat, onAceptar, onRechazar }) {
  return (
    <div className="flex items-center gap-2 px-3 py-2
      bg-emerald-50 dark:bg-emerald-900/20
      border border-emerald-200 dark:border-emerald-800/50
      rounded-xl text-xs animate-in slide-in-from-top-1 fade-in duration-200">
      <span className="text-emerald-600 dark:text-emerald-400 text-base leading-none">✨</span>
      <span className="flex-1 text-emerald-700 dark:text-emerald-300 font-medium">
        ¿Categoría: <strong>{nombreCat}</strong>?
      </span>
      <button
        type="button"
        onClick={onAceptar}
        className="px-2 py-0.5 rounded-lg bg-emerald-600 text-white text-[10px] font-bold
          hover:bg-emerald-700 transition-colors"
      >
        Sí
      </button>
      <button
        type="button"
        onClick={onRechazar}
        className="px-2 py-0.5 rounded-lg bg-zinc-200 dark:bg-zinc-700
          text-zinc-600 dark:text-zinc-300 text-[10px] font-bold
          hover:bg-zinc-300 dark:hover:bg-zinc-600 transition-colors"
      >
        No
      </button>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────
// 5. FORMULARIO PRINCIPAL
// ─────────────────────────────────────────────────────────────
export function FormMovimiento({ onSubmit, onCancel, valoresIniciales = null }) {
  const [tipo, setTipo]       = useState(valoresIniciales?.tipo ?? 'gasto')
  const [importeDisplay, setImporteDisplay] = useState(
    valoresIniciales?.monto ? formatearImporte(String(valoresIniciales.monto).replace('.', ',')) : ''
  )
  const [importeNum, setImporteNum]   = useState(valoresIniciales?.monto ?? '')
  const [descripcion, setDescripcion] = useState(valoresIniciales?.descripcion ?? '')
  const hoyLocal = new Date().toLocaleDateString('sv-SE')
  const [fecha, setFecha]             = useState(valoresIniciales?.fecha ?? hoyLocal)
  const [categoriaId, setCategoriaId] = useState(valoresIniciales?.categoria_id ?? '')
  const [cargando, setCargando]       = useState(false)
  const [error, setError]             = useState(null)
  const [mostrarEscaner, setMostrarEscaner] = useState(false)

  // Estado de la sugerencia de categoría
  const [sugerencia, setSugerencia]         = useState(null)  // nombre de la categoría sugerida
  const [sugerenciaRechazada, setSugerenciaRechazada] = useState(false)

  const importeRef   = useRef(null)
  const descripcionRef = useRef(null)

  const { gastos, ingresos, cargando: cargandoCat } = useCategorias()
  const categoriasOptions = tipo === 'gasto' ? gastos : ingresos

  // Setear la categoría por defecto la primera vez que cargan
  useEffect(() => {
    if (!valoresIniciales && categoriasOptions.length > 0 && !categoriaId) {
      setCategoriaId(categoriasOptions[0].id)
    }
  }, [categoriasOptions, categoriaId, valoresIniciales])

  // ── Detectar categoría mientras el usuario escribe ──────────
  const handleDescripcionChange = useCallback((e) => {
    const valor = e.target.value
    setDescripcion(valor)
    setSugerenciaRechazada(false)

    const catDetectada = detectarCategoria(valor)
    if (catDetectada && !sugerenciaRechazada) {
      setSugerencia(catDetectada)
    } else {
      setSugerencia(null)
    }
  }, [sugerenciaRechazada])

  // Aplicar sugerencia al hacer clic en "Sí"
  const aplicarSugerencia = useCallback(() => {
    const cat = categoriasOptions.find(
      c => c.nombre.toLowerCase() === sugerencia?.toLowerCase()
    )
    if (cat) setCategoriaId(cat.id)
    setSugerencia(null)
  }, [sugerencia, categoriasOptions])

  const rechazarSugerencia = useCallback(() => {
    setSugerencia(null)
    setSugerenciaRechazada(true)
  }, [])

  // ── Formateo del importe en tiempo real ─────────────────────
  const handleImporteChange = useCallback((e) => {
    const raw = e.target.value

    // Permitir solo dígitos, puntos (separador miles) y una coma (decimal)
    // El usuario puede tipear sin pensar — limpiamos y reformateamos
    const sinFormato = raw.replace(/\./g, '').replace(',', '.')   // "10.000,5" → "100005"
    const soloDigitos = raw.replace(/[^\d,]/g, '')                 // quitar todo excepto dígitos y coma

    // Guardar el valor display formateado
    const displayNuevo = formatearImporte(soloDigitos)
    setImporteDisplay(displayNuevo)

    // Guardar el valor numérico limpio
    const numLimpio = limpiarImporte(soloDigitos)
    setImporteNum(numLimpio)
  }, [])

  // Manejar pegado (paste) correctamente
  const handleImportePaste = useCallback((e) => {
    e.preventDefault()
    const pegado = e.clipboardData.getData('text').replace(/[^\d,\.]/g, '')
    // Normalizar separadores: "1.500,50" o "1500.50" → "1500.50"
    let limpio = pegado
    if (pegado.includes(',') && pegado.includes('.')) {
      // Formato europeo: 1.500,50
      limpio = pegado.replace(/\./g, '').replace(',', '.')
    } else if (pegado.includes(',') && !pegado.includes('.')) {
      // Puede ser separador decimal: 1500,50
      limpio = pegado.replace(',', '.')
    }
    const num = parseFloat(limpio)
    if (!isNaN(num)) {
      setImporteNum(num)
      setImporteDisplay(formatearImporte(String(num).replace('.', ',')))
    }
  }, [])

  // ── Cuando se detecta un ticket con el escáner ─────────────
  const handleTicketDetectado = useCallback(({ monto: m, descripcion: d, categoriaDetectada: cat }) => {
    if (m) {
      setImporteNum(m)
      setImporteDisplay(formatearImporte(String(m).replace('.', ',')))
    }
    if (d) setDescripcion(d)
    if (cat) {
      const match = gastos.find(g =>
        g.nombre.toLowerCase().includes(cat.toLowerCase()) ||
        cat.toLowerCase().includes(g.nombre.toLowerCase())
      )
      if (match) setCategoriaId(match.id)
    }
    setMostrarEscaner(false)
  }, [gastos])

  // ── Submit ──────────────────────────────────────────────────
  async function handleSubmit(e) {
    e.preventDefault()
    setError(null)
    if (!importeNum || importeNum <= 0) {
      setError('El importe debe ser mayor a 0.')
      importeRef.current?.focus()
      return
    }
    if (!categoriaId) {
      setError('Seleccioná una categoría.')
      return
    }
    setCargando(true)
    try {
      await onSubmit({
        tipo,
        monto:       Number(importeNum),
        descripcion: descripcion.trim() || null,
        fecha,
        categoria_id: categoriaId,
        es_recurrente: false,
      })
    } catch (err) {
      setError(err.message || 'Error al guardar el movimiento.')
      setCargando(false)
    }
  }

  // ── Cambio de tipo (ingreso / gasto) ────────────────────────
  const handleCambioTipo = (nuevoTipo) => {
    setTipo(nuevoTipo)
    setCategoriaId('')
    setSugerencia(null)
    setSugerenciaRechazada(false)
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">

      {/* Toggle gasto / ingreso */}
      <div className="flex bg-zinc-100 dark:bg-zinc-800 rounded-xl p-1">
        <button
          type="button"
          onClick={() => handleCambioTipo('gasto')}
          className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
            tipo === 'gasto'
              ? 'bg-white dark:bg-zinc-900 text-red-600 shadow-sm'
              : 'text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'
          }`}
        >
          💸 Gasto
        </button>
        <button
          type="button"
          onClick={() => handleCambioTipo('ingreso')}
          className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
            tipo === 'ingreso'
              ? 'bg-white dark:bg-zinc-900 text-emerald-600 shadow-sm'
              : 'text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'
          }`}
        >
          💰 Ingreso
        </button>
      </div>

      {/* Escáner de ticket (solo gastos) */}
      {tipo === 'gasto' && (
        <div>
          {mostrarEscaner ? (
            <div className="flex flex-col gap-2">
              <EscanerTicket
                onDetectado={handleTicketDetectado}
                onError={(msg) => setError(msg)}
              />
              <button
                type="button"
                onClick={() => setMostrarEscaner(false)}
                className="text-xs text-zinc-400 hover:text-zinc-600 text-center transition-colors"
              >
                Cancelar escaneo
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setMostrarEscaner(true)}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl
                border border-dashed border-zinc-300 dark:border-zinc-700
                text-xs font-medium text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300
                hover:border-zinc-400 dark:hover:border-zinc-600 transition-all"
            >
              <span>📸</span> Escanear ticket con IA
            </button>
          )}
        </div>
      )}

      {/* Descripción — con detección de categoría */}
      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 tracking-wide">
          Descripción
        </label>
        <input
          ref={descripcionRef}
          type="text"
          value={descripcion}
          onChange={handleDescripcionChange}
          placeholder={tipo === 'gasto' ? 'Ej: Supermercado Coto, Nafta YPF…' : 'Ej: Sueldo marzo, Proyecto…'}
          autoComplete="off"
          className="w-full bg-zinc-50/80 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700/60
            rounded-xl px-3.5 py-2.5 text-sm font-medium
            focus:outline-none focus:ring-2 focus:ring-[var(--mango)]/30 focus:border-[var(--mango)]/60
            transition-all text-zinc-900 dark:text-white placeholder:text-zinc-400"
        />

        {/* Badge de sugerencia de categoría */}
        {sugerencia && !sugerenciaRechazada && (
          <BadgeDeteccion
            nombreCat={sugerencia}
            onAceptar={aplicarSugerencia}
            onRechazar={rechazarSugerencia}
          />
        )}
      </div>

      {/* Importe + Fecha */}
      <div className="grid grid-cols-2 gap-3">

        {/* Importe con formateo en vivo */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 tracking-wide">
            Importe
          </label>
          <div className="relative flex items-center">
            <span className="absolute left-3.5 text-zinc-400 text-sm font-semibold pointer-events-none select-none">
              $
            </span>
            <input
              ref={importeRef}
              type="text"
              inputMode="decimal"
              value={importeDisplay}
              onChange={handleImporteChange}
              onPaste={handleImportePaste}
              placeholder="0"
              autoComplete="off"
              className="w-full bg-zinc-50/80 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700/60
                rounded-xl pl-8 pr-3.5 py-2.5 text-sm font-bold tabular-nums
                focus:outline-none focus:ring-2 focus:ring-[var(--mango)]/30 focus:border-[var(--mango)]/60
                transition-all text-zinc-900 dark:text-white placeholder:text-zinc-400 placeholder:font-normal"
            />
          </div>
          {/* Hint del valor numérico para depurar (solo dev) */}
          {importeNum > 0 && (
            <p className="text-[10px] text-zinc-400 px-1">
              = {Number(importeNum).toLocaleString('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 2 })}
            </p>
          )}
        </div>

        {/* Fecha */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 tracking-wide">
            Fecha
          </label>
          <input
            type="date"
            value={fecha}
            onChange={(e) => setFecha(e.target.value)}
            required
            className="w-full bg-zinc-50/80 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700/60
              rounded-xl px-3.5 py-2.5 text-sm font-medium
              focus:outline-none focus:ring-2 focus:ring-[var(--mango)]/30 focus:border-[var(--mango)]/60
              transition-all text-zinc-900 dark:text-white"
          />
        </div>
      </div>

      {/* Categoría */}
      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 tracking-wide">
          Categoría
        </label>
        {cargandoCat ? (
          <div className="h-10 bg-zinc-100 dark:bg-zinc-800 rounded-xl animate-pulse flex items-center px-3 gap-2">
            <Spinner size={14} />
            <span className="text-xs text-zinc-400">Cargando…</span>
          </div>
        ) : (
          <select
            value={categoriaId}
            onChange={(e) => {
              setCategoriaId(e.target.value)
              // Si el usuario eligió manualmente, cancelamos la sugerencia
              setSugerencia(null)
              setSugerenciaRechazada(true)
            }}
            required
            className="w-full bg-zinc-50/80 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700/60
              rounded-xl px-3.5 py-2.5 pr-10 text-sm font-medium
              focus:outline-none focus:ring-2 focus:ring-[var(--mango)]/30 focus:border-[var(--mango)]/60
              transition-all text-zinc-900 dark:text-white
              appearance-none cursor-pointer"
          >
            <option value="" disabled>Seleccioná una categoría</option>
            {categoriasOptions.map(c => (
              <option key={c.id} value={c.id}>{c.icono} {c.nombre}</option>
            ))}
          </select>
        )}
      </div>

      {/* Error */}
      {error && (
        <p className="text-xs text-red-500 bg-red-50 dark:bg-red-900/20 rounded-xl px-3 py-2
          border border-red-100 dark:border-red-900 font-medium">
          ⚠ {error}
        </p>
      )}

      {/* Acciones */}
      <div className="flex gap-3 mt-2">
        <Button
          type="button"
          variante="secondary"
          className="flex-1"
          onClick={onCancel}
          disabled={cargando}
        >
          Cancelar
        </Button>
        <Button
          type="submit"
          className="flex-1"
          cargando={cargando}
        >
          Guardar
        </Button>
      </div>
    </form>
  )
}