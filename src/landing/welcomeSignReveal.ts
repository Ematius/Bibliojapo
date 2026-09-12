import gsap from 'gsap'

// El cartel se monta y se desmonta a trozos: una cuadrícula de cuadrados que crecen
// sobre su centro, en una onda diagonal a 45°.
//
// `duration / staggerStep` es el ANCHO DE LA BANDA en diagonales, y es lo que manda
// sobre el aspecto: alto, movimiento difuso y textil; bajo, un corte nítido. Tocar
// uno de los dos sin mirar el otro cambia eso, no la velocidad.
const SIGN_GRID = {
  // Lado OBJETIVO, no real: se ajusta hacia abajo para que quepa un número entero
  // de columnas.
  cellSize: 88,
  duration: 0.5,
  staggerStep: 0.035,
  // Curvas contrarias a propósito: una cosa que aparece llega, una que se va se escapa.
  showEase: 'power2.out',
  hideEase: 'power2.in',
  // Contrarias entre sí: el barrido de vuelta deshace el de ida, y los dos se leen
  // como un solo gesto.
  showOrigin: 'top-left',
  hideOrigin: 'bottom-right',
} as const

type Corner = 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right'

type Grid = {
  cells: HTMLElement[]
  columns: number
  rows: number
}

// La comparten las dos direcciones, y no por ahorrar líneas: la desaparición tiene
// que producir EXACTAMENTE la misma rejilla que la aparición.
//
// Devuelve `null` cuando el cartel aún no tiene tamaño —su imagen no ha cargado—, y
// entonces le toca a quien llama resolverlo sin animación.
function buildGrid(layer: HTMLElement, image: HTMLImageElement): Grid | null {
  const width = image.offsetWidth
  const height = image.offsetHeight
  if (width < 1 || height < 1) return null

  const columns = Math.max(1, Math.ceil(width / SIGN_GRID.cellSize))
  const cell = width / columns
  const rows = Math.max(1, Math.ceil(height / cell))

  // Todas las celdas llevan la MISMA imagen de fondo, del tamaño del cartel entero, y
  // cada una enseña su trozo desplazándola por `-x, -y`: no son recortes distintos,
  // es la misma imagen mirada por ventanas distintas.
  const source = image.currentSrc || image.src
  const fragment = document.createDocumentFragment()
  const cells: HTMLElement[] = []

  for (let row = 0; row < rows; row += 1) {
    for (let column = 0; column < columns; column += 1) {
      const x = column * cell
      const y = row * cell

      // `span` y no `div`: todo esto vive dentro de un `<button>`, que solo admite
      // contenido de tipo texto.
      const node = document.createElement('span')
      node.className = 'welcome-sign__cell'
      node.style.left = `${x}px`
      node.style.top = `${y}px`
      // Sin el píxel de solape que se usa para tapar costuras: el cartel tiene fondo
      // transparente, y dos celdas solapadas pintarían dos veces sus píxeles
      // semitransparentes, que se verían como un borde sucio.
      node.style.width = `${cell}px`
      node.style.height = `${cell}px`
      node.style.backgroundImage = `url("${source}")`
      node.style.backgroundSize = `${width}px ${height}px`
      node.style.backgroundPosition = `${-x}px ${-y}px`

      cells.push(node)
      fragment.append(node)
    }
  }

  // De una sola vez: celda a celda el navegador recalcularía la disposición decenas
  // de veces seguidas.
  layer.replaceChildren(fragment)

  return { cells, columns, rows }
}

// El retardo de cada celda es su distancia de Manhattan a la esquina de partida: las
// que están a la misma distancia arrancan a la vez, y eso dibuja el frente recto.
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

function gridTimeline(layer: HTMLElement): gsap.core.Timeline {
  return gsap.timeline({
    onComplete: () => {
      layer.replaceChildren()
    },
  })
}

// Quien llama tiene que haber dejado la imagen apagada antes, o su fantasma se vería
// por los huecos que la cuadrícula aún no ha cubierto.
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

  // Dentro de la propia timeline: la imagen se queda opaca en el mismo instante en
  // que se desmonta la rejilla, y un frame más tarde ya se vería como un parpadeo.
  // `>` cae al final de la construcción entera, escalonado incluido.
  timeline.set(image, { opacity: 1 }, '>')

  return timeline
}

// La imagen se apaga en el primer instante, cuando la rejilla que la tapa es idéntica
// a ella y el cambio no se ve.
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
