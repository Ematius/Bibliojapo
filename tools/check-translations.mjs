// Comprueba un bloque de frases traducidas antes de meterlo en el documento: que cada
// frase use solo kana ya disponibles en su bloque, que se deje segmentar con el
// vocabulario de ese punto, y que su rōmaji coincida con el que generamos.
//
//   node tools/check-translations.mjs tools/translations.txt
import fs from 'fs'
import { segment, sentenceUnits } from './segment.mjs'
import { reading, normalise } from './romaji.mjs'

const DOC = 'docs/FASE1_DEFINITIVO.md'
const src = process.argv[2] ?? 'tools/translations.txt'

const rows = fs.readFileSync(src, 'utf8').split(/\r?\n/)
  .filter((l) => l.includes('|'))
  .map((l) => {
    const c = l.split('|').map((s) => s.trim())
    return {
      block: +c[0].slice(1),
      text: c[1].replace(/^★\s*/, ''),
      isNew: c[1].startsWith('★'),
      romaji: c[2],
      meaning: c[3],
      particles: c[4],
    }
  })

console.log(`frases recibidas: ${rows.length} · marcadas como nuevas: ${rows.filter((r) => r.isNew).length}`)

const doc = fs.readFileSync(DOC, 'utf8')

// Lo que el documento tiene hoy, para saber qué se añade y qué se cae.
const docSentences = new Set()
const words = []
let block = null
let mode = null
for (const line of doc.split(/\r?\n/)) {
  const h = line.match(/^### B(\d+)/)
  if (h) { block = +h[1]; continue }
  if (line.startsWith('```csv')) { mode = 'csv'; continue }
  if (line.startsWith('```text')) { mode = 'text'; continue }
  if (line.startsWith('```')) { mode = null; continue }
  if (!block) continue
  if (mode === 'text' && line.trim()) docSentences.add(line.trim())
  if (mode === 'csv' && line.includes('|') && !line.startsWith('id|')) {
    const c = line.split('|')
    if (c.length < 9) continue
    words.push({
      id: c[0], text: c[1].split('/')[0].replace(/[（）～〜・]/g, '').trim(),
      type: c[5], verbGroup: c[6], masuStem: c[7], block,
    })
  }
}
const NAI = { aru: '', 'aru-2': '', suru: 'し', kuru: 'こ' }
for (const w of words) if (w.id in NAI) w.naiStem = NAI[w.id]

const received = new Set(rows.map((r) => r.text))
const added = rows.filter((r) => !docSentences.has(r.text))
const dropped = [...docSentences].filter((t) => !received.has(t))
console.log(`en el documento: ${docSentences.size} · se añaden: ${added.length} · desaparecen: ${dropped.length}`)
if (dropped.length) console.log('  DESAPARECEN: ' + dropped.join('  '))

// Los kana disponibles en cada punto del recorrido, incluidos los dakuten inline.
const plan = fs.readFileSync('src/content/hiragana/blockPlanKana.ts', 'utf8')
function readMap(name) {
  const from = plan.indexOf(`export const ${name}`)
  const slice = plan.slice(from, plan.indexOf('} satisfies', from))
  const out = {}
  for (const line of slice.split(/\r?\n/)) {
    const m = line.match(/^\s*b(\d+): \[(.*)\],/)
    if (m) out[+m[1]] = [...m[2].matchAll(/'(.)'/g)].map((x) => x[1])
  }
  return out
}
const kanaPlan = readMap('BLOCK_PLAN_KANA')
const dakutenPlan = readMap('BLOCK_PLAN_DAKUTEN')

const unknownKana = []
const unsegmented = []
const badRomaji = []

for (const r of rows) {
  const available = new Set()
  for (let b = 1; b <= r.block; b++) {
    for (const c of kanaPlan[b] ?? []) available.add(c)
    for (const c of dakutenPlan[b] ?? []) available.add(c)
  }
  const unknown = [...new Set([...r.text].filter((c) => /[ぁ-ゖー]/.test(c) && !available.has(c)))]
  if (unknown.length) unknownKana.push(`b${r.block}  ${r.text}  usa ${unknown.join(' ')}`)

  const pieces = segment(r.text, words.filter((w) => w.block <= r.block))
  if (!pieces) { unsegmented.push(`b${r.block}  ${r.text}`); continue }

  const got = reading(sentenceUnits(pieces))
  if (normalise(got) !== normalise(r.romaji.replace(/[.,、。]/g, ''))) {
    badRomaji.push(`b${r.block}  ${r.text.padEnd(22)} tuyo="${r.romaji}"  generado="${got}"`)
  }
}

const report = (title, list) => {
  console.log(`\n── ${title}: ${list.length} ──`)
  for (const l of list) console.log('  ' + l)
}
report('kana que aún no toca', unknownKana)
report('sin segmentar (falta vocabulario)', unsegmented)
report('rōmaji que no coincide', badRomaji)
