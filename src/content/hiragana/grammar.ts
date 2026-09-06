// La gramática del pasillo de hiragana, introducida solo cuando una frase la
// necesita — nunca como bloque aparte. Ver «Gramática Just-In-Time» en
// docs/estructura-aprendizaje.md.
import type { Grammar } from '../types'

export const GRAMMAR: Grammar[] = [
  {
    id: 'topic-wa',
    // El mismo carácter que la palabra «diente» —ver `ha` en vocabulary.ts— y
    // que el propio kana は. No es una coincidencia que haya que resolver: en
    // ははいい, el primer は es la palabra «diente» y el segundo es esta misma
    // partícula, y las dos se escriben igual y suenan distinto.
    character: 'は',
    romaji: 'wa',
    explanation:
      'は marca de qué habla la frase. Se escribe con el mismo kana que ya conoces ' +
      '—は, que se lee «ha»—, pero puesto entre el tema y lo que se dice de él se ' +
      'lee «wa».',
  },
]

export const GRAMMAR_BY_ID = new Map(GRAMMAR.map((rule) => [rule.id, rule]))
