// Las formas conjugadas del N5, y de dónde sale cada una.
//
// Un verbo es UNA entrada del temario —よむ—, y します o しました no son palabras: se
// generan pegando un sufijo a su raíz. Escribirlas como vocabulario llenaría el pool de
// entradas que nadie ha redactado, y cada corrección habría que repetirla en todas.
//
// Esta es la ÚNICA lista de sufijos del proyecto: la leen el generador y el segmentador,
// y el volcado la sube a `conjugations`. Escrita dos veces se desincroniza en cuanto
// alguien corrija una.
//
// Solo importa TIPOS, y eso no es casual: así Node la carga tal cual, sin compilar nada.
// Un import de VALOR la rompería —Node no resuelve `from './types'` sin extensión— y las
// herramientas dejarían de poder leerla.
import type { WordType, WordUnit } from './types'

export interface Conjugation {
  id: string
  nombre: string
  // Con `{raiz}`, `{raiz_nai}`, `{raiz_i}` o `{palabra}` dentro: lo que se sustituye al
  // generar. `{raiz_i}` es la palabra sin su い final, que es de donde cuelga かったです.
  patron: string
  registro: 'cortes' | 'neutro' | 'llano'
  // El primer bloque en que la forma se puede enseñar, por su id GLOBAL. Se compara
  // contra el puesto del bloque en la cadena entera, nunca como texto: 'b10' va detrás
  // de 'b3' en el recorrido y delante alfabéticamente.
  bloqueMin: string
  // Los tipos de palabra a los que se pega. Son los valores de `Word.type` sin traducir,
  // así que un tipo mal escrito no compila en vez de dejar palabras sin sus formas.
  aplicaA: WordType[]
  // El desglose kana a kana del sufijo, con la misma forma que `Word.units`: generar los
  // units de una forma es concatenar, sin volver a romanizar nada.
  //
  // Se escribe a mano y no sale del tokenizador porque la は de ではありません se lee
  // «wa», y eso no se deduce del kana.
  suffixUnits: WordUnit[]
}

const VERBS: WordType[] = ['verbo-u', 'verbo-ru', 'verbo-irregular']

// El orden de la lista es el orden en que se enseñan y en que las pinta la tabla.
export const CONJUGATIONS: Conjugation[] = [
  {
    id: 'masu-pres-af',
    nombre: 'Presente afirmativo',
    patron: '{raiz}ます',
    registro: 'cortes',
    bloqueMin: 'b2',
    aplicaA: VERBS,
    suffixUnits: [{ kana: 'ま', romaji: 'ma' }, { kana: 'す', romaji: 'su' }],
  },
  {
    id: 'masu-pres-neg',
    nombre: 'Presente negativo',
    patron: '{raiz}ません',
    registro: 'cortes',
    bloqueMin: 'b2',
    aplicaA: VERBS,
    suffixUnits: [{ kana: 'ま', romaji: 'ma' }, { kana: 'せ', romaji: 'se' }, { kana: 'ん', romaji: 'n' }],
  },
  {
    id: 'masu-pas-af',
    nombre: 'Pasado afirmativo',
    patron: '{raiz}ました',
    registro: 'cortes',
    bloqueMin: 'b5',
    aplicaA: VERBS,
    suffixUnits: [{ kana: 'ま', romaji: 'ma' }, { kana: 'し', romaji: 'shi' }, { kana: 'た', romaji: 'ta' }],
  },
  {
    id: 'masu-pas-neg',
    nombre: 'Pasado negativo',
    patron: '{raiz}ませんでした',
    registro: 'cortes',
    bloqueMin: 'b5',
    aplicaA: VERBS,
    suffixUnits: [
      { kana: 'ま', romaji: 'ma' }, { kana: 'せ', romaji: 'se' }, { kana: 'ん', romaji: 'n' },
      { kana: 'で', romaji: 'de' }, { kana: 'し', romaji: 'shi' }, { kana: 'た', romaji: 'ta' },
    ],
  },
  {
    id: 'tai',
    nombre: 'Querer hacer',
    patron: '{raiz}たい',
    registro: 'neutro',
    bloqueMin: 'b6',
    aplicaA: VERBS,
    suffixUnits: [{ kana: 'た', romaji: 'ta' }, { kana: 'い', romaji: 'i' }],
  },
  {
    id: 'nai',
    nombre: 'Negativo llano',
    patron: '{raiz_nai}ない',
    registro: 'llano',
    bloqueMin: 'b13',
    aplicaA: VERBS,
    suffixUnits: [{ kana: 'な', romaji: 'na' }, { kana: 'い', romaji: 'i' }],
  },
  {
    id: 'masho',
    nombre: 'Invitación',
    patron: '{raiz}ましょう',
    registro: 'cortes',
    bloqueMin: 'b18',
    aplicaA: VERBS,
    suffixUnits: [{ kana: 'ま', romaji: 'ma' }, { kana: 'しょ', romaji: 'sho' }, { kana: 'う', romaji: 'u' }],
  },
  {
    id: 'copula-pres-af',
    nombre: 'Es',
    patron: '{palabra}です',
    registro: 'cortes',
    bloqueMin: 'b2',
    aplicaA: ['sustantivo', 'adjetivo-na', 'adjetivo-i'],
    suffixUnits: [{ kana: 'で', romaji: 'de' }, { kana: 'す', romaji: 'su' }],
  },
  {
    id: 'copula-pres-neg',
    nombre: 'No es',
    patron: '{palabra}ではありません',
    registro: 'cortes',
    bloqueMin: 'b3',
    aplicaA: ['sustantivo', 'adjetivo-na'],
    suffixUnits: [
      { kana: 'で', romaji: 'de' }, { kana: 'は', romaji: 'wa' }, { kana: 'あ', romaji: 'a' },
      { kana: 'り', romaji: 'ri' }, { kana: 'ま', romaji: 'ma' }, { kana: 'せ', romaji: 'se' },
      { kana: 'ん', romaji: 'n' },
    ],
  },
  {
    id: 'copula-pas-af',
    nombre: 'Era',
    patron: '{palabra}でした',
    registro: 'cortes',
    bloqueMin: 'b5',
    // SIN `adjetivo-i`: おいしいでした no es japonés. Su pasado es `adj-i-pas-af`, aquí
    // debajo, y por eso esta fila no puede recuperarlo «por completitud».
    aplicaA: ['sustantivo', 'adjetivo-na'],
    suffixUnits: [{ kana: 'で', romaji: 'de' }, { kana: 'し', romaji: 'shi' }, { kana: 'た', romaji: 'ta' }],
  },
  {
    id: 'adj-i-pas-af',
    nombre: 'Pasado afirmativo (adjetivo-い)',
    patron: '{raiz_i}かったです',
    registro: 'cortes',
    // B17 y no B5, que es cuando toca el resto de los pasados: っ no se enseña hasta B17,
    // y en B5 el alumno no sabría leer かった. Una forma llega cuando se puede LEER.
    bloqueMin: 'b17',
    aplicaA: ['adjetivo-i'],
    suffixUnits: [
      { kana: 'か', romaji: 'ka' }, { kana: 'っ', romaji: 't' }, { kana: 'た', romaji: 'ta' },
      { kana: 'で', romaji: 'de' }, { kana: 'す', romaji: 'su' },
    ],
  },
  {
    id: 'copula-pas-neg',
    nombre: 'No era',
    patron: '{palabra}ではありませんでした',
    registro: 'cortes',
    bloqueMin: 'b5',
    aplicaA: ['sustantivo', 'adjetivo-na'],
    suffixUnits: [
      { kana: 'で', romaji: 'de' }, { kana: 'は', romaji: 'wa' }, { kana: 'あ', romaji: 'a' },
      { kana: 'り', romaji: 'ri' }, { kana: 'ま', romaji: 'ma' }, { kana: 'せ', romaji: 'se' },
      { kana: 'ん', romaji: 'n' }, { kana: 'で', romaji: 'de' }, { kana: 'し', romaji: 'shi' },
      { kana: 'た', romaji: 'ta' },
    ],
  },
]

