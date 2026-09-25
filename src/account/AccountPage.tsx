import { useState } from 'react'
import { signOut } from '../api/account'
import { SiteNav } from '../shared/SiteNav'
import { getAlwaysIntro, setAlwaysIntro } from '../intro/introPreference'
import { openAccountPanel } from './accountPanelState'
import { CurrentVolumeNote } from './CurrentVolumeNote'
import { PasswordChange } from './PasswordChange'
import { useSession } from './useSession'
import './AccountPage.scss'

// Tu cuenta: lo que se GESTIONA de ella.
//
// No repite el carné —lo ganado se ve en el panel y en la mesa—: aquí solo está lo que
// se toca. Sin guardia en la ruta: sin sesión no hay datos de nadie que enseñar, solo
// la invitación a entrar.
export function AccountPage() {
  const session = useSession()
  // La preferencia es de este dispositivo, no de la cuenta: se lee de localStorage y
  // el estado solo la refleja. Ver `intro/introPreference.ts`.
  const [alwaysIntro, setAlways] = useState(getAlwaysIntro)
  const [leaving, setLeaving] = useState(false)
  const [leaveFailed, setLeaveFailed] = useState(false)

  const toggleIntro = () => {
    setAlways(!alwaysIntro)
    setAlwaysIntro(!alwaysIntro)
  }

  const leave = async () => {
    setLeaving(true)
    setLeaveFailed(false)

    try {
      await signOut()
    } catch {
      setLeaveFailed(true)
    } finally {
      setLeaving(false)
    }
  }

  return (
    <main className="account-page">
      <div className="account-page__sheet">
        <h1 className="account-page__title">Tu cuenta</h1>

        {session.status === 'loading' ? (
          <p className="account-page__note">Un momento…</p>
        ) : session.status === 'signedOut' ? (
          <section className="account-page__section">
            <p className="account-page__note">
              Aquí se gestiona tu cuenta: tus datos, por dónde vas y cómo entras. Hace falta
              haber entrado.
            </p>

            <div className="account-page__ways">
              <button
                className="account-page__button"
                type="button"
                onClick={() => openAccountPanel('Entra para ver tu cuenta.', 'signIn')}
              >
                Entrar
              </button>

              <button
                className="account-page__button account-page__button--quiet"
                type="button"
                onClick={() => openAccountPanel('Crea tu cuenta para guardar lo que vas ganando.')}
              >
                Crear cuenta
              </button>
            </div>
          </section>
        ) : (
          <>
            <section className="account-page__section">
              <h2 className="account-page__heading">Tus datos</h2>

              <dl className="account-page__data">
                <dt className="account-page__term">Nombre</dt>
                <dd className="account-page__value">{session.account.name}</dd>

                <dt className="account-page__term">Correo</dt>
                <dd className="account-page__value">{session.account.email}</dd>

                <dt className="account-page__term">Cómo entras</dt>
                <dd className="account-page__value">
                  {session.account.provider === 'google' ? 'Con Google' : 'Con correo y contraseña'}
                </dd>
              </dl>
            </section>

            <section className="account-page__section">
              <h2 className="account-page__heading">Por dónde vas</h2>
              <CurrentVolumeNote />
            </section>

            {/* Una cuenta de Google no tiene contraseña nuestra: enseñar el formulario
                apagado solo haría preguntarse por qué no deja. */}
            {session.account.provider === 'password' ? (
              <section className="account-page__section">
                <h2 className="account-page__heading">Contraseña</h2>
                <PasswordChange />
              </section>
            ) : null}

            <section className="account-page__section">
              <h2 className="account-page__heading">Preferencias</h2>

              {/* La casilla es el control: el texto de al lado la acompaña, y por eso va
                  dentro de la etiqueta y no en un párrafo aparte. */}
              <label className="account-page__choice">
                <input
                  className="account-page__checkbox"
                  type="checkbox"
                  checked={alwaysIntro}
                  onChange={toggleIntro}
                />
                <span>
                  Ver la intro cada vez que entro
                  <span className="account-page__hint">
                    Sin marcar, solo se ve la primera vez. Es de este dispositivo, no de tu cuenta.
                  </span>
                </span>
              </label>
            </section>

            <section className="account-page__section account-page__section--edge">
              <h2 className="account-page__heading">Tu sesión</h2>

              {leaveFailed ? (
                <p className="account-page__error" role="alert">
                  No se ha podido cerrar la sesión. Vuelve a intentarlo.
                </p>
              ) : null}

              <button
                className="account-page__button account-page__button--quiet"
                type="button"
                disabled={leaving}
                onClick={() => void leave()}
              >
                {leaving ? 'Un momento…' : 'Cerrar sesión'}
              </button>

              {/* Borrar la cuenta lo exige el RGPD en cuanto se cobre. Todavía no hay
                  botón que la borre de Supabase: se anuncia como «todavía no» en vez
                  de esconderse. */}
              <p className="account-page__hint">
                Borrar la cuenta todavía no se puede hacer desde aquí. Escríbenos en
                Contacta y te la borramos.
              </p>
            </section>
          </>
        )}
      </div>

      <SiteNav />
    </main>
  )
}
