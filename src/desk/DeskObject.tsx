import { useRef, type ReactNode } from 'react'
import type { StyleWithVars } from '../shared/styleWithVars'
import { frontFit, type DeskArt } from './deskArt'
import { SHOW_DESK_SPOTS, type DeskSpot } from './deskSpots'
import { useDeskLift } from './useDeskLift'
import './DeskObject.scss'

// Un objeto posado en la mesa, y cada objeto es una puerta.
//
// No sabe qué abre: recibe su sitio, sus caras, lo que promete y qué hacer al pulsarlo. Si
// supiera de chuletas o de juegos habría que escribir uno por cada cosa que se pueda abrir.
//
// Es un <button> porque se pulsa: con un `div` habría que devolverle a mano el foco, la tecla
// Intro y el nombre que se lee en voz alta. Las imágenes van dentro con `alt` vacío, o se
// leería dos veces.
//
// Las medidas van como variables CSS porque son fracciones del DIBUJO, y la cuenta que las
// convierte en píxeles depende del encuadre, que vive en el CSS.
interface DeskObjectProps {
  spot: DeskSpot
  art: DeskArt
  // Lo que promete la pulsación, no lo que es el objeto: «Tus chuletas», no «una hoja».
  label: string
  // Lo lleva la pantalla y no el objeto: solo puede haber uno levantado a la vez.
  lifted: boolean
  onPress: () => void
  // Lo que se lee encima de la cara de frente. Va DENTRO del botón para que viaje con él; el
  // precio es que no puede llevar nada pulsable —un botón dentro de otro no es HTML válido—,
  // así que el día que haga falta, esto sale del botón y el objeto releva a un panel.
  children?: ReactNode
}

export function DeskObject({ spot, art, label, lifted, onPress, children }: DeskObjectProps) {
  const rootRef = useRef<HTMLButtonElement>(null)
  const frontRef = useRef<HTMLImageElement>(null)
  const framesRef = useRef<(HTMLImageElement | null)[]>([])
  const restingRef = useRef<HTMLImageElement>(null)

  useDeskLift({ rootRef, frontRef, framesRef, restingRef, spot, lifted, restTiltDeg: art.restTiltDeg })

  // Cuánto encoger y desplazar la cara de frente para que caiga encima de la de reposo.
  // Van en el botón y no en la propia imagen: `.desk-object__face` las necesita igual y es
  // su HERMANO, así que puestas más abajo no le llegarían.
  const fit = frontFit(art)
  const style: StyleWithVars = {
    '--spot-x': spot.x,
    '--spot-base-y': spot.baseY,
    '--spot-width': spot.width,
    '--front-scale': fit.scale,
    '--front-left': fit.left,
    '--front-top': fit.top,
    '--front-height': fit.height,
  }

  return (
    <button
      ref={rootRef}
      className={[
        'desk-object',
        lifted ? 'desk-object--lifted' : '',
        SHOW_DESK_SPOTS ? 'desk-object--marked' : '',
      ]
        .filter(Boolean)
        .join(' ')}
      type="button"
      style={style}
      onClick={onPress}
      aria-label={label}
      aria-expanded={art.front ? lifted : undefined}
    >
      <img
        ref={restingRef}
        className="desk-object__art"
        src={art.resting.src}
        alt=""
        draggable="false"
      />

      {/* La segunda cara, apagada hasta que el objeto viaja. Se carga con la
          página y no al pulsarla: pedirla en ese momento la haría aparecer a
          trozos justo cuando se está mirando. */}
      {art.front ? (
        <img
          ref={frontRef}
          className="desk-object__art desk-object__art--front"
          src={art.front.src}
          alt=""
          draggable="false"
        />
      ) : null}

      {art.frames?.map((frame, index) => (
        <img
          key={frame}
          ref={(el) => {
            framesRef.current[index] = el
          }}
          className="desk-object__art desk-object__art--frame"
          src={frame}
          alt=""
          draggable="false"
        />
      ))}

      {/* Se coloca sobre la cara de frente con sus mismas medidas y se enciende con la clase
          del botón, no desde el hook: así el gesto sigue sin saber que hay algo escrito. */}
      {children ? <div className="desk-object__face">{children}</div> : null}
    </button>
  )
}
