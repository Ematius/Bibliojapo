// Kanji del logotipo. Provisional: 本 («libro»), elegido porque con solo cinco
// trazos sigue siendo legible al tamaño pequeño del distintivo. Se cambiará
// cuando esté decidida la identidad.
export const NAV_LOGO_KANJI = '本'

// Secciones de la barra, en el orden en que se muestran.
//
// La barra solo aparece de la biblioteca hacia dentro: el valle de la portada
// va sin ella, para que nada compita con el camino que invita a avanzar.
//
// `to` es null mientras la sección todavía no tiene pantalla: el enlace se pinta
// igual, pero no navega. Se rellena a medida que cada una exista.
export interface NavLink {
  id: string
  label: string
  // El destino, o null si esa sección todavía no existe.
  //
  // El tipo se escribe a mano en vez de deducirse de la lista a propósito: hoy las
  // tres tienen pantalla, y deducido saldría `string`, con lo que la rama que pinta
  // una sección pendiente quedaría marcada como imposible y habría que borrarla.
  // La siguiente sección que se anuncie antes de existir la necesita.
  to: string | null
  // Marca el enlace que vuelve al valle, para que el guardia de la ruta lo deje
  // pasar. Ver shared/journey.ts.
  fromNav: boolean
}

export const NAV_LINKS: readonly NavLink[] = [
  // Vuelve al valle. Es la única forma de volver a ver la portada una vez
  // recorrida, así que lleva una marca para que el guardia de la ruta la deje
  // pasar en lugar de mandarte otra vez a la puerta. Ver shared/journey.ts.
  { id: 'home', label: 'Inicio', to: '/', fromNav: true },
  // Vuelve al vestíbulo, que es donde están los carteles de los pasillos.
  { id: 'aisles', label: 'Pasillos', to: '/biblioteca', fromNav: false },
  // La mesa propia, con lo ganado encima. Sin cuenta lleva igual: la pantalla
  // invita a crearla, que es lo que hace falta para que haya algo que guardar.
  { id: 'desk', label: 'Mi escritorio', to: '/mi-escritorio', fromNav: false },
]

// Llamada a la acción, al otro extremo de la barra, para quien no tiene sesión.
// Abre el panel de la cuenta; con sesión, el botón lleva el nombre de quien está
// dentro.
export const NAV_CTA_LABEL = 'Crear cuenta'

// Entrada de la barra: se despliega de izquierda a derecha hasta ocupar su
// sitio, en vez de aparecer de golpe.
//
// Se revela recortando, no escalando: escalar en horizontal estiraría el kanji y
// el texto durante toda la animación. Recortando, la barra crece y el contenido
// se mantiene con su forma correcta desde el primer frame.
export const NAV_INTRO = {
  durationSeconds: 0.65,
  // Arranca un poco desplazada a la izquierda para que el despliegue tenga algo
  // de empuje y no sea solo una cortinilla.
  fromOffsetRem: -1,
  ease: 'power3.out',
}
