// Parte una frase en las palabras que la componen, y de ahí saca sus partículas.
//
// La alternativa —decidir por el kana si una は es partícula— se rompe con lo que ya hay
// en el pool: は es también la palabra «diente» y se lee «ha», y へや empieza por へ sin
// que sea la partícula «e». Segmentando contra las palabras que la frase declara, lo que
// queda ENTRE ellas es partícula por definición y no hay nada que adivinar.
//
// De regalo valida el contenido: una frase que no se puede segmentar con el vocabulario
// disponible es una frase a la que le falta una palabra o le sobra un carácter.
import { tokenizeWord } from './romaji.mjs'

// Se leen distinto de lo que dicen sus kana, y solo cuando hacen de partícula.
export const PARTICLES = {
  は: 'wa',
  を: 'o',
  へ: 'e',
}

// Las demás partículas se leen como su kana, pero hay que conocerlas para poder
// separarlas: sin ellas la frase no se deja segmentar.
const PLAIN_PARTICLES = ['が', 'に', 'で', 'と', 'も', 'の', 'か', 'ね', 'よ', 'から', 'まで', 'より', 'や']

const PUNCTUATION = ['。', '、']

// Los once sufijos, con el tipo de palabra al que se pegan. Los mismos que las once
// filas de `conjugations` en la base: si se toca uno, se tocan los dos.
const SUFFIXES = [
  { suffix: 'ます', on: 'verb', stem: 'masu' },
  { suffix: 'ません', on: 'verb', stem: 'masu' },
  { suffix: 'ました', on: 'verb', stem: 'masu' },
  { suffix: 'ませんでした', on: 'verb', stem: 'masu' },
  { suffix: 'たい', on: 'verb', stem: 'masu' },
  { suffix: 'たいです', on: 'verb', stem: 'masu' },
  { suffix: 'ない', on: 'verb', stem: 'nai' },
  { suffix: 'ましょう', on: 'verb', stem: 'masu' },
  { suffix: 'です', on: 'copula' },
  { suffix: 'でした', on: 'copula' },
  { suffix: 'ではありません', on: 'copula' },
  { suffix: 'ではありませんでした', on: 'copula' },
]

const VERB_TYPES = new Set(['verbo-u', 'verbo-ru', 'verbo-irregular'])
// です se pega a más cosas que las tres de `conjugations.aplica_a`: いつですか lleva un
// interrogativo y ほんとうですか un adverbio. Aquí interesa poder SEGMENTAR la frase, no
// decidir qué formas se le enseñan al alumno, que es lo que dice la tabla.
const COPULA_TYPES = new Set([
  'sustantivo', 'adjetivo-na', 'adjetivo-i', 'pronombre', 'numero',
  'interrogativo', 'adverbio', 'expresion',
])

// La fila «a», para el negativo llano de un godan. Las mismas nueve de `kana_rows`.
const ROW_A = { う: 'わ', く: 'か', ぐ: 'が', す: 'さ', つ: 'た', ぬ: 'な', ぶ: 'ば', む: 'ま', る: 'ら' }

function naiStemOf(word) {
  if (word.naiStem !== undefined) return word.naiStem
  const text = word.text
  if (word.verbGroup === 'ichidan') return text.slice(0, -1)
  if (word.verbGroup === 'godan') {
    const last = text.slice(-1)
    return ROW_A[last] ? text.slice(0, -1) + ROW_A[last] : null
  }
  return null
}

// Todas las formas escritas con las que una palabra puede aparecer en una frase.
export function formsOf(word) {
  const forms = [{ text: word.text, wordId: word.id, form: null }]

  for (const { suffix, on, stem } of SUFFIXES) {
    if (on === 'verb' && VERB_TYPES.has(word.type)) {
      const base = stem === 'nai' ? naiStemOf(word) : word.masuStem
      if (base === null || base === undefined) continue
      forms.push({ text: base + suffix, wordId: word.id, form: suffix })
    }
    if (on === 'copula' && COPULA_TYPES.has(word.type)) {
      forms.push({ text: word.text + suffix, wordId: word.id, form: suffix })
    }
  }

  // Un adjetivo-i no lleva ではありません sino くないです; hasta que el temario lo pida,
  // basta con no generarlo.
  return forms
}

// Devuelve los trozos de la frase, o null si no se deja segmentar con lo que hay.
export function segment(text, words) {
  const candidates = []
  for (const word of words) for (const form of formsOf(word)) candidates.push(form)
  for (const p of Object.keys(PARTICLES)) candidates.push({ text: p, particle: true })
  for (const p of PLAIN_PARTICLES) candidates.push({ text: p, particle: true })
  for (const p of PUNCTUATION) candidates.push({ text: p, punctuation: true })

  // El más largo primero: sin eso, おおい se partiría en おお + い. Y a igual longitud, la
  // partícula antes que la palabra: は es también «diente», y en かさはありません el
  // segmentador la tomaba por la palabra y la leía «ha» en vez de «wa». Cuando una frase
  // use de verdad la palabra, `ambiguities` la saca para mirarla.
  candidates.sort((a, b) => b.text.length - a.text.length || (b.particle ? 1 : 0) - (a.particle ? 1 : 0))

  const seen = new Set()
  const walk = (at) => {
    if (at === text.length) return []
    if (seen.has(at)) return null
    for (const c of candidates) {
      if (!text.startsWith(c.text, at)) continue
      const rest = walk(at + c.text.length)
      if (rest) return [c, ...rest]
    }
    seen.add(at)
    return null
  }
  return walk(0)
}

// Las piezas que se han leído como partícula existiendo una PALABRA que se escribe
// igual. Se resuelven a favor de la partícula, que es lo correcto casi siempre, pero
// hay que poder mirarlas: la frase que hable de un diente se lee distinto.
export function ambiguities(pieces, words) {
  const spelled = new Set(words.map((w) => w.text))
  return pieces.filter((p) => p.particle && spelled.has(p.text)).map((p) => p.text)
}

// Los units de la frase entera, con las partículas leídas como tales.
export function sentenceUnits(pieces) {
  const units = []
  for (const piece of pieces) {
    if (piece.punctuation) continue
    if (piece.particle && PARTICLES[piece.text]) {
      units.push({ kana: piece.text, romaji: PARTICLES[piece.text] })
      continue
    }
    // `tokenizeWord` y no `tokenize`: una PALABRA puede llevar dentro una は que se lee
    // «wa» —では、また—, y esas excepciones son por palabra entera.
    units.push(...tokenizeWord(piece.text))
  }
  return units
}
