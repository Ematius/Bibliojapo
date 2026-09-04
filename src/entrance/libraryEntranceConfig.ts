// Config centralizada de la animación de entrada a la biblioteca.
// Todo valor artístico ajustable vive aquí — nunca hardcodeado en componentes/hooks.

const ASSET_BASE = '/images/outsite'

export const ASSETS = {
  // La fachada son tres ilustraciones superpuestas, de atrás hacia delante:
  // el cielo al fondo, la biblioteca recortada sobre él y el cartel delante.
  // Las tres comparten el lienzo de 1672 × 941, así que se apilan sin ajustes.
  sky: `${ASSET_BASE}/cielo-exterior.webp`,
  library: `${ASSET_BASE}/biblioteca.webp`,
  sign: `${ASSET_BASE}/cartel.webp`,
  interior: `${ASSET_BASE}/Interior.webp`,
  doorLeft: `${ASSET_BASE}/puerta-izquierda.webp`,
  doorRight: `${ASSET_BASE}/puerta-derecha.webp`,
}

// Dimensiones de referencia: las comparten las tres capas de fachada y el interior.
const STAGE = {
  width: 1672,
  height: 941,
}

// Hueco de la entrada dentro del stage, como fracción [0, 1] del ancho/alto.
//
// ── AQUÍ SE AJUSTA EL TAMAÑO DE LAS PUERTAS ────────────────────────────────
// Las hojas no tienen medidas propias: ocupan este hueco más el `bleed` de
// abajo. Todo lo demás que asoma por la entrada —el interior, el resplandor y
// el derrame de luz— usa también estas cuatro cifras, así que al tocarlas se
// mueve el conjunto entero y no se descuadra nada.
//
//   left   borde izquierdo. Subirlo mueve las puertas a la derecha.
//   top    borde superior, a la altura de la clave del arco. Subirlo las baja.
//   width  ancho de las DOS hojas juntas. Cada una ocupa la mitad.
//   height alto de las hojas.
//
// Medido sobre biblioteca.webp (1672 × 941): el HUECO INTERIOR del arco va de
// 0.473 a 0.527 en horizontal y de 0.6235 a 0.768 en vertical. Los valores de
// abajo son ese hueco menos el `bleed`, de modo que las hojas con su margen lo
// cubren exactamente. Si cambias la ilustración, hay que medir otra vez.
//
// OJO AL MEDIR: hay que tomar el hueco por dentro de la moldura del arco, no el
// arco entero de piedra. Midiendo el exterior las hojas salen tan anchas que
// montan sobre las jambas, y tan altas que se apoyan encima del primer escalón
// en vez de quedar en el umbral.
//
// Sobre la proporción: la silueta de cada PNG mide 3.37 de alto por 1 de ancho,
// y el hueco da 2.94, así que las hojas se ven un poco más anchas de lo que
// son. Es a propósito — cubrir el ancho del hueco manda, porque unas hojas más
// estrechas dejarían asomar el pasillo iluminado por una rendija vertical con
// las puertas cerradas. Para quitar ese achatamiento habría que recortar los
// PNG de las puertas, no tocar estas cifras.
//
// Si quieres cambiar el tamaño manteniendo la forma actual, multiplica `width`
// y `height` por el mismo factor y recoloca con `left` y `top`.
// ───────────────────────────────────────────────────────────────────────────
const PORTAL = {
  left: 0.489,
  top: 0.63,
  width: 0.022,
  height: 0.136,
  // Cuánto se extienden las puertas más allá del hueco por cada lado, como
  // fracción del stage. Tapa la holgura/redondeo entre la puerta y el marco
  // (evita ver el interior por un filamento de separación). Subir un poco si
  // aún se ve luz colándose por el borde; bajar si las puertas invaden el marco.
  bleed: 0.018,
}

// Fases de la timeline única, como fracciones [0, 1] del progreso total de scroll.
const PHASES = {
  closed: [0, 0.1] as [number, number],
  opening: [0.1, 0.45] as [number, number],
  open: [0.45, 0.65] as [number, number],
  push: [0.65, 1] as [number, number],
}

// Acabado 3D de las hojas de puerta — ver LibraryEntrance.scss (.door3d__*).
const centerOverlap = 0.01

const DOORS_3D = {
  // Distancia del ojo a las puertas, en múltiplos del ancho de las dos hojas
  // juntas. Es lo que hace que la apertura se lea hacia dentro: cuanto más
  // bajo, más marcado el escorzo. Por debajo de 2 la deformación empieza a
  // parecer un ojo de pez; por encima de 5 la puerta se abre casi plana y
  // vuelve la ambigüedad de si entra o sale.
  perspectiveRatio: 3,
  maxOpenAngle: 84, // grados — se evita 90° para no dejar las puertas exactamente de canto
  shadowMaxOpacity: 0.16,
  // Cuánto invade cada hoja hacia el centro más allá de su 50% del hueco, como
  // fracción del ancho de las dos puertas juntas. Tapa la costura entre ambas
  // (si no, se cuela un filamento de interior justo en el punto de encuentro).
  // Solo afecta al borde interior de cada hoja — el de la bisagra no se mueve.
  centerOverlap,
  // Punto (en % del ancho propio de cada hoja) donde empieza a desvanecerse hacia
  // el centro. Se deriva matemáticamente de centerOverlap para que, sea cual sea
  // la hoja que quede por delante en la costura, la transición sea un degradado
  // suave en vez de un corte duro de una hoja tapando a la otra. No tocar a mano
  // — si ajustas centerOverlap, este valor se recalcula solo.
  seamFadeStart: (0.5 / (0.5 + centerOverlap)) * 100,
  // El dorso de cada hoja reutiliza el mismo PNG que la cara tallada, apagado y
  // desaturado para que se lea como la trasera lisa de una puerta de verdad.
  // Cuanto más bajos, más marcada la diferencia entre las dos caras.
  backBrightness: 0.6,
  backSaturation: 0.75,
}

