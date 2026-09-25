import { AISLE_CONTENT } from '../content/aisleContent'
import { readSeals } from '../shared/seals'
import { getSession } from './account'
import { BLOCK_CHAIN, type ChainedBlock } from './blockChain'
import { FINAL_SEAL, type CurrentVolume } from './contract'
import { mockServer } from './mockServer'
import { fetchBadges } from './progress'
import { supabase } from './supabase'

export type { CurrentVolume, VolumeContent } from './contract'

// `needsAccount`: el anterior está sellado, pero sin cuenta, y la insignia que abre
// este solo existe dentro de una. `soon`: ganado pero todavía sin escribir — se lee
// como «todavía no», nunca como roto.
export type VolumeAccess = 'open' | 'locked' | 'needsAccount' | 'soon'

// El tomo gratuito. Se sabe sin preguntar al servidor, y por eso se puede coger
// mientras el servidor contesta, o si no contesta.
export const FREE_BLOCK_ID = AISLE_CONTENT.hiragana.blockPlan[0]

function sealedHere(block: ChainedBlock | undefined): boolean {
  return Boolean(block && readSeals(block.blockId).has(FINAL_SEAL))
}

// Todo lo sellado en este navegador, de una vez. Es lo que absorbe la cuenta: lo
// hecho sin ella no puede perderse al crearla.
async function uploadLocalSeals(userId: string): Promise<void> {
  const rows = BLOCK_CHAIN.flatMap((block) =>
    [...readSeals(block.blockId)].map((examId) => ({
      user_id: userId,
      block_id: block.blockId,
      exam_id: examId,
    })),
  )

  if (rows.length) await supabase.from('seals').upsert(rows, { ignoreDuplicates: true })
}

async function earnedBadges(): Promise<Set<string>> {
  return new Set((await fetchBadges()).map((badge) => badge.blockId))
}

// Quién abre qué lo decide el servidor. La app solo añade lo que él no puede saber:
// que en ESTE navegador se selló el anterior sin cuenta. Eso no abre nada, pero
// cambia el aviso: no «sella el anterior», sino «crea tu cuenta».
export async function fetchVolumeAccess(): Promise<Map<string, VolumeAccess>> {
  const { account } = getSession()
  let badges = await earnedBadges()

  // Un sello de aquí que no le llegó al servidor —sin conexión, o subida fallida—
  // dejaría cerrado un tomo ya ganado. Se sube y se vuelve a preguntar.
  const behind = BLOCK_CHAIN.some(
    (block) => sealedHere(block) && !badges.has(block.blockId),
  )
  if (account && behind) {
    await uploadLocalSeals(account.id)
    badges = await earnedBadges()
  }

  return new Map(
    BLOCK_CHAIN.map((block, index): [string, VolumeAccess] => {
      const previous = BLOCK_CHAIN[index - 1]
      // Quién abre qué sigue decidiéndolo el servidor: aquí solo se lee la insignia
      // que él dio, nunca el sello que la provocó.
      if (index === 0 || badges.has(previous.blockId)) {
        return [block.blockId, block.published ? 'open' : 'soon']
      }
      if (!account && sealedHere(previous)) return [block.blockId, 'needsAccount']
      return [block.blockId, 'locked']
    }),
  )
}

export function fetchVolume(blockId: string) {
  return mockServer.volume(blockId)
}

// Por dónde sigue la lectura. `null` cuando no queda ninguno por sellar: lo escrito
// se ha terminado, que no es lo mismo que no haber empezado.
export async function fetchCurrentVolume(): Promise<CurrentVolume | null> {
  const [access, badges] = await Promise.all([fetchVolumeAccess(), earnedBadges()])

  const next = BLOCK_CHAIN.find(
    (block) => access.get(block.blockId) === 'open' && !badges.has(block.blockId),
  )
  if (!next) return null

  return { blockId: next.blockId, aisleId: next.aisleId, volumeNumber: next.volumeNumber }
}
