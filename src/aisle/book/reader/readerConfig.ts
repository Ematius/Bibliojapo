import { shuffle } from '../parts/shuffle'

// Cómo se arma el tomo abierto.
//
// Las páginas no están escritas a mano: las genera `buildVolumePages` a partir de
// las lecciones del bloque. Un tomo es un bloque del temario, y todo lo que lo
// distingue de otro son sus kana y sus palabras.
//
// El orden de las páginas es el orden de LECTURA: la 1 es la primera que se lee y
// va a la DERECHA, como en cualquier tomo japonés. En el DOM se montan al revés,
// porque es así como se consigue que la librería pase hojas en ese sentido. Ver
// el comentario de VolumeReader.
//
// Aquí no hay portada. La portada, las tapas y la encuadernación son parte del
// libro pintado sobre el que se apoyan estas hojas: el lector solo pone el papel
// que se pasa.
//
// El libro abre por la 1, que es la plana donde entra el contenido de estudio. De
// ahí en adelante se avanza arrastrando la hoja de la izquierda.
//
// El número de páginas tiene que ser PAR: la librería las muestra de dos en dos, y
// una suelta al final dejaría media plana en blanco. Sale solo, porque todo se
// construye por planas y cada plana son dos hojas.

// Qué se enseña del kana en una hoja.
//
//   intro         la portada del tomo: qué bloque es y qué trae
//   goal          las frases que se leerán al terminarlo
//   illustration  el dibujo mnemotécnico, con el kana escribiéndose encima
//   mnemonic      la historia que explica ese dibujo
//   card          el kana desnudo: forma, lectura y sonido
//   trace         la pauta para escribirlo a mano
//   word          una palabra real, con el kana estudiado destacado dentro
//   gap           esa misma palabra en romaji, con el kana a rellenar
//   reading       la palabra en romaji, con la lectura del kana destacada
//   pick          esa misma palabra escrita, con el kana a elegir entre varios
//   match         emparejar el sonido del kana con su forma, arrastrando
//   matchWord     lo mismo con una palabra: los demás kana vienen ya puestos
//   prompt        la palabra sin escribirla: solo lo que significa y cómo suena
//   promptAudio   lo mismo, pero sin el color: solo queda el sonido
//   build         la palabra entera por construir, con todos los huecos vacíos
//   drill         dos preguntas en una hoja: reconstruir la palabra con tarjetas
//                 y, debajo, escribir su lectura completa en rōmaji
//
// `word`/`gap` y `reading`/`pick` son el mismo ejercicio en las dos direcciones:
// de la escritura al sonido y del sonido a la escritura.
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
  | 'promptAudio'
  | 'build'
  | 'drill'

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

// Una plana: las dos hojas que se ven a la vez, sin `id` ni `folio`. Esos los
// pone quien la coloca en el libro, porque dónde cae depende de cuántas lecciones
// vayan delante y de si es la primera vez que sale o un repaso.
export interface Spread {
  right: Omit<ReaderPage, 'id' | 'folio'>
  left: Omit<ReaderPage, 'id' | 'folio'>
}

// Una lección lista para montar. `Lesson`, en el temario, trae la palabra
// opcional —el plan del bloque va por delante de lo que está decidido—; aquí ya
// no puede faltar, y filtrar las que no lo están es cosa de quien llama.
export interface ReadyLesson {
  kanaId: string
  wordId: string
}

