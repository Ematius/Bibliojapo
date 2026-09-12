// Un sello se guarda SIEMPRE en el navegador, y además en la cuenta si hay una
// abierta. Lo local no es copia de seguridad: es el progreso de quien todavía no
// tiene cuenta. Por eso se escribe primero, sin esperar al servidor.
import { addSeal, readSeals } from '../shared/seals'
import { getSession } from './account'
import { announceApiChange } from './apiChanges'
import type { Badge, JourneyTrack } from './contract'
import { mockServer } from './mockServer'

export { FINAL_SEAL } from './contract'
export type { Badge, JourneyTrack, TrackId } from './contract'

// Los del navegador y los de la cuenta juntos: quien entra desde otro dispositivo
// tiene que ver sus sellos aunque aquí no los haya ganado.
export async function fetchSeals(blockId: string): Promise<Set<string>> {
  const local = readSeals(blockId)
  if (getSession().status !== 'signedIn') return local

  try {
    const remote = await mockServer.seals(blockId)
    return new Set([...local, ...remote])
  } catch {
    return local
  }
}

// Que el sello del examen final dé además la insignia lo decide el servidor al
// recibirlo, no la app.
export async function saveSeal(blockId: string, examId: string): Promise<void> {
  addSeal(blockId, examId)
  announceApiChange()

  if (getSession().status !== 'signedIn') return

  await mockServer.syncSeals({ [blockId]: [examId] })
  // Otra vez: la insignia ya está en la cuenta y la estantería tiene que enterarse.
  announceApiChange()
}

export async function fetchBadges(): Promise<Badge[]> {
  if (getSession().status !== 'signedIn') return []
  return mockServer.badges()
}

// Lo cuenta el servidor: del tomo 2 en adelante el temario es de pago, y contar
// aquí obligaría a traérselo entero al navegador para hacer una división.
export async function fetchJourney(): Promise<JourneyTrack[]> {
  return mockServer.journey()
}
