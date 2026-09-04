import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { WELCOME_SIGN_SRC } from './parallaxLandingConfig'
import { buildWelcomeSignHide, buildWelcomeSignReveal } from './welcomeSignReveal'
import { prefersReducedMotion } from '../shared/prefersReducedMotion'
import './WelcomeSign.scss'

// El cartel que cuenta de qué va la biblioteca.
//
// En reposo es un fantasma que se asoma y se va —eso lo lleva el CSS solo—, y
// al pulsarlo se monta a trozos con la aparición en cuadrícula. Volver a
// pulsarlo lo devuelve a su fantasma: no es un callejón sin salida.
//
// Es un botón y no una imagen decorativa porque es un destino real: se puede
// pulsar, así que tiene que poder alcanzarse también con el teclado y anunciarse
// a un lector de pantalla. La ilustración de dentro sigue siendo decorativa
// —`alt=""`—: lo que hay que anunciar es la acción, no el dibujo.
//
// El texto del cartel va pintado dentro de la propia imagen. No es lo ideal —un
// lector de pantalla no puede leerlo—, y por eso la etiqueta del botón dice de
// qué va; cuando el contenido de bienvenida exista como texto de verdad, esta
// imagen pasa a ser solo el marco.
export function WelcomeSign() {
  const [isRevealed, setIsRevealed] = useState(false)
  const imageRef = useRef<HTMLImageElement>(null)
  const layerRef = useRef<HTMLSpanElement>(null)
  const timelineRef = useRef<gsap.core.Timeline | null>(null)
  // El "ocupado" va en una referencia y no en el estado: sirve para descartar
  // pulsaciones dentro del mismo instante, y un cambio de estado no se ha
  // aplicado todavía cuando llega la segunda.
  const isBusyRef = useRef(false)

  // Al desmontar, la timeline se mata: si no, seguiría escribiendo sobre nodos
  // que ya no están en el documento.
  useEffect(() => () => {
    timelineRef.current?.kill()
  }, [])

  const handleClick = () => {
    const image = imageRef.current
    const layer = layerRef.current
    if (!image || !layer) return

    // Una pulsación mientras la cuadrícula está en marcha no hace nada: dejarla
    // entrar significaría montar una rejilla nueva encima de la que se está
    // animando.
    if (isBusyRef.current) return

    const isHiding = isRevealed

    // Cómo queda el cartel cuando el barrido termina — y también cuando no hay
    // barrido que valga. Lo que no puede pasar es que una pulsación no haga
    // nada.
    const settle = () => {
      if (isHiding) {
        // Se sueltan los estilos que escribió GSAP y el cartel vuelve a su
        // ciclo de fantasma, que es cosa del CSS. El ciclo arranca de cero, o
        // sea invisible, así que el relevo no se ve.
        gsap.set(image, { clearProps: 'opacity,animation' })
      } else {
        gsap.set(image, { opacity: 1 })
      }

      setIsRevealed(!isHiding)
    }

    // Al aparecer, el cartel arranca apagado del todo: si no, su fantasma se
    // vería por los huecos que la cuadrícula aún no ha cubierto. Al irse no
    // hace falta —la rejilla que lo tapa es idéntica a él—, y de apagarlo se
    // encarga la propia timeline en su primer instante.
    //
    // `animation: 'none'` no es opcional: mientras el ciclo de fantasma corre,
    // manda él sobre la opacidad —una animación CSS pisa cualquier valor
    // escrito a mano, incluido el que pone GSAP—, y el cartel seguiría
    // asomándose por debajo de la rejilla.
    if (!isHiding) {
      gsap.set(image, { animation: 'none', opacity: 0 })
    }

    const wantsStillness = prefersReducedMotion()
    const timeline = wantsStillness
      ? null
      : isHiding
        ? buildWelcomeSignHide(layer, image)
        : buildWelcomeSignReveal(layer, image)

    // Sin cuadrícula —porque se ha pedido no mover cosas, o porque el cartel aún
    // no tiene tamaño— el cambio es instantáneo.
    if (!timeline) {
      settle()
      return
    }

    isBusyRef.current = true
    timelineRef.current = timeline

    void timeline.then(() => {
      isBusyRef.current = false
      timelineRef.current = null
      settle()
    })
  }

  return (
    <button
      type="button"
      className="welcome-sign"
      onClick={handleClick}
      aria-label={isRevealed ? 'Ocultar la bienvenida' : 'Leer de qué va esta biblioteca'}
    >
      <img
        ref={imageRef}
        className="welcome-sign__image"
        src={WELCOME_SIGN_SRC}
        alt=""
        draggable="false"
      />

      {/* Donde se monta la cuadrícula mientras dura la aparición. El resto del
          tiempo está vacía: no pinta nada y no estorba a nadie. */}
      <span ref={layerRef} className="welcome-sign__layer" aria-hidden="true" />
    </button>
  )
}
