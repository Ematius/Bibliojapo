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
import { CONJUGATIONS, KANA_ROW_BY_U, stemKind } from '../src/content/conjugations.ts'

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

// Los sufijos salen de `content/conjugations.ts`, que es la única lista que hay: el texto
// es la suma de los kana de su desglose, y `patron` dice de qué raíz cuelga. Antes estaban
// copiados aquí, y una corrección en la tabla no llegaba al segmentador.
const SUFFIXES = CONJUGATIONS.map((form) => ({
  suffix: form.suffixUnits.map((unit) => unit.kana).join(''),
  stem: stemKind(form),
  types: form.aplicaA,
}))

// です se pega a más cosas que las que dice `aplica_a`: いつですか lleva un interrogativo y
// ほんとうですか un adverbio. Aquí interesa poder SEGMENTAR la frase, no decidir qué formas
// se le enseñan al alumno, que es lo que dice la tabla — así que para la cópula manda esta
// lista, más ancha a propósito.
const COPULA_TYPES = new Set([
  'sustantivo', 'adjetivo-na', 'adjetivo-i', 'pronombre', 'numero',
  'interrogativo', 'adverbio', 'expresion',
])

function naiStemOf(word) {
  if (word.naiStem !== undefined) return word.naiStem
  const text = word.text
  if (word.verbGroup === 'ichidan') return text.slice(0, -1)
  if (word.verbGroup === 'godan') {
    // La fila «a» de las nueve, la misma tabla que usa el generador.
    const row = KANA_ROW_BY_U.get(text.slice(-1))
    return row ? text.slice(0, -1) + row.a.kana : null
  }
  return null
}

// La raíz de かったです: la palabra sin su い final.
function iStemOf(word) {
  return word.text.endsWith('い') ? word.text.slice(0, -1) : null
}

// Todas las formas escritas con las que una palabra puede aparecer en una frase.
export function formsOf(word) {
  const forms = [{ text: word.text, wordId: word.id, form: null }]

  for (const { suffix, stem, types } of SUFFIXES) {
    const fits = stem === 'palabra' ? COPULA_TYPES.has(word.type) : types.includes(word.type)
    if (!fits) continue

    const base = stem === 'palabra' ? word.text
      : stem === 'nai' ? naiStemOf(word)
        : stem === 'i' ? iStemOf(word)
          : word.masuStem
    if (base === null || base === undefined) continue

    forms.push({ text: base + suffix, wordId: word.id, form: suffix })
  }

  // Un adjetivo-i no lleva ではありません sino くないです; hasta que el temario lo pida,
  // basta con no generarlo.
  return forms
}

// Devuelve los trozos de la frase, o null si no se deja segmentar con lo que hay.
//
// `prefer` son los ids que el temario declara cuando dos palabras se escriben igual.
// Sin ellos aquí no hay nada que decidir: いえ es la casa y también «no», y los dos
// candidatos miden lo mismo.
export function segment(text, words, prefer = []) {
  const candidates = []
  for (const word of words) for (const form of formsOf(word)) candidates.push(form)
  for (const p of Object.keys(PARTICLES)) candidates.push({ text: p, particle: true })
  for (const p of PLAIN_PARTICLES) candidates.push({ text: p, particle: true })
  for (const p of PUNCTUATION) candidates.push({ text: p, punctuation: true })

  // El más largo primero: sin eso, おおい se partiría en おお + い. A igual longitud manda
  // lo que el temario declare, y si no declara nada, la partícula antes que la palabra: は
  // es también «diente», y en かさはありません el segmentador la tomaba por la palabra y la
  // leía «ha» en vez de «wa».
  const declared = new Set(prefer)
  const priority = (c) => (declared.has(c.wordId) ? 2 : c.particle ? 1 : 0)
  candidates.sort((a, b) => b.text.length - a.text.length || priority(b) - priority(a))

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

// Las piezas que podrían ser otra palabra escrita igual y a las que nadie ha dicho cuál
// es. El segmentador tiene que elegir una, y elige la primera del documento: así las dos
// frases de la casa acabaron apuntando a いえ «no», y nadie se enteró en dos años.
//
// Se mide contra TODO el vocabulario, no solo el disponible en el bloque: la segunda
// acepción puede llegar más tarde y el id ya quedaría escrito.
export function homographs(pieces, words, declared = []) {
  const textOf = new Map(words.map((w) => [w.id, w.text]))
  const howMany = new Map()
  for (const w of words) howMany.set(w.text, (howMany.get(w.text) ?? 0) + 1)

  const chosen = new Set(declared)
  return pieces
    .filter((p) => p.wordId && !chosen.has(p.wordId) && howMany.get(textOf.get(p.wordId)) > 1)
    .map((p) => p.wordId)
}

// El desglose de cada sufijo, por su texto. Sale de `conjugations.ts` y no de releer sus
// kana: la は de ではありません se lee «wa», y eso solo lo sabe la tabla.
const SUFFIX_UNITS = new Map(
  CONJUGATIONS.map((form) => [form.suffixUnits.map((unit) => unit.kana).join(''), form.suffixUnits]),
)

// Los units de la frase entera. La lectura de cada pieza sale de DONDE ESTÁ DECLARADA:
// una partícula de `PARTICLES`, un sufijo de su `suffixUnits`, y una palabra de
// `tokenizeWord`, que es quien guarda sus excepciones. Deducirla otra vez a partir del
// texto es tener dos ideas de cómo se lee lo mismo, y la は ya ha vuelto por tres rutas
// distintas por eso.
export function sentenceUnits(pieces) {
  const units = []
  for (const piece of pieces) {
    if (piece.punctuation) continue
    if (piece.particle && PARTICLES[piece.text]) {
      units.push({ kana: piece.text, romaji: PARTICLES[piece.text] })
      continue
    }

    const suffix = piece.form ? SUFFIX_UNITS.get(piece.form) : undefined
    if (suffix) {
      // La raíz SÍ se tokeniza, y es seguro: no es una palabra —あい es la raíz de あう—,
      // y las lecturas excepcionales son de palabra entera, como では、また.
      const stem = piece.text.slice(0, piece.text.length - piece.form.length)
      if (stem) units.push(...tokenizeWord(stem))
      // Copiados: los de la tabla no salen de ella, que los lee todo el proyecto.
      units.push(...suffix.map((unit) => ({ kana: unit.kana, romaji: unit.romaji })))
      continue
    }

    // `tokenizeWord` y no `tokenize`: una PALABRA puede llevar dentro una は que se lee
    // «wa» —では、また—, y esas excepciones son por palabra entera.
    units.push(...tokenizeWord(piece.text))
  }
  return units
}
