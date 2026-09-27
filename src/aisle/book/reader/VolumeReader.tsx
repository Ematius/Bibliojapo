import { useEffect, useMemo, useRef, useState } from 'react'
import { PageFlip } from 'page-flip'
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
import { FinalNotice, FinalScope, FinalReviewNotice, FinalReviewScope } from '../exam/FinalNotice'
import { mountExamSeal } from '../exam/examSeal'
import { ExamRules, ExamScope } from '../exam/ExamRules'
import { SentenceBuild } from '../exam/SentenceBuild'
import { ExamResults } from '../exam/ExamResults'
import { ExamReveal } from '../exam/ExamReveal'
import { ExamGift } from '../exam/ExamGift'
import { mountSentenceTiles } from '../exam/sentenceTiles'
import { mountFinalExam } from '../exam/finalExam'
import { mountGiftOpening } from '../exam/giftOpening'
import { GrammarRule, GrammarExample } from '../grammar/GrammarRule'
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
  // Todo lo que lleva este tomo. Llega hecho, pedido al servidor: el lector no mira el
  // temario por su cuenta, que es lo que permite que del tomo 2 en adelante el contenido
  // no viaje en el bundle.
  content: VolumeContent
  // Medidas de UNA página, en píxeles. Salen del hueco de papel del libro pintado, así que
  // las hojas que se pasan caen justo sobre las dibujadas.
  pageWidth: number
  pageHeight: number
}

