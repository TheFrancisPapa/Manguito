// src/lib/supabase.js
// Cliente único de Supabase — importalo desde acá en toda la app.
// Las variables de entorno van en .env en la raíz del proyecto:
//   VITE_SUPABASE_URL=https://xxxx.supabase.co
//   VITE_SUPABASE_ANON_KEY=eyJhbGci...

import { createClient } from '@supabase/supabase-js'

const url  = import.meta.env.VITE_SUPABASE_URL
const key  = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!url || !key) {
  throw new Error(
    '⚠️  Faltan variables de entorno de Supabase.\n' +
    'Creá un archivo .env en la raíz con:\n' +
    '  VITE_SUPABASE_URL=...\n' +
    '  VITE_SUPABASE_ANON_KEY=...'
  )
}

export const supabase = createClient(url, key)