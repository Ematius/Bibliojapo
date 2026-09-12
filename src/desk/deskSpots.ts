// Dónde se posa cada objeto sobre la mesa, medido una sola vez.
//
// Es el hermano de `shelfGrid.ts`: allí se mide un mueble con baldas para que un
// tomo no lleve su sitio escrito a mano, y aquí se mide una tapa de mesa para que
// no lo lleve un objeto. La diferencia es que aquí no hay rejilla que repartir —
// son tres cosas puestas a conciencia, no una colección que crece—, así que cada
// una dice su sitio y basta.
//
// ── DE DÓNDE SALEN ESTOS NÚMEROS ───────────────────────────────────────────
// De medir `escritorio.png` (1672 × 941), no de ajustar a ojo. Los dos bordes de
// la tapa salen de su perfil de luminancia: buscando en cada columna el mayor
// salto entre la media de las cinco filas de encima y la de las cinco de debajo,
// el borde de atrás aparece en y 470 en cinco columnas distintas y el canto de
// delante en y 841 en las cinco. Los estorbos de los lados —el tintero con su
// pluma y el paño doblado— se leen del dibujo.
//
// Todo va en fracciones [0, 1] de la ILUSTRACIÓN, no de la ventana, que es lo que
// mantiene cada objeto sobre su trozo de madera cuando la escena se recorta. Ver
// `DeskScene.tsx` y `styles/_stage.scss`.
// ───────────────────────────────────────────────────────────────────────────

// La tapa: hasta dónde llega la madera donde se puede dejar algo.
//
// No se usa para colocar —cada objeto trae su sitio— sino para saber si un sitio
// es razonable: fuera de esto, el objeto se sale de la mesa.
export const DESK_SURFACE = {
  // Borde de atrás, donde la madera se encuentra con la pared.
  backY: 0.5,
  // Canto de delante, donde acaba la tapa y empieza el faldón tallado.
  frontY: 0.894,
  // A los lados no manda el borde de la mesa, que se sale del dibujo por los dos
  // extremos, sino lo que ya hay puesto: el tintero ocupa hasta 0,13 y el paño
  // empieza en 0,88. Un objeto entre medias no pisa nada pintado.
  left: 0.14,
  right: 0.86,
} as const

// El sitio de un objeto sobre la mesa.
export interface DeskSpot {
  // Centro del objeto a lo ancho. Es el centro y no el borde para que al
  // cambiarle el tamaño crezca hacia los dos lados y no se desplace.
  x: number
  // Donde el objeto TOCA la madera, o sea su borde de abajo. Anclar por la base
  // es lo que lo mantiene apoyado al cambiarle el tamaño, igual que un tomo en su
  // balda.
  //
  // Ojo: los recortes traen algo de margen transparente por debajo —un 5 % en la
  // caja y en el carné—, así que el objeto se apoya un pelo más arriba de lo que
  // dice este número. Es poco y constante; se afina mirando, con `SHOW_DESK_SPOTS`.
  baseY: number
  // Ancho, en fracción del ancho de la escena. El alto no se indica: sale de la
  // proporción del recorte, como el grosor del lomo de un tomo sale de su render.
  width: number
}

// Los tres objetos, y cada uno es una puerta. El reparto no es simétrico a
// propósito: la luz entra por la ventana de la izquierda, así que lo que más se
// usa —la hoja— se pone donde da la luz y con el mayor tamaño, y lo demás se
// reparte alrededor sin taparla.
//
// Ninguno llega a los bordes de `DESK_SURFACE`: el que se pega a un borde es el
// primero que se pierde cuando la escena se recorta en una pantalla estrecha.
export const DESK_SPOTS = {
  // La hoja de estudio, que abre las chuletas. La protagonista: en el centro,
  // delante, y la más grande de las tres.
  sheet: { x: 0.45, baseY: 0.87, width: 0.2 },
  // La caja de los juegos, a la derecha y un poco más al fondo, para que no
  // compita con la hoja.
  box: { x: 0.75, baseY: 0.82, width: 0.12 },
  // El carné, a la izquierda, cerca del tintero. Es el más pequeño porque es el
  // que menos se abre: lo que cuenta de él son los sellos, no el trámite.
  card: { x: 0.2, baseY: 0.75, width: 0.13 },
} as const satisfies Record<string, DeskSpot>

// Pinta el sitio de cada objeto para poder ajustarlo. Dejar en `false`: es una
// ayuda de taller, no algo que deba verse en la mesa. Igual que `SHOW_DOOR_ZONE`
// en la portada.
export const SHOW_DESK_SPOTS = false
