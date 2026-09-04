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
// El libro abre por la 1, que es la plana donde entra el contenido de estudio: la
// 1 lleva la ilustración mnemotécnica y la 2, a su izquierda, el texto que la
// explica. De ahí en adelante se avanza arrastrando la hoja de la izquierda.
//
// El array tiene que tener un número PAR de páginas: la librería las muestra de
// dos en dos, y una suelta al final dejaría media plana en blanco.
// Qué se enseña del kana en una hoja.
//
//   illustration  el dibujo mnemotécnico, con el kana escribiéndose encima
//   mnemonic      la historia que explica ese dibujo
//   card          el kana desnudo: forma, lectura y sonido
//   trace         la pauta para escribirlo a mano
//   word          una palabra real, con el kana estudiado destacado dentro
//   gap           esa misma palabra en romaji, con el kana a rellenar
export type PageContent = 'illustration' | 'mnemonic' | 'card' | 'trace' | 'word' | 'gap'

export interface ReaderPage {
  id: string
  // Número que se muestra en la esquina de la hoja.
  folio: string
  // Encabezado de la página. Sin él, la hoja va solo con su folio.
  title?: string
  // Qué kana se estudia, por su id en `src/content/`. La página no guarda copia
  // del dibujo ni del texto: los referencia, para que cambiar el temario no
  // obligue a tocar el lector.
  kanaId?: string
  // Qué palabra se usa, por su id en `src/content/`. Solo la piden las hojas que
  // enseñan el kana dentro de una palabra; las demás no la llevan.
  //
  // Va junto al kana y no en su lugar: esas hojas necesitan los dos, porque lo que
  // enseñan es precisamente la relación entre uno y otra.
  wordId?: string
  // Qué se enseña en esta hoja.
  shows?: PageContent
}

export const READER_PAGES: ReaderPage[] = [
  { id: 'p1', folio: '1', title: 'Ejercicio mnemotécnico', kanaId: 'a', shows: 'mnemonic' },
  { id: 'p2', folio: '2', title: 'Imagen mnemotécnica', kanaId: 'a', shows: 'illustration' },
  // Segunda plana: el ejercicio 2 del temario. La 3 queda a la derecha y se lee
  // primero —el kana, su lectura y su sonido—; la 4, a su izquierda, es donde se
  // escribe. Ver y oír antes de copiar, no al revés.
  { id: 'p3', folio: '3', title: 'Ver y escuchar', kanaId: 'a', shows: 'card' },
  { id: 'p4', folio: '4', title: 'Pauta de escritura', kanaId: 'a', shows: 'trace' },

  // Tercera plana: el ejercicio 3, el de reconocer. La 5 enseña el kana dentro de
  // una palabra de verdad y la 6 la pide de vuelta, en romaji y con el hueco.
  //
  // La palabra adelanta vocabulario que todavía no toca —de あおい solo se conoce
  // la あ— y es a propósito: reconocer un carácter suelto no demuestra gran cosa,
  // y encontrarlo dentro de una palabra sí.
  { id: 'p5', folio: '5', title: 'Hiragana', kanaId: 'a', wordId: 'aoi', shows: 'word' },
  {
    id: 'p6',
    folio: '6',
    title: 'Escribe en romaji',
    kanaId: 'a',
    wordId: 'aoi',
    shows: 'gap',
  },
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
