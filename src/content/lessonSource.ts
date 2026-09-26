// El temario en crudo —trazos, mnemotecnias, palabras, frases— y quién lo lee: SOLO el
// script de volcado, `scripts/seed-content.mjs`.
//
// NO se importa desde `src/`. Lo que se importa ahí acaba en `dist/`, y del bloque 2 en
// adelante el temario es contenido que exige cuenta: si viajara en el despliegue, el
// muro se saltaría abriendo el inspector. El front recibe el tomo ya empaquetado por
// `fetchVolume`. Ver «El contenido de pago no puede vivir en `content/`» en CLAUDE.md.
import type { AisleId } from './aisleContent'
import type { Block, Grammar, Kana, Sentence, Word } from './types'

export interface LessonContent {
  // Los bloques escritos. Un id del plan sin entrada aquí es un tomo sin escribir, y
  // el volcado lo marca como no publicado.
  blocksById: ReadonlyMap<string, Block>
  kanaById: ReadonlyMap<string, Kana>
  wordsById: ReadonlyMap<string, Word>
  sentencesById: ReadonlyMap<string, Sentence>
  grammarById: ReadonlyMap<string, Grammar>
}

// Un pasillo sin temario no tiene nada que volcar, la misma regla que un bloque sin
// escribir. Se sustituye por su carga de verdad el día que exista su `content/<pasillo>/`.
async function emptyContent(): Promise<LessonContent> {
  return {
    blocksById: new Map(),
    kanaById: new Map(),
    wordsById: new Map(),
    sentencesById: new Map(),
    grammarById: new Map(),
  }
}

export const LESSON_SOURCE: Readonly<Record<AisleId, () => Promise<LessonContent>>> = {
  hiragana: async () => {
    const [
      { BLOCKS_BY_ID },
      { HIRAGANA_BY_ID },
      { VOCABULARY_BY_ID },
      { SENTENCES_BY_ID },
      { GRAMMAR_BY_ID },
    ] =
      await Promise.all([
        import('./hiragana/blocks'),
        import('./hiragana/kana'),
        import('./hiragana/vocabulary'),
        import('./hiragana/sentences'),
        import('./hiragana/grammar'),
      ])
    return {
      blocksById: BLOCKS_BY_ID,
      kanaById: HIRAGANA_BY_ID,
      wordsById: VOCABULARY_BY_ID,
      sentencesById: SENTENCES_BY_ID,
      grammarById: GRAMMAR_BY_ID,
    }
  },
  katakana: emptyContent,
  kanji: emptyContent,
  vocabulary: emptyContent,
}
