import { useLayoutEffect, type RefObject } from 'react'
import gsap from 'gsap'
import { PATH_WALK_LOOP as loop } from './pathWalkerConfig'
import { prefersReducedMotion } from '../shared/prefersReducedMotion'

// Paseo en bucle de la figura por el sendero, hacia la biblioteca.
//
// El movimiento no se anima como posición sino como progreso: la timeline solo
// lleva `--walk` de 0 a 1 y es el CSS quien traduce ese número en avance,
// perspectiva y anclaje. Así el recorrido sigue expresado en fracciones de la
// ventana y se recoloca solo al cambiar de tamaño, sin escuchar el resize ni
// recalcular píxeles a mano.
export function usePathWalkerLoop(groupRef: RefObject<HTMLElement | null>): void {
  useLayoutEffect(() => {
    const group = groupRef.current
    if (!group) return

    // Con «reducir movimiento» la figura se queda quieta al pie del sendero: se
    // sigue viendo y se puede pulsar, pero no camina. El CSS ya la deja ahí
    // —`--walk` vale 0 y la opacidad es la de por defecto—, así que basta con no
    // arrancar nada.
    if (prefersReducedMotion()) return

    const ctx = gsap.context(() => {
      // Se oculta antes del primer pintado, no después: hacerlo dentro de la
      // timeline dejaría ver un fotograma de la figura ya colocada.
      gsap.set(group, { autoAlpha: 0 })

      // `repeatDelay` es la pausa entre vuelta y vuelta, con la figura ya
      // invisible. Sin ella el reinicio se leería como un salto hacia atrás en
      // vez de como otra persona que enfila el camino.
      const walk = gsap.timeline({ repeat: -1, repeatDelay: loop.holdSeconds })

      // Las tres pistas arrancan en el mismo instante 0 y se solapan a
      // propósito: aparece mientras ya anda, y se desvanece sin dejar de andar.
      // Un avance con paradas al principio y al final se leería como tres actos
      // en vez de como alguien cruzando el plano.
      walk
        .to(group, { '--walk': 1, duration: loop.travelSeconds, ease: 'none' }, 0)
        .to(group, { autoAlpha: 1, duration: loop.fadeSeconds, ease: 'none' }, 0)
        .to(
          group,
          { autoAlpha: 0, duration: loop.fadeSeconds, ease: 'none' },
          loop.travelSeconds - loop.fadeSeconds,
        )

      // El bamboleo va en su propio tween y no en la timeline: su ciclo es el de
      // la zancada, mucho más corto que el del paseo, y no debe reiniciarse cada
      // vuelta. GSAP escribe las dos variables sobre el mismo elemento sin que
      // una pise a la otra, porque el transform lo compone el CSS.
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
