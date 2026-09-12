import { useMemo } from 'react'
import { wordReading, wordText, type Kana, type Word } from '../../../content/types'
import { BookButton } from '../parts/BookButton'
import { pickCards } from '../parts/pickCards'
import './WordPick.scss'

interface WordPickProps {
  word: Word
  kana: Kana
  // Los kana ya estudiados del bloque, de donde salen las opciones falsas: はは daría una
  // sola opción, y una opción no es una elección. Ver `pickCards`.
  pool: string[]
}

// La palabra escrita con un hueco donde va el kana que se estudia: `◯おい` para あおい.
//
// Es el ejercicio 3 del revés: allí se veía el kana y había que teclear su sonido; aquí se
// da el sonido y hay que reconstruir la escritura. Se elige en vez de escribir porque un
// teclado español no escribe hiragana, y pedirlo convertiría un ejercicio de kana en uno de
// configurar el ordenador.
//
// Aquí solo está el markup: los clics los atiende `wordChoice.ts`, porque estas páginas las
// clona page-flip.
export function WordPick({ word, kana, pool }: WordPickProps) {
  // Barajadas una vez por montaje. Sin barajar, la respuesta caería siempre en el mismo
  // sitio y se acabaría recordando la posición en vez del kana.
  const options = useMemo(
    () => pickCards(word.units.map((unit) => unit.kana), pool),
    [word, pool],
  )

  return (
    <div
      className="word-pick"
      // Todo lo que necesita quien corrige viaja en atributos: es un clon fuera de React.
      data-answer={kana.character}
      data-word={wordText(word)}
      data-reading={wordReading(word)}
    >
      <p className="word-pick__word" lang="ja">
        {word.units.map((unit, index) =>
          unit.kana === kana.character ? (
            // El hueco lo rellena `wordChoice.ts` al acertar; si el kana apareciera dos veces
            // se abrirían dos y se completarían a la vez.
            <span className="word-pick__slot" key={`${word.id}-${index}`} />
          ) : (
            <span className="word-pick__unit" key={`${word.id}-${index}`}>
              {unit.kana}
            </span>
          ),
        )}
      </p>

      <p className="word-pick__meaning">{word.meaning}</p>

      {/* Lista de verdad: son varias opciones hermanas y en igualdad, y quien
          navegue con lector de pantalla necesita oír cuántas hay antes de elegir. */}
      <ul className="word-pick__options">
        {options.map((character) => (
          <li className="word-pick__option" key={character}>
            {/* <button> y no un <div> pulsable: page-flip deja pasar la pulsación
                sobre <button>, y sobre cualquier otra cosa la anula para poder
                arrastrar la hoja. Con un <div> se pasaría página al elegir. */}
            <BookButton className="word-pick__choice" data-kana={character} lang="ja">
              {character}
            </BookButton>
          </li>
        ))}
      </ul>

      {/* El acierto o el fallo. Lo rellena `wordChoice.ts`. */}
      <p className="word-pick__result" role="status" aria-live="polite" />
    </div>
  )
}
