// Conserva el vocabulario original de apoyo de B1 y añade el corpus B1–B13.
// Las imágenes y los audios solo se mantienen donde ya existían; no se inventan recursos.
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
    image: '/images/hiragana/imagesSupport/aoi-blue.webp',
    imageAlt:
      'Un niño con kimono azul pintando una gran mancha azul con un pincel de ' +
      'caligrafía, junto a un cuenco de tinta azul, con hortensias azules y el ' +
      'monte Fuji al fondo',
    // La misma voz que los kana, para que la palabra y sus piezas suenen igual.
    audio: '/audio/hiragana/b1/word/aoi.wav',
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
    image: '/images/hiragana/imagesSupport/aoi-blue.webp',
    imageAlt:
      'Un niño con kimono azul pintando una gran mancha azul con un pincel de ' +
      'caligrafía, junto a un cuenco de tinta azul, con hortensias azules y el ' +
      'monte Fuji al fondo',
    audio: '/audio/hiragana/b1/word/ao.wav',
  },
  {
    id: 'e',
    units: [{ kana: 'え', romaji: 'e' }],
    meaning: 'dibujo, imagen',
    // El mismo archivo que el kana: es un solo carácter y suena igual.
    audio: '/audio/hiragana/b1/e.wav',
    image: '/images/hiragana/imagesSupport/e-drawing.webp',
    imageAlt:
      'Un caballete de madera sobre el tatami con una lámina de acuarela sujeta ' +
      'con cinta, pintada con peces koi naranjas, y al lado un pincel, un bote ' +
      'de agua y una caja de acuarelas',
  },
  {
    id: 'ha',
    // No confundir con la PARTÍCULA は, que es gramática y vive en `grammar.ts`. Esta
    // es la palabra «diente», que se pronuncia «ha» y no «wa».
    units: [{ kana: 'は', romaji: 'ha' }],
    meaning: 'diente',
    // El mismo archivo que el kana: es un solo carácter y suena igual, así que
    // grabarla aparte sería tener dos copias del mismo sonido.
    audio: '/audio/hiragana/b1/word/ha.wav',
    image: '/images/hiragana/imagesSupport/ha-tooth.webp',
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
    audio: '/audio/hiragana/b1/word/haha.wav',
    image: '/images/hiragana/imagesSupport/haha-mom.webp',
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
    meaning: 'casa, hogar',
    audio: '/audio/hiragana/b1/word/ie.wav',
    // Las ilustraciones del vocabulario van en su propia carpeta, aparte de las
    // mnemotécnicas: estas son de la PALABRA, aquellas del kana.
    image: '/images/hiragana/imagesSupport/ie-house.webp',
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
    audio: '/audio/hiragana/b1/word/ue.wav',
    image: '/images/hiragana/imagesSupport/ue-up.webp',
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
    audio: '/audio/hiragana/b1/word/ii.wav',
    image: '/images/hiragana/imagesSupport/ii-good.webp',
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
    audio: '/audio/hiragana/b1/word/ooi.wav',
    image: '/images/hiragana/imagesSupport/ooi-many.webp',
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
    audio: '/audio/hiragana/b1/word/au.wav',
    image: '/images/hiragana/imagesSupport/au-meet.webp',
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
    audio: '/audio/hiragana/b1/word/iu.wav',
    // El bocadillo va VACÍO: escribir dentro lo que dice sería poner en la hoja la
    // respuesta que se pide.
    image: '/images/hiragana/imagesSupport/iu-say.webp',
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
    audio: '/audio/hiragana/b1/word/hai.wav',
    image: '/images/hiragana/imagesSupport/hai-yes.webp',
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
    audio: '/audio/hiragana/b1/word/iie.wav',
    image: '/images/hiragana/imagesSupport/iie-no.webp',
    imageAlt:
      'Un niño con los brazos cruzados en equis delante del pecho, negando con ' +
      'cara de convencido, y una equis roja grande a su lado',
  },
  {
    id: 'a-expression',
    units: [{ kana: 'あ', romaji: 'a' }],
    meaning: 'ah, oh',
  },
  {
    id: 'aa',
    units: [
      { kana: 'あ', romaji: 'a' },
      { kana: 'あ', romaji: 'a' },
    ],
    meaning: 'ah, oh',
  },
  {
    id: 'ie-2',
    units: [
      { kana: 'い', romaji: 'i' },
      { kana: 'え', romaji: 'e' },
    ],
    meaning: 'no',
  },
  {
    id: 'e-2',
    units: [{ kana: 'え', romaji: 'e' }],
    meaning: 'eh, oh',
  },
  {
    id: 'ee',
    units: [
      { kana: 'え', romaji: 'e' },
      { kana: 'え', romaji: 'e' },
    ],
    meaning: 'sí',
  },
  {
    id: 'o-honorific-prefix',
    units: [{ kana: 'お', romaji: 'o' }],
    meaning: 'prefijo honorífico',
  },
  {
    id: 'hai-2',
    units: [
      { kana: 'は', romaji: 'ha' },
      { kana: 'い', romaji: 'i' },
    ],
    meaning: 'vasos, tazas',
  },
  {
    id: 'aru',
    units: [
      { kana: 'あ', romaji: 'a' },
      { kana: 'る', romaji: 'ru' },
    ],
    meaning: 'haber, existir',
    audio: 'hiragana/b2/audio/word/aru.wav',
    image: 'hiragana/b2/images/imagesSupport/aru-exist.webp',
    imageAlt:
      'Un jarrón de porcelana con flores, solo en el centro de una sala de ' +
      'tatami con las puertas abiertas al jardín.',
  },
  {
    id: 'aru-2',
    units: [
      { kana: 'あ', romaji: 'a' },
      { kana: 'る', romaji: 'ru' },
    ],
    meaning: 'tener',
    audio: 'hiragana/b2/audio/word/aru-2.wav',
    image: 'hiragana/b2/images/imagesSupport/aru-2-have.webp',
    imageAlt:
      'Una chica en la calle de un santuario cargada con su bolso, un cuaderno, ' +
      'un paraguas y una bolsa, con una flecha señalando cada cosa que lleva.',
  },
  {
    id: 'are',
    units: [
      { kana: 'あ', romaji: 'a' },
      { kana: 'れ', romaji: 're' },
    ],
    meaning: 'eso, aquello',
  },
  {
    id: 'iru',
    units: [
      { kana: 'い', romaji: 'i' },
      { kana: 'る', romaji: 'ru' },
    ],
    meaning: 'estar, existir',
    audio: 'hiragana/b2/audio/word/iru.wav',
    image: 'hiragana/b2/images/imagesSupport/iru-be.webp',
    imageAlt:
      'Un gato naranja sentado en el porche de madera de una casa japonesa, ' +
      'frente a un jardín con estanque.',
  },
  {
    id: 'iru-2',
    units: [
      { kana: 'い', romaji: 'i' },
      { kana: 'る', romaji: 'ru' },
    ],
    meaning: 'necesitar',
    audio: 'hiragana/b2/audio/word/iru-2.wav',
    image: 'hiragana/b2/images/imagesSupport/iru-2-need.webp',
    imageAlt:
      'Una chica empapada bajo la lluvia junto a un santuario, tapándose la ' +
      'cabeza con una mano y alcanzando un paraguas del paragüero con la otra.',
  },
  {
    id: 'ureshii',
    units: [
      { kana: 'う', romaji: 'u' },
      { kana: 'れ', romaji: 're' },
      { kana: 'し', romaji: 'shi' },
      { kana: 'い', romaji: 'i' },
    ],
    meaning: 'feliz, contento',
  },
  {
    id: 'oishii',
    units: [
      { kana: 'お', romaji: 'o' },
      { kana: 'い', romaji: 'i' },
      { kana: 'し', romaji: 'shi' },
      { kana: 'い', romaji: 'i' },
    ],
    meaning: 'delicioso',
    audio: 'hiragana/b2/audio/word/oishii.wav',
    image: 'hiragana/b2/images/imagesSupport/oishii-delicious.webp',
    imageAlt: 'Un cuenco de ramen humeante con chashu, huevo marinado y nori.',
  },
  {
    id: 'okuru',
    units: [
      { kana: 'お', romaji: 'o' },
      { kana: 'く', romaji: 'ku' },
      { kana: 'る', romaji: 'ru' },
    ],
    meaning: 'enviar',
  },
  {
    id: 'osoku',
    units: [
      { kana: 'お', romaji: 'o' },
      { kana: 'そ', romaji: 'so' },
      { kana: 'く', romaji: 'ku' },
    ],
    meaning: 'tarde',
  },
  {
    id: 'ototoi',
    units: [
      { kana: 'お', romaji: 'o' },
      { kana: 'と', romaji: 'to' },
      { kana: 'と', romaji: 'to' },
      { kana: 'い', romaji: 'i' },
    ],
    meaning: 'anteayer',
  },
  {
    id: 'ototoshi',
    units: [
      { kana: 'お', romaji: 'o' },
      { kana: 'と', romaji: 'to' },
      { kana: 'と', romaji: 'to' },
      { kana: 'し', romaji: 'shi' },
    ],
    meaning: 'año antepasado',
  },
  {
    id: 'sou',
    units: [
      { kana: 'そ', romaji: 'so' },
      { kana: 'う', romaji: 'u' },
    ],
    meaning: 'así, así es',
  },
  {
    id: 'sore',
    units: [
      { kana: 'そ', romaji: 'so' },
      { kana: 'れ', romaji: 're' },
    ],
    meaning: 'eso',
  },
  {
    id: 'tooku',
    units: [
      { kana: 'と', romaji: 'to' },
      { kana: 'お', romaji: 'o' },
      { kana: 'く', romaji: 'ku' },
    ],
    meaning: 'lejos',
  },
  {
    id: 'haku',
    units: [
      { kana: 'は', romaji: 'ha' },
      { kana: 'く', romaji: 'ku' },
    ],
    meaning: 'ponerse pantalones o zapatos',
  },
  {
    id: 'hashi',
    units: [
      { kana: 'は', romaji: 'ha' },
      { kana: 'し', romaji: 'shi' },
    ],
    meaning: 'puente',
    audio: 'hiragana/b2/audio/word/hashi.wav',
    image: 'hiragana/b2/images/imagesSupport/hashi-bridge.webp',
    imageAlt: 'Un puente rojo curvado sobre un estanque, entre cerezos en flor.',
  },
  {
    id: 'hashi-2',
    units: [
      { kana: 'は', romaji: 'ha' },
      { kana: 'し', romaji: 'shi' },
    ],
    meaning: 'palillos',
    audio: 'hiragana/b2/audio/word/hashi-2.wav',
    image: 'hiragana/b2/images/imagesSupport/hashi-2-chopsticks.webp',
    imageAlt: 'Una mano sujetando unos palillos, cogiendo una pieza de sushi de nigiri.',
  },
  {
    id: 'rei',
    units: [
      { kana: 'れ', romaji: 're' },
      { kana: 'い', romaji: 'i' },
    ],
    meaning: 'cero',
  },
  {
    id: 'rei-2',
    units: [
      { kana: 'れ', romaji: 're' },
      { kana: 'い', romaji: 'i' },
    ],
    meaning: 'ejemplo',
  },
  {
    id: 'asoko',
    units: [
      { kana: 'あ', romaji: 'a' },
      { kana: 'そ', romaji: 'so' },
      { kana: 'こ', romaji: 'ko' },
    ],
    meaning: 'allí',
  },
  {
    id: 'ano',
    units: [
      { kana: 'あ', romaji: 'a' },
      { kana: 'の', romaji: 'no' },
    ],
    meaning: 'aquel, aquella',
  },
  {
    id: 'ano-2',
    units: [
      { kana: 'あ', romaji: 'a' },
      { kana: 'の', romaji: 'no' },
    ],
    meaning: 'eh..., este...',
  },
  {
    id: 'anou',
    units: [
      { kana: 'あ', romaji: 'a' },
      { kana: 'の', romaji: 'no' },
      { kana: 'う', romaji: 'u' },
    ],
    meaning: 'disculpe..., este...',
  },
  {
    id: 'iroiro',
    units: [
      { kana: 'い', romaji: 'i' },
      { kana: 'ろ', romaji: 'ro' },
      { kana: 'い', romaji: 'i' },
      { kana: 'ろ', romaji: 'ro' },
    ],
    meaning: 'varios, diversos',
  },
  {
    id: 'kuroku',
    units: [
      { kana: 'く', romaji: 'ku' },
      { kana: 'ろ', romaji: 'ro' },
      { kana: 'く', romaji: 'ku' },
    ],
    meaning: 'en negro',
  },
  {
    id: 'koko',
    units: [
      { kana: 'こ', romaji: 'ko' },
      { kana: 'こ', romaji: 'ko' },
    ],
    meaning: 'aquí',
  },
  {
    id: 'kono',
    units: [
      { kana: 'こ', romaji: 'ko' },
      { kana: 'の', romaji: 'no' },
    ],
    meaning: 'este, esta',
  },
  {
    id: 'kore',
    units: [
      { kana: 'こ', romaji: 'ko' },
      { kana: 'れ', romaji: 're' },
    ],
    meaning: 'esto',
  },
  {
    id: 'koro-goro',
    units: [
      { kana: 'こ', romaji: 'ko' },
      { kana: 'ろ', romaji: 'ro' },
    ],
    meaning: 'aproximadamente, hacia',
  },
  {
    id: 'soko',
    units: [
      { kana: 'そ', romaji: 'so' },
      { kana: 'こ', romaji: 'ko' },
    ],
    meaning: 'ahí, ese lugar',
  },
  {
    id: 'sono',
    units: [
      { kana: 'そ', romaji: 'so' },
      { kana: 'の', romaji: 'no' },
    ],
    meaning: 'ese, esa',
  },
  {
    id: 'toufu',
    units: [
      { kana: 'と', romaji: 'to' },
      { kana: 'う', romaji: 'u' },
      { kana: 'ふ', romaji: 'fu' },
    ],
    meaning: 'tofu',
  },
  {
    id: 'furo',
    units: [
      { kana: 'ふ', romaji: 'fu' },
      { kana: 'ろ', romaji: 'ro' },
    ],
    meaning: 'baño',
  },
  {
    id: 'hou',
    units: [
      { kana: 'ほ', romaji: 'ho' },
      { kana: 'う', romaji: 'u' },
    ],
    meaning: 'manera, dirección',
  },
  {
    id: 'ashita',
    units: [
      { kana: 'あ', romaji: 'a' },
      { kana: 'し', romaji: 'shi' },
      { kana: 'た', romaji: 'ta' },
    ],
    meaning: 'mañana',
  },
  {
    id: 'isu',
    units: [
      { kana: 'い', romaji: 'i' },
      { kana: 'す', romaji: 'su' },
    ],
    meaning: 'silla',
  },
  {
    id: 'urusai',
    units: [
      { kana: 'う', romaji: 'u' },
      { kana: 'る', romaji: 'ru' },
      { kana: 'さ', romaji: 'sa' },
      { kana: 'い', romaji: 'i' },
    ],
    meaning: 'ruidoso, molesto',
  },
  {
    id: 'kakaru',
    units: [
      { kana: 'か', romaji: 'ka' },
      { kana: 'か', romaji: 'ka' },
      { kana: 'る', romaji: 'ru' },
    ],
    meaning: 'costar, tardar',
  },
  {
    id: 'kakeru',
    units: [
      { kana: 'か', romaji: 'ka' },
      { kana: 'け', romaji: 'ke' },
      { kana: 'る', romaji: 'ru' },
    ],
    meaning: 'ponerse gafas',
  },
  {
    id: 'kakeru-2',
    units: [
      { kana: 'か', romaji: 'ka' },
      { kana: 'け', romaji: 'ke' },
      { kana: 'る', romaji: 'ru' },
    ],
    meaning: 'llamar por teléfono',
  },
  {
    id: 'kirei',
    units: [
      { kana: 'き', romaji: 'ki' },
      { kana: 'れ', romaji: 're' },
      { kana: 'い', romaji: 'i' },
    ],
    meaning: 'bonito, limpio',
  },
  {
    id: 'kotae',
    units: [
      { kana: 'こ', romaji: 'ko' },
      { kana: 'た', romaji: 'ta' },
      { kana: 'え', romaji: 'e' },
    ],
    meaning: 'respuesta',
  },
  {
    id: 'kotaekata',
    units: [
      { kana: 'こ', romaji: 'ko' },
      { kana: 'た', romaji: 'ta' },
      { kana: 'え', romaji: 'e' },
      { kana: 'か', romaji: 'ka' },
      { kana: 'た', romaji: 'ta' },
    ],
    meaning: 'forma de responder',
  },
  {
    id: 'saa',
    units: [
      { kana: 'さ', romaji: 'sa' },
      { kana: 'あ', romaji: 'a' },
    ],
    meaning: 'bueno, venga',
  },
  {
    id: 'shikashi',
    units: [
      { kana: 'し', romaji: 'shi' },
      { kana: 'か', romaji: 'ka' },
      { kana: 'し', romaji: 'shi' },
    ],
    meaning: 'pero, sin embargo',
  },
  {
    id: 'sushi',
    units: [
      { kana: 'す', romaji: 'su' },
      { kana: 'し', romaji: 'shi' },
    ],
    meaning: 'sushi',
  },
  {
    id: 'suru',
    units: [
      { kana: 'す', romaji: 'su' },
      { kana: 'る', romaji: 'ru' },
    ],
    meaning: 'hacer',
  },
  {
    id: 'anata',
    units: [
      { kana: 'あ', romaji: 'a' },
      { kana: 'な', romaji: 'na' },
      { kana: 'た', romaji: 'ta' },
    ],
    meaning: 'tú, usted',
  },
  {
    id: 'ikutsu',
    units: [
      { kana: 'い', romaji: 'i' },
      { kana: 'く', romaji: 'ku' },
      { kana: 'つ', romaji: 'tsu' },
    ],
    meaning: 'cuántos, qué edad',
  },
  {
    id: 'itsu',
    units: [
      { kana: 'い', romaji: 'i' },
      { kana: 'つ', romaji: 'tsu' },
    ],
    meaning: 'cuándo',
  },
  {
    id: 'uchi',
    units: [
      { kana: 'う', romaji: 'u' },
      { kana: 'ち', romaji: 'chi' },
    ],
    meaning: 'casa propia',
  },
  {
    id: 'onaka',
    units: [
      { kana: 'お', romaji: 'o' },
      { kana: 'な', romaji: 'na' },
      { kana: 'か', romaji: 'ka' },
    ],
    meaning: 'estómago, barriga',
  },
  {
    id: 'soushite-soshite',
    units: [
      { kana: 'そ', romaji: 'so' },
      { kana: 'う', romaji: 'u' },
      { kana: 'し', romaji: 'shi' },
      { kana: 'て', romaji: 'te' },
    ],
    meaning: 'y, y entonces',
  },
  {
    id: 'taitei',
    units: [
      { kana: 'た', romaji: 'ta' },
      { kana: 'い', romaji: 'i' },
      { kana: 'て', romaji: 'te' },
      { kana: 'い', romaji: 'i' },
    ],
    meaning: 'normalmente, por lo general',
  },
  {
    id: 'tachi',
    units: [
      { kana: 'た', romaji: 'ta' },
      { kana: 'ち', romaji: 'chi' },
    ],
    meaning: 'plural de personas',
  },
  {
    id: 'tate',
    units: [
      { kana: 'た', romaji: 'ta' },
      { kana: 'て', romaji: 'te' },
    ],
    meaning: 'longitud, altura',
  },
  {
    id: 'tsu',
    units: [{ kana: 'つ', romaji: 'tsu' }],
    meaning: 'contador general de objetos',
  },
  {
    id: 'tsukeru',
    units: [
      { kana: 'つ', romaji: 'tsu' },
      { kana: 'け', romaji: 'ke' },
      { kana: 'る', romaji: 'ru' },
    ],
    meaning: 'encender',
  },
  {
    id: 'nai',
    units: [
      { kana: 'な', romaji: 'na' },
      { kana: 'い', romaji: 'i' },
    ],
    meaning: 'no haber, no tener',
  },
  {
    id: 'naru',
    units: [
      { kana: 'な', romaji: 'na' },
      { kana: 'る', romaji: 'ru' },
    ],
    meaning: 'convertirse, llegar a ser',
  },
  {
    id: 'nuru',
    units: [
      { kana: 'ぬ', romaji: 'nu' },
      { kana: 'る', romaji: 'ru' },
    ],
    meaning: 'pintar, untar',
  },
  {
    id: 'achira',
    units: [
      { kana: 'あ', romaji: 'a' },
      { kana: 'ち', romaji: 'chi' },
      { kana: 'ら', romaji: 'ra' },
    ],
    meaning: 'allí, aquel lado',
  },
  {
    id: 'ikura',
    units: [
      { kana: 'い', romaji: 'i' },
      { kana: 'く', romaji: 'ku' },
      { kana: 'ら', romaji: 'ra' },
    ],
    meaning: 'cuánto',
  },
  {
    id: 'itsumo',
    units: [
      { kana: 'い', romaji: 'i' },
      { kana: 'つ', romaji: 'tsu' },
      { kana: 'も', romaji: 'mo' },
    ],
    meaning: 'siempre',
  },
  {
    id: 'imoutosan',
    units: [
      { kana: 'い', romaji: 'i' },
      { kana: 'も', romaji: 'mo' },
      { kana: 'う', romaji: 'u' },
      { kana: 'と', romaji: 'to' },
      { kana: 'さ', romaji: 'sa' },
      { kana: 'ん', romaji: 'n' },
    ],
    meaning: 'hermana menor de otra persona',
  },
  {
    id: 'otoutosan',
    units: [
      { kana: 'お', romaji: 'o' },
      { kana: 'と', romaji: 'to' },
      { kana: 'う', romaji: 'u' },
      { kana: 'と', romaji: 'to' },
      { kana: 'さ', romaji: 'sa' },
      { kana: 'ん', romaji: 'n' },
    ],
    meaning: 'hermano menor de otra persona',
  },
  {
    id: 'omoshiroi',
    units: [
      { kana: 'お', romaji: 'o' },
      { kana: 'も', romaji: 'mo' },
      { kana: 'し', romaji: 'shi' },
      { kana: 'ろ', romaji: 'ro' },
      { kana: 'い', romaji: 'i' },
    ],
    meaning: 'interesante, divertido',
  },
  {
    id: 'kantan',
    units: [
      { kana: 'か', romaji: 'ka' },
      { kana: 'ん', romaji: 'n' },
      { kana: 'た', romaji: 'ta' },
      { kana: 'ん', romaji: 'n' },
    ],
    meaning: 'fácil, sencillo',
  },
  {
    id: 'kurai',
    units: [
      { kana: 'く', romaji: 'ku' },
      { kana: 'ら', romaji: 'ra' },
      { kana: 'い', romaji: 'i' },
    ],
    meaning: 'oscuro',
  },
  {
    id: 'kurai-gurai',
    units: [
      { kana: 'く', romaji: 'ku' },
      { kana: 'ら', romaji: 'ra' },
      { kana: 'い', romaji: 'i' },
    ],
    meaning: 'aproximadamente',
  },
  {
    id: 'kochira',
    units: [
      { kana: 'こ', romaji: 'ko' },
      { kana: 'ち', romaji: 'chi' },
      { kana: 'ら', romaji: 'ra' },
    ],
    meaning: 'aquí, este lado, esta persona',
  },
  {
    id: 'kochira-koso',
    units: [
      { kana: 'こ', romaji: 'ko' },
      { kana: 'ち', romaji: 'chi' },
      { kana: 'ら', romaji: 'ra' },
      { kana: 'こ', romaji: 'ko' },
      { kana: 'そ', romaji: 'so' },
    ],
    meaning: 'igualmente, el gusto es mío',
  },
  {
    id: 'konna',
    units: [
      { kana: 'こ', romaji: 'ko' },
      { kana: 'ん', romaji: 'n' },
      { kana: 'な', romaji: 'na' },
    ],
    meaning: 'así, de este tipo',
  },
  {
    id: 'konnichiwa',
    units: [],
    meaning: 'hola, buenas tardes',
  },
  {
    id: 'san',
    units: [
      { kana: 'さ', romaji: 'sa' },
      { kana: 'ん', romaji: 'n' },
    ],
    meaning: 'señor, señora',
  },
  {
    id: 'san-2',
    units: [
      { kana: 'さ', romaji: 'sa' },
      { kana: 'ん', romaji: 'n' },
    ],
    meaning: 'tres',
  },
  {
    id: 'sochira',
    units: [
      { kana: 'そ', romaji: 'so' },
      { kana: 'ち', romaji: 'chi' },
      { kana: 'ら', romaji: 'ra' },
    ],
    meaning: 'ahí, ese lado',
  },
  {
    id: 'sorekara',
    units: [
      { kana: 'そ', romaji: 'so' },
      { kana: 'れ', romaji: 're' },
      { kana: 'か', romaji: 'ka' },
      { kana: 'ら', romaji: 'ra' },
    ],
    meaning: 'y después, después de eso',
  },
  {
    id: 'taihen',
    units: [
      { kana: 'た', romaji: 'ta' },
      { kana: 'い', romaji: 'i' },
      { kana: 'へ', romaji: 'he' },
      { kana: 'ん', romaji: 'n' },
    ],
    meaning: 'muy, mucho',
  },
  {
    id: 'taihen-2',
    units: [
      { kana: 'た', romaji: 'ta' },
      { kana: 'い', romaji: 'i' },
      { kana: 'へ', romaji: 'he' },
      { kana: 'ん', romaji: 'n' },
    ],
    meaning: 'difícil, duro',
  },
  {
    id: 'takusan',
    units: [
      { kana: 'た', romaji: 'ta' },
      { kana: 'く', romaji: 'ku' },
      { kana: 'さ', romaji: 'sa' },
      { kana: 'ん', romaji: 'n' },
    ],
    meaning: 'mucho, muchos',
  },
  {
    id: 'tsukurikata',
    units: [
      { kana: 'つ', romaji: 'tsu' },
      { kana: 'く', romaji: 'ku' },
      { kana: 'り', romaji: 'ri' },
      { kana: 'か', romaji: 'ka' },
      { kana: 'た', romaji: 'ta' },
    ],
    meaning: 'forma de hacer, receta',
  },
  {
    id: 'totemo',
    units: [
      { kana: 'と', romaji: 'to' },
      { kana: 'て', romaji: 'te' },
      { kana: 'も', romaji: 'mo' },
    ],
    meaning: 'muy',
  },
  {
    id: 'hontou',
    units: [
      { kana: 'ほ', romaji: 'ho' },
      { kana: 'ん', romaji: 'n' },
      { kana: 'と', romaji: 'to' },
      { kana: 'う', romaji: 'u' },
    ],
    meaning: 'realmente, de verdad',
  },
  {
    id: 'mou',
    units: [
      { kana: 'も', romaji: 'mo' },
      { kana: 'う', romaji: 'u' },
    ],
    meaning: 'ya',
  },
  {
    id: 'mou-2',
    units: [
      { kana: 'も', romaji: 'mo' },
      { kana: 'う', romaji: 'u' },
    ],
    meaning: 'otra vez, más',
  },
  {
    id: 'moshimoshi',
    units: [
      { kana: 'も', romaji: 'mo' },
      { kana: 'し', romaji: 'shi' },
      { kana: 'も', romaji: 'mo' },
      { kana: 'し', romaji: 'shi' },
    ],
    meaning: 'hola, al teléfono',
  },
  {
    id: 'mochiron',
    units: [
      { kana: 'も', romaji: 'mo' },
      { kana: 'ち', romaji: 'chi' },
      { kana: 'ろ', romaji: 'ro' },
      { kana: 'ん', romaji: 'n' },
    ],
    meaning: 'por supuesto',
  },
  {
    id: 'morau',
    units: [
      { kana: 'も', romaji: 'mo' },
      { kana: 'ら', romaji: 'ra' },
      { kana: 'う', romaji: 'u' },
    ],
    meaning: 'recibir',
  },
  {
    id: 'amari',
    units: [
      { kana: 'あ', romaji: 'a' },
      { kana: 'ま', romaji: 'ma' },
      { kana: 'り', romaji: 'ri' },
    ],
    meaning: 'no mucho',
  },
  {
    id: 'omawarisan',
    units: [
      { kana: 'お', romaji: 'o' },
      { kana: 'ま', romaji: 'ma' },
      { kana: 'わ', romaji: 'wa' },
      { kana: 'り', romaji: 'ri' },
      { kana: 'さ', romaji: 'sa' },
      { kana: 'ん', romaji: 'n' },
    ],
    meaning: 'policía',
  },
  {
    id: 'oyasuminasai',
    units: [
      { kana: 'お', romaji: 'o' },
      { kana: 'や', romaji: 'ya' },
      { kana: 'す', romaji: 'su' },
      { kana: 'み', romaji: 'mi' },
      { kana: 'な', romaji: 'na' },
      { kana: 'さ', romaji: 'sa' },
      { kana: 'い', romaji: 'i' },
    ],
    meaning: 'buenas noches',
  },
  {
    id: 'kaitouyoushi',
    units: [
      { kana: 'か', romaji: 'ka' },
      { kana: 'い', romaji: 'i' },
      { kana: 'と', romaji: 'to' },
      { kana: 'う', romaji: 'u' },
      { kana: 'よ', romaji: 'yo' },
      { kana: 'う', romaji: 'u' },
      { kana: 'し', romaji: 'shi' },
    ],
    meaning: 'hoja de respuestas',
  },
  {
    id: 'kawaii',
    units: [
      { kana: 'か', romaji: 'ka' },
      { kana: 'わ', romaji: 'wa' },
      { kana: 'い', romaji: 'i' },
      { kana: 'い', romaji: 'i' },
    ],
    meaning: 'bonito, adorable',
  },
  {
    id: 'sayounara',
    units: [
      { kana: 'さ', romaji: 'sa' },
      { kana: 'よ', romaji: 'yo' },
      { kana: 'う', romaji: 'u' },
      { kana: 'な', romaji: 'na' },
      { kana: 'ら', romaji: 'ra' },
    ],
    meaning: 'adiós',
  },
  {
    id: 'shitsurei-shimashita',
    units: [
      { kana: 'し', romaji: 'shi' },
      { kana: 'つ', romaji: 'tsu' },
      { kana: 'れ', romaji: 're' },
      { kana: 'い', romaji: 'i' },
      { kana: 'し', romaji: 'shi' },
      { kana: 'ま', romaji: 'ma' },
      { kana: 'し', romaji: 'shi' },
      { kana: 'た', romaji: 'ta' },
    ],
    meaning: 'disculpe por la descortesía',
  },
  {
    id: 'shitsurei-shimasu',
    units: [
      { kana: 'し', romaji: 'shi' },
      { kana: 'つ', romaji: 'tsu' },
      { kana: 'れ', romaji: 're' },
      { kana: 'い', romaji: 'i' },
      { kana: 'し', romaji: 'shi' },
      { kana: 'ま', romaji: 'ma' },
      { kana: 'す', romaji: 'su' },
    ],
    meaning: 'con permiso, disculpe',
  },
  {
    id: 'sushiya',
    units: [
      { kana: 'す', romaji: 'su' },
      { kana: 'し', romaji: 'shi' },
      { kana: 'や', romaji: 'ya' },
    ],
    meaning: 'restaurante de sushi',
  },
  {
    id: 'sumimasen',
    units: [
      { kana: 'す', romaji: 'su' },
      { kana: 'み', romaji: 'mi' },
      { kana: 'ま', romaji: 'ma' },
      { kana: 'せ', romaji: 'se' },
      { kana: 'ん', romaji: 'n' },
    ],
    meaning: 'disculpe, lo siento',
  },
  {
    id: 'tsumaranai',
    units: [
      { kana: 'つ', romaji: 'tsu' },
      { kana: 'ま', romaji: 'ma' },
      { kana: 'ら', romaji: 'ra' },
      { kana: 'な', romaji: 'na' },
      { kana: 'い', romaji: 'i' },
    ],
    meaning: 'aburrido, insignificante',
  },
  {
    id: 'honya',
    units: [
      { kana: 'ほ', romaji: 'ho' },
      { kana: 'ん', romaji: 'n' },
      { kana: 'や', romaji: 'ya' },
    ],
    meaning: 'librería',
  },
  {
    id: 'mata',
    units: [
      { kana: 'ま', romaji: 'ma' },
      { kana: 'た', romaji: 'ta' },
    ],
    meaning: 'otra vez, además',
  },
  {
    id: 'minna',
    units: [
      { kana: 'み', romaji: 'mi' },
      { kana: 'ん', romaji: 'n' },
      { kana: 'な', romaji: 'na' },
    ],
    meaning: 'todos, todo el mundo',
  },
  {
    id: 'yaru',
    units: [
      { kana: 'や', romaji: 'ya' },
      { kana: 'る', romaji: 'ru' },
    ],
    meaning: 'hacer',
  },
  {
    id: 'yoku',
    units: [
      { kana: 'よ', romaji: 'yo' },
      { kana: 'く', romaji: 'ku' },
    ],
    meaning: 'a menudo',
  },
  {
    id: 'yoku-2',
    units: [
      { kana: 'よ', romaji: 'yo' },
      { kana: 'く', romaji: 'ku' },
    ],
    meaning: 'bien, hábilmente',
  },
  {
    id: 'yoroshiku',
    units: [
      { kana: 'よ', romaji: 'yo' },
      { kana: 'ろ', romaji: 'ro' },
      { kana: 'し', romaji: 'shi' },
      { kana: 'く', romaji: 'ku' },
    ],
    meaning: 'encantado; cuento contigo',
  },
  {
    id: 'agaru',
    units: [
      { kana: 'あ', romaji: 'a' },
      { kana: 'が', romaji: 'ga' },
      { kana: 'る', romaji: 'ru' },
    ],
    meaning: 'subir',
  },
  {
    id: 'abiru',
    units: [
      { kana: 'あ', romaji: 'a' },
      { kana: 'び', romaji: 'bi' },
      { kana: 'る', romaji: 'ru' },
    ],
    meaning: 'ducharse, bañarse',
  },
  {
    id: 'arigatou-gozaimasu',
    units: [
      { kana: 'あ', romaji: 'a' },
      { kana: 'り', romaji: 'ri' },
      { kana: 'が', romaji: 'ga' },
      { kana: 'と', romaji: 'to' },
      { kana: 'う', romaji: 'u' },
      { kana: 'ご', romaji: 'go' },
      { kana: 'ざ', romaji: 'za' },
      { kana: 'い', romaji: 'i' },
      { kana: 'ま', romaji: 'ma' },
      { kana: 'す', romaji: 'su' },
    ],
    meaning: 'muchas gracias',
  },
  {
    id: 'ikaga',
    units: [
      { kana: 'い', romaji: 'i' },
      { kana: 'か', romaji: 'ka' },
      { kana: 'が', romaji: 'ga' },
    ],
    meaning: 'cómo, qué tal',
  },
  {
    id: 'itadakimasu',
    units: [
      { kana: 'い', romaji: 'i' },
      { kana: 'た', romaji: 'ta' },
      { kana: 'だ', romaji: 'da' },
      { kana: 'き', romaji: 'ki' },
      { kana: 'ま', romaji: 'ma' },
      { kana: 'す', romaji: 'su' },
    ],
    meaning: 'expresión antes de comer',
  },
  {
    id: 'erabu',
    units: [
      { kana: 'え', romaji: 'e' },
      { kana: 'ら', romaji: 'ra' },
      { kana: 'ぶ', romaji: 'bu' },
    ],
    meaning: 'elegir',
  },
  {
    id: 'oide-ni-naru',
    units: [
      { kana: 'お', romaji: 'o' },
      { kana: 'い', romaji: 'i' },
      { kana: 'で', romaji: 'de' },
      { kana: 'に', romaji: 'ni' },
      { kana: 'な', romaji: 'na' },
      { kana: 'る', romaji: 'ru' },
    ],
    meaning: 'venir, ir o estar (honorífico)',
  },
  {
    id: 'ogenki-de',
    units: [
      { kana: 'お', romaji: 'o' },
      { kana: 'げ', romaji: 'ge' },
      { kana: 'ん', romaji: 'n' },
      { kana: 'き', romaji: 'ki' },
      { kana: 'で', romaji: 'de' },
    ],
    meaning: 'cuídese, que le vaya bien',
  },
  {
    id: 'ojiisan',
    units: [
      { kana: 'お', romaji: 'o' },
      { kana: 'じ', romaji: 'ji' },
      { kana: 'い', romaji: 'i' },
      { kana: 'さ', romaji: 'sa' },
      { kana: 'ん', romaji: 'n' },
    ],
    meaning: 'abuelo, anciano',
  },
  {
    id: 'onigiri',
    units: [
      { kana: 'お', romaji: 'o' },
      { kana: 'に', romaji: 'ni' },
      { kana: 'ぎ', romaji: 'gi' },
      { kana: 'り', romaji: 'ri' },
    ],
    meaning: 'bola de arroz',
  },
  {
    id: 'onegaishimasu',
    units: [
      { kana: 'お', romaji: 'o' },
      { kana: 'ね', romaji: 'ne' },
      { kana: 'が', romaji: 'ga' },
      { kana: 'い', romaji: 'i' },
      { kana: 'し', romaji: 'shi' },
      { kana: 'ま', romaji: 'ma' },
      { kana: 'す', romaji: 'su' },
    ],
    meaning: 'por favor',
  },
  {
    id: 'ohayou-gozaimasu',
    units: [
      { kana: 'お', romaji: 'o' },
      { kana: 'は', romaji: 'ha' },
      { kana: 'よ', romaji: 'yo' },
      { kana: 'う', romaji: 'u' },
      { kana: 'ご', romaji: 'go' },
      { kana: 'ざ', romaji: 'za' },
      { kana: 'い', romaji: 'i' },
      { kana: 'ま', romaji: 'ma' },
      { kana: 'す', romaji: 'su' },
    ],
    meaning: 'buenos días',
  },
  {
    id: 'obaasan',
    units: [
      { kana: 'お', romaji: 'o' },
      { kana: 'ば', romaji: 'ba' },
      { kana: 'あ', romaji: 'a' },
      { kana: 'さ', romaji: 'sa' },
      { kana: 'ん', romaji: 'n' },
    ],
    meaning: 'abuela, anciana',
  },
  {
    id: 'kagi',
    units: [
      { kana: 'か', romaji: 'ka' },
      { kana: 'ぎ', romaji: 'gi' },
    ],
    meaning: 'llave',
  },
  {
    id: 'kaban',
    units: [
      { kana: 'か', romaji: 'ka' },
      { kana: 'ば', romaji: 'ba' },
      { kana: 'ん', romaji: 'n' },
    ],
    meaning: 'bolso, cartera',
  },
  {
    id: 'kaburu',
    units: [
      { kana: 'か', romaji: 'ka' },
      { kana: 'ぶ', romaji: 'bu' },
      { kana: 'る', romaji: 'ru' },
    ],
    meaning: 'ponerse en cabeza',
  },
  {
    id: 'kangaeru',
    units: [
      { kana: 'か', romaji: 'ka' },
      { kana: 'ん', romaji: 'n' },
      { kana: 'が', romaji: 'ga' },
      { kana: 'え', romaji: 'e' },
      { kana: 'る', romaji: 'ru' },
    ],
    meaning: 'pensar, considerar',
  },
  {
    id: 'garu',
    units: [
      { kana: 'が', romaji: 'ga' },
      { kana: 'る', romaji: 'ru' },
    ],
    meaning: 'mostrar sensación',
  },
  {
    id: 'kudasai',
    units: [
      { kana: 'く', romaji: 'ku' },
      { kana: 'だ', romaji: 'da' },
      { kana: 'さ', romaji: 'sa' },
      { kana: 'い', romaji: 'i' },
    ],
    meaning: 'por favor, deme',
  },
  {
    id: 'konbanwa',
    units: [],
    meaning: 'buenas noches (saludo)',
  },
  {
    id: 'gochisousama-deshita',
    units: [
      { kana: 'ご', romaji: 'go' },
      { kana: 'ち', romaji: 'chi' },
      { kana: 'そ', romaji: 'so' },
      { kana: 'う', romaji: 'u' },
      { kana: 'さ', romaji: 'sa' },
      { kana: 'ま', romaji: 'ma' },
      { kana: 'で', romaji: 'de' },
      { kana: 'し', romaji: 'shi' },
      { kana: 'た', romaji: 'ta' },
    ],
    meaning: 'gracias por la comida',
  },
  {
    id: 'gomen-kudasai',
    units: [
      { kana: 'ご', romaji: 'go' },
      { kana: 'め', romaji: 'me' },
      { kana: 'ん', romaji: 'n' },
      { kana: 'く', romaji: 'ku' },
      { kana: 'だ', romaji: 'da' },
      { kana: 'さ', romaji: 'sa' },
      { kana: 'い', romaji: 'i' },
    ],
    meaning: 'hola, se puede',
  },
  {
    id: 'gomennasai',
    units: [
      { kana: 'ご', romaji: 'go' },
      { kana: 'め', romaji: 'me' },
      { kana: 'ん', romaji: 'n' },
      { kana: 'な', romaji: 'na' },
      { kana: 'さ', romaji: 'sa' },
      { kana: 'い', romaji: 'i' },
    ],
    meaning: 'lo siento, perdón',
  },
  {
    id: 'saigo',
    units: [
      { kana: 'さ', romaji: 'sa' },
      { kana: 'い', romaji: 'i' },
      { kana: 'ご', romaji: 'go' },
    ],
    meaning: 'final, último',
  },
  {
    id: 'sugi',
    units: [
      { kana: 'す', romaji: 'su' },
      { kana: 'ぎ', romaji: 'gi' },
    ],
    meaning: 'demasiado, más de',
  },
  {
    id: 'zutsu',
    units: [
      { kana: 'ず', romaji: 'zu' },
      { kana: 'つ', romaji: 'tsu' },
    ],
    meaning: 'cada uno, de uno en uno',
  },
  {
    id: 'sou-desu-ka',
    units: [
      { kana: 'そ', romaji: 'so' },
      { kana: 'う', romaji: 'u' },
      { kana: 'で', romaji: 'de' },
      { kana: 'す', romaji: 'su' },
      { kana: 'か', romaji: 'ka' },
    ],
    meaning: 'ah, ya veo',
  },
  {
    id: 'sou-desu-ne',
    units: [
      { kana: 'そ', romaji: 'so' },
      { kana: 'う', romaji: 'u' },
      { kana: 'で', romaji: 'de' },
      { kana: 'す', romaji: 'su' },
      { kana: 'ね', romaji: 'ne' },
    ],
    meaning: 'sí, así es; veamos',
  },
  {
    id: 'soba',
    units: [
      { kana: 'そ', romaji: 'so' },
      { kana: 'ば', romaji: 'ba' },
    ],
    meaning: 'cerca, al lado',
  },
  {
    id: 'soredewa',
    units: [],
    meaning: 'entonces, en ese caso',
  },
  {
    id: 'tadaima',
    units: [
      { kana: 'た', romaji: 'ta' },
      { kana: 'だ', romaji: 'da' },
      { kana: 'い', romaji: 'i' },
      { kana: 'ま', romaji: 'ma' },
    ],
    meaning: 'ya estoy en casa',
  },
  {
    id: 'tadashii',
    units: [
      { kana: 'た', romaji: 'ta' },
      { kana: 'だ', romaji: 'da' },
      { kana: 'し', romaji: 'shi' },
      { kana: 'い', romaji: 'i' },
    ],
    meaning: 'correcto',
  },
  {
    id: 'tabako',
    units: [
      { kana: 'た', romaji: 'ta' },
      { kana: 'ば', romaji: 'ba' },
      { kana: 'こ', romaji: 'ko' },
    ],
    meaning: 'tabaco, cigarrillos',
  },
  {
    id: 'tabun',
    units: [
      { kana: 'た', romaji: 'ta' },
      { kana: 'ぶ', romaji: 'bu' },
      { kana: 'ん', romaji: 'n' },
    ],
    meaning: 'quizá, probablemente',
  },
  {
    id: 'daitai',
    units: [
      { kana: 'だ', romaji: 'da' },
      { kana: 'い', romaji: 'i' },
      { kana: 'た', romaji: 'ta' },
      { kana: 'い', romaji: 'i' },
    ],
    meaning: 'aproximadamente, en general',
  },
  {
    id: 'dakara',
    units: [
      { kana: 'だ', romaji: 'da' },
      { kana: 'か', romaji: 'ka' },
      { kana: 'ら', romaji: 'ra' },
    ],
    meaning: 'por eso, por lo tanto',
  },
  {
    id: 'dake',
    units: [
      { kana: 'だ', romaji: 'da' },
      { kana: 'け', romaji: 'ke' },
    ],
    meaning: 'solo, solamente',
  },
  {
    id: 'dandan',
    units: [
      { kana: 'だ', romaji: 'da' },
      { kana: 'ん', romaji: 'n' },
      { kana: 'だ', romaji: 'da' },
      { kana: 'ん', romaji: 'n' },
    ],
    meaning: 'gradualmente, poco a poco',
  },
  {
    id: 'dekiru',
    units: [
      { kana: 'で', romaji: 'de' },
      { kana: 'き', romaji: 'ki' },
      { kana: 'る', romaji: 'ru' },
    ],
    meaning: 'poder, ser capaz',
  },
  {
    id: 'dewa',
    units: [],
    meaning: 'entonces, bien',
  },
  {
    id: 'demo',
    units: [
      { kana: 'で', romaji: 'de' },
      { kana: 'も', romaji: 'mo' },
    ],
    meaning: 'pero, sin embargo',
  },
  {
    id: 'do',
    units: [{ kana: 'ど', romaji: 'do' }],
    meaning: 'veces, ocasiones',
  },
  {
    id: 'do-2',
    units: [{ kana: 'ど', romaji: 'do' }],
    meaning: 'sábado (abreviatura)',
  },
  {
    id: 'dou',
    units: [
      { kana: 'ど', romaji: 'do' },
      { kana: 'う', romaji: 'u' },
    ],
    meaning: 'cómo, de qué manera',
  },
  {
    id: 'dou-itashimashite',
    units: [
      { kana: 'ど', romaji: 'do' },
      { kana: 'う', romaji: 'u' },
      { kana: 'い', romaji: 'i' },
      { kana: 'た', romaji: 'ta' },
      { kana: 'し', romaji: 'shi' },
      { kana: 'ま', romaji: 'ma' },
      { kana: 'し', romaji: 'shi' },
      { kana: 'て', romaji: 'te' },
    ],
    meaning: 'de nada',
  },
  {
    id: 'doushite',
    units: [
      { kana: 'ど', romaji: 'do' },
      { kana: 'う', romaji: 'u' },
      { kana: 'し', romaji: 'shi' },
      { kana: 'て', romaji: 'te' },
    ],
    meaning: 'por qué',
  },
  {
    id: 'douzo',
    units: [
      { kana: 'ど', romaji: 'do' },
      { kana: 'う', romaji: 'u' },
      { kana: 'ぞ', romaji: 'zo' },
    ],
    meaning: 'por favor, adelante',
  },
  {
    id: 'doumo',
    units: [
      { kana: 'ど', romaji: 'do' },
      { kana: 'う', romaji: 'u' },
      { kana: 'も', romaji: 'mo' },
    ],
    meaning: 'gracias, mucho',
  },
  {
    id: 'doumo-arigatou',
    units: [
      { kana: 'ど', romaji: 'do' },
      { kana: 'う', romaji: 'u' },
      { kana: 'も', romaji: 'mo' },
      { kana: 'あ', romaji: 'a' },
      { kana: 'り', romaji: 'ri' },
      { kana: 'が', romaji: 'ga' },
      { kana: 'と', romaji: 'to' },
      { kana: 'う', romaji: 'u' },
    ],
    meaning: 'muchas gracias',
  },
  {
    id: 'doko',
    units: [
      { kana: 'ど', romaji: 'do' },
      { kana: 'こ', romaji: 'ko' },
    ],
    meaning: 'dónde',
  },
  {
    id: 'dokoka',
    units: [
      { kana: 'ど', romaji: 'do' },
      { kana: 'こ', romaji: 'ko' },
      { kana: 'か', romaji: 'ka' },
    ],
    meaning: 'algún lugar, en algún sitio',
  },
  {
    id: 'dochira',
    units: [
      { kana: 'ど', romaji: 'do' },
      { kana: 'ち', romaji: 'chi' },
      { kana: 'ら', romaji: 'ra' },
    ],
    meaning: 'cuál, qué dirección',
  },
  {
    id: 'donata',
    units: [
      { kana: 'ど', romaji: 'do' },
      { kana: 'な', romaji: 'na' },
      { kana: 'た', romaji: 'ta' },
    ],
    meaning: 'quién',
  },
  {
    id: 'dono',
    units: [
      { kana: 'ど', romaji: 'do' },
      { kana: 'の', romaji: 'no' },
    ],
    meaning: 'qué, cuál',
  },
  {
    id: 'dore',
    units: [
      { kana: 'ど', romaji: 'do' },
      { kana: 'れ', romaji: 're' },
    ],
    meaning: 'cuál de varios',
  },
  {
    id: 'donna',
    units: [
      { kana: 'ど', romaji: 'do' },
      { kana: 'ん', romaji: 'n' },
      { kana: 'な', romaji: 'na' },
    ],
    meaning: 'qué tipo de',
  },
  {
    id: 'nagara',
    units: [
      { kana: 'な', romaji: 'na' },
      { kana: 'が', romaji: 'ga' },
      { kana: 'ら', romaji: 'ra' },
    ],
    meaning: 'mientras',
  },
  {
    id: 'naze',
    units: [
      { kana: 'な', romaji: 'na' },
      { kana: 'ぜ', romaji: 'ze' },
    ],
    meaning: 'por qué',
  },
  {
    id: 'nado',
    units: [
      { kana: 'な', romaji: 'na' },
      { kana: 'ど', romaji: 'do' },
    ],
    meaning: 'etcétera, entre otros',
  },
  {
    id: 'nigiyaka',
    units: [
      { kana: 'に', romaji: 'ni' },
      { kana: 'ぎ', romaji: 'gi' },
      { kana: 'や', romaji: 'ya' },
      { kana: 'か', romaji: 'ka' },
    ],
    meaning: 'animado, concurrido',
  },
  {
    id: 'hajime-ni',
    units: [
      { kana: 'は', romaji: 'ha' },
      { kana: 'じ', romaji: 'ji' },
      { kana: 'め', romaji: 'me' },
      { kana: 'に', romaji: 'ni' },
    ],
    meaning: 'al principio, primero',
  },
  {
    id: 'hajimemashite',
    units: [
      { kana: 'は', romaji: 'ha' },
      { kana: 'じ', romaji: 'ji' },
      { kana: 'め', romaji: 'me' },
      { kana: 'ま', romaji: 'ma' },
      { kana: 'し', romaji: 'shi' },
      { kana: 'て', romaji: 'te' },
    ],
    meaning: 'encantado de conocerle',
  },
  {
    id: 'boku',
    units: [
      { kana: 'ぼ', romaji: 'bo' },
      { kana: 'く', romaji: 'ku' },
    ],
    meaning: 'yo (masculino informal)',
  },
  {
    id: 'mazui',
    units: [
      { kana: 'ま', romaji: 'ma' },
      { kana: 'ず', romaji: 'zu' },
      { kana: 'い', romaji: 'i' },
    ],
    meaning: 'malo de sabor, desagradable',
  },
  {
    id: 'mada',
    units: [
      { kana: 'ま', romaji: 'ma' },
      { kana: 'だ', romaji: 'da' },
    ],
    meaning: 'todavía, aún',
  },
  {
    id: 'mondaiyoushi',
    units: [
      { kana: 'も', romaji: 'mo' },
      { kana: 'ん', romaji: 'n' },
      { kana: 'だ', romaji: 'da' },
      { kana: 'い', romaji: 'i' },
      { kana: 'よ', romaji: 'yo' },
      { kana: 'う', romaji: 'u' },
      { kana: 'し', romaji: 'shi' },
    ],
    meaning: 'hoja de preguntas',
  },
  {
    id: 'mondairei',
    units: [
      { kana: 'も', romaji: 'mo' },
      { kana: 'ん', romaji: 'n' },
      { kana: 'だ', romaji: 'da' },
      { kana: 'い', romaji: 'i' },
      { kana: 'れ', romaji: 're' },
      { kana: 'い', romaji: 'i' },
    ],
    meaning: 'pregunta de ejemplo',
  },
  {
    id: 'yajirushi',
    units: [
      { kana: 'や', romaji: 'ya' },
      { kana: 'じ', romaji: 'ji' },
      { kana: 'る', romaji: 'ru' },
      { kana: 'し', romaji: 'shi' },
    ],
    meaning: 'flecha',
  },
  {
    id: 'ringo',
    units: [
      { kana: 'り', romaji: 'ri' },
      { kana: 'ん', romaji: 'n' },
      { kana: 'ご', romaji: 'go' },
    ],
    meaning: 'manzana',
  },
  {
    id: 'asatte',
    units: [],
    meaning: 'pasado mañana',
  },
  {
    id: 'acchi',
    units: [],
    meaning: 'allí, aquel lado',
  },
  {
    id: 'ittekimasu',
    units: [],
    meaning: 'me voy, hasta luego',
  },
  {
    id: 'e-3',
    units: [],
    meaning: 'eh, qué',
  },
  {
    id: 'kocchi',
    units: [],
    meaning: 'aquí, este lado',
  },
  {
    id: 'sekken',
    units: [],
    meaning: 'jabón',
  },
  {
    id: 'socchi',
    units: [],
    meaning: 'ahí, ese lado',
  },
  {
    id: 'docchi',
    units: [],
    meaning: 'cuál, qué dirección',
  },
  {
    id: 'massugu',
    units: [],
    meaning: 'recto, directamente',
  },
  {
    id: 'motte-iku',
    units: [],
    meaning: 'llevar algo',
  },
  {
    id: 'motto',
    units: [],
    meaning: 'más',
  },
  {
    id: 'rippa',
    units: [],
    meaning: 'espléndido, excelente',
  },
  {
    id: 'irasshaimase',
    units: [],
    meaning: 'bienvenido, qué desea',
  },
  {
    id: 'kyouto',
    units: [],
    meaning: 'Kioto',
  },
  {
    id: 'goshujin',
    units: [],
    meaning: 'marido de otra persona',
  },
  {
    id: 'shouyu',
    units: [],
    meaning: 'salsa de soja',
  },
  {
    id: 'ja-jaa',
    units: [],
    meaning: 'bueno, entonces',
  },
  {
    id: 'sou-shimashou',
    units: [],
    meaning: 'hagámoslo así',
  },
  {
    id: 'chawan',
    units: [],
    meaning: 'cuenco para arroz',
  },
  {
    id: 'choudo',
    units: [],
    meaning: 'exactamente, justo',
  },
  {
    id: 'chotto',
    units: [],
    meaning: 'un poco',
  },
  {
    id: 'toukyou',
    units: [],
    meaning: 'Tokio',
  },
  {
    id: 'ryokougaisha',
    units: [],
    meaning: 'agencia de viajes',
  },
  {
    id: 'ryokou-suru',
    units: [],
    meaning: 'viajar',
  },
  {
    id: 'uun',
    units: [],
    meaning: 'mmm, veamos',
  },
  {
    id: 'ee-2',
    units: [],
    meaning: 'mmm, veamos',
  },
  {
    id: 'keshigomu',
    units: [
      { kana: 'け', romaji: 'ke' },
      { kana: 'し', romaji: 'shi' },
      { kana: 'ゴ', romaji: 'go' },
      { kana: 'ム', romaji: 'mu' },
    ],
    meaning: 'goma de borrar',
  },
  {
    id: 'sugu-ni',
    units: [
      { kana: 'す', romaji: 'su' },
      { kana: 'ぐ', romaji: 'gu' },
      { kana: 'に', romaji: 'ni' },
    ],
    meaning: 'inmediatamente',
  },
  {
    id: 'dewa-mata',
    units: [],
    meaning: 'hasta luego',
  },
  {
    id: 'yukkuri-to',
    units: [],
    meaning: 'despacio, tranquilamente',
  },
]

export const VOCABULARY_BY_ID = new Map(VOCABULARY.map((word) => [word.id, word]))
