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

// Entradas del temario que NO se enseñan con ficha propia. Cuentan para el N5 y se leen
// dentro de las palabras que las llevan, pero solas no son nada que se pueda dibujar ni
// pronunciar: お〜 es un prefijo, no una palabra, y el tomo 1 no tiene aún ninguna frase
// donde la cortesía signifique algo.
//
// La lista es a mano y corta a propósito. Llevar 〜 no basta como regla: 〜えん es «yen»
// y 〜まい cuenta objetos planos, y las dos se enseñan con su dibujo sin problema.
const NOT_TAUGHT_ALONE = new Set(['o'])

// Las reglas de gramatica que estrena cada bloque. Van DETRAS de sus lecciones de kana:
// primero los caracteres, despues lo que se construye con ellos.
const RULES_BY_BLOCK = {
  b2: ['desu', 'masu'],
  // La negacion espera a B3 porque necesita り: en B2 no se podria leer.
  b3: ['copula-neg'],
  b5: ['pasado'],
  b6: ['tai'],
  b13: ['nai'],
  b18: ['masho'],
}

// La del dakuten no se explica UNA vez: reaparece en cada bloque que estrene alguno, con
// los de ese tomo. Y va detrás de los kana, pegada a las reglas del bloque: lo primero
// que los usa es です, y delante de las lecciones quedaban 90 páginas entre explicarlos y
// leerlos. Ningún bloque enseña una palabra con un dakuten que estrene él mismo, así que
// nada se adelanta; si algún día la hubiera, esta regla tendría que volver arriba.
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
  b2: {
    summary:
      'Cinco kana más, y las dos rayitas que cambian el sonido de los que ya se ' +
      'saben. Con ellos se escriben です y ます: de aquí en adelante una frase no ' +
      'solo nombra cosas, también dice algo de ellas.',
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

// LA REGLA: TODAS las palabras que el bloque estrena se enseñan, cada una en la lección
// de uno de sus kana. Sin tope: si un kana trae dieciséis palabras nuevas, su lección
// enseña dieciséis. Lo que no se reparta aquí solo aparecería si alguna frase lo usa, y
// llegaría al examen sin haberse presentado.
//
// Cada palabra va a la lección de su kana MÁS TARDE enseñado, no a la del primero: así,
// cuando aparece, ya se han visto todos los caracteres nuevos que lleva. Con el primero,
// せんせい caería en せ arrastrando una ん que nadie ha enseñado todavía.
//
// Dentro de la lección manda el orden: la PRIMERA se lleva las seis planas de
// reconocimiento y las demás una cada una, así que delante va la que ya tiene dibujo y
// audio, y entre iguales la más corta —cuantos menos kana desconocidos arrastre, mejor—.
function shareWords(block, produced) {
  const byKana = new Map(block.kana.map((ch) => [ch, []]))
  const score = (w) => (produced.has(w.id) ? -100 : 0) + w.text.length

  for (const word of [...block.words].sort((a, b) => score(a) - score(b))) {
    if (NOT_TAUGHT_ALONE.has(word.id)) continue
    let last
    for (const ch of block.kana) if (word.text.includes(ch)) last = ch
    if (last) byKana.get(last).push(word.id)
  }

  return byKana
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
  const shared = shareWords(block, produced)
  const lessons = []

  for (const ch of block.kana) {
    const kanaId = idOf.get(ch)
    if (!kanaId) { warnings.push(`${block.id}: ${ch} no tiene ficha en kana.ts`); continue }

    // El que solo existe como partícula se enseña con su regla, no con vocabulario.
    if (TAUGHT_BY_RULE[kanaId]) {
      lessons.push({ type: 'grammar', grammarId: TAUGHT_BY_RULE[kanaId] })
      continue
    }

    // B1 lleva escrito con qué par se presenta cada kana y eso no se toca; las demás
    // palabras que le tocan van detrás, sin repetirse.
    const mine = shared.get(ch) ?? []
    const fixed = block.id === 'b1' ? (B1_LESSONS[kanaId] ?? []) : []
    const wordIds = [...fixed, ...mine.filter((id) => !fixed.includes(id))]
    if (!wordIds?.length) warnings.push(`${block.id}: ${ch} (${kanaId}) se presenta sin palabra: ninguna del pool lo contiene`)
    lessons.push({ type: 'kana', kanaId, wordIds: wordIds ?? [] })
  }

  if (block.dakuten.length) lessons.push({ type: 'grammar', grammarId: DAKUTEN_RULE })
  for (const id of RULES_BY_BLOCK[block.id] ?? []) lessons.push({ type: 'grammar', grammarId: id })

  const sentenceIds = block.sentences.map((s) => sentenceId(s.text, n))
  rendered.push({ ...block, lessons, sentenceIds, wordIds: block.words.map((w) => w.id).filter((id) => !NOT_TAUGHT_ALONE.has(id)) })
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
