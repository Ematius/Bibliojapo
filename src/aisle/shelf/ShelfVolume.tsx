import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import gsap from 'gsap'
import type { StyleWithVars } from '../../shared/styleWithVars'
import type { VolumeAccess } from '../../api/volumes'
import { openAccountPanel } from '../../account/accountPanelState'
import {
  FORE_EDGE,
  VOLUME_LOCK,
  VOLUME_PULL,
  type ShelfVolume as ShelfVolumeData,
} from './shelfConfig'
import { openBookLayout, type OpenBookLayout } from '../book/opening/openingConfig'
import { useVolumePull, type VolumeStage } from './useVolumePull'
import { nudgeVolume } from './volumeNudge'
import { VolumeOpening } from '../book/opening/VolumeOpening'
import { RotateNotice } from '../book/opening/RotateNotice'
import { BookExit } from '../book/opening/BookExit'
import { SmallScreenNotice } from '../book/opening/SmallScreenNotice'
import { VolumeReader } from '../book/reader/VolumeReader'
import { VolumeStatus } from '../book/reader/VolumeStatus'
import { useVolumeContent } from '../../shared/useVolumeContent'
import { VolumeScrim } from './VolumeScrim'
import { ShelfNote } from './ShelfNote'
import { prefersReducedMotion } from '../../shared/prefersReducedMotion'
import { markVolumeOpen } from '../../shared/volumeReadingState'
import './ShelfVolume.scss'

// `pending` mientras no se sabe si el tomo se puede coger. Se ve igual que uno cerrado
// pero no responde: decir «se abre al sellar el anterior» a quien quizá ya lo selló sería
// mentirle.
export type ShelfAccess = VolumeAccess | 'pending'

interface ShelfVolumeProps {
  volume: ShelfVolumeData
  access: ShelfAccess
}

// La pose que sigue a cada una. El recorrido es de ida; para volver está Escape.
const NEXT_STAGE: Record<VolumeStage, VolumeStage> = {
  shelf: 'spine',
  spine: 'cover',
  cover: 'edge',
  edge: 'open',
  open: 'open',
  // Mientras se cierra no se puede pulsar, pero la tabla tiene que cubrir todas las poses.
  closing: 'closing',
}

// Las poses que no esperan a nadie: las cuatro del recorrido se recorren de dos en dos,
// así que estas dos encadenan con la siguiente en cuanto su giro termina. Cuatro paradas
// para llegar a un libro cansaban; cuatro giros, no.
const RELAY_STAGES = new Set<VolumeStage>(['spine', 'edge'])

