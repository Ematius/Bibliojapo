import { useCallback, useEffect, useId, useRef, useState } from 'react'
import { HALL_GUIDE } from './hallGuideConfig'
import {
  getHallGuideMode,
  setHallGuideMode,
  shouldShowHallGuide,
  type HallGuideMode,
} from './hallGuidePreference'
import { useHallGuideReveal } from './useHallGuideReveal'
import './HallGuide.scss'

// La guía del vestíbulo: sale la primera vez que se entra, y después según lo que se haya
// pedido. El botón de la esquina la reabre, o «Nunca» dejaría sin forma de volver a leerla.
export function HallGuide() {
  const titleId = useId()
  const rootRef = useRef<HTMLDivElement>(null)
  const cardRef = useRef<HTMLElement>(null)
  const closeRef = useRef<HTMLButtonElement>(null)
  const returnFocusRef = useRef<HTMLElement | null>(null)

  const [open, setOpen] = useState(shouldShowHallGuide)
  // Montada no es lo mismo que abierta: al cerrarse sigue montada mientras se va.
  const [mounted, setMounted] = useState(open)
  // Sin marca previa es la primera vez, y se muestra ya con «Nunca» puesto: si se cierra sin
  // tocar nada, no vuelve a salir.
  const [mode, setMode] = useState<HallGuideMode>(() => getHallGuideMode() ?? 'never')

  useEffect(() => {
    if (getHallGuideMode() === null) setHallGuideMode('never')
  }, [])

  const onHidden = useCallback(() => setMounted(false), [])
  useHallGuideReveal({ rootRef, cardRef, open, onHidden })

  const openGuide = () => {
    returnFocusRef.current = document.activeElement as HTMLElement | null
    setMounted(true)
    setOpen(true)
  }
  const closeGuide = useCallback(() => setOpen(false), [])

  const pickMode = (next: HallGuideMode) => {
    setMode(next)
    setHallGuideMode(next)
  }

  useEffect(() => {
    if (!open) return

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') closeGuide()
    }
    window.addEventListener('keydown', onKeyDown)
    closeRef.current?.focus()

    return () => {
      window.removeEventListener('keydown', onKeyDown)
      returnFocusRef.current?.focus()
      returnFocusRef.current = null
    }
  }, [open, closeGuide])

  return (
    <>
      {!open && (
        <button className="hall-guide-open" type="button" onClick={openGuide} aria-label={HALL_GUIDE.reopenLabel}>
          <span aria-hidden="true">?</span>
        </button>
      )}

      {mounted && (
        <div className="hall-guide" ref={rootRef}>
          <button className="hall-guide__scrim" type="button" tabIndex={-1} aria-label="Cerrar" onClick={closeGuide} />

          <section
            className="hall-guide__card"
            ref={cardRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
          >
            <h2 className="hall-guide__title" id={titleId}>
              {HALL_GUIDE.title}
            </h2>

            <img className="hall-guide__image" src={HALL_GUIDE.image} alt={HALL_GUIDE.imageAlt} draggable="false" />

            <details className="hall-guide__details">
              <summary className="hall-guide__summary">{HALL_GUIDE.detailsLabel}</summary>
              <div className="hall-guide__text">
                {HALL_GUIDE.paragraphs.map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
              </div>
            </details>

            <div className="hall-guide__footer">
              <div className="hall-guide__choice" role="radiogroup" aria-label={HALL_GUIDE.choiceLabel}>
                <span className="hall-guide__choice-label" aria-hidden="true">
                  {HALL_GUIDE.choiceLabel}
                </span>
                {HALL_GUIDE.choices.map((choice) => (
                  <button
                    key={choice.mode}
                    className={`hall-guide__option${mode === choice.mode ? ' hall-guide__option--on' : ''}`}
                    type="button"
                    role="radio"
                    aria-checked={mode === choice.mode}
                    onClick={() => pickMode(choice.mode)}
                  >
                    {choice.label}
                  </button>
                ))}
              </div>

              <button className="hall-guide__close" type="button" ref={closeRef} onClick={closeGuide}>
                {HALL_GUIDE.closeLabel}
              </button>
            </div>
          </section>
        </div>
      )}
    </>
  )
}
