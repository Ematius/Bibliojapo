// La apertura no es una animación calculada sino cinco fotogramas pintados que se
// encadenan: un libro al abrirse dobla las tapas, arquea el bloque de hojas y cambia de
// sombra a la vez, y eso no sale de rotar planos.

// En orden de apertura. El último no se va: es el libro abierto sobre el que se lee.
export const OPENING_FRAMES = [
  '/images/hallways/books/libro-abierto-10.webp',
  '/images/hallways/books/libro-abierto-25.webp',
  '/images/hallways/books/libro-abierto-50.webp',
  '/images/hallways/books/libro-abierto-75.webp',
  '/images/hallways/books/libro-abierto-100.webp',
]

// La del fotograma FINAL (1448 × 1086), que es el único que se queda fijo en pantalla. Los
// cinco vienen en el mismo lienzo y se ajustan con `contain`: que el libro se vea estrecho
// al principio es cosa del dibujo, que ocupa menos lienzo.
export const OPEN_FRAME_RATIO = 1448 / 1086

// El hueco de papel dentro del fotograma final, en fracciones de la imagen.
//
// En este dibujo las páginas NO son rectángulos: hacia el lomo el papel se hunde. Las hojas
// del lector son rectas, así que el hueco es el rectángulo que cabe DENTRO de las dos
// páginas —arriba manda el lomo, abajo el canto—; pasarse sacaría la esquina de la hoja por
// encima del lomo, sobre el fondo del pasillo.
//
// Va además unos píxeles METIDO para que asome siempre el papel dibujado y las dos capas no
// se corten entre sí.
//
// Centrado en el LOMO (x 722) y no en el dibujo: page-flip pone las dos hojas del mismo
// ancho, así que el pliegue cae siempre en el centro del hueco y tiene que caer sobre el
// lomo pintado.
export const PAPER_INSET = {
  left: 215 / 1448,
  top: 236 / 1086,
  width: 1014 / 1448,
  height: 567 / 1086,
}

export const OPENING = {
  // Alto del libro abierto, en fracción del stage. Sale bastante mayor que `focusHeight`:
  // al abrirse el libro gana cuerpo y el hueco rectangular se queda en la mitad del lienzo.
  // El tope es la pantalla — subiéndolo mucho más, la encuadernación empieza a cortarse.
  // No es el libro lo que mide esto sino su LIENZO, y el libro pintado ocupa bastante menos,
  // así que apurar aquí es lo único que lo agranda: en un móvil de lado no hay otro sitio de
  // donde sacar tamaño, porque el libro es 1,33 de ancho y la pantalla 2,22.
  height: 0.98,
  // Alto mínimo del PAPEL, en píxeles, por debajo del cual un ejercicio no cabe: el examen
  // parte la hoja en dos pruebas, y cada una necesita título, botón y cuatro tarjetas con el
  // kana legible. Va en píxeles y no en fracción porque es lo que pide un ojo, no la pantalla.
  //
  // En un móvil de lado el papel se queda en 210 px y el contenido se monta encima de sí
  // mismo. Para darle alto hay que agrandar el LIBRO, aunque sus tapas se salgan por arriba y
  // por abajo — es acercarse a leer, no un fallo de encuadre.
  minPaperHeight: 340,
  // Cinco fundidos seguidos son un segundo: el gesto de abrir un libro entero, no cinco
  // pasos que haya que mirar de uno en uno.
  frameSeconds: 0.2,
  // Sin curva: los fotogramas ya traen dentro el frenado, y acelerar el fundido lo pisaría.
  ease: 'none',
}

export interface OpenBookLayout {
  width: number
  height: number
  // Si el libro entra de ancho en la ventana. Cuando no, no se abre: se pide girar la
  // pantalla. Ver `RotateNotice`.
  fits: boolean
  paper: { left: number; top: number; width: number; height: number }
}

// Vive aquí y no en el componente porque la usan dos —el que pinta el libro y el que coloca
// las hojas dentro— y tienen que salir del mismo sitio o no encajan.
export function openBookLayout(viewHeight: number, viewWidth: number): OpenBookLayout {
  // El ancho que pediría el libro si solo mandara el alto de la ventana, antes de que nada lo
  // recorte. Es lo único que decide si hace falta pedir que giren la pantalla: calculado
  // DESPUÉS del recorte de más abajo, el ancho real queda siempre por debajo de `viewWidth`
  // —el propio recorte lo garantiza— y la pregunta se contestaría sí siempre.
  const naturalWidth = OPENING.height * viewHeight * OPEN_FRAME_RATIO

  const byCanvas = OPENING.height * viewHeight
  // Solo crece si el papel se queda corto, así que en una pantalla holgada esto no actúa y el
  // libro se sigue viendo entero.
  const needed =
    PAPER_INSET.height * byCanvas >= OPENING.minPaperHeight
      ? byCanvas
      : OPENING.minPaperHeight / PAPER_INSET.height

  // Solo manda el ancho: el libro puede pasar de alto de la ventana y recortarse por arriba y
  // por abajo. Es lo que da papel legible en un móvil de lado; si se vuelve a topar con el
  // alto, el papel baja a ~200 px y los ejercicios se montan unos sobre otros.
  const height = Math.min(needed, viewWidth / OPEN_FRAME_RATIO)
  const width = height * OPEN_FRAME_RATIO

  return {
    width,
    height,
    fits: naturalWidth <= viewWidth,
    paper: {
      left: PAPER_INSET.left * width,
      top: PAPER_INSET.top * height,
      width: PAPER_INSET.width * width,
      height: PAPER_INSET.height * height,
    },
  }
}
