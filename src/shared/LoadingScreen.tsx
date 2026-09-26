import { useLayoutEffect, useRef } from 'react'
import gsap from 'gsap'
import { prefersReducedMotion } from './prefersReducedMotion'
import './LoadingScreen.scss'

// Con red rápida la pantalla siguiente llega antes de este retraso y esto no se ve nunca;
// sin él, cada cambio de ruta daría un fogonazo de la escena de carga.
const SHOW_DELAY = 0.35

// Lo que se ve mientras llega el trozo de la pantalla siguiente, en lugar del fondo negro.
export function LoadingScreen() {
  const rootRef = useRef<HTMLDivElement>(null)

  useLayoutEffect(() => {
    const root = rootRef.current
    if (!root) return

    // `fromTo` y no `from`: con `from`, un efecto que se monta dos veces deja la pantalla
    // invisible —el segundo tween toma como destino el 0 que escribió el primero—.
    const tween = gsap.fromTo(
      root,
      { autoAlpha: 0 },
      {
        autoAlpha: 1,
        delay: SHOW_DELAY,
        duration: prefersReducedMotion() ? 0 : 0.5,
        ease: 'power2.out',
      },
    )
    return () => {
      tween.kill()
    }
  }, [])

  return (
    <div className="loading-screen" ref={rootRef} role="status">
      <div className="loading-screen__panel">
        <p className="loading-screen__title">Un momento…</p>
        <p className="loading-screen__text">
          Estamos preparando la sala. Con una conexión lenta puede tardar un poco.
        </p>
      </div>
    </div>
  )
}
