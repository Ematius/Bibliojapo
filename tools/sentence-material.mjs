// El material para escribir frases de un bloque: qué kana, qué palabras y qué formas
// conjugadas están disponibles a esa altura del recorrido.
//
//   node tools/sentence-material.mjs b5            escribe docs/material-frases/b5.csv
//   node tools/sentence-material.mjs b5 b6 b10     varios de una vez
//   node tools/sentence-material.mjs b5 --resumen  solo lo corto, por consola
//
// Lo DERIVA de `content/`, así que se vuelve a lanzar cada vez que cambia el temario. Su
// salida no se versiona —ver `.gitignore`—: una copia commiteada se queda vieja sin avisar
// y alguien escribiría una frase contra vocabulario que ya se movió.
//
// Carga los módulos con Vite y no con Node a secas porque `content/` importa sin
// extensión (`from './blocks'`), que Node no resuelve. Es lo mismo que hace
// `scripts/seed-content.mjs`.
import { mkdirSync, writeFileSync } from 'node:fs'
import { createServer } from 'vite'

const OUT = 'docs/material-frases'
// Cuántas entrega el resumen de cada clase. Lo más corto primero es lo pedagógicamente
// correcto: arrastra menos kana, la misma regla con la que se reparten las palabras por
// lección.
const SHORTLIST = 15

const args = process.argv.slice(2)
const summary = args.includes('--resumen')
const targets = args.filter((a) => !a.startsWith('--'))

if (!targets.length) {
  console.error('Uso: node tools/sentence-material.mjs <bloque> [...] [--resumen]')
  process.exit(1)
}

const vite = await createServer({
  server: { middlewareMode: true },
  appType: 'custom',
  logLevel: 'warn',
})
const { LESSON_SOURCE } = await vite.ssrLoadModule('/src/content/lessonSource.ts')
const { AISLE_CONTENT } = await vite.ssrLoadModule('/src/content/aisleContent.ts')
const { CONJUGATIONS } = await vite.ssrLoadModule('/src/content/conjugations.ts')

const source = await LESSON_SOURCE.hiragana()
const PLAN = AISLE_CONTENT.hiragana.blockPlan
// El puesto en la CADENA, nunca el id como texto: 'b10' va detrás de 'b3' en el recorrido
// y delante alfabéticamente.
const position = (id) => PLAN.indexOf(id)

const VERB_TYPES = new Set(['verbo-u', 'verbo-ru', 'verbo-irregular'])
const kanaOf = (word) => word.text ?? (word.units ?? []).map((u) => u.kana).join('')
const romajiOf = (word) => (word.units ?? []).map((u) => u.romaji).join('')
const length = (word) => (word.units ?? []).length

