// Registra que el usuario ha hecho el recorrido de entrada, en localStorage.
//
// OJO: HOY NADIE LEE ESTA MARCA. Se escribió para saltarse el valle a partir de la
// segunda visita y esa decisión se dio marcha atrás. Se deja escrita para que el día
// que se retome el salto, quien ya entró lo tenga apuntado; falta un
// `isJourneyDone()` en `LandingRoute`. Si el valle no se salta nunca, este archivo y
// su llamada en `LibraryEntrance` se pueden borrar.

const STORAGE_KEY = 'bof:journey-done'

// Envuelto como en `bookmark.ts`: localStorage lanza en navegación privada. Ante la
// duda, recorrido sin hacer — el camino completo, que nunca deja a nadie fuera.
export function isJourneyDone(): boolean {
  try {
    return window.localStorage.getItem(STORAGE_KEY) === '1'
  } catch {
    return false
  }
}

export function markJourneyDone(): void {
  try {
    window.localStorage.setItem(STORAGE_KEY, '1')
  } catch {
  }
}
