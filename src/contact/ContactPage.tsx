import { SiteNav } from '../shared/SiteNav'

// Contacta: por dónde llega el aviso de que algo se ha roto.
//
// En esqueleto: el formulario y su envío llegan en su propio paso, contra la capa `api/`.
export function ContactPage() {
  return (
    <main className="contact-page">
      <h1>Contacta</h1>

      <p>
        Si algo no funciona como esperabas, cuéntanoslo desde aquí. Estamos en beta y el aviso
        llega mucho antes que si esperamos a encontrarlo nosotros.
      </p>

      <SiteNav />
    </main>
  )
}
