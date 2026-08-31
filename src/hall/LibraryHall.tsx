import { useRef } from 'react'
import { createPortal } from 'react-dom'
import { ASSETS } from '../entrance/libraryEntranceConfig'
import { AisleSigns } from './AisleSigns'
import { useAisleSweep } from './useAisleSweep'
import { SiteNav } from '../shared/SiteNav'
import './LibraryHall.scss'

// Vestíbulo de la biblioteca: el centro de la navegación.
//
// Es la pantalla a la que se vuelve una y otra vez —al salir de un pasillo, al
// pulsar «Pasillos» en la barra—, así que no lleva ninguna animación de entrada
// que haya que esperar. La escena aparece ya montada.
//
// Muestra la misma ilustración del interior con la que termina la secuencia de
// la puerta y en la misma posición, de modo que el salto de una pantalla a otra
// no se percibe.
export function LibraryHall() {
  const stageRef = useRef<HTMLDivElement>(null)
  const { sweepRef, sweepToAisle } = useAisleSweep(stageRef)

  return (
    <main className="library-hall">
      <div className="library-hall__stage" ref={stageRef}>
        <img className="library-hall__interior" src={ASSETS.interior} alt="" draggable="false" />

        <AisleSigns onSelect={sweepToAisle} />
      </div>

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
