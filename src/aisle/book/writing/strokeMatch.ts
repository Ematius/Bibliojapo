import { STROKE_MATCH } from './kanaBoardConfig'

// Cuánto se parece un trazo escrito a mano al que tocaba.
//
// Se compara SOLO la forma: antes de comparar, los dos trazos se centran y se escalan al
// mismo tamaño, así que escribir pequeño o descolocado no baja la nota. Es una decisión de
// enseñanza: medir también el encaje en la casilla castiga al que empieza por algo que
// todavía no está aprendiendo.
//
// Hay que REMUESTREAR porque los puntos de un trazo a mano no están repartidos —donde la
// mano va despacio se amontonan—, así que comparar las listas punto a punto mediría
// velocidad, no forma. Repartidos en el mismo número de puntos equidistantes, el punto 7 de
// uno y el 7 del otro son el mismo sitio del recorrido.
export interface Point {
  x: number
  y: number
}

export interface StrokeMatch {
  score: number
  // El trazo es el bueno pero al revés. Se detecta comparando también contra la referencia
  // invertida: si así puntúa mucho mejor, lo que falla no es la forma sino por dónde se
  // empezó. Merece la pena distinguirlo porque es el error más común al aprender.
  reversed: boolean
}

export function matchStroke(drawn: Point[], reference: Point[]): StrokeMatch {
  // Un toque sin recorrido no es un trazo, y sin esta guarda sacaba nota: al centrarlo se
  // queda en el origen, y desde ahí la distancia media a cualquier trazo centrado sale
  // corta — un punto suelto puntuaba 26 sobre 100.
  if (spread(drawn) <= STROKE_MATCH.minDiagonal) return { score: 0, reversed: false }

  const samples = STROKE_MATCH.samples
  const a = normalize(resample(drawn, samples))
  const b = normalize(resample(reference, samples))

  const forward = score(a, b)
  const backward = score(a, [...b].reverse())

  // Solo se avisa cuando la diferencia es clara: sin ese margen, una raya horizontal saldría
  // «al revés» la mitad de las veces por puro ruido.
  const reversed = backward > forward + STROKE_MATCH.reversedMargin

  // Al revés la nota baja aunque la forma esté perfecta: el orden y el sentido son la mitad
  // de lo que enseña una pauta.
  const best = Math.max(forward, backward)

  return {
    score: Math.round(reversed ? best * STROKE_MATCH.reversedPenalty : best),
    reversed,
  }
}

function resample(points: Point[], count: number): Point[] {
  if (points.length === 0) return []
  // Un toque sin arrastrar es un punto solo: no hay recorrido que repartir, así que se
  // repite.
  if (points.length === 1) return Array.from({ length: count }, () => points[0])

  const total = length(points)
  if (total === 0) return Array.from({ length: count }, () => points[0])

  const step = total / (count - 1)
  const out: Point[] = [points[0]]
  let pending = step

  for (let i = 1; i < points.length; i++) {
    // Copia y no referencia: el avance por el tramo va moviendo este punto, y con la
    // referencia se estaría reescribiendo el trazo que el usuario acaba de hacer.
    let from = { ...points[i - 1] }
    const to = points[i]
    let segment = distance(from, to)

    // Un mismo tramo puede dar para varios puntos si es largo.
    while (segment >= pending && out.length < count) {
      const t = pending / segment
      const cut = {
        x: from.x + (to.x - from.x) * t,
        y: from.y + (to.y - from.y) * t,
      }
      out.push(cut)
      segment -= pending
      pending = step
      from = cut
    }

    pending -= segment
  }

  // El redondeo puede dejar el último punto sin colocar: se completa con el final del trazo.
  while (out.length < count) out.push(points[points.length - 1])

  return out
}

// Centra el trazo en el origen y lo escala a un tamaño fijo. La escala es UNIFORME y sale de
// la diagonal de su caja: estirando cada eje por separado, una raya ancha y baja acabaría
// siendo idéntica a una estrecha y alta.
function normalize(points: Point[]): Point[] {
  if (points.length === 0) return []

  const box = bounds(points)
  const centerX = (box.minX + box.maxX) / 2
  const centerY = (box.minY + box.maxY) / 2
  const diagonal = Math.hypot(box.maxX - box.minX, box.maxY - box.minY)
  // Un punto suelto no tiene diagonal, y dividir por cero dejaría la nota en NaN.
  const scale = diagonal > STROKE_MATCH.minDiagonal ? 1 / diagonal : 0

  return points.map((point) => ({
    x: (point.x - centerX) * scale,
    y: (point.y - centerY) * scale,
  }))
}

// Distancia media entre puntos que se corresponden, convertida en nota. Ya normalizados, los
// dos trazos caben en un círculo de radio 0,5, así que la distancia se mueve entre 0 y algo
// menos de 1; `tolerance` es lo que se considera «no tiene nada que ver».
function score(a: Point[], b: Point[]): number {
  if (a.length === 0 || a.length !== b.length) return 0

  let sum = 0
  for (let i = 0; i < a.length; i++) sum += distance(a[i], b[i])
  const average = sum / a.length

  return Math.max(0, 1 - average / STROKE_MATCH.tolerance) * 100
}

// Lo que ocupa un trazo: la diagonal de su caja. Se exporta porque la pizarra necesita la
// misma medida antes de dar por bueno un trazo, y las dos tienen que estar de acuerdo en qué
// cuenta como recorrido.
export function spread(points: Point[]): number {
  if (points.length === 0) return 0
  const box = bounds(points)
  return Math.hypot(box.maxX - box.minX, box.maxY - box.minY)
}

function bounds(points: Point[]) {
  let minX = Infinity
  let minY = Infinity
  let maxX = -Infinity
  let maxY = -Infinity

  for (const point of points) {
    if (point.x < minX) minX = point.x
    if (point.x > maxX) maxX = point.x
    if (point.y < minY) minY = point.y
    if (point.y > maxY) maxY = point.y
  }

  return { minX, minY, maxX, maxY }
}

function length(points: Point[]): number {
  let total = 0
  for (let i = 1; i < points.length; i++) total += distance(points[i - 1], points[i])
  return total
}

function distance(a: Point, b: Point): number {
  return Math.hypot(b.x - a.x, b.y - a.y)
}
