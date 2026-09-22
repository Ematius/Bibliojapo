import { useSession } from './useSession'
import { openAccountPanel } from './accountPanelState'
import { SiteNav } from '../shared/SiteNav'

// Tu cuenta: lo que se gestiona de ella —tus datos, la contraseña, tus preferencias—.
//
// No repite el carné: el carné enseña lo GANADO y vive en el panel y en la mesa. Aquí solo
// está lo que se toca. En esqueleto: cada sección llega en su propio paso.
export function AccountPage() {
  const session = useSession()

  return (
    <main className="account-page">
      <h1>Tu cuenta</h1>

      {session.status === 'loading' ? (
        <p>Un momento…</p>
      ) : session.status === 'signedOut' ? (
        // Sin sesión no hay nada que gestionar. El panel se abre aquí mismo, en vez de
        // llevar a otra ruta: crear la cuenta es un paso de en medio.
        <button type="button" onClick={() => openAccountPanel('Entra para ver tu cuenta.', 'signIn')}>
          Entrar
        </button>
      ) : (
        <p>{session.account.email}</p>
      )}

      <SiteNav />
    </main>
  )
}
