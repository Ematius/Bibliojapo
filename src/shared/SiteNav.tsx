import { useRef } from 'react'
import { Link } from 'react-router-dom'
import { openAccountPanel } from '../account/accountPanelState'
import { useSession } from '../account/useSession'
import { NAV_CTA_LABEL, NAV_LINKS, NAV_LOGO_KANJI } from './siteNavConfig'
import { useSiteNavIntro } from './useSiteNavIntro'
import './SiteNav.scss'

// Barra de navegación de la app, de la biblioteca hacia dentro.
//
// No aparece en el valle de la portada: allí el único camino es el sendero de
// piedra, y una barra encima competiría con él. Empieza en el vestíbulo y
// acompaña al usuario a partir de ahí.
export function SiteNav() {
  const navRef = useRef<HTMLElement>(null)
  const session = useSession()

  useSiteNavIntro(navRef)

  return (
    <nav className="site-nav" ref={navRef} aria-label="Navegación principal">
      {/* El kanji hace de botón de casa, y dentro de la app «casa» es el
          vestíbulo, no la portada. */}
      <Link className="site-nav__logo" to="/biblioteca" aria-label="BOF — vestíbulo">
        <span aria-hidden="true">{NAV_LOGO_KANJI}</span>
      </Link>

      <ul className="site-nav__links">
        {NAV_LINKS.map((link) => (
          <li className="site-nav__item" key={link.id}>
            {link.to ? (
              <Link className="site-nav__link" to={link.to} state={link.fromNav ? { fromNav: true } : undefined}>
                {link.label}
              </Link>
            ) : (
              // Sección todavía sin pantalla: se muestra para que la estructura
              // del sitio se lea completa, pero no lleva a ninguna parte. Es un
              // span y no un enlace desactivado a propósito: sin destino no hay
              // nada que anunciar, así que no entra en el orden de tabulación.
              <span className="site-nav__link site-nav__link--pending">{link.label}</span>
            )}
          </li>
        ))}
      </ul>

      {/* Abre el panel de la cuenta. Sin sesión invita a crearla; con sesión
          lleva el nombre de quien está dentro y abre su carné. */}
      <button
        className="site-nav__cta"
        type="button"
        onClick={() => openAccountPanel()}
        aria-label={session.account ? `Tu cuenta: ${session.account.name}` : undefined}
      >
        {session.account ? session.account.name : NAV_CTA_LABEL}
      </button>
    </nav>
  )
}
