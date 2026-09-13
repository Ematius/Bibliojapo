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
  // Cuánto se inclina en reposo, en grados sobre el eje X: la perspectiva de estar apoyado en
  // la mesa. Solo tiene sentido en un objeto de una sola cara —sin `front`—, porque aquí el
  // giro hace de relevo: no hay un segundo dibujo al que cruzar, es la MISMA imagen
  // poniéndose de frente según se levanta. Ver `useDeskLift.ts`.
  restTiltDeg?: number
  // Cuánto más grande que su silueta de reposo es la caja de contenido pulsable, para un
  // objeto de una sola cara. `.desk-object__face` ya está preparada para desbordar su botón
  // —ver el comentario en `DeskObject.scss`—, así que esto solo le da más sitio sin tocar el
  // tamaño con el que el objeto se ve posado en la mesa. 1 si no se indica.
  faceScale?: number
  // Alto de esa misma caja, en el mismo múltiplo que `faceScale` pero aparte: sin esto crece
  // con la proporción apaisada de la silueta de reposo, y un listado de tarjetas en filas
  // necesita mucho más alto que ancho. Si no se indica, crece igual que el ancho.
  faceHeightScale?: number
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
  const { resting, front, faceScale = 1, faceHeightScale = faceScale } = art
  // Sin segunda cara no hay a qué encajarse: la caja de contenido crece sobre su propio
  // centro, igual que `resting.centerX/Y` haría si el «objeto de frente» fuera el mismo
  // dibujo a otra escala.
  if (!front) {
    return {
      scale: faceScale,
      height: faceHeightScale,
      left: (1 - faceScale) / 2,
      top: (1 - faceHeightScale) / 2,
    }
  }

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
    resting: deskFace(`${DIR}/card/carnet.webp`, [1536, 1024], [90, 66, 1392, 904]),
    front: deskFace(`${DIR}/card/carnet-frente.webp`, [1536, 1024], [6, 10, 1520, 992]),
  },
  // Una sola cara, a diferencia del carné: no hay un segundo dibujo «de frente» todavía, así
  // que la perspectiva de estar apoyada la pone el giro, no un cambio de imagen. Ver
  // `restTiltDeg` en `DeskArt` y el efecto en `useDeskLift.ts`.
  //
  // PRUEBA: es la primera pasada con la hoja nueva —ver conversación del 13-09-2026—, sin
  // convertir a WebP todavía a propósito mientras se está probando.
  sheet: {
    resting: deskFace(`${DIR}/cheatSheet/hoja.png`, [1448, 1086], [31, 37, 1387, 1007]),
    restTiltDeg: 20,
    // La chuleta tiene que enseñar los doce tomos sin scroll: más sitio que el que da su
    // silueta de reposo, que se queda tal cual estaba sobre la mesa.
    faceScale: 1.55,
  },
  box: {
    resting: deskFace(`${DIR}/chest/caja.webp`, [1254, 1254], [66, 110, 1148, 1066]),
    // El género de «abierta/abierto» sigue el del archivo tal como está en disco, no una
    // progresión: 25 y 80 son «abierta», 40 y 100 son «abierto». No es un error de escritura,
    // así que no se homogeneiza.
    frames: [
      `${DIR}/chest/caja-abierta-25.webp`,
      `${DIR}/chest/caja-abierto-40.webp`,
      `${DIR}/chest/caja-abierta-80.webp`,
      `${DIR}/chest/caja-abierto-100.webp`,
    ],
  },
} as const satisfies Record<string, DeskArt>
