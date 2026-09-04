import { useNavigate } from 'react-router-dom'
import type { StyleWithVars } from '../shared/styleWithVars'
import { DOOR_ZONE, SHOW_DOOR_ZONE } from './parallaxLandingConfig'
import './LibraryDoor.scss'

// El centro y el tamaño llegan al CSS convertidos ya en borde izquierdo y
// superior, que es lo que necesita una caja posicionada. Se hace aquí para que la
// config siga diciendo «dónde está la puerta» en vez de obligar a escribir la
// resta a mano cada vez que se recoloca.
const doorStyle: StyleWithVars = {
  '--door-left': DOOR_ZONE.x - DOOR_ZONE.width / 2,
  '--door-top': DOOR_ZONE.y - DOOR_ZONE.height / 2,
  '--door-width': DOOR_ZONE.width,
  '--door-height': DOOR_ZONE.height,
}

// La puerta de la biblioteca, pulsable desde el valle.
//
// Hasta ahora al valle solo se entraba siguiendo a la caminante, y era el único
// gesto posible. Pero una portada con una casa dibujada al fondo invita a pulsar
// la casa: quien mira la escena apunta a la puerta antes que a la figura, y no
// pasaba nada.
//
// Ahora las dos llevan al mismo sitio. No se sustituyen: la caminante enseña el
// camino a quien no sabe qué hacer, y la puerta atiende a quien ya lo sabe y
// quiere entrar directamente.
//
// ── Por qué va dentro de la capa de la biblioteca ──────────────────────────
// La escena hace un barrido de cámara continuo, y la biblioteca se desplaza con
// él. Una zona pulsable colocada respecto a la ventana se quedaría quieta
// mientras el edificio se mueve por debajo, y al poco rato estaría sobre el
// césped. Metida en la capa, comparte su transform y sigue a la puerta siempre.
export function LibraryDoor() {
  const navigate = useNavigate()

  return (
    <button
      type="button"
      className={
        SHOW_DOOR_ZONE ? 'library-door library-door--debug' : 'library-door'
      }
      style={doorStyle}
      onClick={() => navigate('/entrada')}
      aria-label="Entrar en la biblioteca"
    />
  )
}