// Las ocho planas con las que se enseña UN kana, en orden de lectura.
//
// Es una función y no una lista escrita a mano porque el tomo repite exactamente
// esta secuencia para cada kana del bloque. Antes eran dieciséis páginas con el
// kana y la palabra puestos a mano en cada una —treinta y seis veces «a» y
// «aoi»—, así que añadir el segundo kana era copiarlas enteras y acordarse de
// cambiar los dos ids en todas. Ahora el temario dice qué kana va con qué palabra
// y las páginas salen de ahí.
//
// Los ejemplos de los comentarios son de あ con あおい, que es la lección con la
// que se construyó la secuencia. Valen igual para cualquier otra.
export function kanaSpreads(kanaId: string, wordId: string): Spread[] {
  return [
    // Primera plana: el ejercicio 1. La mnemotecnia y el dibujo que la sostiene.
    {
      right: { kanaId, title: 'Ejercicio mnemotécnico', shows: 'mnemonic' },
      left: { kanaId, title: 'Imagen mnemotécnica', shows: 'illustration' },
    },

    // Segunda plana: el ejercicio 2 del temario. La derecha se lee primero —el
    // kana, su lectura y su sonido—; la izquierda es donde se escribe. Ver y oír
    // antes de copiar, no al revés.
    {
      right: { kanaId, title: 'Ver y escuchar', shows: 'card' },
      left: { kanaId, title: 'Pauta de escritura', shows: 'trace' },
    },

    // Tercera plana: el ejercicio 3, el de reconocer. La derecha enseña el kana
    // dentro de una palabra de verdad y la izquierda la pide de vuelta, en rōmaji
    // y con el hueco.
    //
    // La palabra adelanta vocabulario que todavía no toca —de あおい solo se conoce
    // la あ— y es a propósito: reconocer un carácter suelto no demuestra gran cosa,
    // y encontrarlo dentro de una palabra sí.
    {
      right: { kanaId, wordId, title: 'Hiragana', shows: 'word' },
      left: { kanaId, wordId, title: 'Escribe en rōmaji', shows: 'gap' },
    },

    // Cuarta plana: el ejercicio 4, el reconocimiento del revés. Misma palabra que
    // la plana anterior, y es a propósito: lo que cambia es la dirección, no el
    // vocabulario, y con una palabra nueva no se sabría si lo que cuesta es el kana
    // o la palabra.
    //
    // La derecha da el enunciado —la palabra en rōmaji, sonando—; la izquierda es
    // donde se contesta eligiendo el kana. Oír antes de escribir, igual que en la
    // segunda plana.
    {
      right: { kanaId, wordId, title: 'Rōmaji', shows: 'reading' },
      left: { kanaId, wordId, title: 'Elige el hiragana', shows: 'pick' },
    },

    // Quinta plana: el ejercicio 5, el de emparejar, dos veces y con el listón más
    // alto en la segunda. La derecha empareja el sonido del kana con su carácter;
    // la izquierda empareja la palabra entera: pone «azul», おい ya están puestos y
    // hay que colocar la あ en su sitio.
    //
    // La izquierda enseña el SIGNIFICADO y no la lectura a propósito. Con «aoi»
    // escrito al lado de おい, la あ que falta se deduce leyendo —y en la hoja
    // anterior ya se ha visto que あ es «a»—, así que el ejercicio se resolvería sin
    // recordar nada. Con «azul» hay que saber cómo suena la palabra, y el botón de
    // escuchar pasa a hacer falta.
    //
    // Es el mismo ejercicio, y el salto entre las dos hojas es el que de verdad
    // importa: reconocer un sonido suelto no es leer, y encontrar qué parte de una
    // palabra le corresponde sí.
    {
      right: { kanaId, wordId, title: 'Une el sonido', shows: 'match' },
      left: { kanaId, wordId, title: 'Completa la palabra', shows: 'matchWord' },
    },

    // Sexta plana: el ejercicio 7, la palabra entera por primera vez. La derecha es
    // el enunciado y no lleva ni una letra —la representación de la palabra y su
    // sonido—; la izquierda son los huecos y las tarjetas.
    //
    // Se piden todos sus kana y no solo el estudiado porque es la cuarta vez que
    // sale la palabra en la lección: ya se ha visto escrita, leída, completada y
    // emparejada.
    //
    // El enunciado va sin texto a propósito. Con «azul» escrito se resolvería
    // recordando una traducción y con `aoi` leyendo; un color y un sonido no se
    // pueden leer.
    {
      right: { wordId, title: 'Escucha', shows: 'prompt' },
      left: { kanaId, wordId, title: 'Escribe la palabra', shows: 'build' },
    },

    // Séptima plana: el ejercicio 8, la palabra sin pistas por segunda vez, y ahora
    // con las dos comprobaciones en la misma hoja. La derecha repite el enunciado
    // de la plana anterior —la representación y el sonido, sin ninguna letra—; la
    // izquierda junta reconstruir la palabra con tarjetas y, debajo, escribir su
    // lectura completa. Ver `WordDrill`.
    {
      right: { wordId, title: 'Escucha', shows: 'prompt' },
      left: { kanaId, wordId, title: 'Escribe y lee', shows: 'drill' },
    },

    // Octava plana: el ejercicio 9, el mismo peldaño sin la imagen. La derecha
    // retira la representación visual —solo queda el sonido, que sin nada que mirar
    // deja de poder sustituir al oído—; la izquierda repite la misma hoja compuesta
    // que la plana anterior.
    {
      right: { wordId, title: 'Escucha', shows: 'promptAudio' },
      left: { kanaId, wordId, title: 'Escribe y lee', shows: 'drill' },
    },
  ]
}

