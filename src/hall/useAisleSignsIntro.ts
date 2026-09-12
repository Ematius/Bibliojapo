import { useLayoutEffect, type RefObject } from 'react'
import gsap from 'gsap'
import { AISLE_SIGNS_INTRO as intro } from './aisleSignsConfig'
import { prefersReducedMotion } from '../shared/prefersReducedMotion'

// Dos tramos encadenados: el cartel cae y en cuanto llega arranca el balanceo. El
// balanceo empieza un poco ANTES de que acabe la caída —el solape negativo de la
// posición— para que no se vea un cartel parado entre las dos fases.
export function useAisleSignsIntro(groupRef: RefObject<HTMLElement | null>): void {
  useLayoutEffect(() => {
    const group = groupRef.current
    if (!group) return

    // Con «reducir movimiento» los carteles ya están colgados y quietos.
    if (prefersReducedMotion()) return

    const ctx = gsap.context(() => {
      const signs = gsap.utils.toArray<HTMLElement>('.aisle-signs__sign')
      if (signs.length === 0) return

      const tl = gsap.timeline()

      tl.from(signs, {
        yPercent: intro.fromYPercent,
        opacity: 0,
        duration: intro.fallSeconds,
        ease: intro.fallEase,
        stagger: intro.staggerSeconds,
      })

      tl.fromTo(
        signs,
        { rotation: intro.swayFromDeg },
        {
          rotation: 0,
          duration: intro.swaySeconds,
          ease: intro.swayEase,
          stagger: intro.staggerSeconds,
          // Sin rastro de transform al acabar: el balanceo de hover es una animación CSS
          // sobre `rotate`, y un transform inline residual le dejaría un salto.
          clearProps: 'transform',
        },
        `<${intro.fallSeconds * 0.85}`,
      )
    }, group)

    return () => ctx.revert()
  }, [groupRef])
}
