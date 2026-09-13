import { shuffle } from '../parts/shuffle'

// Las páginas no se escriben a mano: las genera `buildVolumePages` a partir de las
// lecciones del bloque.
//
// El orden es el de LECTURA: la 1 es la primera que se lee y va a la DERECHA, como en
// cualquier tomo japonés. En el DOM se montan al revés, que es como se consigue que la
// librería pase hojas en ese sentido — ver `VolumeReader`.
//
// El número de páginas tiene que ser PAR: la librería las muestra de dos en dos, y una
// suelta al final dejaría media plana en blanco. Sale solo, porque todo se construye por
// planas.
//
// Aquí no hay portada: las tapas y la encuadernación son parte del libro pintado sobre el
// que se apoyan estas hojas.

// Qué se enseña en una hoja. Los que no se leen solos:
//
//   goal          las frases que se leerán al terminar el tomo
//   gap           la palabra en rōmaji, con el kana a rellenar
//   reading       la palabra en rōmaji, con la lectura del kana destacada
//   matchWord     emparejar dentro de una palabra: los demás kana vienen ya puestos
//   prompt        la palabra sin escribirla: solo lo que significa y cómo suena
//   build         la palabra entera por construir, con todos los huecos vacíos
//   drill         dos preguntas en una hoja: reconstruirla y escribir su lectura
//   finalNotice   la hoja que anuncia el repaso completo
//   finalScope    lo que entra en ese repaso: los kana del tomo
//
// `word`/`gap` y `reading`/`pick` son el mismo ejercicio en las dos direcciones.
export type PageContent =
  | 'intro'
  | 'goal'
  | 'illustration'
  | 'mnemonic'
  | 'card'
  | 'trace'
  | 'word'
  | 'gap'
  | 'reading'
  | 'pick'
  | 'match'
  | 'matchWord'
  | 'prompt'
  | 'build'
  | 'drill'
  | 'examKana'
  | 'examWord'
  | 'finalNotice'
  | 'finalScope'

export interface ReaderPage {
  id: string
  folio: string
  title?: string
  // Por su id en `src/content/`: la página referencia el contenido, no lo copia.
  kanaId?: string
  // Solo la piden las hojas que enseñan el kana dentro de una palabra. Va JUNTO al kana y
  // no en su lugar: lo que enseñan es la relación entre uno y otra.
  wordId?: string
  shows?: PageContent
  // A qué examen pertenece: el id del kana si es el de una lección, `final` si es el del
  // tomo. Es lo que agrupa sus pruebas para contarlas sin escribir cuántas hay.
  exam?: string
  // Hay UNA en todo el tomo: la última del examen final. El examen de cada lección no sella.
  seal?: boolean
}

// Una plana, sin `id` ni `folio`: esos los pone quien la coloca, porque dónde cae depende
// de cuántas lecciones vayan delante y de si es un repaso.
export interface Spread {
  right: Omit<ReaderPage, 'id' | 'folio'>
  left: Omit<ReaderPage, 'id' | 'folio'>
}

// `Lesson`, en el temario, trae la palabra opcional; aquí ya no puede faltar, y filtrar
// las que no están listas es cosa de quien llama.
export interface ReadyLesson {
  kanaId: string
  wordId: string
  // La segunda palabra, si la lección la tiene Y está lista. Aquí no se decide: se coloca.
  wordId2?: string
}

