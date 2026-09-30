// Genera `src/content/hiragana/vocabulary.ts` a partir del CSV del documento del temario.
//
//   node tools/build-vocabulary.mjs
//
// El documento es la fuente: escribir a mano el desglose kana a kana de setecientas
// palabras no es viable, y a la tercera corrección el .ts y el .md ya no coincidirían.
// La media NO sale de aquí —es ilustración y grabación— y vive en `vocabularyMedia.ts`,
// que este script no toca.
//
// Nada se da por bueno sin comprobarlo: el rōmaji de los units concatenado tiene que
// reproducir el campo `romaji` de su fila. Si una sola falla, no se escribe nada.
import fs from 'fs'
import { tokenizeWord, reading, normalise } from './romaji.mjs'
import { naiStemFor } from './doc.mjs'

const DOC = 'docs/FASE1_DEFINITIVO.md'
const OUT = 'src/content/hiragana/vocabulary.ts'

function csvRows(markdown) {
  const rows = []
  let block = null
  let inCsv = false
  for (const line of markdown.split(/\r?\n/)) {
    const heading = line.match(/^### B(\d+)/)
    if (heading) { block = 'b' + heading[1]; continue }
    if (line.startsWith('```csv')) { inCsv = true; continue }
    if (line.startsWith('```')) { inCsv = false; continue }
    if (!inCsv || !block || !line.includes('|') || line.startsWith('id|')) continue
    const c = line.split('|')
    if (c.length < 9) continue
    rows.push({
      id: c[0], kana: c[1], kanji: c[2], romaji: c[3], meaning: c[4],
      type: c[5], verbGroup: c[6], masuStem: c[7], block: c[8],
    })
  }
  return rows
}

// Cómo se ESCRIBE la palabra. Se queda con la primera de las lecturas alternativas —el
// id recuerda las dos—, deja el verbo entero donde el documento marca する entre
// paréntesis, y quita la notación (～ de sufijo, ・ de separación) pero NO la coma, que
// es ortografía de verdad: では、また lleva pausa.
function writtenForm(kana) {
  return kana
    .split('/')[0]
    .replace(/[（）]/g, '')
    .replace(/[～〜・]/g, '')
    .trim()
}

const rows = csvRows(fs.readFileSync(DOC, 'utf8'))
const words = []
const failures = []

for (const row of rows) {
  const text = writtenForm(row.kana)
  const units = tokenizeWord(text)
  // La barra del rōmaji significa dos cosas según lo que tenga el kana: lecturas
  // alternativas si el kana también la lleva —いい/よい—, y las dos mitades de una sola
  // palabra si el kana usa ・ —すぐ・に es «suguni», no «sugu»—.
  const want = normalise(row.kana.includes('/') ? row.romaji.split('/')[0] : row.romaji)
  const got = normalise(reading(units))
  if (got !== want) { failures.push({ ...row, text, got, want }); continue }

  const word = { id: row.id, units, meaning: row.meaning, type: row.type }
  // Solo cuando lo escrito no es la suma de los units, o sea cuando hay un signo que se
  // escribe y no se lee.
  const spelled = units.map((u) => u.kana).join('')
  if (text !== spelled) word.text = text
  if (row.kanji) word.kanji = row.kanji
  if (row.verbGroup) word.verbGroup = row.verbGroup
  if (row.masuStem) word.masuStem = row.masuStem
  // La de ～ない solo cuando no sale de las tablas. Ojo: la de ある es la cadena VACÍA
  // —ある → ない pierde la raíz entera—, que no es lo mismo que no tenerla.
  const naiStem = naiStemFor({ ...row, text })
  if (naiStem !== undefined) word.naiStem = naiStem
  words.push(word)
}

if (failures.length) {
  console.error(`${failures.length} filas no cuadran; no se escribe nada:`)
  for (const f of failures) console.error(`  ${f.id} ${f.kana} doc="${f.romaji}" generado="${f.got}"`)
  process.exit(1)
}

const quote = (s) => `'${s.replace(/\\/g, '\\\\').replace(/'/g, "\\'")}'`

function render(word) {
  const lines = [`    id: ${quote(word.id)},`]
  const units = word.units.map((u) => `{ kana: ${quote(u.kana)}, romaji: ${quote(u.romaji)} }`)
  const oneLine = `    units: [${units.join(', ')}],`
  lines.push(oneLine.length <= 100 ? oneLine : `    units: [\n${units.map((u) => `      ${u},`).join('\n')}\n    ],`)
  if (word.text) lines.push(`    text: ${quote(word.text)},`)
  lines.push(`    meaning: ${quote(word.meaning)},`)
  lines.push(`    type: ${quote(word.type)},`)
  if (word.kanji) lines.push(`    kanji: ${quote(word.kanji)},`)
  if (word.verbGroup) lines.push(`    verbGroup: ${quote(word.verbGroup)},`)
  if (word.masuStem) lines.push(`    masuStem: ${quote(word.masuStem)},`)
  if ('naiStem' in word) lines.push(`    naiStem: ${quote(word.naiStem)},`)
  return `  {\n${lines.join('\n')}\n  },`
}

const file = `// El vocabulario de la Fase 1: ${words.length} palabras, las del documento del temario.
//
// GENERADO — no se edita a mano: \`node tools/build-vocabulary.mjs\` lo reescribe entero
// desde \`${DOC}\`, que es donde se corrige una palabra. Los units salen de ahí
// comprobados: su rōmaji concatenado reproduce el de cada fila.
//
// La media va aparte, en \`vocabularyMedia.ts\`, y este archivo no la conoce: regenerar
// el temario no puede llevarse por delante los dibujos ni las grabaciones.
import type { Word } from '../types'
import { withMedia } from './vocabularyMedia'

export const VOCABULARY: Word[] = withMedia([
${words.map(render).join('\n')}
])

export const VOCABULARY_BY_ID = new Map(VOCABULARY.map((word) => [word.id, word]))
`

fs.writeFileSync(OUT, file)
console.log(`${words.length} palabras escritas en ${OUT}`)
