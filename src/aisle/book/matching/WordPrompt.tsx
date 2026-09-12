import type { Word } from '../../../content/types'
import { BookButton } from '../parts/BookButton'
import './WordPrompt.scss'

interface WordPromptProps {
  word: Word
}

// El enunciado de la hoja de al lado: la palabra sin escribirla, sin traducirla y
// sin su lectura. Solo lo que significa —un círculo azul, si lo lleva— y cómo
// suena.
//
// ── Por qué no hay ni una letra ────────────────────────────────────────────
// Es la primera vez que la palabra se pide entera. Con «azul» escrito se
// resolvería recordando una traducción, y con `aoi` directamente leyendo. Un color
// y un sonido no se pueden leer: hay que haber aprendido あおい.
//
// ── De dónde sale lo que se ve ─────────────────────────────────────────────
// El temario tiene 228 palabras y siete ejercicios que las usan. Ilustrar cada
// palabra para cada ejercicio no se acaba nunca, así que lo que se ilustra es la
// PALABRA, una vez: todos los ejercicios piden lo mismo, su representación. Para
// un color esa representación es el color; para いえ o はは es un dibujo. Las dos
// las dice la palabra, no esta hoja. Ver `swatch` e `image` en
// `content/types.ts`.
export function WordPrompt({ word }: WordPromptProps) {
  // El color manda sobre el dibujo: una palabra que ES un color se enseña con su
  // color, y añadirle además un dibujo sería decir lo mismo dos veces.
  const swatch = word.swatch
  const image = !swatch ? word.image : undefined

  return (
    <div className="word-prompt">
      {swatch ? (
        // El color va en el atributo y no en la hoja de estilos porque es
        // contenido: lo dice la palabra, no el diseño de la página.
        //
        // `role="img"` con su etiqueta para quien no ve el color. Decir «azul» ahí
        // no destripa nada: la respuesta que se pide es あおい, no la traducción.
        <span
          className="word-prompt__swatch"
          style={{ background: swatch }}
          role="img"
          aria-label={word.meaning}
        />
      ) : null}

      {/* El dibujo, para el vocabulario que no es un color. La etiqueta la pone el
          contenido: dice lo que se VE, no cómo se escribe la palabra. */}
      {image ? (
        <img className="word-prompt__image" src={image} alt={word.imageAlt ?? word.meaning} />
      ) : null}

      {/* La otra mitad del enunciado. Sin esto la hoja solo dice un color, y la
          palabra que hay que escribir habría que adivinarla. */}
      {word.audio ? (
        <BookButton className="word-prompt__listen" data-audio={word.audio}>
          Escuchar
        </BookButton>
      ) : null}

      {/* QUÉ palabra va a sonar, dicho en español.

          Sin esto, dos palabras que se parecen al oído son la misma para quien
          empieza: あお y あう se distinguen por la última vocal, y quien lleva
          seis kana aprendidos no oye esa diferencia todavía. El dibujo debería
          resolverlo, pero «encontrarse» no se dibuja tan claro como una casa, y
          entonces la hoja no se puede contestar — no por no saber la palabra,
          sino por no saber cuál se está pidiendo.

          Y no destripa nada, por lo mismo que ya asumía el `aria-label` del
          color: lo que se pide escribir es あおい, no la traducción. Esto se
          limita a hacer visible lo que un lector de pantalla ya decía. */}
      <p className="word-prompt__meaning">cómo se dice «{word.meaning}»</p>
    </div>
  )
}