// Distancia total de scroll-jacking en píxeles.
//
// La usan dos sitios que tienen que dar exactamente el mismo número: el
// ScrollTrigger para calcular su `end`, y la entrada al volver de un pasillo
// para saltar al final del recorrido. Con la fórmula escrita en cada uno,
// cambiar solo uno dejaba el salto corto o largo sin que nada fallara.
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
  },

  doors: {
    // Signo positivo en la hoja izquierda (bisagra a la izquierda) y negativo
    // en la derecha: en ambos casos el borde libre se aleja del espectador, que
    // es lo que abre hacia dentro. Invertir los dos signos las abriría hacia
    // fuera, hacia la escalera.
    leftRotationOpen: DOORS_3D.maxOpenAngle, // grados, hacia dentro
    rightRotationOpen: -DOORS_3D.maxOpenAngle, // grados, hacia dentro
    shadeMaxOpacity: DOORS_3D.shadowMaxOpacity, // sombra sutil durante la apertura, nunca negro puro
  },

  doors3D: DOORS_3D,

  facade: {
    // Deriva del cielo. Es lo único que se mueve de la fachada: la biblioteca
    // se queda quieta a propósito, porque las puertas van encajadas en su vano
    // y cualquier desplazamiento de una sin la otra se vería como el edificio
    // deslizándose por detrás de sus propias puertas.
    // ── AQUÍ SE AJUSTA LA VELOCIDAD DE LAS NUBES ─────────────────────────
    // Lo que se percibe como velocidad es el cociente entre las dos primeras
    // cifras: recorrido partido por tiempo. Para que vayan más rápidas puedes
    // subir `amplitudePercent`, bajar `durationSeconds`, o las dos cosas.
    //
    //   amplitudePercent  cuánto recorren. Subirlo también hace el movimiento
    //                     más amplio, no solo más rápido.
    //   durationSeconds   lo que tarda un viaje de ida. Bajarlo acelera sin
    //                     cambiar cuánto se desplazan.
    //
    // Referencia: 2.4 en 20 s es lo que hay ahora. La mitad de duración (10 s)
    // las deja claramente rápidas, tipo día ventoso; 40 s las devuelve al
    // movimiento casi imperceptible de antes.
    // ─────────────────────────────────────────────────────────────────────
    sky: {
      // Recorrido total, en porcentaje del ancho de la propia capa, repartido a
      // ambos lados de la posición de reposo.
      //
      // TIENE UN TECHO: no puede pasar de lo que dé `overscan`. Con overscan
      // 1.05 la capa sobresale un 2.5% por cada lado, así que la amplitud no
      // debe superar 5 (que serían ±2.5%). Pasado eso asoma el borde de la
      // imagen y se ve una franja vacía en el lateral. Si necesitas más
      // recorrido, sube antes el overscan.
      amplitudePercent: 2.4,
      // Lo que tarda un viaje de ida; la vuelta es otro tanto.
      durationSeconds: 20,
      // Cuánto se ensancha la capa respecto al stage, para tener margen por el
      // que derivar sin que asome el borde de la imagen.
      overscan: 1.05,
      ease: 'sine.inOut',
    },

    // Cartel de bienvenida, en primer plano.
    //
    // ── AQUÍ SE COLOCA EL CARTEL ───────────────────────────────────────────
    // Fracciones [0, 1] del stage, el mismo sistema que PORTAL: 0 es el borde
    // izquierdo/superior de la ilustración y 1 el derecho/inferior.
    //
    //   left   0 pega el cartel al borde izquierdo, 0.5 lo lleva al centro.
    //   top    borde SUPERIOR del cartel, no su base.
    //   width  ancho. El alto sale solo y vale lo mismo que el ancho, porque
    //          la ilustración comparte proporción con el stage.
    //
    // Como `top` es el borde de arriba y el alto es igual al ancho, la base
    // cae en `top + width`. Es la cuenta que importa para que no parezca
    // flotando: el suelo con flores está entre 0.78 y 0.92, así que con
    // width 0.22 el cartel se planta con top entre 0.58 y 0.70.
    //
    // Referencias de la ilustración, por si quieres moverlo a otro sitio:
    //   cielo despejado a la izquierda   0.00 – 0.30 en x,  0.00 – 0.35 en y
    //   copas de los árboles             0.00 – 0.25 en x,  0.35 – 0.75 en y
    //   jardín de flores y rocas         0.00 – 0.35 en x,  0.75 – 0.95 en y
    //   escalera central (no taparla)    0.35 – 0.65 en x,  0.80 – 1.00 en y
    //   entrada y puertas (no taparlas)  0.46 – 0.55 en x,  0.64 – 0.87 en y
    //
    // CUIDADO CON EL BORDE IZQUIERDO: el stage se recorta por los lados en
    // pantallas más estrechas que 16:9, donde se pierde alrededor de un 5% por
    // cada lado. Bajar `left` por debajo de 0.05 hace que el cartel empiece a
    // cortarse en portátiles 16:10 y en móvil.
    //
    // Al guardar, el dev server recarga solo — no hace falta reiniciar nada.
    // ───────────────────────────────────────────────────────────────────────
    sign: {
      left: 0.15,
      top: 0.68,
      width: 0.25,
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
