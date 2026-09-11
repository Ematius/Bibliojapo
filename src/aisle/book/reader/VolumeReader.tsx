import { useEffect, useMemo, useRef } from 'react'
import { PageFlip } from 'page-flip'
import type { Word } from '../../../content/types'
import type { VolumeContent } from '../../../api/volumes'
import { readBookmark, writeBookmark } from '../../../shared/bookmark'
import { READER, buildVolumePages } from './readerConfig'
import { ContentText } from '../parts/ContentText'
import { WordCard } from '../recognition/WordCard'
import { WordGap } from '../recognition/WordGap'
import { WordReading } from '../recognition/WordReading'
import { WordPick } from '../recognition/WordPick'
import { mountWordAnswer } from '../recognition/wordAnswer'
import { mountWordChoice } from '../recognition/wordChoice'
import { KanaMatch } from '../matching/KanaMatch'
import { WordPrompt } from '../matching/WordPrompt'
import { mountKanaPairing } from '../matching/kanaPairing'
import { WordDrill } from '../drill/WordDrill'
import { ExamSheet } from '../exam/ExamSheet'
import { FinalNotice, FinalScope } from '../exam/FinalNotice'
import { mountExamSeal } from '../exam/examSeal'
import { VolumeIntro, VolumeGoal } from '../intro/VolumeIntro'
import { groupSentencesByTopic } from '../intro/goalGroups'
import { KanaStroke } from '../mnemonic/KanaStroke'
import { KanaCard } from '../presentation/KanaCard'
import { KanaTrace } from '../writing/KanaTrace'
import { mountKanaStroke } from '../mnemonic/kanaStrokeAnimation'
import { mountBookAudio } from '../parts/bookAudio'
import { mountKanaBoard } from '../writing/kanaBoard'
import './VolumeReader.scss'

