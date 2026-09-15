import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { WELCOME_SIGN_SRC } from './parallaxLandingConfig'
import { buildWelcomeSignHide, buildWelcomeSignReveal } from './welcomeSignReveal'
import { zoomWelcomeSign } from './welcomeSignZoom'
import { prefersReducedMotion } from '../shared/prefersReducedMotion'
import './WelcomeSign.scss'

// El cartel que cuenta de qué va la biblioteca. En reposo es un fantasma que se asoma
// —eso lo lleva el CSS—, y al pulsarlo se monta a trozos hasta el centro de la pantalla.
//
// Es un botón y no una imagen decorativa porque es un destino real. La ilustración de
// dentro sí es decorativa (`alt=""`): lo que hay que anunciar es la acción. El texto va
// pintado dentro de la imagen —por eso la etiqueta del botón dice de qué va—; cuando
// exista como texto de verdad, la imagen pasa a ser solo el marco.
export function WelcomeSign() {
  const [isRevealed, setIsRevealed] = useState(false)
  const buttonRef = useRef<HTMLButtonElement>(null)
  const imageRef = useRef<HTMLImageElement>(null)
  const layerRef = useRef<HTMLSpanElement>(null)
  const timelineRef = useRef<gsap.core.Timeline | null>(null)
  // En una referencia y no en el estado: descarta pulsaciones del mismo instante, y un
  // cambio de estado todavía no se ha aplicado cuando llega la segunda.
  const isBusyRef = useRef(false)

  // Al desmontar, la timeline se mata: si no, seguiría escribiendo sobre nodos que ya
  // no están en el documento.
  useEffect(() => () => {
    timelineRef.current?.kill()
  }, [])

  const runTransition = (isHiding: boolean) => {
    const button = buttonRef.current
    const image = imageRef.current
    const layer = layerRef.current
    if (!button || !image || !layer) return

    if (isBusyRef.current) return

    // Se da por abierto al pulsar y no al terminar: de este estado depende que el cartel
    // esté por delante de la caminante MIENTRAS crece. Al cerrar lo suelta `settle`, al
    // final, para que también encoja por delante.
    if (!isHiding) setIsRevealed(true)

    // Cómo queda el cartel al terminar el barrido, y también cuando no hay barrido: lo
    // que no puede pasar es que una pulsación no haga nada.
    const settle = () => {
      if (isHiding) {
        // El ciclo de fantasma vuelve a ser cosa del CSS. Arranca invisible, así que el
        // relevo no se ve.
        gsap.set(image, { clearProps: 'opacity,animation' })
      } else {
        gsap.set(image, { opacity: 1 })
      }

      setIsRevealed(!isHiding)
    }

    // Al aparecer, el cartel arranca apagado del todo o su fantasma se vería por los
    // huecos. Al irse no hace falta: la rejilla que lo tapa es idéntica a él.
    //
    // `animation: 'none'` no es opcional: mientras el ciclo de fantasma corre, una
    // animación CSS pisa cualquier valor escrito a mano, incluido el de GSAP.
    if (!isHiding) {
      gsap.set(image, { animation: 'none', opacity: 0 })
    }

    const wantsStillness = prefersReducedMotion()
    const timeline = wantsStillness
      ? null
      : isHiding
        ? buildWelcomeSignHide(layer, image)
        : buildWelcomeSignReveal(layer, image)

    // Con la duración del barrido, para que crecer y montarse terminen a la vez. Sin
    // cuadrícula no hay duración que copiar y el cartel salta a su sitio.
    zoomWelcomeSign(button, { open: !isHiding, duration: timeline?.duration() ?? 0 })

    // Sin cuadrícula el cambio es instantáneo.
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

  // Se abre sola al entrar en la página. Con un `setTimeout(0)` y no a las bravas: en
  // desarrollo, StrictMode monta, desmonta y remonta cada efecto una vez de más, y
  // arrancar aquí la timeline la mataría a medio crecer sin que nada la reanude —el
  // cartel se quedaría bloqueado para siempre—. El temporizador cae fuera de ese ciclo
  // fantasma, así que solo sobrevive el que programa el montaje real.
  useEffect(() => {
    const timeoutId = window.setTimeout(() => runTransition(false), 0)
    return () => window.clearTimeout(timeoutId)
  }, [])

  // Con el cartel abierto, cualquier clic lo cierra —el propio cartel incluido—. Se
  // escucha en captura y se corta ahí mismo: si el clic cayera en la puerta, dejarlo
  // seguir su curso normal la abriría a la vez que cierra el cartel.
  useEffect(() => {
    if (!isRevealed) return

    const handleOutsideClick = (event: MouseEvent) => {
      if (isBusyRef.current) return
      event.stopPropagation()
      runTransition(true)
    }

    document.addEventListener('click', handleOutsideClick, { capture: true })
    return () => document.removeEventListener('click', handleOutsideClick, { capture: true })
  }, [isRevealed])

  return (
    <button
      ref={buttonRef}
      type="button"
      className="welcome-sign"
      onClick={() => runTransition(false)}
      // Lo que un lector de pantalla necesita para anunciarlo, y de lo que tira el CSS
      // para subirlo por delante del resto de la portada.
      aria-expanded={isRevealed}
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