// Una plana ya colocada en el libro: sus dos hojas con su id y su folio. El folio
// que se recibe es el de la derecha, que es la que se lee primero.
function placeSpread(spread: Spread, key: string, rightFolio: number): ReaderPage[] {
  return [
    { ...spread.right, id: `${key}-right`, folio: String(rightFolio) },
    { ...spread.left, id: `${key}-left`, folio: String(rightFolio + 1) },
  ]
}

// El tomo entero: las planas de cada lección, seguidas y numeradas de corrido, y
// el repaso al final.
//
// Esto es lo que hace que el segundo libro no haya que escribirlo. Un tomo es su
// lista de lecciones y nada más: con dos lecciones salen dieciséis páginas de
// estudio, con seis salen cuarenta y ocho, y en ningún caso hay que tocar el
// lector ni este archivo.
// Lo que no se repasa nunca: presenta, pero no comprueba nada, así que volver a
// verlo no diría si el kana se sabe.
const NOT_REVIEWABLE: PageContent[] = ['intro', 'mnemonic']

// La plana con la que abre cualquier tomo: de qué bloque es y a dónde lleva.
//
// No lleva ni kana ni palabra porque no habla de ninguno en concreto: habla del
// bloque entero, y el bloque lo sabe el lector, que es quien tiene el `blockId`.
// Por eso es la única plana del libro que no referencia contenido.
function introSpread(): Spread {
  // La derecha va SIN encabezado: su título es el del bloque, y lo pone la propia
  // hoja en grande. Dos encabezados seguidos diciendo casi lo mismo sobraría.
  return {
    right: { shows: 'intro' },
    left: { title: 'Al terminarlo', shows: 'goal' },
  }
}

export function buildVolumePages(lessons: ReadyLesson[]): ReaderPage[] {
  const spreads = [
    introSpread(),
    ...lessons.flatMap((lesson) => kanaSpreads(lesson.kanaId, lesson.wordId)),
  ]
  const pages = spreads.flatMap((spread, index) => placeSpread(spread, `s${index}`, index * 2 + 1))

  // La reserva del ejercicio 10 sale de las planas de ESTE tomo, así que un libro
  // de seis kana repasa los seis sin que haya que enumerar nada a mano.
  const reviewable = spreads.filter(
    (spread) => !NOT_REVIEWABLE.includes(spread.right.shows as PageContent),
  )

  return [...pages, ...pickReviewPages(reviewable, pages.length)]
}

// El ejercicio 10: tres planas del repaso, elegidas al azar y sin repetir entre
// sí, numeradas a partir de donde se queda el resto del libro.
//
// Se llama UNA vez por apertura del libro, no en cada render: `VolumeReader`
// guarda el resultado con `useMemo`. Así el repaso cambia de una vez a otra —que
// es lo que pide un repaso—, pero no a media lectura, que sería reordenar el
// libro con el lector dentro.
//
// El título de cada página lleva delante «Repaso: », que es cómo se entera quien
// lee de que esto ya no es la primera vez que ve el ejercicio.
export function pickReviewPages(pool: Spread[], afterFolio: number): ReaderPage[] {
  const picks = shuffle(pool).slice(0, 3)

  return picks.flatMap((spread, index) => {
    const label = (side: Spread['right']) => (side.title ? `Repaso: ${side.title}` : 'Repaso')
    const [right, left] = placeSpread(spread, `review-${index}`, afterFolio + index * 2 + 1)

    return [
      { ...right, title: label(spread.right) },
      { ...left, title: label(spread.left) },
    ]
  })
}

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
