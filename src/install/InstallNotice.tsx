import { useInstallNotice } from './useInstallNotice'
import './InstallNotice.scss'

// El aviso de instalar. Bloquea la pantalla hasta que se responde: es lo que pide la
// instalación en el móvil, y un aviso que se cierra solo no se contesta.
export function InstallNotice() {
  const { mode, install, dismiss } = useInstallNotice()
  if (mode === 'hidden') return null

  const ios = mode === 'ios'

  return (
    <div className="install-notice" role="dialog" aria-modal="true" aria-labelledby="install-notice-title">
      <div className="install-notice__panel">
        <h2 id="install-notice-title" className="install-notice__title">
          Instala Bibliojapo en tu móvil
        </h2>
        <p className="install-notice__text">
          Se abre como una aplicación más: con su icono en la pantalla de inicio y a pantalla
          completa, sin la barra del navegador que le quita sitio a la estantería.
        </p>
        {ios && (
          <p className="install-notice__text">
            Pulsa el botón de compartir del navegador y elige «Añadir a pantalla de inicio».
          </p>
        )}
        <div className="install-notice__actions">
          {ios ? (
            <button type="button" className="install-notice__button" onClick={dismiss}>
              Entendido
            </button>
          ) : (
            <>
              <button type="button" className="install-notice__button" onClick={install}>
                Instalar
              </button>
              <button
                type="button"
                className="install-notice__button install-notice__button--quiet"
                onClick={dismiss}
              >
                Ahora no
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
