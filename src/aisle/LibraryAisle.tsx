import { useRef } from 'react'
import { Navigate, useParams } from 'react-router-dom'
import { findAisle } from '../shared/aisles'
import { SiteNav } from '../shared/SiteNav'
import { ShelfVolume } from './shelf/ShelfVolume'
import { SHELF_VOLUMES } from './shelf/shelfConfig'
import { SHELF_GRID } from './shelf/shelfGrid'
import { useVolumeAccess } from './shelf/useVolumeAccess'
import { useScenePan } from '../shared/useScenePan'
import type { StyleWithVars } from '../shared/styleWithVars'
import './LibraryAisle.scss'

// La zona que el encuadre tiene que respetar. Se deriva de los cuatro bordes medidos sobre
// la ilustración, y sale del componente y no de la hoja de estilos porque es una medida
// del dibujo, no una decisión de diseño.
const { frame } = SHELF_GRID
const FRAME_VARS: StyleWithVars = {
  '--frame-width': String(frame.right - frame.left),
  '--frame-height': String(frame.bottom - frame.top),
  '--frame-center-x': String((frame.left + frame.right) / 2),
  '--frame-center-y': String((frame.top + frame.bottom) / 2),
}

// Un único componente para las cuatro secciones: lo único que cambia de un pasillo a otro
// es la ilustración, y eso vive en el registro.
export function LibraryAisle() {
  const stageRef = useRef<HTMLDivElement>(null)
  const { aisleId } = useParams()
  const aisle = findAisle(aisleId)
  // Se pide una vez para toda la estantería y no tomo a tomo: es una sola pregunta al
  // servidor, y así los doce se enteran a la vez de que se ha sellado uno.
  const access = useVolumeAccess()
  // Solo el arrastre: aquí se entra ya mirando a la estantería, así que no hacen falta
  // flechas que digan que hay más pasillo a los lados.
  useScenePan(stageRef)

  // Un pasillo que no existe manda al vestíbulo. `replace` evita que la URL inválida quede
  // en el historial y el botón atrás rebote contra ella.
  if (!aisle) return <Navigate to="/biblioteca" replace />

  return (
    <section className="library-aisle">
      {/* Los tomos van dentro del stage y no sueltos en la pantalla: el stage
          conserva la proporción de la ilustración, así que un tomo colocado
          sobre una balda sigue sobre esa balda en cualquier monitor. Referido a
          la ventana se despegaría de la madera en cuanto la escena se recortara. */}
      <div className="library-aisle__stage" style={FRAME_VARS} ref={stageRef}>
        <img className="library-aisle__scene" src={aisle.scene} alt="" draggable="false" />

        {SHELF_VOLUMES.map((volume) => (
          <ShelfVolume
            key={volume.id}
            volume={volume}
            access={access.get(volume.blockId) ?? 'pending'}
          />
        ))}
      </div>

      {/* La vuelta al vestíbulo la da «Pasillos» en la barra: un botón propio de
          «volver» sería una segunda salida diciendo lo mismo. */}
      <SiteNav />
    </section>
  )
}
