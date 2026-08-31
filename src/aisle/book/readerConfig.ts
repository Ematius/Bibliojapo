// Páginas del tomo abierto.
//
// El orden de este array es el orden de LECTURA: la 1 es la primera que se lee y
// va a la DERECHA, como en cualquier tomo japonés. En el DOM se montan al revés,
// porque es así como se consigue que la librería pase hojas en ese sentido. Ver
// el comentario de VolumeReader.
//
// Aquí no hay portada. La portada, las tapas y la encuadernación son parte del
// libro pintado sobre el que se apoyan estas hojas: el lector solo pone el papel
// que se pasa.
//
// El libro abre por la 1 y se queda ahí: es la plana donde entra el contenido de
// estudio, y de momento va en blanco con su folio.
//
// Las de más atrás son andamiaje: todavía no hay forma de pasar de hoja, así que
// no se llega a ellas. Se quedan puestas porque son el sitio donde irán los
// ejercicios, y porque tener varias es lo que mantiene el bloque de páginas con
// grosor. Cuando haya paso de hoja se vuelven alcanzables sin tocar nada más.
export interface ReaderPage {
  id: string
  // Número que se muestra en la esquina mientras no haya nada más que enseñar.
  folio: string
}

export const READER_PAGES: ReaderPage[] = [
  { id: 'p1', folio: '1' },
  { id: 'p2', folio: '2' },
  { id: 'p3', folio: '3' },
  { id: 'p4', folio: '4' },
]

export const READER = {
  // Duración del paso de página, en milisegundos: es lo que espera page-flip.
  flippingTimeMs: 800,
  // Opacidad máxima de la sombra que la propia librería dibuja bajo la hoja que
  // gira. Las suyas son negras, y sobre un papel tan cálido una sombra fuerte
  // agrisa la hoja entera y la deja fría respecto al resto del libro. Con este
  // valor el pliegue se sigue leyendo sin apagar el papel — es el número a mover
  // si el giro se ve plano o, al contrario, demasiado sucio.
  //
  // No se le añade ninguna sombra por CSS encima: page-flip pinta las suyas, y
  // superponer un drop-shadow al contenedor cuesta un repintado entero en cada
  // frame del giro.
  maxShadowOpacity: 0.35,
}
