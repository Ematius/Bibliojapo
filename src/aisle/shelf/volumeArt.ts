// Las caras de cada tomo, en el orden de la colección: la primera es la del tomo 1.
//
// Tres renders por tomo —lomo, tapa plana y tapa girada con el bloque de hojas—,
// recortados a su silueta en `books/volumes/`.
//
// La proporción del tomo se toma de la GIRADA, no de la plana: la plana es 2:3 exacto y
// la tapa del render girado es un 12 % más estrecha, y al relevarse al final del giro cada
// una con la suya daba un salto de ancho. La plana se estira hasta la girada. De ahí que haga
// falta saber dónde acaban las hojas: es lo que separa la tapa del resto del render.
//
// Los dieciocho comparten UN juego de medidas, no uno medido tomo a tomo: así ninguno se ve
// más estrecho ni más bajo que su vecino en la balda.

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

// Un solo juego de medidas para los dieciocho, las mayores de las medidas en píxeles sobre
// los recortes: grosor y alto del lomo, ancho y alto de la tapa girada, y dónde acaban sus
// hojas. Bajar cualquiera de las tres estrecha o achata TODOS los tomos a la vez.
const SPINE_SIZE: [number, number] = [497, 2172]
const TURNED_SIZE: [number, number] = [957, 1536]
const COVER_LEFT = 136

export const VOLUME_ART: readonly VolumeArt[] = [
  volumeArt(1, SPINE_SIZE, TURNED_SIZE, COVER_LEFT),
  volumeArt(2, SPINE_SIZE, TURNED_SIZE, COVER_LEFT),
  volumeArt(3, SPINE_SIZE, TURNED_SIZE, COVER_LEFT),
  volumeArt(4, SPINE_SIZE, TURNED_SIZE, COVER_LEFT),
  volumeArt(5, SPINE_SIZE, TURNED_SIZE, COVER_LEFT),
  volumeArt(6, SPINE_SIZE, TURNED_SIZE, COVER_LEFT),
  volumeArt(7, SPINE_SIZE, TURNED_SIZE, COVER_LEFT),
  volumeArt(8, SPINE_SIZE, TURNED_SIZE, COVER_LEFT),
  volumeArt(9, SPINE_SIZE, TURNED_SIZE, COVER_LEFT),
  volumeArt(10, SPINE_SIZE, TURNED_SIZE, COVER_LEFT),
  volumeArt(11, SPINE_SIZE, TURNED_SIZE, COVER_LEFT),
  volumeArt(12, SPINE_SIZE, TURNED_SIZE, COVER_LEFT),
  volumeArt(13, SPINE_SIZE, TURNED_SIZE, COVER_LEFT),
  volumeArt(14, SPINE_SIZE, TURNED_SIZE, COVER_LEFT),
  volumeArt(15, SPINE_SIZE, TURNED_SIZE, COVER_LEFT),
  volumeArt(16, SPINE_SIZE, TURNED_SIZE, COVER_LEFT),
  volumeArt(17, SPINE_SIZE, TURNED_SIZE, COVER_LEFT),
  volumeArt(18, SPINE_SIZE, TURNED_SIZE, COVER_LEFT),
]
