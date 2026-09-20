import { useEffect, useState } from 'react'
import { getAlwaysIntro, setAlwaysIntro } from './introPreference'
import './IntroToggle.scss'

// Solo se ve con la entrada cerrada: en cuanto el scroll abre las puertas, un icono flotante
// sobraría.
const HIDE_AFTER_SCROLL_PX = 24

export function IntroToggle() {
  const [always, setAlways] = useState(getAlwaysIntro)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > HIDE_AFTER_SCROLL_PX)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const toggle = () => {
    setAlways(!always)
    setAlwaysIntro(!always)
  }

  return (
    <button
      type="button"
      className={`intro-toggle${always ? ' intro-toggle--on' : ''}${scrolled ? ' intro-toggle--hidden' : ''}`}
      onClick={toggle}
      aria-pressed={always}
      aria-label="Ver la intro cada vez que entro"
      title={always ? 'La intro se verá siempre' : 'La intro solo se ve la primera vez'}
    >
      <svg className="intro-toggle__icon" viewBox="0 0 24 24" aria-hidden="true">
        <path d="M8 5.5v13l11-6.5z" />
      </svg>
      <span className="intro-toggle__label">{always ? 'Intro: siempre' : 'Intro: una vez'}</span>
    </button>
  )
}
