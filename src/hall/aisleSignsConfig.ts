// Config de los carteles que cuelgan sobre los arcos del interior.
// La ilustración del interior no lleva carteles dibujados: cada cartel es un PNG
// completo, con sus cadenas y su adorno, que se cuelga delante del arco.
// Todo valor artístico ajustable vive aquí — nunca hardcodeado en el componente.
//
// ── Cómo colocar un cartel a mano ──────────────────────────────────────────
//
// Sistema de coordenadas: fracciones [0, 1] del stage (Interior.png, 1672 × 941),
// las mismas referencias que PORTAL. El origen es la esquina superior izquierda
// de la imagen, no del navegador.
//   0.01 horizontal ≈ 17 px de la imagen
//   0.01 vertical   ≈  9 px de la imagen
//
// `width` es el ancho del PNG entero. El alto NO se indica: sale solo del ancho,
// porque el PNG es 4:3 (1448 × 1086).
//
// OJO: `top` es el borde superior del PNG, o sea donde arranca la ARGOLLA de la
// cadena — no la tabla. La tabla cae en la mitad inferior del PNG. Si quieres
// apuntar directamente a dónde acaba la tabla:
//   borde superior de la tabla ≈ top + width * 0.59
//   borde inferior de la tabla ≈ top + width * 1.20
//   lados de la tabla          ≈ left + width * 0.04  ...  left + width * 0.96
//
// Centros aproximados de los cuatro arcos, medidos sobre la ilustración:
//   arco 1 (primero izq.)  0.02 – 0.17   centro 0.095
//   arco 2 (segundo izq.)  0.24 – 0.38   centro 0.31
//   arco 3 (segundo der.)  0.62 – 0.76   centro 0.69
//   arco 4 (primero der.)  0.82 – 0.97   centro 0.895
// Para centrar un cartel en un arco: left = centro - width / 2
//
// CUIDADO CON LOS BORDES: el stage se recorta por los lados en pantallas más
// estrechas que 16:9. En una 16:10 (1440 × 900) se pierde aproximadamente un 5 %
// por cada lado, así que todo lo que quede fuera de 0.05 – 0.95 se corta ahí.
//
// Al guardar, el dev server recarga solo — no hace falta reiniciar nada.
// ───────────────────────────────────────────────────────────────────────────

const AISLE_SIGN_BASE = '/images/placeCard'

export interface AisleSign {
  // Pasillo al que lleva. La ruta, la ilustración de destino y el nombre de la
  // sección salen del registro de shared/aisles.ts: aquí solo se dice a cuál se
  // entra y dónde cuelga el cartel, que es lo que de verdad cambia de uno a otro.
  aisleId: string
  asset: string
  left: number
  top: number
  width: number
}

// Entrada de los carteles: caen desde arriba y se balancean hasta pararse, como
// un cartel colgado al que acaban de soltar.
//
// El pivote ya lo pone el SCSS en el centro del borde superior —la argolla de la
// cadena—, así que la oscilación gira desde donde giraría de verdad.
export const AISLE_SIGNS_INTRO = {
  // Desde qué altura caen, en porcentaje de su propio alto. Negativo es por
  // encima de su sitio.
  fromYPercent: -130,
  fallSeconds: 0.5,
  // `power2.in` acelera al caer, que es lo que hace la gravedad. Con una curva
  // que frena al final parecería que alguien lo baja con la mano.
  fallEase: 'power2.in',

  // Balanceo posterior. El ángulo de partida es el impulso que trae la caída, y
  // `elastic.out` lo va amortiguando hasta dejarlo quieto.
  swayFromDeg: 7,
  swaySeconds: 1.7,
  // El segundo número es la amortiguación: más bajo, antes se para.
  swayEase: 'elastic.out(1, 0.3)',

  // Retardo entre un cartel y el siguiente, para que no caigan todos a la vez.
  staggerSeconds: 0.12,
}

export const AISLE_SIGNS: AisleSign[] = [
  {
    aisleId: 'hiragana',
    asset: `${AISLE_SIGN_BASE}/catel-hiragana.png`,
    left: 0.07,
    top: 0.19,
    width: 0.09,
  },
]
