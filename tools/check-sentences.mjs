// Segmenta las frases del documento contra el vocabulario de su bloque y los anteriores.
// Una frase que no se deja segmentar es un error de contenido: le falta una palabra, o
// usa un kana que todavía no toca.
//
//   node tools/check-sentences.mjs
import { readDocument, allWords } from './doc.mjs'
import { segment, sentenceUnits, ambiguities, PARTICLES } from './segment.mjs'
import { reading, normalise } from './romaji.mjs'

const blocks = readDocument()
const words = allWords(blocks)
const sentences = blocks.flatMap((b) => b.sentences.map((s) => ({ ...s, block: b.number })))

console.log(`palabras: ${words.length} · frases: ${sentences.length}`)

const failures = []
const badRomaji = []
const ambiguous = []
const particleUse = new Map()

for (const s of sentences) {
  const available = words.filter((w) => w.blockNumber <= s.block)
  const pieces = segment(s.text, available)
  if (!pieces) { failures.push(s); continue }

  const units = sentenceUnits(pieces)
  if (normalise(reading(units)) !== normalise(s.romaji.replace(/[.,、。]/g, ''))) {
    badRomaji.push(`b${s.block}  ${s.text}  doc="${s.romaji}"  generado="${reading(units)}"`)
  }

  const dubious = ambiguities(pieces, available)
  if (dubious.length) ambiguous.push({ ...s, dubious, pieces })

  for (const p of pieces) {
    if (!p.particle || !PARTICLES[p.text]) continue
    if (!particleUse.has(p.text)) particleUse.set(p.text, [])
    particleUse.get(p.text).push(s.text)
  }
}

console.log(`segmentadas: ${sentences.length - failures.length} · sin segmentar: ${failures.length}`)
console.log(`rōmaji que no coincide: ${badRomaji.length}`)
for (const b of badRomaji) console.log('  ' + b)

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
console.log(`\nsin una sola frase que las use de partícula: ${unused.join(' ') || 'ninguna'}`)
