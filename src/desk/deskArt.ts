// Las caras de cada objeto de la mesa: cómo se ve posado y cómo se ve enfrente. Es el
// hermano de `volumeArt.ts`.
//
// HAY QUE MEDIR, no basta con poner las dos imágenes: un recorte no llena su lienzo, y no lo
// llena igual en las dos caras —el carné posado ocupa el 90 % del suyo y descentrado, el de
// frente lo llena entero—. Con el mismo ancho de `<img>`, la tarjeta saltaría un 10 % justo
// en el relevo.
//
// SI SE CAMBIA UN DIBUJO hay que volver a medirlo. Sale del canal alfa: el rectángulo que
// encierra todo lo que no es transparente.

export interface DeskFace {
  src: string
  // Qué fracción del lienzo ocupa el objeto. Con esto se agranda la imagen hasta que lo que
  // se ve mide lo que tiene que medir.
  usableWidth: number
  usableHeight: number
  // Dónde cae su centro dentro del lienzo: un recorte descentrado —el carné posado lo está—
  // se desplazaría al relevarse si no se compensa.
  centerX: number
  centerY: number
  // Del LIENZO, no del objeto: la imagen se pinta con el ancho puesto y el alto libre, así
  // que es esta la que decide cuánto ocupa de alto.
  canvasRatio: number
}

// A partir de lo medido sobre el PNG, en píxeles: el lienzo entero y el rectángulo que ocupa
// de verdad —[izquierda, arriba, ancho, alto]—.
function deskFace(src: string, canvas: [number, number], box: [number, number, number, number]) {
  const [canvasWidth, canvasHeight] = canvas
  const [left, top, width, height] = box

  return {
    src,
    usableWidth: width / canvasWidth,
    usableHeight: height / canvasHeight,
    centerX: (left + width / 2) / canvasWidth,
    centerY: (top + height / 2) / canvasHeight,
    canvasRatio: canvasWidth / canvasHeight,
  } satisfies DeskFace
}

// `resting` es obligatoria —es lo que se ve en la mesa— y `front` opcional: un objeto sin
// ella se levanta tal cual. Hoy solo el carné tiene las dos.
export interface DeskArt {
  resting: DeskFace
  front?: DeskFace
  // Fotogramas de apertura, en el MISMO lienzo que `resting`: se apilan sin ajustar y lo
  // quieto del dibujo se queda quieto. Medirlos por su silueta los descuadraría, porque lo
  // que crece al abrirse es la tapa.
  frames?: string[]
}

// Cómo dibujar la cara de frente para que su objeto caiga encima del de reposo. Sin esto
// cada una se pintaría a su lienzo y el objeto daría un salto en mitad del fundido: un 10 %
// en el carné, y más en la hoja, cuyos lienzos ni siquiera comparten proporción.
export function frontFit(art: DeskArt): {
  scale: number
  left: number
  top: number
  height: number
} {
  const { resting, front } = art
  if (!front) return { scale: 1, left: 0, top: 0, height: 1 }

  const scale = resting.usableWidth / front.usableWidth
  const height = (scale * resting.canvasRatio) / front.canvasRatio

  return {
    scale,
    height,
    left: resting.centerX - front.centerX * scale,
    top: resting.centerY - front.centerY * height,
  }
}

const DIR = '/images/desk'

export const DESK_ART = {
  // Posado está en escorzo y de frente plano: son dos dibujos y no uno escalado porque
  // enderezar el escorzo con una rotación dejaría la tarjeta torcida por dentro.
  card: {
    resting: deskFace(`${DIR}/carnet.png`, [1536, 1024], [90, 66, 1392, 904]),
    front: deskFace(`${DIR}/carnet-frente.png`, [1536, 1024], [6, 10, 1520, 992]),
  },
  sheet: {
    resting: deskFace(`${DIR}/hoja.png`, [1672, 941], [170, 8, 1372, 918]),
    front: deskFace(`${DIR}/hoja-frente.png`, [1448, 1086], [50, 36, 1348, 1012]),
  },
  box: {
    resting: deskFace(`${DIR}/caja.png`, [1254, 1254], [66, 110, 1148, 1066]),
    frames: [
      `${DIR}/caja-abierta-25.png`,
      `${DIR}/caja-abierta-40.png`,
      `${DIR}/caja-abierto-80.png`,
      `${DIR}/caja-abierto-100.png`,
    ],
  },
} as const satisfies Record<string, DeskArt>
