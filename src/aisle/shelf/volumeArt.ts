// Las caras de cada tomo, en el orden de la colección: la primera es la del tomo 1.
//
// Salen de `books/moreBoks/`, tres renders por tomo —lomo, tapa plana y tapa girada con
// el bloque de hojas—, recortados a su silueta en `books/volumes/`.
//
// La proporción del tomo se toma de la GIRADA, no de la plana: la plana es 2:3 exacto y
// la tapa del render girado es un 12 % más estrecha, y al relevarse al final del giro cada
// una con la suya daba un salto de ancho. La plana se estira hasta la girada. Por eso cada
// tomo apunta dónde acaban sus hojas: es lo que separa la tapa del resto del render.
//
// SI SE CAMBIA UN RENDER hay que volver a recortarlo y volver a medir sus números.

const DIR = '/images/hallways/books/volumes'

// Proporciones del tomo respecto a su ALTO: el alto es la referencia, y el ancho de la
// tapa y el grosor del lomo se derivan de él.
export interface VolumeShape {
  coverRatio: number
  spineRatio: number
  // Con el bloque de hojas. La diferencia con `coverRatio` es exactamente ese bloque.
  coverTurnedRatio: number
}

export interface VolumeArt {
  spine: string
  // La portada. Sirve también de contra: todavía no hay dibujo propio para ella.
  cover: string
  coverTurned: string
  shape: VolumeShape
}

// A partir de lo medido sobre los recortes, en píxeles. `coverLeft` es dónde empieza la
// tapa dentro de la girada, o sea dónde acaban las hojas: medido sobre la franja central,
// donde no hay herrajes.
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
