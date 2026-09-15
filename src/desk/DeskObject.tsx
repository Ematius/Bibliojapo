import { useRef, type ReactNode } from 'react'
import type { StyleWithVars } from '../shared/styleWithVars'
import { frontFit, type DeskArt } from './deskArt'
import { DESK_LIFT, SHOW_DESK_SPOTS, type DeskSpot } from './deskSpots'
import { useDeskLift } from './useDeskLift'
import './DeskObject.scss'

// Un objeto posado en la mesa, y cada objeto es una puerta.
//
// No sabe qué abre: recibe su sitio, sus caras, lo que promete y qué hacer al pulsarlo. Si
// supiera de chuletas o de juegos habría que escribir uno por cada cosa que se pueda abrir.
//
// EL QUE VIAJA es un `<div>`, no el botón: dentro lleva el botón que abre y cierra —solo él
// es pulsable, con su propio foco y su nombre leído en voz alta— y, al lado, la cara de
// contenido. Antes el contenido vivía DENTRO del botón, y el día que trajo algo pulsable de
// verdad —la lista de tomos de la chuleta— quedó un botón dentro de otro botón, que no es
// HTML válido y rompe el foco por teclado. Separados en dos hijos del mismo `<div>` que
// viaja, los dos se mueven juntos sin que uno tenga que contener al otro.
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
  // Lo que se lee sobre la cara de frente, al lado del botón y no dentro: puede llevar
  // cualquier cosa pulsable sin dejar de ser HTML válido.
  children?: ReactNode
}

export function DeskObject({ spot, art, label, lifted, onPress, children }: DeskObjectProps) {
  const rootRef = useRef<HTMLDivElement>(null)
  const frontRef = useRef<HTMLImageElement>(null)
  const framesRef = useRef<(HTMLImageElement | null)[]>([])
  const restingRef = useRef<HTMLImageElement>(null)

  useDeskLift({
    rootRef,
    frontRef,
    framesRef,
    restingRef,
    spot,
    lifted,
    restTiltDeg: art.restTiltDeg,
    frontWidth: art.frontWidth,
  })

  // Cuánto encoger y desplazar la cara de frente para que caiga encima de la de reposo.
  // Van en el `<div>` que viaja porque el botón y `.desk-object__face` las necesitan por
  // igual, y son hermanos: puestas en uno de los dos no le llegarían al otro.
  const fit = frontFit(art)
  // Cuánto tarda el viaje ENTERO, fotogramas de apertura incluidos si los hay: es lo que
  // tiene que esperar `.desk-object__face` antes de encenderse. Un retraso fijo —lo que
  // había antes— sirve para el carné o la hoja, que no abren nada, pero con el álbum de
  // anime dejaba ver las páginas antes de que el libro acabara de abrirse.
  const revealDelay = DESK_LIFT.seconds + (art.frames ? DESK_LIFT.openSeconds : 0)
  const style: StyleWithVars = {
    '--spot-x': spot.x,
    '--spot-base-y': spot.baseY,
    '--spot-width': spot.width,
    '--front-scale': fit.scale,
    '--front-left': fit.left,
    '--front-top': fit.top,
    '--front-height': fit.height,
    '--reveal-delay': `${revealDelay}s`,
  }

  return (
    <div
      ref={rootRef}
      className={[
        'desk-object',
        lifted ? 'desk-object--lifted' : '',
        SHOW_DESK_SPOTS ? 'desk-object--marked' : '',
      ]
        .filter(Boolean)
        .join(' ')}
      style={style}
    >
      <button
        className="desk-object__button"
        type="button"
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
      </button>

      {/* Se coloca sobre la cara de frente con sus mismas medidas y se enciende con la clase
          del `<div>` que viaja, no desde el hook: así el gesto sigue sin saber que hay algo
          escrito. */}
      {children ? <div className="desk-object__face">{children}</div> : null}
    </div>
  )
}
