// El plan del pasillo: cuántos tomos tiene y cuánto suma su parte del N5. NO es
// temario —ni un título, ni una palabra, ni una lección—, y por eso puede viajar en el
// despliegue mientras `blocks.ts` se queda fuera. Ver «El contenido de pago no puede
// vivir en `content/`» en CLAUDE.md.

// El temario completo en orden.
export const BLOCK_PLAN: readonly string[] = [
  'b1',
  'b2',
  'b3',
  'b4',
  'b5',
  'b6',
  'b7',
  'b8',
  'b9',
  'b10',
  'b11',
  'b12',
  'b13',
  'b14',
  'b15',
  'b16',
  'b17',
  'b18',
]

// Cuántas LECCIONES de kana tiene el pasillo, que es lo que cuenta el carné: los 46
// base, los 5 handakuten, っ, ー y ゃゅょ. Los 20 dakuten no suman — no son lección, se
// aprenden sobre el kana base que ya se sabe, en el mismo bloque que él.
export const HIRAGANA_BASE_COUNT = 56

// El vocabulario del N5 entero, del que la Fase 1 cubre 768.
export const N5_WORD_COUNT = 846

export const KATAKANA_BASE_COUNT = 46
export const N5_KANJI_COUNT = 100
