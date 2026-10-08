import type { Grammar } from '../types'

export const GRAMMAR: Grammar[] = [
  {
    id: 'topic-wa',
    character: 'は',
    romaji: 'wa',
    explanation:
      'は marca de qué habla la frase. Se escribe con el mismo kana que ya conoces ' +
      '—は, que se lee «ha»—, pero puesto entre el tema y lo que se dice de él, se ' +
      'lee «wa». Se usa en la gramática japonesa principalmente como partícula temática,' +
      ' y sirve para marcar el tema principal o de lo que se va a hablar en la oración'
  },
  {
    id: 'particle-e',
    character: 'へ',
    romaji: 'e',
    title: 'La partícula へ — dirección',
    explanation:
      '「へ」 se escribe como el kana «he», pero cuando funciona como partícula se ' +
      'pronuncia «e».\n\n' +
      'Marca la dirección hacia la que se va: へやへいきます = «voy a la habitación». ' +
      'Fíjate en que la misma へ aparece dos veces en esa frase y suena distinto cada ' +
      'vez — la primera es parte de la palabra へや (habitación) y suena «he»; la ' +
      'segunda es partícula y suena «e».\n\n' +
      'Es la tercera de las tres partículas que no se leen como su kana: ' +
      'は → wa · を → o · へ → e.',
  },
  {
    id: 'particle-no',
    character: 'の',
    romaji: 'no',
    explanation: 'Permite formar relaciones nominales como いえのえ.',
  },
  {
    id: 'particle-ni',
    character: 'に',
    romaji: 'ni',
    explanation: 'Permite construir localizaciones y cambios de estado con いる, ある y なる.',
  },
  { id: 'particle-mo', character: 'も', romaji: 'mo', explanation: '' },
  { id: 'particle-ne', character: 'ね', romaji: 'ne', explanation: '' },
  {
    id: 'particle-o',
    character: 'を',
    romaji: 'o',
    title: 'La partícula を — el objeto directo',
    explanation:
      '「を」 se escribe con un kana propio, pero se pronuncia «o», igual que お. Es el ' +
      'único kana del silabario que no se usa nunca dentro de una palabra: existe solo ' +
      'para esto.\n\n' +
      'Marca sobre qué recae la acción del verbo: ほんをよみます = «leo un libro». Lo que ' +
      'va delante de を es lo que se lee, se compra o se bebe.\n\n' +
      'Es la tercera de las tres partículas que no se leen como su kana: ' +
      'は → wa · を → o · へ → e.',
    examples: [
      { label: 'ほんをよみます。', forms: ['hon o yomimasu.', 'Leo un libro.'] },
      { label: 'みずをのみます。', forms: ['mizu o nomimasu.', 'Bebo agua.'] },
      { label: 'きっぷをかいます。', forms: ['kippu o kaimasu.', 'Compro un billete.'] },
      { label: 'しゃしんをとります。', forms: ['shashin o torimasu.', 'Hago una foto.'] },
    ],
  },
  { id: 'particle-ga', character: 'が', romaji: 'ga', explanation: '' },
  { id: 'particle-de', character: 'で', romaji: 'de', explanation: '' },
  { id: 'particle-ka', character: 'か', romaji: 'ka', explanation: '' },
  { id: 'particle-to', character: 'と', romaji: 'to', explanation: '' },
  {
    id: 'dakuten',
    character: '゛',
    romaji: 'dakuten',
    title: 'El dakuten — dos rayitas que cambian el sonido',
    explanation:
      'Dos rayitas pequeñas arriba a la derecha de un kana cambian su sonido: la ' +
      'consonante se vuelve sonora. No es un carácter nuevo que haya que aprender de ' +
      'cero — es el mismo kana que ya sabes, con la voz activada.\n\n' +
      'Pon la mano en la garganta y di «sa» y luego «za»: en la segunda notas la ' +
      'vibración. Eso es el dakuten.',
    // Los veinte del temario, y no una muestra: la plana enseña SOLO los que estrena su
    // tomo —`block.dakuten`—, así que en B2 salen で ぜ ず ば y ninguno más. Con cinco de
    // ejemplo, los diez bloques enseñarían los mismos cinco.
    //
    // ぱ ぴ ぷ ぺ ぽ no están aquí: el handakuten es otro signo y además son LECCIÓN, en B17.
    examples: [
      { label: 'て → で', forms: ['te → de'] },
      { label: 'せ → ぜ', forms: ['se → ze'] },
      { label: 'す → ず', forms: ['su → zu'] },
      { label: 'は → ば', forms: ['ha → ba'] },
      { label: 'し → じ', forms: ['shi → ji'] },
      { label: 'か → が', forms: ['ka → ga'] },
      { label: 'こ → ご', forms: ['ko → go'] },
      { label: 'さ → ざ', forms: ['sa → za'] },
      { label: 'た → だ', forms: ['ta → da'] },
      { label: 'そ → ぞ', forms: ['so → zo'] },
      { label: 'く → ぐ', forms: ['ku → gu'] },
      { label: 'き → ぎ', forms: ['ki → gi'] },
      { label: 'と → ど', forms: ['to → do'] },
      { label: 'ち → ぢ', forms: ['chi → ji'] },
      { label: 'つ → づ', forms: ['tsu → zu'] },
      { label: 'け → げ', forms: ['ke → ge'] },
      { label: 'ふ → ぶ', forms: ['fu → bu'] },
      { label: 'ひ → び', forms: ['hi → bi'] },
      { label: 'ほ → ぼ', forms: ['ho → bo'] },
      { label: 'へ → べ', forms: ['he → be'] },
    ],
  },
  {
    id: 'desu',
    romaji: 'desu',
    title: 'です — «es»',
    explanation:
      'A は B です significa «A es B». です no es un verbo: es el enlace que une dos ' +
      'cosas.\n\n' +
      'Se escribe で + す. Y で es て con dakuten: la primera vez que lo usas.\n\n' +
      'No cambia según quién habla: いえです vale para «es una casa», «soy una casa» o ' +
      '«son casas». El japonés deja eso al contexto.',
    examples: [
      { label: 'いえです。', forms: ['ie desu.', 'Es una casa.'] },
      { label: 'あおいです。', forms: ['aoi desu.', 'Es azul.'] },
      { label: 'ははです。', forms: ['haha desu.', 'Es mi madre.'] },
      { label: 'いすです。', forms: ['isu desu.', 'Es una silla.'] },
    ],
  },
  {
    id: 'copula-neg',
    romaji: 'dewa arimasen',
    title: 'ではありません — «no es»',
    explanation:
      'Para negar です no se cambia です: se sustituye entero por ではありません.\n\n' +
      'Fíjate en una cosa al leerlo: esa は no suena «ha», suena «wa» — es la misma ' +
      'partícula del tema que ya conoces del primer tomo, escondida dentro de la ' +
      'expresión. Se lee «dewa arimasen».\n\n' +
      'Y mira la terminación: ありません. Es el ません que ya sabes, pegado a あり, que ' +
      'es la raíz del verbo ある. No es una fórmula nueva que haya que memorizar: son dos ' +
      'piezas que ya tienes.',
    examples: [
      { label: 'いすではありません。', forms: ['isu dewa arimasen.', 'No es una silla.'] },
      { label: 'いえではありません。', forms: ['ie dewa arimasen.', 'No es una casa.'] },
      { label: 'ははではありません。', forms: ['haha dewa arimasen.', 'No es mi madre.'] },
      { label: 'あかではありません。', forms: ['aka dewa arimasen.', 'No es rojo.'] },
    ],
  },
  {
    id: 'masu',
    romaji: 'masu',
    title: 'ます — el presente cortés',
    explanation:
      'Los verbos japoneses no cambian según quién habla: あいます vale para «me ' +
      'encuentro», «te encuentras» y «se encuentra». Solo cambian por dos cosas: el ' +
      'tiempo y si son afirmativos o negativos.\n\n' +
      'Lo que se conjuga no es el verbo entero: es su raíz, y hay que sacarla. Mira ' +
      'あう e いう, de tu primer tomo, y すう: los tres acaban en う. Esa う es la marca ' +
      'del verbo sin conjugar, y para tener la raíz se cambia por い: あう → あい, ' +
      'いう → いい, すう → すい. Cambia solo el último carácter; lo de delante se ' +
      'queda igual. A esa raíz se le pega ます o ません.\n\n' +
      'No es una regla de la う: todos los verbos acaban en un carácter que suena con ' +
      '«u», y en todos ese carácter pasa al de su familia que suena con «i». Con los ' +
      'que terminen en otro harás lo mismo.\n\n' +
      'Hay un segundo tipo de verbo que forma la raíz quitando su última sílaba en vez ' +
      'de cambiarla, y dos que no siguen ninguna regla. Llegan en tomos siguientes, con ' +
      'los caracteres que hacen falta para leerlos.',
    // La primera fila es la CABECERA, y la plana la pinta como tal.
    //
    // Los tres verbos acaban en う, y no es pereza: enseñar aquí otra terminación pide
    // kana que este tomo no ha dado —おす → おします necesita し, de B3—, y un ejemplo que
    // no se puede leer esconde la regla en vez de enseñarla.
    examples: [
      { label: 'Verbo', forms: ['Raíz · う → い', '+ ます', '+ ません'] },
      { label: 'あう', forms: ['あい', 'あいます', 'あいません'] },
      { label: 'いう', forms: ['いい', 'いいます', 'いいません'] },
      { label: 'すう', forms: ['すい', 'すいます', 'すいません'] },
    ],
  },
  {
    id: 'pasado',
    romaji: 'mashita',
    title: 'El pasado — cuatro casillas y ya está',
    explanation:
      'Con el pasado se completa el cuadro. Son cuatro casillas en total, y no hay más: ' +
      'el japonés no distingue entre «me encontré», «me he encontrado» y «me ' +
      'encontraba».\n\n' +
      'La cópula sigue el mismo patrón: です → でした. いえでした = «era una casa».',
    examples: [
      { label: '', forms: ['Afirmativo', 'Negativo'] },
      { label: 'Presente', forms: ['あいます', 'あいません'] },
      { label: 'Pasado', forms: ['あいました', 'あいませんでした'] },
    ],
  },
  {
    id: 'tai',
    romaji: 'tai',
    title: '～たい — querer hacer algo',
    explanation:
      'Se pega a la misma raíz que ます. Pero ojo: el resultado ya no se comporta como ' +
      'un verbo, sino como un adjetivo-い.\n\n' +
      'Por eso lleva です detrás, igual que あおいです.',
    examples: [
      { label: 'かう → かい → かいたいです。', forms: ['kaitai desu.', 'Quiero comprarlo.'] },
      { label: 'あう → あい → あいたいです。', forms: ['aitai desu.', 'Quiero verle.'] },
    ],
  },
  {
    id: 'nai',
    romaji: 'nai',
    title: '～ない — el negativo informal',
    explanation:
      'Es el «no» de la lengua hablada, el que se usa entre amigos. Más directo que ' +
      'ません, que es el cortés.\n\n' +
      'Cómo se forma depende del grupo del verbo. Ichidan: se quita る y se añade ない ' +
      '— おきる → おきない. Godan: la última sílaba pasa de u a a y se añade ない ' +
      '— かく → かか → かかない.\n\n' +
      'Los verbos acabados en う son la excepción que hay que saber: no pasan a あ sino ' +
      'a わ. あう → あわない, no «ああない».\n\n' +
      'Y tres irregulares que se memorizan: する → しない · くる → こない · ある → ない. ' +
      'ある es el más raro: pierde la raíz entera.',
    examples: [
      { label: 'かかない。', forms: ['kakanai.', 'No lo escribo.'] },
      { label: 'あわない。', forms: ['awanai.', 'No le veo.'] },
      { label: 'しない。', forms: ['shinai.', 'No lo hago.'] },
      { label: 'こない。', forms: ['konai.', 'No viene.'] },
    ],
  },
  {
    id: 'masho',
    romaji: 'mashou',
    title: '～ましょう — «hagamos…»',
    explanation:
      'Se pega a la misma raíz que ます. Sirve para proponer algo que vais a hacer los ' +
      'dos: no es una orden, es una invitación.\n\n' +
      'Se escribe しょ + う, pero la う no suena como vocal suelta: alarga la sílaba ' +
      'anterior. しましょう se pronuncia «shimashoo».',
    examples: [
      { label: 'しましょう。', forms: ['shimashou.', 'Hagámoslo.'] },
      { label: 'いきましょう。', forms: ['ikimashou.', 'Vamos.'] },
      { label: 'あいましょう。', forms: ['aimashou.', 'Quedemos.'] },
    ],
  },
]

export const GRAMMAR_BY_ID = new Map(GRAMMAR.map((rule) => [rule.id, rule]))
