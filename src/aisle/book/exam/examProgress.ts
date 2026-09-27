// Qué frases del examen final ya se enviaron en el intento en curso, para que salir
// del tomo y volver a entrar no obligue a repetirlas — la misma idea que
// `shared/bookmark.ts`, pero por frase y no por página.
const PREFIX = 'bibliojapo:examProgress:'

export type ExamProgress = Record<string, boolean>

// Todos los accesos van envueltos, igual que en `bookmark.ts`: sin almacenamiento,
// el examen se pierde al salir, que es el peor caso de siempre.
export function readExamProgress(blockId: string): ExamProgress {
  try {
    const raw = window.localStorage.getItem(PREFIX + blockId)
    return raw ? (JSON.parse(raw) as ExamProgress) : {}
  } catch {
    return {}
  }
}

export function writeExamProgress(blockId: string, sentenceId: string, correct: boolean): void {
  try {
    const progress = readExamProgress(blockId)
    progress[sentenceId] = correct
    window.localStorage.setItem(PREFIX + blockId, JSON.stringify(progress))
  } catch {
    // Sin almacenamiento no hay nada que guardar.
  }
}

// Al empezar un intento nuevo —reintentar tras suspender, o aprobar del todo—: lo
// guardado aquí es solo del intento en curso, y arrastrarlo al siguiente puntuaría
// frases que ese intento todavía no ha hecho.
export function clearExamProgress(blockId: string): void {
  try {
    window.localStorage.removeItem(PREFIX + blockId)
  } catch {
    // Nada que limpiar si nunca llegó a guardarse.
  }
}
