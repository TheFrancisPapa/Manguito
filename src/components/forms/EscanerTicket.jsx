// src/components/forms/EscanerTicket.jsx
// Escáner de tickets con IA — usa la API de Anthropic para detectar
// monto y categoría a partir de una foto del ticket.

import { useState, useRef, useCallback } from 'react'
import { Spinner } from '../ui'

const CATEGORIAS_MAPA = {
  supermercado: 'Alimentación', almacen: 'Alimentación', verduleria: 'Alimentación',
  carniceria: 'Alimentación', panaderia: 'Alimentación', farmacia: 'Salud',
  nafta: 'Transporte', combustible: 'Transporte', estacion: 'Transporte',
  peaje: 'Transporte', taxi: 'Transporte', remis: 'Transporte', uber: 'Transporte',
  ropa: 'Ropa', indumentaria: 'Ropa', zapatillas: 'Ropa', calzado: 'Ropa',
  cine: 'Entretenimiento', bar: 'Entretenimiento', restaurant: 'Entretenimiento',
  luz: 'Servicios', gas: 'Servicios', agua: 'Servicios', internet: 'Servicios',
}

async function analizarTicket(base64Image, mediaType) {
  const prompt = `Sos un asistente financiero argentino. Analizá esta imagen de un ticket/recibo y extraé:
1. El MONTO TOTAL final (el número más grande, el total a pagar). Solo el número, sin símbolo de moneda.
2. El COMERCIO o tipo de gasto (supermercado, farmacia, nafta, restaurante, etc.)
3. Una DESCRIPCIÓN breve (máx 30 caracteres)

Respondé SOLO con JSON válido, sin texto adicional:
{"monto": 1234.56, "comercio": "Supermercado", "descripcion": "Compra super"}

Si no podés leer el ticket o no es un ticket, respondé: {"error": "No se pudo leer el ticket"}`

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 200,
      messages: [{
        role: 'user',
        content: [
          { type: 'image', source: { type: 'base64', media_type: mediaType, data: base64Image } },
          { type: 'text', text: prompt },
        ],
      }],
    }),
  })

  if (!response.ok) throw new Error('Error al contactar la IA')
  const data = await response.json()
  const texto = data.content?.[0]?.text ?? ''

  try {
    return JSON.parse(texto.replace(/```json|```/g, '').trim())
  } catch {
    throw new Error('No se pudo interpretar la respuesta')
  }
}

function fileToBase64(file) {
  return new Promise((res, rej) => {
    const r = new FileReader()
    r.onload = () => res(r.result.split(',')[1])
    r.onerror = () => rej(new Error('Error leyendo archivo'))
    r.readAsDataURL(file)
  })
}

/**
 * EscanerTicket — componente para escanear tickets con la cámara o galería.
 *
 * Props:
 *   onDetectado — ({ monto, comercio, descripcion, categoriaDetectada }) => void
 *   onError     — (mensaje) => void
 */
export function EscanerTicket({ onDetectado, onError }) {
  const inputRef = useRef(null)
  const [analizando, setAnalizando] = useState(false)
  const [preview, setPreview]       = useState(null)

  const handleArchivo = useCallback(async (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      onError?.('Solo se aceptan imágenes.')
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      onError?.('La imagen no puede superar 5 MB.')
      return
    }

    // Preview inmediato
    setPreview(URL.createObjectURL(file))
    setAnalizando(true)

    try {
      const base64 = await fileToBase64(file)
      const resultado = await analizarTicket(base64, file.type)

      if (resultado.error) {
        onError?.(resultado.error)
        setPreview(null)
        return
      }

      // Detectar categoría del comercio
      const comercioLower = (resultado.comercio || '').toLowerCase()
      const categoriaDetectada = Object.entries(CATEGORIAS_MAPA)
        .find(([key]) => comercioLower.includes(key))?.[1] ?? 'Otros gastos'

      onDetectado?.({ ...resultado, categoriaDetectada })
    } catch (err) {
      onError?.(err.message || 'Error al analizar el ticket.')
      setPreview(null)
    } finally {
      setAnalizando(false)
      // Reset input para poder volver a seleccionar el mismo archivo
      if (inputRef.current) inputRef.current.value = ''
    }
  }, [onDetectado, onError])

  return (
    <div className="flex flex-col gap-3">
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleArchivo}
        className="hidden"
      />

      {/* Botón principal */}
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={analizando}
        className="flex items-center justify-center gap-2.5 py-3 px-4 rounded-xl
          border-2 border-dashed border-[var(--mango)]/40 hover:border-[var(--mango)]
          bg-[var(--mango)]/5 hover:bg-[var(--mango)]/10
          text-sm font-semibold text-[var(--mango-dark)] dark:text-[var(--mango)]
          transition-all active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {analizando ? (
          <>
            <Spinner size={18} />
            Analizando ticket con IA...
          </>
        ) : (
          <>
            <span className="text-xl">📸</span>
            Escanear ticket con la cámara
          </>
        )}
      </button>

      {/* Preview de la imagen mientras procesa */}
      {preview && analizando && (
        <div className="relative rounded-xl overflow-hidden border border-zinc-200 dark:border-zinc-700 h-32">
          <img src={preview} alt="Ticket" className="w-full h-full object-cover opacity-50" />
          <div className="absolute inset-0 flex items-center justify-center gap-2 text-sm font-medium text-zinc-600 dark:text-zinc-300">
            <Spinner size={16} /> Procesando con IA...
          </div>
        </div>
      )}

      <p className="text-[10px] text-zinc-400 text-center">
        📷 La IA detecta el monto y la categoría automáticamente · La imagen no se guarda
      </p>
    </div>
  )
}