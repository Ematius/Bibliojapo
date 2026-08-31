import { useRef } from 'react'
import { PathWalker } from './PathWalker'
import { DROPS_LAYER_SRC, FOREGROUND_LAYER_SRC, SCENE_LAYERS } from './parallaxLandingConfig'
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
      {/* La escena entera es decorativa: ninguna capa aporta información que no
          esté en el texto, así que se oculta en bloque a los lectores de pantalla. */}
      <div className="parallax-landing__scene" ref={sceneRef} aria-hidden="true">
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
            por delante de todo lo demás. */}
        <img
          className="parallax-landing__layer parallax-landing__layer--foreground"
          src={FOREGROUND_LAYER_SRC}
          alt=""
          draggable="false"
        />
      </div>

      {/* Fuera de la escena: la caminante no acompaña al barrido de cámara, su
          recorrido va referido a la ventana y no a las capas. */}
      <PathWalker />
    </main>
  )
}
