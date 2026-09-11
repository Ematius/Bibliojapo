// Las caras de cada tomo, en el orden de la colección: la primera es la del tomo
// 1, la segunda la del 2, y así.
//
// ── De dónde salen ─────────────────────────────────────────────────────────
// De `books/moreBoks/`, tres renders por tomo: el lomo (el impar), la tapa plana
// (el par siguiente) y la tapa girada, con el bloque de hojas asomando por la
// izquierda (N.N o N.1). Se recortaron a su silueta y se pasaron a WebP en
// `books/volumes/`; los PNG originales siguen en su carpeta sin tocar.
//
// Hay trece juegos y el temario tiene doce bloques, así que el último
// (27 / 28 / 28.1) sobra de momento.
//
// ── Por qué la tapa se mide sobre la girada y no sobre la plana ────────────
// Las dos no tienen la misma proporción: la plana es 2:3 exacto y la tapa que se
// ve en el render girado es alrededor de un 12 % más estrecha. Al final del giro
// una releva a la otra, y cada una con su proporción daba un salto de ancho justo
// en el momento en que el tomo se queda quieto.
//
// Así que la proporción del tomo se toma de la girada —su ancho SIN el bloque de
// hojas— y la plana se estira hasta ella. En la balda y durante el giro la plana
// solo se ve de escorzo y no se nota; en el relevo, las dos coinciden al píxel.
// Por eso cada tomo apunta dónde acaban sus hojas: es lo que separa la tapa del
// resto del render.
//
// SI SE CAMBIA UN RENDER hay que volver a recortarlo y volver a medir sus números.

const DIR = '/images/hallways/books/volumes'

// Proporciones del tomo, respecto a su ALTO. De aquí sale la forma de la caja:
// el alto es la referencia, y el ancho de la tapa y el grosor del lomo se derivan
// de él.
export interface VolumeShape {
  // Ancho de la tapa ÷ alto.
  coverRatio: number
  // Grosor del lomo ÷ alto.
  spineRatio: number
  // La tapa pintada de tres cuartos, con el bloque de hojas, ÷ alto. Es más
  // ancha que `coverRatio`, y la diferencia es exactamente ese bloque.
  coverTurnedRatio: number
}

export interface VolumeArt {
  spine: string
  // La portada. Sirve también de contra: todavía no hay dibujo propio para ella.
  cover: string
  coverTurned: string
  shape: VolumeShape
}

// Un tomo a partir de lo medido sobre sus recortes, en píxeles:
//   spine        ancho y alto del lomo
//   turned       ancho y alto de la tapa girada
//   coverLeft    dónde empieza la tapa dentro de la girada, o sea dónde acaban las
//                hojas. Medido sobre la franja central, donde no hay herrajes.
function volumeArt(
  volume: number,
  spine: [number, number],
  turned: [number, number],
  coverLeft: number,
): VolumeArt {
  const tag = `${DIR}/tomo-${String(volume).padStart(2, '0')}`

  return {
    spine: `${tag}-lomo.webp`,
    cover: `${tag}-tapa.webp`,
    coverTurned: `${tag}-tapa-girada.webp`,
    shape: {
      coverRatio: (turned[0] - coverLeft) / turned[1],
      spineRatio: spine[0] / spine[1],
      coverTurnedRatio: turned[0] / turned[1],
    },
  }
}

export const VOLUME_ART: readonly VolumeArt[] = [
  volumeArt(1, [341, 2136], [921, 1436], 80),
  volumeArt(2, [371, 2141], [897, 1456], 83),
  volumeArt(3, [345, 2158], [882, 1459], 82),
  volumeArt(4, [392, 2172], [945, 1386], 78),
  volumeArt(5, [373, 2149], [885, 1458], 77),
  volumeArt(6, [401, 2159], [905, 1409], 75),
  volumeArt(7, [403, 2159], [923, 1419], 87),
  volumeArt(8, [393, 2172], [837, 1353], 74),
  volumeArt(9, [436, 2172], [812, 1329], 72),
  volumeArt(10, [385, 2172], [843, 1364], 76),
  volumeArt(11, [400, 2172], [827, 1349], 74),
  volumeArt(12, [415, 2151], [804, 1313], 69),
]
