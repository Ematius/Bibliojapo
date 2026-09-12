import gsap from 'gsap'
import { NAV_MENU as menu } from './siteNavConfig'

// El panel no se desmonta al cerrarse: `autoAlpha` lo deja en `visibility: hidden`, que ya
// lo saca del tabulador, y desmontándolo no habría animación de cierre que ver.
export function buildSiteNavMenuReveal(panel: HTMLElement): gsap.core.Tween {
  return gsap.fromTo(
    panel,
    {
      autoAlpha: 0,
      clipPath: 'inset(0 0 100% 0)',
      y: `${menu.fromOffsetRem}rem`,
    },
    {
      autoAlpha: 1,
      clipPath: 'inset(0 0 0% 0)',
      y: 0,
      duration: menu.showSeconds,
      ease: menu.showEase,
      // El recorte residual comería el contorno de foco del último enlace.
      clearProps: 'clipPath',
    },
  )
}

export function buildSiteNavMenuHide(panel: HTMLElement): gsap.core.Tween {
  return gsap.to(panel, {
    autoAlpha: 0,
    clipPath: 'inset(0 0 100% 0)',
    y: `${menu.fromOffsetRem}rem`,
    duration: menu.hideSeconds,
    ease: menu.hideEase,
  })
}
