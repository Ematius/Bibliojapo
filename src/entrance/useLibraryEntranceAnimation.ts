import { useCallback, useEffect, useRef, useState, type RefObject } from 'react'
import gsap from 'gsap'
import { LIBRARY_ANIMATION_CONFIG as config } from './libraryEntranceConfig'
import { fitDoorImageToContainer } from './getOpaqueBounds'
import { LibraryParticles } from './LibraryParticles'
import { prefersReducedMotion } from '../shared/prefersReducedMotion'

export interface LibraryEntranceRefs {
  sectionRef: RefObject<HTMLElement | null>
  facadeGroupRef: RefObject<HTMLDivElement | null>
  interiorRef: RefObject<HTMLImageElement | null>
  skyRef: RefObject<HTMLImageElement | null>
  buildingRef: RefObject<HTMLImageElement | null>
  doorLeftRef: RefObject<HTMLDivElement | null>
  doorRightRef: RefObject<HTMLDivElement | null>
  doorLeftImgRef: RefObject<HTMLImageElement | null>
  doorRightImgRef: RefObject<HTMLImageElement | null>
  doorLeftShadeRef: RefObject<HTMLSpanElement | null>
  doorRightShadeRef: RefObject<HTMLSpanElement | null>
  glowRef: RefObject<HTMLDivElement | null>
  spillRef: RefObject<HTMLDivElement | null>
  particlesBackRef: RefObject<HTMLCanvasElement | null>
  particlesFrontRef: RefObject<HTMLCanvasElement | null>
  enterButtonRef: RefObject<HTMLButtonElement | null>
}

function waitForImage(imgEl: HTMLImageElement | null): Promise<void> {
  if (!imgEl) return Promise.resolve()
  if (imgEl.complete && imgEl.naturalWidth > 0) return Promise.resolve()
  return new Promise((resolve) => {
    imgEl.addEventListener('load', () => resolve(), { once: true })
    imgEl.addEventListener('error', () => resolve(), { once: true })
  })
}

function waitForNextFrames(count = 2): Promise<void> {
  return new Promise((resolve) => {
    const step = (remaining: number) => {
      if (remaining <= 0) return resolve()
      requestAnimationFrame(() => step(remaining - 1))
    }
    step(count)
  })
}

