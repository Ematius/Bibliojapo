// Config centralizada de la animación de entrada a la biblioteca.
// Todo valor artístico ajustable vive aquí — nunca hardcodeado en componentes/hooks.

export const ASSET_BASE = '/images/outsite'

export const ASSETS = {
  exterior: `${ASSET_BASE}/Exterior.png`,
  interior: `${ASSET_BASE}/Interior.png`,
  doorLeft: `${ASSET_BASE}/puerta-izquierda.png`,
  doorRight: `${ASSET_BASE}/puerta-derecha.png`,
}

// Dimensiones de referencia sobre las que están diseñados exterior.png / interior.png.
export const STAGE = {
  width: 1672,
  height: 941,
}

// Hueco de la entrada dentro del stage, como fracción [0, 1] del ancho/alto.
// Referencia inicial — afinar aquí si el recorte no encaja con los assets finales.
export const PORTAL = {
  left: 0.403,
  top: 0.310,
  width: 0.196,
  height: 0.45,
  // Cuánto se extienden las puertas más allá del hueco por cada lado, como
  // fracción del stage. Tapa la holgura/redondeo entre la puerta y el marco
  // (evita ver el interior por un filamento de separación). Subir un poco si
  // aún se ve luz colándose por el borde; bajar si las puertas invaden el marco.
  bleed: 0.007,
}

// Fases de la timeline única, como fracciones [0, 1] del progreso total de scroll.
export const PHASES = {
  closed: [0, 0.1] as [number, number],
  opening: [0.1, 0.45] as [number, number],
  open: [0.45, 0.65] as [number, number],
  push: [0.65, 1] as [number, number],
}

// Grosor y acabado 3D de las hojas de puerta — ver LibraryEntrance.scss (.door3d__*).
const centerOverlap = 0.01

export const DOORS_3D = {
  depthRatio: 0.05, // grosor como fracción del ancho visible de la hoja
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
    perspective: 1500, // px — rango recomendado 1200-1800
    leftRotationOpen: DOORS_3D.maxOpenAngle, // grados, hacia dentro
    rightRotationOpen: -DOORS_3D.maxOpenAngle, // grados, hacia dentro
    shadeMaxOpacity: DOORS_3D.shadowMaxOpacity, // sombra sutil durante la apertura, nunca negro puro
  },

  doors3D: DOORS_3D,

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
