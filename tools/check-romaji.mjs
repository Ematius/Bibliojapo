// Comprueba el tokenizador contra el CSV del documento: el rōmaji de los `units`
// concatenado tiene que reproducir el campo `romaji` de cada fila. Si cuadran las 768,
// los units son correctos por construcción; las que no, salen aquí con su desglose.
//
//   node tools/check-romaji.mjs
import fs from 'fs'
import { tokenize, tokenizeWord, reading, normalise, TABLE_SIZE } from './romaji.mjs'

const DOC = 'docs/FASE1_DEFINITIVO.md'

// La geminada, probada contra sílabas que el pool no contiene: si la regla solo valiera
// para las palabras que hay hoy, fallaría en cuanto llegue katakana.
function checkGeminate() {
  const expected = {
    っか: 'kka', っし: 'sshi', っち: 'cchi', っつ: 'ttsu', っふ: 'ffu',
    っじ: 'jji', っちゃ: 'ccha', っしゃ: 'ssha', っぱ: 'ppa', っきゃ: 'kkya',
  }
  const bad = Object.entries(expected).filter(([kana, want]) => reading(tokenize(kana)) !== want)
  for (const [kana, want] of bad) console.log(`  っ FALLA ${kana}: esperado ${want}, sale ${reading(tokenize(kana))}`)
  console.log(bad.length ? `geminada: ${bad.length} fallos` : 'geminada: las 10 sílabas de prueba cuadran, っつ incluida')
}

function csvRows(markdown) {
  const rows = []
  let block = null
  let inCsv = false
  for (const line of markdown.split(/\r?\n/)) {
    const heading = line.match(/^### B(\d+)/)
    if (heading) { block = 'b' + heading[1]; continue }
    if (line.startsWith('```csv')) { inCsv = true; continue }
    if (line.startsWith('```')) { inCsv = false; continue }
    if (!inCsv || !block || !line.includes('|') || line.startsWith('id|')) continue
    const c = line.split('|')
    if (c.length >= 9) rows.push({ id: c[0], kana: c[1], romaji: c[3], meaning: c[4], type: c[5], block })
  }
  return rows
}

const rows = csvRows(fs.readFileSync(DOC, 'utf8'))
console.log(`tabla: ${TABLE_SIZE} lecturas · filas del documento: ${rows.length}`)
checkGeminate()

const mismatches = []
for (const row of rows) {
  const units = tokenizeWord(row.kana)
  const got = normalise(reading(units))
  const want = normalise(row.romaji)
  if (got !== want) mismatches.push({ ...row, got, want, units })
}

console.log(`cuadran: ${rows.length - mismatches.length} · descuadran: ${mismatches.length}`)

if (mismatches.length) {
  // Agrupadas por causa, que es lo que decide si se arregla el CSV o el tokenizador.
  const groups = new Map()
  for (const m of mismatches) {
    const cause = m.want.includes('/') || m.romaji.includes('/') ? 'dos lecturas en un campo'
      : m.units.some((u) => u.romaji === '?') ? 'carácter fuera de la tabla'
      : m.kana.includes('は') && m.want.includes('wa') ? 'は partícula (se lee wa)'
      : 'otro'
    if (!groups.has(cause)) groups.set(cause, [])
    groups.get(cause).push(m)
  }

  for (const [cause, list] of groups) {
    console.log(`\n── ${cause} (${list.length}) ──`)
    for (const m of list) {
      console.log(
        `  ${m.block}  ${m.id.padEnd(22)} ${m.kana.padEnd(12)}` +
        ` doc="${m.romaji}"  generado="${reading(m.units)}"`,
      )
    }
  }
}
