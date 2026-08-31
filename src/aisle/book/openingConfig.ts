// El tomo abriéndose, y el libro abierto que queda al final.
//
// La apertura no es una animación calculada sino cuatro fotogramas pintados que
// se encadenan. Es a propósito: un libro al abrirse dobla las tapas, arquea el
// bloque de hojas y cambia de sombra a la vez, y eso no sale de rotar planos.
// Pintado ya viene resuelto, y encadenarlo cuesta cuatro fundidos.

// En orden de apertura. El último no se va: es el libro abierto sobre el que se
// lee, así que se queda de fondo mientras dura la lectura.
export const OPENING_FRAMES = [
  '/images/hallways/libro/libro-abierto-25.webp',
  '/images/hallways/libro/libro-abierto-50.webp',
  '/images/hallways/libro/libro-abierto-75.webp',
  '/images/hallways/libro/libro-abierto-100.webp',
]

// Proporción del fotograma final (1484 × 1060). Es la que manda sobre la caja,
// porque es el único que se queda fijo en pantalla. Los tres anteriores vienen
// en un lienzo algo distinto y se ajustan dentro con `contain`, que además es lo
// que hace que el libro se vea estrecho al principio y se ensanche al abrirse,
// igual que uno de verdad.
export const OPEN_FRAME_RATIO = 1484 / 1060

// Hueco de papel dentro del fotograma final, en fracciones de la imagen. Medido
// sobre el propio archivo: la página izquierda va de x 238 a 713 y la derecha de
// 763 a 1238, con el papel entre y 70 y 865.
//
// Los números de aquí van un poco METIDOS respecto a esa medida. El borde de las
// hojas pintadas es curvo y las del lector son rectas, así que se dejan unos
// píxeles de margen para que asome siempre el papel dibujado y las dos capas no
// se corten entre sí. Como los dos son del mismo crema, la costura no se ve.
export const PAPER_INSET = {
  left: 250 / 1484,
  top: 100 / 1060,
  width: 976 / 1484,
  height: 750 / 1060,
}

export const OPENING = {
  // Alto del libro abierto, en fracción del stage. Sale algo mayor que el alto
  // de la portada (`focusHeight`) porque al abrirse el libro gana cuerpo.
  height: 0.72,
  // Lo que tarda cada fundido. Cuatro seguidos son unos 800 ms: el gesto de
  // abrir un libro entero, no cuatro pasos que haya que mirar de uno en uno.
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
