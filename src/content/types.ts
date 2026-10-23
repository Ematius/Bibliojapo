// Tipos del temario. Comunes a TODOS los pasillos.

// Kana y lectura van emparejados, no en dos listas paralelas: hay ejercicios que
// necesitan saber qué trozo del rōmaji es de qué kana, y con los yōon del bloque 12
// ni siquiera coinciden los tamaños —きゃ es UN kana de dos caracteres—.
export interface WordUnit {
  kana: string
  romaji: string
}

// Qué clase de palabra es. Decide a qué formas conjugadas se le pegan: la cópula solo
// va con sustantivos y adjetivos, ～ます solo con verbos.
export type WordType =
  | 'sustantivo'
  | 'verbo-u'
  | 'verbo-ru'
  | 'verbo-irregular'
  | 'adjetivo-i'
  | 'adjetivo-na'
  | 'adverbio'
  | 'particula'
  | 'conjuncion'
  | 'expresion'
  | 'contador'
  | 'saludo'
  | 'interrogativo'
  | 'pronombre'
  | 'numero'

// Cómo conjuga un verbo. Los valores no son traducibles: son los nombres de las tres
// conjugaciones japonesas.
export type VerbGroup = 'godan' | 'ichidan' | 'irregular'

// Qué plana enseña la palabra. NO excluye el dibujo: un afijo puede tener su plana y
// además su dibujo, y solo `imagen` lo exige para publicarse.
export type WordMode =
  | 'imagen'
  | 'explicacion'
  | 'afijo'
  | 'sistema'
  | 'situacion'
  | 'escala'
  | 'interjeccion'

// EL CRITERIO: el modo decide qué plana enseña la palabra. El dibujo es un ingrediente
// de esa plana, nunca el disparador — una palabra entra en el tomo cuando su modo tiene
// plana escrita, no cuando alguien le dibujó algo.
//
// Un modo entra aquí el día que se escriba la suya. Lo leen el lector y el volcado, y
// ESCRITO DOS VECES se desincroniza: ya pasó, y el tomo 2 publicó durante un mes un
// contador enseñado con un dibujo.
export const MODES_WITH_SPREAD: readonly WordMode[] = ['imagen']

export interface Word {
  id: string
  // La palabra entera y su lectura salen de aquí: no se guardan aparte para que no
  // puedan contradecirse.
  units: WordUnit[]
  // Solo cuando la palabra lleva un signo que se ESCRIBE pero no se lee, como la coma de
  // では、また. No es un unit —no tiene lectura y no puede ir en una tarjeta—, así que
  // sin este campo la palabra se pintaría «ではまた», que no es como se escribe.
  //
  // Quitándole los signos tiene que dar los mismos kana que los units, y el generador lo
  // comprueba: es la única forma de que no puedan contradecirse.
  text?: string
  meaning: string
  type: WordType
  // Opcional porque la columna es nullable, pero el lector lo necesita: una palabra sin
  // modo no tiene plana que la enseñe y se queda fuera del tomo. Si `volume()` dejara de
  // servirlo, los tomos saldrían VACÍOS en vez de dar error.
  mode?: WordMode
  // Cómo se escribe en kanji, cuando se escribe. NO se pinta en el pasillo de hiragana:
  // a nivel N5 estas palabras se leen y escriben en kana, y el kanji se reencuentra en
  // su propio pasillo. Se guarda para que ese pasillo no tenga que recogerlo otra vez.
  kanji?: string

