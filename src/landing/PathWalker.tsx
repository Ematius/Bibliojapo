import { useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import type { StyleWithVars } from '../shared/styleWithVars'
import { PATH_WALK, PATH_WALK_IMAGE } from './pathWalkerConfig'
import { usePathWalkerLoop } from './usePathWalkerLoop'
import './PathWalker.scss'

// El recorrido llega al CSS ya reducido a un punto de partida y un delta, que es
// lo que el transform necesita. Calcularlo aquí y no en el SCSS deja la config
// en fracciones legibles —«dónde empieza» y «dónde acaba»— en vez de obligar a
// escribir la resta a mano cada vez que se recoloca el sendero.
const walkStyle: StyleWithVars = {
  '--walk-image': `url('${PATH_WALK_IMAGE}')`,
  '--walk-from-x': PATH_WALK.from.x,
  '--walk-from-y': PATH_WALK.from.y,
  '--walk-height': PATH_WALK.from.height,
  '--walk-dx': PATH_WALK.to.x - PATH_WALK.from.x,
  '--walk-dy': PATH_WALK.to.y - PATH_WALK.from.y,
  // Escala final relativa a la inicial: la figura nace a tamaño `from.height` y
  // encoge hasta este factor al llegar al fondo.
  '--walk-scale': PATH_WALK.to.height / PATH_WALK.from.height,
}

// Una figura caminando por el sendero de piedra hacia la biblioteca.
//
// Es lo único que se puede pulsar en el valle. No hay barra ni botones: la
// portada se mira, y el único gesto posible es seguir el camino.
export function PathWalker() {
  const navigate = useNavigate()
  const groupRef = useRef<HTMLButtonElement>(null)

  usePathWalkerLoop(groupRef)

  return (
    <button
      type="button"
      className="path-walker"
      style={walkStyle}
      ref={groupRef}
      onClick={() => navigate('/entrada')}
      aria-label="Avanzar hasta la puerta de la biblioteca"
    >
      {/* La figura no se pinta como <img> sino como una máscara sobre un fondo
          de color: el dibujo original es trazo negro sobre transparente, y
          enmascarando se tiñe al tono que se quiera sin depender de cadenas de
          filtros, que solo llegan al color aproximado. */}
      <span className="path-walker__figure" aria-hidden="true" />
    </button>
  )
}
