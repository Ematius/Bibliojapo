// Por dónde se quedó quien lee, tomo a tomo. Persiste en localStorage, así que
// sobrevive tanto a cerrar el libro como a cerrar el navegador.
//
// Va por bloque —un tomo ES un bloque— porque cada uno se lee por su cuenta: el
// marcador del tomo 1 no dice nada del 2.
//
// ── Qué se guarda ──────────────────────────────────────────────────────────
// El FOLIO de la hoja derecha de la plana, que es el número que se ve impreso en
// la esquina. No el índice del DOM: ahí las hojas van al revés —ver el comentario
// de `VolumeReader`— y ese orden es un apaño para que la librería pase página
// hacia el lado japonés, no algo que deba acabar escrito en el disco de nadie.
//
// Siempre la derecha, que es la que se lee primero, porque el libro se abre por
// planas y no por hojas sueltas: guardar la izquierda significaría reabrir en
// mitad de una plana que ya estaba entera delante.
//
// ── El límite que tiene ────────────────────────────────────────────────────
// Es posicional, y por tanto envejece: cuando el tomo crezca con una lección
// nueva metida DELANTE, ese mismo folio ya no será la misma página. Se asume a
// propósito. El caso normal es reabrir el tomo que se acaba de cerrar, y el peor
// caso es aparecer unas planas más atrás de lo esperado, no perder nada. El día
// que estorbe, se arregla aquí guardando también qué kana era.

const PREFIX = 'bof:bookmark:'

// Todos los accesos van envueltos: en navegación privada, con las cookies de
// sitio bloqueadas o con el disco lleno, localStorage lanza en vez de devolver
// null. Ante la duda se responde que no hay marcador, que es abrir por la primera
// plana — nunca deja a nadie sin poder leer.
export function readBookmark(blockId: string): number | null {
  try {
    const folio = Number(window.localStorage.getItem(PREFIX + blockId))
    return Number.isInteger(folio) && folio > 0 ? folio : null
  } catch {
    return null
  }
}

export function writeBookmark(blockId: string, folio: number): void {
  try {
    window.localStorage.setItem(PREFIX + blockId, String(folio))
  } catch {
    // Sin almacenamiento el tomo abre siempre por la primera plana. Es el peor
    // caso aceptable: pasar hojas de más, no quedarse fuera del libro.
  }
}
