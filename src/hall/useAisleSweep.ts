import { useCallback, useRef, type RefObject } from 'react'
import gsap from 'gsap'
import { useNavigate } from 'react-router-dom'
import { aisleRoute, findAisle } from '../shared/aisles'
import type { AisleSign } from './aisleSignsConfig'
import { AISLE_SWEEP } from './aisleSweepConfig'

// La ilustración del pasillo entra deslizándose por encima de la entrada.
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
        // Se cambia de ruta con el pasillo ya cubriendo la pantalla entera: el componente
        // de destino muestra esa misma ilustración en la misma posición, así que no se nota.
        onComplete: () => navigate(aisleRoute(aisle.id)),
      })

      tl.set(sweepEl, { xPercent: -100, autoAlpha: 1 })

      // Se anima `x` en píxeles y no `xPercent` porque el stage ya usa xPercent para
      // centrarse; tocarlo lo descolocaría.
      //
      // Se suma a la `x` que haya: la escena se puede haber recorrido a mano antes de
      // elegir pasillo, y un destino absoluto la traería de vuelta de un latigazo.
      tl.to(
        stageEl,
        {
          x: (_index, target: Element) =>
            (gsap.getProperty(target, 'x') as number) +
            window.innerWidth * AISLE_SWEEP.stageDriftRatio,
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
