import type { ReactNode } from 'react'
import './DeskScene.scss'

// La escena del escritorio: la mesa pintada, y encima lo que se le ponga.
//
// Es un componente y no un fondo porque es también el SISTEMA DE COORDENADAS de lo que se
// posa en la mesa: un objeto se coloca en fracciones del DIBUJO y no de la ventana. Por eso
// van DENTRO, como `children`: fuera del encuadre sus medidas no querrían decir nada.
//
// La mesa está pintada vacía: la ilustración solo trae los adornos que nunca cambian ni se
// pulsan. La hoja, la caja y el carné llegan por encima porque tienen que poder pulsarse,
// animarse y aparecer solo cuando se han ganado.
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
