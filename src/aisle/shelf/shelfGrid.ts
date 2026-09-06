// La estantería pintada del pasillo, medida una sola vez.
//
// Antes cada tomo traía su `x`, su `baseY` y su `height` puestos a ojo contra la
// ilustración. Con un tomo se aguantaba; con doce son treinta y seis números a
// mano, y cualquier retoque del encuadre obliga a revisarlos todos. Aquí se mide
// el MUEBLE —dónde están sus baldas y sus vanos— y la colocación de cada tomo se
// deriva de eso. Añadir un tomo pasa a ser añadir su bloque a la lista.
//
// ── DE DÓNDE SALEN ESTOS NÚMEROS ───────────────────────────────────────────
// De medir la propia ilustración (`pasillo-hiragana.webp`, 1672 × 941), no de
// ajustar a ojo hasta que encajara. Las baldas se localizaron por la caída de luz
// de su canto, y las ménsulas por su perfil de luminancia promediado en los
// cuatro huecos: aparecen en la MISMA x en los cuatro, y eso es lo que convierte
// esto en una rejilla y no en cuatro filas sueltas.
//
// Todo va en fracciones [0, 1] de la ilustración, no de la ventana. El origen es
// su esquina superior izquierda, así que las medidas siguen valiendo cuando el
// stage recorta la escena por los lados. Ver `styles/_stage.scss`.
// ───────────────────────────────────────────────────────────────────────────

// Un tomo antes de colocarse: qué es y qué trae dentro, sin dónde va.
export interface VolumeEntry {
  id: string
  // Texto accesible, en español.
  label: string
  // Qué bloque del temario contiene, por su id en `content/hiragana/blocks.ts`.
  // Un tomo ES un bloque: aquí se dice cuál y de ahí sale todo lo que lleva.
  blockId: string
}

// El mismo tomo ya colocado. Las tres medidas las pone `placeVolumes`, y son las
// que consumen el componente y su animación — de ahí que sigan llamándose igual
// que cuando se escribían a mano.
export interface ShelfVolume extends VolumeEntry {
  // Centro del lomo. Es el centro y no el borde para que al cambiar de altura el
  // tomo crezca hacia los lados por igual y no se desplace.
  x: number
  // La balda sobre la que se apoya, o sea el borde INFERIOR del tomo. Anclar por
  // la base es lo que lo mantiene posado en la madera al cambiarle el alto.
  baseY: number
  // Alto del tomo. El ancho no se indica: sale de la proporción del render.
  height: number
}

// Una balda: dónde se apoyan los libros y qué techo tienen encima.
interface Shelf {
  // Superficie de apoyo, el borde superior del tablero.
  baseY: number
  // Cara inferior del tablero de encima, o del travesaño en la balda de arriba.
  // Solo sirve para saber cuánto aire hay: es lo que impide que un tomo se salga
  // por el techo de su hueco.
  ceilingY: number
}

// Un tramo de balda donde caben libros, entre dos ménsulas.
interface Bay {
  from: number
  to: number
}