// `onEnterComplete` se dispara una sola vez, al llegar al final de la secuencia. La
// puerta es un umbral, no un destino: a dónde se sigue lo decide quien llama.
export function useLibraryEntranceAnimation(refs: LibraryEntranceRefs, onEnterComplete: () => void) {
  const [isReady, setIsReady] = useState(false)
  const enterActionRef = useRef<() => void>(() => {})
  const readyRef = useRef(false)

  // En un ref para que el efecto no dependa de la identidad de la función: si dependiera,
  // cada render con una lambda nueva remontaría la animación entera.
  const onEnterCompleteRef = useRef(onEnterComplete)
  onEnterCompleteRef.current = onEnterComplete
  const hasEnteredRef = useRef(false)

  const handleEnterClick = useCallback(() => {
    if (!readyRef.current) return
    enterActionRef.current()
  }, [])

  useEffect(() => {
    const {
      sectionRef,
      interiorRef,
      skyRef,
      buildingRef,
      facadeGroupRef,
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
    } = refs

    // Se pregunta una vez y se guarda: la entrada monta la animación en varios tramos y
    // todos tienen que decidir lo mismo.
    const wantsStillness = prefersReducedMotion()

    let particles: LibraryParticles | null = null
    let ctx: ReturnType<typeof gsap.context> | null = null
    let doorResizeObserver: ResizeObserver | null = null
    let cancelled = false

    async function setup() {
      await Promise.all([
        waitForImage(interiorRef.current),
        waitForImage(skyRef.current),
        waitForImage(buildingRef.current),
        waitForImage(doorLeftImgRef.current),
        waitForImage(doorRightImgRef.current),
      ])

      if (cancelled) return

      await waitForNextFrames(2)
      if (cancelled) return

      const doorLeftEl = doorLeftRef.current
      const doorRightEl = doorRightRef.current
      const doorLeftImgEl = doorLeftImgRef.current
      const doorRightImgEl = doorRightImgRef.current
      const backCanvas = particlesBackRef.current
      const frontCanvas = particlesFrontRef.current

      if (!doorLeftEl || !doorRightEl || !doorLeftImgEl || !doorRightImgEl || !backCanvas || !frontCanvas) return

      fitDoorImageToContainer(doorLeftImgEl, doorLeftEl)
      fitDoorImageToContainer(doorRightImgEl, doorRightEl)

      // El ajuste escribe medidas en píxeles sobre la <img>, así que hay que rehacerlo
      // cuando su contenedor cambia de tamaño. Se observa el contenedor y no la ventana:
      // así también se recalcula al tocar PORTAL en caliente.
      //
      // Se empieza a observar aquí y no antes porque el ResizeObserver entrega una primera
      // medición nada más observar, y con las imágenes sin cargar mediría una silueta sin
      // dimensiones.
      doorResizeObserver = new ResizeObserver(() => {
        fitDoorImageToContainer(doorLeftImgEl, doorLeftEl)
        fitDoorImageToContainer(doorRightImgEl, doorRightEl)
      })
      doorResizeObserver.observe(doorLeftEl)
      doorResizeObserver.observe(doorRightEl)

      particles = new LibraryParticles({
        backCanvas,
        frontCanvas,
        config: config.particles,
      })
      particles.start()

      readyRef.current = true
      setIsReady(true)

      const enterHall = () => {
        if (hasEnteredRef.current) return
        hasEnteredRef.current = true
        onEnterCompleteRef.current()
      }

      ctx = gsap.context(() => {
        if (wantsStillness) {
          particles?.setGlobalOpacity(0.15)

          enterActionRef.current = () => {
            // Sin este aviso, la fachada se funde y deja el interior a la vista —la MISMA
            // ilustración con la que arranca el vestíbulo— sin haber cambiado de ruta:
            // parece que se ha entrado, pero no hay carteles ni barra y no se sale de ahí.
            const tl = gsap.timeline({ onComplete: enterHall })
            tl.to(doorLeftRef.current, { rotateY: config.doors.leftRotationOpen, duration: 0.6, ease: 'power2.inOut' }, 0)
            tl.to(doorRightRef.current, { rotateY: config.doors.rightRotationOpen, duration: 0.6, ease: 'power2.inOut' }, 0)
            tl.to(glowRef.current, { opacity: config.glow.open, duration: 0.6, ease: 'sine.out' }, 0)
            tl.to(spillRef.current, { opacity: config.lightSpill.max, duration: 0.6, ease: 'sine.out' }, 0)
            tl.to(facadeGroupRef.current, { opacity: 0, duration: 0.5, ease: 'sine.in' }, 0.6)
          }

          return
        }

        // Va suelta y no dentro de la timeline de las puertas: tiene que seguir viva con la
        // entrada cerrada y abierta por igual. El contexto de GSAP la revierte al desmontar.
        const sky = config.facade.sky
        gsap.fromTo(
          skyRef.current,
          { xPercent: -sky.amplitudePercent / 2 },
          {
            xPercent: sky.amplitudePercent / 2,
            duration: sky.durationSeconds,
            ease: sky.ease,
            repeat: -1,
            yoyo: true,
          },
        )

        const [openingStart, openingEnd] = config.phases.opening
        const [openStart, openEnd] = config.phases.open
        const [pushStart, pushEnd] = config.phases.push

        const particlesProxy = { value: 0.02 }
        const syncParticles = () => particles?.setGlobalOpacity(particlesProxy.value)
        gsap.set(glowRef.current, { opacity: config.glow.closed })
        syncParticles()

        const tl = gsap.timeline({ paused: true, onComplete: enterHall })

        const openingDuration = openingEnd - openingStart
        tl.to(doorLeftRef.current, { rotateY: config.doors.leftRotationOpen, duration: openingDuration, ease: 'power1.inOut' }, openingStart)
        tl.to(doorRightRef.current, { rotateY: config.doors.rightRotationOpen, duration: openingDuration, ease: 'power1.inOut' }, openingStart)

        tl.to(doorLeftShadeRef.current, { opacity: config.doors.shadeMaxOpacity, duration: openingDuration / 2, ease: 'sine.inOut' }, openingStart)
        tl.to(doorLeftShadeRef.current, { opacity: 0, duration: openingDuration / 2, ease: 'sine.inOut' }, openingStart + openingDuration / 2)
        tl.to(doorRightShadeRef.current, { opacity: config.doors.shadeMaxOpacity, duration: openingDuration / 2, ease: 'sine.inOut' }, openingStart)
        tl.to(doorRightShadeRef.current, { opacity: 0, duration: openingDuration / 2, ease: 'sine.inOut' }, openingStart + openingDuration / 2)

        tl.to(glowRef.current, { opacity: config.glow.openingPeak, duration: openingDuration, ease: 'none' }, openingStart)
        tl.to(spillRef.current, { opacity: config.lightSpill.max * 0.4, duration: openingDuration, ease: 'none' }, openingStart)
        tl.to(particlesProxy, { value: 0.5, duration: openingDuration, ease: 'none', onUpdate: syncParticles }, openingStart)

        const openDuration = openEnd - openStart
        tl.to(glowRef.current, { opacity: config.glow.open, duration: openDuration, ease: 'none' }, openStart)
        tl.to(spillRef.current, { opacity: config.lightSpill.max, duration: openDuration, ease: 'none' }, openStart)
        tl.to(particlesProxy, { value: 1, duration: openDuration, ease: 'none', onUpdate: syncParticles }, openStart)

        const pushDuration = pushEnd - pushStart
        tl.to(
          facadeGroupRef.current,
          {
            scale: config.push.facadeMaxScale,
            opacity: config.push.facadeMinOpacity,
            filter: `blur(${config.push.facadeMaxBlurPx}px)`,
            duration: pushDuration,
            ease: 'power1.in',
          },
          pushStart,
        )
        tl.fromTo(
          interiorRef.current,
          { scale: config.push.interiorFromScale },
          { scale: config.push.interiorToScale, duration: pushDuration, ease: 'power1.out' },
          pushStart,
        )
        tl.to(glowRef.current, { opacity: 0, duration: pushDuration, ease: 'none' }, pushStart)
        tl.to(spillRef.current, { opacity: 0, duration: pushDuration, ease: 'none' }, pushStart)
        tl.to(particlesProxy, { value: 0.85, duration: pushDuration, ease: 'none', onUpdate: syncParticles }, pushStart)

        // Las fases van en fracciones de 1; esto estira la timeline a los segundos reales.
        tl.duration(config.enter.durationSeconds)

        enterActionRef.current = () => {
          if (tl.progress() > 0) return
          if (enterButtonRef.current) enterButtonRef.current.style.pointerEvents = 'none'
          tl.play()
        }
      }, sectionRef)
    }

    setup()

    return () => {
      cancelled = true
      doorResizeObserver?.disconnect()
      ctx?.revert()
      particles?.destroy()
      readyRef.current = false
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return { isReady, handleEnterClick }
}