export const CONJUGATIONS_BY_ID = new Map(CONJUGATIONS.map((form) => [form.id, form]))

// De qué cuelga el sufijo, leído de su propio patrón. Vive aquí y no en quien lo usa
// porque lo necesitan el generador y el segmentador, y son los patrones de arriba los que
// mandan: una forma nueva con un patrón nuevo se añade en un sitio.
export type StemKind = 'palabra' | 'masu' | 'nai' | 'i'

export function stemKind(form: Conjugation): StemKind {
  if (form.patron.startsWith('{palabra}')) return 'palabra'
  if (form.patron.startsWith('{raiz_nai}')) return 'nai'
  if (form.patron.startsWith('{raiz_i}')) return 'i'
  return 'masu'
}

// Las nueve filas de las «u»: lo único que hace falta para derivar la raíz de un godan,
// sustituyendo su último unit por el de la columna que toque. Un ichidan no las usa —se
// le quita el último y ya— y un irregular trae su raíz escrita.
//
// Van aparte de `kana.ts` a propósito: ahí solo están los que son LECCIÓN, y los dakuten
// no lo son — ぎ no estaría, y およぐ → およぎます lo necesita.
//
// っ y ー no caben aquí porque no son lecturas sino reglas: っ duplica la consonante
// siguiente y ー alarga la vocal anterior.
export interface KanaRow {
  u: WordUnit
  // La fila «i», la de ～ます.
  i: WordUnit
  // La fila «a», la de ～ない. Ojo con う → わ, que no es あ.
  a: WordUnit
}

export const KANA_ROWS: KanaRow[] = [
  { u: { kana: 'う', romaji: 'u' }, i: { kana: 'い', romaji: 'i' }, a: { kana: 'わ', romaji: 'wa' } },
  { u: { kana: 'く', romaji: 'ku' }, i: { kana: 'き', romaji: 'ki' }, a: { kana: 'か', romaji: 'ka' } },
  { u: { kana: 'ぐ', romaji: 'gu' }, i: { kana: 'ぎ', romaji: 'gi' }, a: { kana: 'が', romaji: 'ga' } },
  { u: { kana: 'す', romaji: 'su' }, i: { kana: 'し', romaji: 'shi' }, a: { kana: 'さ', romaji: 'sa' } },
  { u: { kana: 'つ', romaji: 'tsu' }, i: { kana: 'ち', romaji: 'chi' }, a: { kana: 'た', romaji: 'ta' } },
  { u: { kana: 'ぬ', romaji: 'nu' }, i: { kana: 'に', romaji: 'ni' }, a: { kana: 'な', romaji: 'na' } },
  { u: { kana: 'ぶ', romaji: 'bu' }, i: { kana: 'び', romaji: 'bi' }, a: { kana: 'ば', romaji: 'ba' } },
  { u: { kana: 'む', romaji: 'mu' }, i: { kana: 'み', romaji: 'mi' }, a: { kana: 'ま', romaji: 'ma' } },
  { u: { kana: 'る', romaji: 'ru' }, i: { kana: 'り', romaji: 'ri' }, a: { kana: 'ら', romaji: 'ra' } },
]

export const KANA_ROW_BY_U = new Map(KANA_ROWS.map((row) => [row.u.kana, row]))
