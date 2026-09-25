// Quién responde y por dónde se le llega. Lo piden la política, el aviso legal y la casilla
// del formulario de registro: escrito en cada sitio, cambiar el correo dejaría dos viejos.

export const RESPONSIBLE_NAME = 'Emad Kadyear'

export const CONTACT_EMAIL = 'bibliojapo5@gmail.com'

// En España un menor consiente por sí mismo desde los 14. Bajarlo obligaría a recabar y
// VERIFICAR el permiso de los padres, que es un problema entero, no una casilla más.
export const MINIMUM_AGE = 14

export const LAST_UPDATED = '25 de septiembre de 2026'

export interface Processor {
  name: string
  purpose: string
}

// Quién más toca los datos. La política los pinta de aquí, así que quitar un proveedor
// —autoalojar las fuentes, por ejemplo— es borrar su entrada y nada más.
export const PROCESSORS: readonly Processor[] = [
  {
    name: 'Supabase',
    purpose:
      'guarda tu cuenta y tu progreso en servidores de París, y gestiona el inicio de sesión',
  },
  {
    name: 'Vercel',
    purpose: 'aloja la web y mide cuántas visitas recibe cada pantalla',
  },
]
