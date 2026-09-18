import { BLOCK_PLAN } from './blocks'

// Plan exacto de caracteres por bloque. B10–B12 contienen transformaciones
// explícitas y B13 no añade hiragana nuevo porque cruza con katakana.
export const BLOCK_PLAN_KANA: Readonly<Record<string, readonly string[]>> = {
  b1: ['あ', 'い', 'う', 'え', 'お', 'は'],
  b2: ['し', 'る', 'れ', 'と', 'く', 'そ'],
  b3: ['ひ', 'ふ', 'へ', 'ほ', 'こ', 'ろ', 'の'],
  b4: ['か', 'き', 'け', 'さ', 'す', 'せ', 'た'],
  b5: ['ち', 'つ', 'て', 'な', 'に', 'ぬ', 'ね'],
  b6: ['ら', 'り', 'ん', 'も'],
  b7: ['ま', 'よ', 'や', 'わ', 'み'],
  b8: ['む', 'め', 'を'],
  b9: ['ゆ'],
  b10: ['が', 'ぎ', 'ぐ', 'げ', 'ご', 'ざ', 'じ', 'ず', 'ぜ', 'ぞ', 'だ', 'ぢ', 'づ', 'で', 'ど', 'ば', 'び', 'ぶ', 'べ', 'ぼ'],
  b11: ['ぱ', 'ぴ', 'ぷ', 'ぺ', 'ぽ', 'っ', 'ー'],
  b12: ['ゃ', 'ゅ', 'ょ'],
  b13: [],
} satisfies Partial<Record<(typeof BLOCK_PLAN)[number], readonly string[]>>
