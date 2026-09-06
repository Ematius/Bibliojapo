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
  {
    id: 'i',
    character: 'い',
    romaji: 'i',
    audio: '/audio/hiragana/b1/i.wav',
    mnemonic:
      'En Japón son tan meticulosos que lo ven todo con lupa. Por eso, si miras ' +
      'con lupa un **i**mperdible, es el hiragana **い** sin problema alguno.',
    // Los dos trazos, contados sobre el imperdible: el cuerpo a la izquierda y la
    // aguja suelta a la derecha.
    strokeOrder: [
      'Desde lo alto del cuerpo del imperdible, bajando por toda su curva hasta ' +
        'el cierre, y girando con él hacia la derecha.',
      'La aguja, de la punta de arriba al extremo de abajo.',
    ],

    image: '/images/hiragana/hiragana-i.png',
    imageAlt:
      'Un imperdible abierto visto a través de una lupa: el cuerpo curvado a la ' +
      'izquierda y la aguja suelta a la derecha',

    // Mismo origen que la silueta de あ: el glifo de Zen Kaku Gothic New.
    outline:
      'M266,535Q243,549 218,553Q192,557 168,544Q143,531 121,494Q93,447 71,386Q48,325 32,259Q16,192 8,126Q0,59 1,0L65,1Q63,71 75,153Q87,235 111,312Q135,389 168,446Q187,477 207,481Q226,484 244,471Q270,453 299,422Q328,390 341,364Q348,377 360,393Q371,409 381,418Q369,437 349,460Q329,483 308,503Q286,523 266,535ZM676,360Q667,334 648,294Q628,254 604,210Q579,166 554,127Q528,87 508,63L561,30Q582,56 609,97Q635,137 662,183Q688,228 709,269Q729,309 739,335Q723,338 705,345Q687,352 676,360Z',

    // Dos trazos, no tres: い se escribe con dos, así que aquí solo hay dos. La
    // lista de `strokeOrder` mide lo mismo, que es lo que tienen que cumplir las
    // dos siempre.
    strokes: [
      'M29,1L57,227L90,361L137,461L161,501L191,519L230,520L265,496L301,462L360,396',
      'M536,46L612,167L704,342',
    ],
    strokeViewBox: '0 0 739 557',
    // Medido sobre el dibujo: el imperdible ocupa de un 22 % a un 79 % del ancho,
    // y el trazo queda centrado sobre él.
    //
    // El encaje no puede ser perfecto y no es un fallo: el imperdible del dibujo
    // es más alargado que い, que es un kana ancho y bajo (739 × 557). Como el SVG
    // entra con `meet` y sin deformarse, ajusta por el ancho y se centra en
    // vertical, así que los trazos no llegan ni a lo más alto del cuerpo ni a la
    // punta de la aguja. Estos son los cuatro números a mover si cae torcido.
    strokeFit: { top: 18, right: 21, bottom: 15, left: 22 },
  },
  {
    id: 'u',
    character: 'う',
    romaji: 'u',
    audio: '/audio/hiragana/b1/u.wav',
    mnemonic:
      'Sabrás que en Japón la industria de las **u**ñas es muy artística, por eso ' +
      'había que hacerle un hiragana, y ahí está la **う**: sencillamente es una ' +
      '**u**ña vista de lado, y lo que sobresale es el final de la brocha antes de ' +
      'pintar. Al ver este hiragana es inevitable pensar en **u**ña.',
    // Los dos trazos, contados sobre el dibujo: primero la brocha, luego la uña.
    strokeOrder: [
      'El final de la brocha, el trazo corto que sobresale por arriba: de ' +
        'izquierda a derecha.',
      'La uña vista de lado: desde el nacimiento, siguiendo su curva hasta la punta.',
    ],

    image: '/images/hiragana/hiragana-u.png',
    imageAlt:
      'Una uña vista de lado, pintada de rojo, con el frasco y la brocha de ' +
      'esmalte justo encima',

    // Mismo origen que la silueta de あ e い: el glifo de Zen Kaku Gothic New.
    outline:
      'M245,888Q235,878 216,867Q197,855 183,851Q249,808 302,744Q355,680 387,603Q418,525 418,442Q418,377 385,347Q351,317 304,317Q262,317 213,329Q163,341 118,361Q72,381 40,404Q36,393 23,374Q10,355 0,346Q39,325 91,304Q143,283 199,269Q255,255 304,255Q353,255 394,277Q434,298 459,340Q483,381 483,442Q483,532 452,616Q420,700 367,770Q313,840 245,888ZM399,153Q380,148 345,137Q309,125 268,110Q227,95 192,80Q156,65 138,55L169,0Q185,9 218,23Q250,36 289,51Q328,65 364,77Q399,88 420,93L399,153Z',

    // Dos trazos: el final de la brocha y la curva de la uña. Como en い, esta
    // lista mide lo mismo que `strokeOrder`.
    strokes: [
      'M157,29L406,127',
      'M23,370L322,274L443,365L410,666L218,865',
    ],
    strokeViewBox: '0 0 483 888',
    // A ojo sobre el dibujo, y provisional: la brocha cae sobre la punta del
    // pincel y la curva sobre la uña. Estos son los cuatro números a mover si el
    // kana no cae donde debe.
    strokeFit: { top: 17, right: 9, bottom: 33, left: 43 },
  },
  {
    id: 'e',
    character: 'え',
    romaji: 'e',
    audio: '/audio/hiragana/b1/e.wav',
    mnemonic:
      '**E**levado en el cielo se ve a un **E**squiador hacer zigzag y dejar una ' +
      'silueta en la nieve que tiene la forma exacta del hiragana **え**. **E**levado ' +
      'en el cielo, el **E**squiador hace un zigzag dibujando el hiragana **え** en ' +
      'la nieve.',
    // Los dos trazos, contados sobre la ladera: el corte de arriba y la traza
    // entera que baja hasta el esquiador.
    strokeOrder: [
      'El primer corte en la nieve, arriba del todo: corto y de izquierda a derecha.',
      'La traza entera: cruza a la derecha, baja en diagonal hasta el borde ' +
        'izquierdo, remonta y se cierra con la curva larga que llega al esquiador.',
    ],

    image: '/images/hiragana/hiragana-e.png',
    imageAlt:
      'Una ladera nevada vista desde arriba, con la traza en zigzag que ha dejado ' +
      'un esquiador y él mismo bajando al final del recorrido',

    // Mismo origen que las siluetas de あ, い y う: el glifo de Zen Kaku Gothic New.
    outline:
      'M53,829L0,789Q24,765 63,721Q102,676 149,621Q196,565 244,508Q291,450 332,399Q372,347 398,313Q361,320 315,327Q269,334 223,340Q177,346 139,351Q100,355 78,357L67,295Q89,295 126,292Q163,289 208,284Q253,279 300,272Q347,265 389,258Q431,250 461,242L507,284Q496,294 470,325Q444,355 411,396Q378,437 344,480Q355,475 375,478Q394,480 406,486Q433,500 446,529Q459,557 456,625Q454,690 463,720Q472,750 495,758Q517,766 553,766Q576,766 608,764Q640,761 673,757Q705,752 727,747Q724,758 723,780Q722,801 723,813Q677,820 628,825Q579,829 545,829Q490,829 456,814Q421,799 407,759Q393,719 397,645Q399,591 393,565Q386,539 363,529Q345,521 324,526Q302,530 282,555Q235,612 190,666Q145,720 109,763Q73,806 53,829ZM464,152Q445,147 410,135Q375,122 336,107Q297,92 264,78Q231,63 216,53L246,0Q259,8 290,22Q320,35 358,50Q395,64 430,76Q464,88 484,93L464,152Z',

    // Dos trazos. El segundo es el largo del bloque: va y vuelve sobre sí mismo
    // —derecha, diagonal abajo, remonte y curva final—, y por eso lleva nueve
    // puntos donde a los demás les bastan tres.
    strokes: [
      'M233,27L471,124',
      'M73,324L466,273L48,797L287,510L404,512L425,592L445,759L511,799L719,779',
    ],
    strokeViewBox: '0 0 727 829',
    // A ojo sobre el dibujo, y provisional: entra en la pasada única de encaje
    // que se hará al cerrar el contenido del tomo 1.
    strokeFit: { top: 20, right: 12, bottom: 20, left: 5 },
  },
]

// Acceso por id, que es como lo pide una página del tomo.
export const HIRAGANA_BY_ID = new Map(HIRAGANA.map((kana) => [kana.id, kana]))
