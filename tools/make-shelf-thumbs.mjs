// Genera las miniaturas de los tomos de la balda a partir de los renders grandes.
//
// En la balda un tomo se pinta a 14 px de ancho, pero pide sus renders enteros: 14 MB
// para toda la estantería. Estas miniaturas son las que se montan mientras el tomo está
// colocado; al sacarlo se cambia el `src` por el render grande, que ahí sí se ve a
// tamaño completo.
//
//   node tools/make-shelf-thumbs.mjs            genera
//   node tools/make-shelf-thumbs.mjs --check    solo informa, no escribe
//   node tools/make-shelf-thumbs.mjs --height 480
//
// La tapa girada NO lleva miniatura a propósito: en la balda no se ve ni un píxel de
// ella, así que no se monta hasta que el tomo sale.

import { readdir, stat, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import sharp from 'sharp'

const DIR = 'public/images/hallways/books/volumes'
const SUFFIX = '-thumb'
const QUALITY = 85

// El alto en píxeles de la miniatura. Sale de medir el tomo en la balda, no de una
// intuición: a 160 px ya no se distingue del render, y 240 deja margen por si la escena
// crece con el paneo o el dispositivo tiene más densidad. Subirlo multiplica el peso.
const DEFAULT_HEIGHT = 240

const args = process.argv.slice(2)
const check = args.includes('--check')
const height = Number(args[args.indexOf('--height') + 1]) || DEFAULT_HEIGHT

const kb = (n) => (n / 1024).toFixed(1).padStart(7) + ' kB'

async function main() {
  const files = (await readdir(DIR))
    .filter((f) => f.endsWith('.webp'))
    .filter((f) => !f.includes(SUFFIX))
    // Solo las caras que se ven con el tomo colocado.
    .filter((f) => f.includes('-spine') || (f.includes('-cover') && !f.includes('-turned')))
    .sort()

  if (!files.length) throw new Error('Sin renders en ' + DIR)

  let before = 0
  let after = 0

  for (const file of files) {
    const from = join(DIR, file)
    const to = join(DIR, file.replace('.webp', SUFFIX + '.webp'))

    const source = sharp(from)
    const meta = await source.metadata()
    const thumb = await source
      .resize({ height, withoutEnlargement: true })
      .webp({ quality: QUALITY, effort: 6 })
      .toBuffer()
    const original = (await stat(from)).size
    const made = await sharp(thumb).metadata()

    before += original
    after += thumb.length

    console.log(
      file.padEnd(30) +
        (meta.width + 'x' + meta.height).padEnd(11) +
        kb(original) +
        '  ->  ' +
        (made.width + 'x' + made.height).padEnd(10) +
        kb(thumb.length),
    )

    if (!check) await writeFile(to, thumb)
  }

  const saved = ((1 - after / before) * 100).toFixed(1)
  console.log('\n' + files.length + ' caras, alto ' + height + ' px, calidad ' + QUALITY)
  console.log((before / 1048576).toFixed(2) + ' MB  ->  ' + (after / 1024).toFixed(0) + ' kB   (' + saved + ' % menos)')
  if (check) console.log('\n--check: no se ha escrito nada.')
}

main().catch((error) => {
  console.error(error.message)
  process.exit(1)
})
