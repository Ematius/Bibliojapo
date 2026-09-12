import { shuffle } from './shuffle'

// Las tarjetas de un ejercicio de elegir: las de la respuesta más DISTRACTORES. Sin ellos,
// una palabra de tres kana con tres tarjetas se resuelve por eliminación sin mirar ninguna.
//
// Es un tope y no una cuota: si el bloque todavía no da para seis, se reparten las que
// haya, y la dificultad sube sola conforme avanza el tomo.
export const MAX_CARDS = 6

// `answer` siempre entra, aunque pase del tope: sin ella la respuesta sería imposible.
// `pool` son los kana ya estudiados, nunca cualquiera: descartar tiene que ser reconocer.
export function pickCards(answer: string[], pool: string[], max = MAX_CARDS): string[] {
  const cards = [...new Set(answer)]
  const distractors = pool.filter((character) => !cards.includes(character))
  const room = Math.max(0, max - cards.length)

  // Se baraja dos veces: primero para elegir QUÉ distractores entran —si no, con un bloque
  // grande saldrían siempre los mismos— y después para repartirlo todo, o las de la
  // respuesta caerían siempre delante.
  return shuffle([...cards, ...shuffle(distractors).slice(0, room)])
}
