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
//
// Al REGENERAR un dibujo hay que reescribir su `imageAlt`. El archivo conserva el
// nombre, así que nada falla y nada avisa: el alt viejo se queda describiendo un dibujo
// que ya no existe. Siete de este bloque llegaron así a producción, hablando de un
// cuenco de ramen y de un puente rojo que se habían cambiado meses antes.
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
      'Una mesa redonda de madera sola en una sala de piedra, con un jarrón ' +
      'blanco de flores encima y la luz de un ventanal cruzando el suelo.',
  },
  'aru-2': {
    audio: 'hiragana/b3/audio/word/aru-2.wav',
    image: 'hiragana/b3/images/imagesSupport/aru-2-have.webp',
    imageAlt:
      'Una viajera de espaldas asomada a un mirador, con la mochila cargada de ' +
      'farol, manta enrollada, brújula y bolsitas colgando.',
  },
  'iru': {
    audio: 'hiragana/b3/audio/word/iru.wav',
    image: 'hiragana/b3/images/imagesSupport/iru-be.webp',
    imageAlt:
      'Una chica sentada en un banco bajo un árbol, con un pájaro posado en el ' +
      'respaldo y otro a sus pies, frente a un valle con un lago.',
  },
  'iru-2': {
    audio: 'hiragana/b3/audio/word/iru-2.wav',
    image: 'hiragana/b3/images/imagesSupport/iru-2-need.webp',
    imageAlt:
      'Una chica enferma en la cama alargando la mano hacia el frasco de ' +
      'medicina y el vaso de agua de la mesilla.',
  },
  'oishii': {
    audio: 'hiragana/b3/audio/word/oishii.wav',
    image: 'hiragana/b3/images/imagesSupport/oishii-delicious.webp',
    imageAlt:
      'Una chica con los ojos cerrados y una sonrisa enorme llevándose una ' +
      'cucharada de guiso a la boca, ante una mesa llena de cazuelas y panes.',
  },
  // La media sigue a la PALABRA, no al id: `hashi` son los palillos y `hashi-2` el
  // puente, y el temario intercambió esos dos ids en su día. Los DIBUJOS ya están
  // renombrados y su nombre coincide con su clave; los AUDIOS siguen con el id viejo y
  // por eso van cruzados. Emparejarlos por nombre de archivo pondría el puente en los
  // palillos.
  'hashi': {
    audio: 'hiragana/b3/audio/word/hashi-2.wav',
    image: 'hiragana/b3/images/imagesSupport/hashi-chopsticks.webp',
    imageAlt:
      'Una mano sujetando unos palillos de madera, cogiendo un trozo de carne ' +
      'de un cuenco de guiso humeante.',
  },
  'hashi-2': {
    audio: 'hiragana/b3/audio/word/hashi.wav',
    image: 'hiragana/b3/images/imagesSupport/hashi-2-bridge.webp',
    imageAlt:
      'Un puente de piedra de un solo arco, cubierto de hiedra, cruzando un río ' +
      'entre laderas verdes.',
  },
  'shi': {
    audio: 'hiragana/b3/audio/word/shi.wav',
    image: 'hiragana/b3/images/imagesSupport/shi-four.webp',
    imageAlt:
      'Un «4» grande escrito con tiza en la pizarra verde de un aula vacía, con ' +
      'la luz entrando por un ventanal.',
  },
  'ashi': {
    audio: 'hiragana/b3/audio/word/ashi.wav',
    image: 'hiragana/b3/images/imagesSupport/ashi-foot.webp',
    imageAlt:
      'Las piernas descalzas de una chica metiéndose en el agua de un arroyo, ' +
      'con el vestido recogido y flores en la orilla.',
  },
  'shio': {
    audio: 'hiragana/b3/audio/word/shio.wav',
    image: 'hiragana/b3/images/imagesSupport/shio-salt.webp',
    imageAlt:
      'Un cuenco de cerámica desbordado de sal gruesa sobre una mesa de madera, ' +
      'con granos sueltos y una cuchara al lado.',
  },
  'sushi': {
    audio: 'hiragana/b3/audio/word/sushi.wav',
    image: 'hiragana/b3/images/imagesSupport/sushi-sushi.webp',
    imageAlt:
      'Una bandeja de madera con nigiris, makis y gunkan, con un cuenco de ' +
      'salsa de soja y jengibre encurtido al lado.',
  },
  'suzushii': {
    audio: 'hiragana/b3/audio/word/suzushii.wav',
    image: 'hiragana/b3/images/imagesSupport/suzushii-cool.webp',
    imageAlt:
      'Una chica sentada a la sombra de un árbol con los ojos cerrados y el ' +
      'pelo movido por la brisa, frente a un valle verde.',
  },
  'uru': {
    audio: 'hiragana/b3/audio/word/uru.wav',
    image: 'hiragana/b3/images/imagesSupport/uru-sell.webp',
    imageAlt:
      'Una vendedora sonriente alargando un manojo de verduras desde su puesto ' +
      'de mercado hacia una clienta de espaldas.',
  },
  'shiru': {
    audio: 'hiragana/b3/audio/word/shiru.wav',
    image: 'hiragana/b3/images/imagesSupport/shiru-know.webp',
    imageAlt:
      'Una chica apoyada en la mano, sonriendo sobre un libro abierto con ' +
      'ilustraciones, en una biblioteca iluminada por el sol.',
  },
  'suru': {
    audio: 'hiragana/b3/audio/word/suru.wav',
    image: 'hiragana/b3/images/imagesSupport/suru-do.webp',
    imageAlt:
      'Una artesana con delantal dando martillazos sobre una pieza en su banco ' +
      'de taller, con las herramientas colgadas detrás.',
  },
  'deru': {
    audio: 'hiragana/b3/audio/word/deru.wav',
    image: 'hiragana/b3/images/imagesSupport/deru-exit.webp',
    imageAlt:
      'Una persona cruzando el umbral de un portón hacia fuera, recortada ' +
      'contra la luz, con la ciudad abriéndose delante.',
  },
  'haru': {
    audio: 'hiragana/b3/audio/word/haru.wav',
    image: 'hiragana/b3/images/imagesSupport/haru-spring.webp',
    imageAlt:
      'Una chica sentada bajo un cerezo en flor, rodeada de pétalos rosas, con ' +
      'un valle lleno de flores al fondo.',
  },
  'haru-2': {
    audio: 'hiragana/b3/audio/word/haru-2.wav',
    image: 'hiragana/b3/images/imagesSupport/haru-2-stick.webp',
    imageAlt:
      'Una chica estirando los brazos para pegar un cartel de pergamino en un ' +
      'tablón de anuncios, alisándolo con la mano.',
  },
  'agaru': {
    audio: 'hiragana/b3/audio/word/agaru.wav',
    image: 'hiragana/b3/images/imagesSupport/agaru-rise.webp',
    imageAlt:
      'Una figura subiendo de espaldas una larga escalinata de piedra hacia un ' +
      'castillo, con la ciudad quedando abajo.',
  },
  'oriru': {
    audio: 'hiragana/b3/audio/word/oriru.wav',
    image: 'hiragana/b3/images/imagesSupport/oriru-get-off.webp',
    imageAlt:
      'Una chica bajando de un carruaje con un pie ya en el suelo, sujetándose ' +
      'del marco de la puerta, con el caballo esperando.',
  },
  'shimaru': {
    audio: 'hiragana/b3/audio/word/shimaru.wav',
    image: 'hiragana/b3/images/imagesSupport/shimaru-close.webp',
    imageAlt:
      'Un portón de madera de dos hojas cerrándose, con solo una rendija de luz ' +
      'entre ellas.',
  },
  'hairu': {
    audio: 'hiragana/b3/audio/word/hairu.wav',
    image: 'hiragana/b3/images/imagesSupport/hairu-enter.webp',
    imageAlt:
      'Una viajera con mochila cruzando hacia dentro la puerta de una taberna, ' +
      'con el salón iluminado al otro lado.',
  },
  'hashiru': {
    audio: 'hiragana/b3/audio/word/hashiru.wav',
    image: 'hiragana/b3/images/imagesSupport/hashiru-run.webp',
    imageAlt:
      'Una chica corriendo calle abajo por el empedrado, con la capa y el pelo ' +
      'al vuelo y una sonrisa.',
  },
  'magaru': {
    audio: 'hiragana/b3/audio/word/magaru.wav',
    image: 'hiragana/b3/images/imagesSupport/magaru-turn.webp',
    imageAlt:
      'Una viajera llegando a una curva del camino empedrado, con una flecha ' +
      'blanca pintada que señala hacia la izquierda.',
  },
  'marui': {
    audio: 'hiragana/b3/audio/word/marui.wav',
    image: 'hiragana/b3/images/imagesSupport/marui-round.webp',
    imageAlt:
      'Una gran esfera de piedra sobre un pedestal, medio cubierta de hiedra y ' +
      'florecillas blancas.',
  },
  'oshieru': {
    audio: 'hiragana/b3/audio/word/oshieru.wav',
    image: 'hiragana/b3/images/imagesSupport/oshieru-teach.webp',
    imageAlt:
      'Una chica señalando con el dedo un punto de un libro abierto mientras ' +
      'se lo explica a un niño que escucha atento.',
  },
  'hajimaru': {
    audio: 'hiragana/b3/audio/word/hajimaru.wav',
    image: 'hiragana/b3/images/imagesSupport/hajimaru-begin.webp',
    imageAlt:
      'Una viajera echando a andar por el camino al amanecer, recién cruzado ' +
      'el portón, con el sol saliendo sobre el valle.',
  },
  'ka': {
    audio: 'hiragana/b3/audio/word/ka.wav',
    image: 'hiragana/b3/images/imagesSupport/ka-tuesday.webp',
    imageAlt:
      'Siete placas colgadas de una viga, una por día de la semana, con la del ' +
      'fuego —el martes— encendida y destacada sobre las demás.',
  },
  'aka': {
    audio: 'hiragana/b3/audio/word/aka.wav',
    image: 'hiragana/b3/images/imagesSupport/aka-red.webp',
    imageAlt:
      'Una manzana roja brillante, sola en el centro de un muro de piedra, con ' +
      'un valle y un castillo detrás.',
  },
  'kau': {
    audio: 'hiragana/b3/audio/word/kau.wav',
    image: 'hiragana/b3/images/imagesSupport/kau-buy.webp',
    imageAlt:
      'Una clienta dando una moneda a un tendero que le tiende un frasquito ' +
      'azul por encima del mostrador de su puesto.',
  },
  'kao': {
    audio: 'hiragana/b3/audio/word/kao.wav',
    image: 'hiragana/b3/images/imagesSupport/kao-face.webp',
    imageAlt:
      'El rostro de una chica en primer plano, de tres cuartos, sonriendo y ' +
      'mirando a cámara.',
  },
  'kasu': {
    audio: 'hiragana/b3/audio/word/kasu.wav',
    image: 'hiragana/b3/images/imagesSupport/kasu-lend.webp',
    imageAlt:
      'Una viajera alargando un libro a un chico que lo recoge con las dos ' +
      'manos, por encima de un muro.',
  },
  'kaze': {
    audio: 'hiragana/b3/audio/word/kaze.wav',
    image: 'hiragana/b3/images/imagesSupport/kaze-wind.webp',
    imageAlt:
      'Una chica de espaldas en una ladera con el pelo, la capa y la cinta ' +
      'levantados por el viento, entre hojas y pétalos volando.',
  },
  'kaze-2': {
    audio: 'hiragana/b3/audio/word/kaze-2.wav',
    image: 'hiragana/b3/images/imagesSupport/kaze-2-cold.webp',
    imageAlt:
      'Una chica resfriada en la cama sonándose con un pañuelo, con un paño en ' +
      'la frente, una taza humeante y pañuelos usados al lado.',
  },
  'akai': {
    audio: 'hiragana/b3/audio/word/akai.wav',
    image: 'hiragana/b3/images/imagesSupport/akai-red.webp',
    imageAlt:
      'Una manzana roja sobre un muro de piedra entre hojas de otoño del mismo ' +
      'rojo, con un río y un castillo al fondo.',
  },
  'okashi': {
    audio: 'hiragana/b3/audio/word/okashi.wav',
    image: 'hiragana/b3/images/imagesSupport/okashi-sweets.webp',
    imageAlt:
      'Una chica riéndose mientras alarga la mano hacia una bandeja llena de ' +
      'galletas, macarons y pastas, con tarros de caramelos detrás.',
  },
  'kaesu': {
    audio: 'hiragana/b3/audio/word/kaesu.wav',
    image: 'hiragana/b3/images/imagesSupport/kaesu-return.webp',
    imageAlt:
      'Una chica devolviendo un libro con las dos manos a un chico que lo ' +
      'recoge, los dos de perfil junto a un muro.',
  },
  'kaeru': {
    audio: 'hiragana/b3/audio/word/kaeru.wav',
    image: 'hiragana/b3/images/imagesSupport/kaeru-go-home.webp',
    imageAlt:
      'Una chica de espaldas llegando a la puerta iluminada de su casa al ' +
      'atardecer, con el gato caminando a su lado.',
  },
  'kakaru': {
    audio: 'hiragana/b3/audio/word/kakaru.wav',
    image: 'hiragana/b3/images/imagesSupport/kakaru-take-time.webp',
    imageAlt:
      'Un reloj de arena de latón en marcha junto a varios montones de monedas ' +
      'de oro, sobre una mesa soleada.',
  },
  'katei': {
    audio: 'hiragana/b3/audio/word/katei.wav',
    image: 'hiragana/b3/images/imagesSupport/katei-home.webp',
    imageAlt:
      'Una familia entera cenando alrededor de la mesa en una cocina cálida, ' +
      'riéndose, con el perro dormido en primer plano.',
  },
  'kaban': {
    audio: 'hiragana/b3/audio/word/kaban.wav',
    image: 'hiragana/b3/images/imagesSupport/kaban-bag.webp',
    imageAlt:
      'Un bolso de cuero marrón con hebillas y bandolera, sobre una mesa de ' +
      'madera junto a un catalejo y un mapa enrollado.',
  },
  'kariru': {
    audio: 'hiragana/b3/audio/word/kariru.wav',
    image: 'hiragana/b3/images/imagesSupport/kariru-borrow.webp',
    imageAlt:
      'Una chica recibiendo un libro de manos del bibliotecario por encima del ' +
      'mostrador, con las estanterías detrás.',
  },
  'karui': {
    audio: 'hiragana/b3/audio/word/karui.wav',
    image: 'hiragana/b3/images/imagesSupport/karui-light.webp',
    imageAlt:
      'Una chica levantando con una sola mano y sin esfuerzo un baúl enorme, ' +
      'caminando sonriente con su perro por la calle.',
  },
  'kanji': {
    audio: 'hiragana/b3/audio/word/kanji.wav',
    image: 'hiragana/b3/images/imagesSupport/kanji-kanji.webp',
    imageAlt:
      'Una chica trazando un kanji con pincel y tinta sobre una hoja de papel, ' +
      'con la piedra de tinta al lado.',
  },
  'shizuka': {
    audio: 'hiragana/b3/audio/word/shizuka.wav',
    image: 'hiragana/b3/images/imagesSupport/shizuka-quiet.webp',
    imageAlt:
      'Una chica sentada en la galería de una casa con una taza entre las ' +
      'manos y los ojos cerrados, frente a un jardín con estanque.',
  },
  'jikan': {
    audio: 'hiragana/b3/audio/word/jikan.wav',
    image: 'hiragana/b3/images/imagesSupport/jikan-time.webp',
    imageAlt:
      'Un gran reloj de arena de latón rodeado de relojes de bolsillo y esferas ' +
      'antiguas sobre una mesa.',
  },
  'akarui': {
    audio: 'hiragana/b3/audio/word/akarui.wav',
    image: 'hiragana/b3/images/imagesSupport/akarui-bright.webp',
    imageAlt:
      'Una chica riendo con los brazos abiertos en un prado de flores blancas, ' +
      'bajo un cielo azul despejado.',
  },
  'eigakan': {
    audio: 'hiragana/b3/audio/word/eigakan.wav',
    image: 'hiragana/b3/images/imagesSupport/eigakan-cinema.webp',
    imageAlt:
      'La fachada iluminada de un cine al anochecer, con carteles a los lados, ' +
      'bombillas en la marquesina y gente entrando.',
  },
  'kangaeru': {
    audio: 'hiragana/b3/audio/word/kangaeru.wav',
    image: 'hiragana/b3/images/imagesSupport/kangaeru-think.webp',
    imageAlt:
      'Un chico con la mano en la barbilla, pensando frente a un libro y un ' +
      'mapa abiertos en una mesa de biblioteca.',
  },
  'eiga': {
    audio: 'hiragana/b3/audio/word/eiga.wav',
    image: 'hiragana/b3/images/imagesSupport/eiga-movie.webp',
    imageAlt:
      'Un proyector antiguo lanzando su haz sobre una pantalla donde se ve un ' +
      'dragón sobrevolando un castillo, con un espectador de espaldas.',
  },
  'ima': {
    audio: 'hiragana/b2/audio/word/ima.wav',
  },
  'mai': {
    audio: 'hiragana/b2/audio/word/mai.wav',
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
    audio: 'hiragana/b2/audio/word/mae.wav',
    image: 'hiragana/b2/images/imagesSupport/mae-before.webp',
    imageAlt:
      'Un aula de terakoya al amanecer, con los pupitres y los pinceles ya puestos ' +
      'antes de que lleguen los alumnos.',
  },
  'mae-2': {
    audio: 'hiragana/b2/audio/word/mae-2.wav',
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
  },
  'maiban': {
    audio: 'hiragana/b2/audio/word/maiban.wav',
  },
  'man': {
    audio: 'hiragana/b2/audio/word/man.wav',
    image: 'hiragana/b2/images/imagesSupport/man-ten-thousand.webp',
    imageAlt:
      'Un comerciante mostrando con las dos manos un billete japonés de diez mil yenes.',
  },
  'oozei': {
    audio: 'hiragana/b2/audio/word/oozei.wav',
    image: 'hiragana/b2/images/imagesSupport/oozei-crowd.webp',
    imageAlt:
      'Una calle de mercado japonesa llena de gente entre los puestos y los ' +
      'farolillos.',
  },
  'dewa': {
    audio: 'hiragana/b2/audio/word/dewa.wav',
  },
}

// Se la pega a las palabras generadas. Una palabra sin media se queda como está: el
// temario va por delante de los dibujos, y una lección incompleta no entra en el tomo.
export function withMedia(words: Word[]): Word[] {
  return words.map((word) => (MEDIA[word.id] ? { ...word, ...MEDIA[word.id] } : word))
}
