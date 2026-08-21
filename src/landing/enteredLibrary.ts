// Recuerda si el usuario ya cruzó las puertas durante esta sesión de página.
// Sirve para que al volver de un pasillo la entrada aparezca ya abierta, con los
// carteles a la vista, en vez de repetir toda la animación de las puertas.
//
// Es una variable de módulo a propósito: sobrevive a la navegación entre rutas
// (que no recarga la página) pero se olvida al recargar, así que una visita
// nueva siempre ve la entrada completa.

let entered = false

export function markLibraryEntered(): void {
  entered = true
}

export function hasEnteredLibrary(): boolean {
  return entered
}
