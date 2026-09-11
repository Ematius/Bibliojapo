// Los tomos: cuáles se pueden abrir y qué hay dentro de cada uno.
import { BLOCK_PLAN } from '../content/hiragana/blocks'
import { readSeals } from '../shared/seals'
import { getSession } from './account'
import { FINAL_SEAL, type VolumeGate } from './contract'
import { mockServer } from './mockServer'

export type { VolumeContent } from './contract'

// Cómo está un tomo para quien mira la estantería:
//
//   open           se puede coger y leer
//   locked         falta sellar el tomo anterior
//   needsAccount   el anterior está sellado, pero sin cuenta: la insignia que lo
//                  abre se guarda en la cuenta, y no hay dónde guardarla
//   soon           ganado, pero todavía sin escribir. Se lee como «todavía no»,
//                  nunca como roto — ver CLAUDE.md
export type VolumeAccess = 'open' | 'locked' | 'needsAccount' | 'soon'

// El tomo gratuito, que se abre sin cuenta. Se sabe sin preguntar a nadie, y es
// lo que permite enseñarlo abierto desde el primer momento: mientras el servidor
// contesta —o si no contesta— el tomo 1 se puede coger igual.
export const FREE_BLOCK_ID = BLOCK_PLAN[0]

function sealedHere(gate: VolumeGate | undefined): boolean {
  return Boolean(gate && readSeals(gate.blockId).has(FINAL_SEAL))
}

// El estado de cada tomo, por bloque.
//
// Quién puede abrir qué lo decide el servidor. La app solo añade lo que el
// servidor no puede saber: que en ESTE navegador se selló el tomo anterior sin
// cuenta. Eso no abre nada —la insignia sigue sin existir—, pero cambia qué hay
// que decirle a quien lo pulse: no «sella el anterior», sino «crea tu cuenta».
export async function fetchVolumeAccess(): Promise<Map<string, VolumeAccess>> {
  const signedIn = getSession().status === 'signedIn'
  let gates = await mockServer.volumeGates()

  // Con cuenta abierta, un sello de aquí que no le ha llegado al servidor —se
  // ganó sin conexión, o la subida falló— dejaría cerrado un tomo ya ganado. Se
  // sube y se vuelve a preguntar.
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

// Todo lo que hace falta para leer un tomo. Falla con `unauthorized` o
// `forbidden` si no se ha ganado, y con `not-found` si no está escrito.
export function fetchVolume(blockId: string) {
  return mockServer.volume(blockId)
}
