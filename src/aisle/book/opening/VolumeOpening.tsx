import { useEffect, useLayoutEffect, useRef, type ReactNode } from 'react'
import gsap from 'gsap'
import { OPENING, OPENING_FRAMES, type OpenBookLayout } from './openingConfig'
import { prefersReducedMotion } from '../../../shared/prefersReducedMotion'
import './VolumeOpening.scss'

interface VolumeOpeningProps {
  layout: OpenBookLayout
  // El libro se pliega con la MISMA apertura reproducida hacia atrás, así que las dos no
  // pueden desincronizarse.
  closing: boolean
  // Cuando el último fotograma está del todo visible y se le puede meter contenido.
  onOpened: () => void
  // Cuando ya no queda nada suyo en pantalla. A partir de ahí el tomo vuelve a la balda.
  onClosed: () => void
  // Llega como children para que el libro no tenga que saber qué se lee dentro de él: aquí
  // solo se sabe dónde cae el papel.
  children?: ReactNode
}

// Los cinco fotogramas van apilados y se encienden por orden. En cada momento hay como
// mucho dos capas mezclándose, que es lo que hace que la apertura se lea continua.
//
// El primero también entra con fundido: por debajo está todavía el tomo en 3D con la
// portada de cara, así que ese primer fundido es el relevo entre uno y otro.
export function VolumeOpening({
  layout,
  closing,
  onOpened,
  onClosed,
  children,
}: VolumeOpeningProps) {
  const rootRef = useRef<HTMLDivElement>(null)
  const timelineRef = useRef<gsap.core.Timeline | null>(null)
  const onOpenedRef = useRef(onOpened)
  const onClosedRef = useRef(onClosed)

  // Los avisos van en refs para que cambiarlos no vuelva a lanzar la apertura: la animación
  // depende de las medidas, no de quién escucha.
  useEffect(() => {
    onOpenedRef.current = onOpened
    onClosedRef.current = onClosed
  }, [onOpened, onClosed])

  useLayoutEffect(() => {
    const root = rootRef.current
    if (!root) return

    const frames = [...root.querySelectorAll<HTMLElement>('.volume-opening__frame')]
    const paper = root.querySelector<HTMLElement>('.volume-opening__paper')
    if (frames.length === 0 || !paper) return

    // El papel entra y sale con el ÚLTIMO fotograma: sin esto, al cerrarse las hojas se
    // quedarían flotando mientras el libro se pliega debajo.
    gsap.set([...frames, paper], { opacity: 0 })

    if (prefersReducedMotion()) {
      gsap.set([frames[frames.length - 1], paper], { opacity: 1 })
      onOpenedRef.current()
      return
    }

    const timeline = gsap.timeline({
      onComplete: () => onOpenedRef.current(),
      // Al llegar la reproducción hacia atrás al principio: el libro ya está cerrado.
      onReverseComplete: () => onClosedRef.current(),
    })
    const paso = { duration: OPENING.frameSeconds, ease: OPENING.ease }

    frames.forEach((frame, i) => {
      timeline.to(frame, { opacity: 1, ...paso })

      // El anterior se apaga de golpe en cuanto este está entero. Un fotograma no tapa al
      // anterior por ser más grande, sino allí donde tiene dibujo, y en los primeros las
      // tapas están más levantadas: sus esquinas asomaban por detrás del libro ya abierto
      // como el pico de un segundo libro.
      //
      // Sin fundido y solo al 100 %: durante el cruce el de abajo sigue opaco, que es lo que
      // evita que se transparente el pasillo por medio de la apertura.
      if (i > 0) timeline.set(frames[i - 1], { opacity: 0 })

      // `'<'` lo pega al arranque del tramo anterior, así que el papel y el último fotograma
      // van a la vez en los dos sentidos.
      if (i === frames.length - 1) timeline.to(paper, { opacity: 1, ...paso }, '<')
    })

    timelineRef.current = timeline

    return () => {
      timeline.kill()
      timelineRef.current = null
    }
  }, [])

  // El cierre no monta nada nuevo: rebobina lo que ya se reprodujo. No hay dos animaciones
  // que mantener a la par.
  useEffect(() => {
    if (!closing) return

    // Con «reducir movimiento» no llegó a construirse timeline: no hay nada que rebobinar.
    if (!timelineRef.current) {
      onClosedRef.current()
      return
    }

    timelineRef.current.reverse()
  }, [closing])

  return (
    <div
      className="volume-opening"
      style={{ width: layout.width, height: layout.height }}
      ref={rootRef}
      // El dedo sobre el libro pasa página; el pasillo de detrás no se mueve. Ver
      // `useScenePan`.
      data-no-pan
    >
      {OPENING_FRAMES.map((src) => (
        <img className="volume-opening__frame" src={src} alt="" draggable="false" key={src} />
      ))}

      <div
        className="volume-opening__paper"
        style={{
          left: layout.paper.left,
          top: layout.paper.top,
          width: layout.paper.width,
          height: layout.paper.height,
        }}
      >
        {children}
      </div>
    </div>
  )
}
