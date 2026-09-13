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
//   finalNotice       la hoja que anuncia el repaso completo
//   finalScope        lo que entra en ese repaso: los kana del tomo
//   finalReviewNotice la hoja que anuncia el repaso final
//   finalReviewScope  lo que entra en ese repaso: las palabras del tomo
//   examRules         las normas del examen final de frases, el que sella
//   examScope         los tres bloques del examen, de un vistazo
//   examSentence      una frase por construir con tarjetas, con una pista según el bloque
//   examResults       la nota y las frases falladas de un bloque, al terminarlo
//   examReveal        la nota final del tomo, y el sello si se aprueba
//   examGift          el sobre del regalo, y la chuleta del tomo que sale de dentro
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
  | 'finalReviewNotice'
  | 'finalReviewScope'
  | 'examRules'
  | 'examScope'
  | 'examSentence'
  | 'examResults'
  | 'examReveal'
  | 'examGift'

// La pista de una frase del examen: rōmaji, significado, o solo el sonido. Cambia con el
// bloque — ver `finalSentenceExamSpreads`.
export type ExamCue = 'romaji' | 'meaning' | 'audio'

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
  //
  // El examen final de FRASES no lo usa: no sella por contar aciertos a la primera —ver
  // `finalExam.ts`—, así que sus hojas no llevan `exam` ni `seal`.
  exam?: string
  // Hay UNA en todo el tomo: la última del examen final. El examen de cada lección no sella.
  seal?: boolean
  // Solo las hojas de `examSentence`/`examResults`: a qué de los tres bloques pertenecen.
  examBlock?: 1 | 2 | 3
  // Solo `examSentence`: qué frase muestra y con qué pista.
  sentenceId?: string
  cue?: ExamCue
  // Su posición dentro del bloque (empieza en 1), para el «Frase X de 15» de la hoja.
  sentenceIndex?: number
  sentenceTotal?: number
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

export function buildVolumePages(
  lessons: ReadyLesson[],
  wordIds: string[],
  sentenceIds: string[],
): ReaderPage[] {
  const spreads = [
    introSpread(),
    ...lessons.flatMap((lesson) => kanaSpreads(lesson.kanaId, lesson.wordId, lesson.wordId2)),
    ...completeReviewSpreads(lessons),
    ...finalReviewSpreads(lessons, wordIds),
    ...finalSentenceExamSpreads(sentenceIds),
  ]

  return spreads.flatMap((spread, index) => placeSpread(spread, `s${index}`, index * 2 + 1))
}

// Los tres bloques del examen final, en el orden en que se hacen: cada uno da las 15
// frases del tomo en un orden distinto y con una pista distinta, para que aprobar no sea
// memorizar la POSICIÓN de una frase. El 3 se sortea aquí y no antes —`VolumeReader` llama
// a esta función de nuevo en cada intento, ver `examAttempt`—, así que un reintento trae un
// orden nuevo.
const EXAM_BLOCKS: { block: 1 | 2 | 3; cue: ExamCue; title: string }[] = [
  { block: 1, cue: 'romaji', title: 'Bloque 1 · rōmaji' },
  { block: 2, cue: 'meaning', title: 'Bloque 2 · español' },
  { block: 3, cue: 'audio', title: 'Bloque 3 · audio' },
]