export const SHELF_GRID = {
  // Proporción de la ilustración. Hace falta porque las medidas verticales y las
  // horizontales están en fracciones de lados distintos: para saber cuánto ocupa
  // a lo ancho un lomo del que conocemos el alto hay que pasar por aquí.
  //
  // Es la misma que el mixin `scene-stage` de `styles/_stage.scss`. Si algún día
  // se repinta el pasillo con otro encuadre hay que cambiarla en los dos sitios
  // — y volver a medir todo lo de abajo, que es lo caro.
  sceneRatio: 1672 / 941,

  // Las cuatro baldas, de arriba abajo.
  //
  // Los huecos NO miden lo mismo: el de arriba tiene 0,142 de aire y el tercero
  // solo 0,090. En parte es la perspectiva —el tercero cae casi sobre la línea
  // del horizonte, que está a media altura, y se ve aplastado— y en parte es que
  // el mueble tiene el primer estante más alto a propósito.
  shelves: [
    { baseY: 0.355, ceilingY: 0.213 },
    { baseY: 0.485, ceilingY: 0.372 },
    { baseY: 0.6, ceilingY: 0.51 },
    { baseY: 0.725, ceilingY: 0.633 },
  ] as const satisfies readonly Shelf[],

  // Los vanos donde se pueden dejar tomos, IGUALES en las cuatro baldas.
  //
  // Las ménsulas del mueble están en x = 0,4755 / 0,5891 / 0,7004 y dividen cada
  // balda en cuatro tramos. Aquí solo entran los dos centrales, y no es por
  // simetría: son los únicos limpios en las cuatro. Los laterales los ocupan
  // cosas ya pintadas —libros, un cofre, dos macetas, un montón de tomos
  // apilados— que además cambian de balda a balda, y un tomo puesto encima no se
  // leería como un libro en su sitio sino como un fallo de recorte.
  //
  // Los límites llevan un poco de aire respecto al borde de la ménsula para que
  // el tomo se apoye en ella y no la pise.
  bays: [
    { from: 0.484, to: 0.582 },
    { from: 0.597, to: 0.694 },
  ] as const satisfies readonly Bay[],

  // ── AQUÍ SE AJUSTA EL TAMAÑO Y EL REPARTO DE LOS TOMOS ───────────────────

  // Lo que mide un tomo cuando el hueco le deja medir lo que quiere.
  //
  // Un libro mide lo que mide: no se hace más grande porque su estante sea más
  // alto. Por eso esto es una constante y no una fracción del hueco — con lo
  // segundo el tomo de la balda de arriba saldría un tercio mayor que el de la
  // tercera solo porque ahí sobra aire, y se leería como otro libro distinto.
  nominalHeight: 0.1,

  // Cuánto del hueco puede llegar a ocupar un tomo, como mucho.
  //
  // Es el freno para las baldas bajas, donde `nominalHeight` no cabe: allí el
  // tomo se recorta hasta esto y se ve algo menor, que es exactamente lo que les
  // pasa a los libros pintados en esas mismas baldas.
  maxFill: 0.88,

  // Aire entre dos tomos vecinos, en fracción del ancho de un lomo.
  //
  // El número no es estético sino geométrico: en la balda el tomo está girado
  // `restDeg`, así que su contratapa asoma por la derecha algo más de medio lomo.
  // Por debajo de eso los tomos se pisan —el lomo del siguiente tapa la contra
  // del anterior— y la fila se lee como una sola mancha tallada.
  //
  // Con 0,35 entre lomo y lomo asoma un hilo de contra: se distinguen uno a uno
  // y siguen pareciendo apoyados entre sí. Comprobado sobre el render, con tres
  // tomos seguidos: a 0,12 se funden y a 0,56 se separan de más y ya no parecen
  // apoyados.
  gap: 0.35,

  // Cuántos tomos van en cada vano antes de pasar al siguiente.
  //
  // Por ancho cabrían unos ocho, pero doce lomos apretados en un vano y los otros
  // siete vacíos no se lee como una colección: se lee como un error. Con tres,
  // los doce tomos del hiragana llenan las dos baldas de arriba en grupos
  // apoyados contra su ménsula, y la estantería crece de arriba abajo según se
  // van desbloqueando.
  //
  // Es el número que hay que tocar para repartirlos de otra forma.
  volumesPerBay: 3,
}

// Cuántos tomos admite la estantería con este reparto.
export const SHELF_CAPACITY =
  SHELF_GRID.shelves.length * SHELF_GRID.bays.length * SHELF_GRID.volumesPerBay

// Coloca los tomos sobre la estantería por orden: se llena un vano, se pasa al
// siguiente, y al agotarse los dos de una balda se baja a la de abajo.
//
// `spineRatio` es el grosor del lomo respecto a su alto, y sale del render en
// `VOLUME_SHAPE`. Se recibe por parámetro en vez de importarse para que este
// módulo no sepa nada de cómo está dibujado el tomo: aquí solo hay un mueble con
// baldas y huecos, y vale igual el día que el libro se dibuje de otra manera.
export function placeVolumes(
  entries: readonly VolumeEntry[],
  spineRatio: number,
): ShelfVolume[] {
  const { shelves, bays, sceneRatio, nominalHeight, maxFill, gap, volumesPerBay } = SHELF_GRID

  return entries.map((entry, index) => {
    // Pasada la capacidad, los que sobran siguen en el último vano y se salen por
    // la derecha. Se ve, que es justo lo que hace falta: un tomo que desapareciera
    // en silencio sería mucho más difícil de echar en falta.
    const slot = Math.min(index, SHELF_CAPACITY - 1)
    const bayIndex = Math.floor(slot / volumesPerBay)
    const shelf = shelves[Math.floor(bayIndex / bays.length)]
    const bay = bays[bayIndex % bays.length]

    const height = Math.min(nominalHeight, (shelf.baseY - shelf.ceilingY) * maxFill)
    // El alto va en fracción del alto de la escena y la x en fracción de su
    // ancho, así que el grosor del lomo hay que pasarlo de un lado al otro.
    const spine = (height * spineRatio) / sceneRatio
    // Qué puesto ocupa dentro de su vano. El primero se apoya en la ménsula de la
    // izquierda y los demás en el anterior; se suma medio lomo porque la x es su
    // centro y no su borde.
    const place = index - bayIndex * volumesPerBay

    return {
      ...entry,
      x: bay.from + spine / 2 + place * spine * (1 + gap),
      baseY: shelf.baseY,
      height,
    }
  })
}