// Las siete planas con las que se enseña UN kana, en orden de lectura, y detrás su repaso
// y su examen. Es una función y no una lista escrita a mano porque el tomo repite esta
// secuencia para cada kana del bloque.
export function kanaSpreads(kanaId: string, wordId: string, wordId2?: string): Spread[] {
  // Las dos últimas planas piden el kana dentro de OTRA palabra. Sin segunda —o si no está
  // lista—, repiten la primera.
  const lastWordId = wordId2 ?? wordId

  const taught: Spread[] = [
    {
      right: { kanaId, title: 'Ejercicio mnemotécnico', shows: 'mnemonic' },
      left: { kanaId, title: 'Imagen mnemotécnica', shows: 'illustration' },
    },

    // La derecha se lee primero y la izquierda es donde se escribe: ver y oír antes de
    // copiar, no al revés.
    {
      right: { kanaId, title: 'Ver y escuchar', shows: 'card' },
      left: { kanaId, title: 'Pauta de escritura', shows: 'trace' },
    },

    // La palabra adelanta vocabulario que todavía no toca, y es a propósito: reconocer un
    // carácter suelto no demuestra gran cosa, y encontrarlo dentro de una palabra sí.
    {
      right: { kanaId, wordId, title: 'Hiragana', shows: 'word' },
      left: { kanaId, wordId, title: 'Escribe en rōmaji', shows: 'gap' },
    },

    // Misma palabra que la plana anterior a propósito: lo que cambia es la dirección, no el
    // vocabulario, y con una nueva no se sabría si lo que cuesta es el kana o la palabra.
    {
      right: { kanaId, wordId, title: 'Rōmaji', shows: 'reading' },
      left: { kanaId, wordId, title: 'Elige el hiragana', shows: 'pick' },
    },

    // La izquierda enseña el SIGNIFICADO y no la lectura a propósito: con «aoi» escrito al
    // lado de おい la あ que falta se deduce leyendo, y el ejercicio se resolvería sin
    // recordar nada.
    {
      right: { kanaId, wordId, title: 'Une el sonido', shows: 'match' },
      left: { kanaId, wordId, title: 'Completa la palabra', shows: 'matchWord' },
    },

    // Se piden todos sus kana y no solo el estudiado: es la cuarta vez que sale la palabra
    // en la lección. El enunciado va sin texto a propósito — con «azul» se resolvería
    // recordando una traducción y con `aoi` leyendo; un color y un sonido no se leen.
    {
      right: { wordId, title: 'Escucha', shows: 'prompt' },
      left: { kanaId, wordId, title: 'Escribe la palabra', shows: 'build' },
    },

    // Aquí cambia la palabra: se ha encontrado は dentro de はは cuatro veces y ahora hay que
    // encontrarla en はい. Eso es reconocer el carácter; repetirla por quinta vez era
    // recordar un dibujo.
    {
      right: { wordId: lastWordId, title: 'Escucha', shows: 'prompt' },
      left: { kanaId, wordId: lastWordId, title: 'Escribe y lee', shows: 'drill' },
    },
  ]

  // La lección se cierra en dos tiempos: el repaso, con la ayuda de siempre, y el examen,
  // sin ninguna.
  return [...taught, reviewSpread(taught), examSpread(kanaId, wordId)]
}

// El repaso: una de las propias planas de la lección, sorteada. Un repaso que sale igual
// todas las veces se memoriza como plana en vez de practicarse como kana. Se sortea UNA
// vez por apertura —`VolumeReader` lo guarda con `useMemo`—.
//
// Va la plana ENTERA y no dos hojas sueltas: el enunciado vive en una hoja y la respuesta
// en la de enfrente, así que partirla dejaría preguntas sin enunciado.
function reviewSpread(taught: Spread[]): Spread {
  const pool = taught.filter(
    (spread) => !NOT_REVIEWABLE.includes(spread.right.shows as PageContent),
  )
  const picked = shuffle(pool)[0] ?? taught[0]

  const label = (side: Spread['right']) => (side.title ? `Repaso: ${side.title}` : 'Repaso')

  return {
    right: { ...picked.right, title: label(picked.right) },
    left: { ...picked.left, title: label(picked.left) },
  }
}

