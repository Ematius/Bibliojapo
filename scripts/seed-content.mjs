// Vuelca `content/` a las tablas del temario. La fuente de autoría sigue siendo
// TypeScript —es lo único que comprueba que ninguna frase apunte a una palabra que no
// existe—, y esto es su compilador: se ejecuta cada vez que cambia el temario.
//
//   npm run seed:content
//
// Carga los módulos con Vite y no con Node a secas porque `content/` importa sin
// extensión (`from './blocks'`), que Node no resuelve.
import { existsSync, readFileSync } from 'node:fs'
import { readdir, readFile } from 'node:fs/promises'
import { join, relative, sep } from 'node:path'
import { createClient } from '@supabase/supabase-js'
import { createServer } from 'vite'

function readEnvFile(file) {
  const values = {}
  if (!existsSync(file)) return values
  for (const line of readFileSync(file, 'utf8').split('\n')) {
    const match = line.match(/^\s*([A-Za-z0-9_]+)\s*=\s*(.*?)\s*$/)
    if (match) values[match[1]] = match[2].replace(/^["']|["']$/g, '')
  }
  return values
}

const env = { ...readEnvFile('.env.local'), ...process.env }

// Sin prefijo `VITE_` A PROPÓSITO: Vite mete en el bundle todo lo que empiece por ahí,
// y esta clave se salta todas las políticas de RLS. Con `VITE_` delante, la base
// quedaría abierta desde el navegador de cualquiera.
const SERVICE_ROLE_KEY = env.SUPABASE_SERVICE_ROLE_KEY
const SUPABASE_URL = env.SUPABASE_URL ?? env.VITE_SUPABASE_URL

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error(
    'Faltan credenciales. En `.env.local`:\n' +
      '  SUPABASE_SERVICE_ROLE_KEY=...   (panel → Settings → API → service_role)\n' +
      'Nunca con prefijo VITE_: acabaría en el bundle.',
  )
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
})

// Con `process.exit` a medias, Node revienta con un assertion de libuv en vez de
// enseñar el fallo: se lanza y que el error suba solo.
function check(label, { error }) {
  if (error) throw new Error(`${label}: ${error.message}`)
}

const vite = await createServer({
  server: { middlewareMode: true },
  appType: 'custom',
  logLevel: 'warn',
})

// El servidor se queda abierto hasta terminar de leer el temario: `loadLessonContent`
// importa de forma perezosa, y con el runner cerrado esos imports revientan.
const { AISLE_CONTENT, AISLE_ORDER, globalBlockId } = await vite.ssrLoadModule(
  '/src/content/aisleContent.ts',
)
const { LESSON_SOURCE } = await vite.ssrLoadModule('/src/content/lessonSource.ts')

const aisles = []
const blocks = []
const lessons = []
const kana = []
const words = []
const sentences = []
const grammar = []

for (const aisleId of AISLE_ORDER) {
  const aisle = AISLE_CONTENT[aisleId]
  const { blocksById, kanaById, wordsById, sentencesById, grammarById } =
    await LESSON_SOURCE[aisleId]()

  aisles.push({ id: aisleId, kana_total: aisle.kanaTotal, word_total: aisle.wordTotal })

  aisle.blockPlan.forEach((localId, index) => {
    const block = blocksById.get(localId)
    blocks.push({
      id: globalBlockId(aisleId, localId),
      aisle_id: aisleId,
      local_id: localId,
      position: index,
      title: block?.title ?? '',
      summary: block?.summary ?? '',
      // Un bloque del plan sin entrada escrita es un tomo que se ve en la balda y dice
      // «todavía no». Sigue teniendo fila: de aquí sale cuántos tomos hay.
      published: Boolean(block),
      word_ids: block?.wordIds ?? [],
      sentence_ids: block?.sentenceIds ?? [],
    })

    block?.lessons.forEach((lesson, position) => {
      lessons.push({
        block_id: globalBlockId(aisleId, localId),
        position,
        kana_id: lesson.kanaId,
        word_ids: lesson.wordIds ?? [],
      })
    })
  })

  for (const entry of kanaById.values()) {
    kana.push({
      aisle_id: aisleId,
      id: entry.id,
      character: entry.character,
      romaji: entry.romaji,
      audio: entry.audio,
      mnemonic: entry.mnemonic ?? '',
      stroke_order: entry.strokeOrder ?? [],
      image: entry.image,
      image_alt: entry.imageAlt ?? '',
      outline: entry.outline,
      strokes: entry.strokes ?? [],
      stroke_view_box: entry.strokeViewBox,
    })
  }

  for (const entry of wordsById.values()) {
    words.push({
      aisle_id: aisleId,
      id: entry.id,
      units: entry.units,
      meaning: entry.meaning,
      swatch: entry.swatch ?? null,
      image: entry.image ?? null,
      image_alt: entry.imageAlt ?? null,
      audio: entry.audio ?? null,
    })
  }

  for (const entry of sentencesById.values()) {
    sentences.push({
      aisle_id: aisleId,
      id: entry.id,
      text: entry.text,
      meaning: entry.meaning,
      units: entry.units,
      word_ids: entry.wordIds ?? [],
      grammar_id: entry.grammarId ?? null,
      audio: entry.audio ?? null,
    })
  }

  for (const entry of grammarById.values()) {
    grammar.push({
      aisle_id: aisleId,
      id: entry.id,
      character: entry.character,
      romaji: entry.romaji,
      explanation: entry.explanation ?? '',
    })
  }
}

