import type { Block, Kana, Sentence, Word } from '../content/types'

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
  // Viene calculado: cuenta también los tomos anteriores, que no están en el paquete.
  progress: {
    kana: number
    kanaPercent: number
    words: number
    wordsPercent: number
  }
}