// El tomo abierto, con el paso de página de page-flip.
//
// LAS PÁGINAS VAN INVERTIDAS EN EL DOM. Un libro japonés se lee de derecha a izquierda y
// page-flip no tiene modo para eso. Voltear el contenedor con `scaleX(-1)` invierte también
// el texto y las ilustraciones; lo que funciona es montarlas al revés y avanzar con
// `flipPrev()`. Un botón de «siguiente», si algún día lo hay, tiene que llamar a `flipPrev()`.
//
// `showCover` va desactivado: las tapas son del libro pintado que hay debajo, y activarlo
// además descuadraría el índice, que con las páginas invertidas ya no coincide con el orden
// de lectura.
//
// LAS PÁGINAS SE CLONAN. page-flip se apropia de los nodos que le pasas y `destroy()` se
// los lleva por delante; en StrictMode el segundo montaje se encontraba el contenedor vacío
// y el libro salía en blanco. Así que viven en una plantilla que React gobierna y a la
// librería se le entregan copias.
export function VolumeReader({ content, pageWidth, pageHeight }: VolumeReaderProps) {
  const templateRef = useRef<HTMLDivElement>(null)
  const mountRef = useRef<HTMLDivElement>(null)
  const flipRef = useRef<PageFlip | null>(null)
  // Lo pone el examen final cuando hay uno: mientras dura, las flechas no pasan hoja.
  const turnBlockedRef = useRef<() => boolean>(() => false)

  const { block } = content
  const blockId = block.id

  // Sube en cada reintento del examen final —`finalExam.ts`— y fuerza a rebarajar el
  // orden del bloque 3 y a remontar el libro entero con sus planas en blanco. Ver el
  // `useMemo` de abajo y el efecto de montaje.
  const [examAttempt, setExamAttempt] = useState(0)

  // Lo que el paquete trae en listas, puesto en mapas para buscar por id.
  const { kanaById, wordsById, sentencesById, grammarById } = useMemo(
    () => ({
      kanaById: new Map(content.kana.map((kana) => [kana.id, kana])),
      wordsById: new Map(content.words.map((word) => [word.id, word])),
      sentencesById: new Map(content.sentences.map((sentence) => [sentence.id, sentence])),
      grammarById: new Map(content.grammar.map((rule) => [rule.id, rule])),
    }),
    [content],
  )

  // El repaso se sortea UNA vez por tomo abierto: sin `useMemo` volvería a barajar en
  // cualquier repintado ajeno y las páginas cambiarían debajo de quien esté leyendo.
  const { pages: readerPages, pools, reviewWordIds } = useMemo(() => {
    // Entra toda lección con palabras, esté su ficha entera o no: lo que falte sale como
    // hoja en blanco, a propósito, para verlo al recorrer el tomo y no al llegar al examen.
    // Si esto vuelve a filtrar por completitud, el repaso final —que sale de aquí— filtra
    // igual, y un fallo deja de verse en su lección para desaparecer sin más.
    const lessons = block.lessons.flatMap((lesson) =>
      lesson.wordIds?.length ? [{ kanaId: lesson.kanaId, wordIds: lesson.wordIds }] : [],
    )

    // Los distractores de cada lección: los kana de esa lección y los de las anteriores,
    // nunca uno que aún no se haya dado —descartar una tarjeta tiene que ser reconocerla—.
    // Como el tomo va en orden, la dificultad sube sola. `pickCards` corta en seis.
    const pools = new Map<string, string[]>()
    lessons.forEach((lesson, index) => {
      pools.set(
        lesson.kanaId,
        lessons
          .slice(0, index + 1)
          .flatMap((seen) => kanaById.get(seen.kanaId)?.character ?? []),
      )
    })

    // Las palabras del repaso final son las de las lecciones, nunca las de `block.wordIds`:
    // esa lista es lo que el bloque desbloquea, no lo que se enseña, y examinar de lo que
    // no se ha dado es lo que este repaso llegó a hacer. Ver `finalReviewSpreads`.
    const reviewWordIds = [...new Set(lessons.flatMap((lesson) => lesson.wordIds))]

    // Las frases del examen final: solo las que ya tienen su ficha Y su desglose kana a
    // kana —sin `units` no hay huecos que rellenar ni tarjetas que colocar, y la hoja
    // saldría en blanco—. Sin las 15 no hay examen — ver `finalSentenceExamSpreads`.
    const examSentenceIds = block.sentenceIds.filter((sentenceId) => {
      const sentence = sentencesById.get(sentenceId)
      return sentence !== undefined && sentence.units.length > 0
    })

    // Las reglas de ortografía que el tomo ya puede enseñar. Se cae fuera por lo mismo que
    // una lección a medias: sin explicación escrita la plana saldría en blanco.
    const rules = [...grammarById.values()].flatMap((rule) => {
      if (!rule.explanation.trim()) return []

      // Un ejemplo por TEMA distinto: el tomo tiene tres frases seguidas de いえ, y tres
      // veces la misma palabra se leen como una sola. Las frases salen del temario, nunca
      // se arman aquí juntando palabras.
      const byTopic = new Map<string, string>()
      for (const id of block.sentenceIds) {
        const sentence = sentencesById.get(id)
        if (sentence?.grammarId !== rule.id) continue
        // Sin el desglose kana a kana no hay nada que enseñar: la hoja saldría con los
        // renglones en blanco. Las frases de los tomos por escribir todavía no lo tienen.
        if (sentence.units.length === 0) continue

        const topic = sentence.wordIds[0] ?? id
        if (!byTopic.has(topic)) byTopic.set(topic, id)
      }

      // El primero, el de en medio y el último, y no los tres primeros: repartidos así
      // entran temas de todo el tomo, y el último suele ser el que más enseña —en 「ははいい」
      // el mismo carácter sale dos veces y solo uno es la partícula—.
      const topics = [...byTopic.values()]
      const sentenceIds =
        topics.length <= 3
          ? topics
          : [topics[0], topics[Math.floor((topics.length - 1) / 2)], topics[topics.length - 1]]

      if (sentenceIds.length === 0) return []

      const kanaId = [...kanaById.values()].find(
        (kana) => kana.character === rule.character,
      )?.id

      return [{ grammarId: rule.id, kanaId, sentenceIds }]
    })

    // Sin usarlo dentro: solo está en las dependencias para forzar este cálculo de
    // nuevo en cada reintento del examen final. `finalSentenceExamSpreads` sortea el
    // bloque 3 con cada llamada, así que un intento nuevo trae un orden nuevo.
    void examAttempt

    return {
      pages: buildVolumePages(lessons, reviewWordIds, examSentenceIds, rules),
      pools,
      reviewWordIds,
    }
  }, [block, kanaById, wordsById, sentencesById, grammarById, examAttempt])

  useEffect(() => {
    const template = templateRef.current
    const mount = mountRef.current
    if (!template || !mount || pageWidth <= 0) return

    // El contenedor de la librería se crea aquí y se tira al acabar: `destroy()` se lleva por
    // delante el propio elemento sobre el que se montó, así que reutilizar uno de React
    // dejaba el segundo montaje trabajando sobre un nodo desconectado del documento.
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
      // Desactivado deja el envoltorio a cero de alto y el libro no llega a verse, aunque su
      // estructura sí esté construida.
      autoSize: true,
      flippingTime: READER.flippingTimeMs,
      maxShadowOpacity: READER.maxShadowOpacity,
      // `disableFlipByClick` va ENCENDIDO. Apagado, cualquier clic en cualquier punto de la
      // hoja la pasaba: rozar el texto o fallar un botón por un píxel se llevaba la página.
      // Encendido no toca el arrastre, solo el clic, y lo deja en las esquinas.
      //
      // Lo que protege a los controles es `clickEventForward`: la librería ignora el
      // `mousedown` sobre un <button> o un <a>. Pero mira solo el elemento pulsado, no a sus
      // padres, así que un control tapado por otra capa —aunque sea transparente— pierde la
      // protección. Ver `KanaStroke.scss`.
      disableFlipByClick: true,
      useMouseEvents: true,
      // El pico que se levanta al pasar por encima es la única señal de que la hoja se puede
      // coger: es parte del gesto, no un adorno que se pueda apagar sin consecuencias.
      showPageCorners: true,
      // Activarlo haría que un arrastre vertical moviera la página en vez de pasar hoja.
      mobileScrollSupport: false,
    })

    flip.loadFromHTML(pages)
    flipRef.current = flip

    // El libro abre por donde se quedó. El índice se calcula a mano: con las páginas
    // invertidas, la primera de lectura es la ÚLTIMA del DOM, y la conversión vale en los
    // dos sentidos.
    const indexOfFolio = (folio: number) => pages.length - folio
    const folioOfIndex = (index: number) => pages.length - index

    // Siempre la hoja DERECHA de la plana, que es la que se lee primero: los folios impares
    // son los de la derecha, porque la plana 1 empieza en la 1.
    const rightOfSpread = (folio: number) => (folio % 2 === 1 ? folio : folio - 1)

    const saved = readBookmark(blockId)
    const startFolio = saved && saved <= pages.length ? rightOfSpread(saved) : 1

    flip.turnToPage(indexOfFolio(startFolio))

    // Se engancha DESPUÉS de colocar el libro: así lo primero que se guarda es una página
    // pasada de verdad, no el salto con el que se acaba de abrir. El evento trae el índice
    // del DOM; al disco va el folio.
    flip.on('flip', (event) => {
      const index = Number(event.data)
      if (!Number.isInteger(index)) return

      writeBookmark(blockId, rightOfSpread(folioOfIndex(index)))
    })

    // Todo esto se cablea AQUÍ y no dentro de cada componente: los únicos nodos que existen
    // en pantalla son los clones que se acaban de entregar a la librería, así que un
    // `onClick` de React no llegaría nunca a enterarse de la pulsación.
    const unmountStroke = mountKanaStroke(holder)
    const unmountAudio = mountBookAudio(holder)
    // La pizarra además tiene que CALLAR el gesto del libro: dibujar y pasar hoja se hacen
    // con el mismo movimiento.
    const unmountBoard = mountKanaBoard(holder)
    // Sin esto el hueco de rōmaji no se podría ni enfocar: el libro anula la pulsación.
    const unmountAnswer = mountWordAnswer(holder)
    const unmountPick = mountWordChoice(holder)
    // Las tarjetas que se arrastran también callan el gesto del libro.
    const unmountPairing = mountKanaPairing(holder)
    // Y el sello del examen, que escucha a todos los anteriores: es el primero que
    // se entera de que un ejercicio se ha resuelto. Ver `parts/solved.ts`.
    const unmountSeal = mountExamSeal(holder, blockId)
    // Las tarjetas de las frases del examen final: mismo gesto, sin corrección al
    // momento. Ver `sentenceTiles.ts`.
    const unmountSentenceTiles = mountSentenceTiles(holder)
    // El examen final en sí: bloquea el giro mientras se hace, puntúa cada frase al
    // pulsar «Siguiente» y decide él mismo cuándo se pasa de hoja. Va DESPUÉS de
    // `mountSentenceTiles`, que es quien deja el estado de cada hueco listo para leer.
    const unmountFinalExam = mountFinalExam(holder, {
      blockId,
      flip,
      sentencesById,
      retry: () => setExamAttempt((attempt) => attempt + 1),
      setTurnGuard: (isBlocked) => {
        turnBlockedRef.current = isBlocked
      },
    })
    // El regalo de la plana de enfrente. Solo el movimiento: quién lo ENCIENDE lo decide
    // el examen de al lado, al estampar el sello verde.
    const unmountGift = mountGiftOpening(holder)

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
      unmountSentenceTiles?.()
      unmountFinalExam?.()
      unmountGift?.()
      flipRef.current = null
      turnBlockedRef.current = () => false
      flip.destroy()
      mount.replaceChildren()
    }
    // `blockId` entra porque de él sale el marcador: cambiar de tomo tiene que volver a
    // montar el libro, no seguir apuntando en el del anterior. `examAttempt` entra porque
    // un reintento del examen final trae planas nuevas —barajadas de nuevo— que hay que
    // volver a entregarle a page-flip desde cero.
  }, [pageWidth, pageHeight, blockId, examAttempt, sentencesById])

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
            // Marca las hojas del examen con el kana del que son: es lo que le permite al
            // sello contar sus pruebas sin que nadie escriba cuántas hay.
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
                  // La portada no habla de ningún kana ni de ninguna palabra, sino del bloque
                  // entero, así que se resuelve la primera y por su cuenta.
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

                  // Como la portada, habla del tomo entero y no de un kana.
                  if (page.shows === 'finalNotice') return <FinalNotice />

                  if (page.shows === 'finalScope') {
                    const characters = block.lessons.flatMap(
                      (lesson) => kanaById.get(lesson.kanaId)?.character ?? [],
                    )
                    return <FinalScope characters={characters} />
                  }

                  if (page.shows === 'finalReviewNotice') return <FinalReviewNotice />

                  if (page.shows === 'finalReviewScope') {
                    const words = reviewWordIds.flatMap((wordId) => wordsById.get(wordId) ?? [])
                    return <FinalReviewScope words={words} />
                  }

                  if (page.shows === 'examRules') return <ExamRules />
                  if (page.shows === 'examScope') return <ExamScope />

                  if (page.shows === 'examSentence') {
                    const sentence = page.sentenceId ? sentencesById.get(page.sentenceId) : undefined
                    return sentence && page.cue && page.sentenceIndex && page.sentenceTotal ? (
                      <SentenceBuild
                        sentence={sentence}
                        cue={page.cue}
                        examBlock={page.examBlock ?? 1}
                        index={page.sentenceIndex}
                        total={page.sentenceTotal}
                      />
                    ) : null
                  }

                  if (page.shows === 'examResults') {
                    return page.examBlock ? (
                      <ExamResults examBlock={page.examBlock} title={page.title ?? ''} isLastBlock={page.examBlock === 3} />
                    ) : null
                  }

                  if (page.shows === 'examReveal') {
                    const characters = block.lessons.flatMap(
                      (lesson) => kanaById.get(lesson.kanaId)?.character ?? [],
                    )
                    return <ExamReveal characters={characters} />
                  }

                  if (page.shows === 'examGift') return <ExamGift />

                  // Como la portada, hablan del tomo y no de un kana: la regla es de la
                  // frase, no de la lección en la que cae.
                  if (page.shows === 'grammar') {
                    const rule = page.grammarId ? grammarById.get(page.grammarId) : undefined
                    return rule ? <GrammarRule rule={rule} /> : null
                  }

                  if (page.shows === 'grammarExample') {
                    const rule = page.grammarId ? grammarById.get(page.grammarId) : undefined
                    const sentences = (page.sentenceIds ?? []).flatMap(
                      (id) => sentencesById.get(id) ?? [],
                    )
                    return rule && sentences.length > 0 ? (
                      <GrammarExample rule={rule} sentences={sentences} />
                    ) : null
                  }

                  const word = page.wordId ? wordsById.get(page.wordId) : undefined

                  // El enunciado sin palabras va SOLO de la palabra: es la única hoja del tomo
                  // que no lleva kana.
                  if (page.shows === 'prompt') {
                    return word ? <WordPrompt word={word} /> : null
                  }

                  const kana = page.kanaId
                    ? kanaById.get(page.kanaId)
                    : undefined
                  if (!kana) return null

                  // Lo estudiado hasta esta lección, para las hojas que reparten tarjetas.
                  // Vacío si la lección no está en el mapa: las tarjetas son solo las de la
                  // palabra.
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

                  // Las dos hojas del examen: la derecha es una prueba suelta y la izquierda
                  // junta las otras dos, que es donde cae el sello.
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

                  // El encabezado y su lista van juntos en una sección para que el aire entre
                  // los dos bloques sea mayor que el que hay entre el encabezado y lo que titula.
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

      {/* Solo en pantallas táctiles: en un tomo apretado el arrastre tiene poco donde agarrar.
          Van FUERA del libro y sin nada dentro —page-flip solo respeta un <button> pulsado, no
          lo que lleve por dentro—, sobre el canto de las hojas, para no tapar el contenido. Se lee
          a la japonesa: «siguiente» es `flipPrev` y va a la izquierda. */}
      <button
        className="volume-reader__turn volume-reader__turn--next"
        type="button"
        aria-label="Página siguiente"
        onClick={() => {
          if (!turnBlockedRef.current()) flipRef.current?.flipPrev()
        }}
      />
      <button
        className="volume-reader__turn volume-reader__turn--back"
        type="button"
        aria-label="Página anterior"
        onClick={() => {
          if (!turnBlockedRef.current()) flipRef.current?.flipNext()
        }}
      />
    </div>
  )
}
