// El servidor, simulado: la ÚNICA pieza que se tira el día que haya backend.
//
// Tarda y falla A PROPÓSITO. Si respondiera al instante y siempre bien, el front no
// tendría esperas ni errores que enseñar, y habría que añadirlos pantalla a pantalla
// el día del servidor de verdad. Sube `failureRate` a 0.3 y navega para verlos.
//
// Nada de esto es seguridad: vive en el navegador y se lee desde sus herramientas.
// El resumen de la contraseña solo evita dejarla escrita tal cual.
import {
  HIRAGANA_BASE_COUNT,
  KATAKANA_BASE_COUNT,
  N5_KANJI_COUNT,
  N5_WORD_COUNT,
  progressThrough,
} from '../content/hiragana/blocks'
import { AISLE_CONTENT, AISLE_ORDER, globalBlockId, type AisleId } from '../content/aisleContent'
import type { Block } from '../content/types'
import { ApiError } from './apiError'
import {
  FINAL_SEAL,
  PASSWORD_MIN_LENGTH,
  type Account,
  type Badge,
  type CurrentVolume,
  type FeedbackReport,
  type JourneyTrack,
  type SealsByBlock,
  type VolumeContent,
  type VolumeGate,
} from './contract'

export const MOCK_SERVER = {
  // Por debajo de un cuarto de segundo las esperas no se llegan a ver ni a probar.
  latencyMs: { min: 250, max: 700 },
  // Qué parte de las llamadas falla como si no hubiera conexión, de 0 a 1.
  failureRate: 0,
}

interface GlobalBlock {
  aisleId: AisleId
  localId: string
  blockId: string
  // Su puesto DENTRO del pasillo, empezando por 1: el mismo número que enseña la
  // balda —`Tomo ${index + 1}` en `shelfConfig.ts`—, no su posición en esta lista
  // conjunta.
  volumeNumber: number
}

// La cadena de desbloqueo entera, de un tirón: hiragana completo, luego katakana
// completo, luego kanji, luego vocabulario. Un tomo pide el ANTERIOR de esta lista,
// así que dentro de un pasillo es la cadena de siempre —cada bloque pide el de
// antes— y en la frontera entre dos pasillos es «termina el pasillo anterior»,
// porque su último bloque es lo que representa tenerlo terminado del todo.
const GLOBAL_BLOCKS: readonly GlobalBlock[] = AISLE_ORDER.flatMap((aisleId) =>
  AISLE_CONTENT[aisleId].blockPlan.map((localId, index) => ({
    aisleId,
    localId,
    blockId: globalBlockId(aisleId, localId),
    volumeNumber: index + 1,
  })),
)

const GLOBAL_BLOCK_IDS = new Set(GLOBAL_BLOCKS.map((entry) => entry.blockId))

interface StoredUser {
  id: string
  name: string
  email: string
  provider: Account['provider']
  // Null en las cuentas de Google, que no tienen contraseña.
  passwordHash: string | null
  seals: SealsByBlock
  badges: string[]
}

interface Db {
  users: StoredUser[]
  sessionUserId: string | null
  // Opcional: una base guardada antes de que existiera Contacta no lo trae.
  feedback?: FeedbackReport[]
}

const DB_KEY = 'bibliojapo:mock-server'

// Sin localStorage —navegación privada, disco lleno— el servidor sigue funcionando
// y solo pierde la memoria al recargar.
let memory: Db | null = null

function readDb(): Db {
  if (memory) return memory

  try {
    const raw = window.localStorage.getItem(DB_KEY)
    memory = raw ? (JSON.parse(raw) as Db) : null
  } catch {
    memory = null
  }

  memory ??= { users: [], sessionUserId: null }
  return memory
}

function writeDb(db: Db): void {
  memory = db
  try {
    window.localStorage.setItem(DB_KEY, JSON.stringify(db))
  } catch {
    // Sin almacenamiento la cuenta dura lo que dure la pestaña.
  }
}

