// Los kana del pasillo de hiragana.
//
// ── Cómo tienen que venir los trazos ───────────────────────────────────────
// Cada entrada de `strokes` es la línea CENTRAL de un trazo, no su contorno: el
// recorrido que haría el pincel, dibujado como camino abierto. Es lo que permite
// animarlo como si una mano lo estuviera escribiendo.
//
// Un contorno NO sirve. Si el trazo se saca convirtiendo una letra a curvas, lo
// que se obtiene es el borde de la forma, y al animarlo se dibujaría la silueta
// del kana en vez del kana.
//
// El orden del array es el orden de escritura, y el sentido de cada camino es el
// sentido en que se traza: la animación lo recorre de su primer punto al último.
import type { Kana } from '../types'

export const HIRAGANA: Kana[] = [
  {
    id: 'a',
    character: 'あ',
    romaji: 'a',
    // Grabado con VOICEVOX (四国めたん, estilo normal). WAV y no MP3 a propósito:
    // son clips de menos de medio segundo, y el silencio de codificación que el
    // MP3 mete delante de cada archivo se nota cuando lo que dura entero son 400
    // milisegundos. Pesa 19 KB: los 46 kana enteros ocupan un tercio de lo que
    // ocupa una sola de las ilustraciones.
    audio: '/audio/hiragana/b1/a.wav',
    mnemonic:
      'Nos imaginamos a nuestro amigo **A**rturo de la mesa redonda, pero en ' +
      'versión japonesa. Obviamente no podría levantar la espada con ' +
      'facilidad: deberá pedir el poder de sus amigos, así que mientras **A**rturo ' +
      'pide el poder de la **A**mistad se desgañita gritando **AAAAAAAAAAAAAAAA**.',
    strokeOrder: [
      'Los hombros, de izquierda a derecha.',
      'Desde la cabeza, un poco ladeado, pasando por el brazo izquierdo hasta ' +
        'volver a estar recto debajo de la cabeza, atravesando la espada clavada.',
      'En un trazo, desde el brazo izquierdo hasta la suela derecha, y hacer ' +
        'el recorrido por muslos, cadera hasta hasta la otra suela.',
    ],

    image: '/images/hiragana/hiragana-a.png',
    imageAlt:
      'Arturo, en versión japonesa, gritando mientras intenta levantar la ' + 'espada de la roca',

    // La silueta, sacada del glifo あ de Zen Kaku Gothic New —la fuente de texto de la
    // app—, elegida porque su trazo es de grosor uniforme y no lleva los remates
    // con los que una tipografía de imprenta une trazos que al escribir van sueltos.
    outline:
      'M424,857Q421,845 413,828Q405,811 394,801Q527,780 603,715Q678,649 678,557Q678,487 636,444Q593,400 521,383Q482,459 437,524Q391,588 343,638Q349,662 357,685Q364,707 372,727Q359,730 341,738Q322,746 313,752Q307,737 302,721Q296,705 291,688Q230,740 173,765Q116,790 72,783Q57,780 40,770Q23,760 12,738Q0,716 0,679Q0,607 33,543Q66,479 124,429Q182,378 255,350Q255,276 261,207Q193,212 133,214Q73,216 35,215L28,154Q67,158 131,157Q194,155 266,149Q271,107 276,69Q281,31 288,0L350,12Q343,40 338,74Q332,107 327,144Q404,136 475,124Q545,112 591,97L601,155Q551,170 476,182Q401,193 321,201Q318,232 317,265Q315,298 314,331Q365,319 419,319Q453,319 486,322Q494,303 503,284Q511,264 518,244L575,262Q568,280 561,298Q553,316 545,333Q633,355 688,412Q743,468 743,558Q743,673 658,751Q572,828 424,857ZM154,709Q180,698 211,676Q242,654 276,623Q266,573 262,519Q257,464 255,408Q199,433 155,474Q111,514 86,565Q61,615 61,671Q61,702 74,714Q87,725 108,723Q129,720 154,709ZM329,568Q364,528 398,480Q431,431 461,374Q451,373 441,373Q430,372 419,372Q365,372 314,387Q316,433 319,479Q322,524 329,568Z',

    // Los tres trazos: la barra de arriba, la vertical y el bucle. El tercero
    // lleva más puntos que los otros a propósito: es una curva cerrada, y con
    // pocos vértices el camino salía demasiado recto.
    strokes: [
      'M47,186L114,188L188,184L245,178L306,174L417,165L490,149L570,135L595,128',
      'M319,6L299,136L284,253L285,314L284,404L288,481L298,558L307,634L341,736',
      'M547,255L474,415L415,502L342,596L256,684L168,734L123,750L83,752L54,747L38,714L29,681L31,646L39,608L51,569L68,534L89,501L118,472L149,444L184,414L222,395L243,381L329,357L399,350L458,347L574,363L602,389L653,418L684,454L703,501L712,550L710,593L695,646L670,694L629,735L586,771L539,793L490,814L444,827L412,834',
    ],
    strokeViewBox: '0 0 743 857',
    // Dónde se planta ese lienzo sobre la ilustración. Puesto a ojo sobre la
    // pose de Arturo: son los cuatro números a mover si el kana no cae donde
    // debe.
    strokeFit: { top: 12, right: 12, bottom: 8, left: 15 },
  },
]

// Acceso por id, que es como lo pide una página del tomo.
export const HIRAGANA_BY_ID = new Map(HIRAGANA.map((kana) => [kana.id, kana]))
