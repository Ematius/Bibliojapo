import type { Word } from '../../../content/types'
import { BookButton } from '../parts/BookButton'
import './WordPrompt.scss'

interface WordPromptProps {
  word: Word
  // Si además del sonido se enseña la representación de la palabra.
  //
  // El temario sube el listón quitándola: con ella, ver y oír van juntos, y basta
  // con una de las dos pistas para saber qué palabra es. Sin ella, el sonido se
  // queda solo — es el ejercicio auditivo puro, y es lo que separa reconocer una
  // palabra de reconocerla SOLO por cómo suena.
  showVisual?: boolean
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
export function WordPrompt({ word, showVisual = true }: WordPromptProps) {
  // El color manda sobre el dibujo: una palabra que ES un color se enseña con su
  // color, y añadirle además un dibujo sería decir lo mismo dos veces.
  const swatch = showVisual ? word.swatch : undefined
  const image = showVisual && !swatch ? word.image : undefined

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
    </div>
  )
}
