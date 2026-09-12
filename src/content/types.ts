// Tipos del temario. Comunes a TODOS los pasillos.

// Kana y lectura van emparejados, no en dos listas paralelas: hay ejercicios que
// necesitan saber qué trozo del rōmaji es de qué kana, y con los yōon del bloque 12
// ni siquiera coinciden los tamaños —きゃ es UN kana de dos caracteres—.
export interface WordUnit {
  kana: string
  romaji: string
}

export interface Word {
  id: string
  // La palabra entera y su lectura salen de aquí: no se guardan aparte para que no
  // puedan contradecirse.
  units: WordUnit[]
  meaning: string
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
  return word.units.map((unit) => unit.kana).join('')
}

export function wordReading(word: Word): string {
  return word.units.map((unit) => unit.romaji).join('')
}

// Una regla gramatical. El caso que la obliga a existir: は se aprende como kana y
// suena «ha», pero de partícula suena «wa». Es el MISMO carácter con otro uso, así
// que no cabe ni en `Word` ni en `Kana`.
export interface Grammar {
  id: string
  character: string
  // Cómo suena en este uso, que puede no ser su lectura habitual.
  romaji: string
  explanation: string
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
}

// Un kana del bloque y con qué palabra se enseña. El emparejamiento es del TEMARIO
// y no del kana —あ va con あおい por las frases del final del bloque—, y es también
// el orden de estudio: el libro monta las planas de cada lección seguidas.
export interface Lesson {
  kanaId: string
  // Opcional: el plan del bloque va por delante de lo decidido. Sin palabra, la
  // lección no genera páginas todavía en vez de romperse.
  wordId?: string
  // La SEGUNDA palabra, para los dos últimos ejercicios: encontrar は en はは y luego
  // en はい demuestra que se reconoce el carácter, no que se memorizó un dibujo. Si
  // falta o no está lista, esas planas repiten la primera.
  wordId2?: string
}

// Guarda REFERENCIAS, nunca copias: una palabra en dos bloques es la misma entrada
// citada dos veces.
export interface Block {
  id: string
  // Lo ÚNICO que se escribe a mano de la portada: las cuentas de kana, palabras y
  // frases se derivan de los campos de abajo y no pueden quedar desfasadas.
  title: string
  summary: string
  // Los kana que se aprenden EN este bloque, no los acumulados.
  lessons: Lesson[]
  // El vocabulario que desbloquea, nuevo y reutilizado: lo que distingue uno de
  // otro es compararlo con el bloque anterior, no un campo aparte.
  wordIds: string[]
  sentenceIds: string[]
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
