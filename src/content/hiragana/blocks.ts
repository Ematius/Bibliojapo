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
    // Las seis tienen ya su palabra y su contenido completo, así que el tomo monta
    // el bloque entero. Una lección se lista aquí aunque no lo esté —esto es el PLAN
    // del bloque—, y `VolumeReader` deja fuera la que le falte algo.
    //
    // え se enseña con いいえ y no con え —que también es palabra—, y は se enseña
    // con はは y no con は, por la misma razón: una palabra de un solo kana deja
    // sin sentido media lección, porque no se puede pedir que se encuentre el
    // kana DENTRO de la palabra si la palabra es el kana entero.
    //
    // La segunda palabra es para los dos últimos ejercicios, y su reparto no es
    // libre: う solo aparece en うえ, あう e いう, y は solo en はは y はい. Desde
    // esos dos, que casi no tienen dónde elegir, sale forzado todo lo demás.
    //
    // え repite いえ y お repite あお: las dos ya se conocen a esas alturas del
    // tomo, y no pasa nada — lo que se pide es el kana dentro de OTRA palabra, no
    // una palabra que no se haya visto nunca.
    lessons: [
      { kanaId: 'a', wordId: 'aoi', wordId2: 'au' },
      { kanaId: 'i', wordId: 'ie', wordId2: 'ii' },
      { kanaId: 'u', wordId: 'ue', wordId2: 'iu' },
      { kanaId: 'e', wordId: 'iie', wordId2: 'ie' },
      { kanaId: 'o', wordId: 'ooi', wordId2: 'ao' },
      { kanaId: 'ha', wordId: 'haha', wordId2: 'hai' },
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

// El temario entero del pasillo, en orden: los doce bloques de «Estructura
// general» en docs/estructura-aprendizaje.md, escritos o no.
//
// `BLOCKS` solo tiene los que ya tienen contenido; esto es el PLAN, y es lo que
// dice cuántos tomos hay en la estantería. Un bloque sin escribir sigue siendo un
// tomo —se ve en la balda y se desbloquea a su hora—, solo que al abrirlo dice que
// todavía se está escribiendo.
//
// Solo ids a propósito: el título y el contenido de cada bloque llegan cuando se
// escribe, y del bloque 2 en adelante no viajarán en el bundle.
export const BLOCK_PLAN: readonly string[] = [
  'b1',
  'b2',
  'b3',
  'b4',
  'b5',
  'b6',
  'b7',
  'b8',
  'b9',
  'b10',
  'b11',
  'b12',
]

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