await vite.close()

// Los bloques van primero: las lecciones cuelgan de ellos por clave ajena.
check('aisles', await supabase.from('aisles').upsert(aisles))
check('blocks', await supabase.from('blocks').upsert(blocks))
check('kana', await supabase.from('kana').upsert(kana))
check('words', await supabase.from('words').upsert(words))
check('grammar', await supabase.from('grammar').upsert(grammar))
check('sentences', await supabase.from('sentences').upsert(sentences))
check('lessons', await supabase.from('lessons').upsert(lessons))

// Lo que se quita del temario tiene que desaparecer de la tabla, o un kana renombrado
// seguiría sirviéndose desde su id viejo. Se borra DESPUÉS de subir y pasillo a
// pasillo, nunca vaciando la tabla antes: el hueco dejaría sin contenido a quien
// tuviera un tomo abierto en ese momento.
function idList(ids) {
  return `(${ids.map((id) => `"${id}"`).join(',')})`
}

async function dropSurplus(table, rows) {
  for (const aisleId of AISLE_ORDER) {
    const ids = rows.filter((row) => row.aisle_id === aisleId).map((row) => row.id)
    let query = supabase.from(table).delete().eq('aisle_id', aisleId)
    // Un pasillo sin temario se queda sin filas, la misma regla que un bloque sin
    // escribir: `.not(in)` con la lista vacía no filtra nada y borraría de más.
    if (ids.length) query = query.not('id', 'in', idList(ids))
    check(`${table} (sobrantes)`, await query)
  }
}

await dropSurplus('blocks', blocks)
await dropSurplus('kana', kana)
await dropSurplus('words', words)
await dropSurplus('grammar', grammar)
await dropSurplus('sentences', sentences)

// Las lecciones no llevan pasillo: cuelgan del bloque y se identifican por su puesto
// dentro de él, así que lo que sobra es todo lo que caiga más allá de la última.
const emptyBlocks = blocks
  .filter((block) => !lessons.some((lesson) => lesson.block_id === block.id))
  .map((block) => block.id)

if (emptyBlocks.length) {
  check(
    'lessons (bloques sin lecciones)',
    await supabase.from('lessons').delete().in('block_id', emptyBlocks),
  )
}

for (const block of blocks) {
  const count = lessons.filter((lesson) => lesson.block_id === block.id).length
  if (!count) continue
  check(
    'lessons (sobrantes)',
    await supabase.from('lessons').delete().eq('block_id', block.id).gte('position', count),
  )
}

// El media del bloque 2 en adelante: se produce en `content-media/<pasillo>/<bloque>/`
// y sube al bucket con esa misma ruta de clave. El del bloque 1 NO está aquí —se queda
// en `public/`, que es gratis de servir y es el tomo que abre todo el mundo— y por eso
// sus rutas llevan barra delante. Ver `api/media.ts`.
const MEDIA_DIR = 'content-media'
const MEDIA_BUCKET = 'content-media'

const MIME = {
  webp: 'image/webp',
  png: 'image/png',
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  svg: 'image/svg+xml',
  wav: 'audio/wav',
  mp3: 'audio/mpeg',
  ogg: 'audio/ogg',
  m4a: 'audio/mp4',
}

async function uploadMedia() {
  if (!existsSync(MEDIA_DIR)) return 0

  const entries = await readdir(MEDIA_DIR, { recursive: true, withFileTypes: true })
  let uploaded = 0

  for (const entry of entries) {
    if (!entry.isFile() || entry.name === '.gitkeep') continue

    const file = join(entry.parentPath, entry.name)
    // La clave del bucket va SIEMPRE con barras: en Windows `relative` devuelve
    // separadores de Windows, y con ellos el bucket guardaría UN archivo con todo
    // el camino en el nombre, en vez de las carpetas del pasillo y el bloque.
    const key = relative(MEDIA_DIR, file).split(sep).join('/')

    const extension = entry.name.split('.').pop()?.toLowerCase() ?? ''
    const { error } = await supabase.storage.from(MEDIA_BUCKET).upload(key, await readFile(file), {
      upsert: true,
      contentType: MIME[extension] ?? 'application/octet-stream',
    })

    if (error) throw new Error(`media ${key}: ${error.message}`)
    uploaded++
  }

  return uploaded
}

// Sube y reemplaza, pero NO borra lo que sobre, al revés que las tablas: la carpeta se
// vacía a medida que el media pasa al bucket, así que un espejo lo borraría entero.
// Quitar algo del bucket se hace a mano, que es raro y conviene que sea a conciencia.
const uploaded = await uploadMedia()

console.log(
  `Volcado: ${blocks.length} bloques, ${lessons.length} lecciones, ${kana.length} kana, ` +
    `${words.length} palabras, ${sentences.length} frases, ${grammar.length} reglas.`,
)
console.log(uploaded ? `Media: ${uploaded} archivo(s) al bucket.` : 'Media: nada que subir.')
