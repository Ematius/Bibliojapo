// La estantería pintada del pasillo, medida una sola vez: aquí se mide el MUEBLE
// —sus baldas y sus vanos— y la colocación de cada tomo se deriva de eso.
//
// Los números salen de medir `pasillo-hiragana.webp` (1672 × 941), no de ajustar a ojo:
// el apoyo de cada balda es donde acaban los libros ya pintados en ella, y las ménsulas
// salen de su perfil de luminancia. Aparecen en la MISMA x en las cuatro, que es lo que
// convierte esto en una rejilla y no en cuatro filas sueltas.
//
// Todo en fracciones [0, 1] de la ILUSTRACIÓN, no de la ventana: así las medidas siguen
// valiendo cuando el stage recorta la escena por los lados.

// Dónde queda un tomo en la balda. Las tres medidas las pone `placeVolumes`. La rejilla
// no sabe qué es un tomo, solo cuánto abulta su lomo.
export interface Placement {
  // Centro del lomo, no borde: así al cambiar de altura el tomo crece hacia los dos
  // lados y no se desplaza.
  x: number
  // La balda donde se apoya, o sea el borde INFERIOR: anclar por la base es lo que lo
  // mantiene posado en la madera al cambiarle el alto.
  baseY: number
  // El ancho no se indica: sale de la proporción del render.
  height: number
}

interface Shelf {
  baseY: number
  // Cara inferior del tablero de encima. Solo sirve para saber cuánto aire hay: es lo
  // que impide que un tomo se salga por el techo de su hueco.
  ceilingY: number
}

interface Bay {
  from: number
  to: number
}

interface Area {
  left: number
  top: number
  right: number
  bottom: number
}

export const SHELF_GRID = {
  // Las medidas verticales y las horizontales van en fracciones de lados distintos, así
  // que para saber cuánto ocupa a lo ancho un lomo del que se conoce el alto hay que
  // pasar por aquí. Es la misma proporción que el mixin `scene-stage` de
  // `styles/_stage.scss`: repintar el pasillo con otro encuadre obliga a cambiarla en
  // los dos sitios.
  sceneRatio: 1672 / 941,

  // Las cuatro baldas, de arriba abajo. El apoyo se mide sobre los LIBROS pintados, no
  // sobre el tablero: por debajo del horizonte se ve la cara de arriba de cada balda, y
  // quedarse con su filo deja los tomos flotando entre 17 y 32 px. El hueco de arriba es
  // el más alto porque el mueble tiene el primer estante más alto a propósito.
  shelves: [
    { baseY: 0.355, ceilingY: 0.213 },
    { baseY: 0.497, ceilingY: 0.372 },
    { baseY: 0.622, ceilingY: 0.51 },
    { baseY: 0.745, ceilingY: 0.633 },
  ] as const satisfies readonly Shelf[],

  // Los vanos donde se pueden dejar tomos, IGUALES en las cuatro baldas. De los cuatro
  // tramos que dejan las ménsulas solo entran los dos centrales, y no por simetría: son
  // los únicos limpios en las cuatro. Los laterales los ocupan cosas ya pintadas, y un
  // tomo encima se leería como un fallo de recorte.
  //
  // Los límites llevan aire respecto a la ménsula para que el tomo se apoye y no la pise.
  bays: [
    { from: 0.484, to: 0.582 },
    { from: 0.597, to: 0.694 },
  ] as const satisfies readonly Bay[],

  // Lo que tiene que caber SIEMPRE en pantalla: los dos vanos con sus ménsulas, en las
  // cuatro baldas. El resto de la ilustración es relleno y se recorta antes que esto.
  //
  // No es el mueble entero a propósito: con el copete y el zócalo dentro, en un móvil en
  // vertical los tomos se quedaban en 38 px y la escena no llegaba a cubrir la pantalla.
  //
  // A los lados va justo, sin aire: cuanto más ancha es la zona, antes deja la escena de
  // cubrir la pantalla, y lo que se pega al borde es una ménsula, que se lee como la
  // estantería siguiendo fuera de cuadro.
  frame: { left: 0.469, top: 0.18, right: 0.707, bottom: 0.786 } as const satisfies Area,

  // Lo que mide un tomo cuando el hueco le deja medir lo que quiere. Una constante y no
  // una fracción del hueco: un libro mide lo que mide, y con lo segundo el de la balda de
  // arriba saldría un tercio mayor solo porque ahí sobra aire.
  nominalHeight: 0.1,

  // Cuánto del hueco puede llegar a ocupar un tomo. Es un freno por si alguno no diera
  // para `nominalHeight`: se recorta hasta aquí en vez de meterse en la balda de encima.
  maxFill: 0.88,

  // Aire entre dos tomos vecinos, en fracción del ancho de un lomo. El número es
  // geométrico y no estético: en la balda el tomo va girado `restDeg`, así que su
  // contratapa asoma algo más de medio lomo por la derecha. Por debajo, los tomos se
  // pisan y la fila se lee como una sola mancha tallada; muy por encima dejan de parecer
  // apoyados entre sí.
  gap: 0.35,

  // Cuántos tomos van en cada vano antes de pasar al siguiente. Por ancho cabrían ocho,
  // pero doce lomos apretados en un vano y siete vacíos se leen como un error. Es el
  // número que hay que tocar para repartirlos de otra forma.
  volumesPerBay: 2,
}

export const SHELF_CAPACITY =
  SHELF_GRID.shelves.length * SHELF_GRID.bays.length * SHELF_GRID.volumesPerBay

// Se llena un vano, se pasa al siguiente, y al agotarse los dos de una balda se baja a
// la de abajo.
//
// `spineRatioOf` se pide por parámetro en vez de importarse para que este módulo no sepa
// nada de cómo está dibujado el tomo: aquí solo hay un mueble con baldas y huecos.
export function placeVolumes<Entry>(
  entries: readonly Entry[],
  spineRatioOf: (entry: Entry) => number,
): (Entry & Placement)[] {
  const { shelves, bays, sceneRatio, nominalHeight, maxFill, gap, volumesPerBay } = SHELF_GRID

  // Dónde acaba el último tomo del vano en curso. Se lleva a mano y no se calcula con el
  // puesto porque los lomos no miden igual: el tercero no está a dos lomos del primero.
  let bayInUse = -1
  let cursor = 0

  return entries.map((entry, index) => {
    // Pasada la capacidad, los que sobran se salen por la derecha. Se ve, que es lo que
    // hace falta: uno que desapareciera en silencio sería más difícil de echar en falta.
    const slot = Math.min(index, SHELF_CAPACITY - 1)
    const bayIndex = Math.floor(slot / volumesPerBay)
    const shelf = shelves[Math.floor(bayIndex / bays.length)]
    const bay = bays[bayIndex % bays.length]

    if (bayIndex !== bayInUse) {
      bayInUse = bayIndex
      cursor = bay.from
    }

    const height = Math.min(nominalHeight, (shelf.baseY - shelf.ceilingY) * maxFill)
    // El alto va en fracción del alto de la escena y la x en fracción de su ancho, así que
    // el grosor del lomo hay que pasarlo de un lado al otro.
    const spine = (height * spineRatioOf(entry)) / sceneRatio
    // Medio lomo porque la x es su centro.
    const x = cursor + spine / 2
    cursor += spine * (1 + gap)

    return { ...entry, x, baseY: shelf.baseY, height }
  })
}
