import { BLOCK_PLAN } from '../content/hiragana/blocks'
import { readSeals } from '../shared/seals'
import { getSession } from './account'
import { FINAL_SEAL, type VolumeGate } from './contract'
import { mockServer } from './mockServer'

export type { VolumeContent } from './contract'

// `needsAccount`: el anterior está sellado, pero sin cuenta, y la insignia que abre
// este solo existe dentro de una. `soon`: ganado pero todavía sin escribir — se lee
// como «todavía no», nunca como roto.
export type VolumeAccess = 'open' | 'locked' | 'needsAccount' | 'soon'

// El tomo gratuito. Se sabe sin preguntar al servidor, y por eso se puede coger
// mientras el servidor contesta, o si no contesta.
export const FREE_BLOCK_ID = BLOCK_PLAN[0]

function sealedHere(gate: VolumeGate | undefined): boolean {
  return Boolean(gate && readSeals(gate.blockId).has(FINAL_SEAL))
}

// Quién abre qué lo decide el servidor. La app solo añade lo que él no puede saber:
// que en ESTE navegador se selló el anterior sin cuenta. Eso no abre nada, pero
// cambia el aviso: no «sella el anterior», sino «crea tu cuenta».
export async function fetchVolumeAccess(): Promise<Map<string, VolumeAccess>> {
  const signedIn = getSession().status === 'signedIn'
  let gates = await mockServer.volumeGates()

  // Un sello de aquí que no le llegó al servidor —sin conexión, o subida fallida—
  // dejaría cerrado un tomo ya ganado. Se sube y se vuelve a preguntar.
  const behind = gates.some((gate, index) => !gate.unlocked && sealedHere(gates[index - 1]))
  if (signedIn && behind) {
    await mockServer.syncSeals(
      Object.fromEntries(gates.map((gate) => [gate.blockId, [...readSeals(gate.blockId)]])),
    )
    gates = await mockServer.volumeGates()
  }

  return new Map(
    gates.map((gate, index): [string, VolumeAccess] => {
      if (gate.unlocked) return [gate.blockId, gate.published ? 'open' : 'soon']
      if (!signedIn && sealedHere(gates[index - 1])) return [gate.blockId, 'needsAccount']
      return [gate.blockId, 'locked']
    }),
  )
}

export function fetchVolume(blockId: string) {
  return mockServer.volume(blockId)
}
