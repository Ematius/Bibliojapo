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
  'ima': {
    audio: 'hiragana/b2/audio/word/ima.wav',
    image: 'hiragana/b2/images/imagesSupport/ima-now.webp',
    imageAlt:
      'Un niño sonriente señalando con el dedo su propio reloj de pulsera, con ' +
      'unas rayas de énfasis junto a la muñeca.',
  },
  'mai': {
    audio: 'hiragana/b2/audio/word/mai.wav',
    image: 'hiragana/b2/images/imagesSupport/mai-flat.webp',
    imageAlt:
      'Un abanico de hojas de papel y tarjetas de colores junto a una pila de ' +
      'platos blancos, todos lisos y planos.',
  },
  'isu': {
    audio: 'hiragana/b2/audio/word/isu.wav',
    image: 'hiragana/b2/images/imagesSupport/isu-chair.webp',
    imageAlt: 'Una silla escolar con asiento y respaldo de madera clara sobre patas metálicas.',
  },
  'osu': {
    audio: 'hiragana/b2/audio/word/osu.wav',
    image: 'hiragana/b2/images/imagesSupport/osu-push.webp',
    imageAlt:
      'Una mano con el dedo índice presionando un botón rojo grande, con rayas ' +
      'de énfasis alrededor.',
  },
  'te': {
    audio: 'hiragana/b2/audio/word/te.wav',
    image: 'hiragana/b2/images/imagesSupport/te-hand.webp',
    imageAlt: 'Una mano abierta mostrando la palma y los cinco dedos extendidos.',
  },
  'sei': {
    audio: 'hiragana/b2/audio/word/sei.wav',
    image: 'hiragana/b2/images/imagesSupport/sei-height.webp',
    imageAlt:
      'Un niño sonriente de pie bajo un medidor de estatura, con rayas de ' +
      'énfasis sobre la cabeza.',
  },
  'sen': {
    audio: 'hiragana/b2/audio/word/sen.wav',
    image: 'hiragana/b2/images/imagesSupport/sen-thousand.webp',
    imageAlt:
      'Un cubo formado por cientos de cubitos amarillos apilados, con el ' +
      'número 1000 flotando encima.',
  },
  'en': {
    audio: 'hiragana/b2/audio/word/en.wav',
    image: 'hiragana/b2/images/imagesSupport/en-yen.webp',
    imageAlt:
      'Varios billetes japoneses de distinto valor en abanico, con monedas ' +
      'delante y un símbolo de yen grande al lado.',
  },
  'han': {
    audio: 'hiragana/b2/audio/word/han.wav',
    image: 'hiragana/b2/images/imagesSupport/han-half.webp',
    imageAlt: 'Una manzana roja cortada en dos mitades iguales, una junto a la otra.',
  },
  'sensei': {
    audio: 'hiragana/b2/audio/word/sensei.wav',
    image: 'hiragana/b2/images/imagesSupport/sensei-teacher.webp',
    imageAlt:
      'Un maestro de pie ante una pizarra en un aula tradicional japonesa, ' +
      'señalando lo escrito mientras sus alumnos lo miran desde sus pupitres bajos.',
  },
  'usui': {
    audio: 'hiragana/b2/audio/word/usui.wav',
    image: 'hiragana/b2/images/imagesSupport/usui-thin.webp',
    imageAlt:
      'Una hoja de papel washi sostenida al trasluz, tan fina que se transparenta ' +
      'la luz y la silueta de los dedos que la sujetan.',
  },
  'semai': {
    audio: 'hiragana/b2/audio/word/semai.wav',
    image: 'hiragana/b2/images/imagesSupport/semai-narrow.webp',
    imageAlt:
      'Dos niños cruzando de lado un callejón japonés tan estrecho que casi rozan ' +
      'las paredes de madera de las dos casas.',
  },
  'amai': {
    audio: 'hiragana/b2/audio/word/amai.wav',
    image: 'hiragana/b2/images/imagesSupport/amai-sweet.webp',
    imageAlt:
      'Una niña sonriente a punto de morder una brocheta de dango, con los ojos ' +
      'cerrados de gusto.',
  },
  'mazui': {
    audio: 'hiragana/b2/audio/word/mazui.wav',
    image: 'hiragana/b2/images/imagesSupport/mazui-nasty.webp',
    imageAlt:
      'Una niña con la cara arrugada de asco, apartando una ciruela encurtida que ' +
      'acaba de probar.',
  },
  'sui': {
    audio: 'hiragana/b2/audio/word/sui.wav',
    image: 'hiragana/b2/images/imagesSupport/sui-wednesday.webp',
    imageAlt:
      'Un calendario japonés de pared con la tercera columna de la semana señalada.',
  },
  'suu': {
    audio: 'hiragana/b2/audio/word/suu.wav',
    image: 'hiragana/b2/images/imagesSupport/suu-smoke.webp',
    imageAlt:
      'Un hombre con kimono aspirando de una pipa kiseru, con el humo subiendo en ' +
      'una voluta.',
  },
  // El sustantivo 前: el concepto de «antes». El sufijo 〜前 es `mae-2`, y van con
  // dibujos distintos porque en el ejercicio solo se oyen — las dos suenan «mae».
  'mae': {
    image: 'hiragana/b2/images/imagesSupport/mae-before.webp',
    imageAlt:
      'Un aula de terakoya al amanecer, con los pupitres y los pinceles ya puestos ' +
      'antes de que lleguen los alumnos.',
  },
  'mae-2': {
    image: 'hiragana/b2/images/imagesSupport/mae-2-in-front.webp',
    imageAlt: 'Un niño de pie justo delante de la entrada de una casa japonesa.',
  },
  // El sustantivo 晩, la noche. El contador 〜番 —turno, número— es `ban-2`.
  'ban': {
    audio: 'hiragana/b2/audio/word/ban.wav',
    image: 'hiragana/b2/images/imagesSupport/ban-night.webp',
    imageAlt:
      'Una aldea japonesa de noche bajo la luna llena, con los farolillos ' +
      'encendidos en las casas.',
  },
  'ban-2': {
    audio: 'hiragana/b2/audio/word/ban-2.wav',
    image: 'hiragana/b2/images/imagesSupport/ban-2-turn.webp',
    imageAlt:
      'Una mano sosteniendo un número de turno con el 3 en la sala de espera de ' +
      'una clínica.',
  },
  'maiban': {
    audio: 'hiragana/b2/audio/word/maiban.wav',
    image: 'hiragana/b2/images/imagesSupport/maiban-every-night.webp',
    imageAlt:
      'Una madre leyendo un cuento a su hija ya acostada, con la lámpara de la ' +
      'mesilla encendida.',
  },
  'man': {
    audio: 'hiragana/b2/audio/word/man.wav',
    image: 'hiragana/b2/images/imagesSupport/man-ten-thousand.webp',
    imageAlt:
      'Un comerciante mostrando con las dos manos un billete japonés de diez mil yenes.',
  },
  // «no», no la casa: esa es `ie-2`. Y el dibujo lo dice con un gesto porque una
  // negación no es una cosa que se pueda poner delante del lector.
  'ie': {
    audio: 'hiragana/b2/audio/word/ie.wav',
    image: 'hiragana/b2/images/imagesSupport/ie-no.webp',
    imageAlt:
      'Una niña negando con la cabeza y las manos cruzadas delante del pecho, el ' +
      'gesto japonés de decir que no.',
  },
}

// Se la pega a las palabras generadas. Una palabra sin media se queda como está: el
// temario va por delante de los dibujos, y una lección incompleta no entra en el tomo.
export function withMedia(words: Word[]): Word[] {
  return words.map((word) => (MEDIA[word.id] ? { ...word, ...MEDIA[word.id] } : word))
}
