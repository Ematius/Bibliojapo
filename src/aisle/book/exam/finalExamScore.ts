// La nota de cada bloque del examen final, en localStorage: sin esto, reabrir un tomo ya
// sellado no tiene de dónde sacar el desglose real y solo puede enseñar un aviso genérico.
const PREFIX = 'bibliojapo:examScore:'

export type FinalExamScore = Record<1 | 2 | 3, number>

export function readFinalExamScore(blockId: string): FinalExamScore | null {
  try {
    const raw = window.localStorage.getItem(PREFIX + blockId)
    if (!raw) return null

    const parsed = JSON.parse(raw) as FinalExamScore
    const valid = ([1, 2, 3] as const).every((block) => typeof parsed[block] === 'number')
    return valid ? parsed : null
  } catch {
    return null
  }
}

export function saveFinalExamScore(blockId: string, score: FinalExamScore): void {
  try {
    window.localStorage.setItem(PREFIX + blockId, JSON.stringify(score))
  } catch {
    // Sin almacenamiento, la próxima apertura no encuentra desglose y cae al aviso genérico.
  }
}
