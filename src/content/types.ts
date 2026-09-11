// Tipos del temario. Comunes a TODOS los pasillos: un kana es un kana lo escriba
// hiragana, katakana o, más adelante, el kanji con sus lecturas de más.
//
// El contenido es dato: nada de esto se escribe dentro de un componente.

// Un kana de una palabra, con lo que suena.
//
// Van emparejados y no en dos listas paralelas —una de kana y otra de lecturas—
// porque hay ejercicios que necesitan saber qué trozo del romaji corresponde a
// qué kana, y con dos listas basta que una crezca sin la otra para que todo se
// desplace en silencio. Emparejados, eso no se puede escribir mal.
//
// El emparejamiento tampoco es opcional: de «aoi» a secas no hay forma de deducir
// que la あ es la «a», y con los yōon del bloque 12 ni siquiera coinciden los
// tamaños —きゃ es UN kana de dos caracteres que suena «kya»—.
export interface WordUnit {
  kana: string
  romaji: string
}

export interface Word {
  id: string
  // La palabra, kana a kana y en orden de lectura. La palabra entera y su lectura
  // salen de aquí: no se guardan aparte para que no puedan contradecirse.
  units: WordUnit[]
  // Qué significa, en español.
  meaning: string
  // Cómo se enseña la palabra SIN escribirla ni traducirla.
  //
  // Hay ejercicios que dan la palabra por su significado y piden la escritura. Si
  // ese significado apareciera en español, la respuesta se leería en vez de
  // recordarse: hace falta enseñar la cosa, no su nombre.
  //
  // Hay dos formas, y una palabra usa la que le corresponda: un color para las
  // palabras que SON un color, y un dibujo para todas las demás, porque いえ o はは
  // no se dibujan con un círculo. La clave es que sean campos del CONTENIDO y no
  // del ejercicio: el ejercicio pide «la representación de esta palabra» y la
  // palabra dice cuál tiene, así que un ejercicio nuevo no multiplica el material
  // y una palabra nueva no obliga a tocar ningún ejercicio.
  //
  // El color va en hexadecimal y no en un token de la paleta, y es la excepción
  // que confirma la regla: no es una decisión de diseño que se pueda revisar, es
  // el significado de la palabra. El día que あおい deje de verse azul, la palabra
  // habrá dejado de ser reconocible.
  swatch?: string
  // El dibujo, para el vocabulario que no es un color. Ruta desde `public/`.
  //
  // Una imagen por PALABRA, nunca por ejercicio. Es la diferencia entre 228
  // dibujos y 228 × 7: los siete ejercicios que enseñan vocabulario piden todos lo
  // mismo, así que se ilustra la palabra una vez y sirve para los siete.
  //
  // Va limpia, sin la palabra escrita ni su lectura encima: aportar eso es
  // justamente lo que se le pide a quien estudia.
  image?: string
  // Qué se ve en el dibujo, para quien no pueda verlo.
  //
  // Cuidado con lo que se escribe aquí, porque es la respuesta dicha en voz alta.
  // Para いえ vale «una casa», que es lo que se ve; «ie» no, que sería regalar la
  // lectura que se está pidiendo.
  imageAlt?: string

  // Cómo suena la palabra entera: ruta desde `public/`.
  //
  // Opcional a propósito. Una palabra sin grabar sigue sirviendo para leerla y
  // reconocerla —que es lo que hacen los ejercicios de vocabulario—, y exigir el
  // audio obligaría a grabar las 228 palabras del pasillo antes de poder usar la
  // primera. La hoja enseña el botón solo si lo hay.
  audio?: string
}

// La palabra escrita: あおい
export function wordText(word: Word): string {
  return word.units.map((unit) => unit.kana).join('')
}

// Cómo se lee: aoi
export function wordReading(word: Word): string {
  return word.units.map((unit) => unit.romaji).join('')
}

// Una regla gramatical, introducida solo cuando una frase la necesita —nunca
// como bloque aparte—. Ver «Gramática Just-In-Time» en
// docs/estructura-aprendizaje.md.
//
// El caso que la obliga a existir: は se aprende como kana suelto y suena «ha»,
// pero de partícula —entre el tema de la frase y lo que se dice de él— suena
// «wa». Es el MISMO carácter con un uso distinto, no una palabra nueva, así que
// no cabe en `Word` ni en `Kana`: necesita su propia entrada.
export interface Grammar {
  id: string
  // El kana que la porta.
  character: string
  // Cómo suena en este uso, que puede no ser su lectura habitual.
  romaji: string
  // La explicación, en español y para quien aprende — no para quien programa.
  explanation: string
}

// Una frase del temario, hecha de palabras ya conocidas más, como mucho, una
// regla gramatical.
//
// El texto va literal —igual que `WordUnit.kana`— y no reconstruido a partir de
// las palabras: entre ellas puede haber una partícula que no es vocabulario, y
// obligar a la frase a recomponerse pieza a pieza no aportaría nada que esta
// sesión vaya a usar. `wordIds` está para lo que sí hace falta ya: saber qué
// vocabulario reutiliza, y así poder calcular qué frases se entienden según lo
// aprendido.
export interface Sentence {
  id: string
  // La frase completa, en kana: いえはあおい.
  text: string
  // Su significado en español.
  meaning: string
  // Las palabras del vocabulario que aparecen, por su id en `vocabulary.ts`. No
  // cubren necesariamente toda la frase —una partícula no es una palabra—, pero
  // sí todo lo que sí lo es.
  wordIds: string[]
  // La gramática que hace falta para leerla, si hace falta alguna.
  grammarId?: string
}

