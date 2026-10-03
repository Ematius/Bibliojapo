// La media del vocabulario: el dibujo, su descripción y el audio de cada palabra.
//
// Vive aparte de `vocabulary.ts` porque ese archivo se GENERA del documento del temario
// —`node tools/build-vocabulary.mjs`— y esto no sale de ahí: es trabajo de ilustración y
// de grabación, con sus decisiones escritas al lado. Regenerar el temario no puede
// llevárselo por delante.
//
// La clave es el id del documento. Cuatro entradas cambiaron de id al rehacerse el
// temario y su media viene marcada: si se le asignara al id de antes, «no» saldría
// ilustrado con una casa y los palillos con un puente.
import type { Word } from '../types'

type WordMedia = Pick<Word, 'swatch' | 'image' | 'imageAlt' | 'audio'>

const MEDIA: Record<string, WordMedia> = {
  'au': {
    audio: '/audio/hiragana/b1/word/au.wav',
    image: '/images/hiragana/imagesSupport/au-meet.webp',
    imageAlt:
      'Dos chicas que se cruzan en una calle empedrada y se saludan inclinándose ' +
      'la una hacia la otra, sonriendo, con un torii al fondo',
  },
  'ao': {
    // El mismo azul, pero sustantivo: aparece como TEMA de una frase —「あおはいい」—,
    // no como lo que se dice de otra cosa, que es el papel de `aoi`.
    // El dibujo de `aoi` y no un círculo de color: suelto en la hoja del enunciado se
    // leía como una imagen que faltaba.
    image: '/images/hiragana/imagesSupport/aoi-blue.webp',
    imageAlt:
      'Un niño con kimono azul pintando una gran mancha azul con un pincel de ' +
      'caligrafía, junto a un cuenco de tinta azul, con hortensias azules y el ' +
      'monte Fuji al fondo',
    audio: '/audio/hiragana/b1/word/ao.wav',
  },
  'aoi': {
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
  'ii-yoi': {
    // La media que estaba en `ii`: el documento reasignó el id.
    audio: '/audio/hiragana/b1/word/ii.wav',
    image: '/images/hiragana/imagesSupport/ii-good.webp',
    imageAlt:
      'Una niña sonriente con los brazos formando un círculo por encima de la ' +
      'cabeza y un círculo rojo grande a su lado',
  },
  'iie': {
    audio: '/audio/hiragana/b1/word/iie.wav',
    image: '/images/hiragana/imagesSupport/iie-no.webp',
    imageAlt:
      'Un niño con los brazos cruzados en equis delante del pecho, negando con ' +
      'cara de convencido, y una equis roja grande a su lado',
  },
  'iu': {
    audio: '/audio/hiragana/b1/word/iu.wav',
    // El bocadillo va VACÍO: escribir dentro lo que dice sería poner en la hoja la
    // respuesta que se pide.
    image: '/images/hiragana/imagesSupport/iu-say.webp',
    imageAlt:
      'Un niño con kimono azul hablando con la mano abierta y un bocadillo de ' +
      'cómic vacío saliéndole de la boca',
  },
  'ie-2': {
    // La media que estaba en `ie`: el documento reasignó el id.
    audio: '/audio/hiragana/b1/word/ie.wav',
    // Las ilustraciones del vocabulario van en su propia carpeta, aparte de las
    // mnemotécnicas: estas son de la PALABRA, aquellas del kana.
    image: '/images/hiragana/imagesSupport/ie-house.webp',
    imageAlt:
      'Una casa de campo con tejado de teja roja y flores en las ventanas, en lo ' +
      'alto de una cuesta empedrada con el mar al fondo',
  },
  'ue': {
    audio: '/audio/hiragana/b1/word/ue.wav',
    image: '/images/hiragana/imagesSupport/ue-up.webp',
    imageAlt:
      'Un niño saltando con el brazo estirado hacia el cielo para alcanzar un ' +
      'globo azul que se le escapa, con una flecha roja que apunta hacia arriba',
  },
  'e-2': {
    // La media que estaba en `e`: el documento reasignó el id.
    // El mismo archivo que el kana: es un solo carácter y suena igual.
    audio: '/audio/hiragana/b1/e.wav',
    image: '/images/hiragana/imagesSupport/e-drawing.webp',
    imageAlt:
      'Un caballete de madera sobre el tatami con una lámina de acuarela sujeta ' +
      'con cinta, pintada con peces koi naranjas, y al lado un pincel, un bote ' +
      'de agua y una caja de acuarelas',
  },
  'ooi': {
    audio: '/audio/hiragana/b1/word/ooi.wav',
    image: '/images/hiragana/imagesSupport/ooi-many.webp',
    imageAlt:
      'Una chica sonriente abrazando un gatito entre los brazos, rodeada por ' +
      'decenas y decenas de gatitos más que llenan cestas y estanterías hasta el ' +
      'borde de la imagen',
  },
  'ha': {
    // No confundir con la PARTÍCULA は, que es gramática y vive en `grammar.ts`. Esta
    // es la palabra «diente», que se pronuncia «ha» y no «wa».
    // El mismo archivo que el kana: es un solo carácter y suena igual, así que
    // grabarla aparte sería tener dos copias del mismo sonido.
    audio: '/audio/hiragana/b1/word/ha.wav',
    image: '/images/hiragana/imagesSupport/ha-tooth.webp',
    imageAlt:
      'Una niña sonriendo con la boca muy abierta, con una flecha roja que ' +
      'señala uno de los dientes de arriba',
  },
  'hai': {
    audio: '/audio/hiragana/b1/word/hai.wav',
    image: '/images/hiragana/imagesSupport/hai-yes.webp',
    imageAlt:
      'Un niño con sudadera azul asintiendo con la cabeza, sonriendo, con flechas ' +
      'que marcan el movimiento y un bocadillo que dice «sí»',
  },
  'haha': {
    audio: '/audio/hiragana/b1/word/haha.wav',
    image: '/images/hiragana/imagesSupport/haha-mom.webp',
    imageAlt:
      'Una madre sonriente con los ojos cerrados abrazando a su hija pequeña, que ' +
      'ríe apoyada contra ella, en un salón luminoso con un osito de peluche al lado',
  },
  'aru': {
    audio: 'hiragana/b3/audio/word/aru.wav',
    image: 'hiragana/b3/images/imagesSupport/aru-exist.webp',
    imageAlt:
      'Un jarrón de porcelana con flores, solo en el centro de una sala de ' +
      'tatami con las puertas abiertas al jardín.',
  },
  'aru-2': {
    audio: 'hiragana/b3/audio/word/aru-2.wav',
    image: 'hiragana/b3/images/imagesSupport/aru-2-have.webp',
    imageAlt:
      'Una chica en la calle de un santuario cargada con su bolso, un cuaderno, ' +
      'un paraguas y una bolsa, con una flecha señalando cada cosa que lleva.',
  },
  'iru': {
    audio: 'hiragana/b3/audio/word/iru.wav',
    image: 'hiragana/b3/images/imagesSupport/iru-be.webp',
    imageAlt:
      'Un gato naranja sentado en el porche de madera de una casa japonesa, ' +
      'frente a un jardín con estanque.',
  },
  'iru-2': {
    audio: 'hiragana/b3/audio/word/iru-2.wav',
    image: 'hiragana/b3/images/imagesSupport/iru-2-need.webp',
    imageAlt:
      'Una chica empapada bajo la lluvia junto a un santuario, tapándose la ' +
      'cabeza con una mano y alcanzando un paraguas del paragüero con la otra.',
  },
  'oishii': {
    audio: 'hiragana/b3/audio/word/oishii.wav',
    image: 'hiragana/b3/images/imagesSupport/oishii-delicious.webp',
    imageAlt: 'Un cuenco de ramen humeante con chashu, huevo marinado y nori.',
  },
  // LOS DOS はし VAN CRUZADOS, y está bien: el temario intercambió sus ids. Antes
  // `hashi` era el puente y `hashi-2` los palillos; ahora es al revés, y la media sigue
  // a la PALABRA, no al id. Por eso los nombres de archivo no coinciden con su clave.
  //
  // No es un fallo que haya que «arreglar» emparejándolos por nombre: eso pondría el
  // puente en los palillos. Si algún día molesta, se renombran los cuatro archivos —en
  // `public/` y en el bucket— y se cambian estas rutas a la vez.
  'hashi': {
    // Los palillos, que antes eran `hashi-2`.
    audio: 'hiragana/b3/audio/word/hashi-2.wav',
    image: 'hiragana/b3/images/imagesSupport/hashi-2-chopsticks.webp',
    imageAlt: 'Una mano sujetando unos palillos, cogiendo una pieza de sushi de nigiri.',
  },
  'hashi-2': {
    // El puente, que antes era `hashi`.
    audio: 'hiragana/b3/audio/word/hashi.wav',
    image: 'hiragana/b3/images/imagesSupport/hashi-bridge.webp',
    imageAlt: 'Un puente rojo curvado sobre un estanque, entre cerezos en flor.',
  },
}

// Se la pega a las palabras generadas. Una palabra sin media se queda como está: el
// temario va por delante de los dibujos, y una lección incompleta no entra en el tomo.
export function withMedia(words: Word[]): Word[] {
  return words.map((word) => (MEDIA[word.id] ? { ...word, ...MEDIA[word.id] } : word))
}