const csv = (value) => {
  const text = String(value ?? '')
  return /[",\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text
}

// Lo disponible a la altura de un bloque: su propio contenido y el de todos los
// anteriores. El lector solo recibe SU tomo, así que esto es lo único que ve la cadena
// entera.
function availableAt(target) {
  const kana = []
  const dakuten = []
  const words = []
  const seen = new Set()

  for (const id of PLAN.slice(0, position(target) + 1)) {
    const block = source.blocksById.get(id)
    if (!block) continue

    for (const lesson of block.lessons) {
      if (lesson.type !== 'kana' || !lesson.kanaId) continue
      const entry = source.kanaById.get(lesson.kanaId)
      if (entry) kana.push({ ...entry, block: id })
    }
    for (const mark of block.dakuten ?? []) dakuten.push({ character: mark, block: id })
    for (const wordId of block.wordIds ?? []) {
      if (seen.has(wordId)) continue
      const word = source.wordsById.get(wordId)
      if (!word) continue
      seen.add(wordId)
      words.push({ ...word, block: id })
    }
  }

  const forms = CONJUGATIONS.filter((form) => position(form.bloqueMin) <= position(target))
  return { kana, dakuten, words, forms }
}

function writeCsv(target, { kana, dakuten, words, forms }) {
  const lines = [
    `# MATERIAL PARA ESCRIBIR FRASES · ${target.toUpperCase()}`,
    '# Derivado de src/content/hiragana/ — se regenera con tools/sentence-material.mjs.',
    `# Disponible: ${kana.length} kana, ${dakuten.length} dakuten, ${words.length} palabras, ${forms.length} formas.`,
    '',
    '## KANA DISPONIBLES (base)',
    'caracter,romaji,bloque',
    ...kana.map((k) => [k.character, k.romaji, k.block].map(csv).join(',')),
    '',
    '## DAKUTEN DISPONIBLES',
    'caracter,bloque',
    ...dakuten.map((d) => [d.character, d.block].map(csv).join(',')),
    '',
    '## PALABRAS DISPONIBLES',
    'id,kana,romaji,significado,tipo,modo,grupo_verbal,raiz_masu,raiz_nai,bloque',
    ...words.map((w) =>
      [w.id, kanaOf(w), romajiOf(w), w.meaning, w.type, w.mode ?? '',
        w.verbGroup ?? '', w.masuStem ?? '', w.naiStem ?? '', w.block].map(csv).join(','),
    ),
    '',
    '## FORMAS CONJUGADAS DISPONIBLES',
    'id,nombre,patron,registro,aplica_a,desde',
    ...forms.map((f) =>
      [f.id, f.nombre, f.patron, f.registro, (f.aplicaA ?? []).join(' '), f.bloqueMin]
        .map(csv).join(','),
    ),
  ]

  mkdirSync(OUT, { recursive: true })
  const file = `${OUT}/${target}.csv`
  writeFileSync(file, lines.join('\n') + '\n', 'utf8')
  return file
}

function printSummary(target, { words, forms }) {
  // Los afijos quedan fuera: ～まい cuenta objetos planos y no existe suelto, así que no
  // puede ser el sujeto de una frase. Con ellos dentro, el resumen propondría palabras
  // imposibles de usar.
  const usable = words.filter((w) => w.mode !== 'afijo')
  const byLength = (a, b) => length(a) - length(b) || a.id.localeCompare(b.id)
  const show = (word, extra = false) =>
    `  ${kanaOf(word).padEnd(8)} ${word.id.padEnd(14)} ${word.meaning}` +
    (extra
      ? `  [${word.verbGroup ?? '?'}, masu=${word.masuStem || '—'}, nai=${word.naiStem || '—'}]`
      : '')

  const nouns = usable.filter((w) => w.type === 'sustantivo').sort(byLength)
  const verbs = usable.filter((w) => VERB_TYPES.has(w.type)).sort(byLength)
  const naAdjectives = usable.filter((w) => w.type === 'adjetivo-na').sort(byLength)

  console.log(`\n═══ ${target.toUpperCase()} · ${usable.length} palabras usables de ${words.length} (fuera ${words.length - usable.length} afijos)`)
  console.log(`\nSUSTANTIVOS más cortos (${Math.min(SHORTLIST, nouns.length)} de ${nouns.length}):`)
  nouns.slice(0, SHORTLIST).forEach((w) => console.log(show(w)))
  console.log(`\nVERBOS más cortos (${Math.min(SHORTLIST, verbs.length)} de ${verbs.length}):`)
  verbs.slice(0, SHORTLIST).forEach((w) => console.log(show(w, true)))
  console.log(`\nADJETIVOS-NA (${naAdjectives.length}):`)
  if (!naAdjectives.length) console.log('  ninguno')
  naAdjectives.slice(0, SHORTLIST).forEach((w) => console.log(show(w)))
  console.log(`\nFORMAS disponibles (${forms.length}):`)
  forms.forEach((f) => console.log(`  ${f.id.padEnd(16)} ${f.patron.padEnd(28)} ${(f.aplicaA ?? []).join(' ')}  desde ${f.bloqueMin}`))
}

for (const target of targets) {
  if (position(target) < 0) {
    console.error(`${target}: no está en el plan del pasillo`)
    continue
  }
  const available = availableAt(target)
  if (summary) printSummary(target, available)
  else console.log(`${writeCsv(target, available)}  → ${available.kana.length} kana, ${available.words.length} palabras, ${available.forms.length} formas`)
}

await vite.close()
