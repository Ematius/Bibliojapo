import { BLOCK_PLAN } from './plan'

// Plan exacto de caracteres por bloque: los que son LECCIÓN. El orden no es el de la
// tabla tradicional sino el de la «pareja verbal» —para conjugar un godan acabado en く
// hace falta き, y por eso van juntos—, así que reordenar los bloques rompe las
// conjugaciones que cada uno habilita.
export const BLOCK_PLAN_KANA: Readonly<Record<string, readonly string[]>> = {
  b1: ['あ', 'い', 'う', 'え', 'お', 'は'],
  b2: ['ま', 'す', 'て', 'せ', 'ん'],
  b3: ['り', 'し', 'る', 'か'],
  b4: ['こ', 'な', 'さ', 'わ'],
  b5: ['た', 'み', 'そ', 'ね'],
  b6: ['く', 'き', 'ら'],
  b7: ['と', 'ち'],
  b8: ['つ', 'け'],
  b9: ['ふ', 'ひ'],
  b10: ['れ', 'も'],
  b11: ['に', 'よ'],
  b12: ['ろ', 'の'],
  b13: ['や', 'ほ'],
  b14: ['め', 'む'],
  b15: ['へ', 'ゆ'],
  b16: ['ぬ', 'を'],
  b17: ['っ', 'ぱ', 'ぴ', 'ぷ', 'ぺ', 'ぽ'],
  b18: ['ー', 'ゃ', 'ゅ', 'ょ'],
} satisfies Partial<Record<(typeof BLOCK_PLAN)[number], readonly string[]>>

// Los dakuten que estrena cada bloque. Van aparte de los de arriba porque NO son
// lección: se enseñan sobre su kana base, en el mismo bloque que él, y no cuentan para
// el carné. B1 se queda limpio a propósito y su ば pasa al B2.
export const BLOCK_PLAN_DAKUTEN: Readonly<Record<string, readonly string[]>> = {
  b2: ['で', 'ぜ', 'ず', 'ば'],
  b3: ['じ', 'が'],
  b4: ['ご', 'ざ'],
  b5: ['だ', 'ぞ'],
  b6: ['ぐ', 'ぎ'],
  b7: ['ど', 'ぢ'],
  b8: ['づ', 'げ'],
  b9: ['ぶ', 'び'],
  b13: ['ぼ'],
  b15: ['べ'],
} satisfies Partial<Record<(typeof BLOCK_PLAN)[number], readonly string[]>>