// Un tomo montado como un objeto con volumen y no como una estampa: lomo y tapa son dos
// planos perpendiculares que forman la esquina del libro. La tapa no hay que esconderla en
// ningún momento — al girar se pone de perfil ella sola.
export function ShelfVolume({ volume, access }: ShelfVolumeProps) {
  const [stage, setStage] = useState<VolumeStage>('shelf')
  const [layout, setLayout] = useState<OpenBookLayout | null>(null)
  // Las hojas del lector no se montan hasta que el libro está abierto del todo: antes no
  // hay hueco de papel donde ponerlas.
  const [opened, setOpened] = useState(false)
  // Si ya se ha leído el aviso de pantalla pequeña. Por tomo y por visita: repetirlo cada
  // vez que se abre el mismo libro sería un peaje.
  const [warned, setWarned] = useState(false)
  // La nota que explica por qué un tomo no sale. Va en un objeto y no como texto suelto
  // para que pulsar dos veces cuente como dos notas: con el mismo texto React no vería
  // cambio y la cuenta atrás no se reiniciaría.
  const [note, setNote] = useState<{ text: string } | null>(null)
  const rootRef = useRef<HTMLButtonElement>(null)
  const boxRef = useRef<HTMLSpanElement>(null)
  const turnedRef = useRef<HTMLImageElement>(null)
  const stopNudgeRef = useRef<(() => void) | null>(null)

  useVolumePull({ rootRef, boxRef, turnedRef, volume, stage })

  const { load, retry } = useVolumeContent(volume.blockId, stage !== 'shelf')

  // Cada nota nueva reinicia la cuenta, así que pulsar dos veces seguidas no la hace
  // desaparecer antes de tiempo.
  useEffect(() => {
    if (!note) return

    const hide = gsap.delayedCall(VOLUME_LOCK.noteSeconds, () => setNote(null))
    return () => {
      hide.kill()
    }
  }, [note])

  // Si el tomo se desmonta a medio tirón, el tirón se para con él.
  useEffect(() => () => stopNudgeRef.current?.(), [])

  // Avisa fuera mientras el tomo no está en la balda: el libro abierto pinta por encima de la
  // barra de navegación, así que ella tiene que enterarse de que hay que apartarse.
  useEffect(() => {
    if (stage === 'shelf') return
    return markVolumeOpen()
  }, [stage])

  // Medidas del libro abierto. De la VENTANA y no del stage: el libro se pone delante de
  // la escena y se centra en la pantalla, así que lo que no puede desbordar es la ventana.
  // La caja del pasillo es la que mide `--vh`.
  //
  // Se vuelve a medir al cambiar de tamaño, y no solo al abrir: girar el móvil es
  // justamente lo que se le pide a quien no tiene sitio para el libro, y con la medida de
  // antes seguiría sin caber después de girar.
  useLayoutEffect(() => {
    const stageEl = rootRef.current?.offsetParent as HTMLElement | null
    const viewEl = stageEl?.parentElement
    if (!viewEl) return

    // Contra la ventana de verdad y no solo contra la caja del pasillo, que mide `--vh` y
    // ese valor se queda sin actualizar cuando cambia el alto sin cambiar el ancho —abrir
    // las herramientas del navegador abajo, por ejemplo—. Con el alto viejo el libro se
    // calculaba mayor que la pantalla y se salía por arriba y por abajo.
    //
    // Y la MENOR de las dos, no siempre la ventana: en un móvil la barra de URL entra y
    // sale, y con la ventana a secas el libro cambiaría de tamaño a mitad de lectura. Ese
    // es justo el vaivén que `--vh` evita.
    //
    // Si cabe o no se decide midiendo y no por el tipo de aparato: una ventana estrecha en
    // un escritorio tiene el mismo problema que un móvil de pie.
    const measure = () => {
      const view = document.documentElement
      setLayout(
        openBookLayout(
          Math.min(viewEl.clientHeight, view.clientHeight),
          Math.min(viewEl.clientWidth, view.clientWidth),
        ),
      )
    }

    measure()

    const observer = new ResizeObserver(measure)
    observer.observe(viewEl)
    // La caja del pasillo no cambia de alto con la ventana —la fija `--vh`—, así que su
    // observador no se entera de este caso.
    window.addEventListener('resize', measure)
    return () => {
      observer.disconnect()
      window.removeEventListener('resize', measure)
    }
  }, [stage])

  // Único camino para cambiar de pose. Al salir de `open` el libro se cierra del todo para
  // que la próxima vez vuelva a abrirse desde el primer fotograma. Va aquí y no en un
  // efecto porque es el gesto el que cierra el libro, no el render.
  const goTo = useCallback((next: VolumeStage) => {
    setStage(next)
    if (next !== 'open' && next !== 'closing') setOpened(false)
  }, [])

  // Desde el libro abierto no se vuelve de golpe a la balda: primero se cierra. Se exige
  // `opened` y no solo la etapa porque si se pulsa fuera con el libro aún abriéndose no hay
  // una apertura completa que deshacer, y rebobinar a medias dejaría al tomo reapareciendo
  // a destiempo.
  const dismiss = useCallback(() => {
    if (stage === 'open' && opened) setStage('closing')
    else goTo('shelf')
  }, [stage, opened, goTo])

  // El segundo giro de cada par, que sale solo. Se programa al llegar a la pose de paso y
  // se cancela con ella, así que pulsar a media animación adelanta el giro y desactiva el
  // relevo pendiente.
  //
  // El temporizador es de GSAP y no del navegador: corre en el mismo reloj que el giro que
  // espera, así que con la pestaña en segundo plano se para con él en vez de dispararse a
  // destiempo.
  useEffect(() => {
    if (!RELAY_STAGES.has(stage)) return

    // El relevo no espera al giro entero: entra mientras remata, o se colaba una pausa. Con
    // «reducir movimiento» las poses son instantáneas y cualquier espera dejaría el tomo
    // plantado en una pose que solo existe de paso.
    const wait = prefersReducedMotion()
      ? 0
      : Math.max(0, VOLUME_PULL.durationSeconds - VOLUME_PULL.relayOverlapSeconds)

    const relay = gsap.delayedCall(wait, () => goTo(NEXT_STAGE[stage]))
    return () => {
      relay.kill()
    }
  }, [stage, goTo])

  // Escape devuelve el tomo a su balda. Solo se escucha mientras está fuera del estante,
  // para no dejar un listener global puesto por una pantalla que no lo necesita.
  useEffect(() => {
    if (stage === 'shelf') return

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') dismiss()
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [stage, dismiss])

  // Fuera de la balda, o si se puede coger, sigue el recorrido; en la balda y cerrado, se
  // resiste y dice por qué.
  const onPress = () => {
    if (stage !== 'shelf' || access === 'open') {
      goTo(NEXT_STAGE[stage])
      return
    }

    // Aún no se sabe cómo está: no se promete nada.
    if (access === 'pending') return

    // Ganado pero sin sitio donde guardar la insignia: no hace falta tirón ni nota, lo que
    // hay que hacer es crear la cuenta.
    if (access === 'needsAccount') {
      openAccountPanel(
        `Has sellado el tomo ${volume.number - 1}. Crea tu cuenta para guardar su ` +
          `insignia y abrir el tomo ${volume.number}.`,
      )
      return
    }

    stopNudgeRef.current?.()
    if (boxRef.current) stopNudgeRef.current = nudgeVolume(boxRef.current)

    setNote({
      text:
        access === 'soon'
          ? `El tomo ${volume.number} todavía se está escribiendo.`
          : `Se abre al sellar el tomo ${volume.number - 1}.`,
    })
  }

  const { shape } = volume.art
  const volumeStyle: StyleWithVars = {
    '--volume-x': volume.x,
    '--volume-base-y': volume.baseY,
    '--volume-focus-height': VOLUME_PULL.focusHeight,
    '--volume-pull-seconds': VOLUME_PULL.durationSeconds,
    '--cover-ratio': shape.coverRatio,
    '--cover-turned-ratio': shape.coverTurnedRatio,
    '--spine-ratio': shape.spineRatio,
  }

  // Lo que promete el botón es dónde acaba la pulsación, no el giro que arranca: desde la
  // portada, pulsar abre, porque el giro de canto viene encadenado detrás.
  const shelfLabel = {
    open: `Coger ${volume.label}`,
    pending: volume.label,
    locked: `${volume.label}, cerrado: se abre al sellar el tomo ${volume.number - 1}`,
    needsAccount: `${volume.label}: crea tu cuenta para abrirlo`,
    soon: `${volume.label}, todavía se está escribiendo`,
  }[access]

  const label = {
    shelf: shelfLabel,
    spine: `Ver la portada de ${volume.label}`,
    cover: `Abrir ${volume.label}`,
    edge: `Abrir ${volume.label}`,
    open: `Cerrar ${volume.label}`,
    closing: `Cerrando ${volume.label}`,
  }[stage]

  // En una pantalla justa se avisa de lo que se va a encontrar ANTES de abrir el tomo o de
  // pedir que giren: girar el móvil y toparse igual con una letra cortada se lee como una
  // app rota, y no como el apretón que es.
  const cramped = layout ? !layout.fits || layout.tight : false
  const warning = (stage === 'open' || stage === 'closing') && cramped && !warned

  return (
    <>
      {/* Va primero para quedar por detrás de todo lo demás: es el fondo sobre
          el que se destaca el tomo, no una capa encima de él. */}
      <VolumeScrim shown={stage !== 'shelf'} onDismiss={dismiss} />

      {warning
        ? createPortal(
            <SmallScreenNotice onAccept={() => setWarned(true)} onDismiss={dismiss} />,
            document.body,
          )
        : null}

      {/* Sigue montado mientras se cierra: es la misma línea de tiempo
          rebobinando, y desmontarlo aquí sería quitar de en medio justo lo que
          tiene que verse plegarse. */}
      {/* Colgados del body y no del stage ni del pasillo: los dos se centran con
          `position: fixed`, y ahí dentro el bloque contenedor sería el stage —que lleva
          transform desde que se recorre con el dedo— o la caja del pasillo, que mide `--vh`
          y puede ser más alta que la pantalla. En el body se centran en lo que se ve. */}
      {(stage === 'open' || stage === 'closing') && !warning && layout && !layout.fits
        ? createPortal(<RotateNotice onDismiss={dismiss} />, document.body)
        : null}

      {(stage === 'open' || stage === 'closing') && !warning && layout?.fits
        ? createPortal(
        <VolumeOpening
          layout={layout}
          closing={stage === 'closing'}
          onOpened={() => setOpened(true)}
          onClosed={() => goTo('shelf')}
        >
          {/* Las hojas si ya han llegado; si no, el papel dice qué pasa. Lo
              normal es lo primero: se pidieron al coger el tomo. */}
          {opened ? (
            load.status === 'ready' ? (
              <VolumeReader
                content={load.content}
                pageWidth={layout.paper.width / 2}
                pageHeight={layout.paper.height}
              />
            ) : (
              <VolumeStatus load={load} onRetry={retry} />
            )
          ) : null}
        </VolumeOpening>,
            document.body,
          )
        : null}

      {/* La salida del tomo, solo cuando el libro no deja velo que pulsar. Al body por lo
          mismo que el libro: dentro del stage heredaría su desplazamiento. */}
      {(stage === 'open' || stage === 'closing') && !warning && layout?.fits && layout.tight
        ? createPortal(<BookExit onDismiss={dismiss} />, document.body)
        : null}

      <ShelfNote volume={volume} message={note?.text ?? null} />

      <button
        type="button"
        className={`shelf-volume shelf-volume--${stage} shelf-volume--${access}`}
        style={volumeStyle}
        ref={rootRef}
        onClick={onPress}
        aria-label={label}
        aria-disabled={access === 'pending' ? true : undefined}
        // Con el libro abierto el tomo sigue montado —guarda la pose y las referencias— pero
        // deja de ser alcanzable: el que manda es el lector.
        aria-hidden={stage === 'open' || stage === 'closing'}
        tabIndex={stage === 'open' || stage === 'closing' ? -1 : undefined}
        // Fuera de la balda el tomo se pinta por encima del velo, así que tiene que frenar
        // el recorrido igual que él. En la balda no: ahí el dedo arrastra el pasillo. Ver
        // `useScenePan`.
        data-no-pan={stage === 'shelf' ? undefined : ''}
      >
      <span className="shelf-volume__box" ref={boxRef}>
        {/* Las cuatro caras del tomo, de la más lejana a la más cercana: cuando
            el giro deja alguna casi de canto, el orden del DOM decide cuál se
            pinta encima si el navegador no puede desempatar por profundidad. */}
        {/* La contra reutiliza la portada: todavía no hay dibujo propio. */}
        <span className="shelf-volume__face shelf-volume__face--back">
          <img src={volume.art.cover} alt="" draggable="false" />
        </span>

        <span className="shelf-volume__face shelf-volume__face--cover">
          <img src={volume.art.cover} alt="" draggable="false" />

          {/* La misma portada, pero pintada de tres cuartos y con el bloque de
              hojas. Vive dentro de la cara, así que gira con ella; solo se
              enciende al final del giro, cuando el tomo ya está de frente. */}
          <img
            className="shelf-volume__turned"
            src={volume.art.coverTurned}
            alt=""
            draggable="false"
            ref={turnedRef}
          />

          {/* El canto cuelga de la portada y no de la caja: es la única forma de
              llevarlo al fondo con medidas en proporción. */}
          <span className="shelf-volume__face shelf-volume__face--edge">
            <img src={FORE_EDGE} alt="" draggable="false" />
          </span>
        </span>

        <span className="shelf-volume__face shelf-volume__face--spine">
          <img src={volume.art.spine} alt="" draggable="false" />
        </span>
      </span>
    </button>
    </>
  )
}
