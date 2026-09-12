import type { Kana, Word } from '../../../content/types'
import { BookButton } from '../parts/BookButton'
import './WordReading.scss'

interface WordReadingProps {
  word: Word
  kana: Kana
}

// La misma palabra que en `WordCard`, dicha en rōmaji: `aoi` con la `a` destacada.
//
// Es la hoja de partida del reconocimiento inverso, y se parece tanto a `WordCard` a
// propósito: cambiar la presentación además de la dirección haría parecer que son dos cosas
// distintas. Destaca la lectura de lo que coincida con el kana que se estudia.
export function WordReading({ word, kana }: WordReadingProps) {
  return (
    <div className="word-reading">
      <p className="word-reading__word">
        {word.units.map((unit, index) => (
          <span
            className={
              unit.kana === kana.character
                ? 'word-reading__unit word-reading__unit--known'
                : 'word-reading__unit'
            }
            key={`${word.id}-${index}`}
          >
            {unit.romaji}
          </span>
        ))}
      </p>

      <p className="word-reading__meaning">{word.meaning}</p>

      {/* Aquí el sonido pesa más que en ninguna otra hoja: esta plana se recorre
          del sonido a la escritura, así que oír la palabra ES el enunciado.
          Sigue siendo opcional porque no todas las palabras del temario estarán
          grabadas a la vez. */}
      {word.audio ? (
        <BookButton className="word-reading__listen" data-audio={word.audio}>
          Escuchar
        </BookButton>
      ) : null}
    </div>
  )
}
