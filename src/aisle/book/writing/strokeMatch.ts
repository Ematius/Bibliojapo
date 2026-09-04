import { STROKE_MATCH } from './kanaBoardConfig'

// Cuánto se parece un trazo escrito a mano al trazo que tocaba.
//
// ── Qué se compara y qué NO ────────────────────────────────────────────────
// Solo la FORMA. Antes de comparar, los dos trazos se centran y se escalan al
// mismo tamaño, así que escribir pequeño o descolocado no baja la nota: lo único
// que se juzga es el recorrido en sí.
//
// Es una decisión de enseñanza, no técnica. Medir también el encaje dentro de la
// casilla es posible —y es lo que hace un cuaderno de verdad—, pero castiga al
// que empieza por algo que todavía no está aprendiendo.
//
// ── Por qué hay que remuestrear ────────────────────────────────────────────
// Los puntos de un trazo hecho a mano no están repartidos: donde la mano va
// despacio se amontonan y donde acelera se separan, así que dos personas
// dibujando la MISMA raya generan listas de puntos completamente distintas.
// Comparar esas listas punto a punto mediría velocidad, no forma.
//
// Repartiendo los dos trazos en el mismo número de puntos equidistantes, el punto
// 7 de uno y el 7 del otro son el mismo sitio del recorrido, y ahí la distancia
// entre ambos ya significa algo.
export interface Point {
  x: number
  y: number
}

export interface StrokeMatch {
  // Parecido de 0 a 100.
  score: number
  // El trazo es el bueno pero hecho en sentido contrario. Se detecta comparando
  // también contra la referencia del revés: si así puntúa mucho mejor, lo que
  // falla no es la forma sino por dónde se empezó.
  //
  // Merece la pena distinguirlo porque es el error más común al aprender, y el
  // más fácil de corregir: la forma ya la tiene: solo va al revés.
  reversed: boolean
}

export function matchStroke(drawn: Point[], reference: Point[]): StrokeMatch {
  // Un toque sin recorrido no es un trazo, y sin esta guarda sacaba nota.
  //
  // El motivo es que al centrarlo se queda entero en el origen, y desde el centro
  // la distancia media a un trazo que también está centrado sale corta: un punto
  // suelto puntuaba 26 sobre 100 contra cualquier trazo. Tocar la pizarra sin
  // querer no puede parecerse a nada.
  if (spread(drawn) <= STROKE_MATCH.minDiagonal) return { score: 0, reversed: false }

  const samples = STROKE_MATCH.samples
  const a = normalize(resample(drawn, samples))
  const b = normalize(resample(reference, samples))

  const forward = score(a, b)
  const backward = score(a, [...b].reverse())

  // Del revés solo se avisa cuando la diferencia es clara. Sin ese margen, un
  // trazo casi simétrico —una raya horizontal— saldría «al revés» la mitad de las
  // veces por puro ruido, y el aviso dejaría de significar nada.
  const reversed = backward > forward + STROKE_MATCH.reversedMargin

  // Al revés la nota baja aunque la forma esté perfecta. Sin la penalización, un
  // trazo hecho en sentido contrario sacaba 100: la letra sale igual, pero el
  // orden y el sentido son la mitad de lo que enseña una pauta, y un ejercicio
  // que da el pleno a quien escribe al revés no está enseñando a escribir.
  const best = Math.max(forward, backward)

  return {
    score: Math.round(reversed ? best * STROKE_MATCH.reversedPenalty : best),
    reversed,
  }
}

// Reparte el trazo en `count` puntos a la misma distancia unos de otros,
// recorriéndolo de principio a fin.
function resample(points: Point[], count: number): Point[] {
  if (points.length === 0) return []
  // Un toque sin arrastrar es un punto solo: no hay recorrido que repartir, así
  // que se repite. Sale un «trazo» de longitud cero, que es justo lo que era.
  if (points.length === 1) return Array.from({ length: count }, () => points[0])

  const total = length(points)
  if (total === 0) return Array.from({ length: count }, () => points[0])

  const step = total / (count - 1)
  const out: Point[] = [points[0]]
  // Lo que queda por recorrer hasta soltar el siguiente punto.
  let pending = step

  for (let i = 1; i < points.length; i++) {
    // Copia y no referencia: el avance por el tramo va moviendo este punto, y con
    // la referencia se estaría reescribiendo el trazo que el usuario acaba de
    // hacer. Medir algo no puede cambiarlo.
    let from = { ...points[i - 1] }
    const to = points[i]
    let segment = distance(from, to)

    // Un mismo tramo puede dar para varios puntos si es largo, de ahí el bucle
    // de dentro: se va cortando el tramo mientras siga cabiendo otro.
    while (segment >= pending && out.length < count) {
      const t = pending / segment
      const cut = {
        x: from.x + (to.x - from.x) * t,
        y: from.y + (to.y - from.y) * t,
      }
      out.push(cut)
      // El resto del tramo se mide desde el corte que se acaba de hacer.
      segment -= pending
      pending = step
      from = cut
    }

    pending -= segment
  }

  // El redondeo puede dejar el último punto sin colocar. Se completa con el final
  // del trazo, que es donde tenía que caer.
  while (out.length < count) out.push(points[points.length - 1])

  return out
}

// Centra el trazo en el origen y lo escala a un tamaño fijo.
//
// La escala es UNIFORME —el mismo factor en los dos ejes— y sale de la diagonal
// de su caja. Estirar cada eje por separado igualaría las proporciones, y una
// raya ancha y baja acabaría siendo idéntica a una estrecha y alta: se perdería
// justo lo que distingue un trazo de otro.
function normalize(points: Point[]): Point[] {
  if (points.length === 0) return []

  const box = bounds(points)
  const centerX = (box.minX + box.maxX) / 2
  const centerY = (box.minY + box.maxY) / 2
  const diagonal = Math.hypot(box.maxX - box.minX, box.maxY - box.minY)
  // Un punto suelto no tiene diagonal, y dividir por cero dejaría el trazo entero
  // en NaN y la nota sin calcular. Se queda tal cual, centrado en el origen.
  const scale = diagonal > STROKE_MATCH.minDiagonal ? 1 / diagonal : 0

  return points.map((point) => ({
    x: (point.x - centerX) * scale,
    y: (point.y - centerY) * scale,
  }))
}

// Distancia media entre puntos que se corresponden, convertida en nota.
//
// Ya normalizados, los dos trazos caben en un círculo de radio 0,5, así que la
// distancia media se mueve entre 0 —calcado— y algo menos de 1. `tolerance` es
// lo que se considera «no tiene nada que ver»: a partir de ahí, cero.
function score(a: Point[], b: Point[]): number {
  if (a.length === 0 || a.length !== b.length) return 0

  let sum = 0
  for (let i = 0; i < a.length; i++) sum += distance(a[i], b[i])
  const average = sum / a.length

  return Math.max(0, 1 - average / STROKE_MATCH.tolerance) * 100
}

// Lo que ocupa un trazo: la diagonal de su caja. Sirve para saber si hay trazo o
// solo un toque, y para escalarlo sin deformarlo.
//
// Se exporta porque la pizarra necesita la misma medida antes de dar por bueno un
// trazo, y las dos tienen que estar de acuerdo en qué cuenta como recorrido.
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
