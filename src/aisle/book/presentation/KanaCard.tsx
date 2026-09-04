import type { Kana } from '../../../content/types'
import { BookButton } from '../parts/BookButton'
import './KanaCard.scss'

interface KanaCardProps {
  kana: Kana
}

// La presentación del kana: la forma, su lectura y su sonido.
//
// Es el segundo ejercicio del temario, y va justo después del mnemotécnico: allí
// se cuenta la historia que fija el carácter en la memoria, y aquí se ve el kana
// desnudo, sin dibujo detrás, con lo único que hay que recordar de él.
//
// Aquí SOLO está el markup, igual que en KanaStroke y por el mismo motivo: estas
// páginas las clona page-flip para meterlas en su estructura, así que un manejador
// de React se quedaría enganchado a la copia que nadie ve. El sonido se cablea a
// mano sobre el nodo clonado — ver `bookAudio.ts`.
export function KanaCard({ kana }: KanaCardProps) {
  return (
    <div className="kana-card">
      {/* `lang` no es adorno: le dice al navegador que esto es japonés y no un
          símbolo suelto, y es lo que hace que elija la forma japonesa del glifo
          en lugar de la china si la fuente trae las dos. */}
      <p className="kana-card__character" lang="ja">
        {kana.character}
      </p>

      <p className="kana-card__romaji">{kana.romaji}</p>

      {/* La ruta del sonido viaja en un atributo del DOM y no en una variable de
          JavaScript: cuando esto se clone, el clon será un nodo suelto fuera del
          árbol de React, y lo único que se lleva consigo son sus atributos. Es
          lo que permite que quien cablea el clic sepa qué archivo suena sin
          tener que volver a buscar el kana.

          <button> de verdad, y no un div pulsable: page-flip deja pasar el
          `mousedown` sobre <button> y <a>, así que pulsar aquí NO pasa la hoja.
          Un div con onClick sí la pasaría. */}
      <BookButton className="kana-card__listen" data-audio={kana.audio}>
        Escuchar
      </BookButton>
    </div>
  )
}
