// Qué carpeta de `content/` alimenta cada pasillo: su plan de tomos, sus bloques
// escritos y cómo pedir el resto —kana, vocabulario, frases— sin cargarlo entero en
// el bundle inicial. `shelfConfig.ts` y la capa `api/` leen de aquí en vez de
// importar `hiragana/` a pelo, que es lo único que les permite servir cualquier
// pasillo sin saber de los demás.
import type { Block, Kana, Sentence, Word } from './types'
import { BLOCK_PLAN as HIRAGANA_BLOCK_PLAN, BLOCKS_BY_ID as HIRAGANA_BLOCKS_BY_ID } from './hiragana/blocks'

// Mismos cuatro pasillos que `TrackId` en `api/contract.ts`. No se importa de allí
// para no hacer depender `content/` de `api/` —la dirección es siempre al revés—,
// así que si un pasillo se añade o se renombra hay que tocar los dos sitios.
export type AisleId = 'hiragana' | 'katakana' | 'kanji' | 'vocabulary'

export interface AisleContent {
  // El temario entero en orden, escrito o no: de aquí sale cuántos tomos tiene la
  // estantería del pasillo.
  blockPlan: readonly string[]
  // Solo los bloques que ya tienen contenido. Un id en `blockPlan` sin entrada aquí
  // es un tomo sin escribir.
  blocksById: ReadonlyMap<string, Block>
  // Lo pesado —trazos, mnemotecnias, audio— no viaja en el bundle inicial: se pide
  // aparte, como ya hacía `packVolume` a mano solo para hiragana.
  loadLessonContent: () => Promise<{
    kanaById: ReadonlyMap<string, Kana>
    wordsById: ReadonlyMap<string, Word>
    sentencesById: ReadonlyMap<string, Sentence>
  }>
}

// Un pasillo sin temario se registra con las listas vacías: la estantería no saca
// tomos y el servidor no tiene nada que empaquetar, la misma regla que un bloque sin
// escribir. Se sustituye por una entrada de verdad el día que exista su
// `content/<pasillo>/blocks.ts`.
const EMPTY_AISLE: AisleContent = {
  blockPlan: [],
  blocksById: new Map(),
  loadLessonContent: async () => ({
    kanaById: new Map(),
    wordsById: new Map(),
    sentencesById: new Map(),
  }),
}

export const AISLE_CONTENT: Readonly<Record<AisleId, AisleContent>> = {
  hiragana: {
    blockPlan: HIRAGANA_BLOCK_PLAN,
    blocksById: HIRAGANA_BLOCKS_BY_ID,
    loadLessonContent: async () => {
      const [{ HIRAGANA_BY_ID }, { VOCABULARY_BY_ID }, { SENTENCES_BY_ID }] = await Promise.all([
        import('./hiragana/kana'),
        import('./hiragana/vocabulary'),
        import('./hiragana/sentences'),
      ])
      return { kanaById: HIRAGANA_BY_ID, wordsById: VOCABULARY_BY_ID, sentencesById: SENTENCES_BY_ID }
    },
  },
  katakana: EMPTY_AISLE,
  kanji: EMPTY_AISLE,
  vocabulary: EMPTY_AISLE,
}

// El orden en el que un pasillo exige el anterior terminado del todo: katakana pide
// hiragana, kanji pide katakana, vocabulario pide kanji. Hiragana no tiene anterior,
// así que su primer tomo se queda gratis y sin cuenta.
export const AISLE_ORDER: readonly AisleId[] = ['hiragana', 'katakana', 'kanji', 'vocabulary']

// El id de un bloque tal y como lo escribe quien lo redacta (`b1`, `b2`...) se puede
// repetir de un pasillo a otro, y los sellos e insignias de una cuenta se guardan
// todos juntos en un solo mapa. Para que dos pasillos no choquen ahí, todo lo que no
// sea hiragana lleva el pasillo por delante. Hiragana se queda con su id tal cual
// —sin prefijo—: ya hay progreso guardado con esa forma en `localStorage`, y
// cambiarla lo dejaría ilegible para quien ya selló el tomo 1.
export function globalBlockId(aisleId: AisleId, localId: string): string {
  return aisleId === 'hiragana' ? localId : `${aisleId}:${localId}`
}
