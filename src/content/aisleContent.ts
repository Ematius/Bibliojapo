// Qué tomos tiene cada pasillo y cuánto suma su parte del N5. `shelfConfig.ts` y la
// capa `api/` leen de aquí en vez de importar `hiragana/` a pelo, que es lo único que
// les permite servir cualquier pasillo sin saber de los demás.
//
// Solo lo que hace falta EN EL FRONT: el temario en crudo está en `lessonSource.ts`,
// y este archivo no lo importa a propósito — lo que se importe aquí viaja en el
// despliegue.
import type { Block } from './types'
import {
  BLOCK_PLAN as HIRAGANA_BLOCK_PLAN,
  BLOCKS_BY_ID as HIRAGANA_BLOCKS_BY_ID,
  HIRAGANA_BASE_COUNT,
  KATAKANA_BASE_COUNT,
  N5_KANJI_COUNT,
  N5_WORD_COUNT,
} from './hiragana/blocks'

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
  // Los denominadores del N5 en ESTE pasillo: cuántos kana tiene y cuánto vocabulario.
  // Viven aquí para no escribirlos dos veces, porque el volcado se los lleva a la base
  // y una copia en SQL se quedaría vieja sin que nadie lo notase.
  kanaTotal: number
  wordTotal: number
}

// Un pasillo sin temario se registra con las listas vacías: la estantería no saca
// tomos y el servidor no tiene nada que empaquetar, la misma regla que un bloque sin
// escribir. Se sustituye por una entrada de verdad el día que exista su
// `content/<pasillo>/blocks.ts`.
function emptyAisle(kanaTotal: number): AisleContent {
  return {
    blockPlan: [],
    blocksById: new Map(),
    kanaTotal,
    wordTotal: N5_WORD_COUNT,
  }
}

export const AISLE_CONTENT: Readonly<Record<AisleId, AisleContent>> = {
  hiragana: {
    blockPlan: HIRAGANA_BLOCK_PLAN,
    blocksById: HIRAGANA_BLOCKS_BY_ID,
    kanaTotal: HIRAGANA_BASE_COUNT,
    wordTotal: N5_WORD_COUNT,
  },
  katakana: emptyAisle(KATAKANA_BASE_COUNT),
  kanji: emptyAisle(N5_KANJI_COUNT),
  // Vocabulario no cuenta kana: su arco del carné es la palabra sumada de los cuatro.
  vocabulary: emptyAisle(0),
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
