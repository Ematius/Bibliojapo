// Registra que el usuario ha hecho el recorrido de entrada —valle, puerta,
// vestíbulo—. Persiste en localStorage, así que sobrevive a cerrar el navegador.
//
// ── OJO: HOY NADIE LEE ESTA MARCA ──────────────────────────────────────────
// Se escribió para saltarse el valle a partir de la segunda visita, y esa
// decisión se dio marcha atrás: `LandingRoute` manda siempre a la portada, y
// quien quiera ir directo a la puerta entra por /entrada.
//
// Así que ahora mismo esto solo apunta el dato. Se deja porque el día que se
// retome el salto, los visitantes que ya hayan entrado lo tendrán apuntado; el
// lector que falta es un `isJourneyDone()` en `LandingRoute`. Si se decide que
// el valle no se salta nunca, este archivo entero y su llamada en
// `LibraryEntrance` se pueden borrar.
// ───────────────────────────────────────────────────────────────────────────

const STORAGE_KEY = 'bof:journey-done'

// Todos los accesos van envueltos: en navegación privada, con las cookies de
// sitio bloqueadas o con el disco lleno, localStorage lanza en vez de devolver
// null. Ante la duda se responde que no se ha hecho el recorrido, que es el
// camino completo y nunca deja a nadie fuera de la portada.
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
    // Sin almacenamiento el usuario verá la portada cada vez. Es el peor caso
    // aceptable: repetir un viaje bonito, no quedarse sin acceso.
  }
}
