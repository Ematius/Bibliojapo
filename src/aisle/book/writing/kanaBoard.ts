import { KANA_BOARD, STROKE_MATCH } from './kanaBoardConfig'
import { matchStroke, spread, type Point } from './strokeMatch'

// La pizarra de la pauta: escribir el kana con el ratón o con el dedo.
//
// Los puntos van en fracciones de la caja de la pizarra: { x: 0, y: 0 } es la esquina de
// arriba a la izquierda. Ver por qué en `strokes`, más abajo.
//
// No es un hook porque page-flip clona las páginas de React: esto recibe el nodo YA clonado.
//
// EL GESTO NO PUEDE PASAR LA HOJA: dibujar y pasar página son el mismo gesto, apretar y
// arrastrar. page-flip escucha el `mousedown` en el contenedor del libro y el resto en la
// ventana, así que cortar ahí el `mousedown` y el `touchstart` basta: sin el principio, el
// seguimiento de la ventana no encuentra ningún gesto abierto. Se cortan esos dos eventos
// ANTIGUOS y se dibuja con los de puntero: son sucesos distintos, y silenciar uno no
// silencia el otro.
export function mountKanaBoard(root: HTMLElement): (() => void) | null {
  const boards = [...root.querySelectorAll<HTMLElement>('.kana-trace')]
  if (boards.length === 0) return null

  const teardowns = boards.map((board) => mountOne(board)).filter(Boolean) as (() => void)[]
  if (teardowns.length === 0) return null

  return () => {
    teardowns.forEach((teardown) => teardown())
  }
}

