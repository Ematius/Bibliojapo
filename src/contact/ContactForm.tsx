import { useId, useState, type FormEvent } from 'react'
import { sendFeedback, type FeedbackKind } from '../api/feedback'
import { apiErrorCode, type ApiErrorCode } from '../api/apiError'
import { useSession } from '../account/useSession'
import { CONTACT_ERRORS, FEEDBACK_KINDS } from './contactConfig'

// El formulario con el que se avisa de un fallo.
//
// No pide nada que la app pueda saber sola —la pantalla, el navegador, el tamaño—: eso
// viaja adjunto. Ver `api/feedback.ts`, donde está también el aviso de que el envío
// todavía es simulado.
export function ContactForm() {
  const session = useSession()
  const [kind, setKind] = useState<FeedbackKind>('bug')
  const [message, setMessage] = useState('')
  // Lo escrito a mano, que solo existe desde que alguien toca el campo.
  const [typedEmail, setTypedEmail] = useState('')
  const [emailTouched, setEmailTouched] = useState(false)
  const [pending, setPending] = useState(false)
  const [error, setError] = useState<ApiErrorCode | null>(null)
  const [sent, setSent] = useState(false)
  const fieldId = useId()

  // Con sesión sale ESCRITO, no solo insinuado en el placeholder: se envía lo que se ve.
  // Derivado y no copiado a estado, porque la sesión llega después del primer pintado:
  // copiándolo, el campo nacería vacío y habría que rellenarlo desde un efecto.
  const email = emailTouched ? typedEmail : (session.account?.email ?? '')

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault()
    setPending(true)
    setError(null)

    try {
      await sendFeedback({ kind, message, email })
      setSent(true)
    } catch (caught) {
      setError(apiErrorCode(caught))
    } finally {
      setPending(false)
    }
  }

  // Enviado no vuelve al formulario solo: si se repintara vacío, no habría forma de
  // distinguir «se ha mandado» de «se ha borrado lo que escribí».
  if (sent) {
    return (
      <div className="contact-page__sent" role="status">
        <p className="contact-page__note">
          Recibido. Si has dejado tu correo, te escribimos cuando lo miremos.
        </p>

        <button
          className="contact-page__button contact-page__button--quiet"
          type="button"
          onClick={() => {
            setSent(false)
            setMessage('')
          }}
        >
          Contar otra cosa
        </button>
      </div>
    )
  }

  return (
    <form className="contact-page__form" onSubmit={(event) => void onSubmit(event)}>
      <fieldset className="contact-page__kinds">
        <legend className="contact-page__label">¿De qué se trata?</legend>

        {FEEDBACK_KINDS.map((option) => (
          <label className="contact-page__kind" key={option.id}>
            <input
              className="contact-page__radio"
              type="radio"
              name={`${fieldId}-kind`}
              value={option.id}
              checked={kind === option.id}
              onChange={() => setKind(option.id)}
            />
            <span>{option.label}</span>
          </label>
        ))}
      </fieldset>

      <div className="contact-page__field">
        <label className="contact-page__label" htmlFor={`${fieldId}-message`}>
          Cuéntanoslo
        </label>
        <textarea
          className="contact-page__input contact-page__input--long"
          id={`${fieldId}-message`}
          rows={6}
          value={message}
          onChange={(event) => setMessage(event.target.value)}
          placeholder="Qué hacías y qué ha pasado."
          required
        />
        <p className="contact-page__hint">
          Se envía con la pantalla en la que estabas, tu navegador y el tamaño de la
          ventana. Eso es lo que nos deja reproducirlo.
        </p>
      </div>

      <div className="contact-page__field">
        <label className="contact-page__label" htmlFor={`${fieldId}-email`}>
          Tu correo, si quieres respuesta
        </label>
        <input
          className="contact-page__input"
          id={`${fieldId}-email`}
          type="email"
          autoComplete="email"
          value={email}
          onChange={(event) => {
            setEmailTouched(true)
            setTypedEmail(event.target.value)
          }}
          placeholder="tucorreo@ejemplo.com"
        />
      </div>

      {error ? (
        <p className="contact-page__error" role="alert">
          {CONTACT_ERRORS[error]}
        </p>
      ) : null}

      <button className="contact-page__button" type="submit" disabled={pending}>
        {pending ? 'Enviando…' : 'Enviar'}
      </button>
    </form>
  )
}
