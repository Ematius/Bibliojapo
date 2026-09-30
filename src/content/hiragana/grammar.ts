import type { Grammar } from '../types'

export const GRAMMAR: Grammar[] = [
  {
    id: 'topic-wa',
    character: 'は',
    romaji: 'wa',
    explanation:
      'は marca de qué habla la frase. Se escribe con el mismo kana que ya conoces ' +
      '—は, que se lee «ha»—, pero puesto entre el tema y lo que se dice de él, se ' +
      'lee «wa». Se usa en la gramática japonesa principalmente como partícula temática,' +
      ' y sirve para marcar el tema principal o de lo que se va a hablar en la oración'
  },
  {
    id: 'particle-e',
    character: 'へ',
    romaji: 'e',
    title: 'La partícula へ — dirección',
    explanation:
      '「へ」 se escribe como el kana «he», pero cuando funciona como partícula se ' +
      'pronuncia «e».\n\n' +
      'Marca la dirección hacia la que se va: へやへいきます = «voy a la habitación». ' +
      'Fíjate en que la misma へ aparece dos veces en esa frase y suena distinto cada ' +
      'vez — la primera es parte de la palabra へや (habitación) y suena «he»; la ' +
      'segunda es partícula y suena «e».\n\n' +
      'Es la tercera de las tres partículas que no se leen como su kana: ' +
      'は → wa · を → o · へ → e.',
  },
  {
    id: 'particle-no',
    character: 'の',
    romaji: 'no',
    explanation: 'Permite formar relaciones nominales como いえのえ.',
  },
  {
    id: 'particle-ni',
    character: 'に',
    romaji: 'ni',
    explanation: 'Permite construir localizaciones y cambios de estado con いる, ある y なる.',
  },
  { id: 'particle-mo', character: 'も', romaji: 'mo', explanation: '' },
  { id: 'particle-ne', character: 'ね', romaji: 'ne', explanation: '' },
  { id: 'particle-o', character: 'を', romaji: 'o', explanation: '' },
  { id: 'particle-ga', character: 'が', romaji: 'ga', explanation: '' },
  { id: 'particle-de', character: 'で', romaji: 'de', explanation: '' },
  { id: 'particle-ka', character: 'か', romaji: 'ka', explanation: '' },
  { id: 'particle-to', character: 'と', romaji: 'to', explanation: '' },
]

export const GRAMMAR_BY_ID = new Map(GRAMMAR.map((rule) => [rule.id, rule]))
