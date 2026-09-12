import { useNavigate } from 'react-router-dom'
import type { StyleWithVars } from '../shared/styleWithVars'
import { DOOR_ZONE, SHOW_DOOR_ZONE } from './parallaxLandingConfig'
import './LibraryDoor.scss'

// El centro y el tamaño llegan al CSS ya convertidos en borde izquierdo y superior,
// para que la config siga diciendo «dónde está la puerta».
const doorStyle: StyleWithVars = {
  '--door-left': DOOR_ZONE.x - DOOR_ZONE.width / 2,
  '--door-top': DOOR_ZONE.y - DOOR_ZONE.height / 2,
  '--door-width': DOOR_ZONE.width,
  '--door-height': DOOR_ZONE.height,
}

// La puerta de la biblioteca, pulsable desde el valle. Va dentro de la capa de la
// biblioteca y no respecto a la ventana: la escena hace un barrido de cámara continuo,
// y una zona quieta acabaría sobre el césped mientras el edificio se mueve.
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
