import type { Kana } from '../../../content/types'
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
//
// ── Dónde cae el kana ──────────────────────────────────────────────────────
// Centrado sobre el DIBUJO y del mismo tamaño relativo en todas las hojas. No hay
// un encaje por kana: la regla es una, y lo que se ajusta es la ilustración, que
// se dibuja con su motivo en el centro. Ver `KanaStroke.scss`.
export function KanaStroke({ kana }: KanaStrokeProps) {
  const clipId = `kana-silhouette-${kana.id}`

  return (
    <div className="kana-stroke">
      {/* El hueco que queda después del botón. El dibujo se encaja dentro sin
          deformarse, y casi nunca lo llena: sobra por los lados o por arriba y
          abajo, según su proporción. */}
      <div className="kana-stroke__figure">
        {/* La caja del DIBUJO, ceñida a él. Es a esta caja, y no al hueco, a la
            que se refiere el kana: si no, en una hoja más ancha que el dibujo el
            kana se medía contra papel vacío y salía más grande que la escena. */}
        <div className="kana-stroke__frame">
          <img
            className="kana-stroke__image"
            src={kana.image}
            alt={kana.imageAlt}
          />

          {/* El kana conserva su proporción: se planta en el centro de la caja
              sin estirarse. Un あ deformado deja de ser un あ bien escrito, y esto
              es material de estudio. */}
          <svg
            className="kana-stroke__glyph"
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
      </div>

      {/* Sin `onClick`: este botón acaba clonado por page-flip, y un clon está
          fuera del árbol de React, así que un manejador de React nunca llegaría
          a enterarse de la pulsación. El clic se cablea a mano sobre el nodo
          clonado, en el mismo sitio que la animación que dispara. */}
      <BookButton className="kana-stroke__play">Animar</BookButton>
    </div>
  )
}
