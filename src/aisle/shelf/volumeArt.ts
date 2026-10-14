// Las caras de cada tomo, en el orden de la colección: la primera es la del tomo 1.
//
// Tres renders por tomo —lomo, tapa plana y tapa girada con el bloque de hojas—,
// recortados a su silueta en `books/volumes/`.
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
  // Las mismas dos caras a 240 px de alto, para el tomo colocado en la balda, donde se
  // pinta a 14 px de ancho. Las genera `tools/make-shelf-thumbs.mjs`: si se cambia un
  // render hay que volver a pasarlo o la balda seguirá enseñando el anterior.
  spineThumb: string
  coverThumb: string
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
  const tag = `${DIR}/volume-${String(volume).padStart(2, '0')}`

  return {
    spine: `${tag}-spine.webp`,
    cover: `${tag}-cover.webp`,
    coverTurned: `${tag}-cover-turned.webp`,
    spineThumb: `${tag}-spine-thumb.webp`,
    coverThumb: `${tag}-cover-thumb.webp`,
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
  volumeArt(13, [408, 2142], [925, 1451], 112),
  volumeArt(14, [401, 2172], [916, 1469], 124),
  volumeArt(15, [412, 2172], [957, 1502], 136),
  volumeArt(16, [382, 2116], [956, 1536], 129),
  volumeArt(17, [403, 2155], [925, 1467], 123),
  volumeArt(18, [407, 2172], [929, 1480], 126),
]
