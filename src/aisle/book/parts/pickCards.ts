import { shuffle } from './shuffle'

// Las tarjetas que se reparten en un ejercicio de elegir.
//
// Son las de la respuesta más DISTRACTORES: opciones falsas que hay que
// descartar. Sin ellas, una palabra de tres kana con tres tarjetas se resuelve
// por eliminación sin mirar ninguna, que es justo lo contrario de lo que el
// ejercicio quiere comprobar.
//
// El tope sale del catálogo de ejercicios —«entre 6 tarjetas elige そ»—, pero es
// un tope y no una cuota: si el bloque todavía no da para seis, se reparten las
// que haya. Así la dificultad sube sola conforme avanza el tomo, en vez de tener
// que esperar a que el bloque esté completo para que el ejercicio funcione.
export const MAX_CARDS = 6

// `answer` son los kana que hacen falta para responder y siempre entran, aunque
// pasen del tope: sin ellos la respuesta sería imposible. `pool` es de dónde
// salen los distractores — los kana ya estudiados, nunca cualquiera, porque
// descartar tiene que ser reconocer y no adivinar.
export function pickCards(answer: string[], pool: string[], max = MAX_CARDS): string[] {
  const cards = [...new Set(answer)]
  const distractors = pool.filter((character) => !cards.includes(character))
  const room = Math.max(0, max - cards.length)

  // Se baraja dos veces y no una: primero para elegir QUÉ distractores entran
  // —si no, con un bloque grande saldrían siempre los mismos— y después para
  // repartirlo todo, o las de la respuesta caerían siempre delante.
  return shuffle([...cards, ...shuffle(distractors).slice(0, room)])
}
