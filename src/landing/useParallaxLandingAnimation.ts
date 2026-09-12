import { useLayoutEffect, type RefObject } from 'react'
import gsap from 'gsap'
import { CAMERA_PAN, DROPS_RISE } from './parallaxLandingConfig'
import { prefersReducedMotion } from '../shared/prefersReducedMotion'

// Son bucles decorativos que no terminan nunca, así que cada capa lleva su propio
// tween: al no ser sus duraciones múltiplos entre sí, el conjunto tarda muchísimo en
// repetir la misma combinación. Compartiendo timeline se sincronizarían y el
// movimiento se leería como un vaivén mecánico.
export function useParallaxLandingAnimation(sceneRef: RefObject<HTMLDivElement | null>): void {
  useLayoutEffect(() => {
    const scene = sceneRef.current
    if (!scene) return

    // Quieta con «reducir movimiento». No hay nada que deshacer: el CSS ya deja cada
    // capa en su sitio y la animación solo añade el desplazamiento.
    if (prefersReducedMotion()) return

    // El contexto acota los selectores y revierte todos los tweens de golpe al desmontar.
    const ctx = gsap.context(() => {
      // Las cuatro capas en la misma timeline, todas desde el instante 0 y con la misma
      // duración y curva: eso es lo que se lee como una cámara, y lo único que distingue
      // un plano de otro es cuánto recorre. Repartir el tiempo entre capas las convierte
      // en objetos moviéndose cada uno por su lado.
      //
      // Ida y vuelta (`yoyo`) y no continuo: las imágenes no son repetibles en
      // horizontal. Y `xPercent` en vez de `x` para que el recorrido sea proporcional.
      const pan = gsap.timeline({
        repeat: -1,
        yoyo: true,
        defaults: {
          duration: CAMERA_PAN.durationSeconds,
          ease: CAMERA_PAN.ease,
        },
      })

      // Cada capa parte de media amplitud a un lado y termina en la otra media, para que
      // el recorrido quede centrado en su reposo. Una amplitud negativa invierte el sentido.
      const panLayer = (selector: string, amplitude: number) => {
        pan.fromTo(
          selector,
          { xPercent: -amplitude / 2 },
          { xPercent: amplitude / 2 },
          0,
        )
      }

      panLayer('.parallax-landing__layer--valley', CAMERA_PAN.amplitude.valley)
      panLayer('.parallax-landing__layer--library', CAMERA_PAN.amplitude.library)
      panLayer('.parallax-landing__layer--meadow', CAMERA_PAN.amplitude.meadow)

      // La pista de gotas lleva además el ascenso: GSAP compone la x y la y sobre el
      // mismo transform sin que un tween pise al otro.
      panLayer('.parallax-landing__drops-track', CAMERA_PAN.amplitude.drops)

      panLayer('.parallax-landing__layer--foreground', CAMERA_PAN.amplitude.foreground)

      // La pista son dos copias idénticas apiladas, así que mide el doble que la pantalla:
      // subirla exactamente la mitad deja la copia de abajo donde estaba la de arriba y el
      // reinicio no se ve. `ease: 'none'` es obligatorio — con cualquier curva las gotas
      // frenarían al final de cada vuelta y el bucle se delataría.
      gsap.to('.parallax-landing__drops-track', {
        yPercent: -50,
        duration: DROPS_RISE.durationSeconds,
        ease: 'none',
        repeat: -1,
      })
    }, scene)

    return () => ctx.revert()
  }, [sceneRef])
}
