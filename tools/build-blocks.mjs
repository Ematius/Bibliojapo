// Genera `src/content/hiragana/blocks.ts` desde el documento del temario.
//
//   node tools/build-blocks.mjs
//
// Casi todo sale del documento: los kana de cada bloque, sus dakuten, su vocabulario y
// sus frases. Lo único que NO trae es con QUÉ palabra se enseña cada kana, así que eso
// se deriva con la regla de abajo y se revisa mirando el archivo.
import fs from 'fs'
import { readDocument, allWords, DOC } from './doc.mjs'
import { segment, sentenceUnits } from './segment.mjs'
import { reading } from './romaji.mjs'

const OUT = 'src/content/hiragana/blocks.ts'

// Un kana que no aparece dentro de NINGUNA palabra del temario no puede tener lección de
// vocabulario: no hay con qué enseñarlo. を es así por naturaleza —solo existe como
// partícula—, y su plana es la de su regla. Ver la nota de ぺ en el documento.
const TAUGHT_BY_RULE = { wo: 'particle-o' }

// Las reglas de gramatica que estrena cada bloque. Van DETRAS de sus lecciones de kana:
// primero los caracteres, despues lo que se construye con ellos.
const RULES_BY_BLOCK = {
  b2: ['desu', 'masu'],
  b5: ['pasado'],
  b6: ['tai'],
  b13: ['nai'],
  b18: ['masho'],
}

// La del dakuten no se explica UNA vez: reaparece en cada bloque que estrene alguno, con
// los de ese tomo. Y va DELANTE de las lecciones, no detras: en B2 la primera palabra que
// se lee es です, y sin el dakuten explicado su で es un caracter que nadie ha enseñado.
const DAKUTEN_RULE = 'dakuten'

// La portada de un tomo lleva dos cosas escritas a mano; las cuentas se derivan solas.
// De momento solo B1 las tiene, porque es el único tomo que se lee entero.
const COVER = {
  b1: {
    title: 'Bloque 1 · Las vocales y は',
    summary:
      'Cinco vocales y un kana más. Son pocos, pero con ellos ya se escriben ' +
      'frases enteras: por eso は se adelanta a su sitio en la tabla tradicional.',
  },
}

// B1 NO SE TOCA: es el tomo gratuito, está publicado y sus seis lecciones tienen sus
// dibujos y sus audios hechos. Su emparejamiento se conserva tal cual, con los tres ids
// que el temario renombró —`ii`→`ii-yoi`, y la casa y el dibujo, que pasaron a `-2`—.
const B1_LESSONS = {
  a: ['aoi', 'au'],
  i: ['ie-2', 'ii-yoi'],
  u: ['ue', 'iu'],
  e: ['iie', 'ie-2'],
  o: ['ooi', 'ao'],
  ha: ['haha', 'hai'],
}

// Cuántas palabras lleva una lección. Dos es lo que hay en B1: la primera lleva el grueso
// y la segunda demuestra que se reconoce el carácter en otra palabra.
const WORDS_PER_LESSON = 2

// El id del kana, por su carácter, leído de `kana.ts`: es el que guardan los sellos.
function kanaIds() {
  const src = fs.readFileSync('src/content/hiragana/kana.ts', 'utf8')
  return new Map([...src.matchAll(/id: '([^']+)',\s*\n\s*character: '([^']+)'/g)].map((m) => [m[2], m[1]]))
}

