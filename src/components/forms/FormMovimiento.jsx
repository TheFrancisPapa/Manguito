// src/components/forms/FormMovimiento.jsx
// Mejoras:
//   1. Detección automática de categoría por palabras clave en Descripción
//   2. Formateo visual del importe con separador de miles (10.000)
//      — el valor interno siempre es un número limpio
//   3. Selector de moneda (ARS, USD, EUR, BRL, CLP, UYU) junto al importe

import { useState, useEffect, useRef, useCallback } from 'react'
import { Button, Select, Spinner } from '../ui/index.js'
import { useCategorias, useMonotributo } from '../../hooks/index.js'
import { EscanerTicket } from './EscanerTicket.jsx'

// ─────────────────────────────────────────────────────────────
// 1. MAPA DE PALABRAS CLAVE → CATEGORÍA
// ─────────────────────────────────────────────────────────────
const KEYWORD_MAP = [
  {
    categoria: 'Alimentación',
    keywords: [
      'supermercado', 'super', 'coto', 'carrefour', 'disco', 'vea', 'jumbo',
      'walmart', 'dia', 'precio', 'mayorista', 'makro', 'vital', 'toledo',
      'verduleria', 'verdulería', 'panaderia', 'panadería', 'carniceria',
      'carnicería', 'pescaderia', 'almacen', 'almacén', 'kiosco', 'quiosco',
      'chino', 'minimercado', 'despensa', 'fiambreria', 'lacteos',
      'delivery food', 'comida', 'mercado', 'minimarket', 'la anonima',
      'cooperativa', 'cooperativaobrera', 'hipermercado',
    ],
  },
  {
    categoria: 'Entretenimiento',
    keywords: [
      'restaurant', 'restaurante', 'delivery', 'pedidosya', 'rappi',
      'ifood', 'pizza', 'pizzeria', 'hamburguesa', 'burger', 'mcdonalds',
      'subway', 'sushi', 'café', 'cafe', 'cafeteria',
      'bar', 'bodegon', 'parrilla', 'tenedor libre', 'buffet', 'comedor',
      'cine', 'cinema', 'teatro', 'show', 'evento', 'boliche', 'discoteca',
      'netflix', 'spotify', 'disney', 'hbo', 'prime', 'apple tv', 'star',
      'youtube', 'twitch', 'steam', 'playstation', 'xbox', 'nintendo',
      'salida', 'cena', 'almuerzo', 'desayuno', 'merienda', 'brunch',
    ],
  },
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

function detectarCategoria(texto) {
  if (!texto || texto.trim().length < 3) return null
  const normalizado = texto
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s]/g, ' ')
  for (const { categoria, keywords } of KEYWORD_MAP) {
    for (const kw of keywords) {
      const kwNorm = kw.normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      if (normalizado.includes(kwNorm)) return categoria
    }
  }
  return null
}

// ─────────────────────────────────────────────────────────────
// 2. FORMATEO DE IMPORTE
// ─────────────────────────────────────────────────────────────
function formatearImporte(valor) {
  if (!valor) return ''
  const limpio = String(valor).replace(/[^\d,]/g, '')
  if (!limpio) return ''
  const partes = limpio.split(',')
  const entero = partes[0].replace(/\B(?=(\d{3})+(?!\d))/g, '.')
  return partes.length > 1 ? `${entero},${partes[1]}` : entero
}

function limpiarImporte(valorFormateado) {
  const sinPuntos = String(valorFormateado).replace(/\./g, '')
  const conPunto  = sinPuntos.replace(',', '.')
  const num = parseFloat(conPunto)
  return isNaN(num) ? '' : num
}

// ─────────────────────────────────────────────────────────────
// 3. BADGE DE CATEGORÍA SUGERIDA
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
// 4. OPCIONES DE MONEDA
// ─────────────────────────────────────────────────────────────
const MONEDAS = [
  { value: 'ARS', label: '$ ARS'   },
  { value: 'USD', label: 'U$D'     },
  { value: 'EUR', label: '€ EUR'   },
  { value: 'BRL', label: 'R$ BRL'  },
  { value: 'CLP', label: 'CL$ CLP' },
  { value: 'UYU', label: '$U UYU'  },
]

