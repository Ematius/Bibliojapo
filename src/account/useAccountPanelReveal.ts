import { useLayoutEffect, type RefObject } from 'react'
import gsap from 'gsap'
import { ACCOUNT_REVEAL as reveal } from './accountConfig'
import { prefersReducedMotion } from '../shared/prefersReducedMotion'

interface AccountPanelRevealOptions {
  // El panel entero: el velo y lo que va encima.
  rootRef: RefObject<HTMLElement | null>
  // La tarjeta, que sube sobre el velo.
  cardRef: RefObject<HTMLElement | null>
  open: boolean
  // Se llama cuando el panel ha terminado de irse y ya se puede desmontar.
  onHidden: () => void
}

// El panel apareciendo y yéndose. Ver `ACCOUNT_REVEAL`.
//
// Al cerrarse no se desmonta de golpe: primero se va, y AL TERMINAR avisa. Quien
// lo monta espera a ese aviso para quitarlo, o la salida no llegaría a verse.
export function useAccountPanelReveal({
  rootRef,
  cardRef,
  open,
  onHidden,
}: AccountPanelRevealOptions): void {
  useLayoutEffect(() => {
    const root = rootRef.current
    const card = cardRef.current
    if (!root || !card) return

    // Con «reducir movimiento» el panel está o no está, sin tránsito.
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
            reveal.cardDelaySeconds,
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
