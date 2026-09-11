// El aviso de que un ejercicio se ha resuelto.
//
// Hasta ahora un acierto se lo quedaba el ejercicio para sí: ponía una clase en el
// DOM, escribía su «eso es» y ahí acababa. Ver «Progresión y cuentas» en
// CLAUDE.md — sin este aviso no hay de dónde sacar el progreso, y el primero que
// lo necesita es el sello del mini examen.
//
// ── Por qué un evento del DOM y no estado de React ─────────────────────────
// Por lo mismo que los ejercicios no son hooks: page-flip clona las páginas, así
// que viven sobre nodos que React ya no gobierna. Un evento nativo que burbujea es
// el único canal que sale igual de bien desde un clon, y de paso no obliga a
// decidir todavía NADA sobre cómo se guardará el progreso el día que haya cuentas
// y backend. Quien quiera enterarse, escucha; quien no, no se entera. Es lo más
// pequeño que desbloquea el sello sin hipotecar la fase 4.
//
// ── Qué NO lleva dentro ────────────────────────────────────────────────────
// Ni id, ni tipo de ejercicio, ni puntuación. Quien escucha ya sabe quién se lo
// mandó: el evento burbujea desde la raíz del ejercicio, así que `event.target` es
// esa raíz y con eso basta para contar sin repetir. Inventar aquí un vocabulario
// de ejercicios sería decidir por adelantado cómo se mide el progreso, y eso
// todavía no toca.
export const SOLVED_EVENT = 'bof:solved'

// Se dispara UNA vez por ejercicio: quien lo llama se guarda de no repetirlo. Un
// ejercicio resuelto no se «desresuelve», así que el segundo aviso solo podría
// contar de más.
export function announceSolved(root: HTMLElement): void {
  root.dispatchEvent(new CustomEvent(SOLVED_EVENT, { bubbles: true }))
}
