import { useEffect, useRef } from 'react'
import { PageFlip } from 'page-flip'
import { READER, READER_PAGES } from './readerConfig'
import { HIRAGANA_BY_ID } from '../../../content/hiragana/kana'
import { VOCABULARY_BY_ID } from '../../../content/hiragana/vocabulary'
import { ContentText } from '../parts/ContentText'
import { WordCard } from '../recognition/WordCard'
import { WordGap } from '../recognition/WordGap'
import { mountWordAnswer } from '../recognition/wordAnswer'
import { KanaStroke } from '../mnemonic/KanaStroke'
import { KanaCard } from '../presentation/KanaCard'
import { KanaTrace } from '../writing/KanaTrace'
import { mountKanaStroke } from '../mnemonic/kanaStrokeAnimation'
import { mountBookAudio } from '../parts/bookAudio'
import { mountKanaBoard } from '../writing/kanaBoard'
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
// Ese orden invertido es también lo que hace que el gesto salga natural: la hoja
// que se agarra es la de la IZQUIERDA y se arrastra hacia la derecha, que para la
// librería es ir hacia atrás y para el lector es avanzar. El mismo gesto que se
// hace con un tomo japonés de papel.
//
// Si algún día se añade un botón de «siguiente», tiene que llamar a `flipPrev()`.
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
      // La hoja se pasa de dos maneras, y las dos valen desde cualquier punto:
      // arrastrándola, con la física de la propia librería —sigue al puntero y
      // cae sola al soltar—, o pulsando sobre ella sin más.
      //
      // `disableFlipByClick` se queda APAGADO a propósito. Encendido no apaga el
      // arrastre, solo el clic, y únicamente el que cae fuera de las esquinas:
      // el resultado es una hoja que responde a los bordes y se queda muerta por
      // el medio, que es justo donde se pulsa por instinto.
      //
      // Lo que protege al contenido no es esa opción, es `clickEventForward`: la
      // librería ignora el `mousedown` que cae sobre un <button> o un <a>, así
      // que el botón de animar el trazo —y cualquier control que venga después—
      // recibe su pulsación sin llevarse la hoja por delante. Un control nuevo
      // que NO sea uno de esos dos elementos sí pasaría página al pulsarlo.
      disableFlipByClick: false,
      useMouseEvents: true,
      // La librería levanta un pico de la esquina al pasar por encima. Es la
      // única señal de que la hoja se puede coger, así que va explícito: es
      // parte del gesto, no un adorno que se pueda apagar sin consecuencias.
      showPageCorners: true,
      // Sin scroll que respetar: el libro ocupa la pantalla entera. Activarlo
      // haría que un arrastre vertical moviera la página en vez de pasar hoja.
      mobileScrollSupport: false,
    })

    flip.loadFromHTML(pages)

    // El libro ABRE por la página 1, que es la primera plana de lectura. Desde
    // ahí se avanza arrastrando la hoja.
    //
    // El índice se comprueba a mano y no se da por supuesto: con las páginas
    // invertidas, la primera de lectura es la ÚLTIMA del DOM. Queda a la
    // derecha, emparejada con la 2 a su izquierda, que es la primera plana de
    // un tomo japonés.
    flip.turnToPage(pages.length - 1)

    // El trazado del kana se engancha AQUÍ y no dentro de KanaStroke: hasta esta
    // línea los únicos nodos que existen en pantalla son los clones que se acaban
    // de entregar a la librería, y tanto la animación como el clic del botón
    // tienen que ir sobre ellos. Ver `kanaStrokeAnimation.ts`.
    const unmountStroke = mountKanaStroke(holder)
    // El sonido, por el mismo motivo y en el mismo sitio: los botones de escuchar
    // que hay en las hojas son clones, y un `onClick` de React no llegaría nunca
    // a enterarse de la pulsación. Atiende a todos los que lleven sonido, sean del
    // kana o de una palabra. Ver `bookAudio.ts`.
    const unmountAudio = mountBookAudio(holder)
    // Y la pizarra, que además de cablearse tiene que CALLAR el gesto del libro:
    // dibujar y pasar hoja se hacen con el mismo movimiento. Ver `kanaBoard.ts`.
    const unmountBoard = mountKanaBoard(holder)
    // Y el hueco de romaji. Sin esto el campo no se podría ni enfocar: el libro
    // anula la pulsación antes de que llegue. Ver `wordAnswer.ts`.
    const unmountAnswer = mountWordAnswer(holder)

    return () => {
      // Primero lo del kana: si se deja vivo, quedan una timeline y un manejador
      // de clic colgando de nodos que `destroy()` está a punto de llevarse.
      unmountStroke?.()
      unmountAudio?.()
      unmountBoard?.()
      unmountAnswer?.()
      flip.destroy()
      mount.replaceChildren()
    }
  }, [pageWidth, pageHeight])

  return (
    <div className="volume-reader">
      {/* Plantilla: React la gobierna y page-flip no la toca. Invertida respecto
          al orden de lectura, que es lo que hace que `flipPrev` avance.

          No lleva `hidden`, y no es un olvido: dentro de cada hoja hay una
          silueta que se llama por su nombre para recortar el trazo del kana, y
          `hidden` es `display: none`, que deja esa definición sin construir. La
          copia acababa pidiendo un recorte que no existía y el trazo salía sin
          recortar. Se esconde por CSS, sin apagarla. */}
      <div className="volume-reader__template" ref={templateRef}>
        {[...READER_PAGES].reverse().map((page) => (
          <div className="volume-reader__page" key={page.id} data-density="soft">
            <div className="volume-reader__paper">
              {/* La caja de contenido: se queda con todo el alto que sobra
                  después del folio, y es lo que impide que la ilustración o el
                  texto se salgan de la hoja. */}
              <div className="volume-reader__content">
                { page.title && (
                  <h2 className="volume-reader__title">{page.title}</h2>
                )}

                {(() => {
                  // El contenido de la hoja sale del temario, no de aquí: la
                  // página solo dice qué kana y cuál de sus dos caras.
                  const kana = page.kanaId
                    ? HIRAGANA_BY_ID.get(page.kanaId)
                    : undefined
                  if (!kana) return null

                  if (page.shows === 'illustration') {
                    return <KanaStroke kana={kana} />
                  }

                  if (page.shows === 'card') {
                    return <KanaCard kana={kana} />
                  }

                  if (page.shows === 'trace') {
                    return <KanaTrace kana={kana} />
                  }

                  // Las hojas de palabra necesitan las dos cosas: la palabra y el
                  // kana que hay que encontrar dentro. Si falta la palabra la hoja
                  // se queda vacía en vez de enseñar media cosa.
                  const word = page.wordId ? VOCABULARY_BY_ID.get(page.wordId) : undefined

                  if (page.shows === 'word') {
                    return word ? <WordCard word={word} kana={kana} /> : null
                  }

                  if (page.shows === 'gap') {
                    return word ? <WordGap word={word} kana={kana} /> : null
                  }

                  // La hoja de texto lleva dos partes: la historia que fija el
                  // kana en la memoria y, debajo, el recorrido para escribirlo.
                  //
                  // El encabezado y su lista van juntos en una sección, para que
                  // el aire entre los dos bloques sea mayor que el que hay entre
                  // el encabezado y lo que titula.
                  return (
                    <>
                      <p className="volume-reader__body">
                        <ContentText text={kana.mnemonic} />
                      </p>

                      <section className="volume-reader__section">
                        <h3 className="volume-reader__subtitle">
                          Orden de trazos
                        </h3>

                        {/* Lista numerada de verdad: los pasos van en orden y el
                            número lo pone la propia lista, no el contenido. */}
                        <ol className="volume-reader__steps">
                          {kana.strokeOrder.map((step, index) => (
                            <li key={`${kana.id}-step-${index}`}>
                              <ContentText text={step} />
                            </li>
                          ))}
                        </ol>
                      </section>
                    </>
                  )
                })()}
              </div>

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
