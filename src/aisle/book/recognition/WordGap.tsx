import { wordReading, wordText, type Kana, type Word } from '../../../content/types'
import './WordGap.scss'

interface WordGapProps {
  word: Word
  kana: Kana
  // `studied` abre solo el hueco que COINCIDA con el kana estudiado —`___oi` para あ—; `all`
  // los abre todos, un dictado de la palabra entera. Es el mismo ejercicio subiendo el listón.
  scope?: 'studied' | 'all'
}

// La misma palabra de la hoja de al lado, con un hueco donde va el kana que se estudia. Es
// el reconocimiento al revés: allí se ve あ dentro de la palabra y aquí hay que saber cómo
// suena sin tenerlo delante. La traducción sigue debajo porque lo que se comprueba es el
// sonido, no si recuerda qué era «azul».
//
// En `studied` el hueco lo abre lo que coincida con el kana, así que si apareciera dos veces
// se abrirían dos. En `all`, `kana` deja de decidir nada: se sigue pidiendo por tener la
// misma forma que el resto de hojas de la palabra.
//
// Aquí solo está el markup: lo que se teclea lo atiende `wordAnswer.ts`, porque estas
// páginas las clona page-flip.
export function WordGap({ word, kana, scope = 'studied' }: WordGapProps) {
  // La palabra entera viaja en atributos: quien corrige es un clon fuera de React.
  return (
    <div
      // En `all` cada hueco se ve como su propia casilla: con uno solo los kana de alrededor
      // bastan para saber dónde empieza, pero con todos vacíos hace falta la línea que separa.
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
              // La respuesta viaja en un atributo: quien corrige es un clon fuera de React.
              data-answer={unit.romaji}
              maxLength={unit.romaji.length}
              // Un hueco de rōmaji no es un campo de formulario. Sin esto, el teclado de un
              // móvil escribe «A» y la respuesta falla por algo que no ha hecho el usuario.
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
