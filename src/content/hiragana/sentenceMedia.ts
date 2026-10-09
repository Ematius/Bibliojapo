// El audio de cada frase: la única media que lleva una frase, y la que el tercer
// bloque del examen final necesita para poder contestarse —ahí la frase no se lee ni
// se traduce, solo suena—.
//
// Vive aparte de `sentences.ts` por lo mismo que `vocabularyMedia.ts`: ese archivo se
// GENERA del documento del temario, y regenerarlo no puede llevarse por delante las
// grabaciones. La clave es el id de la frase.
import type { Sentence } from '../types'

const AUDIO: Record<string, string> = {}

// Una frase sin grabación se queda como está: el botón de escuchar sale apagado en vez
// de fingir que suena —ver `parts/bookAudio.ts`—, y el volcado la lista como pendiente.
export function withAudio(sentences: Sentence[]): Sentence[] {
  return sentences.map((sentence) =>
    AUDIO[sentence.id] ? { ...sentence, audio: AUDIO[sentence.id] } : sentence,
  )
}