// Un bloque del temario: qué se aprende junto y en qué orden.
//
// Guarda REFERENCIAS, nunca copias — ver «10. Principio de reutilización» en
// docs/estructura-aprendizaje.md. Si una palabra aparece en dos bloques es la
// misma entrada citada dos veces, nunca una palabra duplicada.
//
// `lessons` puede nombrar un kana que todavía no tenga su ficha completa en
// `kana.ts` —trazos, ilustración, mnemotecnia—: el bloque describe el plan del
// temario, y ese plan puede ir por delante de cuánto se ha trazado a mano. El
// tomo monta solo las lecciones cuyo kana y cuya palabra existen ya, así que un
// kana a medias no deja páginas en blanco: todavía no aparece.
// Un kana del bloque y con qué palabra se enseña.
//
// El emparejamiento es del TEMARIO, no del kana: あ se presenta con あおい e い
// con いえ porque son las palabras que hacen falta para las frases del final del
// bloque, no por nada propio de esos dos caracteres. Por eso vive aquí y no en
// `Kana`, que es común a todos los pasillos — un kana es un kana lo enseñe quien
// lo enseñe.
//
// Es también el orden de estudio dentro del bloque: el libro monta las planas de
// cada lección seguidas, en este orden.
export interface Lesson {
  kanaId: string
  // Con qué palabra se presenta.
  //
  // Opcional porque el plan del bloque va por delante de lo que está decidido: un
  // kana puede estar listado aquí —y hasta trazado en `kana.ts`— antes de haberse
  // elegido con qué palabra se enseña. Sin palabra no genera páginas todavía, así
  // que el tomo crece según se va cerrando el temario en vez de romperse.
  wordId?: string
  // La SEGUNDA palabra de la lección, para los dos últimos ejercicios.
  //
  // El kana se presenta y se reconoce con `wordId`, y al final se pide dentro de
  // otra palabra distinta: encontrar は en はは y luego en はい demuestra que se
  // reconoce el carácter, no que se ha memorizado un dibujo. Antes las dos últimas
  // planas repetían la palabra —y la misma ilustración— de las anteriores.
  //
  // Opcional, y con el mismo espíritu que `wordId`: si falta, o si esa palabra
  // todavía no está lista, esas planas siguen usando la primera. Nadie se queda
  // mirando una hoja vacía porque falte una ilustración.
  wordId2?: string
}

export interface Block {
  id: string
  // Cómo se presenta el tomo en su primera hoja.
  //
  // Es lo ÚNICO que hay que escribir a mano de esa hoja. Todo lo demás que
  // aparece en ella —qué kana trae, cuántas palabras, cuántas frases— sale de los
  // campos de abajo, así que no puede contradecir al contenido: el día que se
  // añada una frase al bloque, la portada la cuenta sola.
  title: string
  // Una línea sobre qué tiene de particular este bloque. Va debajo del título, y
  // se dirige a quien estudia, no a quien programa.
  summary: string
  // Los kana que se aprenden EN este bloque, no los acumulados de los
  // anteriores, cada uno con su palabra.
  lessons: Lesson[]
  // El vocabulario que desbloquea. Incluye tanto el nuevo como el que ya se
  // conocía y se reutiliza aquí — comparar con el bloque anterior es lo que
  // distingue uno de otro, no un campo aparte.
  wordIds: string[]
  // Las frases que desbloquea.
  sentenceIds: string[]
}

export interface Kana {
  id: string
  // El carácter en sí.
  character: string
  // Su lectura en alfabeto latino.
  romaji: string
  // Cómo suena: ruta desde `public/`.
  //
  // Va aquí arriba, pegado al carácter y a su lectura, porque los tres son la
  // MISMA cosa dicha de tres maneras —lo que se ve, lo que se escribe y lo que
  // se oye— y hay ejercicios que se apoyan solo en el sonido. No es un recurso
  // decorativo como la ilustración: sin él no hay ejercicio auditivo.
  audio: string
  // La historia que lo hace memorable.
  mnemonic: string
  // Cómo se traza, contado sobre la ilustración: el mismo recorrido que hace la
  // animación, pero dicho con las partes del dibujo para poder repetirlo a mano.
  //
  // Un paso por trazo y en el mismo orden que `strokes`, así que las dos listas
  // tienen que medir lo mismo. Van sin numerar: el número lo pone la página, que
  // es quien sabe cómo se presenta.
  strokeOrder: string[]

  // Ilustración mnemotécnica: ruta desde `public/`. Va LIMPIA, sin el kana
  // pintado encima — el trazo lo dibuja el SVG.
  //
  // El kana se pinta centrado sobre ella y siempre del mismo tamaño relativo, así
  // que el motivo del dibujo tiene que ir en el CENTRO. No hay un encaje por kana
  // que corrija un dibujo descentrado: se corrige el dibujo.
  image: string
  // Qué se ve en la ilustración, para quien no pueda verla.
  imageAlt: string

  // La silueta del kana: su forma cerrada, con los agujeros que tenga.
  //
  // No se dibuja nunca. Sirve de recorte: la línea central se pinta con una
  // brocha muy gorda y solo se ve la parte que cae dentro de esta silueta, que
  // es lo que le da al trazo su forma caligráfica —entrada fina, cuerpo grueso,
  // remate— en vez de la de un tubo de grosor constante.
  outline: string

  // Los trazos, en el orden en que se escriben a mano. Cada uno es la línea
  // CENTRAL del trazo: el recorrido del pincel por el medio de la forma.
  strokes: string[]
  // Sistema de coordenadas en el que están escritos la silueta y los trazos.
  // Los dos comparten lienzo, o el recorte no cuadraría.
  //
  // Ceñido a la silueta, sin aire alrededor: es lo que hace que centrar el lienzo
  // sobre el dibujo sea centrar el KANA. Con margen en un lado, saldría desplazado.
  strokeViewBox: string
}
