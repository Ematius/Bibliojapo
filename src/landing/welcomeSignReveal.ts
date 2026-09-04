import gsap from 'gsap'

// ── AQUÍ SE AJUSTA LA APARICIÓN ────────────────────────────────────────────
//
// El cartel no se enciende ni se apaga de golpe: se monta y se desmonta a
// trozos. Se parte en una cuadrícula de cuadrados que crecen —o encogen— sobre
// su propio centro, y el movimiento no es simultáneo: avanza como una onda
// diagonal desde una esquina, así que en todo momento hay una banda de
// cuadrados a medio hacer barriendo el cartel a 45°.
//
// La relación que manda sobre el aspecto es `duration / staggerStep`: es el
// ANCHO DE LA BANDA en número de diagonales. Alto (aquí, 14) = movimiento
// difuso y textil, con muchas filas a la vez; bajo = un corte nítido que barre
// el cartel. Si se toca uno de los dos números sin mirar el otro, lo que cambia
// es esto, no la velocidad.
const SIGN_GRID = {
  // Lado objetivo de cada cuadrado, en píxeles. No es el lado real: se ajusta
  // hacia abajo para que quepa un número entero de columnas, o quedaría una
  // columna recortada contra el borde.
  cellSize: 88,
  // Lo que tarda UN cuadrado en hacerse del todo.
  duration: 0.5,
  // Retardo entre diagonales consecutivas.
  staggerStep: 0.035,
  // Al aparecer cada cuadrado sale disparado y frena al llegar a su tamaño; al
  // irse arranca despacio y se precipita. Son curvas contrarias a propósito:
  // una cosa que aparece llega, y una cosa que se va se escapa.
  showEase: 'power2.out',
  hideEase: 'power2.in',
  // Esquinas por las que entra y sale la onda. Contrarias entre sí: el barrido
  // de vuelta deshace el camino del de ida, y las dos animaciones se leen como
  // un solo gesto de ida y vuelta en vez de como dos efectos distintos.
  showOrigin: 'top-left',
  hideOrigin: 'bottom-right',
} as const

type Corner = 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right'

type Grid = {
  cells: HTMLElement[]
  columns: number
  rows: number
}

// Monta la cuadrícula sobre `layer`, ya recortada del cartel.
//
// La comparten las dos direcciones, y no por ahorrar líneas: la desaparición
// tiene que producir EXACTAMENTE la misma rejilla que la aparición. Escrita dos
// veces, cualquier retoque en un lado dejaría los dos barridos descuadrados
// entre sí.
//
// Devuelve `null` cuando no hay nada que dibujar —el cartel aún no tiene tamaño
// porque su imagen no ha cargado—, y entonces le toca a quien llama resolverlo
// sin animación. Un efecto que no se puede dibujar no puede dejar el cartel a
// medias.
function buildGrid(layer: HTMLElement, image: HTMLImageElement): Grid | null {
  const width = image.offsetWidth
  const height = image.offsetHeight
  if (width < 1 || height < 1) return null

  // Cuadrados exactos: el lado sale de repartir el ancho entre las columnas que
  // caben, no del `cellSize` pedido. Usando el lado pedido tal cual, la última
  // columna y la última fila quedarían cortadas.
  const columns = Math.max(1, Math.ceil(width / SIGN_GRID.cellSize))
  const cell = width / columns
  const rows = Math.max(1, Math.ceil(height / cell))

  // Todas las celdas llevan la MISMA imagen de fondo, del tamaño del cartel
  // entero, y cada una enseña su trozo desplazando el fondo por `-x, -y`. Es lo
  // que hace que la cuadrícula sea indistinguible del cartel mientras está
  // completa: no son recortes distintos, es la misma imagen mirada por
  // ventanas distintas.
  //
  // Aquí no hace falta reproducir ningún encuadre `cover`: la caja de la capa
  // ES la caja de la imagen, así que el fondo va a tamaño natural de render.
  const source = image.currentSrc || image.src
  const fragment = document.createDocumentFragment()
  const cells: HTMLElement[] = []

  for (let row = 0; row < rows; row += 1) {
    for (let column = 0; column < columns; column += 1) {
      const x = column * cell
      const y = row * cell

      // `span` y no `div`: todo esto vive dentro de un `<button>`, que solo
      // admite contenido de tipo texto. Posicionado en absoluto se comporta
      // igual que un bloque.
      const node = document.createElement('span')
      node.className = 'welcome-sign__cell'
      node.style.left = `${x}px`
      node.style.top = `${y}px`
      // Tamaño exacto, sin el píxel de solape que se usa para tapar costuras
      // entre celdas: el cartel tiene fondo transparente, y dos celdas
      // solapadas pintarían dos veces los píxeles semitransparentes de su
      // silueta, que se verían como un borde sucio. Las costuras por redondeo
      // solo pueden asomar con la cuadrícula completa, y en ese momento o no
      // ha empezado a irse o la capa ya se ha desmontado.
      node.style.width = `${cell}px`
      node.style.height = `${cell}px`
      node.style.backgroundImage = `url("${source}")`
      node.style.backgroundSize = `${width}px ${height}px`
      node.style.backgroundPosition = `${-x}px ${-y}px`

      cells.push(node)
      fragment.append(node)
    }
  }

  // De una sola vez: montar celda a celda obligaría al navegador a recalcular
  // la disposición decenas de veces seguidas.
  layer.replaceChildren(fragment)

  return { cells, columns, rows }
}