  // Solo los verbos. Un verbo es UNA entrada: します y しました no son palabras, son
  // formas que se generan pegando un sufijo a la raíz. Crearlas aquí llenaría el
  // temario de entradas que nadie ha escrito.
  verbGroup?: VerbGroup
  // La raíz de ～ます, de la que salen casi todas las formas.
  masuStem?: string
  // La de ～ない, SOLO cuando no se deriva: un godan la saca de su fila «a» y un ichidan
  // de quitarle る. Se escribe en los tres que se salen de la regla —ある→ない,
  // する→しない, くる→こない—, y en los demás se queda vacía.
  naiStem?: string
  // Cómo se enseña la palabra SIN escribirla ni traducirla: hay ejercicios que la
  // piden por su representación, y con el significado en español la respuesta se
  // leería en vez de recordarse. Un color para las palabras que SON un color, un
  // dibujo para las demás.
  //
  // El hexadecimal es la excepción a la regla de los tokens: no es una decisión de
  // diseño revisable, es el significado de la palabra.
  swatch?: string
  // El dibujo de las palabras que no son un color. Ruta desde `public/`.
  //
  // Una imagen por PALABRA, nunca por ejercicio: los siete ejercicios que enseñan
  // vocabulario piden lo mismo. Va limpia, sin la palabra escrita ni su lectura.
  image?: string
  // Qué se ve en el dibujo, para quien no pueda verlo. Es la respuesta dicha en voz
  // alta: para いえ vale «una casa»; «ie» regalaría la lectura que se pide.
  imageAlt?: string

  // Cómo suena la palabra entera: ruta desde `public/`. Opcional — exigirlo
  // obligaría a grabar las 228 palabras antes de poder usar la primera.
  audio?: string
}

export function wordText(word: Word): string {
  return word.text ?? word.units.map((unit) => unit.kana).join('')
}

export function wordReading(word: Word): string {
  return word.units.map((unit) => unit.romaji).join('')
}

// Una regla gramatical. Nació para las de ORTOGRAFÍA —は se aprende como kana y suena
// «ha», pero de partícula suena «wa»: el mismo carácter con otro uso, que no cabe ni en
// `Word` ni en `Kana`— y sirve también para las de gramática, que no son un carácter:
// です se escribe con dos, ～ます con ninguno propio.
export interface Grammar {
  id: string
  // Solo las de ortografía, que hablan de UN carácter. Las de gramática no lo llevan, y
  // es lo que decide dónde se coloca su plana.
  character?: string
  // Cómo suena en este uso, que puede no ser su lectura habitual.
  romaji?: string
  // Solo las de gramática: las de ortografía se titulan con su propio carácter.
  title?: string
  explanation: string
  // Lo que no cabe en un párrafo: las tablas de conjugación. Cada fila es una casilla ya
  // resuelta, no una plantilla — la plana las pinta, no las calcula.
  examples?: GrammarExample[]
}

export interface GrammarExample {
  // Con qué se encabeza la fila: el verbo, o el tiempo del que habla.
  label: string
  // Las formas de esa fila, en el orden en que las pinta la plana.
  forms: string[]
}

// El texto va literal y no reconstruido a partir de las palabras: entre ellas puede
// haber una partícula que no es vocabulario.
export interface Sentence {
  id: string
  text: string
  meaning: string
  // Las palabras que aparecen, por su id. No cubren necesariamente toda la frase:
  // una partícula no es una palabra.
  wordIds: string[]
  grammarId?: string
  // El mismo desglose que `Word.units`, pero de la frase entera: hace falta para
  // partirla en tarjetas de un solo kana en el examen final. Se escribe a mano, como
  // `text`, y por la misma razón: reconstruirla aquí a partir de `wordIds` y
  // `grammarId` metería en el código la forma de ESTA frase —tema, partícula,
  // predicado—, que una frase futura con otra gramática no tiene por qué compartir.
  units: WordUnit[]
  // Cómo suena la frase entera: ruta desde `public/`. Opcional, como en `Word` — las
  // 15 de este bloque todavía no están grabadas.
  audio?: string
}

