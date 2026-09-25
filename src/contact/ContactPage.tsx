import { Link } from 'react-router-dom'
import { SiteNav } from '../shared/SiteNav'
import { ContactForm } from './ContactForm'
import './ContactPage.scss'

// Contacta: por dónde llega el aviso de que algo se ha roto.
//
// Fuera de la cuenta a propósito: un fallo se cuenta igual sin haberla creado, y quien
// más lo necesita es justo quien se ha quedado atascado antes de tenerla.
export function ContactPage() {
  return (
    <main className="contact-page">
      <div className="contact-page__sheet">
        <h1 className="contact-page__title">Contacta</h1>

        <p className="contact-page__note">
          Estamos en beta. Si algo no funciona como esperabas, cuéntanoslo: el aviso llega
          mucho antes que si esperamos a encontrarlo nosotros.
        </p>

        <ContactForm />

        {/* Quien viene a escribir suele venir también a preguntar qué se guarda de él. */}
        <p className="contact-page__legal">
          <Link className="contact-page__link" to="/privacidad">
            Política de privacidad
          </Link>
          {' · '}
          <Link className="contact-page__link" to="/legal">
            Aviso legal y condiciones
          </Link>
        </p>
      </div>

      <SiteNav />
    </main>
  )
}
