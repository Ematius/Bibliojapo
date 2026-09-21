import { useLayoutEffect, type RefObject } from 'react'
import gsap from 'gsap'
import { HALL_GUIDE_REVEAL as reveal } from './hallGuideConfig'
import { prefersReducedMotion } from '../shared/prefersReducedMotion'

interface HallGuideRevealOptions {
  rootRef: RefObject<HTMLElement | null>
  cardRef: RefObject<HTMLElement | null>
  open: boolean
  // Se llama cuando la ventana ha terminado de irse y ya se puede desmontar. Sin esperar a
  // este aviso, la salida no llegaría a verse.
  onHidden: () => void
}

export function useHallGuideReveal({ rootRef, cardRef, open, onHidden }: HallGuideRevealOptions): void {
  useLayoutEffect(() => {
    const root = rootRef.current
    const card = cardRef.current
    if (!root || !card) return

    if (prefersReducedMotion()) {
      if (open) gsap.set([root, card], { autoAlpha: 1, y: 0 })
      else onHidden()
      return
    }

    const timeline = open
      ? gsap
          .timeline()
          .fromTo(root, { autoAlpha: 0 }, { autoAlpha: 1, duration: reveal.inSeconds, ease: reveal.ease })
          .fromTo(
            card,
            { autoAlpha: 0, y: `${reveal.riseRem}rem` },
            { autoAlpha: 1, y: 0, duration: reveal.inSeconds, ease: reveal.ease },
            0.1,
          )
      : gsap
          .timeline({ onComplete: onHidden })
          .to(card, {
            autoAlpha: 0,
            y: `${reveal.riseRem / 2}rem`,
            duration: reveal.outSeconds,
            ease: reveal.easeOut,
          })
          .to(root, { autoAlpha: 0, duration: reveal.outSeconds, ease: reveal.easeOut }, 0)

    return () => {
      timeline.kill()
    }
  }, [rootRef, cardRef, open, onHidden])
}
