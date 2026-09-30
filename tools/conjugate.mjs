// El generador de formas conjugadas.
//
// Un verbo es UNA fila del temario: します y しました no se escriben en ninguna parte, se
// derivan aquí pegando un sufijo a su raíz. Los sufijos salen de `content/conjugations.ts`,
// que es la única lista que hay — ni este archivo ni el segmentador guardan la suya.
//
//   node tools/conjugate.mjs           el recuento de todo lo que sale del pool
//   node tools/conjugate.mjs およぐ     las formas de una palabra, escritas
import { CONJUGATIONS, KANA_ROW_BY_U, stemKind } from '../src/content/conjugations.ts'
import { tokenize, tokenizeWord, reading } from './romaji.mjs'
import { readDocument, allWords } from './doc.mjs'

const kanaOf = (units) => units.map((unit) => unit.kana).join('')

// Los units de la raíz de ～ます. Se derivan de la REGLA del grupo, no de la raíz escrita,
// y después se comprueban contra ella: así una raíz mal copiada en el documento sale como
// descuadre en vez de colarse en todas sus formas.
function masuStemUnits(word, units) {
  if (word.verbGroup === 'ichidan') return units.slice(0, -1)
  if (word.verbGroup === 'godan') {
    const row = KANA_ROW_BY_U.get(units.at(-1)?.kana)
    return row ? [...units.slice(0, -1), row.i] : null
  }
  // Un irregular no sale de ninguna tabla: する da し y くる da き. Su raíz viene escrita.
  return word.masuStem === undefined ? null : tokenize(word.masuStem)
}

// La raíz de かったです: la palabra sin su い final. おいしい → おいし.
function iStemUnits(word, units) {
  return units.at(-1)?.kana === 'い' ? units.slice(0, -1) : null
}

// La de ～ない. Un godan la saca de su fila «a» —ojo con う → わ, que no es あ— y un
// ichidan de quitarle る. Los que no salen de ahí la traen escrita, y los que no la traen
// ni salen de la regla no generan la forma: ver `naiStem` en `content/types.ts`.
function naiStemUnits(word, units) {
  if (word.naiStem !== undefined) return tokenize(word.naiStem)
  if (word.verbGroup === 'ichidan') return units.slice(0, -1)
  if (word.verbGroup === 'godan') {
    const row = KANA_ROW_BY_U.get(units.at(-1)?.kana)
    return row ? [...units.slice(0, -1), row.a] : null
  }
  return null
}

// Una forma de una palabra, o null si esa palabra no la tiene. El `why` de los nulos sale
// por `explain`, que es lo que mira el informe.
export function conjugate(word, form) {
  const units = tokenizeWord(word.text)

  if (!form.aplicaA.includes(word.type)) return null

  const kind = stemKind(form)
  const base = kind === 'palabra' ? units
    : kind === 'nai' ? naiStemUnits(word, units)
      : kind === 'i' ? iStemUnits(word, units)
        : masuStemUnits(word, units)
  if (!base) return null

  const all = [...base, ...form.suffixUnits]
  return {
    id: `${word.id}:${form.id}`,
    wordId: word.id,
    formId: form.id,
    nombre: form.nombre,
    bloqueMin: form.bloqueMin,
    text: kanaOf(all),
    romaji: reading(all),
    units: all,
  }
}

// Todas las formas de una palabra, en el orden en que se enseñan.
export function formsOf(word) {
  return CONJUGATIONS.map((form) => conjugate(word, form)).filter(Boolean)
}

// Por qué una palabra no da una forma. Solo para el informe: distinguir «no le toca» de
// «no se puede derivar» es lo que separa un temario correcto de un fallo silencioso.
export function explain(word, form) {
  if (!form.aplicaA.includes(word.type)) return null
  const kind = stemKind(form)
  if (kind === 'palabra') return null

  const units = tokenizeWord(word.text)
  if (kind === 'nai') {
    return naiStemUnits(word, units) ? null : 'sin raíz de ～ない: ni sale de la tabla ni está escrita'
  }
  if (kind === 'i') {
    return iStemUnits(word, units) ? null : 'sin raíz de かったです: la palabra no acaba en い'
  }
  return masuStemUnits(word, units) ? null : 'sin raíz de ～ます: el último kana no está en las nueve filas'
}

if (import.meta.url === `file:///${process.argv[1].replace(/\\/g, '/')}`) {
  const words = allWords(readDocument())
  const [query] = process.argv.slice(2)

  if (query) {
    const word = words.find((w) => w.text === query || w.id === query)
    if (!word) { console.error(`no está en el pool: ${query}`); process.exit(1) }
    console.log(`${word.text}  ${word.romaji}  «${word.meaning}»  ${word.type}${word.verbGroup ? ' · ' + word.verbGroup : ''}`)
    for (const f of formsOf(word)) {
      console.log(`  ${f.formId.padEnd(16)} ${f.text.padEnd(16)} ${f.romaji.padEnd(24)} desde ${f.bloqueMin}`)
    }
    process.exit(0)
  }

  // La raíz escrita en el documento contra la que sale de la regla. Solo puede fallar en
  // un godan o un ichidan: la del irregular ES la escrita.
  const badStems = []
  for (const word of words) {
    if (word.verbGroup !== 'godan' && word.verbGroup !== 'ichidan') continue
    const derived = masuStemUnits(word, tokenizeWord(word.text))
    if (derived && kanaOf(derived) !== word.masuStem) {
      badStems.push(`  ${word.id.padEnd(20)} ${word.text.padEnd(10)} documento="${word.masuStem}"  regla="${kanaOf(derived)}"`)
    }
  }
  console.log(badStems.length ? `raíces que no cuadran con la regla: ${badStems.length}` : 'raíces: las derivadas coinciden con las del documento')
  for (const line of badStems) console.log(line)

  const generated = words.flatMap(formsOf)
  console.log(`\npalabras: ${words.length} · formas generadas: ${generated.length}`)

  console.log('\n── por forma ──')
  for (const form of CONJUGATIONS) {
    const mine = generated.filter((g) => g.formId === form.id)
    console.log(`  ${form.id.padEnd(16)} ${String(mine.length).padStart(4)}  desde ${form.bloqueMin.padEnd(4)} ej. ${mine[0]?.text ?? '—'}`)
  }

  const blocked = []
  for (const word of words) {
    for (const form of CONJUGATIONS) {
      const why = explain(word, form)
      if (why) blocked.push(`  ${word.id.padEnd(20)} ${form.id.padEnd(16)} ${why}`)
    }
  }
  console.log(blocked.length ? `\n── sin poder derivarse (${blocked.length}) ──` : '\nsin poder derivarse: ninguna')
  for (const line of blocked) console.log(line)
}
