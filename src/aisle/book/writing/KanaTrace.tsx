import type { Kana } from '../../../content/types'
import { BookButton } from '../parts/BookButton'
import './KanaTrace.scss'

interface KanaTraceProps {
  kana: Kana
}

// La pauta para escribir el kana a mano.
//
// Va enfrentada a la tarjeta: allí se ve y se oye, y aquí se escribe.
//
// ── Los pasos ──────────────────────────────────────────────────────────────
// Una casilla por trazo, y cada una enseña el kana tal y como va quedando: la
// primera con el primer trazo, la segunda con los dos primeros, y así. El trazo
// que ENTRA en cada paso va marcado y los que ya estaban salen apagados, que es
// lo que permite ver de un vistazo qué añade cada movimiento sin tener que
// comparar una casilla con la de al lado.
//
// Cuántas casillas hay no lo decide este componente: lo dice el contenido, por el
// número de trazos que tenga el kana. Uno de dos trazos genera dos casillas sin
// tocar nada aquí.
//
// ── La pizarra ─────────────────────────────────────────────────────────────
// Aquí SOLO está el markup. El dibujo se cablea a mano sobre el nodo clonado, por
// lo mismo que el sonido y la animación: page-flip clona estas páginas y un
// manejador de React se quedaría en la copia que nadie ve. Ver `kanaBoard.ts`.
export function KanaTrace({ kana }: KanaTraceProps) {
  return (
    // El carácter viaja en un atributo porque el veredicto lo nombra —«あ al 87 %»—
    // y quien lo escribe es un clon fuera de React, que solo conserva atributos.
    //
    // Va el carácter y no la palabra «hiragana»: este ejercicio tiene que servir
    // igual en katakana y en kanji, y para eso no puede saber en qué pasillo está.
    <div className="kana-trace" data-character={kana.character}>
      <p className="kana-trace__hint">
        Sigue el orden de los trazos y escríbelo en la pizarra.
      </p>

      {/* Los pasos se esconden del lector de pantalla: son el mismo carácter
          repetido, y el orden de trazos ya está contado en palabras en la hoja
          del ejercicio anterior. */}
      <div className="kana-trace__steps" aria-hidden="true">
        {kana.strokes.map((_, step) => {
          // Un recorte por casilla. El id lleva el del kana y el del paso porque
          // page-flip clona estas hojas, y dos siluetas con el mismo nombre en el
          // documento se pisarían.
          const clipId = `kana-step-${kana.id}-${step}`

          return (
            <div className="kana-trace__step" key={clipId}>
              <svg
                className="kana-trace__glyph"
                viewBox={kana.strokeViewBox}
                preserveAspectRatio="xMidYMid meet"
              >
                <defs>
                  <clipPath id={clipId}>
                    <path d={kana.outline} />
                  </clipPath>
                </defs>

                {/* Mismo recorte que en la ilustración mnemotécnica: una brocha
                    muy gorda de la que solo se ve lo que cae dentro de la letra.
                    Es lo que da al trazo su forma real en vez de un tubo.

                    La ÚLTIMA casilla se marca porque es la única que tiene los
                    trazos completos y en orden, y es de donde los lee el
                    corrector para compararlos con lo que se escriba. Va marcada
                    a propósito en vez de darlo por hecho: si un día cambia cómo
                    se reparten los pasos, esto se busca solo. */}
                <g
                  clipPath={`url(#${clipId})`}
                  data-reference={step === kana.strokes.length - 1 ? '' : undefined}
                >
                  {kana.strokes.slice(0, step + 1).map((d, index) => (
                    <path
                      className={
                        index === step
                          ? 'kana-trace__stroke kana-trace__stroke--new'
                          : 'kana-trace__stroke'
                      }
                      key={`${clipId}-${index}`}
                      d={d}
                    />
                  ))}
                </g>
              </svg>

              <span className="kana-trace__number">{step + 1}</span>
            </div>
          )
        })}
      </div>

      {/* La pizarra. La cruz guía la pinta el CSS del marco, debajo; el canvas va
          encima y transparente, y solo lleva lo que se escriba.

          El tamaño del lienzo NO se fija aquí: un canvas tiene dos medidas —la
          que ocupa en la página y la de su rejilla de píxeles— y si no coinciden
          lo dibujado sale borroso y desplazado respecto al puntero. Las cuadra
          `kanaBoard.ts` al montar, que es cuando se sabe cuánto mide de verdad. */}
      <div className="kana-trace__board">
        <canvas className="kana-trace__canvas" />
      </div>

      {/* La corrección de cada trazo, según se levanta el dedo. Nace vacío y lo
          rellena `kanaBoard.ts`.

          `role="status"` con `aria-live` para que quien no ve la pizarra se
          entere igual de cómo va: es la única forma de saber el resultado, y sin
          esto el ejercicio sería mudo para un lector de pantalla. */}
      <p className="kana-trace__result" role="status" aria-live="polite" />

      {/* El veredicto del kana entero, cuando ya está escrito. Va aparte del aviso
          de arriba porque son dos cosas distintas: aquel corrige el trazo que se
          acaba de hacer y se sustituye con el siguiente; este es el resultado del
          ejercicio y se queda hasta que se borra. */}
      <p className="kana-trace__verdict" role="status" aria-live="polite" />

      {/* Lo que ha sacado cada trazo, para que la media no sea un número que haya
          que creerse. Sin `aria-live` propio: el veredicto de arriba ya avisa, y
          dos anuncios a la vez se pisan. */}
      <p className="kana-trace__detail" />

      {/* <button> de verdad: page-flip deja pasar el `mousedown` sobre <button> y
          <a>, así que pulsar aquí no se lleva la hoja por delante. */}
      <BookButton className="kana-trace__clear">Borrar</BookButton>
    </div>
  )
}
