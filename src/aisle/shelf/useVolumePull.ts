import { useLayoutEffect, useRef, type RefObject } from 'react'
import gsap from 'gsap'
import { OPENING, OPENING_FRAMES } from '../book/opening/openingConfig'
import {
  COVER_TURN_ART as coverArt,
  VOLUME_PULL as pull,
  VOLUME_TURN as turn,
  type ShelfVolume,
} from './shelfConfig'
import { prefersReducedMotion } from '../../shared/prefersReducedMotion'

// Las cuatro poses del tomo, en orden: en la balda de tres cuartos, en la mano con el
// lomo de frente, de cara con la portada y de lado con el canto, que es desde donde se
// abre.
//
// `open` y `closing` no son poses del objeto 3D sino el relevo con el lector de páginas:
// el tomo se queda quieto de canto, escondido detrás, y reaparece al final para volver
// solo a la balda.
export type VolumeStage = 'shelf' | 'spine' | 'edge' | 'cover' | 'open' | 'closing'

interface VolumePullOptions {
  rootRef: RefObject<HTMLElement | null>
  boxRef: RefObject<HTMLElement | null>
  // La tapa pintada de tres cuartos. Se enciende sola en la pose de portada.
  turnedRef: RefObject<HTMLElement | null>
  volume: ShelfVolume
  stage: VolumeStage
}

