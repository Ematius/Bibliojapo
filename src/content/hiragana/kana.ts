// Cada entrada de `strokes` es la línea CENTRAL de un trazo, no su contorno: el
// recorrido del pincel, como camino abierto. Un contorno NO sirve —convertir una
// letra a curvas da el borde, y al animarlo se dibujaría la silueta del kana en vez
// del kana—. El orden del array y el sentido de cada camino son los de escritura.
//
// Están los 56 que son LECCIÓN. Los veinte dakuten no faltan por descuido: se aprenden
// sobre su kana base, en el mismo bloque que él, y no tienen trazo propio —son dos
// rayitas—. Qué dakuten estrena cada tomo lo dice `BLOCK_PLAN_DAKUTEN`.
//
// El `id` es lo que guardan los sellos, así que NO se cambia nunca: un kana puede pasar
// de un bloque a otro —し se fue al B3—, pero si cambiara su id, los exámenes ya
// superados dejarían de reconocerse.
import type { Kana } from '../types'

export const HIRAGANA: Kana[] = [
  {
    id: 'a',
    character: 'あ',
    romaji: 'a',
    // Grabado con VOICEVOX (四国めたん, estilo normal). WAV y no MP3: son clips de
    // menos de medio segundo, y el silencio que el MP3 mete delante se nota.
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

    image: '/images/hiragana/hiragana-a.webp',
    imageAlt:
      'Arturo, en versión japonesa, gritando mientras intenta levantar la ' + 'espada de la roca',

    // Las siluetas salen del glifo de Zen Kaku Gothic New —la fuente de la app—,
    // elegida porque su trazo es de grosor uniforme y no lleva remates.
    outline:
      'M424,857Q421,845 413,828Q405,811 394,801Q527,780 603,715Q678,649 678,557Q678,487 636,444Q593,400 521,383Q482,459 437,524Q391,588 343,638Q349,662 357,685Q364,707 372,727Q359,730 341,738Q322,746 313,752Q307,737 302,721Q296,705 291,688Q230,740 173,765Q116,790 72,783Q57,780 40,770Q23,760 12,738Q0,716 0,679Q0,607 33,543Q66,479 124,429Q182,378 255,350Q255,276 261,207Q193,212 133,214Q73,216 35,215L28,154Q67,158 131,157Q194,155 266,149Q271,107 276,69Q281,31 288,0L350,12Q343,40 338,74Q332,107 327,144Q404,136 475,124Q545,112 591,97L601,155Q551,170 476,182Q401,193 321,201Q318,232 317,265Q315,298 314,331Q365,319 419,319Q453,319 486,322Q494,303 503,284Q511,264 518,244L575,262Q568,280 561,298Q553,316 545,333Q633,355 688,412Q743,468 743,558Q743,673 658,751Q572,828 424,857ZM154,709Q180,698 211,676Q242,654 276,623Q266,573 262,519Q257,464 255,408Q199,433 155,474Q111,514 86,565Q61,615 61,671Q61,702 74,714Q87,725 108,723Q129,720 154,709ZM329,568Q364,528 398,480Q431,431 461,374Q451,373 441,373Q430,372 419,372Q365,372 314,387Q316,433 319,479Q322,524 329,568Z',

    // El tercero lleva más puntos a propósito: con pocos vértices la curva cerrada
    // salía demasiado recta.
    strokes: [
      'M47,186L114,188L188,184L245,178L306,174L417,165L490,149L570,135L595,128',
      'M319,6L299,136L284,253L285,314L284,404L288,481L298,558L307,634L341,736',
      'M547,255L474,415L415,502L342,596L256,684L168,734L123,750L83,752L54,747L38,714L29,681L31,646L39,608L51,569L68,534L89,501L118,472L149,444L184,414L222,395L243,381L329,357L399,350L458,347L574,363L602,389L653,418L684,454L703,501L712,550L710,593L695,646L670,694L629,735L586,771L539,793L490,814L444,827L412,834',
    ],
    strokeViewBox: '0 0 743 857',
  },
  {
    id: 'i',
    character: 'い',
    romaji: 'i',
    audio: '/audio/hiragana/b1/i.wav',
    mnemonic:
      'En Japón siempre van perfectos, pero nada es **i**mperdible, y lo saben, ' +
      'por eso siempre llevan consigo un **i**mperdible, así que hay que mirar ' +
      'con lupa en el bolso de un japonés y siempre encontraremos un **i**mperdible, ' +
      'para ir tan perfectos como ellos. ' +
      'Todo es gracias al hiragana **い**, es la razón de que vayan perfectos siempre.',
    strokeOrder: [
      'Desde lo alto del cuerpo del imperdible, bajando por toda su curva hasta ' +
        'el cierre, y girando con él hacia la derecha.',
      'La aguja, de la punta de arriba al extremo de abajo.',
    ],

    image: '/images/hiragana/hiragana-i.webp',
    imageAlt:
      'Un imperdible abierto visto a través de una lupa: el cuerpo curvado a la ' +
      'izquierda y la aguja suelta a la derecha',

    outline:
      'M266,535Q243,549 218,553Q192,557 168,544Q143,531 121,494Q93,447 71,386Q48,325 32,259Q16,192 8,126Q0,59 1,0L65,1Q63,71 75,153Q87,235 111,312Q135,389 168,446Q187,477 207,481Q226,484 244,471Q270,453 299,422Q328,390 341,364Q348,377 360,393Q371,409 381,418Q369,437 349,460Q329,483 308,503Q286,523 266,535ZM676,360Q667,334 648,294Q628,254 604,210Q579,166 554,127Q528,87 508,63L561,30Q582,56 609,97Q635,137 662,183Q688,228 709,269Q729,309 739,335Q723,338 705,345Q687,352 676,360Z',

    strokes: [
      'M29,1L57,227L90,361L137,461L161,501L191,519L230,520L265,496L301,462L360,396',
      'M536,46L612,167L704,342',
    ],
    strokeViewBox: '0 0 739 557',
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
    strokeOrder: [
      'El final de la brocha, el trazo corto que sobresale por arriba: de ' +
        'izquierda a derecha.',
      'La uña vista de lado: desde el nacimiento, siguiendo su curva hasta la punta.',
    ],

    image: '/images/hiragana/hiragana-u.webp',
    imageAlt:
      'Una uña vista de lado, pintada de rojo, con el frasco y la brocha de ' +
      'esmalte justo encima',

    outline:
      'M245,888Q235,878 216,867Q197,855 183,851Q249,808 302,744Q355,680 387,603Q418,525 418,442Q418,377 385,347Q351,317 304,317Q262,317 213,329Q163,341 118,361Q72,381 40,404Q36,393 23,374Q10,355 0,346Q39,325 91,304Q143,283 199,269Q255,255 304,255Q353,255 394,277Q434,298 459,340Q483,381 483,442Q483,532 452,616Q420,700 367,770Q313,840 245,888ZM399,153Q380,148 345,137Q309,125 268,110Q227,95 192,80Q156,65 138,55L169,0Q185,9 218,23Q250,36 289,51Q328,65 364,77Q399,88 420,93L399,153Z',

    strokes: ['M157,29L406,127', 'M23,370L322,274L443,365L410,666L218,865'],
    strokeViewBox: '0 0 483 888',
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
    strokeOrder: [
      'El primer corte en la nieve, arriba del todo: corto y de izquierda a derecha.',
      'La traza entera: cruza a la derecha, baja en diagonal hasta el borde ' +
        'izquierdo, remonta y se cierra con la curva larga que llega al esquiador.',
    ],

    image: '/images/hiragana/hiragana-e.webp',
    imageAlt:
      'Una ladera nevada vista desde arriba, con la traza en zigzag que ha dejado ' +
      'un esquiador y él mismo bajando al final del recorrido',

    outline:
      'M53,829L0,789Q24,765 63,721Q102,676 149,621Q196,565 244,508Q291,450 332,399Q372,347 398,313Q361,320 315,327Q269,334 223,340Q177,346 139,351Q100,355 78,357L67,295Q89,295 126,292Q163,289 208,284Q253,279 300,272Q347,265 389,258Q431,250 461,242L507,284Q496,294 470,325Q444,355 411,396Q378,437 344,480Q355,475 375,478Q394,480 406,486Q433,500 446,529Q459,557 456,625Q454,690 463,720Q472,750 495,758Q517,766 553,766Q576,766 608,764Q640,761 673,757Q705,752 727,747Q724,758 723,780Q722,801 723,813Q677,820 628,825Q579,829 545,829Q490,829 456,814Q421,799 407,759Q393,719 397,645Q399,591 393,565Q386,539 363,529Q345,521 324,526Q302,530 282,555Q235,612 190,666Q145,720 109,763Q73,806 53,829ZM464,152Q445,147 410,135Q375,122 336,107Q297,92 264,78Q231,63 216,53L246,0Q259,8 290,22Q320,35 358,50Q395,64 430,76Q464,88 484,93L464,152Z',

    strokes: [
      'M233,27L471,124',
      'M73,324L466,273L48,797L287,510L404,512L425,592L445,759L511,799L719,779',
    ],
    strokeViewBox: '0 0 727 829',
  },
  {
    id: 'o',
    character: 'お',
    romaji: 'o',
    audio: '/audio/hiragana/b1/o.wav',
    mnemonic:
      'La gran ola de Hokusai. Para este hiragana nos imaginamos el tsunami ' +
      'japonés: una **O**la gigante, con un surfista atravesándola sobre su tabla, ' +
      'y el tercer trazo son las gotas de espuma que saltan de la cresta. Ahí ' +
      'tienes el hiragana **お**.',
    strokeOrder: [
      'La tabla del surfista atravesando la ola: el trazo horizontal de arriba, ' +
        'de izquierda a derecha.',
      'La ola gigante que se enrosca: baja cruzando la tabla y termina ' +
        'rizándose en espuma abajo.',
      'La gota de espuma que salta de la cresta, suelta arriba a la derecha.',
    ],

    image: '/images/hiragana/hiragana-o.webp',
    imageAlt:
      'Un surfista deslizándose sobre una ola gigante que se enrosca en espiral, ' +
      'estilo Hokusai, con un grupo de gotas de espuma saltando aparte, arriba a ' +
      'la derecha',

    outline:
      'M235,796Q172,804 119,795Q66,785 34,757Q2,728 2,680Q2,610 60,549Q117,487 213,449L213,251Q158,257 105,260Q52,262 5,260L0,196Q42,200 98,198Q154,196 213,190L213,0L274,0L274,182Q328,174 377,164Q426,153 460,140L468,201Q429,214 379,225Q329,236 274,244L274,429Q316,417 363,411Q410,404 460,404Q545,404 609,429Q672,453 708,496Q743,539 743,595Q743,653 717,694Q691,734 647,754Q602,774 544,773Q399,771 353,622Q359,620 372,616Q384,611 397,606Q409,600 413,597Q428,652 459,681Q489,709 544,710Q603,711 640,681Q677,650 677,595Q677,553 649,523Q621,493 572,477Q523,460 460,461Q409,461 362,468Q315,475 274,488L274,753Q274,775 265,785Q255,794 235,796ZM189,740Q203,739 208,735Q213,731 213,721L213,511Q145,542 105,587Q65,631 65,678Q65,714 101,729Q137,743 189,740ZM751,342Q728,318 689,291Q650,264 607,240Q564,215 528,201L564,151Q588,161 619,178Q649,194 682,214Q714,234 743,254Q771,273 790,289Q787,292 778,304Q769,316 761,328Q753,339 751,342Z',

    strokes: [
      'M2,229L216,224L453,173',
      'M243,1L244,758L139,769L63,746L30,686L41,615L91,552L155,507L299,449L401,430L581,450L660,488L712,554L708,620L688,693L641,717L584,738L520,736L456,716L411,671L390,622',
      'M549,174L771,310',
    ],
    strokeViewBox: '0 0 790 804',
  },
  {
    id: 'ha',
    character: 'は',
    romaji: 'ha',
    audio: '/audio/hiragana/b1/word/ha.wav',
    mnemonic:
      'Para este hiragana vamos a viajar a los **ja**rdines **ja**poneses, esa paz ' +
      'que emanan. Por eso tendremos que imaginarnos a un **ja**ponés con sus ' +
      'herramientas en su **ja**rdín, eso sí: como siempre en **Ja**pón hacen tan ' +
      'poco ruido y es todo tan suave que en realidad se pronuncia **ha**.',
    strokeOrder: [
      'El mango y la pala de la herramienta de jardín, clavada en el suelo: el ' +
        'trazo vertical largo de la izquierda, de arriba abajo.',
      'La rama que cruza el tallo: el trazo horizontal, de izquierda a derecha.',
      'El tallo que baja desde arriba y se enrosca en la maceta de barro: el ' +
        'trazo largo de la derecha, que termina en el bucle de la olla.',
    ],

    image: '/images/hiragana/hiragana-ha.webp',
    imageAlt:
      'Una pala de jardín de mango de madera apoyada junto a una maceta de barro ' +
      'cubierta de musgo, de la que crece un tallo con flores de cerezo que se ' +
      'enrosca alrededor de ella, en un jardín japonés con una linterna de piedra ' +
      'y un cerezo en flor al fondo',

    outline:
      'M361,756Q293,754 257,721Q220,688 221,643Q221,614 240,588Q259,562 297,546Q334,529 388,529Q411,529 435,531Q458,533 480,537Q479,487 476,412Q473,337 471,243Q403,247 339,249Q274,250 230,248L225,182Q266,186 333,186Q399,186 470,182Q469,139 469,94Q468,49 468,0L531,0Q529,94 531,178Q596,173 650,167Q704,160 730,153L730,218Q702,223 649,229Q596,234 532,239Q534,340 538,421Q541,501 543,554Q649,588 760,673Q756,676 747,689Q738,701 730,713Q722,725 720,730Q674,689 631,662Q588,634 546,617L546,627Q546,696 495,727Q444,757 361,756ZM18,775Q11,739 7,680Q3,620 2,548Q0,475 2,397Q3,319 7,245Q11,171 18,109Q24,46 33,6L96,21Q86,58 79,117Q72,176 68,248Q63,319 62,395Q61,470 63,541Q65,612 70,670Q74,728 81,764L18,775ZM365,699Q422,699 453,681Q484,662 484,622Q484,617 484,611Q483,605 483,596Q459,590 435,588Q411,585 386,584Q334,584 308,603Q281,621 280,644Q280,666 302,683Q323,699 365,699Z',

    strokes: [
      'M61,23L29,387L33,650L53,768',
      'M229,218L731,197',
      'M499,1L517,669L476,701L415,722L331,727L261,682L256,601L326,563L401,554L476,564L589,601L667,643L739,701',
    ],
    strokeViewBox: '0 0 760 775',
  },
  {
    id: 'shi',
    character: 'し',
    romaji: 'shi',
    audio: 'hiragana/b3/audio/shi.wav',
    mnemonic:
      'Vas caminando por un campo japonés y ves algo tirado en el suelo: una ' +
      'seta enorme, caída y a punto de pudrirse. Estando en Japón, solo puede ' +
      'ser un **SHI**itake. Te agachas a mirarla de cerca y ahí está, calcada: ' +
      'el tronco recto cayendo hacia abajo y, justo donde el sombrero se le ha ' +
      'vencido, el mismo gancho curvo hacia la derecha que traza el propio kana.',
    strokeOrder: [
      'De arriba abajo en línea recta, como el tronco de la seta caída, y sin ' +
        'levantar el pincel, un giro curvo hacia la derecha que termina en ' +
        'gancho — el sombrero vencido del shiitake.',
    ],

    image: 'hiragana/b3/images/hiragana-shi.webp',
    imageAlt:
      'Un shiitake enorme visto desde abajo, con el tronco recto y el sombrero ' +
      'vencido hacia un lado, como si acabara de caer al suelo.',

    outline:
      'M196,809L196,809Q93,809 47,777Q0,744 0,656L0,656L0,0L71,4Q70,20 69,60Q67,100 ' +
      '66,150L66,150Q65,187 65,231Q64,275 64,324L64,324L64,648Q64,703 94,725Q124,746 ' +
      '199,746L199,746Q259,746 320,728Q380,710 434,681Q488,652 527,620L527,620Q527,626 ' +
      '530,642Q532,658 535,673Q537,687 538,692L538,692Q490,726 433,753Q375,779 315,794Q254,809 196,809',

    strokes: ['M33,11L29,152L32,328L27,502L20,666L71,757L162,774L256,781L343,754L426,727L516,671'],
    strokeViewBox: '0 0 538 809',
  },
  {
    id: 'ru',
    character: 'る',
    romaji: 'ru',
    audio: 'hiragana/b3/audio/ru.wav',
    mnemonic:
      'En Japón se llega a los santuarios por **RU**tas marcadas, y una buena ' +
      '**RU**ta japonesa no es una carretera cualquiera: baja recta, gira, y al ' +
      'final da una vuelta entera alrededor del templete. Vista desde arriba es ' +
      'el kana calcado: el tramo que cae en diagonal y, abajo del todo, el ' +
      'círculo cerrado del último giro.',
    strokeOrder: [
      'Un trazo corto hacia la derecha, el arranque de la ruta bajo el torii; ' +
        'sin levantar el pincel, una diagonal larga que baja hacia la izquierda, ' +
        'y de ahí una curva amplia que se abre a la derecha, cierra por abajo y ' +
        'termina enroscada en el círculo del final.',
    ],

    image: 'hiragana/b3/images/hiragana-ru.webp',
    imageAlt:
      'Un camino de grava visto desde arriba que baja desde un torii entre ' +
      'arces y cerezos y termina rodeando en círculo un pequeño templete.',

    outline:
      'M349,767Q248,767 200,731Q152,694 152,640Q152,606 169,583Q186,559 213,547Q240,534 270,534Q328,534 368,579Q407,624 411,697Q469,683 511,640Q553,597 553,527Q553,477 531,440Q508,403 469,383Q429,362 378,362Q312,362 254,383Q195,403 146,445Q129,460 98,485Q67,510 43,528L0,481Q50,451 106,404Q162,356 218,299Q274,242 323,182Q372,122 406,66Q376,73 336,81Q295,89 251,96Q207,102 167,107Q127,112 97,114L86,52Q113,53 153,50Q193,47 238,42Q283,37 326,30Q368,23 401,15Q434,7 450,0L497,33Q474,80 436,133Q397,186 351,240Q305,293 256,342Q285,328 321,319Q356,309 387,309Q454,309 507,337Q559,364 589,413Q619,462 619,527Q619,597 584,651Q549,705 488,736Q427,767 349,767M340,707L352,707Q351,655 328,623Q305,591 270,591Q245,591 229,604Q212,616 212,639Q212,667 242,687Q271,706 340,707',

    strokes: [
      'M91,84L461,36L294,262L26,494L282,353L403,339L488,356L560,425L593,532L550,646L480,702L398,734L324,742L243,731L188,679L184,605L239,565L308,567L366,623L378,685',
    ],
    strokeViewBox: '0 0 619 767',
  },
  {
    id: 're',
    character: 'れ',
    romaji: 're',
    audio: '',
    mnemonic: '',
    strokeOrder: [],

    image: '',
    imageAlt: '',

    outline: '',

    strokes: [],
    strokeViewBox: '',
  },
  {
    id: 'to',
    character: 'と',
    romaji: 'to',
    audio: '',
    mnemonic: '',
    strokeOrder: [],

    image: '',
    imageAlt: '',

    outline: '',

    strokes: [],
    strokeViewBox: '',
  },
  {
    id: 'ku',
    character: 'く',
    romaji: 'ku',
    audio: '',
    mnemonic: '',
    strokeOrder: [],

    image: '',
    imageAlt: '',

    outline: '',

    strokes: [],
    strokeViewBox: '',
  },
  {
    id: 'so',
    character: 'そ',
    romaji: 'so',
    audio: '',
    mnemonic: '',
    strokeOrder: [],

    image: '',
    imageAlt: '',

    outline: '',

    strokes: [],
    strokeViewBox: '',
  },
  {
    id: 'hi',
    character: 'ひ',
    romaji: 'hi',
    audio: '',
    mnemonic: '',
    strokeOrder: [],

    image: '',
    imageAlt: '',

    outline: '',

    strokes: [],
    strokeViewBox: '',
  },
  {
    id: 'fu',
    character: 'ふ',
    romaji: 'fu',
    audio: '',
    mnemonic: '',
    strokeOrder: [],

    image: '',
    imageAlt: '',

    outline: '',

    strokes: [],
    strokeViewBox: '',
  },
  {
    id: 'he',
    character: 'へ',
    romaji: 'he',
    audio: '',
    mnemonic: '',
    strokeOrder: [],

    image: '',
    imageAlt: '',

    outline: '',

    strokes: [],
    strokeViewBox: '',
  },
  {
    id: 'ho',
    character: 'ほ',
    romaji: 'ho',
    audio: '',
    mnemonic: '',
    strokeOrder: [],

    image: '',
    imageAlt: '',

    outline: '',

    strokes: [],
    strokeViewBox: '',
  },
  {
    id: 'ko',
    character: 'こ',
    romaji: 'ko',
    audio: '',
    mnemonic: '',
    strokeOrder: [],

    image: '',
    imageAlt: '',

    outline: '',

    strokes: [],
    strokeViewBox: '',
  },
  {
    id: 'ro',
    character: 'ろ',
    romaji: 'ro',
    audio: '',
    mnemonic: '',
    strokeOrder: [],

    image: '',
    imageAlt: '',

    outline: '',

    strokes: [],
    strokeViewBox: '',
  },
  {
    id: 'no',
    character: 'の',
    romaji: 'no',
    audio: '',
    mnemonic: '',
    strokeOrder: [],

    image: '',
    imageAlt: '',

    outline: '',

    strokes: [],
    strokeViewBox: '',
  },
  {
    id: 'ka',
    character: 'か',
    romaji: 'ka',
    audio: '',
    mnemonic: '',
    strokeOrder: [],

    image: '',
    imageAlt: '',

    outline: '',

    strokes: [],
    strokeViewBox: '',
  },
  {
    id: 'ki',
    character: 'き',
    romaji: 'ki',
    audio: '',
    mnemonic: '',
    strokeOrder: [],

    image: '',
    imageAlt: '',

    outline: '',

    strokes: [],
    strokeViewBox: '',
  },
  {
    id: 'ke',
    character: 'け',
    romaji: 'ke',
    audio: '',
    mnemonic: '',
    strokeOrder: [],

    image: '',
    imageAlt: '',

    outline: '',

    strokes: [],
    strokeViewBox: '',
  },
  {
    id: 'sa',
    character: 'さ',
    romaji: 'sa',
    audio: '',
    mnemonic: '',
    strokeOrder: [],

    image: '',
    imageAlt: '',

    outline: '',

    strokes: [],
    strokeViewBox: '',
  },
  {
    id: 'su',
    character: 'す',
    romaji: 'su',
    audio: '',
    mnemonic: '',
    strokeOrder: [],

    image: '',
    imageAlt: '',

    outline: '',

    strokes: [],
    strokeViewBox: '',
  },
  {
    id: 'se',
    character: 'せ',
    romaji: 'se',
    audio: '',
    mnemonic: '',
    strokeOrder: [],

    image: '',
    imageAlt: '',

    outline: '',

    strokes: [],
    strokeViewBox: '',
  },
  {
    id: 'ta',
    character: 'た',
    romaji: 'ta',
    audio: '',
    mnemonic: '',
    strokeOrder: [],

    image: '',
    imageAlt: '',

    outline: '',

    strokes: [],
    strokeViewBox: '',
  },
  {
    id: 'chi',
    character: 'ち',
    romaji: 'chi',
    audio: '',
    mnemonic: '',
    strokeOrder: [],

    image: '',
    imageAlt: '',

    outline: '',

    strokes: [],
    strokeViewBox: '',
  },
  {
    id: 'tsu',
    character: 'つ',
    romaji: 'tsu',
    audio: '',
    mnemonic: '',
    strokeOrder: [],

    image: '',
    imageAlt: '',

    outline: '',

    strokes: [],
    strokeViewBox: '',
  },
  {
    id: 'te',
    character: 'て',
    romaji: 'te',
    audio: '',
    mnemonic: '',
    strokeOrder: [],

    image: '',
    imageAlt: '',

    outline: '',

    strokes: [],
    strokeViewBox: '',
  },
  {
    id: 'na',
    character: 'な',
    romaji: 'na',
    audio: '',
    mnemonic: '',
    strokeOrder: [],

    image: '',
    imageAlt: '',

    outline: '',

    strokes: [],
    strokeViewBox: '',
  },
  {
    id: 'ni',
    character: 'に',
    romaji: 'ni',
    audio: '',
    mnemonic: '',
    strokeOrder: [],

    image: '',
    imageAlt: '',

    outline: '',

    strokes: [],
    strokeViewBox: '',
  },
  {
    id: 'nu',
    character: 'ぬ',
    romaji: 'nu',
    audio: '',
    mnemonic: '',
    strokeOrder: [],

    image: '',
    imageAlt: '',

    outline: '',

    strokes: [],
    strokeViewBox: '',
  },
  {
    id: 'ne',
    character: 'ね',
    romaji: 'ne',
    audio: '',
    mnemonic: '',
    strokeOrder: [],

    image: '',
    imageAlt: '',

    outline: '',

    strokes: [],
    strokeViewBox: '',
  },
  {
    id: 'ra',
    character: 'ら',
    romaji: 'ra',
    audio: '',
    mnemonic: '',
    strokeOrder: [],

    image: '',
    imageAlt: '',

    outline: '',

    strokes: [],
    strokeViewBox: '',
  },
  {
    id: 'ri',
    character: 'り',
    romaji: 'ri',
    audio: '',
    mnemonic: '',
    strokeOrder: [],

    image: '',
    imageAlt: '',

    outline: '',

    strokes: [],
    strokeViewBox: '',
  },
  {
    id: 'n',
    character: 'ん',
    romaji: 'n',
    audio: '',
    mnemonic: '',
    strokeOrder: [],

    image: '',
    imageAlt: '',

    outline: '',

    strokes: [],
    strokeViewBox: '',
  },
  {
    id: 'mo',
    character: 'も',
    romaji: 'mo',
    audio: '',
    mnemonic: '',
    strokeOrder: [],

    image: '',
    imageAlt: '',

    outline: '',

    strokes: [],
    strokeViewBox: '',
  },
  {
    id: 'ma',
    character: 'ま',
    romaji: 'ma',
    audio: '',
    mnemonic: '',
    strokeOrder: [],

    image: '',
    imageAlt: '',

    outline: '',

    strokes: [],
    strokeViewBox: '',
  },
  {
    id: 'yo',
    character: 'よ',
    romaji: 'yo',
    audio: '',
    mnemonic: '',
    strokeOrder: [],

    image: '',
    imageAlt: '',

    outline: '',

    strokes: [],
    strokeViewBox: '',
  },
  {
    id: 'ya',
    character: 'や',
    romaji: 'ya',
    audio: '',
    mnemonic: '',
    strokeOrder: [],

    image: '',
    imageAlt: '',

    outline: '',

    strokes: [],
    strokeViewBox: '',
  },
  {
    id: 'wa',
    character: 'わ',
    romaji: 'wa',
    audio: '',
    mnemonic: '',
    strokeOrder: [],

    image: '',
    imageAlt: '',

    outline: '',

    strokes: [],
    strokeViewBox: '',
  },
  {
    id: 'mi',
    character: 'み',
    romaji: 'mi',
    audio: '',
    mnemonic: '',
    strokeOrder: [],

    image: '',
    imageAlt: '',

    outline: '',

    strokes: [],
    strokeViewBox: '',
  },
  {
    id: 'mu',
    character: 'む',
    romaji: 'mu',
    audio: '',
    mnemonic: '',
    strokeOrder: [],

    image: '',
    imageAlt: '',

    outline: '',

    strokes: [],
    strokeViewBox: '',
  },
  {
    id: 'me',
    character: 'め',
    romaji: 'me',
    audio: '',
    mnemonic: '',
    strokeOrder: [],

    image: '',
    imageAlt: '',

    outline: '',

    strokes: [],
    strokeViewBox: '',
  },
  {
    id: 'wo',
    character: 'を',
    romaji: 'wo',
    audio: '',
    mnemonic: '',
    strokeOrder: [],

    image: '',
    imageAlt: '',

    outline: '',

    strokes: [],
    strokeViewBox: '',
  },
  {
    id: 'yu',
    character: 'ゆ',
    romaji: 'yu',
    audio: '',
    mnemonic: '',
    strokeOrder: [],

    image: '',
    imageAlt: '',

    outline: '',

    strokes: [],
    strokeViewBox: '',
  },
  {
    id: 'pa',
    character: 'ぱ',
    romaji: 'pa',
    audio: '',
    mnemonic: '',
    strokeOrder: [],

    image: '',
    imageAlt: '',

    outline: '',

    strokes: [],
    strokeViewBox: '',
  },
  {
    id: 'pi',
    character: 'ぴ',
    romaji: 'pi',
    audio: '',
    mnemonic: '',
    strokeOrder: [],

    image: '',
    imageAlt: '',

    outline: '',

    strokes: [],
    strokeViewBox: '',
  },
  {
    id: 'pu',
    character: 'ぷ',
    romaji: 'pu',
    audio: '',
    mnemonic: '',
    strokeOrder: [],

    image: '',
    imageAlt: '',

    outline: '',

    strokes: [],
    strokeViewBox: '',
  },
  {
    id: 'pe',
    character: 'ぺ',
    romaji: 'pe',
    audio: '',
    mnemonic: '',
    strokeOrder: [],

    image: '',
    imageAlt: '',

    outline: '',

    strokes: [],
    strokeViewBox: '',
  },
  {
    id: 'po',
    character: 'ぽ',
    romaji: 'po',
    audio: '',
    mnemonic: '',
    strokeOrder: [],

    image: '',
    imageAlt: '',

    outline: '',

    strokes: [],
    strokeViewBox: '',
  },
  {
    id: 'small-tsu',
    character: 'っ',
    romaji: '',
    audio: '',
    mnemonic: '',
    strokeOrder: [],

    image: '',
    imageAlt: '',

    outline: '',

    strokes: [],
    strokeViewBox: '',
  },
  {
    id: 'long-vowel-mark',
    character: 'ー',
    romaji: '',
    audio: '',
    mnemonic: '',
    strokeOrder: [],

    image: '',
    imageAlt: '',

    outline: '',

    strokes: [],
    strokeViewBox: '',
  },
  {
    id: 'small-ya',
    character: 'ゃ',
    romaji: 'ya',
    audio: '',
    mnemonic: '',
    strokeOrder: [],

    image: '',
    imageAlt: '',

    outline: '',

    strokes: [],
    strokeViewBox: '',
  },
  {
    id: 'small-yu',
    character: 'ゅ',
    romaji: 'yu',
    audio: '',
    mnemonic: '',
    strokeOrder: [],

    image: '',
    imageAlt: '',

    outline: '',

    strokes: [],
    strokeViewBox: '',
  },
  {
    id: 'small-yo',
    character: 'ょ',
    romaji: 'yo',
    audio: '',
    mnemonic: '',
    strokeOrder: [],

    image: '',
    imageAlt: '',

    outline: '',

    strokes: [],
    strokeViewBox: '',
  },
]

export const HIRAGANA_BY_ID = new Map(HIRAGANA.map((kana) => [kana.id, kana]))
