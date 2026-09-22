import { useId, useState, type FormEvent } from 'react'
import { changePassword } from '../api/account'
import { apiErrorCode, type ApiErrorCode } from '../api/apiError'
import { ACCOUNT_ERRORS, PASSWORD_HINT } from './accountConfig'

// Cambiar la contraseña. Solo lo ve quien entra con correo: una cuenta de Google no
// tiene contraseña nuestra que cambiar.
//
// No comprueba nada por su cuenta, igual que `AccountForm`: lo comprueba el servidor y
// aquí se enseña lo que diga. Lo único que se adelanta es la pista del largo mínimo.
export function PasswordChange() {
  const [current, setCurrent] = useState('')
  const [next, setNext] = useState('')
  const [pending, setPending] = useState(false)
  const [error, setError] = useState<ApiErrorCode | null>(null)
  const [done, setDone] = useState(false)
  const fieldId = useId()

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault()
    setPending(true)
    setError(null)
    setDone(false)

    try {
      await changePassword({ current, next })
      // Los campos se vacían al acertar: dejar la contraseña nueva escrita en pantalla
      // no aporta nada y se queda ahí mientras dure la visita.
      setCurrent('')
      setNext('')
      setDone(true)
    } catch (caught) {
      setError(apiErrorCode(caught))
    } finally {
      setPending(false)
    }
  }

  return (
    <form className="account-page__form" onSubmit={(event) => void onSubmit(event)}>
      <div className="account-page__field">
        <label className="account-page__label" htmlFor={`${fieldId}-current`}>
          Contraseña actual
        </label>
        <input
          className="account-page__input"
          id={`${fieldId}-current`}
          type="password"
          autoComplete="current-password"
          value={current}
          onChange={(event) => setCurrent(event.target.value)}
          required
        />
      </div>

      <div className="account-page__field">
        <label className="account-page__label" htmlFor={`${fieldId}-next`}>
          Contraseña nueva
        </label>
        <input
          className="account-page__input"
          id={`${fieldId}-next`}
          type="password"
          autoComplete="new-password"
          value={next}
          onChange={(event) => setNext(event.target.value)}
          required
        />
        <p className="account-page__hint">{PASSWORD_HINT}</p>
      </div>

      {error ? (
        <p className="account-page__error" role="alert">
          {ACCOUNT_ERRORS[error]}
        </p>
      ) : null}

      {done ? (
        <p className="account-page__done" role="status">
          Contraseña cambiada.
        </p>
      ) : null}

      <button className="account-page__button" type="submit" disabled={pending}>
        {pending ? 'Un momento…' : 'Cambiar la contraseña'}
      </button>
    </form>
  )
}