// El examen final de FRASES: el que de verdad sella el tomo. Va detrás del repaso de
// vocabulario porque examina lo último de la cadena kana → palabra → frase, y solo tiene
// sentido una vez que las dos anteriores están hechas.
//
// NO se corrige aquí ni en el navegador mientras se hace: `finalExam.ts` puntúa en
// silencio y decide él mismo cuándo se pasa de hoja, así que estas planas no llevan ni
// `exam` ni `seal` — ese conteo es de `examSeal.ts`, y este examen aprueba con un umbral,
// no con acertar todo a la primera.
//
// Dos frases por plana, una en cada hoja: con un número impar, la última se queda sola y
// comparte plana con la hoja de resultados del bloque —`finalExam.ts` sabe leer esto
// mirando cuántas frases hay en el grupo—. Sin las 15 frases no hay examen: examinar a
// medio escribir el tomo sería preguntar por lo que todavía no se ha enseñado.
function finalSentenceExamSpreads(sentenceIds: string[]): Spread[] {
  if (sentenceIds.length === 0) return []

  const orders: Record<1 | 2 | 3, string[]> = {
    1: sentenceIds,
    2: [...sentenceIds].reverse(),
    3: shuffle(sentenceIds),
  }

  const rules: Spread = {
    right: { title: 'Examen final', shows: 'examRules' },
    left: { title: 'Cómo se examina', shows: 'examScope' },
  }

  const blockSpreads = EXAM_BLOCKS.flatMap(({ block, cue, title }) => {
    const order = orders[block]
    const total = order.length

    const sentenceSpreads: Spread[] = []
    for (let i = 0; i < order.length; i += 2) {
      const rightId = order[i]
      const leftId: string | undefined = order[i + 1]

      sentenceSpreads.push({
        right: {
          title,
          shows: 'examSentence',
          examBlock: block,
          cue,
          sentenceId: rightId,
          sentenceIndex: i + 1,
          sentenceTotal: total,
        },
        left: leftId
          ? {
              title,
              shows: 'examSentence',
              examBlock: block,
              cue,
              sentenceId: leftId,
              sentenceIndex: i + 2,
              sentenceTotal: total,
            }
          : { title: `${title} · Resultados`, shows: 'examResults', examBlock: block },
      })
    }

    // Con un número PAR de frases no queda hueco libre en la última pareja: los
    // resultados piden su propia plana, sola a la derecha —solo UNA hoja lleva
    // `examResults`, o `finalExam.ts` encontraría dos—. (Hoy las 15 frases del tomo
    // dejan esto sin usar, pero un bloque futuro puede no ser impar.)
    const resultsSpread: Spread | null =
      total % 2 === 0
        ? {
            right: { title: `${title} · Resultados`, shows: 'examResults', examBlock: block },
            left: { title },
          }
        : null

    return resultsSpread ? [...sentenceSpreads, resultsSpread] : sentenceSpreads
  })

  // La plana final: la nota a la derecha y el premio a la izquierda, en la MISMA plana y
  // no en la siguiente. Las dos hojas se ven a la vez, así que el sello cayendo sobre una
  // es lo que enciende el sobre de la otra —ver `finalExam.ts`—; separadas, encenderlo
  // sería iluminar algo que no está en pantalla.
  //
  // Las dos nacen casi vacías: `finalExam.ts` rellena la nota al terminar el tercer
  // bloque —o de golpe si el tomo ya estaba sellado de antes—, y `giftOpening.ts` abre el
  // sobre cuando se le pide.
  const reveal: Spread = {
    right: { title: 'Nota final del tomo', shows: 'examReveal' },
    left: { title: 'Regalo del tomo', shows: 'examGift' },
  }

  return [rules, ...blockSpreads, reveal]
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

// Una plana por CADA palabra que el bloque promete, no solo por las que ya haya usado algún
// ejercicio: es la sección que arregla el fallo de raíz. え y は nunca son la palabra de una
// hoja de lección —enseñan un kana que ya es toda la palabra, y no hay «dentro de otra
// palabra» donde meterlas—, así que sin esto no las pedía nunca nadie.
//
// Reutiliza el mismo par de hojas con el que ya se examina cada lección de una segunda
// palabra —escuchar a la derecha, reconstruir a ciegas a la izquierda—, sin pista ninguna:
// aquí no hay lectura ni kana destacado, solo lo que significa y cómo suena.
//
// El `kana` que se le pasa a la reconstrucción no es el de la palabra —da igual, ninguna
// hoja lo enseña ni lo corrige, ver `KanaMatch`—: es la ÚLTIMA lección del tomo, la única
// cuya bolsa de tarjetas ya lleva los seis kana. Sin eso, el resto de la palabra podría
// reconstruirse sin distractores donde faltase alguno de los que se dieron después.
//
// Sin lecciones listas o sin palabras que repasar no hay nada que armar.
function finalReviewSpreads(lessons: ReadyLesson[], wordIds: string[]): Spread[] {
  if (lessons.length === 0 || wordIds.length === 0) return []

  const kanaId = lessons[lessons.length - 1].kanaId

  const reviews = wordIds.map<Spread>((wordId) => ({
    right: { wordId, title: 'Repaso final', shows: 'prompt' },
    left: { kanaId, wordId, title: 'Repaso final', shows: 'build' },
  }))

  return [reviewNoticeSpread(), ...reviews]
}

// El anuncio del repaso final, en su propia plana por la misma razón que el de arriba.
function reviewNoticeSpread(): Spread {
  return {
    right: { shows: 'finalReviewNotice' },
    left: { title: 'Entran todas estas', shows: 'finalReviewScope' },
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
