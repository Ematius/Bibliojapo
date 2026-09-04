// Tipos del temario. Comunes a TODOS los pasillos: un kana es un kana lo escriba
// hiragana, katakana o, más adelante, el kanji con sus lecturas de más.
//
// El contenido es dato: nada de esto se escribe dentro de un componente.

// Dónde cae el kana sobre su ilustración mnemotécnica.
//
// Son márgenes en % de la caja de la ilustración, contados desde cada borde:
// `{ top: 12, left: 15 }` deja el trazo empezando al 12 % de la altura y al 15 %
// del ancho. Van en el contenido y no en el CSS porque el encaje cambia con cada
// dibujo — el kana tiene que caer sobre la pose del personaje, y esa pose es
// distinta en cada ilustración.
export interface StrokeFit {
  top: number
  right: number
  bottom: number
  left: number
}

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
  strokeViewBox: string
  // Cómo se encaja el kana sobre la ilustración.
  strokeFit: StrokeFit
}
