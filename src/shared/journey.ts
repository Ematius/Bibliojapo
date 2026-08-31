// Recuerda si el usuario ya ha hecho el recorrido de entrada —valle, puerta,
// vestíbulo— para no obligarle a repetirlo en cada visita. A partir de la
// segunda vez se entra directamente frente a la puerta.
//
// Persiste en localStorage, así que sobrevive a cerrar el navegador. La única
// forma de volver a ver el valle es «Inicio» en la barra, que lleva su propia
// marca de navegación en lugar de borrar esto: quien quiere revisitar la
// portada no está pidiendo repetir el onboarding entero la próxima vez.

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
