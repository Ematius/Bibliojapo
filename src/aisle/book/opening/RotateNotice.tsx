import { useLayoutEffect, useRef } from 'react'
import gsap from 'gsap'
import { prefersReducedMotion } from '../../../shared/prefersReducedMotion'
import './RotateNotice.scss'

interface RotateNoticeProps {
  onDismiss: () => void
}

// Lo que se ve en lugar del tomo cuando la pantalla no da para abrirlo.
//
// El libro se dimensiona por el alto y sale vez y media más ancho que alto, así que en un
// móvil de pie no cabe ni una de sus dos páginas. En vez de enseñarlo cortado se pide la
// pantalla a lo ancho, que es donde entra entero.
export function RotateNotice({ onDismiss }: RotateNoticeProps) {
  const rootRef = useRef<HTMLDivElement>(null)

  useLayoutEffect(() => {
    const root = rootRef.current
    if (!root || prefersReducedMotion()) return

    // `fromTo` y no `from`: con `from`, un efecto que se monta dos veces deja el aviso
    // invisible —el segundo tween toma como destino el 0 que escribió el primero—.
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
    <div
      className="rotate-notice"
      ref={rootRef}
      // Un tomo que no se puede abrir es un cambio del que hay que enterarse sin ver la
      // pantalla.
      role="status"
      // El pasillo de detrás no se recorre mientras esto está delante. Ver `useScenePan`.
      data-no-pan
    >
      <span className="rotate-notice__icon" aria-hidden="true">
        <svg viewBox="0 0 48 48" focusable="false">
          <rect
            className="rotate-notice__phone"
            x="17"
            y="8"
            width="14"
            height="32"
            rx="2.5"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          />
          <path
            d="M8 30a17 17 0 0 0 4 6"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
          <path
            d="M12 30 L12 37 L6 37"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </span>

      <p className="rotate-notice__title">Gira la pantalla</p>
      <p className="rotate-notice__text">
        El tomo se lee a lo ancho: de pie no cabe ni media página.
      </p>

      <button className="rotate-notice__back" type="button" onClick={onDismiss}>
        Devolver el tomo
      </button>
    </div>
  )
}
