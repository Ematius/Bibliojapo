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
    // Dibujo y no `swatch`, aunque sea un color: un cuadrado azul dice «azul» pero
    // no dice nada más, y esta es la primera palabra del tomo. La escena la sostiene
    // mejor. El `swatch` se queda en `ao`, que es el azul como sustantivo.
    image: '/images/hiragana/imagesSupport/aoi-azul.webp',
    imageAlt:
      'Un niño con kimono azul pintando una gran mancha azul con un pincel de ' +
      'caligrafía, junto a un cuenco de tinta azul, con hortensias azules y el ' +
      'monte Fuji al fondo',
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
    // Aquí sí un color y no un dibujo: «el azul» como cosa en sí no tiene escena
    // que valga, es el color y nada más. Tirando a apagado y con un punto de gris,
    // porque sobre el papel crema del tomo un azul de pantalla chillaría.
    swatch: '#3f6f96',
    audio: '/audio/hiragana/b1/ao.wav',
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
    audio: '/audio/hiragana/b1/haha.wav',
    image: '/images/hiragana/imagesSupport/haha-mama.webp',
    imageAlt:
      'Una madre sonriente con los ojos cerrados abrazando a su hija pequeña, que ' +
      'ríe apoyada contra ella, en un salón luminoso con un osito de peluche al lado',
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
    image: '/images/hiragana/imagesSupport/ie-casa.webp',
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
    image: '/images/hiragana/imagesSupport/ue-arriba.webp',
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
    audio: '/audio/hiragana/b1/ii.wav',
    // El gesto japonés de «correcto» —los brazos en círculo sobre la cabeza— y el
    // ○ rojo. Es el espejo exacto de いいえ, que usa la equis: las dos palabras son
    // contrarias y sus dibujos también, que es como se recuerdan.
    image: '/images/hiragana/imagesSupport/ii-bueno.webp',
    imageAlt:
      'Una niña sonriente con los brazos formando un círculo por encima de la ' +
      'cabeza y un círculo rojo grande a su lado',
  },
  {
    id: 'ooi',
    units: [
      { kana: 'お', romaji: 'o' },
      { kana: 'お', romaji: 'o' },
      { kana: 'い', romaji: 'i' },
    ],
    meaning: 'muchos / abundante',
    audio: '/audio/hiragana/b1/ooi.wav',
    // No es un color, así que dibujo. Muchísimos gatitos a la vez dicen
    // «abundante» sin necesidad de la palabra en español.
    image: '/images/hiragana/imagesSupport/ooi-muchos.webp',
    imageAlt:
      'Una chica sonriente abrazando un gatito entre los brazos, rodeada por ' +
      'decenas y decenas de gatitos más que llenan cestas y estanterías hasta el ' +
      'borde de la imagen',
  },
  {
    id: 'au',
    units: [
      { kana: 'あ', romaji: 'a' },
      { kana: 'う', romaji: 'u' },
    ],
    meaning: 'encontrarse',
    audio: '/audio/hiragana/b1/au.wav',
    // Encontrarse es un verbo, y un verbo no se dibuja: se dibuja la escena en la
    // que ocurre. Dos que se cruzan y se saludan con una reverencia lo cuentan sin
    // una palabra.
    image: '/images/hiragana/imagesSupport/au-encontrarse.webp',
    imageAlt:
      'Dos chicas que se cruzan en una calle empedrada y se saludan inclinándose ' +
      'la una hacia la otra, sonriendo, con un torii al fondo',
  },
  {
    id: 'iu',
    units: [
      { kana: 'い', romaji: 'i' },
      { kana: 'う', romaji: 'u' },
    ],
    meaning: 'decir',
    audio: '/audio/hiragana/b1/iu.wav',
    // El bocadillo va VACÍO a propósito: escribir dentro lo que dice sería poner
    // en la hoja la respuesta que se está pidiendo.
    image: '/images/hiragana/imagesSupport/iu-decir.webp',
    imageAlt:
      'Un niño con kimono azul hablando con la mano abierta y un bocadillo de ' +
      'cómic vacío saliéndole de la boca',
  },
  {
    id: 'hai',
    units: [
      { kana: 'は', romaji: 'ha' },
      { kana: 'い', romaji: 'i' },
    ],
    meaning: 'sí',
    audio: '/audio/hiragana/b1/hai.wav',
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
