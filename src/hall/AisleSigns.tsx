import { useRef } from 'react'
import { findAisle } from '../shared/aisles'
import type { StyleWithVars } from '../shared/styleWithVars'
import { AISLE_SIGNS, type AisleSign } from './aisleSignsConfig'
import { useAisleSignsIntro } from './useAisleSignsIntro'
import './AisleSigns.scss'

interface AisleSignsProps {
  // La navegación no vive aquí: este componente dibuja los carteles y avisa de cuál se
  // ha elegido.
  onSelect: (sign: AisleSign) => void
}

export function AisleSigns({ onSelect }: AisleSignsProps) {
  const groupRef = useRef<HTMLDivElement>(null)

  useAisleSignsIntro(groupRef)

  return (
    <div className="aisle-signs" ref={groupRef}>
      {AISLE_SIGNS.map((sign) => {
        const aisle = findAisle(sign.aisleId)
        // Un cartel cuyo pasillo no está en el registro no se pinta: colgarlo dejaría un
        // botón que no lleva a ninguna parte.
        if (!aisle) return null

        const signStyle: StyleWithVars = {
          '--sign-left': sign.left,
          '--sign-top': sign.top,
          '--sign-width': sign.width,
        }

        return (
          <button
            key={sign.aisleId}
            type="button"
            className="aisle-signs__sign"
            style={signStyle}
            onClick={() => onSelect(sign)}
            aria-label={`Entrar en el pasillo de ${aisle.label}`}
          >
            <img src={sign.asset} alt="" draggable="false" />
          </button>
        )
      })}
    </div>
  )
}
