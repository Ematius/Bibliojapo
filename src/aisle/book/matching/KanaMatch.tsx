import { useMemo } from 'react'
import type { Kana, Word } from '../../../content/types'
import { BookButton } from '../parts/BookButton'
import { pickCards } from '../parts/pickCards'
import './KanaMatch.scss'

interface KanaMatchProps {
  word: Word
  kana: Kana
  // Qué se empareja con su sonido.
  //
  //   kana   el carácter suelto: la ficha tiene un único hueco y suena «a»
  //   word   la palabra entera: los kana que la acompañan vienen YA puestos, solo
  //          falta el que se estudia, y suena «aoi»
  //   build  la palabra desde cero: TODOS los huecos vacíos y ninguna pista en la
  //          hoja — el enunciado está enfrente, en `WordPrompt`
  //
  // Es el mismo ejercicio subiendo el listón. Primero se empareja un sonido con una
  // forma; después hay que encontrar qué parte de una palabra le corresponde; al
  // final hay que escribir la palabra entera sin tener delante ni un carácter. Los
  // tres se resuelven con el mismo gesto, y por eso son un componente y no tres:
  // lo único que cambia es cuántos huecos van vacíos.
  scope: 'kana' | 'word' | 'build'
  // De dónde salen las tarjetas que sobran: los kana ya estudiados del bloque.
  //
  // Cuantos más lleve dados el tomo, más tarjetas falsas hay que descartar, así
  // que la misma hoja va costando más según se avanza. Ver `pickCards`.
  pool: string[]
}

// Emparejar el sonido con su kana: se arrastra el carácter hasta el hueco que hay
// junto a `a`.
//
// ── Por qué solo hay una pareja ────────────────────────────────────────────
// El ejercicio del temario une varias a la vez, pero aquí solo hay un hueco: las
// demás tarjetas están para que haya que elegir, no para emparejarlas. Esta hoja
// admite varias parejas sin cambiar de forma —lo único que crecería es la lista—.
//
// ── De dónde salen las tarjetas ────────────────────────────────────────────
// Los kana de la palabra, que son la respuesta, más distractores sacados de lo ya
// estudiado en el bloque hasta seis. En la primera lección no hay nada anterior de
// donde sacarlos y solo salen los de la palabra; al final del tomo se elige entre
// seis. Ver `pickCards`.
//
// ── Por qué se arrastra Y se pulsa ─────────────────────────────────────────
// Arrastrar es el gesto que pide el ejercicio, pero no se puede hacer con el
// teclado, y en una pantalla pequeña se falla mucho. Así que pulsar una tarjeta
// la coloca directamente: el mismo ejercicio por dos caminos, sin que ninguno sea
// la versión pobre del otro. Ver `kanaPairing.ts`.
//
// Aquí solo está el markup: el arrastre lo atiende `kanaPairing.ts`, porque estas
// páginas las clona page-flip y un manejador de React se quedaría en la copia que
// nadie ve.
export function KanaMatch({ word, kana, scope, pool }: KanaMatchProps) {
  // Barajadas una vez por montaje, por lo mismo que en `WordPick`: sin barajar,
  // la respuesta caería siempre en el mismo sitio y se acabaría recordando la
  // posición en vez del kana.
  const tiles = useMemo(
    () => pickCards(word.units.map((unit) => unit.kana), pool),
    [word, pool],
  )

  // Lo que se ve en la ficha. Un kana suelto se dice como una palabra de una sola
  // pieza, así que las variantes son la misma lista con distinta longitud y no
  // hacen falta dos maquetados.
  const units =
    scope === 'kana' ? [{ kana: kana.character, romaji: kana.romaji }] : word.units

  // Qué unidades van vacías. Construyendo la palabra entera se vacían todas; en los
  // otros dos casos, solo la del kana que se estudia.
  const isSlot = (unit: { kana: string }) => scope === 'build' || unit.kana === kana.character

  // La lectura de lo que hay en la ficha: `a` o `aoi`. No siempre se enseña —ver
  // `clue`—, pero es lo que se dice al acertar.
  const reading = units.map((unit) => unit.romaji).join('')

  // La pista con la que se empareja, o sea la otra cara de la ficha.
  //
  // Con un kana suelto es su lectura. Con una palabra es su SIGNIFICADO, y no su
  // lectura, aunque parezca lo contrario: puesto `aoi` al lado de おい, la あ que
  // falta se deduce leyendo, sin haber escuchado nada ni recordado ningún kana.
  // Con «azul» hay que acordarse de cómo suena la palabra, que es lo que el
  // ejercicio quiere comprobar — y es lo que hace que el botón de escuchar sirva
  // para algo en vez de sobrar.
  // Construyendo la palabra entera no hay pista NINGUNA en esta hoja: el color y
  // el sonido están enfrente. Poner aquí el significado sería dar el enunciado dos
  // veces, y la hoja dejaría de ser el sitio donde solo se contesta.
  const clue = scope === 'word' ? word.meaning : reading

  // Suena lo que se empareja, no siempre el kana: en la hoja de la palabra el
  // enunciado ES oír «aoi» y reconocer qué parte de ese sonido falta por escribir.
  // Construyendo, el botón vive enfrente y aquí no se repite.
  const audio = scope === 'word' ? word.audio : kana.audio

  return (
    <div
      className="kana-match"
      // Lo que necesita quien corrige viaja en atributos: es un clon fuera de
      // React y de su origen solo conserva esto.
      data-answer={kana.character}
      // La ficha COMPLETA, con el hueco ya resuelto: es lo que se dice al
      // acertar, y quien lo dice es un clon fuera de React que no puede
      // recomponerla por su cuenta.
      data-word={units.map((unit) => unit.kana).join('')}
      data-reading={reading}
    >
      {/* La pareja a medias: la pista puesta y el kana por poner. Las dos mitades
          se leen como las caras de una ficha de dominó, no como una etiqueta con
          un cajón al lado — por eso la línea va entre ellas y no alrededor. */}
      <div className="kana-match__pair">
        <span className="kana-match__written" lang="ja">
          {units.map((unit, index) =>
            isSlot(unit) ? (
              // El hueco, y qué kana espera. La respuesta va en CADA hueco y no en
              // el ejercicio entero: así una ficha puede tener varios huecos con
              // respuestas distintas sin que la corrección cambie de forma.
              <span
                className="kana-match__slot"
                data-answer={unit.kana}
                key={`${word.id}-${index}`}
              />
            ) : (
              // Un kana que acompaña, ya puesto. No hay que colocarlo: está para
              // que se vea de qué palabra se trata y dónde encaja el que falta.
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
                ? 'kana-match__clue'
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
