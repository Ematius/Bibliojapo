// Genera `src/content/hiragana/sentences.ts` desde el documento del temario.
//
//   node tools/build-sentences.mjs
//
// Los `units` y los `wordIds` no se escriben: salen de segmentar la frase contra el
// vocabulario disponible en su bloque, que es lo que deja las partículas identificadas
// sin tener que adivinar cuál es cuál. Si una frase no se deja segmentar no se escribe
// nada: será que le falta una palabra.
import fs from 'fs'
import { readDocument, allWords } from './doc.mjs'
import { segment, sentenceUnits, homographs } from './segment.mjs'
import { reading, normalise } from './romaji.mjs'

const OUT = 'src/content/hiragana/sentences.ts'

// La partícula declarada en el documento, a la regla que la explica. Solo las que tienen
// regla escrita: las demás se quedan sin `grammarId` hasta que alguien la escriba.
const RULE_OF = {
  は: 'topic-wa',
  へ: 'particle-e',
  を: 'particle-o',
  に: 'particle-ni',
  が: 'particle-ga',
  か: 'particle-ka',
  で: 'particle-de',
  と: 'particle-to',
  の: 'particle-no',
  も: 'particle-mo',
  ね: 'particle-ne',
}

const blocks = readDocument()
const words = allWords(blocks)

const sentences = []
const failures = []
const undeclared = []
const seen = new Map()

for (const block of blocks) {
  const available = words.filter((w) => w.blockNumber <= block.number)

  for (const s of block.sentences) {
    const pieces = segment(s.text, available, s.senses)
    if (!pieces) { failures.push({ ...s, block: block.id, why: 'no se deja segmentar' }); continue }

    // Qué palabra eligió el segmentador sin que nadie se lo dijera, habiendo otra que
    // se escribe igual. Se mide contra el vocabulario ENTERO: la otra acepción puede
    // llegar en un bloque posterior y el id ya quedaría escrito aquí.
    const blind = homographs(pieces, words, s.senses)
    if (blind.length) undeclared.push({ block: block.id, text: s.text, meaning: s.meaning, ids: blind })

    const units = sentenceUnits(pieces)
    const got = normalise(reading(units))
    const want = normalise(s.romaji.replace(/[.,、。]/g, ''))
    if (got !== want) { failures.push({ ...s, block: block.id, why: `rōmaji ${got} ≠ ${want}` }); continue }

    // El id, por las palabras de la frase: `kasa-wa-arimasen`. Se lee sin abrir el
    // temario, que es lo que hacían los ids escritos a mano.
    const base = pieces
      .filter((p) => !p.punctuation)
      .map((p) => reading(sentenceUnits([p])))
      .join('-')
    const repeat = seen.get(base) ?? 0
    seen.set(base, repeat + 1)

    sentences.push({
      id: repeat ? `${base}-${repeat + 1}` : base,
      text: s.text,
      meaning: s.meaning,
      units,
      // Las palabras que aparecen. No cubren la frase entera: una partícula no es una
      // palabra, y por eso salen de la segmentación y no de buscar a ojo.
      wordIds: [...new Set(pieces.filter((p) => p.wordId).map((p) => p.wordId))],
      grammarId: s.particles.map((p) => RULE_OF[p]).find(Boolean),
    })
  }
}

if (failures.length) {
  console.error(`${failures.length} frases no cuadran; no se escribe nada:`)
  for (const f of failures) console.error(`  ${f.block} ${f.text} — ${f.why}`)
  process.exit(1)
}

const q = (s) => `'${s.replace(/\\/g, '\\\\').replace(/'/g, "\\'")}'`

function render(s) {
  const units = s.units.map((u) => `{ kana: ${q(u.kana)}, romaji: ${q(u.romaji)} }`)
  const oneLine = `    units: [${units.join(', ')}],`
  return [
    '  {',
    `    id: ${q(s.id)},`,
    `    text: ${q(s.text)},`,
    `    meaning: ${q(s.meaning)},`,
    oneLine.length <= 100 ? oneLine : `    units: [\n${units.map((u) => `      ${u},`).join('\n')}\n    ],`,
    `    wordIds: [${s.wordIds.map(q).join(', ')}],`,
    ...(s.grammarId ? [`    grammarId: ${q(s.grammarId)},`] : []),
    '  },',
  ].join('\n')
}

const file = `// Las frases del temario: ${sentences.length}, las del documento.
//
// GENERADO — \`node tools/build-sentences.mjs\` lo reescribe desde el documento, que es
// donde se corrige una frase o su traducción.
//
// Los \`units\` y los \`wordIds\` salen de segmentar cada frase contra el vocabulario que
// el alumno ya tiene: así una は de partícula se lee «wa» y la de はい se lee «ha», sin
// que nadie tenga que decidirlo carácter a carácter.
//
// El audio va aparte, en sentenceMedia.ts, y este archivo no lo conoce: regenerar el
// temario no puede llevarse por delante las grabaciones.
import type { Sentence } from '../types'
import { withAudio } from './sentenceMedia'

export const SENTENCES: Sentence[] = withAudio([
${sentences.map(render).join('\n')}
])

export const SENTENCES_BY_ID = new Map(SENTENCES.map((sentence) => [sentence.id, sentence]))
`

fs.writeFileSync(OUT, file)
console.log(`${sentences.length} frases escritas en ${OUT}`)
console.log(`con regla de gramática: ${sentences.filter((s) => s.grammarId).length}`)

// Avisa DESPUÉS de escribir, y escribe igual: una frase sin declarar no está rota, solo
// elegida a ciegas, y dejar el temario sin ella sería peor que dejarla mal. Pero sale con
// error, porque un aviso que no rompe nada es un aviso que nadie lee.
if (undeclared.length) {
  console.error(`
${undeclared.length} frases usan una palabra escrita igual que otra, sin decir cuál:`)
  for (const u of undeclared) console.error(`  ${u.block} ${u.text} «${u.meaning}» → ${u.ids.join(', ')}`)
  console.error('Se declara en la quinta columna del documento, «acepcion».')
  process.exitCode = 1
}
