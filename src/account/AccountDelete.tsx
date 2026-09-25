import { useId, useState, type FormEvent } from 'react'
import { deleteAccount } from '../api/account'
import { apiErrorCode, type ApiErrorCode } from '../api/apiError'
import { ACCOUNT_ERRORS } from './accountConfig'

const CONFIRM_WORD = 'BORRAR'

// Borrar la cuenta. Lo exige el RGPD, y no es una cortesía: va en la pantalla, no detrás de
// un correo pidiéndolo.
//
// No navega a ningún sitio al terminar, igual que cerrar sesión: al irse la sesión, esta
// pantalla pasa sola a la invitación a entrar. Mandar a otra parte sería inventar un camino
// que el resto de la cuenta no tiene.
export function AccountDelete() {
  const [typed, setTyped] = useState('')
  const [pending, setPending] = useState(false)
  const [error, setError] = useState<ApiErrorCode | null>(null)
  const fieldId = useId()

  // Con `trim` y en cualquier caja: escribirlo en minúsculas es el mismo acto consciente, y
  // rechazarlo solo haría pelear con el teclado a quien ya ha decidido.
  const confirmed = typed.trim().toUpperCase() === CONFIRM_WORD

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault()
    if (!confirmed) return

    setPending(true)
    setError(null)

    try {
      await deleteAccount()
    } catch (caught) {
      setError(apiErrorCode(caught))
      setPending(false)
    }
    // Sin `finally`: al acertar, la sesión se va y con ella este componente. Apagar el
    // «Un momento…» sobre algo ya desmontado avisaría por consola.
  }

  return (
    <form className="account-page__form" onSubmit={(event) => void onSubmit(event)}>
      <p className="account-page__hint">
        Se irán tu correo, tu nombre, tus sellos y tus insignias. No hay vuelta atrás y no
        queda copia. Lo que hayas leído sin cuenta se queda en este navegador.
      </p>

      <div className="account-page__field">
        <label className="account-page__label" htmlFor={`${fieldId}-confirm`}>
          Escribe {CONFIRM_WORD} para confirmarlo
        </label>
        <input
          className="account-page__input"
          id={`${fieldId}-confirm`}
          type="text"
          autoComplete="off"
          spellCheck={false}
          value={typed}
          onChange={(event) => setTyped(event.target.value)}
        />
      </div>

      {error ? (
        <p className="account-page__error" role="alert">
          {ACCOUNT_ERRORS[error]}
        </p>
      ) : null}

      <button
        className="account-page__button account-page__button--danger"
        type="submit"
        disabled={pending || !confirmed}
      >
        {pending ? 'Un momento…' : 'Borrar mi cuenta'}
      </button>
    </form>
  )
}
