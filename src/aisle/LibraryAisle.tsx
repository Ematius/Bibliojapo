import { Navigate, useParams } from 'react-router-dom'
import { findAisle } from '../shared/aisles'
import { SiteNav } from '../shared/SiteNav'
import { ShelfVolume } from './shelf/ShelfVolume'
import { SHELF_VOLUMES } from './shelf/shelfConfig'
import { useVolumeAccess } from './shelf/useVolumeAccess'
import './LibraryAisle.scss'

// Pasillo de la biblioteca: la estantería de una sección.
//
// Es un único componente para las cuatro secciones. Lo único que cambia de un
// pasillo a otro es la ilustración, y eso vive en el registro: un componente por
// sección obligaría a copiar este archivo entero cada vez para cambiarle una
// ruta de imagen.
export function LibraryAisle() {
  const { aisleId } = useParams()
  const aisle = findAisle(aisleId)
  // Qué tomos se pueden coger. Se pide una vez para toda la estantería y no tomo
  // a tomo: es una sola pregunta al servidor, y así los doce se enteran a la vez
  // de que se ha sellado uno.
  const access = useVolumeAccess()

  // Un pasillo que no existe manda al vestíbulo, que es donde están todos los
  // que sí existen. `replace` evita que la URL inválida quede en el historial y
  // el botón atrás rebote contra ella.
  if (!aisle) return <Navigate to="/biblioteca" replace />

  return (
    <section className="library-aisle">
      {/* Los tomos van dentro del stage y no sueltos en la pantalla: el stage
          conserva la proporción de la ilustración, así que un tomo colocado
          sobre una balda sigue sobre esa balda en cualquier monitor. Referido a
          la ventana se despegaría de la madera en cuanto la escena se recortara. */}
      <div className="library-aisle__stage">
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
