// Los valores ajustables de la animación de entrada. No hardcodear ninguno en los
// componentes ni en los hooks.

const ASSET_BASE = '/images/outside'

export const ASSETS = {
  // Las ilustraciones superpuestas, de atrás hacia delante. Todas comparten el
  // lienzo de 1672 × 941, así que se apilan sin ajustes.
  sky: `${ASSET_BASE}/outdoor-sky.webp`,
  library: `${ASSET_BASE}/library.webp`,
  interior: `${ASSET_BASE}/Interior.webp`,
  doorLeft: `${ASSET_BASE}/door-left.webp`,
  doorRight: `${ASSET_BASE}/door-right.webp`,
}

// Las comparten las tres capas de fachada y el interior.
const STAGE = {
  width: 1672,
  height: 941,
}

// El hueco de la entrada dentro del stage, en fracciones [0, 1]. Las hojas no tienen
// medidas propias: ocupan este hueco más el `bleed`, y lo demás que asoma por la
// entrada —interior, resplandor, derrame de luz— usa también estas cifras, así que al
// tocarlas se mueve el conjunto entero.
//
// Medido sobre library.webp: el hueco interior del arco va de 0.473 a 0.527 en
// horizontal y de 0.6235 a 0.768 en vertical, menos el `bleed`. Si cambia la
// ilustración, hay que medir otra vez.
//
// OJO AL MEDIR: el hueco por DENTRO de la moldura, no el arco entero de piedra. Por
// fuera las hojas salen tan anchas que montan sobre las jambas y se apoyan encima del
// primer escalón en vez de quedar en el umbral.
//
// Las hojas se ven algo más anchas de lo que son, y es a propósito: cubrir el ancho
// manda, porque más estrechas dejarían asomar el pasillo iluminado por una rendija.
// Para quitar ese achatamiento habría que recortar los PNG, no tocar estas cifras.
const PORTAL = {
  left: 0.489,
  top: 0.63,
  width: 0.022,
  height: 0.136,
  // Cuánto se extienden las puertas más allá del hueco por cada lado. Tapa el filamento
  // por el que se vería el interior. Subir si aún se cuela luz; bajar si invaden el marco.
  bleed: 0.018,
}

// Fases de la timeline única, como fracciones [0, 1] del progreso total de scroll.
const PHASES = {
  closed: [0, 0.1] as [number, number],
  opening: [0.1, 0.45] as [number, number],
  open: [0.45, 0.65] as [number, number],
  push: [0.65, 1] as [number, number],
}

const centerOverlap = 0.01

const DOORS_3D = {
  // Distancia del ojo a las puertas, en múltiplos del ancho de las dos hojas. Es lo que
  // hace que la apertura se lea hacia dentro. Por debajo de 2 parece un ojo de pez; por
  // encima de 5 se abre casi plana y vuelve la ambigüedad de si entra o sale.
  perspectiveRatio: 3,
  maxOpenAngle: 84, // grados — se evita 90° para no dejar las puertas exactamente de canto
  shadowMaxOpacity: 0.16,
  // Cuánto invade cada hoja hacia el centro más allá de su mitad del hueco. Tapa la
  // costura por la que se colaría un filamento de interior. Solo mueve el borde interior.
  centerOverlap,
  // Dónde empieza a desvanecerse hacia el centro. NO TOCAR A MANO: se deriva de
  // `centerOverlap` para que la costura sea un degradado y no un corte duro, sea cual
  // sea la hoja que quede por delante.
  seamFadeStart: (0.5 / (0.5 + centerOverlap)) * 100,
  // El dorso reutiliza el PNG de la cara tallada, apagado y desaturado. Cuanto más
  // bajos, más marcada la diferencia entre las dos caras.
  backBrightness: 0.6,
  backSaturation: 0.75,
}

// La usan dos sitios que tienen que dar exactamente el mismo número: el ScrollTrigger
// para su `end`, y la vuelta de un pasillo para saltar al final del recorrido. Con la
// fórmula escrita en cada uno, cambiar solo uno dejaba el salto corto o largo.
export function getEntranceScrollLength(): number {
  return window.innerHeight * LIBRARY_ANIMATION_CONFIG.scroll.viewportHeights
}

export const LIBRARY_ANIMATION_CONFIG = {
  stage: STAGE,
  portal: PORTAL,
  phases: PHASES,

  scroll: {
    // Distancia total de scroll-jacking, en alturas de viewport.
    viewportHeights: 2.5,

    // Con cuánto recorrido se da por entrado. NO es 1 a propósito: la fachada se desvanece
    // hasta `push.facadeMinOpacity`, que es 0, así que en el último tramo ya no queda nada
    // que mirar —el interior está limpio y parece que se ha entrado—. Exigir el final
    // exacto deja plantado a quien suelta la rueda ahí, y con la pantalla fija por el pin
    // nada le dice que le falta.
    enterAtProgress: 0.98,
  },

  doors: {
    // Positivo a la izquierda y negativo a la derecha: en ambos casos el borde libre se
    // aleja del espectador, que es lo que abre hacia dentro. Invertir los dos las abriría
    // hacia la escalera.
    leftRotationOpen: DOORS_3D.maxOpenAngle, // grados, hacia dentro
    rightRotationOpen: -DOORS_3D.maxOpenAngle, // grados, hacia dentro
    shadeMaxOpacity: DOORS_3D.shadowMaxOpacity, // sombra sutil durante la apertura, nunca negro puro
  },

  doors3D: DOORS_3D,

  facade: {
    // Es lo único que se mueve de la fachada: la biblioteca se queda quieta porque las
    // puertas van encajadas en su vano, y desplazar una sin la otra se vería como el
    // edificio deslizándose por detrás de sus propias puertas.
    //
    // Lo que se percibe como velocidad es `amplitudePercent / durationSeconds`.
    sky: {
      // Recorrido total, en porcentaje del ancho de la capa, repartido a ambos lados del
      // reposo. TIENE UN TECHO: no puede pasar de lo que dé `overscan` —con 1.05 la capa
      // sobresale un 2.5 % por lado, así que el máximo es 5—. Pasado eso asoma el borde
      // de la imagen. Si hace falta más recorrido, subir antes el overscan.
      amplitudePercent: 2.4,
      durationSeconds: 20,
      // Cuánto se ensancha la capa respecto al stage, para tener margen por el que derivar.
      overscan: 1.05,
      ease: 'sine.inOut',
    },
  },

  glow: {
    closed: 0.02,
    openingPeak: 0.15,
    open: 0.26,
    color: '#F4E1B7',
  },

  lightSpill: {
    max: 0.22,
  },

  push: {
    facadeMaxScale: 3.4,
    facadeMaxBlurPx: 2.5,
    facadeMinOpacity: 0,
    interiorFromScale: 0.98,
    interiorToScale: 1,
  },

  particles: {
    count: 32,
    foregroundRatio: 0.16,
    colors: ['#F4E1B7', '#E9B76E', '#FFE8BC'],
    sizeMin: 0.6,
    sizeMax: 2,
    rareSizeMax: 3,
    rareChance: 0.12,
    opacityMin: 0.08,
    opacityMax: 0.28,
    rareOpacityMax: 0.35,
    driftPx: 6, // desplazamiento orgánico máximo por eje
    driftSeconds: 9, // duración aproximada de un ciclo de oscilación
    seed: 20260821, // semilla determinista — evita que la distribución cambie entre renders
  },
}
