import { useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { ASSETS, LIBRARY_ANIMATION_CONFIG as config } from './libraryEntranceConfig'
import { useLibraryEntranceAnimation } from './useLibraryEntranceAnimation'
import type { StyleWithVars } from '../shared/styleWithVars'
import './LibraryEntrance.scss'

const portalCenter = {
  x: `${(config.portal.left + config.portal.width / 2) * 100}%`,
  y: `${(config.portal.top + config.portal.height / 2) * 100}%`,
}

const stageStyle: StyleWithVars = {
  '--portal-left': config.portal.left,
  '--portal-top': config.portal.top,
  '--portal-width': config.portal.width,
  '--portal-height': config.portal.height,
  '--portal-bleed': config.portal.bleed,
  '--door-center-overlap': config.doors3D.centerOverlap,
  '--door-seam-fade-start': config.doors3D.seamFadeStart,
  '--door-perspective-ratio': config.doors3D.perspectiveRatio,
  '--sky-overscan': config.facade.sky.overscan,
}

// La cara trasera reutiliza el PNG de la frontal, oscurecido y desaturado: es el dorso
// sin talla de una hoja de puerta.
const doorBackFaceStyle: StyleWithVars = {
  '--door-back-brightness': config.doors3D.backBrightness,
  '--door-back-saturation': config.doors3D.backSaturation,
}

interface LibraryEntranceProps {
  // Se llama cuando las ilustraciones están cargadas y la escena lista para verse.
  onReady?: () => void
}

export function LibraryEntrance({ onReady }: LibraryEntranceProps) {
  const navigate = useNavigate()
  const sectionRef = useRef<HTMLElement>(null)
  const stageRef = useRef<HTMLDivElement>(null)
  const facadeGroupRef = useRef<HTMLDivElement>(null)
  const interiorRef = useRef<HTMLImageElement>(null)
  const skyRef = useRef<HTMLImageElement>(null)
  const buildingRef = useRef<HTMLImageElement>(null)
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
    skyRef,
    buildingRef,
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
  }, () => {
    // Al vestíbulo, que arranca con esta misma ilustración del interior en la misma
    // posición.
    navigate('/biblioteca')
  })

  const onReadyRef = useRef(onReady)
  onReadyRef.current = onReady
  useEffect(() => {
    if (isReady) onReadyRef.current?.()
  }, [isReady])

  return (
    <section className="library-entrance" ref={sectionRef} data-ready={isReady}>
      <div className="library-entrance__stage" style={stageStyle} ref={stageRef}>
        {/* Lo que se ve al abrirse las puertas. Es la misma ilustración con la
            que arranca el vestíbulo y en la misma posición, así que al terminar
            la secuencia el cambio de pantalla no se percibe. */}
        <img className="library-entrance__interior" ref={interiorRef} src={ASSETS.interior} alt="" draggable="false" />

        <canvas className="library-entrance__particles library-entrance__particles--back" ref={particlesBackRef} />

        <div className="library-entrance__glow" ref={glowRef} aria-hidden="true" />

        <div
          className="library-entrance__facade-group"
          ref={facadeGroupRef}
          style={{ transformOrigin: `${portalCenter.x} ${portalCenter.y}` }}
        >
          {/* Fondo de la fachada: lo único de la escena que se mueve. */}
          <img className="library-entrance__sky" ref={skyRef} src={ASSETS.sky} alt="" draggable="false" />

          {/* La biblioteca va quieta: las puertas están encajadas en su vano. */}
          <img
            className="library-entrance__building"
            ref={buildingRef}
            src={ASSETS.library}
            alt=""
            draggable="false"
          />

          <div className="library-entrance__doors">
            <div className="library-entrance__door library-entrance__door--left" ref={doorLeftRef}>
              <div className="door3d__face door3d__face--front">
                <img ref={doorLeftImgRef} src={ASSETS.doorLeft} alt="" draggable="false" />
              </div>
              <div className="door3d__face door3d__face--back" style={doorBackFaceStyle}>
                <img src={ASSETS.doorLeft} alt="" draggable="false" />
              </div>
              <span className="library-entrance__door-shade" ref={doorLeftShadeRef} aria-hidden="true" />
            </div>
            <div className="library-entrance__door library-entrance__door--right" ref={doorRightRef}>
              <div className="door3d__face door3d__face--front">
                <img ref={doorRightImgRef} src={ASSETS.doorRight} alt="" draggable="false" />
              </div>
              <div className="door3d__face door3d__face--back" style={doorBackFaceStyle}>
                <img src={ASSETS.doorRight} alt="" draggable="false" />
              </div>
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

      {!isReady && <div className="library-entrance__loading" aria-hidden="true" />}
    </section>
  )
}
