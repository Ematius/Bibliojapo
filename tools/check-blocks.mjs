// Comprueba que los bloques no referencien nada que no exista: cada lección con su kana
// y sus palabras, cada bloque con su vocabulario y sus frases. Es lo que TypeScript no
// puede ver, porque todo son cadenas.
//
//   node tools/check-blocks.mjs
import fs from 'fs'

const read = (p) => fs.readFileSync(p, 'utf8')
const blocksSrc = read('src/content/hiragana/blocks.ts')
const vocSrc = read('src/content/hiragana/vocabulary.ts')
const kanaSrc = read('src/content/hiragana/kana.ts')
const sentSrc = read('src/content/hiragana/sentences.ts')

const wordIds = new Set([...vocSrc.matchAll(/^ {4}id: '([^']+)',$/gm)].map((m) => m[1]))
const kanaIds = new Set([...kanaSrc.matchAll(/^ {4}id: '([^']+)',$/gm)].map((m) => m[1]))
const sentenceIds = new Set([...sentSrc.matchAll(/^ {4}id: '([^']+)',$/gm)].map((m) => m[1]))

const blocks = blocksSrc.split(/\n {2}\{\n/).slice(1).map((b) => ({
  id: b.match(/id: '([^']+)'/)?.[1],
  lessons: [...b.matchAll(/kanaId: '([^']+)', wordIds: \[([^\]]*)\]/g)].map((m) => ({
    kanaId: m[1],
    wordIds: m[2].split(',').map((s) => s.trim().replace(/'/g, '')).filter(Boolean),
  })),
  words: (b.match(/\n {4}wordIds: \[([\s\S]*?)\n {4}\]/)?.[1] ?? '').match(/'([^']+)'/g)?.map((s) => s.slice(1, -1)) ?? [],
  sentences: (b.match(/\n {4}sentenceIds: \[([\s\S]*?)\n {4}\]/)?.[1] ?? '').match(/'([^']+)'/g)?.map((s) => s.slice(1, -1)) ?? [],
}))

console.log(`bloques: ${blocks.length} · lecciones: ${blocks.reduce((n, b) => n + b.lessons.length, 0)}`)
console.log(`vocabulario referenciado: ${blocks.reduce((n, b) => n + b.words.length, 0)} · frases: ${blocks.reduce((n, b) => n + b.sentences.length, 0)}`)

const problems = []
const seenSentence = new Map()
const knownWords = new Set()

for (const block of blocks) {
  for (const id of block.words) {
    if (!wordIds.has(id)) problems.push(`${block.id}: la palabra ${id} no existe en vocabulary.ts`)
    knownWords.add(id)
  }
  for (const lesson of block.lessons) {
    if (!kanaIds.has(lesson.kanaId)) problems.push(`${block.id}: el kana ${lesson.kanaId} no existe en kana.ts`)
    for (const id of lesson.wordIds) {
      if (!wordIds.has(id)) problems.push(`${block.id}: ${lesson.kanaId} enseña con ${id}, que no existe`)
      // Enseñar con una palabra que el alumno aún no ha desbloqueado sería adelantarle
      // vocabulario sin avisar.
      else if (!knownWords.has(id)) problems.push(`${block.id}: ${lesson.kanaId} enseña con ${id}, de un bloque posterior`)
    }
    if (!lesson.wordIds.length) problems.push(`${block.id}: ${lesson.kanaId} no tiene con qué enseñarse`)
  }
  for (const id of block.sentences) {
    if (seenSentence.has(id)) problems.push(`${block.id}: la frase ${id} ya estaba en ${seenSentence.get(id)}`)
    seenSentence.set(id, block.id)
  }
}

const missingSentences = [...seenSentence.keys()].filter((id) => !sentenceIds.has(id))

console.log('\nreferencias rotas:', problems.length)
for (const p of problems) console.log('  ' + p)

console.log(`\nfrases que blocks.ts pide y sentences.ts no tiene: ${missingSentences.length} de ${seenSentence.size}`)
if (missingSentences.length) console.log(`  las primeras: ${missingSentences.slice(0, 5).join(', ')}`)
