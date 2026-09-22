import { useEffect, useState } from 'react'
import { signOut, type Account } from '../api/account'
import { fetchBadges, type Badge } from '../api/progress'

interface AccountProfileProps {
  account: Account
  titleId: string
  // Se llama al salir de la cuenta.
  onDone: () => void
}

// El carné de quien ya tiene cuenta: quién es y qué ha ganado.
//
// Las insignias son de momento una lista con el sello de cada tomo superado. Su
// diseño está sin pulir —ver CLAUDE.md—; lo que sí está es el dato, que es lo que
// no se puede improvisar después.
export function AccountProfile({ account, titleId, onDone }: AccountProfileProps) {
  // null mientras llegan. `error` si no han llegado: se dice, en vez de enseñar
  // una lista vacía que se leería como «no has ganado nada».
  const [badges, setBadges] = useState<Badge[] | 'error' | null>(null)
  const [leaving, setLeaving] = useState(false)
  const [leaveFailed, setLeaveFailed] = useState(false)

  useEffect(() => {
    let current = true

    fetchBadges()
      .then((earned) => {
        if (current) setBadges(earned)
      })
      .catch(() => {
        if (current) setBadges('error')
      })

    return () => {
      current = false
    }
  }, [account.id])

  const leave = async () => {
    setLeaving(true)
    setLeaveFailed(false)

    try {
      await signOut()
      onDone()
    } catch {
      setLeaveFailed(true)
    } finally {
      setLeaving(false)
    }
  }

  return (
    <div className="account-profile">
      <p className="account-panel__eyebrow">Carné de socio</p>
      <h2 className="account-panel__title" id={titleId}>
        {account.name}
      </h2>
      <p className="account-profile__email">{account.email}</p>

      <section className="account-profile__badges">
        <h3 className="account-profile__heading">Insignias</h3>

        {badges === null ? (
          <p className="account-profile__note">Buscando tus insignias…</p>
        ) : badges === 'error' ? (
          <p className="account-profile__note">No se han podido traer tus insignias.</p>
        ) : badges.length === 0 ? (
          <p className="account-profile__note">Todavía ninguna. Se gana al sellar un tomo.</p>
        ) : (
          <ul className="account-profile__list">
            {badges.map((badge) => (
              <li className="account-profile__badge" key={badge.blockId}>
                <img className="account-profile__seal" src="/images/green-seal.webp" alt="" />
                <span>Tomo {badge.volume}</span>
              </li>
            ))}
          </ul>
        )}
      </section>

      {leaveFailed ? (
        <p className="account-form__error" role="alert">
          No se ha podido cerrar la sesión. Vuelve a intentarlo.
        </p>
      ) : null}

      <button
        className="account-panel__secondary"
        type="button"
        disabled={leaving}
        onClick={() => void leave()}
      >
        {leaving ? 'Un momento…' : 'Cerrar sesión'}
      </button>
    </div>
  )
}
