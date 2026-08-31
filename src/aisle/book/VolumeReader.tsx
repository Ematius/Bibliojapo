import { useEffect, useRef } from 'react'
import { PageFlip } from 'page-flip'
import { READER, READER_PAGES } from './readerConfig'
import './VolumeReader.scss'

interface VolumeReaderProps {
  // Medidas de UNA página, en píxeles. Salen del hueco de papel del libro
  // pintado, así que las hojas que se pasan caen justo sobre las dibujadas.
  pageWidth: number
  pageHeight: number
}

// El tomo abierto, con el paso de página de page-flip.
//
// ── Por qué las páginas van invertidas ─────────────────────────────────────
// Un libro japonés se lee de derecha a izquierda: el lomo queda a la derecha y
// se avanza hacia la izquierda. page-flip no tiene modo para eso.
//
// La solución NO es voltear el contenedor con scaleX(-1): eso invierte también
// el texto y las ilustraciones de cada página, y no hay forma de recuperarlas.
// Lo que sí funciona es montar las páginas al revés en el DOM y avanzar con
// `flipPrev()` en lugar de `flipNext()`: la librería pasa hojas hacia atrás, que
// vistas en ese orden invertido es exactamente avanzar en la lectura.
//
// De momento el libro no pasa páginas solo: abre por la 1 y se queda ahí. Pero
// cuando se conecte el paso de hoja —con un gesto o con un botón— tiene que ser
// `flipPrev()`, o el tomo se leerá al revés.
//
// `showCover` va desactivado porque aquí no hay ninguna tapa que la librería
// deba tratar aparte: las tapas son del libro pintado que hay debajo, y esto
// son solo hojas. Activarlo además descuadraría el índice, que con las páginas
// invertidas ya no coincide con el orden de lectura.
//
// ── Por qué las páginas se clonan ──────────────────────────────────────────
// page-flip se apropia de los nodos que le pasas: los saca de su sitio, los
// mete en su propia estructura y `destroy()` se los lleva por delante. En
// StrictMode React monta, desmonta y vuelve a montar cada efecto, así que el
// segundo montaje se encontraba el contenedor vacío y el libro salía en blanco.
//
// Por eso las páginas viven en una plantilla que React sí gobierna, y al
// contenedor de la librería se le entregan copias: cada montaje parte de un
// juego nuevo y el desmontaje puede arrasar con lo suyo sin tocar el original.
export function VolumeReader({ pageWidth, pageHeight }: VolumeReaderProps) {
  const templateRef = useRef<HTMLDivElement>(null)
  const mountRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const template = templateRef.current
    const mount = mountRef.current
    if (!template || !mount || pageWidth <= 0) return

    // El contenedor que se le entrega a la librería se crea aquí y se tira al
    // acabar: `destroy()` se lleva por delante el propio elemento sobre el que
    // se montó, así que reutilizar uno de React dejaba el segundo montaje
    // trabajando sobre un nodo ya desconectado del documento.
    const holder = document.createElement('div')
    holder.className = 'volume-reader__book'
    mount.appendChild(holder)

    const pages = [...template.querySelectorAll('.volume-reader__page')].map(
      (node) => node.cloneNode(true) as HTMLElement,
    )
    pages.forEach((node) => holder.appendChild(node))

    const flip = new PageFlip(holder, {
      width: pageWidth,
      height: pageHeight,
      size: 'fixed',
      showCover: false,
      usePortrait: false,
      // La librería dimensiona su propio bloque a partir de width/height. Con
      // esto desactivado deja el envoltorio a cero de alto y el libro no llega a
      // verse, aunque su estructura sí esté construida.
      autoSize: true,
      flippingTime: READER.flippingTimeMs,
      maxShadowOpacity: READER.maxShadowOpacity,
      // El paso lo dispara el propio libro, no un clic suelto sobre la hoja: el
      // gesto sigue siendo el mismo con el que se ha llegado hasta aquí.
      disableFlipByClick: true,
      useMouseEvents: false,
      mobileScrollSupport: false,
    })

    flip.loadFromHTML(pages)

    // El libro abre por la PÁGINA 1 y se queda ahí: es la primera plana de
    // lectura, y es donde va a entrar el contenido de estudio.
    //
    // El índice se comprueba a mano y no se da por supuesto: con las páginas
    // invertidas, la primera de lectura es la ÚLTIMA del DOM. Queda a la
    // derecha, emparejada con la 2 a su izquierda, que es la primera plana de
    // un tomo japonés.
    flip.turnToPage(pages.length - 1)

    return () => {
      flip.destroy()
      mount.replaceChildren()
    }
  }, [pageWidth, pageHeight])

  return (
    <div className="volume-reader">
      {/* Plantilla: React la gobierna y page-flip no la toca. Invertida respecto
          al orden de lectura, que es lo que hace que `flipPrev` avance. */}
      <div className="volume-reader__template" ref={templateRef} hidden>
        {[...READER_PAGES].reverse().map((page) => (
          <div className="volume-reader__page" key={page.id} data-density="soft">
            <div className="volume-reader__paper">
              <span className="volume-reader__folio">
                {page.folio}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Punto de anclaje. El contenedor real del libro se crea dentro del
          efecto y cuelga de aquí, porque la librería lo destruye al desmontar. */}
      <div className="volume-reader__mount" ref={mountRef} />
    </div>
  )
}
