// El audio de cada frase: la única media que lleva una frase, y la que el tercer
// bloque del examen final necesita para poder contestarse —ahí la frase no se lee ni
// se traduce, solo suena—.
//
// Vive aparte de `sentences.ts` por lo mismo que `vocabularyMedia.ts`: ese archivo se
// GENERA del documento del temario, y regenerarlo no puede llevarse por delante las
// grabaciones. La clave es el id de la frase.
import type { Sentence, WordUnit } from '../types'
import { VOCABULARY } from './vocabulary'

const AUDIO: Record<string, string> = {
  // Las del b1 van con BARRA delante: ese bloque es gratis y su media se queda en
  // `public/` en vez del bucket — ver `api/media.ts`.
  'ao-wa-ii': '/audio/hiragana/b1/sentence/ao-wa-ii.wav',
  'e-wa-aoi': '/audio/hiragana/b1/sentence/e-wa-aoi.wav',
  'ee': '/audio/hiragana/b1/sentence/ee.wav',
  'haha-wa-ii': '/audio/hiragana/b1/sentence/haha-wa-ii.wav',
  'ie-wa-aoi': '/audio/hiragana/b1/sentence/ie-wa-aoi.wav',
  'ie-wa-ii': '/audio/hiragana/b1/sentence/ie-wa-ii.wav',
  'ue-wa-aoi': '/audio/hiragana/b1/sentence/ue-wa-aoi.wav',
  'aimasen': 'hiragana/b2/audio/sentence/aimasen.wav',
  'aimasu': 'hiragana/b2/audio/sentence/aimasu.wav',
  'amaidesu': 'hiragana/b2/audio/sentence/amaidesu.wav',
  'aoidesu': 'hiragana/b2/audio/sentence/aoidesu.wav',
  'hahadesu': 'hiragana/b2/audio/sentence/hahadesu.wav',
  'iedesu': 'hiragana/b2/audio/sentence/iedesu.wav',
  'iimasu': 'hiragana/b2/audio/sentence/iimasu.wav',
  'isudesu': 'hiragana/b2/audio/sentence/isudesu.wav',
  'mazuidesu': 'hiragana/b2/audio/sentence/mazuidesu.wav',
  'ooidesu': 'hiragana/b2/audio/sentence/ooidesu.wav',
  'semaidesu': 'hiragana/b2/audio/sentence/semaidesu.wav',
  'senseidesu': 'hiragana/b2/audio/sentence/senseidesu.wav',
  'uedesu': 'hiragana/b2/audio/sentence/uedesu.wav',
  'usuidesu': 'hiragana/b2/audio/sentence/usuidesu.wav',
  'arimasu': 'hiragana/b3/audio/sentence/arimasu.wav',
  'arimasen': 'hiragana/b3/audio/sentence/arimasen.wav',
  'imasu': 'hiragana/b3/audio/sentence/imasu.wav',
  'imasen': 'hiragana/b3/audio/sentence/imasen.wav',
  'shimasu': 'hiragana/b3/audio/sentence/shimasu.wav',
  'shimasen': 'hiragana/b3/audio/sentence/shimasen.wav',
  'kaimasu': 'hiragana/b3/audio/sentence/kaimasu.wav',
  'akaidesu': 'hiragana/b3/audio/sentence/akaidesu.wav',
  'oishiidesu': 'hiragana/b3/audio/sentence/oishiidesu.wav',
  'eigadesu': 'hiragana/b3/audio/sentence/eigadesu.wav',
  'ashidesu': 'hiragana/b3/audio/sentence/ashidesu.wav',
  'urimasu': 'hiragana/b3/audio/sentence/urimasu.wav',
  'oshiemasu': 'hiragana/b3/audio/sentence/oshiemasu.wav',
  'orimasu': 'hiragana/b3/audio/sentence/orimasu.wav',
  'ie-wa-shizukadesu': 'hiragana/b3/audio/sentence/ie-wa-shizukadesu.wav',
}

const WORD_BY_ID = new Map(VOCABULARY.map((word) => [word.id, word]))

// Lo que de verdad se pronuncia, kana a kana. La puntuación no entra en los units, así
// que comparar esto compara el sonido.
const spoken = (units: WordUnit[]): string =>
  units.map((unit) => `${unit.kana}:${unit.romaji}`).join('|')

// Una frase que se pronuncia EXACTAMENTE igual que una de sus palabras hereda su
// grabación: はい。 y はい son la misma emisión y grabarla dos veces es grabar lo mismo.
//
// No vale con que la frase tenga UNA sola palabra: ありました。 también la tiene y suena
// distinto que ある. Por eso se comparan los units y no se cuentan las palabras — con la
// cuenta, las cuatro frases conjugadas heredarían el audio de su verbo en diccionario, y
// un audio equivocado es peor que ninguno: suena, se aprende mal, y el informe de faltas
// la da por hecha.
function inheritedAudio(sentence: Sentence): string | undefined {
  const sound = spoken(sentence.units)

  for (const wordId of sentence.wordIds) {
    const word = WORD_BY_ID.get(wordId)
    if (word?.audio && spoken(word.units) === sound) return word.audio
  }

  return undefined
}

// El mapa manda sobre la herencia: una frase con su propia grabación la usa aunque suene
// como su palabra.
//
// Una frase sin grabación se queda como está: el botón de escuchar sale apagado en vez
// de fingir que suena —ver `parts/bookAudio.ts`—, y el volcado la lista como pendiente.
export function withAudio(sentences: Sentence[]): Sentence[] {
  return sentences.map((sentence) => {
    const audio = AUDIO[sentence.id] ?? inheritedAudio(sentence)
    return audio ? { ...sentence, audio } : sentence
  })
}
