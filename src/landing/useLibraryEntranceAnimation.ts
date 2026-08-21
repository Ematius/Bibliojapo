import { useCallback, useEffect, useRef, useState, type RefObject } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { ScrollToPlugin } from 'gsap/ScrollToPlugin'
import { LIBRARY_ANIMATION_CONFIG as config } from './libraryEntranceConfig'
import { fitDoorImageToContainer } from './getOpaqueBounds'
import { LibraryParticles } from './LibraryParticles'

gsap.registerPlugin(ScrollTrigger, ScrollToPlugin)

export interface LibraryEntranceRefs {
  sectionRef: RefObject<HTMLElement | null>
  facadeGroupRef: RefObject<HTMLDivElement | null>
  interiorRef: RefObject<HTMLImageElement | null>
  exteriorRef: RefObject<HTMLImageElement | null>
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

// Mide la hoja ya ajustada (fitDoorImageToContainer) y expone su grosor real
// como custom property CSS, para que los cantos 3D (.door3d__edge) puedan
// posicionarse con matemáticas exactas. Se recalcula solo al cargar y en
// resize, nunca por frame.
function applyDoorGeometryVars(containerEl: HTMLElement, depthRatio: number): void {
  const rect = containerEl.getBoundingClientRect()
  containerEl.style.setProperty('--door-depth', `${rect.width * depthRatio}px`)
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

export function useLibraryEntranceAnimation(refs: LibraryEntranceRefs) {
  const [isReady, setIsReady] = useState(false)
  const enterActionRef = useRef<() => void>(() => {})
  const readyRef = useRef(false)

  const handleEnterClick = useCallback(() => {
    if (!readyRef.current) return
    enterActionRef.current()
  }, [])

  useEffect(() => {
    const {
      sectionRef,
      interiorRef,
      exteriorRef,
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

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    let particles: LibraryParticles | null = null
    let ctx: ReturnType<typeof gsap.context> | null = null
    let cancelled = false

    async function setup() {
      await Promise.all([
        waitForImage(interiorRef.current),
        waitForImage(exteriorRef.current),
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
      applyDoorGeometryVars(doorLeftEl, config.doors3D.depthRatio)
      applyDoorGeometryVars(doorRightEl, config.doors3D.depthRatio)

      particles = new LibraryParticles({
        backCanvas,
        frontCanvas,
        config: config.particles,
      })
      particles.start()

      readyRef.current = true
      setIsReady(true)

      ctx = gsap.context(() => {
        if (prefersReducedMotion) {
          particles?.setGlobalOpacity(0.15)

          enterActionRef.current = () => {
            const tl = gsap.timeline()
            tl.to(doorLeftRef.current, { rotateY: config.doors.leftRotationOpen, duration: 0.6, ease: 'power2.inOut' }, 0)
            tl.to(doorRightRef.current, { rotateY: config.doors.rightRotationOpen, duration: 0.6, ease: 'power2.inOut' }, 0)
            tl.to(glowRef.current, { opacity: config.glow.open, duration: 0.6, ease: 'sine.out' }, 0)
            tl.to(spillRef.current, { opacity: config.lightSpill.max, duration: 0.6, ease: 'sine.out' }, 0)
            tl.to(facadeGroupRef.current, { opacity: 0, duration: 0.5, ease: 'sine.in' }, 0.6)
          }

          return
        }

        const [closedStart, closedEnd] = config.phases.closed
        const [openingStart, openingEnd] = config.phases.opening
        const [openStart, openEnd] = config.phases.open
        const [pushStart, pushEnd] = config.phases.push

        const particlesProxy = { value: 0 }
        const syncParticles = () => particles?.setGlobalOpacity(particlesProxy.value)

        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top top',
            end: () => `+=${window.innerHeight * config.scroll.viewportHeights}`,
            pin: true,
            scrub: 1,
            anticipatePin: 1,
            invalidateOnRefresh: true,
            onUpdate: (self) => {
              if (enterButtonRef.current) {
                enterButtonRef.current.style.pointerEvents = self.progress < 0.02 ? 'auto' : 'none'
              }
            },
          },
        })

        // Fase 1 — puertas cerradas: asentamiento mínimo, nada brusco.
        tl.to(glowRef.current, { opacity: config.glow.closed, duration: closedEnd - closedStart, ease: 'none' }, closedStart)
        tl.to(particlesProxy, { value: 0.02, duration: closedEnd - closedStart, ease: 'none', onUpdate: syncParticles }, closedStart)

        // Fase 2 — apertura de las puertas hacia dentro.
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

        // Fase 3 — puertas abiertas, luz cálida e interior visible.
        const openDuration = openEnd - openStart
        tl.to(glowRef.current, { opacity: config.glow.open, duration: openDuration, ease: 'none' }, openStart)
        tl.to(spillRef.current, { opacity: config.lightSpill.max, duration: openDuration, ease: 'none' }, openStart)
        tl.to(particlesProxy, { value: 1, duration: openDuration, ease: 'none', onUpdate: syncParticles }, openStart)

        // Fase 4 — la cámara avanza a través del hueco.
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

        ScrollTrigger.refresh()

        enterActionRef.current = () => {
          const st = tl.scrollTrigger
          if (!st) return
          gsap.to(window, { duration: 1.4, ease: 'power2.inOut', scrollTo: { y: st.end } })
        }
      }, sectionRef)
    }

    setup()

    const handleWindowResize = () => {
      const doorLeftEl = doorLeftRef.current
      const doorRightEl = doorRightRef.current
      const doorLeftImgEl = doorLeftImgRef.current
      const doorRightImgEl = doorRightImgRef.current
      if (!doorLeftEl || !doorRightEl || !doorLeftImgEl || !doorRightImgEl) return

      fitDoorImageToContainer(doorLeftImgEl, doorLeftEl)
      fitDoorImageToContainer(doorRightImgEl, doorRightEl)
      applyDoorGeometryVars(doorLeftEl, config.doors3D.depthRatio)
      applyDoorGeometryVars(doorRightEl, config.doors3D.depthRatio)
    }
    window.addEventListener('resize', handleWindowResize)

    return () => {
      cancelled = true
      window.removeEventListener('resize', handleWindowResize)
      ctx?.revert()
      particles?.destroy()
      readyRef.current = false
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return { isReady, handleEnterClick }
}
