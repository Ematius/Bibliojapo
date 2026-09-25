import { useId, useState, type FormEvent } from 'react'
import { requestPasswordReset, signIn, signInWithGoogle, signUp } from '../api/account'
import { apiErrorCode, type ApiErrorCode } from '../api/apiError'
import { ACCOUNT_ERRORS, PASSWORD_HINT } from './accountConfig'
import type { AccountMode } from './accountPanelState'

// `resetPassword` no llega nunca hasta aquí: `AccountPanel` lo intercepta y pinta
// `ResetPassword` en su lugar. Excluirlo del tipo, y no solo de este archivo, es lo que
// hace que un tercer modo mal enrutado se note en la compilación en vez de en pantalla.
type FormMode = Exclude<AccountMode, 'resetPassword'>

interface AccountFormProps {
  // Por qué se pide la cuenta. Sustituye a la presentación de siempre: quien llega desde un
  // tomo quiere saber qué gana.
  reason: string | null
  titleId: string
  // Solo el arranque: el enlace de abajo sigue llevando a la otra vía.
  mode: FormMode
  onDone: () => void
}

const COPY: Record<FormMode, { title: string; intro: string; submit: string }> = {
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
  const [mode, setMode] = useState<FormMode>(startMode)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  // Qué se está enviando, para apagar los botones. Son dos porque Google tiene su propio
  // botón y su propia espera.
  const [pending, setPending] = useState<'form' | 'google' | null>(null)
  const [error, setError] = useState<ApiErrorCode | null>(null)
  // Aparte de `mode`: se alcanza desde un enlace dentro del formulario de entrar, no
  // desde fuera del panel, así que no le hace falta ser un modo del panel.
  const [forgot, setForgot] = useState<{ status: 'closed' | 'open' | 'sent'; email: string }>({
    status: 'closed',
    email: '',
  })
  const [forgotPending, setForgotPending] = useState(false)
  const [forgotError, setForgotError] = useState<ApiErrorCode | null>(null)
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
    setForgot({ status: 'closed', email: '' })
  }

  const submitForgot = async (event: FormEvent) => {
    event.preventDefault()
    setForgotPending(true)
    setForgotError(null)

    try {
      await requestPasswordReset(forgot.email)
      setForgot((current) => ({ ...current, status: 'sent' }))
    } catch (caught) {
      setForgotError(apiErrorCode(caught))
    } finally {
      setForgotPending(false)
    }
  }

  // El enlace solo vive en «entrar»: crear cuenta no tiene contraseña que recuperar
  // todavía. Sustituye al formulario entero en vez de colarse dentro: pedir un correo
  // y pedir credenciales son dos preguntas distintas.
  if (mode === 'signIn' && forgot.status !== 'closed') {
    return (
      <div className="account-form">
        <p className="account-panel__eyebrow">Carné de socio</p>
        <h2 className="account-panel__title" id={titleId}>
          Recupera tu contraseña
        </h2>

        {forgot.status === 'sent' ? (
          <>
            <p className="account-panel__intro" role="status">
              Si esa cuenta existe, te hemos mandado un correo con un enlace para elegir
              una contraseña nueva.
            </p>
            <button
              className="account-form__switch-button"
              type="button"
              onClick={() => setForgot({ status: 'closed', email: '' })}
            >
              Volver a entrar
            </button>
          </>
        ) : (
          <>
            <p className="account-panel__intro">
              Escribe tu correo y te mandamos un enlace para elegir una contraseña nueva.
            </p>

            <form
              className="account-form__fields"
              onSubmit={(event) => void submitForgot(event)}
              noValidate
            >
              <label className="account-form__field" htmlFor={`${fieldId}-forgot-email`}>
                <span className="account-form__label">Correo electrónico</span>
                <input
                  className="account-form__input"
                  id={`${fieldId}-forgot-email`}
                  type="email"
                  autoComplete="email"
                  inputMode="email"
                  value={forgot.email}
                  onChange={(event) =>
                    setForgot((current) => ({ ...current, email: event.target.value }))
                  }
                />
              </label>

              {forgotError ? (
                <p className="account-form__error" role="alert">
                  {ACCOUNT_ERRORS[forgotError]}
                </p>
              ) : null}

              <button className="account-panel__primary" type="submit" disabled={forgotPending}>
                {forgotPending ? 'Un momento…' : 'Mandar el enlace'}
              </button>
            </form>

            <p className="account-form__switch">
              <button
                className="account-form__switch-button"
                type="button"
                onClick={() => setForgot({ status: 'closed', email: '' })}
              >
                Volver a entrar
              </button>
            </p>
          </>
        )}
      </div>
    )
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

        {mode === 'signIn' ? (
          <button
            className="account-form__switch-button account-form__forgot"
            type="button"
            onClick={() => setForgot({ status: 'open', email: '' })}
          >
            ¿Has olvidado tu contraseña?
          </button>
        ) : null}

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
