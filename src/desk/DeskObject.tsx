import type { StyleWithVars } from '../shared/styleWithVars'
import { SHOW_DESK_SPOTS, type DeskSpot } from './deskSpots'
import './DeskObject.scss'

// Un objeto posado en la mesa, y cada objeto es una puerta.
//
// ── Por qué no sabe qué abre ───────────────────────────────────────────────
// Recibe su sitio, su dibujo, lo que promete y qué hacer al pulsarlo. Nada más.
// Son tres puertas hoy y serán más mañana, y la única diferencia entre ellas es
// esa: si el objeto supiera de chuletas o de juegos habría que escribir uno por
// cada cosa que se pueda abrir.
//
// ── Por qué es un botón ────────────────────────────────────────────────────
// Porque se pulsa. Con un `div` habría que devolverle a mano el foco, la tecla
// Intro y el nombre que se lee en voz alta, y se quedaría a medias. La imagen va
// dentro con `alt` vacío: lo que se anuncia es lo que promete el botón, y con las
// dos cosas se leería dos veces.
//
// ── Por qué las medidas van como variables ─────────────────────────────────
// Porque son fracciones del DIBUJO, y la cuenta que las convierte en píxeles
// depende del encuadre, que vive en el CSS. Es lo mismo que hace un tomo con su
// balda. Ver `deskSpots.ts`.
interface DeskObjectProps {
  spot: DeskSpot
  src: string
  // Lo que promete la pulsación, no lo que es el objeto: «Tus chuletas», no «una
  // hoja». Quien lo lee a ciegas quiere saber a dónde va.
  label: string
  onPress: () => void
}

export function DeskObject({ spot, src, label, onPress }: DeskObjectProps) {
  const style: StyleWithVars = {
    '--spot-x': spot.x,
    '--spot-base-y': spot.baseY,
    '--spot-width': spot.width,
  }

  return (
    <button
      className={`desk-object${SHOW_DESK_SPOTS ? ' desk-object--marked' : ''}`}
      type="button"
      style={style}
      onClick={onPress}
      aria-label={label}
    >
      <img className="desk-object__art" src={src} alt="" draggable="false" />
    </button>
  )
}
