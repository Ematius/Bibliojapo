import { useRef } from 'react'
import { createPortal } from 'react-dom'
import { ASSETS } from '../entrance/libraryEntranceConfig'
import { AisleSigns } from './AisleSigns'
import { HallGuide } from './HallGuide'
import { HallPanArrows } from './HallPanArrows'
import { useAisleSweep } from './useAisleSweep'
import { useScenePan } from '../shared/useScenePan'
import { SiteNav } from '../shared/SiteNav'
import './LibraryHall.scss'

// Vestíbulo: el centro de la navegación. Se vuelve a él una y otra vez, así que no
// lleva animación de entrada que haya que esperar. Muestra la misma ilustración con la
// que termina la secuencia de la puerta, en la misma posición, para que no se note el
// salto.
export function LibraryHall() {
  const stageRef = useRef<HTMLDivElement>(null)
  const { sweepRef, sweepToAisle } = useAisleSweep(stageRef)
  const { reach, panBy } = useScenePan(stageRef)

  return (
    <main className="library-hall">
      <div className="library-hall__stage" ref={stageRef}>
        <img className="library-hall__interior" src={ASSETS.interior} alt="" draggable="false" />

        <AisleSigns onSelect={sweepToAisle} />
      </div>

      <HallPanArrows reach={reach} onPan={panBy} />

      <HallGuide />

      <SiteNav />

      {/* Colgado del body y no del stage: el barrido acompaña a la ventana y no
          debe moverse con la escena, que sí se desplaza durante la transición. */}
      {createPortal(
        <img className="library-hall__sweep" ref={sweepRef} alt="" aria-hidden="true" draggable="false" />,
        document.body,
      )}
    </main>
  )
}
