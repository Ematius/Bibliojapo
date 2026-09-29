// Kana a rōmaji, para generar los `units` del temario a partir del CSV del documento.
//
// Es HERRAMIENTA DE AUTORÍA, no código de la app: nada de `src/` la importa, y la base
// tampoco la necesita —para conjugar le bastan los nueve pares de `kana_rows`—. Vive
// aquí porque escribir a mano el desglose de setecientas palabras no es viable.
//
// La convención es HEPBURN, que es la del documento: shi, chi, tsu, fu, ji, y ん = n.
// Con Kunrei (si, ti, tu, hu, zi) descuadrarían cientos de palabras de golpe y parecería
// un problema de fondo cuando solo sería esta tabla.

const BASE = {
  あ: 'a', い: 'i', う: 'u', え: 'e', お: 'o',
  か: 'ka', き: 'ki', く: 'ku', け: 'ke', こ: 'ko',
  さ: 'sa', し: 'shi', す: 'su', せ: 'se', そ: 'so',
  た: 'ta', ち: 'chi', つ: 'tsu', て: 'te', と: 'to',
  な: 'na', に: 'ni', ぬ: 'nu', ね: 'ne', の: 'no',
  は: 'ha', ひ: 'hi', ふ: 'fu', へ: 'he', ほ: 'ho',
  ま: 'ma', み: 'mi', む: 'mu', め: 'me', も: 'mo',
  や: 'ya', ゆ: 'yu', よ: 'yo',
  ら: 'ra', り: 'ri', る: 'ru', れ: 're', ろ: 'ro',
  // を se pronuncia «o»: solo aparece como partícula, nunca dentro de una palabra.
  わ: 'wa', を: 'o', ん: 'n',

  が: 'ga', ぎ: 'gi', ぐ: 'gu', げ: 'ge', ご: 'go',
  ざ: 'za', じ: 'ji', ず: 'zu', ぜ: 'ze', ぞ: 'zo',
  // ぢ y づ suenan como じ y ず: en Hepburn se escriben igual.
  だ: 'da', ぢ: 'ji', づ: 'zu', で: 'de', ど: 'do',
  ば: 'ba', び: 'bi', ぶ: 'bu', べ: 'be', ぼ: 'bo',

  ぱ: 'pa', ぴ: 'pi', ぷ: 'pu', ぺ: 'pe', ぽ: 'po',
}

// Un yōon es UN kana escrito con dos caracteres, así que se mira antes que el suelto: de
// otro modo きょ saldría partido en ki + yo.
const YOON = {
  きゃ: 'kya', きゅ: 'kyu', きょ: 'kyo',
  しゃ: 'sha', しゅ: 'shu', しょ: 'sho',
  ちゃ: 'cha', ちゅ: 'chu', ちょ: 'cho',
  にゃ: 'nya', にゅ: 'nyu', にょ: 'nyo',
  ひゃ: 'hya', ひゅ: 'hyu', ひょ: 'hyo',
  みゃ: 'mya', みゅ: 'myu', みょ: 'myo',
  りゃ: 'rya', りゅ: 'ryu', りょ: 'ryo',
  ぎゃ: 'gya', ぎゅ: 'gyu', ぎょ: 'gyo',
  じゃ: 'ja', じゅ: 'ju', じょ: 'jo',
  びゃ: 'bya', びゅ: 'byu', びょ: 'byo',
  ぴゃ: 'pya', ぴゅ: 'pyu', ぴょ: 'pyo',
}

// Lo que no es lectura sino puntuación de la escritura: marca de sufijo, separador y
// coma. No suenan, así que no generan unit.
const SILENT = new Set(['～', '〜', '・', '、', '　', ' '])

export const SMALL_TSU = 'っ'
export const LONG_MARK = 'ー'

// は suena «wa» cuando es la partícula de tema, y estas palabras la llevan dentro. No se
// puede deducir del kana: こんにちは es «konnichiwa» y はい es «hai», con la misma は.
// En todas ellas la は es única, así que basta con marcarlas por palabra entera.
const PARTICLE_HA = new Set([
  'こんにちは',
  'こんばんは',
  'では',
  'では、また',
  'それでは',
])

// Cada unit es un kana con su lectura, emparejados: los ejercicios parten la palabra en
// tarjetas y necesitan saber qué trozo del rōmaji es de qué kana.
export function tokenize(text) {
  const units = []
  const chars = [...text]

  for (let i = 0; i < chars.length; i++) {
    const one = chars[i]
    const two = one + (chars[i + 1] ?? '')

    if (SILENT.has(one)) continue

    if (YOON[two]) {
      units.push({ kana: two, romaji: YOON[two] })
      i++
      continue
    }

    // La geminada no suena sola: duplica la PRIMERA LETRA del rōmaji de la sílaba
    // siguiente. No es un apaño que cuadre con las palabras del pool: en Hepburn esa
    // letra es siempre la consonante que se dobla, también en los dígrafos —っし da
    // «sshi», っつ da «ttsu», っふ da «ffu»—. Ver la prueba en `check-romaji.mjs`.
    //
    // El único punto de convención es ち: aquí da «cchi», que es lo que usa el
    // documento; el Hepburn tradicional escribiría «tchi».
    if (one === SMALL_TSU) {
      const next = chars[i + 1] ?? ''
      const after = YOON[next + (chars[i + 2] ?? '')] ?? BASE[next] ?? ''
      units.push({ kana: one, romaji: after.slice(0, 1) })
      continue
    }

    // El alargamiento tampoco tiene sonido propio: repite la vocal de lo que viene
    // antes. うーん es *uun*.
    if (one === LONG_MARK) {
      const previous = units.at(-1)?.romaji ?? ''
      units.push({ kana: one, romaji: previous.slice(-1) })
      continue
    }

    if (BASE[one]) {
      units.push({ kana: one, romaji: BASE[one] })
      continue
    }

    // Lo que no está en la tabla se devuelve marcado en vez de tragarse: así sale en la
    // lista de descuadres con su palabra, y no desaparece en silencio.
    units.push({ kana: one, romaji: '?' })
  }

  return units
}

// La misma palabra, con は leída como partícula donde toca.
export function tokenizeWord(text) {
  const units = tokenize(text)
  if (!PARTICLE_HA.has(text)) return units

  return units.map((unit) => (unit.kana === 'は' ? { ...unit, romaji: 'wa' } : unit))
}

export function reading(units) {
  return units.map((unit) => unit.romaji).join('')
}

// Para comparar contra el CSV: el kana no lleva espacios y el rōmaji sí, y el documento
// separa algunas lecturas con barra.
export function normalise(romaji) {
  return romaji.toLowerCase().replace(/[\s/-]/g, '')
}

export const TABLE_SIZE = Object.keys(BASE).length + Object.keys(YOON).length
