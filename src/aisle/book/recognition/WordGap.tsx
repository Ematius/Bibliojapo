import { wordReading, wordText, type Kana, type Word } from '../../../content/types'
import './WordGap.scss'

interface WordGapProps {
  word: Word
  kana: Kana
  // Cuántos huecos se abren.
  //
  //   studied  solo el que COINCIDA con el kana estudiado: `___oi` para あ
  //   all      todos: `___ ___ ___`, un dictado de la palabra entera
  //
  // Es el mismo ejercicio subiendo el listón, igual que en `KanaMatch`: primero se
  // escribe el sonido de un kana suelto dentro de una palabra conocida; más
  // adelante hay que escribir la lectura completa sin que quede ni una letra de
  // pista.
  scope?: 'studied' | 'all'
}

// La misma palabra de la hoja de al lado, pero con un hueco donde va el kana que
// se estudia: `___oi` para あおい. En su modo `all`, TODOS los huecos: la lectura
// completa, de dictado.
//
// Es el reconocimiento al revés. En la hoja anterior se ve あ dentro de la palabra
// y aquí hay que saber cómo suena, sin tenerlo delante. La traducción sigue debajo
// porque lo que se comprueba es el sonido, no si recuerda qué era «azul».
//
// En `studied`, el hueco lo abre lo que COINCIDA con el kana estudiado, así que si
// apareciera dos veces se abrirían dos huecos, y con cualquier otro kana funciona
// igual sin tocar nada. En `all` da igual: se abren todos, y `kana` deja de
// decidir nada — se sigue pidiendo por tener la misma forma que el resto de hojas
// de la palabra.
//
// Aquí solo está el markup: lo que se teclea lo atiende `wordAnswer.ts`, que ya
// admite varios huecos en la misma hoja sin cambiar nada, porque estas páginas las
// clona page-flip y un manejador de React se quedaría en la copia que nadie ve.
export function WordGap({ word, kana, scope = 'studied' }: WordGapProps) {
  // La palabra entera viaja en atributos: quien corrige es un clon fuera de React
  // y la necesita para decir cómo se leía al acertar.
  return (
    <div
      // En `all` cada hueco se ve como su propia casilla —ver WordGap.scss—: con
      // un solo hueco los kana de alrededor ya bastan para saber dónde empieza y
      // acaba, pero con todos vacíos a la vez hace falta la línea que los separe.
      className={scope === 'all' ? 'word-gap word-gap--dictation' : 'word-gap'}
      data-word={wordText(word)}
      data-reading={wordReading(word)}
    >
      <p className="word-gap__reading">
        {word.units.map((unit, index) =>
          scope === 'all' || unit.kana === kana.character ? (
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
              aria-label={
                scope === 'all'
                  ? 'Escribe en rōmaji este kana de la palabra'
                  : 'Escribe en rōmaji el kana que falta'
              }
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
