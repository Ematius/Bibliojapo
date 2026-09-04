import { useRef } from 'react'
import { LibraryDoor } from './LibraryDoor'
import { PathWalker } from './PathWalker'
import { WelcomeSign } from './WelcomeSign'
import {
  DROPS_LAYER_SRC,
  FOREGROUND_LAYER_SRC,
  SCENE_LAYERS,
} from './parallaxLandingConfig'
import { useParallaxLandingAnimation } from './useParallaxLandingAnimation'
import './ParallaxLanding.scss'

// Landing de entrada: cuatro ilustraciones superpuestas que componen una sola
// escena. El valle queda al fondo, la biblioteca en el plano medio, el prado de
// flores delante y las gotas ascendiendo por encima de todo.
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
      <div className="parallax-landing__scene" ref={sceneRef}>
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

      {/* Fuera de la escena: la caminante no acompaña al barrido de cámara, su
          recorrido va referido a la ventana y no a las capas. */}
      <PathWalker />

      {/* El cartel de bienvenida, también fuera de la escena y por lo mismo:
          se queda quieto en su esquina mientras la cámara barre por debajo.

          Va envuelto porque el cartel dice cómo se ve y el envoltorio dice
          dónde va — el mismo reparto que la puerta y su capa. */}
      <div className="parallax-landing__welcome-sign">
        <WelcomeSign />
      </div>
    </main>
  )
}