// ─────────────────────────────────────────────────────────────
// 5. FORMULARIO PRINCIPAL
// ─────────────────────────────────────────────────────────────
export function FormMovimiento({ onSubmit, onCancel, valoresIniciales = null }) {
  const [tipo, setTipo]       = useState(valoresIniciales?.tipo ?? 'gasto')
  const [importeDisplay, setImporteDisplay] = useState(
    valoresIniciales?.monto ? formatearImporte(String(valoresIniciales.monto).replace('.', ',')) : ''
  )
  const [importeNum, setImporteNum]   = useState(valoresIniciales?.monto ?? '')
  const [moneda, setMoneda]           = useState(valoresIniciales?.moneda ?? 'ARS')
  const [descripcion, setDescripcion] = useState(valoresIniciales?.descripcion ?? '')
  const hoyLocal = new Date().toLocaleDateString('sv-SE')
  const [fecha, setFecha]             = useState(valoresIniciales?.fecha ?? hoyLocal)
  const [categoriaId, setCategoriaId] = useState(valoresIniciales?.categoria_id ?? '')
  const [cargando, setCargando]       = useState(false)
  const [error, setError]             = useState(null)
  const [mostrarEscaner, setMostrarEscaner] = useState(false)

  const [sugerencia, setSugerencia]                 = useState(null)
  const [sugerenciaRechazada, setSugerenciaRechazada] = useState(false)
  const [alertaFiscal, setAlertaFiscal]             = useState(null)
  const bypassAlertaRef                             = useRef(false)

  const importeRef     = useRef(null)
  const descripcionRef = useRef(null)

  const { gastos, ingresos, cargando: cargandoCat } = useCategorias()
  const { procesarIngreso } = useMonotributo()
  const categoriasOptions = tipo === 'gasto' ? gastos : ingresos

  useEffect(() => {
    if (!valoresIniciales && categoriasOptions.length > 0 && !categoriaId) {
      setCategoriaId(categoriasOptions[0].id)
    }
  }, [categoriasOptions, categoriaId, valoresIniciales])

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

  const handleImporteChange = useCallback((e) => {
    const raw = e.target.value
    const soloDigitos = raw.replace(/[^\d,]/g, '')
    setImporteDisplay(formatearImporte(soloDigitos))
    setImporteNum(limpiarImporte(soloDigitos))
  }, [])

  const handleImportePaste = useCallback((e) => {
    e.preventDefault()
    const pegado = e.clipboardData.getData('text').replace(/[^\d,\.]/g, '')
    let limpio = pegado
    if (pegado.includes(',') && pegado.includes('.')) {
      limpio = pegado.replace(/\./g, '').replace(',', '.')
    } else if (pegado.includes(',') && !pegado.includes('.')) {
      limpio = pegado.replace(',', '.')
    }
    const num = parseFloat(limpio)
    if (!isNaN(num)) {
      setImporteNum(num)
      setImporteDisplay(formatearImporte(String(num).replace('.', ',')))
    }
  }, [])

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
      // ── Módulo Monotributo: Alerta Fiscal ──
      if (tipo === 'ingreso' && !bypassAlertaRef.current) {
        const resFiscal = procesarIngreso(Number(importeNum))
        if (resFiscal?.alerta.nivel === 'critico' || resFiscal?.alerta.nivel === 'excedido') {
          setAlertaFiscal(resFiscal.alerta)
          setCargando(false)
          return // Detenemos para que el usuario vea la alerta
        }
      }

      // Si llegamos acá, o no es ingreso, o no es crítico, o el usuario confirmó bypass
      bypassAlertaRef.current = false // Reseteamos para el próximo

      await onSubmit({
        tipo,
        monto:        Number(importeNum),
        moneda,
        descripcion:  descripcion.trim() || null,
        fecha,
        categoria_id: categoriaId,
        es_recurrente: false,
      })
    } catch (err) {
      setError(err.message || 'Error al guardar el movimiento.')
      setCargando(false)
    }
  }

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

      {/* Descripción */}
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
        {sugerencia && !sugerenciaRechazada && (
          <BadgeDeteccion
            nombreCat={sugerencia}
            onAceptar={aplicarSugerencia}
            onRechazar={rechazarSugerencia}
          />
        )}
      </div>

      {/* ── Importe + Moneda + Fecha ── */}
      <div className="grid grid-cols-2 gap-3">

        {/* Importe con selector de moneda */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 tracking-wide">
            Importe
          </label>
          <div className="flex gap-1.5">
            {/* Selector de moneda */}
            <select
              value={moneda}
              onChange={e => setMoneda(e.target.value)}
              className="flex-shrink-0 w-[68px] bg-zinc-50/80 dark:bg-zinc-800/60
                border border-zinc-200 dark:border-zinc-700/60 rounded-xl
                px-1.5 py-2.5 text-[11px] font-bold text-zinc-600 dark:text-zinc-300
                focus:outline-none focus:ring-2 focus:ring-[var(--mango)]/30 focus:border-[var(--mango)]/60
                transition-all cursor-pointer appearance-none text-center"
            >
              {MONEDAS.map(m => (
                <option key={m.value} value={m.value}>{m.label}</option>
              ))}
            </select>

            {/* Input de importe */}
            <input
              ref={importeRef}
              type="text"
              inputMode="decimal"
              value={importeDisplay}
              onChange={handleImporteChange}
              onPaste={handleImportePaste}
              placeholder="0"
              autoComplete="off"
              className="flex-1 min-w-0 bg-zinc-50/80 dark:bg-zinc-800/60
                border border-zinc-200 dark:border-zinc-700/60
                rounded-xl px-3 py-2.5 text-sm font-bold tabular-nums
                focus:outline-none focus:ring-2 focus:ring-[var(--mango)]/30 focus:border-[var(--mango)]/60
                transition-all text-zinc-900 dark:text-white placeholder:text-zinc-400 placeholder:font-normal"
            />
          </div>

          {/* Hint con moneda seleccionada */}
          {importeNum > 0 && (
            <p className="text-[10px] text-zinc-400 px-1">
              = {Number(importeNum).toLocaleString('es-AR', { maximumFractionDigits: 2 })} {moneda}
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
            onBlur={(e) => e.target.blur()}
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

      {/* Alerta Fiscal (Monotributo) */}
      {alertaFiscal && (
        <div className="flex flex-col gap-2 p-3 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 animate-in fade-in slide-in-from-top-2">
          <div className="flex items-start gap-2.5">
            <span className="text-lg leading-none mt-0.5">{alertaFiscal.emoji}</span>
            <div className="flex-1">
              <p className="text-xs font-bold text-red-700 dark:text-red-400">
                Alerta Monotributo: Nivel {alertaFiscal.nivel.toUpperCase()}
              </p>
              <p className="text-[11px] text-red-600/80 dark:text-red-400/70 leading-relaxed mt-0.5">
                {alertaFiscal.mensaje}
              </p>
            </div>
          </div>
          
          <div className="flex gap-2 mt-1">
            <button
              type="button"
              onClick={() => {
                setAlertaFiscal(null)
                bypassAlertaRef.current = true
                // Reintentamos el submit ignorando la alerta
                handleSubmit({ preventDefault: () => {} })
              }}
              className="flex-1 py-2 rounded-lg bg-red-600 text-white text-[10px] font-bold hover:bg-red-700 transition-colors"
            >
              Entendido, guardar igual
            </button>
            <button
              type="button"
              onClick={() => setAlertaFiscal(null)}
              className="flex-1 py-2 rounded-lg bg-zinc-200 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 text-[10px] font-bold hover:bg-zinc-300 dark:hover:bg-zinc-700 transition-colors"
            >
              Revisar importes
            </button>
          </div>
        </div>
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