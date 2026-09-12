import { useRef } from 'react'
import { LibraryDoor } from './LibraryDoor'
import { PathWalker } from './PathWalker'
import { WelcomeSign } from './WelcomeSign'
import {
  DROPS_LAYER_SRC,
  FOREGROUND_LAYER_SRC,
  SCENE_FRAME,
  SCENE_LAYERS,
} from './parallaxLandingConfig'
import { useParallaxLandingAnimation } from './useParallaxLandingAnimation'
import type { StyleWithVars } from '../shared/styleWithVars'
import './ParallaxLanding.scss'

// Sale del componente y no de la hoja de estilos porque es una medida del dibujo, no una
// decisión de diseño.
const FRAME_VARS: StyleWithVars = {
  '--frame-width': String(SCENE_FRAME.width),
  '--frame-height': String(SCENE_FRAME.height),
  '--frame-center-x': String(SCENE_FRAME.x),
  '--frame-center-y': String(SCENE_FRAME.y),
}

export function ParallaxLanding() {
  const sceneRef = useRef<HTMLDivElement>(null)

  useParallaxLandingAnimation(sceneRef)

  return (
    <main className="parallax-landing">
      {/* La escena ya no se oculta en bloque, y no es un descuido: dentro vive la
          puerta, que es un destino real y tiene que poder alcanzarse con el
          teclado. Un botón dentro de un `aria-hidden` no existe para un lector de
          pantalla, y ese atributo no se puede deshacer desde dentro.
          No se pierde nada: cada ilustración lleva ya `alt=""`, que es lo que de
          verdad las declara decorativas. */}
      <div className="parallax-landing__scene" ref={sceneRef} style={FRAME_VARS}>
        {SCENE_LAYERS.map((layer) => (
          <img
            key={layer.id}
            className={`parallax-landing__layer parallax-landing__layer--${layer.id}`}
            src={layer.src}
            alt=""
            draggable="false"
          />
        ))}

        {/* Las gotas se pintan dos veces dentro de la misma pista: es lo que
            permite que el ascenso se repita sin corte. Ver el hook de animación. */}
        <div className="parallax-landing__drops">
          <div className="parallax-landing__drops-track">
            <img
              className="parallax-landing__drops-tile"
              src={DROPS_LAYER_SRC}
              alt=""
              draggable="false"
            />
            <img
              className="parallax-landing__drops-tile"
              src={DROPS_LAYER_SRC}
              alt=""
              draggable="false"
            />
          </div>
        </div>

        {/* El primer plano cierra la escena: va después de las gotas para quedar
            por delante de todo lo demás. Es el elemento LCP de la portada, así
            que se marca con prioridad alta para que el navegador no la trate
            como una imagen decorativa más. */}
        <img
          className="parallax-landing__layer parallax-landing__layer--foreground"
          src={FOREGROUND_LAYER_SRC}
          alt=""
          draggable="false"
          fetchPriority="high"
        />

        {/* Las clases del prado le dan las dos cosas que necesita: la caja del dibujo
            —su recorrido va en fracciones de la ilustración— y el barrido de cámara del
            terreno que pisa. Fuera de esta capa camina por donde no hay camino. */}
        <div className="parallax-landing__layer parallax-landing__layer--meadow parallax-landing__walker-layer">
          <PathWalker />
        </div>

        {/* La puerta, en una capa propia que lleva las clases de la biblioteca.
            Eso le da dos cosas de golpe: la misma caja que la ilustración del
            edificio, y el mismo barrido de cámara —la animación selecciona por esa
            clase, así que anima las dos a la vez y la zona nunca se despega de la
            puerta pintada—.

            Va la última de todas, por encima incluso del primer plano de flores:
            es invisible, así que no tapa nada, y así ninguna capa decorativa le
            roba la pulsación por quedar por delante. */}
        <div className="parallax-landing__layer parallax-landing__layer--library parallax-landing__door-layer">
          <LibraryDoor />
        </div>
      </div>

      {/* El cartel de bienvenida, fuera de la escena: se queda quieto en su
          esquina mientras la cámara barre por debajo.

          Va envuelto porque el cartel dice cómo se ve y el envoltorio dice
          dónde va — el mismo reparto que la puerta y su capa. */}
      <div className="parallax-landing__welcome-sign">
        <WelcomeSign />
      </div>
    </main>
  )
}
