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
  // Dónde cae el centro de esa caja a lo alto, como fracción del lienzo de reposo. 0,5 si no
  // se indica: el papel de un dibujo no tiene por qué estar centrado en su lienzo.
  faceCenterY?: number
  // Cuánto ocupa este objeto en concreto al plantarse enfrente, en vez del tamaño que
  // comparten los demás (`DESK_LIFT.frontWidth`). Un álbum con viñetas y texto necesita más
  // sitio que un carné o una hoja de chuleta; agrandar la caja de contenido no basta, porque
  // no puede pasar del papel en blanco que ya mide la ilustración. Ver `useDeskLift.ts`.
  frontWidth?: number
  // Dónde cae su centro a lo alto al plantarse, en vez de `DESK_LIFT.frontY`. Una hoja grande
  // abierta llega casi al borde de arriba y se mete debajo de la barra de navegación.
  frontY?: number
  // Cómo plantarse en una pantalla baja —ver `DESK_LIFT.shortViewport`—, en las mismas
  // fracciones de la escena que `frontWidth` y `DESK_LIFT.frontY`. Sin esto el objeto mide lo
  // mismo que en un escritorio, y en un móvil de lado eso son 190 px de alto sobre 320: lo que
  // hay dentro no se lee. `y` baja porque el libro pintado queda por encima del centro de su
  // lienzo, y al crecer se pegaría al borde de arriba.
  //
  // `fitHeight` es cuánto de la ventana puede ocupar como mucho la caja de contenido, en
  // fracción de su alto: el objeto se encoge lo que haga falta para no salirse por arriba ni
  // por abajo, sea cual sea el móvil. Sin él manda `frontWidth`, que solo acierta con una
  // proporción de pantalla concreta.
  short?: { frontWidth: number; frontY: number; fitHeight?: number }
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
  const { resting, front, faceScale = 1, faceHeightScale = faceScale, faceCenterY = 0.5 } = art
  // Sin segunda cara no hay a qué encajarse: la caja de contenido crece sobre su propio
  // centro, igual que `resting.centerX/Y` haría si el «objeto de frente» fuera el mismo
  // dibujo a otra escala.
  if (!front) {
    return {
      scale: faceScale,
      height: faceHeightScale,
      left: (1 - faceScale) / 2,
      top: faceCenterY - faceHeightScale / 2,
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
  sheet: {
    resting: deskFace(`${DIR}/cheatSheet/hoja.webp`, [1448, 1086], [31, 37, 1387, 1007]),
    restTiltDeg: 20,
    // La chuleta tiene que enseñar los doce tomos sin scroll: más sitio que el que da su
    // silueta de reposo, que se queda tal cual estaba sobre la mesa.
    faceScale: 1.55,
    frontY: 0.525,
    // Abierta llena la ventana entera de un móvil apaisado y la lista se sale del papel. La
    // `y` es 0,5 porque la escena va centrada: el centro de la ventana.
    short: { frontWidth: 0.42, frontY: 0.5, fitHeight: 1 },
  },
  // Un libro y no una caja: escribir juegos de verdad era demasiado para esta fase, así que la
  // puerta pasa a ser el álbum de anime que se va ilustrando con las frases desbloqueadas. Sin
  // `front`: la última hoja de `frames` ya es la cara abierta —de frente y no en escorzo—, y
  // el contenido se posa encima con `faceScale`/`faceHeightScale`, no con un segundo dibujo.
  //
  // OJO: `manga-elevado-abierto-100.webp` mide 1536×1024 y no 1254×1254 como sus hermanos.
  // Se pinta a lo ancho del hueco cuadrado y centrado a lo alto —ocupa sus 2/3 del medio—, y
  // las medidas del contenido de abajo están pasadas a ese hueco. Si se cambia el PNG, se
  // vuelve a medir su papel liso.
  anime: {
    resting: deskFace(`${DIR}/anime/posado.webp`, [1254, 1254], [146, 70, 994, 1111]),
    // Cerrado y de frente, y luego las cuatro fases de apertura. El viaje entero —de la mesa
    // hasta aquí delante— lo hace `posado.webp` tal cual, en su escorzo de reposo: no hay
    // giro de por medio, así que el paso de escorzo a frente es el corte duro de este primer
    // fotograma, el mismo tipo de salto que ya daba la caja al abrirse.
    frames: [
      `${DIR}/anime/manga-elevado-cerrado.webp`,
      `${DIR}/anime/manga-elevado-abierto-25.webp`,
      `${DIR}/anime/manga-elevado-abierto-50.webp`,
      `${DIR}/anime/manga-elevado-abierto-75.webp`,
      `${DIR}/anime/manga-elevado-abierto-100.webp`,
    ],
    // AJUSTAR A OJO. La caja de las mangas, en fracciones del hueco cuadrado: ancho, alto y
    // centro vertical. El papel medido va de 0,085 a 0,915 a lo ancho y de 0,264 a 0,695 a
    // lo alto; si una manga se sale del papel, se baja el número de ese lado.
    faceScale: 0.8,
    faceHeightScale: 0.40,
    faceCenterY: 0.49,
    // El tamaño del libro ENTERO al plantarse enfrente —papel y mangas juntos, sin
    // descuadrarse—, en fracción del ancho de la escena. Los demás objetos usan 0,42.
    frontWidth: 0.64,
    short: { frontWidth: 0.72, frontY: 0.54 },
  },
} as const satisfies Record<string, DeskArt>
