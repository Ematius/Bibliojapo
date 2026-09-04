// El vocabulario del pasillo de hiragana.
//
// Sale de `docs/estructura-aprendizaje.md`, que es donde se decide QUÉ se enseña.
// Aquí no se inventa ninguna palabra ni ninguna lectura: si falta algo, se añade
// primero allí.
//
// De momento está solo lo que algún ejercicio usa. El bloque 1 tiene trece
// palabras —え, は, はは, いえ, うえ, あお, あおい, いい, おおい, あう, いう, はい,
// いいえ— y se irán añadiendo según hagan falta, no antes.
import type { Word } from '../types'

export const VOCABULARY: Word[] = [
  {
    id: 'aoi',
    // あ es el kana que se estudia; お e い llegan más adelante en el mismo bloque.
    // La palabra se adelanta a propósito: es lo que da sentido a reconocer un kana
    // suelto —dentro de una palabra de verdad y no en una tabla—.
    units: [
      { kana: 'あ', romaji: 'a' },
      { kana: 'お', romaji: 'o' },
      { kana: 'い', romaji: 'i' },
    ],
    meaning: 'azul',
    // Grabado con la misma voz que los kana, para que la palabra y sus piezas
    // suenen a la misma persona. Ver la nota de formato en `kana.ts`.
    audio: '/audio/hiragana/b1/aoi.wav',
  },
]

// Acceso por id, que es como lo pide una página del tomo.
export const VOCABULARY_BY_ID = new Map(VOCABULARY.map((word) => [word.id, word]))
