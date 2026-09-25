import { useId, useState, type FormEvent } from 'react'
import { resetPassword } from '../api/account'
import { apiErrorCode, type ApiErrorCode } from '../api/apiError'
import { ACCOUNT_ERRORS, PASSWORD_HINT } from './accountConfig'

interface ResetPasswordProps {
  titleId: string
  onDone: () => void
}

// A dónde vuelve quien pulsa el enlace del correo de recuperación: entra ya con una
// sesión temporal, así que no hay contraseña actual que pedir — es justo la que se
// ha olvidado.
export function ResetPassword({ titleId, onDone }: ResetPasswordProps) {
  const [password, setPassword] = useState('')
  const [pending, setPending] = useState(false)
  const [error, setError] = useState<ApiErrorCode | null>(null)
  const fieldId = useId()

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault()
    setPending(true)
    setError(null)

    try {
      await resetPassword(password)
      onDone()
    } catch (caught) {
      setError(apiErrorCode(caught))
    } finally {
      setPending(false)
    }
  }

  return (
    <div className="account-form">
      <p className="account-panel__eyebrow">Carné de socio</p>
      <h2 className="account-panel__title" id={titleId}>
        Elige una contraseña nueva
      </h2>
      <p className="account-panel__intro">
        Has entrado desde el enlace del correo. Escribe la contraseña con la que quieres
        entrar de ahora en adelante.
      </p>

      <form className="account-form__fields" onSubmit={(event) => void onSubmit(event)} noValidate>
        <label className="account-form__field" htmlFor={`${fieldId}-password`}>
          <span className="account-form__label">Contraseña nueva</span>
          <input
            className="account-form__input"
            id={`${fieldId}-password`}
            type="password"
            autoComplete="new-password"
            aria-describedby={`${fieldId}-hint`}
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />
          <span className="account-form__hint" id={`${fieldId}-hint`}>
            {PASSWORD_HINT}
          </span>
        </label>

        {error ? (
          <p className="account-form__error" role="alert">
            {ACCOUNT_ERRORS[error]}
          </p>
        ) : null}

        <button className="account-panel__primary" type="submit" disabled={pending}>
          {pending ? 'Un momento…' : 'Guardar contraseña'}
        </button>
      </form>
    </div>
  )
}
