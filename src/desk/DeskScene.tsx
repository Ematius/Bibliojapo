import type { MouseEvent, ReactNode } from 'react'
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
const DESK_SCENE = '/images/desk/escritorio.webp'

interface DeskSceneProps {
  children?: ReactNode
  // Pisar la mesa vacía cierra el objeto levantado, además de pulsarlo de nuevo o pulsar
  // otro —eso ya lo resolvía cada `DeskObject` solo—. Opcional porque de momento solo lo pide
  // `MyDesk`, que es quien lleva el estado de cuál está levantado.
  onBackgroundPress?: () => void
}

export function DeskScene({ children, onBackgroundPress }: DeskSceneProps) {
  // La imagen de la mesa no recibe pulsaciones —ver su regla en el SCSS—, así que un clic
  // sobre ella atraviesa hasta este contenedor y llega aquí con el contenedor de objetivo. Un
  // clic sobre un objeto también burbujea hasta aquí, pero con el botón de objetivo: por eso
  // se compara contra `currentTarget` y no basta con escuchar el clic.
  const onClick = onBackgroundPress
    ? (event: MouseEvent<HTMLDivElement>) => {
        if (event.target === event.currentTarget) onBackgroundPress()
      }
    : undefined

  return (
    <div className="desk-scene" onClick={onClick}>
      {/* Decorativa: lo que hay que leer son los objetos, no la mesa. */}
      <img className="desk-scene__art" src={DESK_SCENE} alt="" draggable="false" />
      {children}
    </div>
  )
}
