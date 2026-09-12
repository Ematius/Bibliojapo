import { useLayoutEffect, type RefObject } from 'react'
import gsap from 'gsap'
import { PATH_WALK_LOOP as loop } from './pathWalkerConfig'
import { prefersReducedMotion } from '../shared/prefersReducedMotion'

// El movimiento no se anima como posición sino como progreso: la timeline lleva
// `--walk` de 0 a 1 y es el CSS quien lo traduce en avance, perspectiva y anclaje. Así
// el recorrido sigue en fracciones de la ilustración y se recoloca solo al cambiar de
// tamaño, sin escuchar el resize.
export function usePathWalkerLoop(groupRef: RefObject<HTMLElement | null>): void {
  useLayoutEffect(() => {
    const group = groupRef.current
    if (!group) return

    // Quieta al pie del sendero con «reducir movimiento»: el CSS ya la deja ahí.
    if (prefersReducedMotion()) return

    const ctx = gsap.context(() => {
      // Antes del primer pintado: dentro de la timeline se vería un fotograma de la
      // figura ya colocada.
      gsap.set(group, { autoAlpha: 0 })

      // `repeatDelay` es la pausa entre vueltas, con la figura ya invisible. Sin ella el
      // reinicio se lee como un salto hacia atrás.
      const walk = gsap.timeline({ repeat: -1, repeatDelay: loop.holdSeconds })

      // Las tres pistas arrancan a la vez y se solapan a propósito: aparece mientras ya
      // anda, y se desvanece sin dejar de andar.
      walk
        .to(group, { '--walk': 1, duration: loop.travelSeconds, ease: 'none' }, 0)
        .to(group, { autoAlpha: 1, duration: loop.fadeSeconds, ease: 'none' }, 0)
        .to(
          group,
          { autoAlpha: 0, duration: loop.fadeSeconds, ease: 'none' },
          loop.travelSeconds - loop.fadeSeconds,
        )

      // El bamboleo va en su propio tween: su ciclo es el de la zancada, mucho más corto
      // que el del paseo, y no debe reiniciarse cada vuelta.
      gsap.to(group, {
        '--walk-bob': -loop.bobPx,
        duration: loop.stepSeconds / 2,
        ease: 'sine.inOut',
        repeat: -1,
        yoyo: true,
      })
    }, group)

    return () => ctx.revert()
  }, [groupRef])
}
