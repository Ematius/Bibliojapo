// Qué mini exámenes se han superado, tomo a tomo, en localStorage. Es el progreso
// sin cuenta que la cuenta absorbe al crearse — ver CLAUDE.md.
//
// Se guarda el id del KANA, no el número de página ni el de la lección: es lo único
// que no se mueve cuando el temario crezca o se reordene.
//
// Todos juntos en una sola clave por tomo, separados por comas, para no sembrar el
// almacenamiento de entradas sueltas.

const PREFIX = 'bibliojapo:seals:'

// Envuelto como en `bookmark.ts`: localStorage lanza en navegación privada. Ante la
// duda, sin sellos — el examen se repite, que es el peor caso aceptable.
export function readSeals(blockId: string): Set<string> {
  try {
    const raw = window.localStorage.getItem(PREFIX + blockId) ?? ''
    return new Set(raw.split(',').filter(Boolean))
  } catch {
    return new Set()
  }
}

// Lo que se le entrega a la cuenta al crearla o al entrar. Recorre las claves en vez
// de preguntar tomo a tomo para no tener que saber cuántos tomos hay.
export function readAllSeals(): Record<string, string[]> {
  const all: Record<string, string[]> = {}

  try {
    for (let i = 0; i < window.localStorage.length; i++) {
      const key = window.localStorage.key(i)
      if (!key?.startsWith(PREFIX)) continue

      const blockId = key.slice(PREFIX.length)
      all[blockId] = [...readSeals(blockId)]
    }
  } catch {
  }

  return all
}

export function addSeal(blockId: string, kanaId: string): void {
  try {
    const seals = readSeals(blockId)
    if (seals.has(kanaId)) return

    seals.add(kanaId)
    window.localStorage.setItem(PREFIX + blockId, [...seals].join(','))
  } catch {
    // Sin almacenamiento el sello se ve al ganarlo pero no sobrevive al cierre.
  }
}
