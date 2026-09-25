// Un sello se guarda SIEMPRE en el navegador, y además en la cuenta si hay una
// abierta. Lo local no es copia de seguridad: es el progreso de quien todavía no
// tiene cuenta. Por eso se escribe primero, sin esperar al servidor.
import { addSeal, readSeals } from '../shared/seals'
import { getSession } from './account'
import { announceApiChange } from './apiChanges'
import { BLOCK_CHAIN } from './blockChain'
import type { Badge, JourneyTrack } from './contract'
import { mockServer } from './mockServer'
import { supabase } from './supabase'

const VOLUME_NUMBERS = new Map(BLOCK_CHAIN.map((block) => [block.blockId, block.volumeNumber]))

export { FINAL_SEAL } from './contract'
export type { Badge, JourneyTrack, TrackId } from './contract'

// Los del navegador y los de la cuenta juntos: quien entra desde otro dispositivo
// tiene que ver sus sellos aunque aquí no los haya ganado.
export async function fetchSeals(blockId: string): Promise<Set<string>> {
  const local = readSeals(blockId)
  if (getSession().status !== 'signedIn') return local

  // Sin filtrar por usuario: de eso ya se encarga la política de RLS de la tabla.
  const { data, error } = await supabase.from('seals').select('exam_id').eq('block_id', blockId)
  if (error || !data) return local

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

  const { data, error } = await supabase.from('badges').select('block_id')
  if (error || !data) return []

  return data
    .map((row) => ({ blockId: row.block_id as string, volume: VOLUME_NUMBERS.get(row.block_id) }))
    .filter((badge): badge is Badge => badge.volume !== undefined)
}

// Lo cuenta el servidor: del tomo 2 en adelante el temario es de pago, y contar
// aquí obligaría a traérselo entero al navegador para hacer una división.
export async function fetchJourney(): Promise<JourneyTrack[]> {
  return mockServer.journey()
}
