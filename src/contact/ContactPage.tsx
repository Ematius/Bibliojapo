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
      </div>

      <SiteNav />
    </main>
  )
}
