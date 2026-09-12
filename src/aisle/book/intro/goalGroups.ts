import type { Sentence, Word } from '../../../content/types'

// Las frases del bloque, repartidas por el TEMA del que hablan.
export interface GoalGroup {
  // El id de la palabra que hace de tema, que es también la clave de la lista.
  id: string
  topic: Word
  sentences: Sentence[]
}

// Agrupa las frases por su tema, que en este temario es siempre la primera palabra: todas
// siguen el patrón TEMA + は + PREDICADO.
//
// Agrupa las SEGUIDAS, no todas las del mismo tema estén donde estén: así el orden que
// decidió quien escribió el temario se respeta tal cual, en vez de reordenarlo por la espalda.
//
// El buscador de palabras llega de fuera: una hoja del tomo no lee el temario, lo recibe.
export function groupSentencesByTopic(
  sentences: Sentence[],
  wordById: (id: string) => Word | undefined,
): GoalGroup[] {
  const groups: GoalGroup[] = []

  for (const sentence of sentences) {
    const id = sentence.wordIds[0]
    const topic = id ? wordById(id) : undefined
    if (!topic) continue

    const open = groups.at(-1)
    if (open && open.id === id) open.sentences.push(sentence)
    else groups.push({ id, topic, sentences: [sentence] })
  }

  return groups
}