function mountOne(board: HTMLElement): (() => void) | null {
  const canvas = board.querySelector<HTMLCanvasElement>('.kana-trace__canvas')
  const clear = board.querySelector<HTMLButtonElement>('.kana-trace__clear')
  const result = board.querySelector<HTMLElement>('.kana-trace__result')
  const verdict = board.querySelector<HTMLElement>('.kana-trace__verdict')
  const detail = board.querySelector<HTMLElement>('.kana-trace__detail')
  const ctx = canvas?.getContext('2d')
  if (!canvas || !clear || !result || !verdict || !detail || !ctx) return null

  // Los trazos con los que se compara lo escrito. Ya están dibujados en la hoja, en el SVG
  // de la última casilla, que es la única que los tiene todos y en orden. Se leen como
  // ELEMENTOS y no como texto: un <path> del documento sabe decir su propia longitud, lo que
  // ahorra escribir un intérprete de rutas y funciona igual con curvas.
  const referencePaths = [
    ...board.querySelectorAll<SVGPathElement>('[data-reference] .kana-trace__stroke'),
  ]

  // Se muestrean tarde, la primera vez que hagan falta: medir un camino exige que el
  // navegador lo haya dibujado, y al montar la hoja puede estar todavía sin construir.
  let reference: Point[][] | null = null
  const referenceStrokes = () => {
    if (reference === null) {
      reference = referencePaths.map((path) => samplePath(path, STROKE_MATCH.samples))
    }
    return reference
  }

  // La tinta sale del token: lo que se escribe en la pizarra tiene que ser del mismo color
  // que lo que se escribe en el libro.
  const ink =
    getComputedStyle(canvas).getPropertyValue('--color-ink').trim() || KANA_BOARD.fallbackInk

  // En píxeles de CSS. La rejilla real del canvas es mayor en pantallas densas — ver `resize`.
  let width = 0
  let height = 0

  // Lo que lleva escrito, trazo a trazo y en orden. Los puntos van en FRACCIONES de 0 a 1,
  // no en píxeles, por dos motivos: la pizarra cambia de tamaño con el libro —guardado en
  // píxeles no se podría repintar—, y hay que poder compararlo con `kana.strokes`, que está
  // en el sistema del glifo.
  //
  // Un trazo es lo que va de apretar a soltar, que es exactamente lo que un kana llama
  // trazo: el orden y el número son la mitad de lo que hay que aprender.
  const strokes: Point[][] = []
  let current: Point[] = []
  let drawing = false

  const scores: number[] = []

  // Solo se usa al cambiar de tamaño. Mientras se escribe NO se repinta: alargar el trazo en
  // curso es una línea más sobre lo ya pintado.
  //
  // Va en una `const` y no en una declaración `function`: una función declarada se eleva, y
  // TypeScript deja de poder garantizar que el contexto de dibujo ya está comprobado.
  const repaint = () => {
    ctx.clearRect(0, 0, width, height)

    strokes.forEach((stroke) => {
      if (stroke.length === 0) return
      ctx.beginPath()
      stroke.forEach((point) => ctx.lineTo(point.x * width, point.y * height))
      ctx.stroke()
    })
  }

  // Un canvas tiene DOS tamaños: el que ocupa en la página y el de su rejilla de píxeles.
  // Sin cuadrarlos, lo dibujado sale borroso y desplazado respecto al puntero.
  //
  // Redimensionarlo lo BORRA, así que solo se hace cuando el tamaño ha cambiado de verdad.
  const resize = () => {
    const rect = canvas.getBoundingClientRect()
    if (rect.width === 0 || rect.height === 0) return
    if (Math.round(rect.width) === width && Math.round(rect.height) === height) return

    width = Math.round(rect.width)
    height = Math.round(rect.height)

    const ratio = window.devicePixelRatio || 1
    canvas.width = Math.round(width * ratio)
    canvas.height = Math.round(height * ratio)

    // Con esto todo lo demás trabaja en píxeles de CSS y se olvida de la densidad.
    ctx.setTransform(ratio, 0, 0, ratio, 0, 0)
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'
    ctx.strokeStyle = ink
    // El pincel es una fracción del lado: un trazo de 6 píxeles que va bien a pantalla
    // completa tacha la casilla entera en un móvil.
    ctx.lineWidth = Math.min(width, height) * KANA_BOARD.brushRatio

    // Cambiar la rejilla deja el canvas en blanco, así que lo escrito se vuelve a pintar. Solo
    // es posible porque los trazos están guardados en fracciones.
    repaint()
  }

  // page-flip mide en píxeles y su libro cambia de tamaño con la ventana. El observador cubre
  // además el caso de montar cuando la hoja todavía no tiene medidas.
  const observer = new ResizeObserver(resize)
  observer.observe(canvas)
  resize()

  const pointAt = (event: PointerEvent): Point => {
    const rect = canvas.getBoundingClientRect()
    return {
      x: (event.clientX - rect.left) / rect.width,
      y: (event.clientY - rect.top) / rect.height,
    }
  }

  const onDown = (event: PointerEvent) => {
    drawing = true
    const point = pointAt(event)
    current = [point]

    ctx.beginPath()
    ctx.moveTo(point.x * width, point.y * height)
    // Un toque sin arrastrar tiene que dejar punto: sin esto el primer trazo corto de un kana
    // desaparece.
    ctx.lineTo(point.x * width, point.y * height)
    ctx.stroke()
    // Sin capturar el puntero, un gesto que se pasa del borde se corta a la mitad.
    canvas.setPointerCapture(event.pointerId)
  }

  const onMove = (event: PointerEvent) => {
    if (!drawing) return
    const point = pointAt(event)
    current.push(point)
    ctx.lineTo(point.x * width, point.y * height)
    ctx.stroke()
  }

  // Al levantar, el trazo se cierra, pasa a la lista y se corrige. Se corrige AQUÍ y no al
  // final: enterarse de que el primer trazo va al revés con el kana entero escrito no sirve
  // de nada.
  const onUp = () => {
    if (!drawing) return
    drawing = false

    // Un roce sin recorrido no cuenta como trazo: si contara, apoyar el dedo un instante
    // gastaría un trazo del kana y descuadraría todos los siguientes.
    if (spread(current) < KANA_BOARD.minStroke) {
      current = []
      return
    }

    const index = strokes.length
    strokes.push(current)
    current = []
    report(index)
  }

  const report = (index: number) => {
    const expected = referenceStrokes()

    // Más trazos de los que tiene el kana: no hay con qué comparar, así que se dice y ya.
    if (index >= expected.length) {
      result.textContent = `Este kana se escribe con ${expected.length} trazos: pulsa Borrar y empieza de nuevo.`
      return
    }

    const match = matchStroke(strokes[index], expected[index])
    scores.push(match.score)

    const head = `Trazo ${index + 1}: ${match.score} %`
    result.textContent = match.reversed ? `${head} — lo has hecho al revés.` : head

    if (scores.length === expected.length) close()
  }

  // La media de lo que ha sacado cada trazo. Simple y no ponderada: cada trazo es un
  // movimiento que hay que aprender por separado, y fallar la raya corta de あ no es un error
  // menor que fallar el bucle.
  const close = () => {
    const total = Math.round(scores.reduce((sum, score) => sum + score, 0) / scores.length)
    // El carácter lo pone el contenido, no este archivo: ver `data-character`.
    const character = board.dataset.character ?? ''

    verdict.textContent = `${character} al ${total} %`
    // El desglose debajo, para que la media no sea un número que haya que creerse.
    detail.textContent = scores.join(' · ')
  }

  // Los dos eventos que hay que callar para que el libro no pase la hoja.
  const block = (event: Event) => event.stopPropagation()

  // Borrar vacía lo pintado Y lo guardado: limpiando solo el canvas, la pizarra se vería en
  // blanco pero al primer cambio de tamaño reaparecería lo borrado.
  const onClear = () => {
    strokes.length = 0
    scores.length = 0
    current = []
    // Si se quedaran puestos, estarían hablando de un kana que ya no está en la pizarra.
    result.textContent = ''
    verdict.textContent = ''
    detail.textContent = ''
    ctx.clearRect(0, 0, width, height)
  }

  canvas.addEventListener('mousedown', block)
  canvas.addEventListener('touchstart', block)
  canvas.addEventListener('pointerdown', onDown)
  canvas.addEventListener('pointermove', onMove)
  canvas.addEventListener('pointerup', onUp)
  // Si el sistema se lleva el puntero a media raya, hay que soltar igual o la siguiente vez
  // seguiría pintando sin que nadie esté apretando.
  canvas.addEventListener('pointercancel', onUp)
  clear.addEventListener('click', onClear)

  return () => {
    observer.disconnect()
    canvas.removeEventListener('mousedown', block)
    canvas.removeEventListener('touchstart', block)
    canvas.removeEventListener('pointerdown', onDown)
    canvas.removeEventListener('pointermove', onMove)
    canvas.removeEventListener('pointerup', onUp)
    canvas.removeEventListener('pointercancel', onUp)
    clear.removeEventListener('click', onClear)
  }
}

// Reparte un camino del documento en `count` puntos equidistantes. Lo mide el navegador, sin
// interpretar el atributo `d`, pero a cambio exige que el elemento esté dibujado: un camino
// sin construir mide cero. Por eso esto se llama tarde y no al montar.
function samplePath(path: SVGPathElement, count: number): Point[] {
  const total = path.getTotalLength()
  if (total === 0 || count < 2) return []

  return Array.from({ length: count }, (_, index) => {
    const point = path.getPointAtLength((total * index) / (count - 1))
    return { x: point.x, y: point.y }
  })
}
