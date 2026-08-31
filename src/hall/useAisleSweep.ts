import { useCallback, useRef, type RefObject } from 'react'
import gsap from 'gsap'
import { useNavigate } from 'react-router-dom'
import { aisleRoute, findAisle } from '../shared/aisles'
import type { AisleSign } from './aisleSignsConfig'
import { AISLE_SWEEP } from './aisleSweepConfig'

// Barrido lateral de la entrada al pasillo.
//
// La ilustración del pasillo entra deslizándose por encima de la entrada y solo
// se cambia de ruta cuando ya cubre la pantalla entera. Así el montaje del
// componente del pasillo, que muestra esa misma imagen en la misma posición,
// no se nota: no hay parpadeo ni fondo vacío entre una vista y otra.
export function useAisleSweep(stageRef: RefObject<HTMLDivElement | null>) {
  const navigate = useNavigate()
  const sweepRef = useRef<HTMLImageElement>(null)
  const isSweepingRef = useRef(false)

  const sweepToAisle = useCallback(
    (sign: AisleSign) => {
      const sweepEl = sweepRef.current
      const stageEl = stageRef.current
      const aisle = findAisle(sign.aisleId)
      if (!sweepEl || !stageEl || !aisle || isSweepingRef.current) return

      isSweepingRef.current = true
      sweepEl.src = aisle.scene

      const tl = gsap.timeline({
        // Se cambia de ruta con el pasillo ya cubriendo la pantalla entera, de
        // modo que el montaje del componente de destino —que muestra esa misma
        // ilustración en la misma posición— no se nota.
        onComplete: () => navigate(aisleRoute(aisle.id)),
      })

      tl.set(sweepEl, { xPercent: -100, autoAlpha: 1 })

      // La escena actual acompaña el movimiento, como si la cámara girase hacia
      // el pasillo elegido. Se anima `x` en píxeles y no `xPercent` porque el
      // stage ya usa xPercent para centrarse; tocarlo lo descolocaría.
      tl.to(
        stageEl,
        {
          x: () => window.innerWidth * AISLE_SWEEP.stageDriftRatio,
          duration: AISLE_SWEEP.durationSeconds,
          ease: AISLE_SWEEP.ease,
        },
        0,
      )

      tl.to(
        sweepEl,
        {
          xPercent: 0,
          duration: AISLE_SWEEP.durationSeconds,
          ease: AISLE_SWEEP.ease,
        },
        0,
      )
    },
    [navigate, stageRef],
  )

  return { sweepRef, sweepToAisle }
}
