// Lee el documento del temario, que es la fuente de todo lo demás. Vive aquí porque lo
// necesitan el generador de vocabulario, el de bloques, el de frases y los tres
// comprobadores: con una copia en cada uno, un cambio de formato del .md había que
// perseguirlo por cuatro archivos.
import fs from 'fs'

export const DOC = 'docs/FASE1_DEFINITIVO.md'

// Los verbos cuya raíz de ～ない no sale de ninguna tabla NI de la de ～ます. El documento
// no trae columna para ellos, así que se escriben aquí: ver `naiStem` en
// `content/types.ts`.
export const NAI_STEM = { aru: '', 'aru-2': '', kuru: 'こ' }

// La raíz de ～ない de una palabra, o `undefined` si sale de las tablas y no hay que
// escribirla. する y sus compuestos NO son excepción: la suya es la misma que la de ～ます
// —そうじし da そうじします y そうじしない—, así que se deriva en vez de escribirse siete
// veces. くる sí lo es —き para ～ます, こ para ～ない— y por eso sigue en el mapa.
export function naiStemFor(word) {
  if (word.id in NAI_STEM) return NAI_STEM[word.id]
  if (word.verbGroup === 'irregular' && word.text.endsWith('する')) return word.masuStem
  return undefined
}

// Cómo se ESCRIBE una palabra: la primera de sus lecturas alternativas, sin la notación
// del documento —～ de sufijo, ・ de separación, los paréntesis de ～する— y CON la coma,
// que es ortografía de verdad.
export function writtenForm(kana) {
  return kana.split('/')[0].replace(/[（）～〜・]/g, '').trim()
}

export function readDocument(path = DOC) {
  const blocks = []
  let block = null
  let mode = null

  for (const line of fs.readFileSync(path, 'utf8').split(/\r?\n/)) {
    const heading = line.match(/^### B(\d+)(.*)/)
    if (heading) {
      block = {
        id: 'b' + heading[1],
        number: +heading[1],
        title: `Bloque ${heading[1]}${heading[2]}`,
        kana: [],
        dakuten: [],
        words: [],
        sentences: [],
      }
      blocks.push(block)
      continue
    }
    if (!block) continue

    const kana = line.match(/^\*\*Kana nuevos:\*\* (.*)/)
    if (kana) block.kana = [...kana[1]].filter((c) => /[ぁ-ゖー]/.test(c))
    const dakuten = line.match(/^\*\*Dakuten que traen:\*\* (.*)/)
    if (dakuten) block.dakuten = [...dakuten[1]].filter((c) => /[ぁ-ゖー]/.test(c))

    if (line.startsWith('```csv')) { mode = 'csv'; continue }
    if (line.startsWith('```')) { mode = null; continue }
    if (mode !== 'csv' || !line.includes('|')) continue

    const c = line.split('|').map((s) => s.trim())
    // Las dos tablas se distinguen por su cabecera, que no se copia.
    if (c[0] === 'id' || c[0] === 'frase') { block.mode = c[0]; continue }

    if (block.mode === 'frase') {
      block.sentences.push({
        text: c[0],
        romaji: c[1],
        meaning: c[2],
        // El guión largo significa «ninguna».
        particles: c[3] === '—' ? [] : c[3].split('·').map((p) => p.trim()).filter(Boolean),
      })
    } else if (c.length >= 9) {
      const word = {
        id: c[0],
        text: writtenForm(c[1]),
        kanji: c[2],
        romaji: c[3],
        meaning: c[4],
        type: c[5],
        verbGroup: c[6],
        masuStem: c[7],
        block: block.id,
        blockNumber: block.number,
      }
      const nai = naiStemFor(word)
      if (nai !== undefined) word.naiStem = nai
      block.words.push(word)
    }
  }

  return blocks
}

// Todas las palabras de todos los bloques, que es lo que necesita el segmentador.
export function allWords(blocks) {
  return blocks.flatMap((b) => b.words)
}
