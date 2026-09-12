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

// Las cuatro poses del tomo, en orden. Cada una es un punto de reposo donde el
// gesto puede pararse, y entre las cuatro se ven las cuatro caras del libro: en
// la balda de tres cuartos, en la mano con el lomo de frente, de cara con la
// portada, y por fin de lado con el canto —el bloque de hojas cerrado—, que es
// desde donde se abre.
// `open` no es una pose del objeto 3D sino el relevo: a partir de ahí manda el
// lector de páginas, y el tomo se queda donde estaba, escondido detrás.
//
// `closing` tampoco es una pose: es el mismo relevo al revés. El tomo sigue
// quieto de canto mientras el libro pintado se cierra encima, y reaparece al
// final para volver solo a la balda.
export type VolumeStage = 'shelf' | 'spine' | 'edge' | 'cover' | 'open' | 'closing'

interface VolumePullOptions {
  rootRef: RefObject<HTMLElement | null>
  boxRef: RefObject<HTMLElement | null>
  // La tapa pintada de tres cuartos. Se enciende sola en la pose de portada.
  turnedRef: RefObject<HTMLElement | null>
  volume: ShelfVolume
  stage: VolumeStage
}

// El tomo saliendo del estante: se adelanta y crece mientras gira, primero hasta
// poner el lomo de frente y después hasta enseñar la portada.
//
// Giro y avance van en dos pistas sobre elementos distintos —la caja gira, el
// contenedor se desplaza— porque son cosas separadas: el libro gira sobre sí
// mismo mientras alguien lo acerca. Compartir un solo transform obligaría a
// recomponer la cadena entera en cada frame y a que el giro arrastrase la
// escala.
export function useVolumePull({
  rootRef,
  boxRef,
  turnedRef,
  volume,
  stage,
}: VolumePullOptions): void {
  const isFirstRender = useRef(true)

  // El anclaje se escribe una vez, al montar. Reproduce con xPercent/yPercent lo
  // que el CSS hace con translate(-50%, -100%): en cuanto GSAP toque `x` o
  // `scale` reescribirá el transform entero, y sin esto el tomo perdería su
  // anclaje y saltaría al empezar la animación.
  //
  // El origen en la base es lo que deja crecer el tomo sin despegarlo de la
  // madera mientras aún está en la balda.
  useLayoutEffect(() => {
    const root = rootRef.current
    if (!root) return

    gsap.set(root, { xPercent: -50, yPercent: -100, transformOrigin: '50% 100%' })
  }, [rootRef])

  useLayoutEffect(() => {
    const root = rootRef.current
    const box = boxRef.current
    // El stage es quien da la escala: las medidas de la config son fracciones
    // suyas, no de la ventana.
    const turned = turnedRef.current
    const stageEl = root?.offsetParent as HTMLElement | null
    if (!root || !box || !turned || !stageEl) return

    const stageRect = stageEl.getBoundingClientRect()
    // La forma de ESTE tomo: cada uno tiene la suya.
    const shape = volume.art.shape

    // Adónde se adelanta el tomo, pasado a fracciones del STAGE.
    //
    // La config lo dice en fracciones de la VENTANA, que es donde tiene que
    // quedar el libro, y el tomo se mueve en fracciones del stage, que es donde
    // vive. Antes los dos sitios eran el mismo punto porque el stage estaba
    // centrado; desde que el pasillo encuadra por la estantería ya no lo está, y
    // sin esta conversión el tomo se iba hacia un lado y se salía de la pantalla.
    // Ver `framed-stage` en `styles/_stage.scss`.
    //
    // La ventana es la caja del pasillo y no `window`: es la que mide `--vh`, así
    // que en un móvil no cambia cuando aparece o desaparece la barra de URL.
    const viewRect = (stageEl.parentElement ?? stageEl).getBoundingClientRect()
    const focusX =
      (viewRect.left + pull.focusX * viewRect.width - stageRect.left) / stageRect.width
    const focusY =
      (viewRect.top + pull.focusY * viewRect.height - stageRect.top) / stageRect.height

    // En la pose adelantada el tomo queda centrado, así que `focusY` es su centro
    // y hay que bajar hasta su base, que es por donde está anclado.
    const focusBaseY = focusY + pull.focusHeight / 2
    // El tomo mide de base lo que mide adelantado, así que aquí no hay que
    // agrandarlo: la escala 1 ES la pose de delante, y la balda es la que
    // encoge. Ver el comentario del alto en ShelfVolume.scss — está montado así
    // para que la caja 3D se rasterice a tamaño grande y no llegue pixelada.
    const forward = {
      x: (focusX - volume.x) * stageRect.width,
      y: (focusBaseY - volume.baseY) * stageRect.height,
      scale: 1,
    }
    const atShelf = { x: 0, y: 0, scale: volume.height / pull.focusHeight }

    // Con la portada de cara, lo que se ve ya no es el lomo sino la tapa, que
    // cuelga hacia la izquierda. Como el tomo está anclado por el lomo, sin
    // corregir esto quedaría escorado media tapa a un lado en vez de centrado.
    //
    // El seno es lo que descuenta el escorzo: cuanto más se pasa de 90 grados,
    // menos ancha se ve la tapa y menos hay que compensar. Sale del ángulo y no
    // de un número a mano, así que mover `coverDeg` no descentra nada.
    //
    // Se centra por la anchura de la tapa PINTADA y no por la plana: en esa pose
    // lo que se acaba viendo es la pintada, que incluye el bloque de hojas, y
    // centrar por la plana la dejaría escorada ese grosor hacia un lado.
    const coverWidth = shape.coverRatio * pull.focusHeight * stageRect.height
    const turnedWidth = shape.coverTurnedRatio * pull.focusHeight * stageRect.height
    const centreCover = (turnedWidth / 2) * Math.sin((turn.coverDeg * Math.PI) / 180)

    // A media vuelta el canto se queda a un ancho de tapa de la cámara, y la
    // perspectiva lo agranda. Se descuenta aquí para que el alto pedido en la
    // config sea el que de verdad se ve. No depende de la escala del tomo: la
    // fuga se calcula dentro de la caja, en sus propias unidades.
    const perspectiveGain = turn.perspectivePx / (turn.perspectivePx - coverWidth)

    // De canto el tomo se centra en `focusY` en vez de posarse por la base: así
    // no se apoya en nada, y lo que tiene que quedar quieto es su centro.
    // Lateralmente va sin corregir, porque a media vuelta el canto cae justo
    // sobre el eje del lomo, que es por donde el tomo está anclado.
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
      // Al abrirse el tomo no se mueve: se queda de canto donde estaba y el
      // libro pintado entra justo encima, fundiéndose con él. Al cerrarse
      // tampoco: espera en la misma pose a que el libro se pliegue y reaparece
      // ahí mismo, así que el sitio donde vuelve es el sitio del que salió.
      open: onEdge,
      closing: onEdge,
    }[stage]

    // El primer render coloca sin animar: el tomo ya nace en la balda y animar
    // hasta donde ya está sería un tirón al cargar la pantalla. Lo mismo con
    // «reducir movimiento», donde el cambio de pose es instantáneo.
    const jump =
      isFirstRender.current || prefersReducedMotion()
    isFirstRender.current = false

    // Con el libro abierto el tomo en 3D sobra: lo que se ve entonces es el
    // libro pintado, y dejarlo debajo asomaría por los lados, que son más
    // estrechos que los del libro ya abierto.
    const visible = stage === 'open' ? 0 : 1

    // Al cerrarse, el tomo vuelve — pero no de golpe al empezar. Espera a que la
    // apertura se haya deshecho casi entera y entra cruzándose con el ÚLTIMO
    // fotograma que queda, que es el espejo exacto de cómo se fue: allí salió
    // cruzándose con el primero.
    const fadeDelay =
      stage === 'closing' ? (OPENING_FRAMES.length - 1) * OPENING.frameSeconds : 0

    // La tapa pintada se enciende en la pose de portada y sigue encendida al
    // pasar al canto. No se apaga al salir: es el propio giro quien la esconde,
    // porque va dentro de la cara de la portada y se escorza con ella hasta
    // desaparecer sola al llegar de lado.
    //
    // Apagarla al pulsar destapaba la tapa plana justo cuando el tomo todavía
    // está de frente, y ese medio giro con la tapa sin bloque de hojas se leía
    // como si el libro volviera atrás antes de abrirse.
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
      // El apagado va con la duración del primer fotograma de la apertura y no
      // con la del giro: los dos fundidos se cruzan, y así el relevo entre el
      // objeto que gira y el libro pintado no se ve como un corte.
      gsap.to(root, {
        autoAlpha: visible,
        duration: OPENING.frameSeconds,
        ease: OPENING.ease,
        delay: fadeDelay,
      }),
      // El relevo de la tapa. Al encenderse espera a que el giro esté casi
      // hecho, así que se lee como el libro acabando de girar; al apagarse va
      // deprisa y sin espera, porque el tomo ya se está yendo a otra pose.
      gsap.to(turned, {
        opacity: showTurned ? 1 : 0,
        duration: showTurned ? coverArt.durationSeconds : coverArt.hideSeconds,
        delay: showTurned ? coverArt.delaySeconds : 0,
        ease: coverArt.ease,
      }),
      // `transformPerspective` en vez de la propiedad `perspective` del padre:
      // así la fuga es del propio tomo y no se deforma cuando el contenedor se
      // escala para acercarlo.
      gsap.to(box, {
        rotationY: pose.rotationY,
        transformPerspective: turn.perspectivePx,
        ...common,
      }),
    ]

    return () => tweens.forEach((tween) => tween.kill())
  }, [rootRef, boxRef, turnedRef, volume, stage])
}
