import { useId, useState, type FormEvent } from 'react'
import { signIn, signInWithGoogle, signUp } from '../api/account'
import { apiErrorCode, type ApiErrorCode } from '../api/apiError'
import { ACCOUNT_ERRORS, PASSWORD_HINT } from './accountConfig'
import type { AccountMode } from './accountPanelState'

interface AccountFormProps {
  // Por qué se pide la cuenta. Sustituye a la presentación de siempre: quien llega desde un
  // tomo quiere saber qué gana.
  reason: string | null
  titleId: string
  // Solo el arranque: el enlace de abajo sigue llevando a la otra vía.
  mode: AccountMode
  onDone: () => void
}

const COPY: Record<AccountMode, { title: string; intro: string; submit: string }> = {
  signUp: {
    title: 'Crea tu cuenta',
    intro:
      'Con tu cuenta, tus sellos se guardan y se abren los tomos siguientes. ' +
      'Accedes juegos nuevos, ha chuletas repaso rápido.',
    submit: 'Crear cuenta',
  },
  signIn: {
    title: 'Entra en tu cuenta',
    intro: 'Tus sellos e insignias siguen donde los dejaste.',
    submit: 'Entrar',
  },
}

// Crear la cuenta o entrar en ella: el mismo formulario, con un campo de más.
//
// No comprueba nada por su cuenta —ni el formato del correo ni el largo de la contraseña—: lo
// comprueba el servidor y aquí se enseña lo que diga. Validar en los dos sitios sería
// escribir dos veces la misma regla. Lo único que se adelanta es la pista de la contraseña.
export function AccountForm({ reason, titleId, mode: startMode, onDone }: AccountFormProps) {
  const [mode, setMode] = useState<AccountMode>(startMode)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  // Qué se está enviando, para apagar los botones. Son dos porque Google tiene su propio
  // botón y su propia espera.
  const [pending, setPending] = useState<'form' | 'google' | null>(null)
  const [error, setError] = useState<ApiErrorCode | null>(null)
  const fieldId = useId()

  const copy = COPY[mode]

  const run = async (kind: 'form' | 'google', attempt: () => Promise<unknown>) => {
    setPending(kind)
    setError(null)

    try {
      await attempt()
      onDone()
    } catch (caught) {
      setError(apiErrorCode(caught))
    } finally {
      setPending(null)
    }
  }

  const onSubmit = (event: FormEvent) => {
    event.preventDefault()
    void run('form', () =>
      mode === 'signUp' ? signUp({ name, email, password }) : signIn({ email, password }),
    )
  }

  // Cambiar de modo se lleva el error: el de «ese correo ya tiene cuenta» no pinta nada en el
  // formulario de entrar, que es justo a donde manda.
  const switchMode = () => {
    setMode(mode === 'signUp' ? 'signIn' : 'signUp')
    setError(null)
  }

  return (
    <div className="account-form">
      <p className="account-panel__eyebrow">Carné de socio</p>
      <h2 className="account-panel__title" id={titleId}>
        {copy.title}
      </h2>
      <p className="account-panel__intro">{reason ?? copy.intro}</p>

      <form className="account-form__fields" onSubmit={onSubmit} noValidate>
        {mode === 'signUp' ? (
          <label className="account-form__field" htmlFor={`${fieldId}-name`}>
            <span className="account-form__label">Nombre</span>
            <input
              className="account-form__input"
              id={`${fieldId}-name`}
              type="text"
              autoComplete="name"
              value={name}
              onChange={(event) => setName(event.target.value)}
            />
          </label>
        ) : null}

        <label className="account-form__field" htmlFor={`${fieldId}-email`}>
          <span className="account-form__label">Correo electrónico</span>
          <input
            className="account-form__input"
            id={`${fieldId}-email`}
            type="email"
            autoComplete="email"
            inputMode="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />
        </label>

        <label className="account-form__field" htmlFor={`${fieldId}-password`}>
          <span className="account-form__label">Contraseña</span>
          <input
            className="account-form__input"
            id={`${fieldId}-password`}
            type="password"
            autoComplete={mode === 'signUp' ? 'new-password' : 'current-password'}
            aria-describedby={mode === 'signUp' ? `${fieldId}-hint` : undefined}
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />
          {mode === 'signUp' ? (
            <span className="account-form__hint" id={`${fieldId}-hint`}>
              {PASSWORD_HINT}
            </span>
          ) : null}
        </label>

        {error ? (
          <p className="account-form__error" role="alert">
            {ACCOUNT_ERRORS[error]}
          </p>
        ) : null}

        <button className="account-panel__primary" type="submit" disabled={pending !== null}>
          {pending === 'form' ? 'Un momento…' : copy.submit}
        </button>
      </form>

      <p className="account-form__or">
        <span>o</span>
      </p>

      <button
        className="account-panel__secondary"
        type="button"
        disabled={pending !== null}
        onClick={() => void run('google', signInWithGoogle)}
      >
        {pending === 'google' ? 'Un momento…' : 'Continuar con Google'}
      </button>

      <p className="account-form__switch">
        {mode === 'signUp' ? '¿Ya tienes cuenta?' : '¿Todavía no tienes cuenta?'}{' '}
        <button className="account-form__switch-button" type="button" onClick={switchMode}>
          {mode === 'signUp' ? 'Entra' : 'Créala'}
        </button>
      </p>
    </div>
  )
}
