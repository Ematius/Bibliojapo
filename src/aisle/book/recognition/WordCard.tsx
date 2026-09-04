import type { Kana, Word } from '../../../content/types'
import { BookButton } from '../parts/BookButton'
import './WordCard.scss'

interface WordCardProps {
  word: Word
  kana: Kana
}

// Una palabra de verdad, con el kana que se estudia destacado dentro.
//
// Es el salto del carácter suelto a la lengua: reconocer あ en una tabla no
// demuestra gran cosa, y encontrarlo dentro de あおい sí. Los kana que todavía no
// se han visto se adelantan a propósito —aquí no hay que leerlos, solo verlos
// acompañando al que ya se conoce—.
//
// Qué destacar no lo decide este componente: destaca lo que coincida con el kana
// que se está estudiando, así que la misma hoja sirve para cualquier kana de
// cualquier pasillo sin tocar nada.
export function WordCard({ word, kana }: WordCardProps) {
  return (
    <div className="word-card">
      <p className="word-card__word" lang="ja">
        {word.units.map((unit, index) => (
          <span
            className={
              unit.kana === kana.character
                ? 'word-card__unit word-card__unit--known'
                : 'word-card__unit'
            }
            key={`${word.id}-${index}`}
          >
            {unit.kana}
          </span>
        ))}
      </p>

      <p className="word-card__meaning">{word.meaning}</p>

      {/* El botón solo aparece si la palabra está grabada: el temario tiene 228 y
          no todas lo estarán a la vez, y un botón que no suena es peor que no
          tenerlo.

          <button> de verdad y con la ruta en `data-audio`, que es lo que hace que
          `bookAudio.ts` lo encuentre sin saber nada de esta hoja — y lo que impide
          que pulsarlo pase la página. */}
      {word.audio ? (
        <BookButton className="word-card__listen" data-audio={word.audio}>
          Escuchar
        </BookButton>
      ) : null}
    </div>
  )
}
