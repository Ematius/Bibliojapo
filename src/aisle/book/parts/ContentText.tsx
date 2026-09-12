import { Fragment } from 'react'
import { splitEmphasis } from '../../../content/emphasis'

interface ContentTextProps {
  text: string
}

// Un texto del temario, ya con lo marcado resaltado. Un texto con marcas puesto a pelo
// enseñaría los asteriscos; uno sin marcas sale tal cual, así que se puede usar siempre.
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
