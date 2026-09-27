import { Link } from 'react-router-dom'
import { RESPONSIBLE_NAME } from '../legal/legalInfo'
import './SiteFooter.scss'

// El aviso de derechos reservados. Solo en las pantallas de texto —cuenta, contacta,
// privacidad y aviso legal—: en las escenas iría encima del paneo y de la ilustración.
export function SiteFooter() {
  const year = new Date().getFullYear()

  return (
    <p className="site-footer">
      © {year} {RESPONSIBLE_NAME}. Todos los derechos reservados.{' '}
      <Link className="site-footer__link" to="/legal">
        Aviso legal
      </Link>
    </p>
  )
}
