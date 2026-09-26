// Un sello se guarda SIEMPRE en el navegador, y además en la cuenta si hay una
// abierta. Lo local no es copia de seguridad: es el progreso de quien todavía no
// tiene cuenta. Por eso se escribe primero, sin esperar al servidor.
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

// Los cuatro arcos los cuenta el SERVIDOR: el temario ya no viaja en el despliegue,
// así que aquí no hay nada que contar — y traérselo solo para eso sería regalarlo.
export async function fetchJourney(): Promise<JourneyTrack[]> {
  const { data, error, status } = await supabase.rpc('journey')
  if (error) throwPostgrestError(error, status)
  return data as JourneyTrack[]
}
