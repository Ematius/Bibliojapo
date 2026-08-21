import { useCallback, useRef, type RefObject } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useNavigate } from 'react-router-dom'
import type { AisleSign } from './aisleSignsConfig'
import { AISLE_SWEEP } from './aisleSweepConfig'
import { markLibraryEntered } from './enteredLibrary'

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
      if (!sweepEl || !stageEl || isSweepingRef.current) return

      isSweepingRef.current = true
      sweepEl.src = sign.sceneAsset

      const tl = gsap.timeline({
        onComplete: () => {
          markLibraryEntered()

          // Hay que deshacer el pin ANTES de cambiar de ruta. Al fijar la sección,
          // ScrollTrigger la envuelve en un .pin-spacer, así que deja de ser hija
          // de #root; si React intenta desmontarla en ese estado, el removeChild
          // falla y el árbol se queda a medias. `kill(true)` revierte el pin y
          // devuelve la sección a su sitio.
          ScrollTrigger.getAll().forEach((trigger) => trigger.kill(true))

          navigate(sign.route)
        },
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
