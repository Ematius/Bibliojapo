import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
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
import { VolumeReader } from '../book/reader/VolumeReader'
import { VolumeStatus } from '../book/reader/VolumeStatus'
import { useVolumeContent } from '../book/reader/useVolumeContent'
import { VolumeScrim } from './VolumeScrim'
import { ShelfNote } from './ShelfNote'
import { prefersReducedMotion } from '../../shared/prefersReducedMotion'
import './ShelfVolume.scss'

// `pending` mientras no se sabe todavía si el tomo se puede coger. Se ve igual
// que uno cerrado, pero no responde: decir «se abre al sellar el anterior» a
// alguien que quizá ya lo ha sellado sería mentirle.
export type ShelfAccess = VolumeAccess | 'pending'

interface ShelfVolumeProps {
  volume: ShelfVolumeData
  access: ShelfAccess
}

// La pose que sigue a cada una. El recorrido es de ida: se coge el tomo, se le
// da la vuelta, y de ahí se abre. Para volver está Escape, que es el gesto que ya
// espera cualquiera para salir de algo que ocupa la pantalla.
const NEXT_STAGE: Record<VolumeStage, VolumeStage> = {
  shelf: 'spine',
  spine: 'cover',
  cover: 'edge',
  edge: 'open',
  open: 'open',
  // Mientras se cierra el tomo no se puede pulsar —está apagado—, pero la tabla
  // tiene que cubrir todas las poses.
  closing: 'closing',
}

// Las poses que no esperan a nadie.
//
// Las cuatro poses del recorrido siguen ahí, pero se recorren de dos en dos: una
// pulsación deja el tomo con la portada de cara y la siguiente lo abre. Estas dos
// son las que quedan a mitad de cada par, así que en cuanto su giro termina
// encadenan con el siguiente por su cuenta.
//
// Cuatro paradas para llegar a un libro cansaban; cuatro giros, no. Lo que se
// quitó de en medio son las pulsaciones, no el movimiento.
const RELAY_STAGES = new Set<VolumeStage>(['spine', 'edge'])

