import { useLayoutEffect, type RefObject } from 'react'
import gsap from 'gsap'
import { NAV_INTRO as intro } from './siteNavConfig'
import { prefersReducedMotion } from './prefersReducedMotion'

// Despliegue de la barra al entrar en una pantalla.
//
// `clipPath` con un inset que se abre de derecha a izquierda: la barra empieza
// recortada a cero por su borde izquierdo y va destapándose hasta ocupar su
// ancho. El contenido no se deforma en ningún momento, que es lo que pasaría
// animando `scaleX`.
export function useSiteNavIntro(navRef: RefObject<HTMLElement | null>): void {
  useLayoutEffect(() => {
    const nav = navRef.current
    if (!nav) return

    // Con «reducir movimiento» la barra aparece ya montada, sin despliegue.
    if (prefersReducedMotion()) return

    const ctx = gsap.context(() => {
      gsap.fromTo(
        nav,
        {
          clipPath: 'inset(0 100% 0 0)',
          x: `${intro.fromOffsetRem}rem`,
          opacity: 0,
        },
        {
          clipPath: 'inset(0 0% 0 0)',
          x: 0,
          opacity: 1,
          duration: intro.durationSeconds,
          ease: intro.ease,
          // Se limpian las propiedades al terminar: el clip-path residual
          // recortaría el contorno de foco de los enlaces, y la barra ya no
          // necesita ningún transform una vez colocada.
          clearProps: 'clipPath,transform,opacity',
        },
      )
    }, nav)

    return () => ctx.revert()
  }, [navRef])
}
