// El servidor, simulado. Es la ÚNICA pieza que se tira el día que haya backend.
//
// Hace lo que hará el de verdad —guardar cuentas, sellos e insignias, decidir qué
// tomos se abren y servir su contenido— pero dentro del navegador, sobre
// localStorage. Así el front se termina entero antes de decidir entre Firebase y
// Nest, y cuando se decida se sabrá exactamente qué datos hacen falta.
//
// ── Por qué tarda y por qué puede fallar ───────────────────────────────────
// Un servidor nunca contesta al instante, y a veces no contesta. Si el simulado
// respondiera en el acto y siempre bien, el front no tendría ni esperas ni errores
// que enseñar, y el día del servidor de verdad habría que añadirlos en cada
// pantalla. Por eso cada llamada espera un rato al azar, y `failureRate` deja
// probar qué ve el usuario cuando la conexión falla: súbelo a 0.3 y navega.
//
// ── Qué NO es ──────────────────────────────────────────────────────────────
// Seguridad. Todo esto vive en el navegador y se lee y se toca desde sus
// herramientas: la contraseña va resumida para no dejarla escrita tal cual, pero
// ese resumen no protege nada. El servidor de verdad es el que hará todo eso.
import { BLOCK_PLAN, BLOCKS_BY_ID, progressThrough } from '../content/hiragana/blocks'
import type { Block } from '../content/types'
import { ApiError } from './apiError'
import {
  FINAL_SEAL,
  PASSWORD_MIN_LENGTH,
  type Account,
  type Badge,
  type SealsByBlock,
  type VolumeContent,
  type VolumeGate,
} from './contract'

export const MOCK_SERVER = {
  // Lo que tarda en contestar, al azar entre estos dos. Por debajo de un cuarto
  // de segundo las esperas no se llegan a ver y no se prueban.
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
  // Los bloques superados, en el orden en que se ganaron.
  badges: string[]
}

interface Db {
  users: StoredUser[]
  // La sesión abierta en este navegador. En el de verdad será un token o una
  // cookie; aquí basta con saber de quién es.
  sessionUserId: string | null
}

const DB_KEY = 'bof:mock-server'

// La base entera se lee una vez y a partir de ahí se trabaja en memoria. Si
// localStorage no está —navegación privada, disco lleno—, el servidor sigue
// funcionando igual y solo pierde la memoria al recargar.
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

// Una llamada al servidor: la espera, el posible fallo de red, el trabajo y, si
// escribe, el guardado.
//
// La respuesta sale COPIADA. Un servidor de verdad manda datos nuevos cada vez, y
// si aquí se devolviera el mismo objeto de la base, una pantalla que lo tocase
// estaría cambiando el «servidor» por debajo sin que nadie lo notara.
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

// Un resumen de la contraseña para no guardarla tal cual. FNV-1a, que es
// síncrono y funciona en cualquier contexto —`crypto.subtle` no existe si se abre
// la app por la IP de la red local, que es como se prueba en el móvil—. No
// protege nada: ver «Qué NO es» arriba.
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

// Lo hecho sin cuenta pasa a la cuenta. Se SUMA a lo que ya tuviera, nunca lo
// sustituye: entrar desde un móvil nuevo no puede borrar lo ganado en otro.
//
// Aquí es donde se ganan las insignias. El sello del examen final cierra el tomo,
// y el servidor —no la app— es quien lo convierte en insignia.
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

// Si este usuario puede abrir el tomo que está en esta posición del temario. El
// primero es gratis y sin cuenta; cada uno de los demás pide la insignia del
// anterior, y la insignia solo existe dentro de una cuenta.
function unlockedAt(index: number, user: StoredUser | null): boolean {
  if (index === 0) return true
  return Boolean(user?.badges.includes(BLOCK_PLAN[index - 1]))
}

// El paquete de un tomo: el bloque y todo lo que sus páginas nombran.
//
// El temario se carga AQUÍ, al pedir un tomo, y no arriba del archivo. Este
// servidor lo importa la barra —para saber quién hay en sesión—, y la barra va en
// el bundle inicial: importado arriba, el temario entero viajaría con la portada,
// que no lo necesita para nada. Cargado aquí, llega en su propio trozo cuando
// alguien coge un tomo, que es cuando antes lo cargaba el lector.
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
  // Lo hecho en este navegador sin cuenta, para que la cuenta lo absorba.
  seals: SealsByBlock
}

// Las «rutas» del servidor. Cada una es lo que será una llamada de verdad.
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

        // El mismo error para correo desconocido y para contraseña mala: decir
        // cuál de los dos falla sería contarle a cualquiera qué correos tienen
        // cuenta.
        if (!user || user.passwordHash !== digest(`${cleanEmail}:${password}`)) {
          throw new ApiError('wrong-credentials')
        }

        absorb(user, seals)
        db.sessionUserId = user.id
        return toAccount(user)
      },
      { writes: true },
    ),

  // Google, simulado: siempre la misma cuenta de prueba. El de verdad abre la
  // ventana de Google y devuelve quien haya elegido el usuario.
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

  // Sube sellos a la cuenta abierta. Se usa tanto para uno recién ganado como
  // para ponerse al día con los que se ganaron sin conexión.
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
