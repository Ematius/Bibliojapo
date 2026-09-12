import { useLayoutEffect, useRef, type RefObject } from 'react'
import gsap from 'gsap'
import { prefersReducedMotion } from '../shared/prefersReducedMotion'
import { DESK_LIFT, type DeskSpot } from './deskSpots'

// El objeto levantándose de la mesa: se despega, crece y se planta enfrente, cambiando de
// cara por el camino.
//
// Uno para los tres: lo que cambia entre el carné, la hoja y la caja son sus dibujos, no el
// viaje. El hook recibe el sitio de partida y nada más.
//
// La escena se mide al arrancar cada viaje y no al montar —entre una cosa y otra la ventana
// ha podido cambiar—: el sitio y el destino van en fracciones del dibujo y un `transform` va
// en píxeles.
//
// Se anima el transform y no `left`/`top` porque animar la colocación recalcula el diseño de
// la página en cada fotograma.
interface DeskLiftOptions {
  // El botón entero: es lo que viaja.
  rootRef: RefObject<HTMLElement | null>
  // La cara de frente, encima de la de reposo. Si el objeto no tiene segunda, no se usa.
  frontRef: RefObject<HTMLElement | null>
  // Los fotogramas de apertura, si el objeto se abre. En orden y todos apagados de salida.
  framesRef: RefObject<(HTMLElement | null)[]>
  // La cara de reposo, que se apaga en cuanto hay un fotograma encendido: la silueta cerrada
  // asoma por debajo de la abierta.
  restingRef: RefObject<HTMLElement | null>
  spot: DeskSpot
  lifted: boolean
}

export function useDeskLift({
  rootRef,
  frontRef,
  framesRef,
  restingRef,
  spot,
  lifted,
}: DeskLiftOptions): void {
  const isFirstRender = useRef(true)

  // El anclaje se escribe una vez, al montar: reproduce con xPercent/yPercent lo que el CSS
  // hace con `translate(-50%, -100%)`. En cuanto GSAP toque `x` o `scale` reescribirá el
  // transform entero, y sin esto el objeto daría un salto al arrancar. Misma cautela que
  // `useVolumePull`.
  useLayoutEffect(() => {
    const root = rootRef.current
    if (!root) return

    gsap.set(root, { xPercent: -50, yPercent: -100, transformOrigin: '50% 100%' })
  }, [rootRef])

  useLayoutEffect(() => {
    const root = rootRef.current
    if (!root) return

    const front = frontRef.current
    const frames = framesRef.current.filter((frame): frame is HTMLElement => Boolean(frame))
    // El padre colocado es el stage, que es contra quien están medidas las fracciones.
    const stage = root.offsetParent as HTMLElement | null
    if (!stage) return

    const stageWidth = stage.clientWidth
    const stageHeight = stage.clientHeight

    const scale = DESK_LIFT.frontWidth / spot.width
    // La `y` lleva el alto sumado porque el objeto está anclado por su base: sin eso se
    // plantaría con el borde de abajo en el punto de destino, no con su centro.
    const liftedHeight = root.offsetHeight * scale
    const x = (DESK_LIFT.frontX - spot.x) * stageWidth
    const y = (DESK_LIFT.frontY - spot.baseY) * stageHeight + liftedHeight / 2

    const to = lifted ? { x, y, scale } : { x: 0, y: 0, scale: 1 }
    const faceTo = lifted ? 1 : 0

    // Al montar se coloca sin viaje: si no, un objeto que aparece ya levantado —al volver a la
    // pantalla— haría el recorrido entero solo.
    // Un fotograma a la vez, y con la cara de reposo apagada mientras dure. Con -1 no se ve
    // ninguno y vuelve a mandar ella.
    const showFrame = (index: number) => {
      frames.forEach((frame, i) => gsap.set(frame, { opacity: i === index ? 1 : 0 }))
      if (restingRef.current && frames.length > 0) {
        gsap.set(restingRef.current, { opacity: index < 0 ? 1 : 0 })
      }
    }

    if (isFirstRender.current || prefersReducedMotion()) {
      isFirstRender.current = false
      gsap.set(root, { ...to, zIndex: lifted ? DESK_LIFT.frontLayer : 0 })
      if (front) gsap.set(front, { opacity: faceTo })
      showFrame(lifted ? frames.length - 1 : -1)
      return
    }

    // Sube de capa ANTES de arrancar y en los dos sentidos: bajándola al pulsar, el objeto se
    // metería detrás de sus vecinos a mitad del viaje de vuelta, que es cuando más se ve.
    //
    // El que vuelve se queda un escalón por debajo del que sale: con la misma capa mandaría el
    // orden del DOM en vez del gesto que se acaba de hacer.
    gsap.set(root, { zIndex: lifted ? DESK_LIFT.frontLayer : DESK_LIFT.frontLayer - 1 })

    const timeline = gsap.timeline({
      onComplete: () => {
        if (!lifted) gsap.set(root, { zIndex: 0 })
      },
    })

    timeline.to(root, {
      ...to,
      duration: DESK_LIFT.seconds,
      ease: DESK_LIFT.ease,
    })

    // El fundido entre las dos caras va a la vez que el viaje: es el movimiento el que
    // disimula que los dos dibujos no son el mismo —uno en escorzo y otro plano, y ni siquiera
    // con la misma proporción—. Parado, el cambio cantaría.
    if (front) {
      timeline.to(front, { opacity: faceTo, duration: DESK_LIFT.seconds, ease: 'none' }, 0)
    }

    // Los fotogramas van DESPUÉS del viaje y a corte seco, como un cuaderno de dibujos: con
    // fundido se verían dos poses de la tapa a la vez y parecería un fantasma.
    if (frames.length > 0) {
      const step = DESK_LIFT.openSeconds / frames.length
      // Se abre al llegar y se cierra mientras vuelve, que es el orden en que lo haría una
      // mano: nadie devuelve una caja abierta a la mesa para cerrarla allí.
      const startAt = lifted ? DESK_LIFT.seconds : 0
      const order = lifted ? frames.map((_, i) => i) : frames.map((_, i) => frames.length - 2 - i)

      order.forEach((index, turn) => {
        timeline.call(() => showFrame(index), [], startAt + turn * step)
      })
    }

    return () => {
      timeline.kill()
    }
  }, [rootRef, frontRef, framesRef, restingRef, spot, lifted])
}
