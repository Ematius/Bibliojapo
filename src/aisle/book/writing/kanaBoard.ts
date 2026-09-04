import { KANA_BOARD, STROKE_MATCH } from './kanaBoardConfig'
import { matchStroke, spread, type Point } from './strokeMatch'

// Los puntos van en fracciones de la caja de la pizarra: { x: 0, y: 0 } es la
// esquina de arriba a la izquierda y { x: 1, y: 1 } la de abajo a la derecha. Ver
// por qué en `strokes`, más abajo.

// La pizarra de la pauta: escribir el kana con el ratón o con el dedo.
//
// ── Por qué esto no es un hook ─────────────────────────────────────────────
// Lo mismo que en `bookAudio.ts` y `kanaStrokeAnimation.ts`: page-flip clona las
// páginas de React para meterlas en su estructura, así que un manejador de React
// se quedaría enganchado a la copia que nadie ve. Esto recibe el nodo YA clonado.
//
// ── Por qué el gesto no pasa la hoja ───────────────────────────────────────
// Dibujar y pasar página son el MISMO gesto: apretar y arrastrar. page-flip
// escucha el principio de ese gesto en el contenedor del libro y el resto en la
// ventana:
//
//     distElement.addEventListener('mousedown', …)   ← el que importa
//     window.addEventListener('mousemove', …)        ← solo actúa si hubo mousedown
//
// Como la pizarra vive dentro de ese contenedor, cortar ahí el `mousedown` y el
// `touchstart` basta: sin el principio, el seguimiento de la ventana no encuentra
// ningún gesto abierto y la hoja no se mueve. Por eso se cortan los dos eventos
// ANTIGUOS y se dibuja con los de puntero: son sucesos distintos, y silenciar uno
// no silencia el otro.
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

  // Los trazos con los que se compara lo escrito.
  //
  // No hace falta pasárselos a nadie: ya están dibujados en la hoja, en el SVG de
  // la última casilla, que es la única que los tiene todos y en orden. De ahí se
  // leen — y se leen como ELEMENTOS, no como texto, porque un <path> del documento
  // sabe decir su propia longitud y qué punto le corresponde a cada tramo. Eso
  // ahorra escribir un intérprete de rutas, y funciona igual el día que un kana
  // traiga curvas en vez de rectas.
  const referencePaths = [
    ...board.querySelectorAll<SVGPathElement>('[data-reference] .kana-trace__stroke'),
  ]

  // Se muestrean tarde, la primera vez que hagan falta, y no al montar: medir un
  // camino exige que el navegador lo haya dibujado, y al montar la hoja puede
  // estar todavía sin construir. Cuando se levanta el primer trazo ya lleva rato
  // en pantalla.
  let reference: Point[][] | null = null
  const referenceStrokes = () => {
    if (reference === null) {
      reference = referencePaths.map((path) => samplePath(path, STROKE_MATCH.samples))
    }
    return reference
  }

  // La tinta sale del token, no de un valor escrito aquí: lo que se escribe en la
  // pizarra tiene que ser del mismo color que lo que se escribe en el libro.
  const ink =
    getComputedStyle(canvas).getPropertyValue('--color-ink').trim() || KANA_BOARD.fallbackInk

  // Medidas en píxeles de CSS, que son las que usa todo lo que se dibuja. La
  // rejilla real del canvas es mayor en pantallas densas — ver `resize`.
  let width = 0
  let height = 0

  // Lo que lleva escrito, trazo a trazo y en el orden en que se hicieron.
  //
  // Los puntos van en fracciones de 0 a 1 sobre la caja de la pizarra, NO en
  // píxeles. Dos motivos, y los dos importan:
  //
  //   · La pizarra cambia de tamaño con el libro. Guardado en píxeles, lo escrito
  //     dejaría de valer en cuanto la ventana cambiara, y no se podría repintar.
  //   · Lo que se escribe hay que poder compararlo con `kana.strokes`, que está en
  //     el sistema de coordenadas del glifo. Entre dos cosas normalizadas la
  //     comparación es una regla de tres; entre píxeles y unidades de glifo, no.
  //
  // Un trazo es lo que va de apretar a soltar, que es exactamente lo que un kana
  // llama trazo. Por eso se guardan por separado en lugar de como una mancha: el
  // orden y el número son la mitad de lo que hay que aprender.
  const strokes: Point[][] = []
  let current: Point[] = []
  let drawing = false

  // La nota de cada trazo, en el mismo orden. Es lo que se promedia al terminar.
  const scores: number[] = []

  // Repinta de cero todo lo que hay guardado.
  //
  // Solo se usa al cambiar de tamaño. Mientras se escribe NO se repinta: alargar
  // el trazo en curso es una línea más sobre lo ya pintado, y volver a dibujarlo
  // entero en cada movimiento del puntero es trabajo tirado.
  //
  // Va en una `const` y no en una declaración `function` a propósito: una función
  // declarada se eleva al principio, así que TypeScript deja de poder garantizar
  // que el contexto de dibujo ya está comprobado cuando se ejecuta el cuerpo.
  const repaint = () => {
    ctx.clearRect(0, 0, width, height)

    strokes.forEach((stroke) => {
      if (stroke.length === 0) return
      ctx.beginPath()
      stroke.forEach((point) => ctx.lineTo(point.x * width, point.y * height))
      ctx.stroke()
    })
  }

  // Un canvas tiene DOS tamaños: el que ocupa en la página y el de su rejilla de
  // píxeles. Si no se cuadran, lo dibujado sale borroso y además desplazado
  // respecto al puntero, porque el navegador estira el resultado.
  //
  // Redimensionar un canvas lo BORRA, así que solo se hace cuando el tamaño ha
  // cambiado de verdad: un observador que se dispare de más borraría lo que el
  // usuario lleva escrito.
  const resize = () => {
    const rect = canvas.getBoundingClientRect()
    if (rect.width === 0 || rect.height === 0) return
    if (Math.round(rect.width) === width && Math.round(rect.height) === height) return

    width = Math.round(rect.width)
    height = Math.round(rect.height)

    const ratio = window.devicePixelRatio || 1
    canvas.width = Math.round(width * ratio)
    canvas.height = Math.round(height * ratio)

    // Con esto todo lo demás puede trabajar en píxeles de CSS y olvidarse de la
    // densidad de la pantalla.
    ctx.setTransform(ratio, 0, 0, ratio, 0, 0)
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'
    ctx.strokeStyle = ink
    // El pincel es una fracción del lado y no un grosor fijo: la pizarra encoge y
    // crece con el libro, y un trazo de 6 píxeles que va bien a pantalla completa
    // tacha la casilla entera en un móvil.
    ctx.lineWidth = Math.min(width, height) * KANA_BOARD.brushRatio

    // Cambiar la rejilla del canvas lo deja en blanco, así que lo escrito se
    // vuelve a pintar. Es lo que permite estirar la ventana sin perder el kana a
    // medio escribir — y solo es posible porque los trazos están guardados en
    // fracciones y no en píxeles.
    repaint()
  }

  // page-flip mide en píxeles y su libro cambia de tamaño con la ventana, así que
  // la pizarra no puede dimensionarse una sola vez. El observador cubre además el
  // caso de montar cuando la hoja todavía no tiene medidas.
  const observer = new ResizeObserver(resize)
  observer.observe(canvas)
  resize()

  // El punto del puntero, en fracciones de la pizarra.
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
    // Un toque sin arrastrar tiene que dejar punto: sin esto, tocar y levantar no
    // pinta nada, y el primer trazo corto de un kana desaparece.
    ctx.lineTo(point.x * width, point.y * height)
    ctx.stroke()
    // El trazo sigue aunque el puntero se salga de la pizarra: sin capturarlo, un
    // gesto que se pasa del borde se corta a la mitad y hay que empezar de nuevo.
    canvas.setPointerCapture(event.pointerId)
  }

  const onMove = (event: PointerEvent) => {
    if (!drawing) return
    const point = pointAt(event)
    current.push(point)
    ctx.lineTo(point.x * width, point.y * height)
    ctx.stroke()
  }

  // Al levantar, el trazo se cierra, pasa a la lista y se corrige. Un trazo es lo
  // que va de apretar a soltar: el mismo corte que hace la mano al escribir.
  //
  // Se corrige AQUÍ y no al final a propósito: enterarse de que el primer trazo va
  // al revés cuando ya está el kana entero escrito no sirve de nada. Un profesor
  // que mira por encima del hombro avisa en el momento.
  const onUp = () => {
    if (!drawing) return
    drawing = false

    // Un roce sin recorrido no cuenta como trazo: ni se guarda ni se corrige. Sin
    // esto, apoyar el dedo un instante gastaría un trazo del kana y descuadraría
    // todos los siguientes.
    if (spread(current) < KANA_BOARD.minStroke) {
      current = []
      return
    }

    const index = strokes.length
    strokes.push(current)
    current = []
    report(index)
  }

  // Qué se dice del trazo que se acaba de hacer.
  const report = (index: number) => {
    const expected = referenceStrokes()

    // Más trazos de los que tiene el kana. Es un error por sí solo, y no hay con
    // qué compararlo, así que se dice y ya.
    if (index >= expected.length) {
      result.textContent = `Este kana se escribe con ${expected.length} trazos: pulsa Borrar y empieza de nuevo.`
      return
    }

    const match = matchStroke(strokes[index], expected[index])
    scores.push(match.score)

    const head = `Trazo ${index + 1}: ${match.score} %`
    result.textContent = match.reversed ? `${head} — lo has hecho al revés.` : head

    // Con el último trazo dado, el kana está escrito y toca el veredicto.
    if (scores.length === expected.length) close()
  }

  // El resultado del kana entero: la media de lo que ha sacado cada trazo.
  //
  // Media simple y no ponderada a propósito. Podría pesar más el trazo largo que
  // el corto, pero cada trazo es un movimiento que hay que aprender por separado y
  // fallar el primero de あ —esa raya de nada— no es un error menor que fallar el
  // bucle. Cuentan igual porque valen igual.
  const close = () => {
    const total = Math.round(scores.reduce((sum, score) => sum + score, 0) / scores.length)
    // El carácter lo pone el contenido, no este archivo: ver `data-character`.
    const character = board.dataset.character ?? ''

    verdict.textContent = `${character} al ${total} %`
    // El desglose debajo, para que la media no sea un número que haya que creerse:
    // con los trazos delante se ve de dónde sale y cuál conviene repetir.
    detail.textContent = scores.join(' · ')
  }

  // Los dos eventos que hay que callar para que el libro no pase la hoja. No
  // hacen nada más: la pizarra dibuja con los eventos de puntero.
  const block = (event: Event) => event.stopPropagation()

  // Borrar vacía las dos cosas: lo pintado y lo guardado. Si solo se limpiara el
  // canvas, la pizarra se vería en blanco pero seguiría acordándose de todo, y al
  // primer cambio de tamaño reaparecería lo borrado.
  const onClear = () => {
    strokes.length = 0
    scores.length = 0
    current = []
    // La corrección y el veredicto también se van: si se quedaran puestos,
    // estarían hablando de un kana que ya no está en la pizarra.
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
  // Si el sistema se lleva el puntero a media raya —una llamada, un gesto del
  // navegador— hay que soltar igual, o la siguiente vez seguiría pintando sin que
  // nadie esté apretando.
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

// Reparte un camino del documento en `count` puntos a la misma distancia.
//
// Lo mide el navegador, que sabe recorrer cualquier ruta —rectas, curvas o lo que
// venga— sin que haya que interpretar el texto del atributo `d`. A cambio exige
// que el elemento esté dibujado: un camino que el navegador no ha construido
// todavía mide cero. Por eso esto se llama tarde y no al montar.
function samplePath(path: SVGPathElement, count: number): Point[] {
  const total = path.getTotalLength()
  if (total === 0 || count < 2) return []

  return Array.from({ length: count }, (_, index) => {
    const point = path.getPointAtLength((total * index) / (count - 1))
    return { x: point.x, y: point.y }
  })
}
