import { useLayoutEffect, useRef, type RefObject } from 'react'
import gsap from 'gsap'
import { prefersReducedMotion } from '../../shared/prefersReducedMotion'
import { DESK_LIFT } from '../deskSpots'

interface CheatSheetRevealOptions {
  // La cara de delante: de aquí salen las palabras que se escriben solas al llegar.
  frontRef: RefObject<HTMLElement | null>
  // La tarjeta entera, la que gira.
  cardRef: RefObject<HTMLElement | null>
  flipped: boolean
  // Si la hoja está levantada. El polvo cae la PRIMERA VEZ que esto se vuelve verdad, no al
  // montar: la chuleta se elige con la hoja ya en la mesa, antes de levantarla, y si el polvo
  // cayera al montar se acabaría de escribir mientras la hoja sigue plana y sin verse. Ver
  // `useDeskLift.ts`.
  lifted: boolean
}

// Parte un nodo de texto en letras sueltas para poder animarlas de una en una. Se hace en JS
// y no a mano en el JSX: una chuleta entera son varias decenas de caracteres, y escribirlos
// como spans sueltos ensuciaría el marcado para siempre a cambio de una animación que ocurre
// una sola vez.
function splitIntoChars(element: HTMLElement): HTMLElement[] {
  const text = element.textContent ?? ''
  const chars = [...text].map((character) => {
    const span = document.createElement('span')
    span.className = 'cheat-sheet-card__dust-char'
    // El espacio en blanco se colapsaría al meterlo en un `inline-block` propio.
    span.textContent = character === ' ' ? ' ' : character
    return span
  })

  element.replaceChildren(...chars)
  return chars
}

// La chuleta apareciendo, como si el texto cayese hecho de polvo dorado y se posase en su
// sitio, y la tarjeta volteándose para enseñar la traducción. Es la misma pareja de gestos
// que el regalo del examen final —ver `giftOpening.ts`—, pero escrita para React normal y no
// para una hoja clonada por page-flip: aquí SÍ hay un componente vivo y refs de verdad, así
// que no hace falta buscar los nodos a mano ni cablear el clic por fuera de React.
export function useCheatSheetReveal({ frontRef, cardRef, flipped, lifted }: CheatSheetRevealOptions): void {
  const written = useRef(false)

  // El polvo cae UNA sola vez, la primera vez que se levanta la hoja con esta chuleta ya
  // elegida: si corriera cada vez que `lifted` vuelve a ser verdad, el texto se escribiría
  // otra vez encima de sí mismo.
  useLayoutEffect(() => {
    if (!lifted || written.current) return
    const front = frontRef.current
    if (!front) return
    written.current = true

    const dustEls = [...front.querySelectorAll<HTMLElement>('[data-dust]')]
    const chars = dustEls.flatMap(splitIntoChars)
    const trimmings = [...front.querySelectorAll<HTMLElement>('[data-dust-trim]')]

    if (prefersReducedMotion()) {
      gsap.set(chars, { opacity: 1 })
      return
    }

    const ink = getComputedStyle(front).color
    const glow = getComputedStyle(document.documentElement)
      .getPropertyValue('--color-brass-glow')
      .trim()

    gsap.set(trimmings, { opacity: 0 })

    // Empieza cuando el objeto ya ha llegado enfrente: antes de eso la cara sigue apagada por
    // CSS, y sin esta espera la chuleta terminaría de escribirse detrás de un velo invisible.
    const arrival = DESK_LIFT.seconds

    // El polvo cae SOBRE la letra: entra desde arriba, dorado y más grande, y se posa en su
    // sitio ya con el color de la tinta.
    gsap.fromTo(
      chars,
      { opacity: 0, y: -10, scale: 1.7, color: glow },
      {
        opacity: 1,
        y: 0,
        scale: 1,
        color: ink,
        duration: 0.5,
        ease: 'power2.out',
        delay: arrival,
        // Ciento y pico caracteres: con el retardo más largo la chuleta tarda varios
        // segundos en acabar de escribirse, y para entonces ya nadie la está mirando.
        stagger: { each: 0.012 },
      },
    )

    gsap.to(trimmings, { opacity: 1, duration: 0.4, delay: arrival, stagger: 0.04 })
  }, [frontRef, lifted])

  // La vuelta de la chuleta: delante el japonés con su sonido, detrás la lectura y el
  // significado.
  useLayoutEffect(() => {
    const card = cardRef.current
    if (!card) return

    gsap.to(card, {
      rotateY: flipped ? 180 : 0,
      duration: prefersReducedMotion() ? 0 : 0.7,
      ease: 'power2.inOut',
    })
  }, [cardRef, flipped])
}
