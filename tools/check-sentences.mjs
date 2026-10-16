// Segmenta las frases del documento contra el vocabulario de su bloque y los anteriores.
// Una frase que no se deja segmentar es un error de contenido: le falta una palabra, o
// usa un kana que todavía no toca.
//
//   node tools/check-sentences.mjs
import { readDocument, allWords } from './doc.mjs'
import { segment, sentenceUnits, ambiguities, PARTICLES } from './segment.mjs'
import { reading, normalise } from './romaji.mjs'
import { FORM_BY_SUFFIX, chainPosition } from './conjugate.mjs'

const blocks = readDocument()
const words = allWords(blocks)
const sentences = blocks.flatMap((b) => b.sentences.map((s) => ({ ...s, block: b.number })))

// La は ha vuelto por TRES rutas distintas, y siempre por la misma razón: alguien deduce
// cómo se lee a partir del texto en vez de leerlo donde está declarado. Primero el
// vocabulario, luego `sentenceUnits` tokenizando pieza a pieza —では、また se leía
// «dehamata»—, y la tercera dentro de un SUFIJO: ではありません salía «dehaarimasen», así
// que el generador rechazaba toda frase con la cópula negativa y no se pudo escribir
// ninguna en los dieciocho tomos.
//
// Los cuatro casos cubren las cuatro procedencias de una lectura. Si alguien vuelve a
// deducirla, aquí se ve.
function checkHa() {
  const cases = [
    // Dentro de la palabra, y suena «wa».
    { pieces: [{ text: 'では、また' }], want: 'dewamata' },
    // Dentro de la palabra, y suena «ha»: la excepción es por palabra, no por kana.
    { pieces: [{ text: 'はし' }], want: 'hashi' },
    // Suelta entre dos palabras: partícula, y suena «wa».
    { pieces: [{ text: 'かさ' }, { text: 'は', particle: true }, { text: 'あります' }], want: 'kasawaarimasu' },
    // Dentro de un sufijo de la tabla, y suena «wa». La raíz es la palabra, el sufijo lo
    // compone `conjugations.ts`.
    {
      pieces: [{ text: 'いえではありません', wordId: 'ie-2', form: 'ではありません' }],
      want: 'iedewaarimasen',
    },
  ]

  const bad = cases.filter((c) => reading(sentenceUnits(c.pieces)) !== c.want)
  for (const c of bad) {
    const got = reading(sentenceUnits(c.pieces))
    console.log(`  は FALLA ${c.pieces.map((p) => p.text).join('')}: esperado ${c.want}, sale ${got}`)
  }
  console.log(bad.length ? `は: ${bad.length} fallos` : 'は: las cuatro lecturas de prueba cuadran (de dentro, de palabra, de partícula y de sufijo)')
}

console.log(`palabras: ${words.length} · frases: ${sentences.length}`)
checkHa()

const failures = []
const badRomaji = []
const ambiguous = []
const particleUse = new Map()
const tooEarly = []

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

  // Una frase no puede usar una forma que su bloque todavía no enseña: se leería con un
  // sufijo que nadie ha explicado. Es el mismo criterio que el de los distractores —
  // reconocer, nunca adivinar.
  for (const p of pieces) {
    const form = p.form && FORM_BY_SUFFIX.get(p.form)
    if (form && chainPosition(form.bloqueMin) > chainPosition('b' + s.block)) {
      tooEarly.push(`  b${s.block}  ${s.text.padEnd(20)} usa ${form.id} (${form.nombre}), que no llega hasta ${form.bloqueMin}`)
    }
  }

  for (const p of pieces) {
    if (!p.particle || !PARTICLES[p.text]) continue
    if (!particleUse.has(p.text)) particleUse.set(p.text, [])
    particleUse.get(p.text).push(s.text)
  }
}

console.log(`segmentadas: ${sentences.length - failures.length} · sin segmentar: ${failures.length}`)
console.log(`rōmaji que no coincide: ${badRomaji.length}`)
for (const b of badRomaji) console.log('  ' + b)

console.log(tooEarly.length ? `
── FORMAS USADAS ANTES DE ENSEÑARSE (${tooEarly.length}) ──` : 'formas usadas antes de enseñarse: ninguna')
for (const line of tooEarly) console.log(line)

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