// Las palabras que tienen dibujo o audio: se prefieren para enseñar, porque una lección
// sin ellos no llega a entrar en el tomo.
function producedIds() {
  const src = fs.readFileSync('src/content/hiragana/vocabularyMedia.ts', 'utf8')
  return new Set([...src.matchAll(/^ {2}'([a-z0-9-]+)': \{/gm)].map((m) => m[1]))
}

// LA REGLA: se enseña un kana con palabras de SU bloque que lo contengan. Entre varias,
// primero la que ya tiene dibujo y audio, y luego la más corta — cuantos menos kana
// desconocidos arrastre, mejor. Es un punto de partida derivado, no una decisión del
// temario: para cambiar una pareja, se cambia aquí y se regenera.
function pickWords(kana, words, produced, taken) {
  const holds = words.filter((w) => w.text.includes(kana))
  const score = (w) =>
    (produced.has(w.id) ? -100 : 0) + (taken.has(w.id) ? 50 : 0) + w.text.length
  return holds.sort((a, b) => score(a) - score(b)).slice(0, WORDS_PER_LESSON).map((w) => w.id)
}

const doc = readDocument()
const idOf = kanaIds()
const produced = producedIds()
const words = allWords(doc)

// El id de una frase, por sus palabras: `kasa-wa-arimasen`. Es el mismo que calcula
// `build-sentences.mjs`, y tiene que seguir siéndolo: si los dos dejaran de coincidir,
// los bloques pedirían frases que no existen.
const seenIds = new Map()
function sentenceId(text, block) {
  const pieces = segment(text, words.filter((w) => w.blockNumber <= block))
  const base = pieces
    ? pieces.filter((p) => !p.punctuation).map((p) => reading(sentenceUnits([p]))).join('-')
    : ''
  const count = seenIds.get(base) ?? 0
  seenIds.set(base, count + 1)
  return count ? `${base}-${count + 1}` : base
}

const rendered = []
const warnings = []

for (const block of doc) {
  const n = +block.id.slice(1)
  const taken = new Set()
  const lessons = []

  if (block.dakuten.length) lessons.push({ type: 'grammar', grammarId: DAKUTEN_RULE })

  for (const ch of block.kana) {
    const kanaId = idOf.get(ch)
    if (!kanaId) { warnings.push(`${block.id}: ${ch} no tiene ficha en kana.ts`); continue }

    // El que solo existe como partícula se enseña con su regla, no con vocabulario.
    if (TAUGHT_BY_RULE[kanaId]) {
      lessons.push({ type: 'grammar', grammarId: TAUGHT_BY_RULE[kanaId] })
      continue
    }

    const wordIds = block.id === 'b1'
      ? B1_LESSONS[kanaId]
      : pickWords(ch, block.words, produced, taken)
    wordIds?.forEach((id) => taken.add(id))
    if (!wordIds?.length) warnings.push(`${block.id}: ${ch} (${kanaId}) sin palabra que lo contenga`)
    lessons.push({ type: 'kana', kanaId, wordIds: wordIds ?? [] })
  }

  for (const id of RULES_BY_BLOCK[block.id] ?? []) lessons.push({ type: 'grammar', grammarId: id })

  const sentenceIds = block.sentences.map((s) => sentenceId(s.text, n))
  rendered.push({ ...block, lessons, sentenceIds, wordIds: block.words.map((w) => w.id) })
}

const q = (s) => `'${s.replace(/\\/g, '\\\\').replace(/'/g, "\\'")}'`
const list = (items, indent) =>
  items.length
    ? `[\n${items.map((i) => `${indent}  ${q(i)},`).join('\n')}\n${indent}]`
    : '[]'

const body = rendered.map((b) => {
  const lessons = b.lessons
    .map((l) => l.type === 'grammar'
      ? `      { type: 'grammar', grammarId: ${q(l.grammarId)} },`
      : `      { type: 'kana', kanaId: ${q(l.kanaId)}, wordIds: [${l.wordIds.map(q).join(', ')}] },`)
    .join('\n')
  const cover = COVER[b.id] ?? {}
  return `  {
    id: ${q(b.id)},
    title: ${q(cover.title ?? b.title.replace(/^B(\d+) · /, 'Bloque $1 · '))},
    summary:${cover.summary ? `\n      ${q(cover.summary)}` : " ''"},
    lessons: [
${lessons}
    ],
    dakuten: [${b.dakuten.map(q).join(', ')}],
    wordIds: ${list(b.wordIds, '    ')},
    sentenceIds: ${list(b.sentenceIds, '    ')},
  },`
}).join('\n')

const file = `// El temario de hiragana: qué lleva cada tomo. SOLO lo lee el script de volcado, a
// través de \`lessonSource.ts\` — el plan del pasillo, que sí viaja en el despliegue, está
// en \`plan.ts\`.
//
// GENERADO — \`node tools/build-blocks.mjs\` lo reescribe desde \`${DOC}\`.
// Lo único que no sale del documento es con qué palabra se enseña cada kana: eso lo
// deriva el script, y B1 lleva su emparejamiento escrito porque no se toca.
import type { Block } from '../types'

export const BLOCKS: Block[] = [
${body}
]

export const BLOCKS_BY_ID = new Map(BLOCKS.map((block) => [block.id, block]))
`

fs.writeFileSync(OUT, file)
console.log(`${rendered.length} bloques escritos en ${OUT}`)
console.log(`lecciones: ${rendered.reduce((n, b) => n + b.lessons.length, 0)} · frases: ${rendered.reduce((n, b) => n + b.sentenceIds.length, 0)}`)
if (warnings.length) {
  console.log('\navisos:')
  for (const w of warnings) console.log('  ' + w)
}
