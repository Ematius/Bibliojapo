// El plan del pasillo: cuántos tomos tiene y cuánto suma su parte del N5. NO es
// temario —ni un título, ni una palabra, ni una lección—, y por eso puede viajar en el
// despliegue mientras `blocks.ts` se queda fuera. Ver «El contenido de pago no puede
// vivir en `content/`» en CLAUDE.md.

// El temario completo en orden. B13 es el cruce explícito con la Fase 2.
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
]

// Los 46 kana base; las transformaciones de B10–B12 no incrementan este total base.
export const HIRAGANA_BASE_COUNT = 46

// Aproximado a propósito: el examen no publica su lista de vocabulario.
export const N5_WORD_COUNT = 800

export const KATAKANA_BASE_COUNT = 46
export const N5_KANJI_COUNT = 100
