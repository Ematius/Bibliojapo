// El tomo abriéndose, y el libro abierto que queda al final.
//
// La apertura no es una animación calculada sino cinco fotogramas pintados que
// se encadenan. Es a propósito: un libro al abrirse dobla las tapas, arquea el
// bloque de hojas y cambia de sombra a la vez, y eso no sale de rotar planos.
// Pintado ya viene resuelto, y encadenarlo cuesta cinco fundidos.

// En orden de apertura. El último no se va: es el libro abierto sobre el que se
// lee, así que se queda de fondo mientras dura la lectura.
export const OPENING_FRAMES = [
  '/images/hallways/books/libro-abierto-10.webp',
  '/images/hallways/books/libro-abierto-25.webp',
  '/images/hallways/books/libro-abierto-50.webp',
  '/images/hallways/books/libro-abierto-75.webp',
  '/images/hallways/books/libro-abierto-100.webp',
]

// Proporción del fotograma final (1448 × 1086). Es la que manda sobre la caja,
// porque es el único que se queda fijo en pantalla. Los cinco vienen en el mismo
// lienzo y se ajustan dentro con `contain`; lo que hace que el libro se vea
// estrecho al principio y se ensanche al abrirse es el propio dibujo, que en los
// primeros ocupa menos lienzo.
export const OPEN_FRAME_RATIO = 1448 / 1086

// Hueco de papel dentro del fotograma final, en fracciones de la imagen. Medido
// sobre el propio archivo: la página izquierda va de x 195 a 692 y la derecha de
// 751 a 1255, con el lomo centrado en x 722.
//
// En este dibujo las páginas NO son rectángulos. Por fuera el papel empieza en
// y 145, pero hacia el lomo se hunde y no empieza hasta y 226; por abajo pasa de
// y 808 a 860. Las hojas del lector son rectas, así que el hueco es el rectángulo
// que cabe DENTRO de las dos páginas: arriba manda el lomo y abajo el canto.
// Pasarse de ahí sacaría la esquina de la hoja por encima del lomo, sobre el
// fondo del pasillo.
//
// Y encima va un poco METIDO respecto a esa medida —unos píxeles por cada lado—
// para que asome siempre el papel dibujado y las dos capas no se corten entre
// sí. Como los dos son del mismo crema, la costura no se ve.
//
// El hueco va centrado en el LOMO (x 722) y no en el dibujo: page-flip pone las
// dos hojas del mismo ancho, así que el pliegue entre ellas cae siempre en el
// centro del hueco, y tiene que caer sobre el lomo pintado.
export const PAPER_INSET = {
  left: 215 / 1448,
  top: 236 / 1086,
  width: 1014 / 1448,
  height: 567 / 1086,
}

export const OPENING = {
  // Alto del libro abierto, en fracción del stage. Sale bastante mayor que el
  // alto de la portada (`focusHeight`): al abrirse el libro gana cuerpo, y además
  // en este dibujo las páginas son curvas y el hueco rectangular del lector se
  // queda en la mitad del lienzo —ver `PAPER_INSET`—. Con menos, las hojas salían
  // apelmazadas.
  //
  // El tope es la pantalla: el dibujo ocupa del 10 % al 91 % del alto del lienzo,
  // y en una ventana más apaisada que la escena el stage se recorta por arriba y
  // por abajo. Subiéndolo mucho más, la encuadernación empieza a cortarse.
  height: 0.9,
  // Lo que tarda cada fundido. Cinco seguidos son un segundo: el gesto de abrir
  // un libro entero, no cinco pasos que haya que mirar de uno en uno.
  frameSeconds: 0.2,
  // Sin curva: los fotogramas ya traen dentro el frenado del movimiento, y
  // acelerar además el fundido los pisaría.
  ease: 'none',
}

export interface OpenBookLayout {
  width: number
  height: number
  paper: { left: number; top: number; width: number; height: number }
}

// Medidas del libro abierto en píxeles, a partir del alto del stage. Vive aquí y
// no en el componente porque la usan dos: el que pinta el libro y el que coloca
// las hojas dentro, y tienen que salir del mismo sitio o no encajan.
export function openBookLayout(stageHeight: number): OpenBookLayout {
  const height = OPENING.height * stageHeight
  const width = height * OPEN_FRAME_RATIO

  return {
    width,
    height,
    paper: {
      left: PAPER_INSET.left * width,
      top: PAPER_INSET.top * height,
      width: PAPER_INSET.width * width,
      height: PAPER_INSET.height * height,
    },
  }
}
