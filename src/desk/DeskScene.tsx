import type { ReactNode } from 'react'
import './DeskScene.scss'

// La escena del escritorio: la mesa pintada, y encima lo que se le ponga.
//
// ── Por qué la escena es un componente y no un fondo ───────────────────────
// Porque es también el SISTEMA DE COORDENADAS de todo lo que se posa en la mesa.
// Un objeto se coloca en fracciones del DIBUJO —«a tres cuartos de ancho, a media
// altura de la madera»— y no de la ventana, que es lo que lo mantiene en su sitio
// en cualquier pantalla. Por eso los objetos van DENTRO, como `children`, y no
// sueltos por la pantalla: fuera del encuadre sus medidas no querrían decir nada.
// Es lo mismo que hace el pasillo con sus tomos. Ver `styles/_stage.scss`.
//
// ── Por qué la mesa está pintada vacía ─────────────────────────────────────
// Lo único que trae la ilustración son los adornos que nunca cambian ni se pulsan
// —el tintero de una esquina, el paño de la otra—. La hoja, la caja y el carné
// llegan por encima, porque tienen que poder pulsarse, animarse y aparecer solo
// cuando se han ganado. Pintados en la madera no podrían hacer ninguna de las tres.
const DESK_SCENE = '/images/desk/escritorio.png'

export function DeskScene({ children }: { children?: ReactNode }) {
  return (
    <div className="desk-scene">
      {/* Decorativa: lo que hay que leer son los objetos, no la mesa. */}
      <img className="desk-scene__art" src={DESK_SCENE} alt="" draggable="false" />
      {children}
    </div>
  )
}
