import { createClient } from '@supabase/supabase-js'

// Una variable que falta no da error por sí sola: llega como `undefined`, el cliente
// se construye igual y el fallo reaparece mucho después como un 401 sin explicación.
function required(name: string): string {
  const value = import.meta.env[name]
  if (typeof value !== 'string' || value === '') {
    throw new Error(`Falta ${name}: copia .env.example a .env.local y rellénalo`)
  }
  return value
}

// La clave publicable viaja en el bundle y es pública por diseño. Lo que protege los
// datos son las políticas de RLS — ver «Supabase» en CLAUDE.md.
export const supabase = createClient(
  required('VITE_SUPABASE_URL'),
  required('VITE_SUPABASE_ANON_KEY'),
)
