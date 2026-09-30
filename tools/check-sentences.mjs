// Segmenta las frases del documento contra el vocabulario de su bloque y los anteriores.
// Una frase que no se deja segmentar es un error de contenido: le falta una palabra, o
// usa un kana que todavía no toca.
//
//   node tools/check-sentences.mjs
import fs from 'fs'
import { segment, sentenceUnits, ambiguities, PARTICLES } from './segment.mjs'
import { reading } from './romaji.mjs'

const DOC = 'docs/FASE1_DEFINITIVO.md'
const doc = fs.readFileSync(DOC, 'utf8')

// El vocabulario, con su bloque, y las frases, con el suyo.
const words = []
const sentences = []
let block = null
let mode = null
for (const line of doc.split(/\r?\n/)) {
  const heading = line.match(/^### B(\d+)/)
  if (heading) { block = +heading[1]; continue }
  if (line.startsWith('```csv')) { mode = 'csv'; continue }
  if (line.startsWith('```text')) { mode = 'text'; continue }
  if (line.startsWith('```')) { mode = null; continue }
  if (!block) continue
  if (mode === 'csv' && line.includes('|') && !line.startsWith('id|')) {
    const c = line.split('|')
    if (c.length < 9) continue
    words.push({
      id: c[0],
      text: c[1].split('/')[0].replace(/[（）～〜・]/g, '').trim(),
      type: c[5], verbGroup: c[6], masuStem: c[7], block,
    })
  }
  if (mode === 'text' && line.trim()) sentences.push({ text: line.trim(), block })
}

// ある, する y くる no derivan su raíz de ～ない por regla.
const NAI_STEM = { aru: '', 'aru-2': '', suru: 'し', kuru: 'こ' }
for (const w of words) if (w.id in NAI_STEM) w.naiStem = NAI_STEM[w.id]

console.log(`palabras: ${words.length} · frases: ${sentences.length}`)

const failures = []
const particleUse = new Map()
const ambiguous = []
let segmented = 0

for (const s of sentences) {
  const available = words.filter((w) => w.block <= s.block)
  const pieces = segment(s.text, available)
  if (!pieces) { failures.push(s); continue }
  segmented++
  const dubious = ambiguities(pieces, available)
  if (dubious.length) ambiguous.push({ ...s, dubious, pieces })
  for (const p of pieces) {
    if (p.particle && PARTICLES[p.text]) {
      if (!particleUse.has(p.text)) particleUse.set(p.text, [])
      particleUse.get(p.text).push(s.text)
    }
  }
}

console.log(`segmentadas: ${segmented} · sin segmentar: ${failures.length}`)

console.log('\n── partículas que cambian de lectura ──')
for (const [p, list] of particleUse) {
  console.log(`  ${p} = ${PARTICLES[p]}  en ${list.length}: ${list.slice(0, 4).join(' ')}${list.length > 4 ? ' …' : ''}`)
}
if (!particleUse.size) console.log('  ninguna')

if (failures.length) {
  console.log('\n── SIN SEGMENTAR ──')
  for (const f of failures) console.log(`  b${f.block}  ${f.text}`)
}

// Solo importan de verdad las que CAMBIAN la lectura: は, を y へ suenan distinto de
// partícula. Con が, に o か la elección solo decide si cuenta como palabra usada.
const critical = ambiguous.filter((a) => a.dubious.some((d) => PARTICLES[d]))
const benign = ambiguous.filter((a) => !a.dubious.some((d) => PARTICLES[d]))

if (critical.length) {
  console.log('\n── AMBIGUAS QUE CAMBIAN LA LECTURA (revisar una a una) ──')
  for (const a of critical) {
    console.log(`  b${a.block}  ${a.text.padEnd(20)} ${a.pieces.map((p) => p.text).join(' | ')}`)
  }
}
if (benign.length) {
  console.log(`\n── ambiguas que NO cambian la lectura (${benign.length}): ${[...new Set(benign.flatMap((a) => a.dubious))].join(' ')} ──`)
}

// Las partículas que el temario enseña y ninguna frase usa: su lección se quedaría sin
// ejemplo que enseñar.
const unused = Object.keys(PARTICLES).filter((p) => !particleUse.has(p))
if (unused.length) console.log(`\nsin una sola frase que las use de partícula: ${unused.join(' ')}`)

// Una muestra, para ver que los units salen como deben.
console.log('\n── muestra ──')
for (const s of sentences.filter((x) => /[はへを]/.test(x.text)).slice(0, 6)) {
  const pieces = segment(s.text, words.filter((w) => w.block <= s.block))
  if (!pieces) continue
  const units = sentenceUnits(pieces)
  console.log(`  ${s.text.padEnd(18)} ${pieces.map((p) => p.text).join(' | ').padEnd(30)} ${reading(units)}`)
}
