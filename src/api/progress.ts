// Un sello se guarda SIEMPRE en el navegador, y además en la cuenta si hay una
// abierta. Lo local no es copia de seguridad: es el progreso de quien todavía no
// tiene cuenta. Por eso se escribe primero, sin esperar al servidor.
import { AISLE_CONTENT, AISLE_ORDER, type AisleId } from '../content/aisleContent'
import {
  HIRAGANA_BASE_COUNT,
  KATAKANA_BASE_COUNT,
  N5_KANJI_COUNT,
  N5_WORD_COUNT,
} from '../content/hiragana/blocks'
import { addSeal, readSeals } from '../shared/seals'
import { getSession } from './account'
import { announceApiChange } from './apiChanges'
import { BLOCK_CHAIN } from './blockChain'
import type { Badge, JourneyTrack } from './contract'
import { supabase } from './supabase'
import { throwPostgrestError } from './supabaseError'

const VOLUME_NUMBERS = new Map(BLOCK_CHAIN.map((block) => [block.blockId, block.volumeNumber]))

export { FINAL_SEAL } from './contract'
export type { Badge, JourneyTrack, TrackId } from './contract'

// Los del navegador y los de la cuenta juntos: quien entra desde otro dispositivo
// tiene que ver sus sellos aunque aquí no los haya ganado.
export async function fetchSeals(blockId: string): Promise<Set<string>> {
  const local = readSeals(blockId)
  if (getSession().status !== 'signedIn') return local

  // Sin filtrar por usuario: de eso ya se encarga la política de RLS de la tabla.
  //
  // Un fallo de verdad SE PROPAGA, no se convierte en «solo lo de este navegador»: eso
  // es indistinguible de haber perdido las insignias de la cuenta, y es justo lo que
  // pasaría en silencio si se devolviera `local` aquí. Quien llama decide qué hacer con
  // el fallo — reintentar, como ya hace `useVolumeAccess`.
  const { data, error, status } = await supabase
    .from('seals')
    .select('exam_id')
    .eq('block_id', blockId)
  if (error) throwPostgrestError(error, status)

  return new Set([...local, ...data.map((row) => row.exam_id as string)])
}

// Que el sello del examen final dé además la insignia lo decide el servidor al
// recibirlo, no la app.
export async function saveSeal(blockId: string, examId: string): Promise<void> {
  addSeal(blockId, examId)
  announceApiChange()

  const { account } = getSession()
  if (!account) return

  // Repetir un examen ya sellado no es un error: `ignoreDuplicates` lo deja pasar sin
  // tocar la fila, que además es lo único que permiten los permisos de la tabla.
  await supabase
    .from('seals')
    .upsert({ user_id: account.id, block_id: blockId, exam_id: examId }, { ignoreDuplicates: true })

  // Otra vez: la insignia ya está en la cuenta y la estantería tiene que enterarse.
  announceApiChange()
}

export async function fetchBadges(): Promise<Badge[]> {
  if (getSession().status !== 'signedIn') return []

  // Mismo criterio que `fetchSeals`: un fallo real se propaga en vez de leerse como
  // «sin insignias», que un tomo ganado se vería cerrado sin ningún aviso de por qué.
  const { data, error, status } = await supabase.from('badges').select('block_id')
  if (error) throwPostgrestError(error, status)

  return data
    .map((row) => ({ blockId: row.block_id as string, volume: VOLUME_NUMBERS.get(row.block_id) }))
    .filter((badge): badge is Badge => badge.volume !== undefined)
}

// Cuánto se ha aprendido de UN pasillo, contando hasta el bloque más lejano ya
// sellado EN ESE pasillo. Sin repetir: un kana o una palabra que reaparece en un
// bloque posterior no cuenta dos veces. Un pasillo sin temario da cero en los dos,
// la misma regla que un bloque sin escribir.
function aisleProgress(aisleId: AisleId, badges: Set<string>): { kana: number; words: number } {
  const entries = BLOCK_CHAIN.filter((block) => block.aisleId === aisleId)
  const furthest = entries.reduce(
    (best, block, index) => (badges.has(block.blockId) ? index : best),
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

// La cuenta se hace AQUÍ porque el temario todavía viaja en el bundle. El día que
// del tomo 2 en adelante lo sirva el servidor, esta división sube con él: traerse el
// temario entero al navegador solo para contarlo sería regalarlo.
export async function fetchJourney(): Promise<JourneyTrack[]> {
  const badges = new Set((await fetchBadges()).map((badge) => badge.blockId))
  const progress = Object.fromEntries(
    AISLE_ORDER.map((aisleId) => [aisleId, aisleProgress(aisleId, badges)]),
  ) as Record<AisleId, { kana: number; words: number }>

  return [
    { id: 'hiragana', learned: progress.hiragana.kana, total: HIRAGANA_BASE_COUNT },
    { id: 'katakana', learned: progress.katakana.kana, total: KATAKANA_BASE_COUNT },
    { id: 'kanji', learned: progress.kanji.kana, total: N5_KANJI_COUNT },
    // No es el avance de ESE pasillo: es la palabra aprendida sumada de los cuatro.
    {
      id: 'vocabulary',
      learned: AISLE_ORDER.reduce((sum, aisleId) => sum + progress[aisleId].words, 0),
      total: N5_WORD_COUNT,
    },
  ]
}