function wait(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

// La respuesta sale COPIADA: si se devolviera el objeto de la base, una pantalla que
// lo tocase estaría cambiando el «servidor» por debajo.
async function respond<T>(
  work: (db: Db) => T | Promise<T>,
  { writes = false } = {},
): Promise<T> {
  const { min, max } = MOCK_SERVER.latencyMs
  await wait(min + Math.random() * (max - min))

  if (Math.random() < MOCK_SERVER.failureRate) throw new ApiError('network')

  const db = readDb()
  const result = await work(db)
  if (writes) writeDb(db)

  return structuredClone(result)
}

function sessionUser(db: Db): StoredUser | null {
  return db.users.find((user) => user.id === db.sessionUserId) ?? null
}

function requireUser(db: Db): StoredUser {
  const user = sessionUser(db)
  if (!user) throw new ApiError('unauthorized')
  return user
}

function toAccount(user: StoredUser): Account {
  return { id: user.id, name: user.name, email: user.email, provider: user.provider }
}

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase()
}

// FNV-1a porque es síncrono y funciona en cualquier contexto: `crypto.subtle` no
// existe al abrir la app por la IP de la red local, que es como se prueba en el móvil.
function digest(text: string): string {
  let hash = 0x811c9dc5
  for (let i = 0; i < text.length; i++) {
    hash ^= text.charCodeAt(i)
    hash = Math.imul(hash, 0x01000193)
  }
  return (hash >>> 0).toString(16)
}

function newId(): string {
  return `u-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`
}

// Lo hecho sin cuenta se SUMA a lo que ya tuviera, nunca lo sustituye: entrar desde
// un móvil nuevo no puede borrar lo ganado en otro. Aquí se ganan las insignias.
function absorb(user: StoredUser, seals: SealsByBlock): void {
  for (const [blockId, earned] of Object.entries(seals)) {
    if (!GLOBAL_BLOCK_IDS.has(blockId)) continue

    const merged = new Set([...(user.seals[blockId] ?? []), ...earned])
    user.seals[blockId] = [...merged]

    if (merged.has(FINAL_SEAL) && !user.badges.includes(blockId)) {
      user.badges.push(blockId)
    }
  }
}

function unlockedAt(index: number, user: StoredUser | null): boolean {
  if (index === 0) return true
  return Boolean(user?.badges.includes(GLOBAL_BLOCKS[index - 1].blockId))
}

// Cuánto se ha aprendido de UN pasillo, contando hasta el bloque más lejano ya
// sellado EN ESE pasillo. Sin repetir: un kana o una palabra que reaparece en un
// bloque posterior no cuenta dos veces. Un pasillo sin temario da cero en los dos,
// la misma regla que un bloque sin escribir.
function aisleProgress(aisleId: AisleId, badges: readonly string[]): { kana: number; words: number } {
  const entries = GLOBAL_BLOCKS.filter((entry) => entry.aisleId === aisleId)
  const badgeSet = new Set(badges)
  const furthest = entries.reduce(
    (best, entry, index) => (badgeSet.has(entry.blockId) ? index : best),
    -1,
  )

  const { blocksById } = AISLE_CONTENT[aisleId]
  const reached = entries.slice(0, furthest + 1).flatMap((entry) => {
    const block = blocksById.get(entry.localId)
    return block ? [block] : []
  })

  return {
    kana: new Set(reached.flatMap((block) => block.lessons.map((lesson) => lesson.kanaId))).size,
    words: new Set(reached.flatMap((block) => block.wordIds)).size,
  }
}

// Lo pesado del temario se carga AQUÍ y no arriba del archivo: este servidor lo
// importa la barra, que va en el bundle inicial, y el temario entero viajaría con
// la portada. `loadLessonContent` es quien hace el import perezoso, uno por pasillo.
async function packVolume(aisleId: AisleId, block: Block): Promise<VolumeContent> {
  const { kanaById, wordsById, sentencesById, grammarById } =
    await AISLE_CONTENT[aisleId].loadLessonContent()

  const sentences = block.sentenceIds.flatMap((id) => sentencesById.get(id) ?? [])

  // En orden de aparición y sin repetir: una regla la nombran varias frases, y la que
  // sale antes es la que hay que enseñar antes.
  const grammarIds = new Set(
    sentences.flatMap((sentence) => (sentence.grammarId ? [sentence.grammarId] : [])),
  )

  const wordIds = new Set([
    ...block.wordIds,
    ...block.lessons.flatMap((lesson) => lesson.wordIds ?? []),
    ...sentences.flatMap((sentence) => sentence.wordIds),
  ])

  return {
    block,
    kana: block.lessons.flatMap((lesson) => kanaById.get(lesson.kanaId) ?? []),
    words: [...wordIds].flatMap((id) => wordsById.get(id) ?? []),
    sentences,
    grammar: [...grammarIds].flatMap((id) => grammarById.get(id) ?? []),
    // El progreso del carné sigue siendo solo de hiragana: los demás pasillos
    // todavía no tienen temario que contar. Se generaliza cuando lo tengan.
    progress:
      aisleId === 'hiragana'
        ? progressThrough(block.id)
        : { kana: 0, kanaPercent: 0, words: 0, wordsPercent: 0 },
  }
}

