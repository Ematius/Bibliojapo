// El servidor, simulado: la ÚNICA pieza que se tira el día que haya backend.
//
// Tarda y falla A PROPÓSITO. Si respondiera al instante y siempre bien, el front no
// tendría esperas ni errores que enseñar, y habría que añadirlos pantalla a pantalla
// el día del servidor de verdad. Sube `failureRate` a 0.3 y navega para verlos.
//
// Nada de esto es seguridad: vive en el navegador y se lee desde sus herramientas.
// El resumen de la contraseña solo evita dejarla escrita tal cual.
import {
  BLOCK_PLAN,
  BLOCKS_BY_ID,
  HIRAGANA_BASE_COUNT,
  KATAKANA_BASE_COUNT,
  N5_KANJI_COUNT,
  N5_WORD_COUNT,
  progressThrough,
} from '../content/hiragana/blocks'
import type { Block } from '../content/types'
import { ApiError } from './apiError'
import {
  FINAL_SEAL,
  PASSWORD_MIN_LENGTH,
  type Account,
  type Badge,
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
}

const DB_KEY = 'bof:mock-server'

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
    if (!BLOCK_PLAN.includes(blockId)) continue

    const merged = new Set([...(user.seals[blockId] ?? []), ...earned])
    user.seals[blockId] = [...merged]

    if (merged.has(FINAL_SEAL) && !user.badges.includes(blockId)) {
      user.badges.push(blockId)
    }
  }
}

function unlockedAt(index: number, user: StoredUser | null): boolean {
  if (index === 0) return true
  return Boolean(user?.badges.includes(BLOCK_PLAN[index - 1]))
}

// El temario se carga AQUÍ y no arriba del archivo: este servidor lo importa la
// barra, que va en el bundle inicial, y el temario entero viajaría con la portada.
async function packVolume(block: Block): Promise<VolumeContent> {
  const [{ HIRAGANA_BY_ID }, { VOCABULARY_BY_ID }, { SENTENCES_BY_ID }] = await Promise.all([
    import('../content/hiragana/kana'),
    import('../content/hiragana/vocabulary'),
    import('../content/hiragana/sentences'),
  ])

  const sentences = block.sentenceIds.flatMap((id) => SENTENCES_BY_ID.get(id) ?? [])

  const wordIds = new Set([
    ...block.wordIds,
    ...block.lessons
      .flatMap((lesson) => [lesson.wordId, lesson.wordId2])
      .filter((id): id is string => Boolean(id)),
    ...sentences.flatMap((sentence) => sentence.wordIds),
  ])

  return {
    block,
    kana: block.lessons.flatMap((lesson) => HIRAGANA_BY_ID.get(lesson.kanaId) ?? []),
    words: [...wordIds].flatMap((id) => VOCABULARY_BY_ID.get(id) ?? []),
    sentences,
    progress: progressThrough(block.id),
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
      requireUser(db).badges.map((blockId) => ({
        blockId,
        volume: BLOCK_PLAN.indexOf(blockId) + 1,
      })),
    ),

  // Cuenta hasta el ÚLTIMO tomo sellado, no uno por uno: se ganan en orden, así que
  // el más avanzado ya incluye los anteriores y `progressThrough` no repite lo
  // reutilizado. Katakana y kanji van a cero mientras no haya temario suyo.
  journey: () =>
    respond((db): JourneyTrack[] => {
      const badges = sessionUser(db)?.badges ?? []
      const furthest = badges.reduce(
        (best, blockId) => Math.max(best, BLOCK_PLAN.indexOf(blockId)),
        -1,
      )
      const done = furthest < 0 ? null : progressThrough(BLOCK_PLAN[furthest])

      return [
        { id: 'hiragana', learned: done?.kana ?? 0, total: HIRAGANA_BASE_COUNT },
        { id: 'katakana', learned: 0, total: KATAKANA_BASE_COUNT },
        { id: 'kanji', learned: 0, total: N5_KANJI_COUNT },
        { id: 'vocabulary', learned: done?.words ?? 0, total: N5_WORD_COUNT },
      ]
    }),

  volumeGates: () =>
    respond((db): VolumeGate[] => {
      const user = sessionUser(db)
      return BLOCK_PLAN.map((blockId, index) => ({
        blockId,
        unlocked: unlockedAt(index, user),
        published: BLOCKS_BY_ID.has(blockId),
      }))
    }),

  volume: (blockId: string) =>
    respond((db) => {
      const index = BLOCK_PLAN.indexOf(blockId)
      const block = BLOCKS_BY_ID.get(blockId)
      if (index < 0 || !block) throw new ApiError('not-found')

      const user = sessionUser(db)
      if (!unlockedAt(index, user)) throw new ApiError(user ? 'forbidden' : 'unauthorized')

      return packVolume(block)
    }),
}
