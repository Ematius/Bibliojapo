import gsap from 'gsap'
import { VOLUME_LOCK as lock, VOLUME_TURN as turn } from './shelfConfig'
import { prefersReducedMotion } from '../../shared/prefersReducedMotion'

// El tirón de un tomo que no sale. Mueve la CAJA, igual que el giro de `useVolumePull`, y
// parte y acaba en la misma inclinación de reposo.
//
// Devuelve cómo pararlo: si se pulsa otra vez a medio tirón, el siguiente arranca desde
// donde vaya el anterior en vez de sumarse a él.
export function nudgeVolume(box: HTMLElement): () => void {
  // Con «reducir movimiento» el tomo no se mueve: la nota ya dice lo que hace falta.
  if (prefersReducedMotion()) return () => undefined

  const timeline = gsap
    .timeline()
    .to(box, {
      rotationY: turn.restDeg - lock.nudgeDeg,
      duration: lock.nudgeSeconds,
      ease: 'power2.out',
    })
    .to(box, {
      rotationY: turn.restDeg,
      duration: lock.settleSeconds,
      ease: lock.settleEase,
    })

  return () => {
    timeline.kill()
  }
}