// El retardo de cada celda es su distancia de Manhattan a la esquina de
// partida. Todas las que están a la misma distancia arrancan a la vez, y eso
// —no un cálculo de ángulos— es lo que dibuja el frente recto a 45°.
function staggerFromCorner(grid: Grid, origin: Corner): (index: number) => number {
  const fromTop = origin === 'top-left' || origin === 'top-right'
  const fromLeft = origin === 'top-left' || origin === 'bottom-left'

  return (index: number) => {
    const row = Math.floor(index / grid.columns)
    const column = index % grid.columns
    const dy = fromTop ? row : grid.rows - 1 - row
    const dx = fromLeft ? column : grid.columns - 1 - column
    return (dx + dy) * SIGN_GRID.staggerStep
  }
}

// La rejilla es un andamio: en cuanto termina el barrido, fuera.
function gridTimeline(layer: HTMLElement): gsap.core.Timeline {
  return gsap.timeline({
    onComplete: () => {
      layer.replaceChildren()
    },
  })
}

// El cartel se monta a trozos. Quien llama tiene que haber dejado la imagen
// apagada antes, o su fantasma se vería por los huecos que la cuadrícula aún no
// ha cubierto.
export function buildWelcomeSignReveal(
  layer: HTMLElement,
  image: HTMLImageElement,
): gsap.core.Timeline | null {
  const grid = buildGrid(layer, image)
  if (!grid) return null

  const timeline = gridTimeline(layer)

  timeline.fromTo(
    grid.cells,
    { scale: 0, opacity: 0 },
    {
      scale: 1,
      opacity: 1,
      duration: SIGN_GRID.duration,
      ease: SIGN_GRID.showEase,
      stagger: staggerFromCorner(grid, SIGN_GRID.showOrigin),
    },
  )

  // Justo al acabar la última celda, y dentro de la propia timeline: la imagen
  // de verdad se queda opaca en el mismo instante en que se desmonta la
  // rejilla. Hacerlo después, aunque sea un frame más tarde, se ve como un
  // parpadeo — no queda ni rejilla ni cartel.
  //
  // `>` cae al final de la construcción entera, escalonado incluido, no al
  // final de un cuadrado suelto.
  timeline.set(image, { opacity: 1 }, '>')

  return timeline
}

// Y se desmonta a trozos, deshaciendo el camino desde la esquina contraria.
//
// La imagen se apaga en el primer instante, cuando la rejilla que la tapa es
// idéntica a ella y el cambio no se ve. A partir de ahí, por cada cuadrado que
// encoge se ve el paisaje que hay detrás.
export function buildWelcomeSignHide(
  layer: HTMLElement,
  image: HTMLImageElement,
): gsap.core.Timeline | null {
  const grid = buildGrid(layer, image)
  if (!grid) return null

  const timeline = gridTimeline(layer)

  timeline.set(image, { opacity: 0 })

  timeline.to(grid.cells, {
    scale: 0,
    opacity: 0,
    duration: SIGN_GRID.duration,
    ease: SIGN_GRID.hideEase,
    stagger: staggerFromCorner(grid, SIGN_GRID.hideOrigin),
  })

  return timeline
}
