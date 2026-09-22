import { useCallback, useEffect, useId, useRef, useState } from 'react'
import { closeAccountPanel, useAccountPanel } from './accountPanelState'
import { useAccountPanelReveal } from './useAccountPanelReveal'
import { useSession } from './useSession'
import { AccountForm } from './AccountForm'
import { AccountProfile } from './AccountProfile'
import './AccountPanel.scss'

// El panel de la cuenta: crearla, entrar, y el carné de quien ya está dentro.
//
// Se monta UNA vez, arriba del todo, y no lleva a nadie a otra ruta: crear la cuenta es un
// paso de en medio, y al terminar se sigue donde se estaba.
export function AccountPanel() {
  const { open, reason, mode } = useAccountPanel()
  const session = useSession()
  const titleId = useId()
  const rootRef = useRef<HTMLDivElement>(null)
  const cardRef = useRef<HTMLElement>(null)
  // Dónde estaba el foco antes de abrir, para devolverlo al cerrar.
  const returnFocusRef = useRef<HTMLElement | null>(null)

  // Montado no es lo mismo que abierto: al cerrarse sigue montado mientras se va. Se ajusta
  // durante el render, que es como React pide derivar estado de otro que cambia.
  const [mounted, setMounted] = useState(open)
  if (open && !mounted) setMounted(true)

  const onHidden = useCallback(() => setMounted(false), [])
  useAccountPanelReveal({ rootRef, cardRef, open, onHidden })

  // Escape cierra. Solo se escucha con el panel abierto.
  useEffect(() => {
    if (!open) return

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') closeAccountPanel()
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [open])

  // El foco entra al primer campo al abrirse y vuelve a donde estaba al cerrarse. Sin lo
  // segundo, quien navega con teclado acabaría al principio de la página.
  useEffect(() => {
    if (!open) return

    returnFocusRef.current = document.activeElement as HTMLElement | null
    cardRef.current?.querySelector<HTMLElement>('input, .account-panel__secondary')?.focus()

    return () => {
      returnFocusRef.current?.focus()
    }
  }, [open])

  if (!mounted) return null

  return (
    <div className="account-panel" ref={rootRef}>
      {/* El velo es también la zona que se pulsa para cerrar, igual que el del
          tomo en la estantería. Fuera del tabulador: con teclado se cierra con
          Escape o con la aspa. */}
      <button
        className="account-panel__scrim"
        type="button"
        tabIndex={-1}
        aria-label="Cerrar"
        onClick={closeAccountPanel}
      />

      <section
        className="account-panel__card"
        ref={cardRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
      >
        <button
          className="account-panel__close"
          type="button"
          aria-label="Cerrar"
          onClick={closeAccountPanel}
        >
          ×
        </button>

        {/* Al entrar o salir con éxito el panel se cierra: lo que se quería era
            seguir, y detrás está la estantería encendiendo lo que se acaba de
            ganar. */}
        {session.status === 'signedIn' ? (
          <AccountProfile account={session.account} titleId={titleId} onDone={closeAccountPanel} />
        ) : (
          <AccountForm reason={reason} titleId={titleId} mode={mode} onDone={closeAccountPanel} />
        )}

        {/* Mientras no haya servidor, la cuenta vive en este navegador. Se dice,
            porque quien la cree en el móvil no la encontrará en el ordenador: eso
            es «todavía no», y tiene que leerse así. */}
        <p className="account-panel__trial">
          Versión de prueba: por ahora la cuenta se guarda solo en este navegador.
        </p>

        {/* Lo exige el reglamento de VOICEVOX y del personaje para usar sus voces,
            también con uso comercial: quitarlo deja los audios sin licencia. */}
        <p className="account-panel__credits">
          Voces: <span lang="ja">VOICEVOX:雀松朱司</span>
        </p>
      </section>
    </div>
  )
}