// El examen de la lección: tres pruebas ya vistas y ninguna instrucción. Las dos hojas se
// bastan solas, que es lo que las distingue del resto del tomo —en un examen la hoja de
// enfrente es otra pregunta, no una ayuda—.
//
// Vuelve a la PRIMERA palabra de la lección: las planas de antes van con la segunda, y
// examinar de lo que se acaba de hacer sería preguntar por lo que aún se tiene en la mano.
//
// Aquí NO se sella: el sello es uno solo y está al final del tomo.
function examSpread(kanaId: string, wordId: string): Spread {
  return {
    right: { kanaId, wordId, title: 'Examen', shows: 'examKana', exam: kanaId },
    left: { kanaId, wordId, title: 'Examen', shows: 'examWord', exam: kanaId },
  }
}

// El folio que se recibe es el de la DERECHA, que es la que se lee primero.
function placeSpread(spread: Spread, key: string, rightFolio: number): ReaderPage[] {
  return [
    { ...spread.right, id: `${key}-right`, folio: String(rightFolio) },
    { ...spread.left, id: `${key}-left`, folio: String(rightFolio + 1) },
  ]
}

// Lo que no se repasa nunca: presenta, pero no comprueba nada, así que volver a verlo no
// diría si el kana se sabe.
// Lo que no se repasa nunca: presenta, pero no comprueba nada, así que volver a
const NOT_REVIEWABLE: PageContent[] = ['intro', 'mnemonic']

// La plana con la que abre cualquier tomo. No lleva ni kana ni palabra: habla del bloque
// entero, y es la única del libro que no referencia contenido.
function introSpread(): Spread {
  // Sin encabezado: su título es el del bloque, y lo pone la propia hoja en grande.
  return {
    right: { shows: 'intro' },
    left: { title: 'Ya podrás leer', shows: 'goal' },
  }
}

export function buildVolumePages(lessons: ReadyLesson[]): ReaderPage[] {
  const spreads = [
    introSpread(),
    ...lessons.flatMap((lesson) => kanaSpreads(lesson.kanaId, lesson.wordId, lesson.wordId2)),
    ...completeReviewSpreads(lessons),
  ]

  return spreads.flatMap((spread, index) => placeSpread(spread, `s${index}`, index * 2 + 1))
}

// Una plana por kana, así que el repaso crece con el bloque: repasa TODOS los kana que el
// tomo dice que enseña, uno por uno, sin la ayuda de la hoja de enfrente.
//
// YA NO SELLA. Esto era el examen final hasta que se vio el primer fallo del tomo: pasaba
// sin haber usado nunca palabras como え o は, que ningún ejercicio pide porque son de un
// solo kana. El sello se ha movido al examen final de frases, que se añade detrás de este
// repaso y del de vocabulario — ver «Cómo se arma un tomo» en CLAUDE.md cuando se actualice.
//
// Un tomo sin lecciones listas no tiene repaso.
function completeReviewSpreads(lessons: ReadyLesson[]): Spread[] {
  if (lessons.length === 0) return []

  const reviews = lessons.map<Spread>((lesson) => ({
    right: {
      kanaId: lesson.kanaId,
      wordId: lesson.wordId,
      title: 'Repaso completo',
      shows: 'examKana',
    },
    left: {
      kanaId: lesson.kanaId,
      wordId: lesson.wordId,
      title: 'Repaso completo',
      shows: 'examWord',
    },
  }))

  return [noticeSpread(), ...reviews]
}

// El anuncio va en su propia plana y no como encabezado: lo que dice no es una instrucción,
// es lo que viene.
function noticeSpread(): Spread {
  return {
    right: { shows: 'finalNotice' },
    left: { title: 'Entra todo esto', shows: 'finalScope' },
  }
}

export const READER = {
  flippingTimeMs: 800,
  // Opacidad de la sombra que page-flip dibuja bajo la hoja que gira. Las suyas son negras,
  // y sobre un papel tan cálido una sombra fuerte agrisa la hoja entera.
  //
  // No se le añade ninguna sombra por CSS encima: superponer un drop-shadow al contenedor
  // cuesta un repintado entero en cada frame del giro.
  maxShadowOpacity: 0.35,
}