interface VolumeReaderProps {
  // Todo lo que lleva este tomo: su bloque y lo que el bloque nombra.
  //
  // Es lo único que distingue un libro de otro: del bloque salen sus lecciones, y
  // de las lecciones todas sus páginas. Un segundo tomo es un segundo bloque en la
  // estantería, sin una línea más de lector.
  //
  // Llega hecho, pedido al servidor, y el lector no mira el temario por su
  // cuenta: es lo que permite que del tomo 2 en adelante el contenido no viaje
  // en el bundle. Ver `api/volumes.ts`.
  content: VolumeContent
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
export function VolumeReader({ content, pageWidth, pageHeight }: VolumeReaderProps) {
  const templateRef = useRef<HTMLDivElement>(null)
  const mountRef = useRef<HTMLDivElement>(null)

  // El bloque entero, para la portada y para saber de qué tomo es el marcador.
  const { block } = content
  const blockId = block.id

  // Lo que el paquete trae en listas, puesto en mapas para buscar por id. Son las
  // mismas búsquedas que antes se hacían contra el temario completo; ahora se
  // hacen solo contra lo que este tomo necesita.
  const { kanaById, wordsById, sentencesById } = useMemo(
    () => ({
      kanaById: new Map(content.kana.map((kana) => [kana.id, kana])),
      wordsById: new Map(content.words.map((word) => [word.id, word])),
      sentencesById: new Map(content.sentences.map((sentence) => [sentence.id, sentence])),
    }),
    [content],
  )

  // El repaso se sortea UNA vez por tomo abierto, no en cada render: sin
  // `useMemo` volvería a barajar en cualquier repintado ajeno —por ejemplo, el
  // libro reaccionando a otra cosa— y las páginas cambiarían debajo de quien
  // estuviera leyendo. Solo depende del paquete del tomo, que es el mismo objeto
  // mientras el tomo siga en la estantería: un libro nuevo es un componente nuevo,
  // así que un repaso nuevo ya llega solo con el montaje.
  const { pages: readerPages, pools } = useMemo(() => {
    // Solo entran en el libro las lecciones que se pueden dar ENTERAS. El bloque
    // nombra los seis kana del temario, pero el contenido se va escribiendo a
    // mano y no todo llega a la vez, así que el tomo crece según se cierra en vez
    // de exigir el bloque completo para poder abrirse.
    //
    // Se comprueban las tres cosas que las ocho planas necesitan, y no solo que
    // el kana y la palabra existan:
    //
    //   · la ficha del kana, o no hay ni mnemotecnia ni trazos;
    //   · el audio de la palabra, porque tres planas son de escuchar;
    //   · su representación —color o dibujo—, porque el enunciado del ejercicio 7
    //     es justamente eso y sin ella la hoja sale vacía.
    //
    // Con menos de eso la lección se queda fuera entera. Media lección son planas
    // en blanco, que es peor que una lección de menos: quien lee no distingue una
    // página vacía de una rota.

    // Lo que hace falta para poder ENSEÑAR una palabra en una hoja de enunciado:
    // cómo suena y cómo se representa. Sin las dos, la plana sale muda o vacía.
    const usable = (word?: Word) => Boolean(word?.audio && (word.swatch || word.image))

    const lessons = block.lessons.flatMap((lesson) => {
      const word = lesson.wordId ? wordsById.get(lesson.wordId) : undefined
      const ready = usable(word) && kanaById.has(lesson.kanaId)
      if (!ready || !word) return []

      // La segunda palabra no condiciona a la lección: si no está lista, las dos
      // últimas planas repiten la primera y la lección entra igual. Es media
      // mejora, no media lección.
      const word2 = lesson.wordId2 ? wordsById.get(lesson.wordId2) : undefined

      return [
        {
          kanaId: lesson.kanaId,
          wordId: word.id,
          wordId2: usable(word2) ? word2?.id : undefined,
        },
      ]
    })

    // De dónde salen los distractores de cada lección: los kana de esa lección y
    // los de todas las anteriores, nunca uno que aún no se haya dado. Descartar
    // una tarjeta tiene que ser reconocerla, y no se reconoce lo que no se ha
    // visto.
    //
    // Como el tomo va en orden, la dificultad sube sola: en la primera lección no
    // hay nada anterior y las tarjetas son solo las de la palabra; en la última se
    // elige entre todo el bloque. `pickCards` corta en seis.
    const pools = new Map<string, string[]>()
    lessons.forEach((lesson, index) => {
      pools.set(
        lesson.kanaId,
        lessons
          .slice(0, index + 1)
          .flatMap((seen) => kanaById.get(seen.kanaId)?.character ?? []),
      )
    })

    return { pages: buildVolumePages(lessons), pools }
    // Depende del paquete y de nada más: mientras sea el mismo tomo, el repaso
    // no se vuelve a sortear.
  }, [block, kanaById, wordsById])

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

    // El libro abre por donde se quedó, y por la página 1 la primera vez. Desde
    // ahí se avanza arrastrando la hoja.
    //
    // El índice se calcula a mano y no se da por supuesto: con las páginas
    // invertidas, la primera de lectura es la ÚLTIMA del DOM. De ahí sale la
    // conversión, que vale en los dos sentidos — folio 1 da el último índice,
    // que es la plana con la 1 a la derecha y la 2 a su izquierda, como en
    // cualquier tomo japonés.
    const indexOfFolio = (folio: number) => pages.length - folio
    const folioOfIndex = (index: number) => pages.length - index

    // Siempre la hoja DERECHA de la plana, que es la que se lee primero. Los
    // folios impares son los de la derecha, porque la plana 1 empieza en la 1.
    const rightOfSpread = (folio: number) => (folio % 2 === 1 ? folio : folio - 1)

    const saved = readBookmark(blockId)
    const startFolio = saved && saved <= pages.length ? rightOfSpread(saved) : 1

    flip.turnToPage(indexOfFolio(startFolio))

    // Y a partir de aquí se va apuntando. Se engancha DESPUÉS de colocar el
    // libro a propósito: así lo primero que se guarda es una página que se ha
    // pasado de verdad, no el salto con el que se acaba de abrir.
    //
    // El evento trae el índice del DOM; al disco va el folio. Ver `bookmark.ts`.
    flip.on('flip', (event) => {
      const index = Number(event.data)
      if (!Number.isInteger(index)) return

      writeBookmark(blockId, rightOfSpread(folioOfIndex(index)))
    })

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
    // Y las opciones de kana. Estas no necesitan callar nada: son <button>, y el
    // libro ya deja pasar la pulsación sobre ellos. Ver `wordChoice.ts`.
    const unmountPick = mountWordChoice(holder)
    // Y las tarjetas que se arrastran. Estas SÍ callan el gesto del libro: mover
    // una tarjeta y pasar la hoja son el mismo movimiento. Ver `kanaPairing.ts`.
    const unmountPairing = mountKanaPairing(holder)
    // Y el sello del examen, que escucha a todos los anteriores: es el primero que
    // se entera de que un ejercicio se ha resuelto. Ver `parts/solved.ts`.
    const unmountSeal = mountExamSeal(holder, blockId)

    return () => {
      // Primero lo del kana: si se deja vivo, quedan una timeline y un manejador
      // de clic colgando de nodos que `destroy()` está a punto de llevarse.
      unmountStroke?.()
      unmountAudio?.()
      unmountBoard?.()
      unmountAnswer?.()
      unmountPick?.()
      unmountPairing?.()
      unmountSeal?.()
      flip.destroy()
      mount.replaceChildren()
    }
    // `blockId` entra porque de él sale el marcador: cambiar de tomo tiene que
    // volver a montar el libro, no seguir apuntando en el del anterior.
  }, [pageWidth, pageHeight, blockId])

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
        {[...readerPages].reverse().map((page) => (
          <div
            className="volume-reader__page"
            key={page.id}
            data-density="soft"
            // Marca las hojas del examen con el kana del que son. Es lo que le
            // permite al sello contar sus pruebas sin que nadie escriba cuántas
            // hay. Ver `examSeal.ts`.
            data-exam={page.exam}
          >
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
                  // La portada no habla de ningún kana ni de ninguna palabra,
                  // sino del bloque entero, así que se resuelve la primera y por
                  // su cuenta.
                  if (page.shows === 'intro') {
                    return (
                      <VolumeIntro
                        block={block}
                        characters={block.lessons.flatMap(
                          (lesson) => kanaById.get(lesson.kanaId)?.character ?? [],
                        )}
                        progress={content.progress}
                      />
                    )
                  }

                  if (page.shows === 'goal') {
                    return (
                      <VolumeGoal
                        groups={groupSentencesByTopic(
                          block.sentenceIds.flatMap((id) => sentencesById.get(id) ?? []),
                          (id) => wordsById.get(id),
                        )}
                      />
                    )
                  }

                  // Las dos hojas que anuncian el examen final. Como la portada,
                  // hablan del tomo entero y no de un kana, así que se resuelven
                  // antes de exigir ninguno.
                  if (page.shows === 'finalNotice' || page.shows === 'finalScope') {
                    const characters = block.lessons.flatMap(
                      (lesson) => kanaById.get(lesson.kanaId)?.character ?? [],
                    )

                    return page.shows === 'finalNotice' ? (
                      <FinalNotice characters={characters} />
                    ) : (
                      <FinalScope characters={characters} />
                    )
                  }

                  const word = page.wordId ? wordsById.get(page.wordId) : undefined

                  // Las dos caras del enunciado sin palabras van SOLO de la
                  // palabra: no estudian ningún kana en concreto, así que se
                  // resuelven antes de exigir uno. Son las únicas hojas del tomo
                  // que no llevan kana.
                  if (page.shows === 'prompt') {
                    return word ? <WordPrompt word={word} /> : null
                  }

                  if (page.shows === 'promptAudio') {
                    return word ? <WordPrompt word={word} showVisual={false} /> : null
                  }

                  const kana = page.kanaId
                    ? kanaById.get(page.kanaId)
                    : undefined
                  if (!kana) return null

                  // Lo estudiado hasta esta lección, para las hojas que reparten
                  // tarjetas. Vacío si la lección no está en el mapa: entonces las
                  // tarjetas son solo las de la palabra, que es lo que había antes
                  // de que hubiera bloque del que tirar.
                  const pool = pools.get(kana.id) ?? []

                  if (page.shows === 'illustration') {
                    return <KanaStroke kana={kana} />
                  }

                  if (page.shows === 'card') {
                    return <KanaCard kana={kana} />
                  }

                  if (page.shows === 'trace') {
                    return <KanaTrace kana={kana} />
                  }

                  if (page.shows === 'word') {
                    return word ? <WordCard word={word} kana={kana} /> : null
                  }

                  if (page.shows === 'gap') {
                    return word ? <WordGap word={word} kana={kana} /> : null
                  }

                  if (page.shows === 'reading') {
                    return word ? <WordReading word={word} kana={kana} /> : null
                  }

                  if (page.shows === 'pick') {
                    return word ? <WordPick word={word} kana={kana} pool={pool} /> : null
                  }

                  if (page.shows === 'match') {
                    return word ? (
                      <KanaMatch word={word} kana={kana} scope="kana" pool={pool} />
                    ) : null
                  }

                  if (page.shows === 'matchWord') {
                    return word ? (
                      <KanaMatch word={word} kana={kana} scope="word" pool={pool} />
                    ) : null
                  }

                  if (page.shows === 'build') {
                    return word ? (
                      <KanaMatch word={word} kana={kana} scope="build" pool={pool} />
                    ) : null
                  }

                  if (page.shows === 'drill') {
                    return word ? (
                      <WordDrill word={word} kana={kana} pool={pool} />
                    ) : null
                  }

                  // Las dos hojas del examen. La derecha es una prueba suelta que
                  // ya existe —el sonido del kana contra su forma—; la izquierda
                  // junta las otras dos y es donde cae el sello.
                  if (page.shows === 'examKana') {
                    return word ? (
                      <KanaMatch word={word} kana={kana} scope="kana" pool={pool} />
                    ) : null
                  }

                  if (page.shows === 'examWord') {
                    return word ? (
                      <ExamSheet word={word} kana={kana} pool={pool} seal={page.seal} />
                    ) : null
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
