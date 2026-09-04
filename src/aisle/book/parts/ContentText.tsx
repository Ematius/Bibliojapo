import { Fragment } from 'react'
import { splitEmphasis } from '../../../content/emphasis'

interface ContentTextProps {
  text: string
}

// Un texto del temario, ya con lo marcado resaltado.
//
// Existe para no repetir el mismo recorrido en cada sitio donde se pinta texto
// del temario, y para que ninguno se olvide de hacerlo: un texto con marcas
// puesto a pelo enseñaría los asteriscos.
//
// Un texto sin marcas sale tal cual, así que se puede usar en todas partes sin
// preguntarse antes si tiene o no.
export function ContentText({ text }: ContentTextProps) {
  return (
    <>
      {splitEmphasis(text).map((part, index) =>
        part.emphasized ? (
          <strong className="content-text__mark" key={index}>
            {part.text}
          </strong>
        ) : (
          <Fragment key={index}>{part.text}</Fragment>
        ),
      )}
    </>
  )
}
