// La URL de todo el media del TEMARIO —la ilustración de cada kana, el audio de cada
// palabra— sale de aquí. Las imágenes de la escena no: las puertas, el pasillo, las
// tapas de los tomos y el escritorio son parte de la app y se quedan en `public/`.
//
// Hoy el bucket es público. En la fase 6 pasa a privado y esto devuelve URLs firmadas
// de vida corta, y ese día no se toca nada más que este archivo.
import { supabase } from './supabase'

const BUCKET = 'content-media'

// Con barra delante es un archivo del despliegue —el bloque 1, que es gratis y se
// queda en `public/`—; sin ella, una clave del bucket. Es lo único que distingue a los
// dos, así que una ruta del bloque 2 en adelante nunca empieza por `/`.
function fromBundle(path: string): boolean {
  return path.startsWith('/')
}

// Asíncrona aunque hoy no le haga falta: una URL firmada sí lo es, y volverla síncrona
// obligaría a tocar todos sus consumidores el día del bucket privado — justo lo que
// esta función existe para evitar. Y recibe todas las rutas de golpe porque un tomo
// trae decenas, y firmarlas de una en una serían decenas de peticiones por tomo.
export async function mediaUrls(
  paths: Iterable<string>,
): Promise<ReadonlyMap<string, string>> {
  const resolved = new Map<string, string>()

  for (const path of paths) {
    if (resolved.has(path)) continue
    resolved.set(
      path,
      fromBundle(path)
        ? path
        : supabase.storage.from(BUCKET).getPublicUrl(path).data.publicUrl,
    )
  }

  return resolved
}
