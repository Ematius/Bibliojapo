import { useCallback, useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { INTRO } from './introConfig'
import { markIntroSeen } from './introPreference'
import './IntroVideo.scss'

interface IntroVideoProps {
  // La entrada de debajo ya puede verse. El fundido espera a esto: si el video acabara antes,
  // se quedaría en su último fotograma en vez de descubrir una pantalla en blanco.
  entranceReady: boolean
  onDone: () => void
}

export function IntroVideo({ entranceReady, onDone }: IntroVideoProps) {
  const rootRef = useRef<HTMLDivElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const fadeSecondsRef = useRef(INTRO.skipFadeSeconds)
  const leavingRef = useRef(false)
  const [needsTap, setNeedsTap] = useState(false)
  const [leaving, setLeaving] = useState(false)

  const onDoneRef = useRef(onDone)
  onDoneRef.current = onDone

  const beginLeave = useCallback((fadeSeconds: number) => {
    if (leavingRef.current) return
    leavingRef.current = true
    fadeSecondsRef.current = fadeSeconds
    setLeaving(true)
  }, [])

  // La entrada se anima con el scroll: con la intro delante, la rueda la haría avanzar sin
  // que se vea.
  useEffect(() => {
    const root = document.documentElement
    const previous = root.style.overflow
    root.style.overflow = 'hidden'
    return () => {
      root.style.overflow = previous
    }
  }, [])

  // Con sonido: sin un gesto previo el navegador lo rechaza y hay que pedir un toque. Con
  // `muted` arrancaría siempre, pero la música es parte de la intro.
  useEffect(() => {
    videoRef.current?.play().catch(() => setNeedsTap(true))
  }, [])

  useEffect(() => {
    if (!leaving || !entranceReady) return
    markIntroSeen()

    const root = rootRef.current
    const video = videoRef.current
    gsap.set(root, { pointerEvents: 'none' })
    const tl = gsap.timeline({ onComplete: () => onDoneRef.current() })
    tl.to(root, { opacity: 0, duration: fadeSecondsRef.current, ease: 'sine.inOut' }, 0)
    // La música se apaga con la imagen; si no, seguiría sonando sobre la entrada.
    if (video) tl.to(video, { volume: 0, duration: fadeSecondsRef.current, ease: 'none' }, 0)
    return () => {
      tl.kill()
    }
  }, [leaving, entranceReady])

  const handleTimeUpdate = () => {
    const video = videoRef.current
    if (!video || !video.duration) return
    if (video.duration - video.currentTime <= INTRO.fadeSeconds) beginLeave(INTRO.fadeSeconds)
  }

  const handleStart = () => {
    setNeedsTap(false)
    videoRef.current?.play().catch(() => beginLeave(INTRO.skipFadeSeconds))
  }

  return (
    <div className="intro-video" ref={rootRef}>
      <video
        className="intro-video__video"
        ref={videoRef}
        src={INTRO.videoSrc}
        playsInline
        preload="auto"
        onTimeUpdate={handleTimeUpdate}
        onEnded={() => beginLeave(INTRO.fadeSeconds)}
        onError={() => beginLeave(INTRO.skipFadeSeconds)}
      />

      {needsTap && !leaving && (
        <button type="button" className="intro-video__start" onClick={handleStart}>
          Toca para empezar
        </button>
      )}

      {!leaving && (
        <button
          type="button"
          className="intro-video__skip"
          onClick={() => beginLeave(INTRO.skipFadeSeconds)}
        >
          Saltar
        </button>
      )}
    </div>
  )
}