// Un kana del bloque y con qué palabra se enseña. El emparejamiento es del TEMARIO
// y no del kana —あ va con あおい por las frases del final del bloque—, y es también
// el orden de estudio: el libro monta las planas de cada lección seguidas.
//
// Una lección puede ser también una REGLA: la del dakuten reaparece en cada bloque que
// estrena alguno, con los de ESE bloque. Por eso la regla se ancla aquí, al bloque y a
// su puesto en él, y no a una frase — de una frase colgaría una sola vez.
export interface Lesson {
  type: 'kana' | 'grammar'
  // Solo las de gramática. La plana sale de la regla con este id.
  grammarId?: string
  // Solo las de kana.
  kanaId?: string
  // Las palabras con las que se enseña, tantas como tenga el kana. La PRIMERA lleva el
  // grueso de la lección y su examen; cada una de las demás suma un ejercicio final:
  // encontrar は en はは y luego en はい demuestra que se reconoce el carácter, no que
  // se memorizó un dibujo. Con una sola, ese ejercicio repite la primera.
  //
  // Opcional: el plan del bloque va por delante de lo decidido. Sin palabras, la
  // lección no genera páginas todavía en vez de romperse.
  wordIds?: string[]
}

// Guarda REFERENCIAS, nunca copias: una palabra en dos bloques es la misma entrada
// citada dos veces.
export interface Block {
  id: string
  // Lo ÚNICO que se escribe a mano de la portada: las cuentas de kana, palabras y
  // frases se derivan de los campos de abajo y no pueden quedar desfasadas.
  title: string
  summary: string
  // Los kana que se aprenden EN este bloque, no los acumulados, y las reglas que se
  // explican entre ellos, en el orden en que se leen.
  lessons: Lesson[]
  // Los dakuten que estrena el bloque. No son lección —se aprenden sobre el kana base,
  // que ya se sabe— pero la plana de la regla necesita saber cuáles tocan aquí.
  dakuten: string[]
  // El vocabulario que desbloquea, nuevo y reutilizado: lo que distingue uno de
  // otro es compararlo con el bloque anterior, no un campo aparte.
  wordIds: string[]
  sentenceIds: string[]
  // Las palabras que sus FRASES usan y que ninguna lección ha enseñado todavía, ni
  // aquí ni en los tomos de antes. El examen final las pide escribir, así que el tomo
  // tiene que presentárlas antes — ver `sentenceWordSpreads`.
  //
  // No se escribe en `content/`: lo calcula el volcado, que es lo único que ve la
  // cadena entera de bloques. Por eso es opcional: `blocks.ts` no lo trae.
  sentenceWordIds?: string[]
}

export interface Kana {
  id: string
  character: string
  romaji: string
  // Cómo suena: ruta desde `public/`. No es decorativo como la ilustración: sin él
  // no hay ejercicio auditivo.
  audio: string
  mnemonic: string
  // Cómo se traza, dicho con las partes del dibujo. Un paso por trazo y en el mismo
  // orden que `strokes`: las dos listas tienen que medir lo mismo. Sin numerar — el
  // número lo pone la página.
  strokeOrder: string[]

  // Ilustración mnemotécnica: ruta desde `public/`. Va LIMPIA, sin el kana pintado
  // encima — el trazo lo dibuja el SVG.
  //
  // El kana se pinta centrado y siempre al mismo tamaño relativo, así que el motivo
  // tiene que ir en el CENTRO. No hay encaje por kana: se corrige el dibujo.
  image: string
  imageAlt: string

  // La silueta del kana. No se dibuja nunca: sirve de recorte. La línea central se
  // pinta con una brocha muy gorda y solo se ve lo que cae dentro, que es lo que le
  // da forma caligráfica en vez de la de un tubo de grosor constante.
  outline: string

  // Los trazos en orden de escritura. Cada uno es la línea CENTRAL del trazo.
  strokes: string[]
  // El lienzo de la silueta y los trazos: lo comparten, o el recorte no cuadraría.
  // Ceñido a la silueta, sin aire: por eso centrar el lienzo es centrar el KANA.
  strokeViewBox: string
}
