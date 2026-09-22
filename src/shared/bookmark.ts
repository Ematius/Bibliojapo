// Por dónde se quedó quien lee, tomo a tomo, en localStorage.
//
// Se guarda el FOLIO de la hoja DERECHA, no el índice del DOM: ahí las hojas van al
// revés —ver `VolumeReader`— y ese orden es un apaño de la librería. Siempre la
// derecha, que es por donde se abre la plana.
//
// Es posicional, así que envejece: una lección nueva metida DELANTE mueve el folio.
// Se asume — el peor caso es reabrir unas planas más atrás, no perder nada.

const PREFIX = 'bibliojapo:bookmark:'

// Todos los accesos van envueltos: en navegación privada o con el disco lleno,
// localStorage lanza en vez de devolver null. Ante la duda, sin marcador.
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
    // Sin almacenamiento el tomo abre siempre por la primera plana.
  }
}
