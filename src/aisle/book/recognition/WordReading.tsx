import type { Kana, Word } from '../../../content/types'
import { BookButton } from '../parts/BookButton'
import './WordReading.scss'

interface WordReadingProps {
  word: Word
  kana: Kana
}

// La misma palabra que en `WordCard`, pero dicha en romaji: `aoi` con la `a`
// destacada.
//
// Es la hoja de partida del reconocimiento inverso. En el ejercicio anterior se
// veía あおい y había que sacar el sonido; aquí se da el sonido y en la hoja de al
// lado hay que reconstruir la escritura. Lo que se aprende es lo mismo visto del
// otro lado, y por eso las dos hojas se parecen tanto a propósito: cambiar la
// presentación además de la dirección haría parecer que son dos cosas distintas.
//
// Qué se destaca no lo decide este componente: destaca la lectura de lo que
// coincida con el kana que se estudia, igual que `WordCard` destaca su carácter.
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
