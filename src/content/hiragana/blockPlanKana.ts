import { BLOCK_PLAN } from './blocks'

// El plan de kana por tomo, tal y como lo fija CLAUDE.md — «Orden de aprendizaje del
// hiragana»—. A diferencia de `blocks.ts`, esto NO es contenido para enseñar: no trae
// mnemotecnia, ni trazos, ni audio. Es solo la lista de qué caracteres trae cada tomo, y
// existe para poder titular una entrada de la chuleta —o de cualquier lista de tomos— con
// lo que enseña en vez de con su número, aunque el tomo todavía no esté escrito.
//
// SI EL PLAN CAMBIA hay que volver a copiar la tabla de CLAUDE.md aquí.
//
// B10, B11 y B12 se quedan sin entrada a propósito: no son kana nuevos, son
// transformaciones de los ya conocidos —dakuten, っ + vocal larga, yōon—, y CLAUDE.md los
// describe por su TIPO de transformación, no por una lista cerrada de caracteres. Poner algo
// aquí sería inventar contenido japonés, y eso se pregunta, no se rellena a ojo. Sin
// entrada, quien lea el mapa cae en el título genérico —«Tomo 10»—, la misma regla que un
// tomo sin escribir.
export const BLOCK_PLAN_KANA: Readonly<Record<string, readonly string[]>> = {
  b1: ['あ', 'い', 'う', 'え', 'お', 'は'],
  b2: ['け', 'か', 'し', 'と', 'き', 'こ'],
  b3: ['ひ', 'ふ', 'へ', 'ほ', 'る', 'た'],
  b4: ['く', 'さ', 'す', 'せ', 'そ', 'ち', 'を'],
  b5: ['つ', 'て', 'ら', 'り', 'れ', 'ろ'],
  b6: ['ぬ', 'ま', 'わ', 'ん'],
  b7: ['ね', 'な', 'や', 'の'],
  b8: ['に', 'み', 'む', 'め'],
  b9: ['も', 'ゆ', 'よ'],
} satisfies Partial<Record<(typeof BLOCK_PLAN)[number], readonly string[]>>
