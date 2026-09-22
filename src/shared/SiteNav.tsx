import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { Link } from 'react-router-dom'
import { openAccountPanel } from '../account/accountPanelState'
import { useSession } from '../account/useSession'
import { NAV_ACCOUNT_LABEL, NAV_CTA_LABEL, NAV_LINKS, NAV_LOGO_KANJI } from './siteNavConfig'
import { buildSiteNavMenuHide, buildSiteNavMenuReveal } from './siteNavMenuReveal'
import { prefersReducedMotion } from './prefersReducedMotion'
import { useSiteNavIntro } from './useSiteNavIntro'
import { useAnyVolumeOpen } from './volumeReadingState'
import './SiteNav.scss'

// Se pintan en dos sitios —la barra y el menú—, y quien las contiene dice si van en
// fila o en columna. Escritas dos veces, añadir una sección pediría acordarse de ambos.
function NavSections({ onPick }: { onPick?: () => void }) {
  return NAV_LINKS.map((link) => (
    <li className="site-nav__item" key={link.id}>
      {link.to ? (
        <Link className="site-nav__link" to={link.to} onClick={onPick}>
          {link.label}
        </Link>
      ) : (
        // Un span y no un enlace desactivado: sin destino no hay nada que
        // anunciar, así que no entra en el orden de tabulación.
        <span className="site-nav__link site-nav__link--pending">{link.label}</span>
      )}
    </li>
  ))
}

// No aparece en la entrada: allí el único camino es la puerta.
export function SiteNav() {
  const navRef = useRef<HTMLElement>(null)
  const menuRef = useRef<HTMLDivElement>(null)
  const session = useSession()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const anyVolumeOpen = useAnyVolumeOpen()

  useSiteNavIntro(navRef)

  // Se salta el montaje: el panel ya nace cerrado desde el CSS, y animarlo entonces
  // enseñaría un menú abriéndose que nadie ha pedido.
  const hasToggledRef = useRef(false)
  useEffect(() => {
    const menu = menuRef.current
    if (!menu) return
    if (!hasToggledRef.current) {
      hasToggledRef.current = true
      return
    }

    if (prefersReducedMotion()) {
      gsap.set(menu, { autoAlpha: isMenuOpen ? 1 : 0, clipPath: 'none', y: 0 })
      return
    }

    const tween = isMenuOpen ? buildSiteNavMenuReveal(menu) : buildSiteNavMenuHide(menu)
    return () => {
      tween.kill()
    }
  }, [isMenuOpen])

  // Los escuchas solo existen mientras el menú está abierto.
  useEffect(() => {
    if (!isMenuOpen) return

    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setIsMenuOpen(false)
    }

    const closeOnOutside = (event: PointerEvent) => {
      if (!navRef.current?.contains(event.target as Node)) setIsMenuOpen(false)
    }

    document.addEventListener('keydown', closeOnEscape)
    document.addEventListener('pointerdown', closeOnOutside)

    return () => {
      document.removeEventListener('keydown', closeOnEscape)
      document.removeEventListener('pointerdown', closeOnOutside)
    }
  }, [isMenuOpen])

  return (
    <nav
      className={`site-nav${anyVolumeOpen ? ' site-nav--hidden' : ''}`}
      ref={navRef}
      aria-label="Navegación principal"
    >
      {/* El kanji hace de botón de casa, y dentro de la app «casa» es el
          vestíbulo, no la portada. */}
      <Link className="site-nav__logo" to="/hall" aria-label="Bibliojapo — vestíbulo">
        <span aria-hidden="true">{NAV_LOGO_KANJI}</span>
      </Link>

      <ul className="site-nav__links">
        <NavSections />
      </ul>

      <button
        className="site-nav__burger"
        type="button"
        onClick={() => setIsMenuOpen((open) => !open)}
        aria-expanded={isMenuOpen}
        aria-controls="site-nav-menu"
        aria-label={isMenuOpen ? 'Cerrar el menú' : 'Abrir el menú'}
      >
        {/* El aspa se hace moviendo los tres trazos, no cambiando de dibujo. */}
        <span className="site-nav__burger-line" aria-hidden="true" />
        <span className="site-nav__burger-line" aria-hidden="true" />
        <span className="site-nav__burger-line" aria-hidden="true" />
      </button>

      {/* El acceso a la cuenta. Sin sesión abre el panel —crearla es un paso de en
          medio, no una pantalla—; con ella lleva el nombre de quien está dentro y va
          a su cuenta. En la barra estrecha se oculta y lo releva el menú. */}
      {session.account ? (
        <Link
          className="site-nav__cta"
          to="/account"
          aria-label={`Tu cuenta: ${session.account.name}`}
        >
          {session.account.name}
        </Link>
      ) : (
        <button className="site-nav__cta" type="button" onClick={() => openAccountPanel()}>
          {NAV_CTA_LABEL}
        </button>
      )}

      <div className="site-nav__menu" id="site-nav-menu" ref={menuRef}>
        <ul className="site-nav__menu-list">
          <NavSections onPick={() => setIsMenuOpen(false)} />

          {/* El botón de la cuenta no cabe en la barra estrecha y se oculta, así que su
              acceso vive aquí: sin esta fila, en un móvil no hay por dónde entrar. */}
          <li className="site-nav__item site-nav__item--account">
            {session.account ? (
              <Link
                className="site-nav__link"
                to="/account"
                onClick={() => setIsMenuOpen(false)}
              >
                {NAV_ACCOUNT_LABEL}
              </Link>
            ) : (
              <button
                className="site-nav__link site-nav__link--action"
                type="button"
                onClick={() => {
                  setIsMenuOpen(false)
                  openAccountPanel()
                }}
              >
                {NAV_CTA_LABEL}
              </button>
            )}
          </li>
        </ul>
      </div>
    </nav>
  )
}
