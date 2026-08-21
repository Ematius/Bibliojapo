import type { CSSProperties } from 'react'
import { AISLE_SIGNS, type AisleSign } from './aisleSignsConfig'
import './AisleSigns.scss'

// Estilo con custom properties CSS (--variable) además de las propiedades
// estándar de React — CSSProperties no las declara por defecto.
type StyleWithVars = CSSProperties & Record<`--${string}`, string | number>

interface AisleSignsProps {
  // Se dispara al pulsar un cartel. La navegación no vive aquí: este componente
  // solo dibuja los carteles y avisa de cuál se ha elegido.
  onSelect: (sign: AisleSign) => void
}

export function AisleSigns({ onSelect }: AisleSignsProps) {
  return (
    <div className="aisle-signs">
      {AISLE_SIGNS.map((sign) => {
        const signStyle: StyleWithVars = {
          '--sign-left': sign.left,
          '--sign-top': sign.top,
          '--sign-width': sign.width,
        }

        return (
          <button
            key={sign.id}
            type="button"
            className="aisle-signs__sign"
            style={signStyle}
            onClick={() => onSelect(sign)}
            aria-label={sign.label}
          >
            <img src={sign.asset} alt="" draggable="false" />
          </button>
        )
      })}
    </div>
  )
}
