import { useMemo } from 'react'
import type { Kana, Word } from '../../../content/types'
import { BookButton } from '../parts/BookButton'
import { pickCards } from '../parts/pickCards'
import './KanaMatch.scss'

interface KanaMatchProps {
  word: Word
  kana: Kana
  // Qué se empareja con su sonido: `kana` el carácter suelto, `word` la palabra con los
  // demás kana ya puestos, `build` la palabra desde cero y sin ninguna pista en la hoja.
  //
  // Es el mismo ejercicio subiendo el listón, y por eso son un componente y no tres: lo
  // único que cambia es cuántos huecos van vacíos.
  scope: 'kana' | 'word' | 'build'
  // De dónde salen las tarjetas que sobran: los kana ya estudiados del bloque. Cuantos más
  // lleve dados el tomo, más falsas hay que descartar. Ver `pickCards`.
  pool: string[]
}

// Emparejar el sonido con su kana: se arrastra el carácter hasta el hueco.
//
// Solo hay UNA pareja: las demás tarjetas están para que haya que elegir, no para
// emparejarlas. La hoja admitiría varias sin cambiar de forma.
//
// Se arrastra Y se pulsa: arrastrar es el gesto que pide el ejercicio, pero no se puede
// hacer con el teclado y en una pantalla pequeña se falla mucho.
//
// Aquí solo está el markup: el arrastre lo atiende `kanaPairing.ts`, porque estas páginas
// las clona page-flip.
export function KanaMatch({ word, kana, scope, pool }: KanaMatchProps) {
  // Barajadas una vez por montaje: sin barajar, la respuesta caería siempre en el mismo
  // sitio y se acabaría recordando la posición en vez del kana.
  const tiles = useMemo(
    () => pickCards(word.units.map((unit) => unit.kana), pool),
    [word, pool],
  )

  // Un kana suelto se dice como una palabra de una sola pieza, así que las variantes son la
  // misma lista con distinta longitud y no hacen falta dos maquetados.
  const units =
    scope === 'kana' ? [{ kana: kana.character, romaji: kana.romaji }] : word.units

  // Construyendo la palabra entera se vacían todas; si no, solo la del kana que se estudia.
  const isSlot = (unit: { kana: string }) => scope === 'build' || unit.kana === kana.character

  // No siempre se enseña —ver `clue`—, y al acertar solo se dice cuando lo emparejado es un
  // kana suelto: una palabra se confirma por su significado.
  const reading = units.map((unit) => unit.romaji).join('')

  // La pista con la que se empareja. Con un kana suelto es su lectura; con una palabra es su
  // SIGNIFICADO y no su lectura, aunque parezca lo contrario: puesto `aoi` al lado de おい, la
  // あ que falta se deduce leyendo, sin recordar ningún kana.
  //
  // Construyendo la palabra entera no hay pista NINGUNA en esta hoja: el enunciado está
  // enfrente, y repetirlo aquí quitaría a la hoja su papel de sitio donde solo se contesta.
  const clue = scope === 'word' ? word.meaning : reading

  // Suena lo que se empareja, no siempre el kana: en la hoja de la palabra el enunciado ES
  // oír «aoi». Construyendo, el botón vive enfrente y aquí no se repite.
  const audio = scope === 'word' ? word.audio : kana.audio

  return (
    <div
      className="kana-match"
      // Lo que necesita quien corrige viaja en atributos: es un clon fuera de React.
      data-answer={kana.character}
      // La ficha COMPLETA, con el hueco ya resuelto: es lo que se dice al acertar, y quien lo
      // dice no puede recomponerla por su cuenta.
      data-word={units.map((unit) => unit.kana).join('')}
      data-reading={reading}
      // SOLO cuando lo que se reconstruye es la palabra entera: あ no es «azul», así que con
      // `kana` no viaja, y su ausencia es lo que le dice al corrector qué puede decir.
      data-meaning={scope === 'kana' ? undefined : word.meaning}
    >
      {/* La pareja a medias: la pista puesta y el kana por poner. Las dos mitades
          se leen como las caras de una ficha de dominó, no como una etiqueta con
          un cajón al lado — por eso la línea va entre ellas y no alrededor. */}
      <div className="kana-match__pair">
        <span className="kana-match__written" lang="ja">
          {units.map((unit, index) =>
            isSlot(unit) ? (
              // La respuesta va en CADA hueco y no en el ejercicio entero: así una ficha puede
              // tener varios huecos con respuestas distintas sin cambiar la corrección.
              <span
                className="kana-match__slot"
                data-answer={unit.kana}
                key={`${word.id}-${index}`}
              />
            ) : (
              // Un kana que acompaña, ya puesto: está para que se vea de qué palabra se trata.
              <span className="kana-match__unit" key={`${word.id}-${index}`}>
                {unit.kana}
              </span>
            ),
          )}
        </span>

        {/* Una transcripción se lee letra a letra y una palabra española no, así
            que solo la primera lleva el espaciado suelto del romaji. */}
        {scope !== 'build' ? (
          <span
            className={
              scope === 'word'
                ? 'kana-match__clue kana-match__clue--meaning'
                : 'kana-match__clue kana-match__clue--reading'
            }
          >
            {clue}
          </span>
        ) : null}
      </div>

      {/* El sonido de lo que hay que emparejar. Aquí no es un extra: el ejercicio
          une un sonido con una forma, y sin poder oírlo solo queda emparejar una
          transcripción, que es otra cosa.

          Sigue siendo opcional porque no todo el temario estará grabado a la vez;
          la hoja enseña el botón solo si hay grabación. */}
      {audio && scope !== 'build' ? (
        <BookButton className="kana-match__listen" data-audio={audio}>
          Escuchar
        </BookButton>
      ) : null}

      {/* Lista de verdad: son opciones hermanas y en igualdad, y quien navegue con
          lector de pantalla necesita oír cuántas hay antes de elegir. */}
      <ul className="kana-match__deck">
        {tiles.map((character) => (
          <li className="kana-match__seat" key={character}>
            {/* <button> y no un <div> arrastrable, y aquí importa el doble: además
                de la semántica, page-flip ignora el `mousedown` que cae sobre un
                <button>. Con un <div> el gesto de arrastrar la tarjeta sería el
                gesto de pasar la hoja, y se llevaría la página por delante. */}
            <BookButton
              className="kana-match__tile"
              data-kana={character}
              lang="ja"
              aria-label={`Colocar el kana ${character}`}
            >
              {character}
            </BookButton>
          </li>
        ))}
      </ul>

      {/* El acierto o el fallo. Lo rellena `kanaPairing.ts`. */}
      <p className="kana-match__result" role="status" aria-live="polite" />
    </div>
  )
}
