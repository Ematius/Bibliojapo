import type { Kana, Word } from '../../../content/types'
import { BookButton } from '../parts/BookButton'
import './WordCard.scss'

interface WordCardProps {
  word: Word
  kana: Kana
}

// Una palabra de verdad, con el kana que se estudia destacado dentro. Los kana que todavía
// no se han visto se adelantan a propósito: aquí no hay que leerlos, solo verlos acompañando
// al que ya se conoce.
//
// Qué destacar no lo decide este componente: destaca lo que coincida con el kana que se está
// estudiando, así que la misma hoja sirve para cualquier kana de cualquier pasillo.
export function WordCard({ word, kana }: WordCardProps) {
  // El color manda sobre el dibujo, igual que en `WordPrompt`: a una palabra que ES un
  // color, ilustrarla sería decir lo mismo dos veces.
  const swatch = word.swatch
  const image = !swatch ? word.image : undefined

  return (
    <div className="word-card">
      {/* Lo que la palabra significa, visto antes de leerla. Esta hoja es su DEBUT, y
          las cinco planas siguientes la reconocen y la escriben: sin saber de qué habla,
          lo único que se practica en ellas es copiar caracteres.

          No destripa nada que no dijera ya el significado escrito justo debajo. */}
      {swatch ? (
        <span
          className="word-card__swatch"
          style={{ background: swatch }}
          role="img"
          aria-label={word.meaning}
        />
      ) : null}

      {image ? (
        <img className="word-card__image" src={image} alt={word.imageAlt ?? word.meaning} />
      ) : null}

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
