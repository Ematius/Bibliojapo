// Los bloques del pasillo de hiragana: qué se aprende junto y en qué orden. Ver
// «Estructura general» en docs/estructura-aprendizaje.md.
import type { Block } from '../types'

export const BLOCKS: Block[] = [
  {
    id: 'b1',
    title: 'Bloque 1 · Las vocales y は',
    summary:
      'Cinco vocales y un kana más. Son pocos, pero con ellos ya se escriben ' +
      'frases enteras: por eso は se adelanta a su sitio en la tabla tradicional.',
    // あ い う え お は, en el orden en que se enseñan, cada uno con la palabra con
    // la que se presenta. Los ids son el romaji de cada kana —así se escribió `a`
    // en `kana.ts`—, así que cuando se trace el siguiente a mano su ficha tiene
    // que nacer con ese mismo id o el bloque dejará de encontrarlo.
    //
    // La palabra no es un ejemplo cualquiera: es la que hace falta para las frases
    // del final del bloque. あ se enseña con あおい e い con いえ porque あおい y
    // いえ son dos de las palabras que arman «いえはあおい».
    //
    // Las tres últimas todavía no tienen palabra elegida, y por eso el tomo monta
    // hoy solo las tres primeras lecciones. Están listadas igualmente porque esto
    // es el PLAN del bloque: en cuanto se decide con qué palabra se enseña un kana,
    // se escribe aquí y su lección entra en el libro sin tocar nada más.
    lessons: [
      { kanaId: 'a', wordId: 'aoi' },
      { kanaId: 'i', wordId: 'ie' },
      { kanaId: 'u', wordId: 'ue' },
      { kanaId: 'e' },
      { kanaId: 'o' },
      { kanaId: 'ha' },
    ],
    // Las trece palabras del bloque, en `vocabulary.ts`.
    wordIds: [
      'e',
      'ha',
      'haha',
      'ie',
      'ue',
      'ao',
      'aoi',
      'ii',
      'ooi',
      'au',
      'iu',
      'hai',
      'iie',
    ],
    // Las quince frases del bloque, en `sentences.ts`. «はい»/«いいえ» no cuentan
    // como frase — ver la nota de `sentences.ts`.
    sentenceIds: [
      'ie-wa-aoi',
      'ie-wa-ii',
      'ie-wa-ooi',
      'e-wa-aoi',
      'e-wa-ii',
      'e-wa-ooi',
      'ue-wa-aoi',
      'ue-wa-ii',
      'ao-wa-ii',
      'ao-wa-ooi',
      'haha-wa-ii',
      'haha-wa-au',
      'haha-wa-iu',
      'ha-wa-ii',
      'ha-wa-ooi',
    ],
  },
]

export const BLOCKS_BY_ID = new Map(BLOCKS.map((block) => [block.id, block]))

// Los 46 kana base, que es contra lo que se mide cuánto hiragana se lleva. Los
// bloques B10 a B12 no traen kana nuevos —son dakuten, っ y yōon, transformaciones
// de los que ya se saben—, así que el silabario completo son 110 formas pero los
// caracteres que hay que aprender a dibujar siguen siendo estos 46.
export const HIRAGANA_BASE_COUNT = 46

// El vocabulario objetivo del JLPT N5, redondeado. Sale de
// docs/estructura-aprendizaje.md, y es aproximado a propósito: no hay una lista
// oficial: el propio examen no la publica.
export const N5_WORD_COUNT = 800

// Cuánto se lleva aprendido al TERMINAR un bloque, contando desde el primero.
//
// Acumulado y sin repetir. Una palabra que reaparece en un bloque posterior no se
// cuenta dos veces —ver «Principio de reutilización» en
// docs/estructura-aprendizaje.md—, y por eso se juntan en conjuntos en vez de
// sumar longitudes.
//
// Los porcentajes van sin redondear: quien los enseña decide con cuántos decimales
// los escribe.
export function progressThrough(blockId: string) {
  const upTo = BLOCKS.findIndex((block) => block.id === blockId)
  const reached = upTo < 0 ? [] : BLOCKS.slice(0, upTo + 1)

  const kana = new Set(reached.flatMap((block) => block.lessons.map((lesson) => lesson.kanaId)))
  const words = new Set(reached.flatMap((block) => block.wordIds))

  return {
    kana: kana.size,
    kanaPercent: (kana.size / HIRAGANA_BASE_COUNT) * 100,
    words: words.size,
    wordsPercent: (words.size / N5_WORD_COUNT) * 100,
  }
}
