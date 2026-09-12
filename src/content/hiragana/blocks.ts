import type { Block } from '../types'

export const BLOCKS: Block[] = [
  {
    id: 'b1',
    title: 'Bloque 1 · Las vocales y は',
    summary:
      'Cinco vocales y un kana más. Son pocos, pero con ellos ya se escriben ' +
      'frases enteras: por eso は se adelanta a su sitio en la tabla tradicional.',
    // Los ids son el rōmaji de cada kana: la ficha que se trace en `kana.ts` tiene
    // que nacer con ese mismo id o el bloque dejará de encontrarla.
    //
    // La palabra no es un ejemplo cualquiera: es la que hace falta para las frases
    // del final del bloque. Nunca una palabra de un solo kana —え, は—, porque no se
    // puede pedir que se encuentre el kana DENTRO de la palabra si son lo mismo.
    //
    // Esto es el PLAN: una lección se lista aunque le falte contenido, y
    // `VolumeReader` deja fuera la que no esté entera.
    lessons: [
      { kanaId: 'a', wordId: 'aoi', wordId2: 'au' },
      { kanaId: 'i', wordId: 'ie', wordId2: 'ii' },
      { kanaId: 'u', wordId: 'ue', wordId2: 'iu' },
      { kanaId: 'e', wordId: 'iie', wordId2: 'ie' },
      { kanaId: 'o', wordId: 'ooi', wordId2: 'ao' },
      { kanaId: 'ha', wordId: 'haha', wordId2: 'hai' },
    ],
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

// El temario entero en orden, escrito o no: es lo que dice cuántos tomos hay en la
// estantería. `BLOCKS` solo tiene los que ya tienen contenido. Solo ids, porque del
// bloque 2 en adelante el contenido no viajará en el bundle.
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

// Los 46 kana base. B10–B12 no traen caracteres nuevos —dakuten, っ y yōon son
// transformaciones—, así que el silabario son 110 formas pero solo 46 que dibujar.
export const HIRAGANA_BASE_COUNT = 46

// Aproximado a propósito: el examen no publica su lista de vocabulario.
export const N5_WORD_COUNT = 800

// Los otros dos frentes, todavía sin temario. El carné los enseña a cero desde el
// primer día: sin ellos parecería que el camino acaba en el hiragana.
export const KATAKANA_BASE_COUNT = 46

// Aproximado, igual que las palabras. Cuando exista `content/kanji/` saldrá de ahí.
export const N5_KANJI_COUNT = 100

// Acumulado desde el primer bloque y SIN repetir: una palabra que reaparece más
// tarde no cuenta dos veces, y por eso se juntan en conjuntos en vez de sumar
// longitudes. Los porcentajes van sin redondear.
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
