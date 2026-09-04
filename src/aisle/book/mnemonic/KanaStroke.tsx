import type { Kana } from '../../../content/types'
import type { StyleWithVars } from '../../../shared/styleWithVars'
import { BookButton } from '../parts/BookButton'
import './KanaStroke.scss'

interface KanaStrokeProps {
  kana: Kana
}

// La capa mnemotécnica: la ilustración con el kana dibujándose encima.
//
// Aquí SOLO está el markup. La animación no vive en este componente, y no es un
// descuido: page-flip clona los nodos de la plantilla para meterlos en su propia
// estructura, así que un `ref` de React apuntaría a la copia oculta y GSAP
// acabaría animando algo que nadie ve. La timeline se engancha a los nodos ya
// clonados desde VolumeReader — ver `kanaStrokeAnimation.ts`.
//
// Los trazos salen aquí desnudos: sin medidas ni líneas discontinuas. De cuánto
// mide cada camino y de irlo descubriendo se encarga DrawSVGPlugin, que se lo
// pregunta al navegador — ver `kanaStrokeAnimation.ts`.
export function KanaStroke({ kana }: KanaStrokeProps) {
  // El encaje del kana sobre el dibujo llega como variables: los números son
  // contenido —cambian con cada ilustración— y el CSS solo los coloca.
  const clipId = `kana-silhouette-${kana.id}`

  const fit: StyleWithVars = {
    '--fit-top': `${kana.strokeFit.top}%`,
    '--fit-right': `${kana.strokeFit.right}%`,
    '--fit-bottom': `${kana.strokeFit.bottom}%`,
    '--fit-left': `${kana.strokeFit.left}%`,
  }

  return (
    <div className="kana-stroke">
      {/* La ilustración y el kana comparten caja, y esa caja se queda con todo
          el alto que sobre después del botón. */}
      <div className="kana-stroke__figure">
        <img
          className="kana-stroke__image"
          src={kana.image}
          alt={kana.imageAlt}
        />

        {/* El kana conserva su proporción: se planta dentro del hueco que le da
            `strokeFit` sin estirarse. Un あ deformado deja de ser un あ bien
            escrito, y esto es material de estudio. */}
        <svg
          className="kana-stroke__glyph"
          style={fit}
          viewBox={kana.strokeViewBox}
          preserveAspectRatio="xMidYMid meet"
          // El kana ya está escrito al lado, en el texto de la página: para un
          // lector de pantalla esto es decoración repetida.
          aria-hidden="true"
        >
          <defs>
            {/* La silueta del kana, que nunca se pinta: solo recorta.
                El id lleva el del kana porque page-flip clona estas páginas, y
                dos siluetas distintas con el mismo nombre se pisarían. */}
            <clipPath id={clipId}>
              <path d={kana.outline} />
            </clipPath>
          </defs>

          {/* Cada trazo es una brocha muy gorda recortada por la silueta: se ve
              solo lo que cae dentro de la forma de la letra, y así el trazo sale
              con su grosor real en cada punto en vez de como un tubo. */}
          <g clipPath={`url(#${clipId})`}>
            {kana.strokes.map((d, index) => (
              <path
                className="kana-stroke__path"
                key={`${kana.id}-${index}`}
                d={d}
              />
            ))}
          </g>
        </svg>
      </div>

      {/* Sin `onClick`: este botón acaba clonado por page-flip, y un clon está
          fuera del árbol de React, así que un manejador de React nunca llegaría
          a enterarse de la pulsación. El clic se cablea a mano sobre el nodo
          clonado, en el mismo sitio que la animación que dispara. */}
      <BookButton className="kana-stroke__play">Animar</BookButton>
    </div>
  )
}
