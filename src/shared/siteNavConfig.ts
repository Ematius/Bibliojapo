// Provisional, hasta que esté decidida la identidad: 本 se lee bien a tamaño pequeño.
export const NAV_LOGO_KANJI = '本'

// La barra solo aparece de la biblioteca hacia dentro: en el valle de la portada
// competiría con el sendero, que es el único camino.
export interface NavLink {
  id: string
  label: string
  // El destino, o null si la sección todavía no existe. El tipo se escribe a mano y
  // no se deduce de la lista: hoy las tres tienen pantalla, y deducido saldría
  // `string`, dejando la rama que pinta una sección pendiente como código muerto.
  to: string | null
  // Marca el enlace que vuelve al valle, para que el guardia de la ruta lo deje pasar.
  fromNav: boolean
}

export const NAV_LINKS: readonly NavLink[] = [
  { id: 'home', label: 'Inicio', to: '/', fromNav: true },
  { id: 'aisles', label: 'Pasillos', to: '/biblioteca', fromNav: false },
  { id: 'desk', label: 'Mi escritorio', to: '/mi-escritorio', fromNav: false },
]

export const NAV_CTA_LABEL = 'Crear cuenta'

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
