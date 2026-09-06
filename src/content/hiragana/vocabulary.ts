// El vocabulario del pasillo de hiragana.
//
// Sale de `docs/estructura-aprendizaje.md`, que es donde se decide QUÉ se enseña.
// Aquí no se inventa ninguna palabra ni ninguna lectura: si falta algo, se añade
// primero allí.
//
// Las trece del bloque 1 están TODAS, aunque casi ninguna tenga todavía un
// ejercicio que la use. No es adelantarse porque sí: están aquí porque el
// bloque 1 termina en 16 frases —«いえはあおい», «ははいい»…— y esas frases exigen
// exactamente estas trece palabras, ni una más ni una menos. El diccionario del
// bloque se escribe entero de una vez porque sus frases ya se conocen enteras;
// lo que todavía no existe es el ejercicio que las presente. Ver `sentences.ts`
// y `blocks.ts`.
import type { Word } from '../types'

export const VOCABULARY: Word[] = [
  {
    id: 'aoi',
    // あ es el kana que se estudia; お e い llegan más adelante en el mismo bloque.
    // La palabra se adelanta a propósito: es lo que da sentido a reconocer un kana
    // suelto —dentro de una palabra de verdad y no en una tabla—.
    units: [
      { kana: 'あ', romaji: 'a' },
      { kana: 'お', romaji: 'o' },
      { kana: 'い', romaji: 'i' },
    ],
    meaning: 'azul',
    // El azul de la palabra. Tirando a apagado y con un punto de gris: sobre el
    // papel crema del tomo, un azul de pantalla chillaría y se saldría de la
    // biblioteca. Sigue siendo inconfundiblemente azul, que es lo único que no se
    // puede negociar — es el significado, no un adorno.
    swatch: '#3f6f96',
    // Grabado con la misma voz que los kana, para que la palabra y sus piezas
    // suenen a la misma persona. Ver la nota de formato en `kana.ts`.
    audio: '/audio/hiragana/b1/aoi.wav',
  },
  {
    id: 'ao',
    // El mismo azul, pero sustantivo: «el azul» y no «azul de color». Aparece
    // como TEMA de una frase —「あおはいい」, «el azul es bonito»— y no como lo que
    // se dice de otra cosa, que es el papel de `aoi`.
    units: [
      { kana: 'あ', romaji: 'a' },
      { kana: 'お', romaji: 'o' },
    ],
    meaning: 'azul (sustantivo)',
    // El mismo color que `aoi`: es el mismo azul, dicho de otra manera, y tiene
    // que verse como el mismo azul.
    swatch: '#3f6f96',
  },
  {
    id: 'e',
    units: [{ kana: 'え', romaji: 'e' }],
    meaning: 'dibujo',
  },
  {
    id: 'ha',
    // No confundir con la PARTÍCULA は de las frases —esa es gramática, no
    // vocabulario, y vive en `grammar.ts` como `topic-wa`—. Esta es la palabra:
    // el diente, que se pronuncia «ha» y no «wa».
    units: [{ kana: 'は', romaji: 'ha' }],
    meaning: 'diente',
  },
  {
    id: 'haha',
    units: [
      { kana: 'は', romaji: 'ha' },
      { kana: 'は', romaji: 'ha' },
    ],
    meaning: 'madre',
  },
  {
    id: 'ie',
    units: [
      { kana: 'い', romaji: 'i' },
      { kana: 'え', romaji: 'e' },
    ],
    meaning: 'casa',
    audio: '/audio/hiragana/b1/ie.wav',
    // La primera palabra que se enseña con dibujo en vez de con color: «casa» no
    // se puede pintar con un círculo. Las ilustraciones del vocabulario viven
    // aparte de las mnemotécnicas —estas son de la PALABRA, aquellas del kana— y
    // por eso están en su propia carpeta.
    image: '/images/hiragana/imagesSupport/casa-ie.webp',
    imageAlt:
      'Una casa de campo con tejado de teja roja y flores en las ventanas, en lo ' +
      'alto de una cuesta empedrada con el mar al fondo',
  },
  {
    id: 'ue',
    units: [
      { kana: 'う', romaji: 'u' },
      { kana: 'え', romaji: 'e' },
    ],
    meaning: 'arriba',
    audio: '/audio/hiragana/b1/ue.wav',
    // No es un color, así que dibujo. El alt describe la escena —el salto, el
    // globo que sube, la flecha— sin soltar la lectura, igual que el de いえ.
    image: '/images/hiragana/imagesSupport/arriba-ue.webp',
    imageAlt:
      'Un niño saltando con el brazo estirado hacia el cielo para alcanzar un ' +
      'globo azul que se le escapa, con una flecha roja que apunta hacia arriba',
  },
  {
    id: 'ii',
    units: [
      { kana: 'い', romaji: 'i' },
      { kana: 'い', romaji: 'i' },
    ],
    meaning: 'bueno',
  },
  {
    id: 'ooi',
    units: [
      { kana: 'お', romaji: 'o' },
      { kana: 'お', romaji: 'o' },
      { kana: 'い', romaji: 'i' },
    ],
    meaning: 'muchos / abundante',
  },
  {
    id: 'au',
    units: [
      { kana: 'あ', romaji: 'a' },
      { kana: 'う', romaji: 'u' },
    ],
    meaning: 'encontrarse',
  },
  {
    id: 'iu',
    units: [
      { kana: 'い', romaji: 'i' },
      { kana: 'う', romaji: 'u' },
    ],
    meaning: 'decir',
  },
  {
    id: 'hai',
    units: [
      { kana: 'は', romaji: 'ha' },
      { kana: 'い', romaji: 'i' },
    ],
    meaning: 'sí',
  },
  {
    id: 'iie',
    units: [
      { kana: 'い', romaji: 'i' },
      { kana: 'い', romaji: 'i' },
      { kana: 'え', romaji: 'e' },
    ],
    meaning: 'no',
    audio: '/audio/hiragana/b1/iie.wav',
    // El gesto japonés de negar —los brazos cruzados en equis— dice «no» sin
    // escribirlo y sin depender del español, que es justo lo que pide la hoja.
    image: '/images/hiragana/imagesSupport/no-iie.webp',
    imageAlt:
      'Un niño con los brazos cruzados en equis delante del pecho, negando con ' +
      'cara de convencido, y una equis roja grande a su lado',
  },
]

// Acceso por id, que es como lo pide una página del tomo.
export const VOCABULARY_BY_ID = new Map(VOCABULARY.map((word) => [word.id, word]))
