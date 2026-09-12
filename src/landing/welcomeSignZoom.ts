import gsap from 'gsap'

const SIGN_ZOOM = {
  fill: 0.94,
  showEase: 'power2.out',
  hideEase: 'power2.in',
} as const

// La duración la pone quien llama: es la del barrido de la cuadrícula, y las dos cosas
// tienen que terminar a la vez.
export function zoomWelcomeSign(
  sign: HTMLElement,
  { open, duration }: { open: boolean; duration: number },
): gsap.core.Tween | null {
  if (!open) {
    // Cerrar lo que nunca creció escribiría un transform de identidad, y un transform
    // deja al cartel en un contexto de apilamiento propio.
    const isZoomed =
      gsap.getProperty(sign, 'scale') !== 1 ||
      gsap.getProperty(sign, 'x') !== 0 ||
      gsap.getProperty(sign, 'y') !== 0
    if (!isZoomed) return null

    return gsap.to(sign, {
      x: 0,
      y: 0,
      scale: 1,
      duration,
      ease: SIGN_ZOOM.hideEase,
      clearProps: 'transform',
    })
  }

  // El rectángulo ya lleva dentro cualquier transform: llamar aquí con el cartel a medio
  // crecer daría una escala calculada sobre otra escala.
  const rect = sign.getBoundingClientRect()
  if (rect.width < 1 || rect.height < 1) return null

  // No vale `vw`: cuenta los 15 px que `html` reserva para la barra de scroll, y el
  // cartel quedaría descentrado hacia la derecha.
  const viewportWidth = document.documentElement.clientWidth
  const viewportHeight = document.documentElement.clientHeight

  const scale = Math.min(
    (viewportWidth * SIGN_ZOOM.fill) / rect.width,
    (viewportHeight * SIGN_ZOOM.fill) / rect.height,
  )

  // Nunca encoge: sin esta salida, en un escritorio ancho el cartel se haría MÁS PEQUEÑO
  // al abrirlo.
  if (scale <= 1) return null

  return gsap.to(sign, {
    x: viewportWidth / 2 - (rect.left + rect.width / 2),
    y: viewportHeight / 2 - (rect.top + rect.height / 2),
    scale,
    duration,
    ease: SIGN_ZOOM.showEase,
  })
}
