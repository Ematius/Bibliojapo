import { wordReading, wordText, type Kana, type Word } from '../../../content/types'
import './WordGap.scss'

interface WordGapProps {
  word: Word
  kana: Kana
}

// La misma palabra de la hoja de al lado, pero con un hueco donde va el kana que
// se estudia: `___oi` para あおい.
//
// Es el reconocimiento al revés. En la hoja anterior se ve あ dentro de la palabra
// y aquí hay que saber cómo suena, sin tenerlo delante. La traducción sigue debajo
// porque lo que se comprueba es el sonido del kana, no si recuerda qué era «azul».
//
// El hueco lo abre lo que COINCIDA con el kana estudiado, así que si apareciera
// dos veces se abrirían dos huecos, y con cualquier otro kana funciona igual sin
// tocar nada.
//
// Aquí solo está el markup: lo que se teclea lo atiende `wordAnswer.ts`, porque
// estas páginas las clona page-flip y un manejador de React se quedaría en la
// copia que nadie ve.
export function WordGap({ word, kana }: WordGapProps) {
  // La palabra entera viaja en atributos: quien corrige es un clon fuera de React
  // y la necesita para decir cómo se leía al acertar.
  return (
    <div className="word-gap" data-word={wordText(word)} data-reading={wordReading(word)}>
      <p className="word-gap__reading">
        {word.units.map((unit, index) =>
          unit.kana === kana.character ? (
            <input
              className="word-gap__input"
              key={`${word.id}-${index}`}
              type="text"
              // La respuesta viaja en un atributo porque quien corrige es un clon
              // fuera de React, y de su origen solo conserva los atributos.
              data-answer={unit.romaji}
              maxLength={unit.romaji.length}
              // Un hueco de romaji no es un campo de formulario: ni se autocompleta,
              // ni se corrige, ni se pone en mayúscula la primera letra. Sin esto,
              // el teclado de un móvil escribe «A» y la respuesta falla por algo que
              // no ha hecho el usuario.
              autoComplete="off"
              autoCapitalize="off"
              autoCorrect="off"
              spellCheck={false}
              aria-label="Escribe en romaji el kana que falta"
            />
          ) : (
            <span className="word-gap__letter" key={`${word.id}-${index}`}>
              {unit.romaji}
            </span>
          ),
        )}
      </p>

      <p className="word-gap__meaning">{word.meaning}</p>

      {/* El acierto o el fallo, en cuanto se escribe. Lo rellena `wordAnswer.ts`. */}
      <p className="word-gap__result" role="status" aria-live="polite" />
    </div>
  )
}
