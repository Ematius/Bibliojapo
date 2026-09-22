// El aviso de que un ejercicio se ha resuelto: de aquí sale el sello del examen.
//
// Un evento del DOM y no estado de React por lo mismo que los ejercicios no son hooks:
// page-flip clona las páginas, y un evento nativo que burbujea es el único canal que sale
// igual de bien desde un clon.
//
// No lleva dentro ni id, ni tipo de ejercicio, ni puntuación: el evento burbujea desde la
// raíz del ejercicio, así que `event.target` es esa raíz y con eso basta para contar sin
// repetir.
export const SOLVED_EVENT = 'bibliojapo:solved'

// Se dispara UNA vez por ejercicio: quien lo llama se guarda de no repetirlo. Un ejercicio
// resuelto no se «desresuelve», así que el segundo aviso solo podría contar de más.
export function announceSolved(root: HTMLElement): void {
  root.dispatchEvent(new CustomEvent(SOLVED_EVENT, { bubbles: true }))
}
