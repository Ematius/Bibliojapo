import { useLayoutEffect, useRef } from 'react'
import gsap from 'gsap'
import { prefersReducedMotion } from '../../../shared/prefersReducedMotion'
import './SmallScreenNotice.scss'

interface SmallScreenNoticeProps {
  // Seguir de todas formas: detrás viene el tomo, o la petición de girar si la pantalla está
  // de pie.
  onAccept: () => void
  onDismiss: () => void
}

// Lo que se lee antes de abrir el tomo en una pantalla pequeña. Va delante de `RotateNotice` a
// propósito: se avisa de lo que se va a encontrar ANTES de pedirle nada a quien lee, porque
// girar el móvil y toparse igual con una letra cortada se entiende como una app rota.
export function SmallScreenNotice({ onAccept, onDismiss }: SmallScreenNoticeProps) {
  const rootRef = useRef<HTMLDivElement>(null)

  useLayoutEffect(() => {
    const root = rootRef.current
    if (!root || prefersReducedMotion()) return

    // `fromTo` y no `from`, por lo mismo que en `RotateNotice`: montado dos veces, un `from`
    // deja el aviso invisible.
    const tween = gsap.fromTo(
      root,
      { autoAlpha: 0, y: 12 },
      { autoAlpha: 1, y: 0, duration: 0.4, ease: 'power2.out' },
    )
    return () => {
      tween.kill()
    }
  }, [])

  return (
    <div className="small-screen-notice" ref={rootRef} role="status" data-no-pan>
      <span className="small-screen-notice__icon" aria-hidden="true">
        <svg viewBox="0 0 48 48" focusable="false">
          <circle cx="24" cy="24" r="17" fill="none" stroke="currentColor" strokeWidth="2" />
          <path
            d="M24 15 L24 27"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
          <circle cx="24" cy="32.5" r="1.6" fill="currentColor" />
        </svg>
      </span>

      <p className="small-screen-notice__title">Aquí se lee apretado</p>
      <p className="small-screen-notice__text">
        Este tomo lleva dentro más de lo que cabe en una pantalla pequeña: puede que alguna
        letra no entre entera, que un dibujo salga recortado o que algo quede donde no debería.
        Hemos apurado todo lo que se podía sin estropear el libro, y sentimos lo que aun así se
        vea mal. Se estudia igual, pero en una pantalla más grande se lee mucho mejor.
      </p>

      <div className="small-screen-notice__actions">
        <button
          className="small-screen-notice__button small-screen-notice__button--go"
          type="button"
          onClick={onAccept}
        >
          Entendido, seguir
        </button>

        <button className="small-screen-notice__button" type="button" onClick={onDismiss}>
          Devolver el tomo
        </button>
      </div>
    </div>
  )
}
