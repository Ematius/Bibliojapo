// «はい» y «いいえ» —sí / no— NO están aquí: son una palabra usada entera como
// respuesta, y ya están en `vocabulary.ts`. Convertirlas en `Sentence` sería
// duplicar el mismo dato con otro nombre.
import type { Sentence } from '../types'

export const SENTENCES: Sentence[] = [
  {
    id: 'ie-wa-aoi',
    text: 'いえはあおい',
    meaning: 'La casa es azul',
    wordIds: ['ie', 'aoi'],
    grammarId: 'topic-wa',
  },
  {
    id: 'ie-wa-ii',
    text: 'いえはいい',
    meaning: 'La casa es buena',
    wordIds: ['ie', 'ii'],
    grammarId: 'topic-wa',
  },
  {
    id: 'ie-wa-ooi',
    text: 'いえはおおい',
    meaning: 'Hay muchas casas',
    wordIds: ['ie', 'ooi'],
    grammarId: 'topic-wa',
  },
  {
    id: 'e-wa-aoi',
    text: 'えはあおい',
    meaning: 'El cuadro es azul',
    wordIds: ['e', 'aoi'],
    grammarId: 'topic-wa',
  },
  {
    id: 'e-wa-ii',
    text: 'えはいい',
    meaning: 'El cuadro es bueno',
    wordIds: ['e', 'ii'],
    grammarId: 'topic-wa',
  },
  {
    id: 'e-wa-ooi',
    text: 'えはおおい',
    meaning: 'Hay muchos cuadros',
    wordIds: ['e', 'ooi'],
    grammarId: 'topic-wa',
  },
  {
    id: 'ue-wa-aoi',
    text: 'うえはあおい',
    meaning: 'Lo de arriba es azul',
    wordIds: ['ue', 'aoi'],
    grammarId: 'topic-wa',
  },
  {
    id: 'ue-wa-ii',
    text: 'うえはいい',
    meaning: 'Lo de arriba está bien',
    wordIds: ['ue', 'ii'],
    grammarId: 'topic-wa',
  },
  {
    id: 'ao-wa-ii',
    text: 'あおはいい',
    meaning: 'El azul es bonito',
    wordIds: ['ao', 'ii'],
    grammarId: 'topic-wa',
  },
  {
    id: 'ao-wa-ooi',
    text: 'あおはおおい',
    meaning: 'Hay mucho azul',
    wordIds: ['ao', 'ooi'],
    grammarId: 'topic-wa',
  },
  {
    id: 'haha-wa-ii',
    text: 'はははいい',
    meaning: 'Mi madre es buena',
    wordIds: ['haha', 'ii'],
    grammarId: 'topic-wa',
  },
  {
    id: 'haha-wa-au',
    text: 'はははあう',
    meaning: 'Mi madre se encuentra (con alguien)',
    wordIds: ['haha', 'au'],
    grammarId: 'topic-wa',
  },
  {
    id: 'haha-wa-iu',
    text: 'はははいう',
    meaning: 'Mi madre dice',
    wordIds: ['haha', 'iu'],
    grammarId: 'topic-wa',
  },
  {
    id: 'ha-wa-ii',
    // Dos は seguidos y cada uno es una cosa: el primero es la palabra «diente» —«ha»—,
    // el segundo la partícula —«wa»—.
    text: 'ははいい',
    meaning: 'El diente está bien',
    wordIds: ['ha', 'ii'],
    grammarId: 'topic-wa',
  },
  {
    id: 'ha-wa-ooi',
    text: 'ははおおい',
    meaning: 'Hay muchos dientes',
    wordIds: ['ha', 'ooi'],
    grammarId: 'topic-wa',
  },
]

export const SENTENCES_BY_ID = new Map(SENTENCES.map((sentence) => [sentence.id, sentence]))
