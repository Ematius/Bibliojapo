// La forma de lo que va y viene entre la app y el servidor.
//
// Hoy el servidor es `mockServer.ts`; mañana será Firebase o Nest. Lo que tiene
// que seguir igual cuando llegue es ESTO: las pantallas solo conocen estos tipos y
// las funciones de `account.ts`, `progress.ts` y `volumes.ts`, así que cambiar de
// servidor es reescribir por dentro esas tres y borrar el simulado, sin tocar un
// componente.
//
// Vive en su propio archivo para que el servidor simulado y los clientes lo
// importen sin importarse entre ellos.
import type { Block, Kana, Sentence, Word } from '../content/types'

// El examen cuyo sello cierra un tomo. Superarlo es lo que da la insignia, y la
// insignia es lo que abre el tomo siguiente.
//
// Es el mismo id que agrupa las hojas del examen final en el lector: el sello que
// el libro estampa y el que el servidor reconoce son la misma cosa, así que el
// nombre no puede estar escrito dos veces.
export const FINAL_SEAL = 'final'

// Mínimo de caracteres de la contraseña. El mismo que exige Firebase. Lo
// comprueba el servidor, y el formulario lo dice de antemano para que nadie tenga
// que equivocarse para enterarse.
export const PASSWORD_MIN_LENGTH = 6

export interface Account {
  id: string
  name: string
  email: string
  // Cómo se entró. Solo informa: quien entró con Google no tiene contraseña que
  // cambiar.
  provider: 'password' | 'google'
}

// Los sellos de varios tomos a la vez: por cada bloque, los exámenes superados.
// Es lo que se manda al crear la cuenta para que absorba lo hecho sin ella.
export type SealsByBlock = Record<string, string[]>

// Un tomo superado, guardado en la cuenta. Todavía sin diseño propio: de momento
// solo dice cuál es.
export interface Badge {
  blockId: string
  // El número del tomo en la colección, empezando por 1.
  volume: number
}

// Lo que dice el servidor de cada tomo para este usuario.
export interface VolumeGate {
  blockId: string
  // Si le da derecho a abrirlo. Lo decide el SERVIDOR y no la app: si lo decidiera
  // el navegador, bastaría con tocar sus datos para llevarse el tomo siguiente.
  unlocked: boolean
  // Si el tomo está escrito. Un tomo desbloqueado pero sin escribir se ve en la
  // balda y avisa de que todavía no está; nunca se abre en blanco.
  published: boolean
}

// Todo lo que hace falta para leer un tomo, en un solo paquete.
//
// El tomo no pide nada más al temario: con esto se arman todas sus páginas. Es lo
// que permite que del bloque 2 en adelante el contenido llegue del servidor en vez
// de viajar en el bundle —ver «El contenido de pago no puede vivir en content/»
// en CLAUDE.md—.
export interface VolumeContent {
  block: Block
  // Los kana de sus lecciones.
  kana: Kana[]
  // Todas las palabras que aparecen: las de las lecciones, las del bloque y las
  // de sus frases.
  words: Word[]
  sentences: Sentence[]
  // Cuánto se lleva aprendido al terminarlo, contando los tomos anteriores. Viene
  // hecho porque para calcularlo hacen falta los bloques de antes, y esos no
  // vienen en el paquete.
  progress: {
    kana: number
    kanaPercent: number
    words: number
    wordsPercent: number
  }
}
