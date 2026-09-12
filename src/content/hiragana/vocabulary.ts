// Sale de `docs/estructura-aprendizaje.md`, que es donde se decide QUÉ se enseña:
// aquí no se inventa ninguna palabra ni ninguna lectura. Las trece del bloque 1
// están todas porque sus frases las exigen, aunque aún no las use ningún ejercicio.
import type { Word } from '../types'

export const VOCABULARY: Word[] = [
  {
    id: 'aoi',
    units: [
      { kana: 'あ', romaji: 'a' },
      { kana: 'お', romaji: 'o' },
      { kana: 'い', romaji: 'i' },
    ],
    meaning: 'azul',
    // Dibujo y no `swatch` aunque sea un color: un cuadrado azul dice «azul» y nada
    // más, y esta es la primera palabra del tomo. `ao` usa este mismo dibujo.
    image: '/images/hiragana/imagesSupport/aoi-azul.webp',
    imageAlt:
      'Un niño con kimono azul pintando una gran mancha azul con un pincel de ' +
      'caligrafía, junto a un cuenco de tinta azul, con hortensias azules y el ' +
      'monte Fuji al fondo',
    // La misma voz que los kana, para que la palabra y sus piezas suenen igual.
    audio: '/audio/hiragana/b1/aoi.wav',
  },
  {
    id: 'ao',
    // El mismo azul, pero sustantivo: aparece como TEMA de una frase —「あおはいい」—,
    // no como lo que se dice de otra cosa, que es el papel de `aoi`.
    units: [
      { kana: 'あ', romaji: 'a' },
      { kana: 'お', romaji: 'o' },
    ],
    meaning: 'azul (sustantivo)',
    // El dibujo de `aoi` y no un círculo de color: suelto en la hoja del enunciado se
    // leía como una imagen que faltaba.
    image: '/images/hiragana/imagesSupport/aoi-azul.webp',
    imageAlt:
      'Un niño con kimono azul pintando una gran mancha azul con un pincel de ' +
      'caligrafía, junto a un cuenco de tinta azul, con hortensias azules y el ' +
      'monte Fuji al fondo',
    audio: '/audio/hiragana/b1/ao.wav',
  },
  {
    id: 'e',
    units: [{ kana: 'え', romaji: 'e' }],
    meaning: 'dibujo',
  },
  {
    id: 'ha',
    // No confundir con la PARTÍCULA は, que es gramática y vive en `grammar.ts`. Esta
    // es la palabra «diente», que se pronuncia «ha» y no «wa».
    units: [{ kana: 'は', romaji: 'ha' }],
    meaning: 'diente',
    // El mismo archivo que el kana: es un solo carácter y suena igual, así que
    // grabarla aparte sería tener dos copias del mismo sonido.
    audio: '/audio/hiragana/b1/ha.wav',
    image: '/images/hiragana/imagesSupport/ha-diente.webp',
    imageAlt:
      'Una niña sonriendo con la boca muy abierta, con una flecha roja que ' +
      'señala uno de los dientes de arriba',
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
    // Las ilustraciones del vocabulario van en su propia carpeta, aparte de las
    // mnemotécnicas: estas son de la PALABRA, aquellas del kana.
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
    // El bocadillo va VACÍO: escribir dentro lo que dice sería poner en la hoja la
    // respuesta que se pide.
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
    image: '/images/hiragana/imagesSupport/hai-si.webp',
    imageAlt:
      'Un niño con sudadera azul asintiendo con la cabeza, sonriendo, con flechas ' +
      'que marcan el movimiento y un bocadillo que dice «sí»',
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
    image: '/images/hiragana/imagesSupport/no-iie.webp',
    imageAlt:
      'Un niño con los brazos cruzados en equis delante del pecho, negando con ' +
      'cara de convencido, y una equis roja grande a su lado',
  },
]

export const VOCABULARY_BY_ID = new Map(VOCABULARY.map((word) => [word.id, word]))
