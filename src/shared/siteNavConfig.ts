// Provisional, hasta que esté decidida la identidad: 本 se lee bien a tamaño pequeño.
export const NAV_LOGO_KANJI = '本'

// La barra solo aparece de la biblioteca hacia dentro: en la entrada, el único camino es
// la puerta.
export interface NavLink {
  id: string
  label: string
  // El destino, o null si la sección todavía no existe. El tipo se escribe a mano y
  // no se deduce de la lista: hoy todas tienen pantalla, y deducido saldría
  // `string`, dejando la rama que pinta una sección pendiente como código muerto.
  to: string | null
}

export const NAV_LINKS: readonly NavLink[] = [
  { id: 'home', label: 'Inicio', to: '/' },
  { id: 'aisles', label: 'Pasillos', to: '/hall' },
  { id: 'desk', label: 'Mi escritorio', to: '/my-desk' },
  { id: 'contact', label: 'Contacta', to: '/contact' },
]

export const NAV_CTA_LABEL = 'Crear cuenta'

// Con sesión, la entrada a la cuenta dentro del menú. En la barra ese sitio lo ocupa el
// nombre de quien está dentro, pero una fila de menú suelta con un nombre propio no dice
// a dónde lleva.
export const NAV_ACCOUNT_LABEL = 'Tu cuenta'

// Se abre recortando de arriba abajo, por lo mismo que la barra: escalar deformaría el
// texto. Cerrar va más rápido que abrir — esperar para quitar algo de en medio molesta.
export const NAV_MENU = {
  showSeconds: 0.34,
  hideSeconds: 0.22,
  showEase: 'power3.out',
  hideEase: 'power2.in',
  fromOffsetRem: -0.5,
}

// La barra se revela recortando, no escalando: escalar en horizontal estiraría el
// kanji y el texto durante toda la animación.
export const NAV_INTRO = {
  durationSeconds: 0.65,
  fromOffsetRem: -1,
  ease: 'power3.out',
}
