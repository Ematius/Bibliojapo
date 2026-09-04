import { useLayoutEffect, type RefObject } from 'react'
import gsap from 'gsap'
import { CAMERA_PAN, DROPS_RISE } from './parallaxLandingConfig'
import { prefersReducedMotion } from '../shared/prefersReducedMotion'

// Movimiento continuo de la escena de capas.
//
// Son bucles decorativos que no terminan nunca, así que no se encadenan en una
// timeline común: cada capa lleva su propio tween con su duración. Al no ser
// múltiplos entre sí, el conjunto tarda muchísimo en repetir la misma
// combinación de posiciones. Si compartieran timeline se sincronizarían y el
// movimiento se leería como un vaivén mecánico.
export function useParallaxLandingAnimation(sceneRef: RefObject<HTMLDivElement | null>): void {
  useLayoutEffect(() => {
    const scene = sceneRef.current
    if (!scene) return

    // Con "reducir movimiento" activo la escena se queda quieta. No hay nada que
    // deshacer: CSS ya deja cada capa compuesta en su sitio, la animación solo
    // añade el desplazamiento.
    if (prefersReducedMotion()) return

    // El contexto acota los selectores a esta escena y permite revertir todos los
    // tweens de golpe al desmontar, sin guardar una referencia por animación.
    const ctx = gsap.context(() => {
      // --- Barrido lateral de cámara ---
      //
      // Las cuatro capas van en la misma timeline, arrancando todas en el
      // instante 0 y con la misma duración y la misma curva. Eso es lo que se
      // lee como una cámara desplazándose: el movimiento es solidario, y lo
      // único que distingue a un plano de otro es cuánta distancia recorre.
      // Repartir el tiempo entre capas, en cambio, las convierte en objetos
      // moviéndose cada uno por su lado.
      //
      // El recorrido es de ida y vuelta (`yoyo`) y no continuo: las imágenes no
      // son repetibles en horizontal, así que un desplazamiento infinito acabaría
      // sacándolas del encuadre. Con `sine.inOut` el cambio de sentido no tiene
      // frenazo ni tirón, y al no haber punto de partida perceptible se lee como
      // un travelling largo en vez de como un balanceo.
      //
      // Se anima `xPercent` (relativo al ancho de cada capa) en vez de `x` en
      // píxeles para que el recorrido sea proporcional en móvil y en escritorio.
      const pan = gsap.timeline({
        repeat: -1,
        yoyo: true,
        defaults: {
          duration: CAMERA_PAN.durationSeconds,
          ease: CAMERA_PAN.ease,
        },
      })

      // Cada capa parte de media amplitud a un lado y termina en la otra media,
      // de modo que el recorrido queda centrado en su posición de reposo y
      // consume el mismo margen por la izquierda que por la derecha. Una amplitud
      // negativa invierte el sentido de la marcha sin más.
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

      // La pista de gotas lleva además el ascenso: GSAP escribe la x y la y sobre
      // el mismo transform sin que un tween pise al otro.
      panLayer('.parallax-landing__drops-track', CAMERA_PAN.amplitude.drops)

      // El primer plano de flores es lo más cercano y lo que más recorre, en
      // sentido contrario al prado.
      panLayer('.parallax-landing__layer--foreground', CAMERA_PAN.amplitude.foreground)

      // --- Capa 4: ascenso de las gotas ---
      //
      // La pista contiene dos copias idénticas apiladas y mide el doble que la
      // pantalla. Subirla exactamente la mitad (`yPercent: -50`) deja la copia de
      // abajo justo donde estaba la de arriba, así que cuando el tween reinicia el
      // fotograma es idéntico al anterior y el salto no se ve.
      //
      // `ease: 'none'` es obligatorio aquí: con cualquier curva de aceleración las
      // gotas frenarían al final de cada vuelta y el bucle se delataría.
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
