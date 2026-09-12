import { useLayoutEffect, useRef } from 'react'
import gsap from 'gsap'
import { VOLUME_SCRIM } from './shelfConfig'
import { prefersReducedMotion } from '../../shared/prefersReducedMotion'
import './VolumeScrim.scss'

interface VolumeScrimProps {
  shown: boolean
  onDismiss: () => void
}

// El velo entre el pasillo y el tomo, y a la vez la zona que se pulsa para devolverlo a la
// balda. Van juntos a propósito: «pulsar fuera para cerrar» solo funciona cuando hay un
// fuera que se ve, y con el pasillo igual de nítido habría que adivinarlo.
export function VolumeScrim({ shown, onDismiss }: VolumeScrimProps) {
  const rootRef = useRef<HTMLButtonElement>(null)
  const isFirstRender = useRef(true)

  useLayoutEffect(() => {
    const root = rootRef.current
    if (!root) return

    // El primer render coloca sin animar: el velo nace apagado y animarlo hasta donde ya
    // está sería un parpadeo al cargar.
    const jump =
      isFirstRender.current || prefersReducedMotion()
    isFirstRender.current = false

    // `autoAlpha` y no `opacity`: apagado del todo también deja de recibir pulsaciones.
    if (jump) {
      gsap.set(root, { autoAlpha: shown ? 1 : 0 })
      return
    }

    const tween = gsap.to(root, {
      autoAlpha: shown ? 1 : 0,
      duration: VOLUME_SCRIM.fadeSeconds,
      ease: VOLUME_SCRIM.ease,
    })

    return () => {
      tween.kill()
    }
  }, [shown])

  return (
    <button
      type="button"
      className="volume-scrim"
      ref={rootRef}
      onClick={onDismiss}
      // Con un tomo fuera de la balda el pasillo no se recorre: el velo se queda con el
      // gesto. Ver `useScenePan`.
      data-no-pan
      // Fuera del tabulador: un botón a pantalla completa lo secuestraría, y con el teclado
      // ya se sale con Escape.
      tabIndex={-1}
      aria-label="Devolver el tomo a la balda"
    />
  )
}