// Giro y avance van en dos pistas sobre elementos distintos —la caja gira, el contenedor
// se desplaza— porque son cosas separadas. Compartir un solo transform obligaría a
// recomponer la cadena entera en cada frame y a que el giro arrastrase la escala.
export function useVolumePull({
  rootRef,
  boxRef,
  turnedRef,
  volume,
  stage,
}: VolumePullOptions): void {
  const isFirstRender = useRef(true)

  // El anclaje se escribe una vez, al montar: reproduce con xPercent/yPercent lo que el
  // CSS hace con translate(-50%, -100%). En cuanto GSAP toque `x` o `scale` reescribirá el
  // transform entero, y sin esto el tomo saltaría al empezar la animación. El origen en la
  // base es lo que lo deja crecer sin despegarlo de la madera.
  useLayoutEffect(() => {
    const root = rootRef.current
    if (!root) return

    gsap.set(root, { xPercent: -50, yPercent: -100, transformOrigin: '50% 100%' })
  }, [rootRef])

  useLayoutEffect(() => {
    const root = rootRef.current
    const box = boxRef.current
    // El stage es quien da la escala: las medidas de la config son fracciones suyas.
    const turned = turnedRef.current
    const stageEl = root?.offsetParent as HTMLElement | null
    if (!root || !box || !turned || !stageEl) return

    const stageRect = stageEl.getBoundingClientRect()
    const shape = volume.art.shape

    // La config lo dice en fracciones de la VENTANA, que es donde tiene que quedar el
    // libro, y el tomo se mueve en fracciones del stage, que es donde vive. Desde que el
    // pasillo encuadra por la estantería el stage ya no está centrado, y sin esta
    // conversión el tomo se iba hacia un lado y se salía de la pantalla.
    //
    // La ventana es la caja del pasillo y no `window`: es la que mide `--vh`, así que en un
    // móvil no cambia cuando aparece la barra de URL.
    const viewRect = (stageEl.parentElement ?? stageEl).getBoundingClientRect()
    const focusX =
      (viewRect.left + pull.focusX * viewRect.width - stageRect.left) / stageRect.width
    const focusY =
      (viewRect.top + pull.focusY * viewRect.height - stageRect.top) / stageRect.height

    // En la pose adelantada el tomo queda centrado, así que `focusY` es su centro y hay que
    // bajar hasta su base, que es por donde está anclado.
    const focusBaseY = focusY + pull.focusHeight / 2
    // La escala 1 ES la pose de delante y la balda es la que encoge: así la caja 3D se
    // rasteriza a tamaño grande y no llega pixelada. Ver ShelfVolume.scss.
    const forward = {
      x: (focusX - volume.x) * stageRect.width,
      y: (focusBaseY - volume.baseY) * stageRect.height,
      scale: 1,
    }
    const atShelf = { x: 0, y: 0, scale: volume.height / pull.focusHeight }

    // Con la portada de cara lo que se ve es la tapa, que cuelga hacia la izquierda. Como
    // el tomo está anclado por el lomo, sin corregir quedaría escorado media tapa.
    //
    // El seno descuenta el escorzo, y sale del ángulo y no de un número a mano, así que
    // mover `coverDeg` no descentra nada. Se centra por la tapa PINTADA y no por la plana:
    // en esa pose lo que se ve es la pintada, que incluye el bloque de hojas.
    const coverWidth = shape.coverRatio * pull.focusHeight * stageRect.height
    const turnedWidth = shape.coverTurnedRatio * pull.focusHeight * stageRect.height
    const centreCover = (turnedWidth / 2) * Math.sin((turn.coverDeg * Math.PI) / 180)

    // A media vuelta el canto se queda a un ancho de tapa de la cámara y la perspectiva lo
    // agranda. Se descuenta para que el alto pedido en la config sea el que se ve. No
    // depende de la escala: la fuga se calcula dentro de la caja, en sus propias unidades.
    const perspectiveGain = turn.perspectivePx / (turn.perspectivePx - coverWidth)

    // De canto el tomo se centra en `focusY` en vez de posarse por la base: no se apoya en
    // nada. Lateralmente va sin corregir, porque a media vuelta el canto cae sobre el eje
    // del lomo.
    const onEdge = {
      x: (focusX - volume.x) * stageRect.width,
      y: (focusY + pull.edgeHeight / 2 - volume.baseY) * stageRect.height,
      scale: pull.edgeHeight / pull.focusHeight / perspectiveGain,
      rotationY: turn.edgeDeg,
    }

    const pose = {
      shelf: { ...atShelf, rotationY: turn.restDeg },
      spine: { ...forward, rotationY: turn.spineDeg },
      cover: { ...forward, x: forward.x + centreCover, rotationY: turn.coverDeg },
      edge: onEdge,
      // Al abrirse el tomo no se mueve: se queda de canto y el libro pintado entra encima.
      // Al cerrarse espera en la misma pose, así que vuelve del sitio del que salió.
      open: onEdge,
      closing: onEdge,
    }[stage]

    // El primer render coloca sin animar: el tomo ya nace en la balda, y animar hasta donde
    // ya está sería un tirón al cargar la pantalla.
    const jump =
      isFirstRender.current || prefersReducedMotion()
    isFirstRender.current = false

    // Con el libro abierto el tomo en 3D sobra: dejarlo debajo asomaría por los lados, que
    // son más estrechos que los del libro ya abierto.
    const visible = stage === 'open' ? 0 : 1

    // Al cerrarse el tomo no vuelve de golpe: espera a que la apertura se haya deshecho
    // casi entera y entra cruzándose con el ÚLTIMO fotograma, espejo de cómo se fue.
    const fadeDelay =
      stage === 'closing' ? (OPENING_FRAMES.length - 1) * OPENING.frameSeconds : 0

    // La tapa pintada se enciende en la pose de portada y sigue encendida al pasar al canto.
    // No se apaga al salir: la esconde el propio giro al escorzarla. Apagándola al pulsar,
    // el medio giro con la tapa sin bloque de hojas se leía como si el libro volviera atrás.
    const showTurned = stage === 'cover' || stage === 'edge'

    if (jump) {
      gsap.set(root, { x: pose.x, y: pose.y, scale: pose.scale, autoAlpha: visible })
      gsap.set(box, { rotationY: pose.rotationY })
      gsap.set(turned, { opacity: showTurned ? 1 : 0 })
      return
    }

    const common = { duration: pull.durationSeconds, ease: pull.ease }
    const tweens = [
      gsap.to(root, { x: pose.x, y: pose.y, scale: pose.scale, ...common }),
      // El apagado va con la duración del primer fotograma de la apertura y no con la del
      // giro: los dos fundidos se cruzan, y así el relevo no se ve como un corte.
      gsap.to(root, {
        autoAlpha: visible,
        duration: OPENING.frameSeconds,
        ease: OPENING.ease,
        delay: fadeDelay,
      }),
      // Al encenderse espera a que el giro esté casi hecho; al apagarse va deprisa, porque
      // el tomo ya se está yendo a otra pose.
      gsap.to(turned, {
        opacity: showTurned ? 1 : 0,
        duration: showTurned ? coverArt.durationSeconds : coverArt.hideSeconds,
        delay: showTurned ? coverArt.delaySeconds : 0,
        ease: coverArt.ease,
      }),
      // `transformPerspective` en vez de la propiedad `perspective` del padre: así la fuga
      // es del propio tomo y no se deforma cuando el contenedor se escala.
      gsap.to(box, {
        rotationY: pose.rotationY,
        transformPerspective: turn.perspectivePx,
        ...common,
      }),
    ]

    return () => tweens.forEach((tween) => tween.kill())
  }, [rootRef, boxRef, turnedRef, volume, stage])
}
