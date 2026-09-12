import type { Grammar } from '../types'

export const GRAMMAR: Grammar[] = [
  {
    id: 'topic-wa',
    // El mismo carácter que la palabra «diente» y que el kana は: en ははいい el
    // primero es la palabra y el segundo esta partícula. Se escriben igual y suenan
    // distinto.
    character: 'は',
    romaji: 'wa',
    explanation:
      'は marca de qué habla la frase. Se escribe con el mismo kana que ya conoces ' +
      '—は, que se lee «ha»—, pero puesto entre el tema y lo que se dice de él se ' +
      'lee «wa».',
  },
]

export const GRAMMAR_BY_ID = new Map(GRAMMAR.map((rule) => [rule.id, rule]))
