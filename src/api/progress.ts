// Los sellos de los exámenes y las insignias de los tomos.
//
// ── Dónde se guarda un sello ───────────────────────────────────────────────
// SIEMPRE en el navegador, y además en la cuenta si hay una abierta.
//
// Lo local no es una copia de seguridad: es el progreso de quien todavía no tiene
// cuenta, y la cuenta lo absorbe al crearse. Por eso se escribe primero y sin
// esperar a nadie. Si el servidor falla, el sello sigue ganado en el navegador y
// se sube la próxima vez que se abra la sesión — nunca se pierde un examen por
// culpa de la conexión.
import { addSeal, readSeals } from '../shared/seals'
import { getSession } from './account'
import { announceApiChange } from './apiChanges'
import type { Badge } from './contract'
import { mockServer } from './mockServer'

export { FINAL_SEAL } from './contract'
export type { Badge } from './contract'

// Los exámenes superados de un tomo: los de este navegador y los de la cuenta.
// Juntos, porque quien entra desde otro dispositivo tiene que ver sus sellos
// puestos aunque aquí no los haya ganado.
//
// Si el servidor no contesta se enseñan los de aquí, que son los que seguro que
// son verdad.
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

// Guarda un sello recién ganado. El del examen final es además el que da la
// insignia del tomo, pero eso lo decide el servidor al recibirlo, no la app.
export async function saveSeal(blockId: string, examId: string): Promise<void> {
  addSeal(blockId, examId)
  announceApiChange()

  if (getSession().status !== 'signedIn') return

  await mockServer.syncSeals({ [blockId]: [examId] })
  // Otra vez: la insignia ya está en la cuenta, y la estantería tiene que
  // enterarse para abrir el tomo siguiente.
  announceApiChange()
}

// Las insignias de la cuenta abierta. Sin cuenta no hay insignias: se ganan al
// sellar un tomo, pero se guardan en la cuenta.
export async function fetchBadges(): Promise<Badge[]> {
  if (getSession().status !== 'signedIn') return []
  return mockServer.badges()
}
