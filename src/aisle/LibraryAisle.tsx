import { Navigate, useParams } from 'react-router-dom'
import { findAisle } from '../shared/aisles'
import { SiteNav } from '../shared/SiteNav'
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

  // Un pasillo que no existe manda al vestíbulo, que es donde están todos los
  // que sí existen. `replace` evita que la URL inválida quede en el historial y
  // el botón atrás rebote contra ella.
  if (!aisle) return <Navigate to="/biblioteca" replace />

  return (
    <section className="library-aisle">
      <img className="library-aisle__scene" src={aisle.scene} alt="" draggable="false" />

      {/* La vuelta al vestíbulo la da «Pasillos» en la barra: un botón propio de
          «volver» sería una segunda salida diciendo lo mismo. */}
      <SiteNav />
    </section>
  )
}
