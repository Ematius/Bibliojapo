import { useEffect, useLayoutEffect, useRef, type ReactNode } from 'react'
import gsap from 'gsap'
import { OPENING, OPENING_FRAMES, type OpenBookLayout } from './openingConfig'
import './VolumeOpening.scss'

interface VolumeOpeningProps {
  layout: OpenBookLayout
  // Al ponerse a true el libro se pliega: la misma apertura reproducida hacia
  // atrás. No es una animación aparte — es literalmente la de abrir al revés,
  // así que las dos no pueden desincronizarse.
  closing: boolean
  // Se llama cuando el último fotograma está del todo visible, que es cuando el
  // libro ya está abierto y se le puede meter contenido.
  onOpened: () => void
  // Se llama cuando el libro ha terminado de cerrarse y ya no queda nada suyo
  // en pantalla. A partir de ahí el tomo vuelve solo a la balda.
  onClosed: () => void
  // Lo que va dentro del hueco de papel. Llega como children y no como un
  // componente fijo para que el libro no tenga que saber qué se lee dentro de
  // él: aquí solo se sabe dónde cae el papel.
  children?: ReactNode
}

// El tomo abriéndose.
//
// Los cuatro fotogramas van apilados y se encienden por orden. Como cada uno se
// pinta encima del anterior, basta con subirle la opacidad para que tape al que
// venía: no hay que apagar ninguno, y en cada momento hay como mucho dos capas
// mezclándose, que es lo que hace que la apertura se lea continua y no a saltos.
//
// El primero también entra con fundido, y no encendido de golpe: por debajo está
// todavía el tomo en 3D con la portada de cara, así que ese primer fundido es el
// relevo entre el objeto que gira y el libro pintado.
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

  // Los avisos se guardan en refs para que cambiarlos no vuelva a lanzar la
  // apertura: la animación depende de las medidas, no de quién escucha.
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

    // El papel entra y sale con el ÚLTIMO fotograma, no por su cuenta: las hojas
    // del lector pertenecen al libro del todo abierto. Sin esto, al cerrarse se
    // quedarían enteras flotando mientras el libro se pliega debajo.
    gsap.set([...frames, paper], { opacity: 0 })

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      gsap.set([frames[frames.length - 1], paper], { opacity: 1 })
      onOpenedRef.current()
      return
    }

    const timeline = gsap.timeline({
      onComplete: () => onOpenedRef.current(),
      // Se dispara al llegar la reproducción hacia atrás al principio, o sea
      // cuando el libro ya está cerrado del todo.
      onReverseComplete: () => onClosedRef.current(),
    })
    const paso = { duration: OPENING.frameSeconds, ease: OPENING.ease }

    frames.forEach((frame, i) => {
      timeline.to(frame, { opacity: 1, ...paso })
      // `'<'` lo pega al arranque del tramo anterior, así que el papel y el
      // último fotograma van a la vez en los dos sentidos.
      if (i === frames.length - 1) timeline.to(paper, { opacity: 1, ...paso }, '<')
    })

    timelineRef.current = timeline

    return () => {
      timeline.kill()
      timelineRef.current = null
    }
  }, [])

  // El cierre no monta nada nuevo: rebobina lo que ya se reprodujo. Por eso no
  // hay dos animaciones que mantener a la par — hay una sola, en dos sentidos.
  useEffect(() => {
    if (!closing) return

    // Con «reducir movimiento» no llegó a construirse línea de tiempo alguna, así
    // que no hay nada que rebobinar: se avisa y listo.
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
