import { useEffect, useRef, type CSSProperties } from 'react'
import { createPortal } from 'react-dom'
import { ASSETS, PORTAL, DOORS_3D, LIBRARY_ANIMATION_CONFIG } from './libraryEntranceConfig'
import { useVh } from '../shared/useVh'
import { useLibraryEntranceAnimation } from './useLibraryEntranceAnimation'
import { useAisleSweep } from './useAisleSweep'
import { hasEnteredLibrary } from './enteredLibrary'
import { AisleSigns } from './AisleSigns'
import './LibraryEntrance.scss'

// Estilo con custom properties CSS (--variable) además de las propiedades
// estándar de React — CSSProperties no las declara por defecto.
type StyleWithVars = CSSProperties & Record<`--${string}`, string | number>

const portalCenter = {
  x: `${(PORTAL.left + PORTAL.width / 2) * 100}%`,
  y: `${(PORTAL.top + PORTAL.height / 2) * 100}%`,
}

const stageStyle: StyleWithVars = {
  '--portal-left': PORTAL.left,
  '--portal-top': PORTAL.top,
  '--portal-width': PORTAL.width,
  '--portal-height': PORTAL.height,
  '--portal-bleed': PORTAL.bleed,
  '--door-center-overlap': DOORS_3D.centerOverlap,
  '--door-seam-fade-start': DOORS_3D.seamFadeStart,
}

// La cara trasera reutiliza el mismo PNG que la frontal, oscurecido y
// desaturado para simular el dorso sin talla de una hoja de puerta real.
const doorBackFaceStyle: StyleWithVars = {
  '--door-back-brightness': 0.6,
  '--door-back-saturation': 0.75,
}

export function LibraryEntrance() {
  useVh()

  const sectionRef = useRef<HTMLElement>(null)
  const stageRef = useRef<HTMLDivElement>(null)
  const facadeGroupRef = useRef<HTMLDivElement>(null)
  const interiorRef = useRef<HTMLImageElement>(null)
  const exteriorRef = useRef<HTMLImageElement>(null)
  const doorLeftRef = useRef<HTMLDivElement>(null)
  const doorRightRef = useRef<HTMLDivElement>(null)
  const doorLeftImgRef = useRef<HTMLImageElement>(null)
  const doorRightImgRef = useRef<HTMLImageElement>(null)
  const doorLeftShadeRef = useRef<HTMLSpanElement>(null)
  const doorRightShadeRef = useRef<HTMLSpanElement>(null)
  const glowRef = useRef<HTMLDivElement>(null)
  const spillRef = useRef<HTMLDivElement>(null)
  const particlesBackRef = useRef<HTMLCanvasElement>(null)
  const particlesFrontRef = useRef<HTMLCanvasElement>(null)
  const enterButtonRef = useRef<HTMLButtonElement>(null)

  const { isReady, handleEnterClick } = useLibraryEntranceAnimation({
    sectionRef,
    facadeGroupRef,
    interiorRef,
    exteriorRef,
    doorLeftRef,
    doorRightRef,
    doorLeftImgRef,
    doorRightImgRef,
    doorLeftShadeRef,
    doorRightShadeRef,
    glowRef,
    spillRef,
    particlesBackRef,
    particlesFrontRef,
    enterButtonRef,
  })

  const { sweepRef, sweepToAisle } = useAisleSweep(stageRef)

  // Al volver de un pasillo la entrada aparece ya abierta: saltamos al final del
  // scroll fijado en vez de repetir toda la animación de las puertas.
  useEffect(() => {
    if (!isReady || !hasEnteredLibrary()) return
    window.scrollTo(0, window.innerHeight * LIBRARY_ANIMATION_CONFIG.scroll.viewportHeights)
  }, [isReady])

  return (
    <section className="library-entrance" ref={sectionRef} data-ready={isReady}>
      <div className="library-entrance__stage" style={stageStyle} ref={stageRef}>
        <img className="library-entrance__interior" ref={interiorRef} src={ASSETS.interior} alt="" draggable="false" />

        <AisleSigns onSelect={sweepToAisle} />

        <canvas className="library-entrance__particles library-entrance__particles--back" ref={particlesBackRef} />

        <div className="library-entrance__glow" ref={glowRef} aria-hidden="true" />

        <div
          className="library-entrance__facade-group"
          ref={facadeGroupRef}
          style={{ transformOrigin: `${portalCenter.x} ${portalCenter.y}` }}
        >
          <img className="library-entrance__exterior" ref={exteriorRef} src={ASSETS.exterior} alt="" draggable="false" />

          <div className="library-entrance__doors">
            <div className="library-entrance__door library-entrance__door--left" ref={doorLeftRef}>
              <div className="door3d__face door3d__face--front">
                <img ref={doorLeftImgRef} src={ASSETS.doorLeft} alt="" draggable="false" />
              </div>
              <div className="door3d__face door3d__face--back" style={doorBackFaceStyle}>
                <img src={ASSETS.doorLeft} alt="" draggable="false" />
              </div>
              <span className="door3d__edge door3d__edge--a door3d__edge--hinge" />
              <span className="door3d__edge door3d__edge--b door3d__edge--inner" />
              <span className="door3d__edge door3d__edge--top" />
              <span className="door3d__edge door3d__edge--bottom" />
              <span className="library-entrance__door-shade" ref={doorLeftShadeRef} aria-hidden="true" />
            </div>
            <div className="library-entrance__door library-entrance__door--right" ref={doorRightRef}>
              <div className="door3d__face door3d__face--front">
                <img ref={doorRightImgRef} src={ASSETS.doorRight} alt="" draggable="false" />
              </div>
              <div className="door3d__face door3d__face--back" style={doorBackFaceStyle}>
                <img src={ASSETS.doorRight} alt="" draggable="false" />
              </div>
              <span className="door3d__edge door3d__edge--a door3d__edge--inner" />
              <span className="door3d__edge door3d__edge--b door3d__edge--hinge" />
              <span className="door3d__edge door3d__edge--top" />
              <span className="door3d__edge door3d__edge--bottom" />
              <span className="library-entrance__door-shade" ref={doorRightShadeRef} aria-hidden="true" />
            </div>
          </div>
        </div>

        <div className="library-entrance__spill" ref={spillRef} aria-hidden="true" />

        <canvas className="library-entrance__particles library-entrance__particles--front" ref={particlesFrontRef} />

        <button
          type="button"
          className="library-entrance__enter"
          ref={enterButtonRef}
          onClick={handleEnterClick}
          aria-label="Entrar en la biblioteca"
        />
      </div>

      {/* Fuera de la sección, colgado del body: la sección se fija y se suelta
          durante el barrido, y el pin la desplaza. Aquí el barrido queda pegado
          a la ventana y no se entera de nada de eso. */}
      {createPortal(
        <img
          className="library-entrance__sweep"
          ref={sweepRef}
          alt=""
          aria-hidden="true"
          draggable="false"
        />,
        document.body,
      )}

      {!isReady && <div className="library-entrance__loading" aria-hidden="true" />}
    </section>
  )
}
