// El contorno de un kana, sacado de la fuente: la silueta que recorta los trazos en la
// plana mnemotécnica y en la pauta. Hasta ahora se pegaba a mano y no había con qué
// comprobarlo; esto reproduce letra por letra el de る que ya estaba en `kana.ts`.
//
//   node tools/kana-extract.mjs ま す て せ ん
//
// Lo que escupe va a dos sitios: el objeto `GLYPH` del trazador y, cuando el kana queda
// trazado, los campos `outline` y `strokeViewBox` de su ficha.
import * as fontkit from 'fontkit'

// Zen Kaku Gothic New Regular, la de `--font-body`. Otro peso daría otra silueta y los
// kana ya trazados dejarían de encajar con los nuevos.
const FONT = 'tools/fonts/ZenKakuGothicNew-Regular.ttf'

// Las tipografías de TEXTO componen algunos kana de una pieza aunque se escriban en dos
// trazos: り sale unido en Zen Kaku Gothic New y también en Shippori Mincho, porque así
// se compone, no porque así se escriba. Con esa silueta de fondo el segundo trazo parece
// nacer del primero, y la lección enseña una letra que nadie traza así.
//
// Esos van con una tipografía ESCOLAR, que los separa. La lista es de excepciones a
// mano: lo comprobado hasta ahora es que か, せ y ま salen bien con la de texto aunque
// también lleven trazos pegados, así que no basta con contar contornos — se mira el kana
// y se decide. Y como cambiar de fuente mueve la caja del glifo, meter un kana aquí
// obliga a volver a trazarlo entero.
const SCHOOL_FONT = 'tools/fonts/KleeOne-Regular.ttf'
const SCHOOL = new Set(['り'])

// El lienzo es la caja del GLIFO, no el cuadrado del em: cada kana tiene el suyo, y de
// ahí que `strokeViewBox` se escriba por kana en vez de ser uno común.
function extract(font, character) {
  const { path } = font.layout(character).glyphs[0]
  const box = path.bbox
  const round = (value) => Math.round(value)
  const x = (value) => round(value - box.minX)
  // La fuente mide la Y hacia arriba y el SVG hacia abajo.
  const y = (value) => round(box.maxY - value)

  let d = ''
  for (const { command, args } of path.commands) {
    if (command === 'moveTo') d += `M${x(args[0])},${y(args[1])}`
    else if (command === 'lineTo') d += `L${x(args[0])},${y(args[1])}`
    else if (command === 'quadraticCurveTo')
      d += `Q${x(args[0])},${y(args[1])} ${x(args[2])},${y(args[3])}`
    else if (command === 'bezierCurveTo')
      d += `C${x(args[0])},${y(args[1])} ${x(args[2])},${y(args[3])} ${x(args[4])},${y(args[5])}`
    else if (command === 'closePath') d += 'Z'
    else throw new Error(`Comando de path que no se sabe traducir: ${command}`)
  }

  return { W: round(box.maxX - box.minX), H: round(box.maxY - box.minY), d }
}

const characters = process.argv.slice(2)
if (!characters.length) {
  console.error('Uso: node tools/kana-extract.mjs <kana> [kana...]')
  process.exit(1)
}

const fonts = new Map()
const fontFor = (character) => {
  const path = SCHOOL.has(character) ? SCHOOL_FONT : FONT
  if (!fonts.has(path)) fonts.set(path, fontkit.openSync(path))
  return fonts.get(path)
}
for (const character of characters) {
  const glyph = extract(fontFor(character), character)
  console.log(`\n${character}`)
  console.log(`  GLYPH   ${JSON.stringify(glyph)}`)
  console.log(`  viewBox '0 0 ${glyph.W} ${glyph.H}'`)
}
