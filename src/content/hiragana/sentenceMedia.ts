// El audio de cada frase: la única media que lleva una frase, y la que el tercer
// bloque del examen final necesita para poder contestarse —ahí la frase no se lee ni
// se traduce, solo suena—.
//
// Vive aparte de `sentences.ts` por lo mismo que `vocabularyMedia.ts`: ese archivo se
// GENERA del documento del temario, y regenerarlo no puede llevarse por delante las
// grabaciones. La clave es el id de la frase.
import type { Sentence } from '../types'

const AUDIO: Record<string, string> = {
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
}

// Una frase sin grabación se queda como está: el botón de escuchar sale apagado en vez
// de fingir que suena —ver `parts/bookAudio.ts`—, y el volcado la lista como pendiente.
export function withAudio(sentences: Sentence[]): Sentence[] {
  return sentences.map((sentence) =>
    AUDIO[sentence.id] ? { ...sentence, audio: AUDIO[sentence.id] } : sentence,
  )
}
