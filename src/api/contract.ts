import type { AisleId } from '../content/aisleContent'
import type { Block, Grammar, Kana, Sentence, Word } from '../content/types'
import type { Conjugation } from '../content/conjugations'

// El mismo id con el que el lector agrupa las hojas del examen final: el sello
// que estampa el libro y el que reconoce el servidor son la misma cosa.
export const FINAL_SEAL = 'final'

// El mínimo que exige Firebase. Lo comprueba el servidor; el formulario solo lo
// adelanta.
export const PASSWORD_MIN_LENGTH = 6

export interface Account {
  id: string
  name: string
  email: string
  provider: 'password' | 'google'
}

export type SealsByBlock = Record<string, string[]>

export interface Badge {
  blockId: string
  // El número del tomo en la colección, empezando por 1.
  volume: number
}

export type TrackId = 'hiragana' | 'katakana' | 'kanji' | 'vocabulary'

// Van los dos números y no el porcentaje: el carné enseña «12 de 46», y de una
// división ya hecha no se recuperan los operandos.
export interface JourneyTrack {
  id: TrackId
  learned: number
  total: number
}

// De qué avisa quien escribe. Se manda el motivo aparte del texto porque es lo que
// ordena la bandeja: un fallo de la beta no espera lo mismo que una idea.
export type FeedbackKind = 'bug' | 'idea' | 'other'

// Lo que se adjunta sin que nadie lo escriba. Para arreglar un fallo vale más que el
// propio mensaje: nadie dice desde qué pantalla escribía ni con qué navegador.
export interface FeedbackContext {
  route: string
  userAgent: string
  viewport: string
  sentAt: string
  // Null cuando se escribe sin cuenta, que se puede: un fallo se cuenta igual.
  accountId: string | null
}

export interface FeedbackReport {
  kind: FeedbackKind
  message: string
  // Vacío si no se deja: sin correo no hay forma de responder, pero el aviso sirve.
  email: string
  context: FeedbackContext
}

// Por dónde va la lectura: el primer tomo abierto y escrito que todavía no está
// sellado. Lo dice el servidor y no la app porque depende de las insignias, que son
// suyas — la misma razón por la que no decide el navegador qué tomo se abre.
export interface CurrentVolume {
  blockId: string
  aisleId: AisleId
  // Su puesto dentro del pasillo, empezando por 1: el número que enseña la balda.
  volumeNumber: number
}

export interface VolumeGate {
  blockId: string
  // Lo decide el SERVIDOR, nunca el navegador: si no, bastaría con tocar los datos
  // locales para llevarse el tomo siguiente.
  unlocked: boolean
  // Un tomo desbloqueado pero sin escribir avisa en la balda; nunca se abre en blanco.
  published: boolean
}

export interface VolumeContent {
  block: Block
  kana: Kana[]
  words: Word[]
  sentences: Sentence[]
  // Las reglas que nombran esas frases por su `grammarId`. Viajan resueltas porque el
  // lector no mira `content/` por su cuenta: sin esto, la explicación de por qué は se
  // lee «wa» de partícula no tendría forma de llegar a la hoja.
  grammar: Grammar[]
  // Las formas conjugadas que a esta altura del recorrido ya se saben leer, filtradas por
  // el servidor. Viajan como PATRÓN y no como palabras: そうじします no es una entrada del
  // temario, se compone de そうじし y un sufijo — ver `content/conjugations.ts`.
  conjugations: Conjugation[]
  // Viene calculado: cuenta también los tomos anteriores, que no están en el paquete.
  progress: {
    kana: number
    kanaPercent: number
    words: number
    wordsPercent: number
  }
}
