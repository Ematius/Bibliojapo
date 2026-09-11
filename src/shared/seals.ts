// Qué mini exámenes se han superado, tomo a tomo. Persiste en localStorage, así
// que el sello sigue puesto al cerrar el libro y al volver otro día.
//
// Es el primer progreso de verdad que guarda la app, y va en local a propósito:
// «El progreso del tomo 1 se hará SIN cuenta y tiene que sobrevivir al registro»
// —ver CLAUDE.md—. No es un apaño provisional, es la pieza que la cuenta absorbe
// el día que exista. Quien abandone el registro no puede perder lo que ya hizo.
//
// Se guarda el id del KANA, no el número de página ni el de la lección: es lo
// único que no se mueve cuando el temario crezca o se reordene. Un sello dice «me
// sé あ», y eso sigue siendo verdad aunque あ cambie de sitio en el tomo.
//
// Van todos juntos en una sola clave separados por comas, y no una clave por
// sello: son media docena por tomo, leerlos es una sola lectura, y así no se
// siembra el almacenamiento del usuario de entradas sueltas.

const PREFIX = 'bof:seals:'

// Todos los accesos van envueltos, igual que en `bookmark.ts` y `journey.ts`: en
// navegación privada, con las cookies de sitio bloqueadas o con el disco lleno,
// localStorage lanza en vez de devolver null. Ante la duda se responde que no hay
// ningún sello — el examen se podrá volver a hacer, que es el peor caso
// aceptable: repetir algo que ya se sabe, nunca quedarse sin poder leer.
export function readSeals(blockId: string): Set<string> {
  try {
    const raw = window.localStorage.getItem(PREFIX + blockId) ?? ''
    return new Set(raw.split(',').filter(Boolean))
  } catch {
    return new Set()
  }
}

// Los de todos los tomos a la vez, por bloque. Es lo que se le entrega a la
// cuenta al crearla o al entrar: todo lo hecho en este navegador sin ella.
//
// Recorre las claves en vez de preguntar tomo a tomo para no tener que saber
// cuántos tomos hay: guardar sellos no es asunto del temario.
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
    // Sin almacenamiento no hay nada que entregar.
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
    // Sin almacenamiento el sello se ve igual al ganarlo, pero no sobrevive a
    // cerrar el libro. Se pierde el recuerdo, no el examen.
  }
}