// Un tomo de la estantería, montado como un objeto con volumen y no como una
// estampa.
//
// El lomo y la tapa son dos planos perpendiculares que forman la esquina del
// libro. En la balda el conjunto está girado de tres cuartos; al pulsarlo se
// adelanta girando hasta poner el lomo de frente y sigue solo hasta enseñar la
// portada, y otra pulsación lo pone de canto y lo abre — dos pulsaciones, cuatro
// giros. La tapa no hay que esconderla en ningún momento: al
// girar se pone de perfil ella sola, que es justo lo que hace un libro de
// verdad.
export function ShelfVolume({ volume, access }: ShelfVolumeProps) {
  const [stage, setStage] = useState<VolumeStage>('shelf')
  const [layout, setLayout] = useState<OpenBookLayout | null>(null)
  // La apertura tiene dos momentos: el libro abriéndose y el libro ya abierto.
  // Las hojas del lector no se montan hasta el segundo, porque antes no hay
  // hueco de papel donde ponerlas — todavía se está formando.
  const [opened, setOpened] = useState(false)
  // La nota que explica por qué un tomo no sale. Null cuando no hay nada que
  // decir. Va en un objeto y no como texto suelto para que pulsar dos veces
  // seguidas cuente como dos notas: con el mismo texto, React no vería cambio y
  // la cuenta atrás no se reiniciaría.
  const [note, setNote] = useState<{ text: string } | null>(null)
  const rootRef = useRef<HTMLButtonElement>(null)
  const boxRef = useRef<HTMLSpanElement>(null)
  const turnedRef = useRef<HTMLImageElement>(null)
  const stopNudgeRef = useRef<(() => void) | null>(null)

  useVolumePull({ rootRef, boxRef, turnedRef, volume, stage })

  // Las hojas se piden en cuanto el tomo sale de la balda. Ver `useVolumeContent`.
  const { load, retry } = useVolumeContent(volume.blockId, stage !== 'shelf')

  // La nota se va sola al rato. Cada nota nueva reinicia la cuenta, así que
  // pulsar dos veces seguidas no la hace desaparecer antes de tiempo.
  useEffect(() => {
    if (!note) return

    const hide = gsap.delayedCall(VOLUME_LOCK.noteSeconds, () => setNote(null))
    return () => {
      hide.kill()
    }
  }, [note])

  // Si el tomo se desmonta a medio tirón, el tirón se para con él.
  useEffect(() => () => stopNudgeRef.current?.(), [])

  // Medidas del libro abierto, tomadas de la ventana. Se miden aquí y no dentro
  // del libro porque es el tomo quien conoce su sitio en la escena.
  //
  // De la ventana y no del stage: el libro abierto se pone DELANTE de la escena y
  // se centra en la pantalla —ver `VolumeOpening.scss`—, así que lo que no puede
  // desbordar es la ventana. La caja del pasillo es la que mide `--vh`.
  useLayoutEffect(() => {
    const stageEl = rootRef.current?.offsetParent as HTMLElement | null
    const viewEl = stageEl?.parentElement
    if (!viewEl) return

    setLayout(openBookLayout(viewEl.clientHeight))
  }, [stage])

  // Único camino para cambiar de pose. Al salir de `open` el libro se cierra del
  // todo, para que la próxima vez vuelva a abrirse desde el primer fotograma y
  // no a medio camino. Va aquí y no en un efecto porque es el gesto el que
  // cierra el libro, no el render.
  const goTo = useCallback((next: VolumeStage) => {
    setStage(next)
    if (next !== 'open' && next !== 'closing') setOpened(false)
  }, [])

  // Guardar el tomo. Desde el libro del todo abierto no se vuelve de golpe a la
  // balda: primero se cierra, y solo cuando ha terminado arranca la vuelta al
  // estante. Desde cualquier otra pose no hay nada que plegar y se va directo.
  //
  // Se exige `opened` y no solo la etapa: si se pulsa fuera con el libro aún
  // abriéndose, no hay una apertura completa que deshacer, y rebobinar a medias
  // dejaría al tomo reapareciendo a destiempo.
  const dismiss = useCallback(() => {
    if (stage === 'open' && opened) setStage('closing')
    else goTo('shelf')
  }, [stage, opened, goTo])

  // El segundo giro de cada par, que sale solo.
  //
  // Se programa al llegar a la pose de paso y se cancela con ella: el efecto se
  // limpia en cada cambio de pose, así que pulsar a media animación adelanta el
  // giro y de camino desactiva el relevo que estaba pendiente. Ese es justo el
  // comportamiento de antes —pulsar salta a la pose siguiente—, que aquí sigue
  // valiendo sin tocar nada.
  //
  // El temporizador es de GSAP y no del navegador a propósito: corre en el mismo
  // reloj que el giro que está esperando, así que si el reloj se para —pestaña en
  // segundo plano— el relevo se para con él en vez de dispararse a destiempo.
  useEffect(() => {
    if (!RELAY_STAGES.has(stage)) return

    // El relevo no espera al giro entero: entra mientras remata, o entre los dos
    // se colaba una pausa. Ver `relayOverlapSeconds`.
    //
    // Con «reducir movimiento» las poses son instantáneas, así que cualquier
    // espera dejaría el tomo plantado en una pose que solo existe de paso.
    const wait = prefersReducedMotion()
      ? 0
      : Math.max(0, VOLUME_PULL.durationSeconds - VOLUME_PULL.relayOverlapSeconds)

    const relay = gsap.delayedCall(wait, () => goTo(NEXT_STAGE[stage]))
    return () => {
      relay.kill()
    }
  }, [stage, goTo])

  // Escape devuelve el tomo a su balda desde cualquier pose. Solo se escucha
  // mientras está fuera del estante, para no dejar un listener global puesto por
  // una pantalla que no lo necesita.
  useEffect(() => {
    if (stage === 'shelf') return

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') dismiss()
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [stage, dismiss])

  // Pulsar el tomo. Fuera de la balda, o si se puede coger, sigue el recorrido de
  // siempre; en la balda y cerrado, se resiste y dice por qué.
  const onPress = () => {
    if (stage !== 'shelf' || access === 'open') {
      goTo(NEXT_STAGE[stage])
      return
    }

    // Aún no se sabe cómo está: no se promete nada.
    if (access === 'pending') return

    // Ganado pero sin sitio donde guardar la insignia. No hace falta tirón ni
    // nota: lo que hay que hacer es crear la cuenta, y el panel ya lo explica.
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

  // Lo que promete el botón es dónde acaba la pulsación, no el giro que arranca:
  // desde la portada, pulsar ya no gira el tomo y se queda ahí — lo abre, porque
  // el giro de canto viene encadenado detrás.
  //
  // En la balda depende de si se puede coger: un tomo cerrado no promete «coger»,
  // dice qué le falta.
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

  return (
    <>
      {/* Va primero para quedar por detrás de todo lo demás: es el fondo sobre
          el que se destaca el tomo, no una capa encima de él. */}
      <VolumeScrim shown={stage !== 'shelf'} onDismiss={dismiss} />

      {/* Sigue montado mientras se cierra: es la misma línea de tiempo
          rebobinando, y desmontarlo aquí sería quitar de en medio justo lo que
          tiene que verse plegarse. */}
      {(stage === 'open' || stage === 'closing') && layout ? (
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
        </VolumeOpening>
      ) : null}

      <ShelfNote volume={volume} message={note?.text ?? null} />

      <button
        type="button"
        className={`shelf-volume shelf-volume--${stage} shelf-volume--${access}`}
        style={volumeStyle}
        ref={rootRef}
        onClick={onPress}
        aria-label={label}
        aria-disabled={access === 'pending' ? true : undefined}
        // Con el libro abierto el tomo sigue montado —es quien guarda la pose y
        // las referencias— pero deja de ser alcanzable: el que manda entonces es
        // el lector.
        aria-hidden={stage === 'open' || stage === 'closing'}
        tabIndex={stage === 'open' || stage === 'closing' ? -1 : undefined}
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
