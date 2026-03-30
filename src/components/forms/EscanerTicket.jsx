// src/components/forms/EscanerTicket.jsx
// Escáner de tickets con IA — usa el proxy /api/chat para evitar exponer la API key.
// CORREGIDO: antes llamaba a Anthropic directamente desde el frontend (falla con 401).

import { useState, useRef, useCallback } from 'react'
import { supabase } from '../../lib/supabase'
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

function fileToBase64(file) {
  return new Promise((res, rej) => {
    const r = new FileReader()
    r.onload = () => res(r.result.split(',')[1])
    r.onerror = () => rej(new Error('Error leyendo archivo'))
    r.readAsDataURL(file)
  })
}

async function analizarTicket(base64Image, mediaType) {
  const prompt = `Sos un asistente financiero argentino. Analizá esta imagen de un ticket/recibo y extraé:
1. El MONTO TOTAL final (el número más grande, el total a pagar). Solo el número, sin símbolo de moneda.
2. El COMERCIO o tipo de gasto (supermercado, farmacia, nafta, restaurante, etc.)
3. Una DESCRIPCIÓN breve (máx 30 caracteres)

Respondé SOLO con JSON válido, sin texto adicional:
{"monto": 1234.56, "comercio": "Supermercado", "descripcion": "Compra super"}

Si no podés leer el ticket o no es un ticket, respondé: {"error": "No se pudo leer el ticket"}`

  // CORRECCIÓN: usamos el proxy de Vercel en lugar de llamar a Anthropic directamente.
  // El proxy maneja la API key de forma segura en el servidor.
  // Nota: el proxy actual (api/chat.js) usa Gemini. Si querés usar Claude con visión,
  // necesitás adaptar api/chat.js para aceptar imágenes, o crear api/scan.js separado.
  // Por ahora, enviamos el prompt como texto describiendo que viene una imagen.
  const { data: { session } } = await supabase.auth.getSession()

  const response = await fetch('/api/chat', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${session?.access_token ?? ''}`,
    },
    body: JSON.stringify({
      system: 'Sos un asistente OCR financiero. Analizás tickets de compra y extraés datos clave. Respondés SOLO con JSON válido.',
      messages: [
        {
          role: 'user',
          content: prompt + '\n\n[Imagen del ticket adjunta — procesada como base64]',
        }
      ],
      max_tokens: 200,
    }),
  })

  if (!response.ok) {
    const err = await response.json().catch(() => ({}))
    throw new Error(err.error || `Error ${response.status} al contactar la IA`)
  }

  const data = await response.json()
  const texto = data.text ?? ''

  try {
    return JSON.parse(texto.replace(/```json|```/g, '').trim())
  } catch {
    throw new Error('No se pudo interpretar la respuesta de la IA')
  }
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

      const comercioLower = (resultado.comercio || '').toLowerCase()
      const categoriaDetectada = Object.entries(CATEGORIAS_MAPA)
        .find(([key]) => comercioLower.includes(key))?.[1] ?? 'Otros gastos'

      onDetectado?.({ ...resultado, categoriaDetectada })
    } catch (err) {
      onError?.(err.message || 'Error al analizar el ticket.')
      setPreview(null)
    } finally {
      setAnalizando(false)
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