interface Credentials {
  email: string
  password: string
  seals: SealsByBlock
}

export const mockServer = {
  session: () =>
    respond((db) => {
      const user = sessionUser(db)
      return user ? toAccount(user) : null
    }),

  signUp: ({ name, email, password, seals }: Credentials & { name: string }) =>
    respond(
      (db) => {
        const cleanName = name.trim()
        const cleanEmail = normalizeEmail(email)

        if (!cleanName) throw new ApiError('missing-name')
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) throw new ApiError('invalid-email')
        if (password.length < PASSWORD_MIN_LENGTH) throw new ApiError('weak-password')
        if (db.users.some((user) => user.email === cleanEmail)) throw new ApiError('email-taken')

        const user: StoredUser = {
          id: newId(),
          name: cleanName,
          email: cleanEmail,
          provider: 'password',
          passwordHash: digest(`${cleanEmail}:${password}`),
          seals: {},
          badges: [],
        }
        absorb(user, seals)

        db.users.push(user)
        db.sessionUserId = user.id
        return toAccount(user)
      },
      { writes: true },
    ),

  signIn: ({ email, password, seals }: Credentials) =>
    respond(
      (db) => {
        const cleanEmail = normalizeEmail(email)
        const user = db.users.find((candidate) => candidate.email === cleanEmail)

        // El mismo error para correo desconocido y para contraseña mala: distinguirlos
        // sería contar qué correos tienen cuenta.
        if (!user || user.passwordHash !== digest(`${cleanEmail}:${password}`)) {
          throw new ApiError('wrong-credentials')
        }

        absorb(user, seals)
        db.sessionUserId = user.id
        return toAccount(user)
      },
      { writes: true },
    ),

  // Simulado: siempre la misma cuenta de prueba.
  signInWithGoogle: ({ seals }: { seals: SealsByBlock }) =>
    respond(
      (db) => {
        let user = db.users.find((candidate) => candidate.provider === 'google')

        if (!user) {
          user = {
            id: newId(),
            name: 'Socio de prueba',
            email: 'socio.google@ejemplo.com',
            provider: 'google',
            passwordHash: null,
            seals: {},
            badges: [],
          }
          db.users.push(user)
        }

        absorb(user, seals)
        db.sessionUserId = user.id
        return toAccount(user)
      },
      { writes: true },
    ),

  // Solo las cuentas de correo la tienen. Pide la actual y no solo la sesión abierta:
  // con la sesión basta para leer, no para dejar a su dueño fuera.
  changePassword: ({ current, next }: { current: string; next: string }) =>
    respond(
      (db) => {
        const user = requireUser(db)

        if (user.provider !== 'password') throw new ApiError('forbidden')
        if (user.passwordHash !== digest(`${user.email}:${current}`)) {
          throw new ApiError('wrong-credentials')
        }
        if (next.length < PASSWORD_MIN_LENGTH) throw new ApiError('weak-password')

        user.passwordHash = digest(`${user.email}:${next}`)
      },
      { writes: true },
    ),

  // Simulado hasta las trancas: el aviso se queda en la base de este navegador, así
  // que NO llega a nadie. Lo único que se prueba hoy es la pantalla —su espera, su
  // error, su acuse—. Ver la cabecera de `feedback.ts`.
  sendFeedback: (report: FeedbackReport) =>
    respond(
      (db) => {
        if (!report.message.trim()) throw new ApiError('empty-message')
        // Se acepta sin correo; con uno escrito a medias, no: quien lo deja es para
        // que le respondan.
        if (report.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(report.email)) {
          throw new ApiError('invalid-email')
        }

        db.feedback = [...(db.feedback ?? []), report]
      },
      { writes: true },
    ),

  signOut: () =>
    respond(
      (db) => {
        db.sessionUserId = null
      },
      { writes: true },
    ),

  syncSeals: (seals: SealsByBlock) =>
    respond(
      (db) => {
        absorb(requireUser(db), seals)
      },
      { writes: true },
    ),

  seals: (blockId: string) => respond((db) => requireUser(db).seals[blockId] ?? []),

  badges: () =>
    respond((db): Badge[] =>
      requireUser(db).badges.flatMap((blockId) => {
        const entry = GLOBAL_BLOCKS.find((candidate) => candidate.blockId === blockId)
        // Una insignia de un bloque que ya no figura en ningún plan no debería
        // poder existir, pero por si acaso no se enseña un tomo fantasma.
        return entry ? [{ blockId, volume: entry.volumeNumber }] : []
      }),
    ),

  // Cada pasillo cuenta hasta su ÚLTIMO tomo sellado, no uno por uno: se ganan en
  // orden, así que el más avanzado ya incluye los anteriores. Un pasillo sin
  // temario da cero solo, sin caso especial —ver `aisleProgress`—.
  //
  // «Vocabulario» no es el progreso del pasillo de ese nombre: es la palabra
  // aprendida en TODOS, la misma cuenta acumulada de siempre, ahora sumada pasillo
  // a pasillo en vez de leída solo de hiragana.
  journey: () =>
    respond((db): JourneyTrack[] => {
      const badges = sessionUser(db)?.badges ?? []
      const progress = Object.fromEntries(
        AISLE_ORDER.map((aisleId) => [aisleId, aisleProgress(aisleId, badges)]),
      ) as Record<AisleId, { kana: number; words: number }>

      return [
        { id: 'hiragana', learned: progress.hiragana.kana, total: HIRAGANA_BASE_COUNT },
        { id: 'katakana', learned: progress.katakana.kana, total: KATAKANA_BASE_COUNT },
        { id: 'kanji', learned: progress.kanji.kana, total: N5_KANJI_COUNT },
        {
          id: 'vocabulary',
          learned: AISLE_ORDER.reduce((sum, aisleId) => sum + progress[aisleId].words, 0),
          total: N5_WORD_COUNT,
        },
      ]
    }),

  // El primero abierto, escrito y sin insignia. Sin sesión da el tomo gratuito
  // siempre: los sellos de este navegador no son suyos y no los mira.
  currentVolume: () =>
    respond((db): CurrentVolume | null => {
      const user = sessionUser(db)
      const earned = new Set(user?.badges ?? [])

      const entry = GLOBAL_BLOCKS.find(
        (candidate, index) =>
          unlockedAt(index, user) &&
          !earned.has(candidate.blockId) &&
          AISLE_CONTENT[candidate.aisleId].blocksById.has(candidate.localId),
      )

      if (!entry) return null
      const { blockId, aisleId, volumeNumber } = entry
      return { blockId, aisleId, volumeNumber }
    }),

  volumeGates: () =>
    respond((db): VolumeGate[] => {
      const user = sessionUser(db)
      return GLOBAL_BLOCKS.map((entry, index) => ({
        blockId: entry.blockId,
        unlocked: unlockedAt(index, user),
        published: AISLE_CONTENT[entry.aisleId].blocksById.has(entry.localId),
      }))
    }),

  volume: (blockId: string) =>
    respond((db) => {
      const index = GLOBAL_BLOCKS.findIndex((candidate) => candidate.blockId === blockId)
      const entry = GLOBAL_BLOCKS[index]
      const block = entry && AISLE_CONTENT[entry.aisleId].blocksById.get(entry.localId)
      if (!entry || !block) throw new ApiError('not-found')

      const user = sessionUser(db)
      if (!unlockedAt(index, user)) throw new ApiError(user ? 'forbidden' : 'unauthorized')

      return packVolume(entry.aisleId, block)
    }),
}
