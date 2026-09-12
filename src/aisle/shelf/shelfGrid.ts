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
// ajustar a ojo hasta que encajara. El apoyo de cada balda es donde acaban los
// libros que YA vienen pintados en ella —el paso del lomo oscuro a la madera—, y
// las ménsulas salen de su perfil de luminancia promediado en los cuatro huecos:
// aparecen en la MISMA x en los cuatro, y eso es lo que convierte esto en una
// rejilla y no en cuatro filas sueltas.
//
// Todo va en fracciones [0, 1] de la ilustración, no de la ventana. El origen es
// su esquina superior izquierda, así que las medidas siguen valiendo cuando el
// stage recorta la escena por los lados. Ver `styles/_stage.scss`.
// ───────────────────────────────────────────────────────────────────────────

// Dónde queda un tomo en la balda. Las tres medidas las pone `placeVolumes`, y son
// las que consumen el componente y su animación — de ahí que sigan llamándose
// igual que cuando se escribían a mano.
//
// La rejilla no sabe qué es un tomo, solo cuánto abulta su lomo: lo demás lo
// pone quien la usa. Ver `shelfConfig.ts`.
export interface Placement {
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

// Un rectángulo de la ilustración, por sus cuatro bordes.
interface Area {
  left: number
  top: number
  right: number
  bottom: number
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
  // El apoyo se mide sobre los libros pintados, no sobre el tablero: donde
  // apoyan ellos es donde apoya un libro en este dibujo. Por debajo de la línea
  // del horizonte —que cae a media altura— se ve la cara de arriba de cada balda,
  // y a ojo es fácil quedarse con su filo en vez de con el sitio donde de verdad
  // se posa algo. Los valores heredados de la colocación a mano hacían eso: las
  // tres baldas de abajo quedaban entre 12 y 22 milésimas altas —de 17 a 32 px en
  // una pantalla de 1440— y los tomos se veían flotando. En la de arriba, por
  // encima del horizonte, ya coincidía.
  //
  // El de arriba es el hueco más alto, 0,142 de aire, porque el mueble tiene el
  // primer estante más alto a propósito; los otros tres rondan 0,11–0,13.
  shelves: [
    { baseY: 0.355, ceilingY: 0.213 },
    { baseY: 0.497, ceilingY: 0.372 },
    { baseY: 0.622, ceilingY: 0.51 },
    { baseY: 0.745, ceilingY: 0.633 },
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

  // Lo que tiene que caber SIEMPRE en pantalla: los dos vanos, con sus ménsulas de
  // los extremos, en las cuatro baldas. El resto de la ilustración es relleno, y en
  // una pantalla estrecha se recorta antes que esto.
  //
  // No es el mueble entero a propósito. Con el copete y el zócalo dentro, en un
  // móvil en vertical los tomos se quedaban en 38 px y la escena no llegaba a
  // cubrir la pantalla; con esto caben enteros y la ilustración sigue cubriéndolo
  // todo.
  //
  // Medido igual que lo demás, por luminancia: la ménsula izquierda empieza en
  // x 785 y la derecha acaba en x 1181; por arriba, la moldura del techo del
  // mueble empieza en y 182, y por abajo el canto de la última balda acaba en
  // y 729. Los números llevan un poco de aire respecto a eso, para que en la
  // pantalla más justa la ménsula no quede pegada al borde.
  frame: { left: 0.46, top: 0.18, right: 0.716, bottom: 0.786 } as const satisfies Area,

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
  // Es un freno por si algún hueco no diera para `nominalHeight`: el tomo se
  // recorta hasta esto en vez de meterse en la balda de encima. Con el apoyo bien
  // medido apenas actúa —en las dos baldas de abajo quita un 1,5 %—, y los tomos
  // miden lo mismo en las cuatro, igual que los libros pintados, que rondan 0,1
  // en todas.
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
  // siete vacíos no se lee como una colección: se lee como un error. Con dos, los
  // doce tomos del hiragana llenan las tres baldas de arriba en parejas apoyadas
  // contra su ménsula, y la de abajo queda libre con sitio para cuatro más. Con
  // tres se quedaban apretados en las dos de arriba y medio mueble vacío.
  //
  // Es el número que hay que tocar para repartirlos de otra forma.
  volumesPerBay: 2,
}

// Cuántos tomos admite la estantería con este reparto.
export const SHELF_CAPACITY =
  SHELF_GRID.shelves.length * SHELF_GRID.bays.length * SHELF_GRID.volumesPerBay

// Coloca los tomos sobre la estantería por orden: se llena un vano, se pasa al
// siguiente, y al agotarse los dos de una balda se baja a la de abajo.
//
// `spineRatioOf` dice el grosor del lomo de cada tomo respecto a su alto, y sale
// de su render. Cada tomo trae el suyo —no todos los libros son igual de
// gruesos—, y se pide por parámetro en vez de importarse para que este módulo no
// sepa nada de cómo está dibujado el tomo: aquí solo hay un mueble con baldas y
// huecos, y vale igual el día que el libro se dibuje de otra manera.
export function placeVolumes<Entry>(
  entries: readonly Entry[],
  spineRatioOf: (entry: Entry) => number,
): (Entry & Placement)[] {
  const { shelves, bays, sceneRatio, nominalHeight, maxFill, gap, volumesPerBay } = SHELF_GRID

  // Dónde acaba el último tomo puesto en el vano en curso. Se lleva a mano y no
  // se calcula con el puesto porque los lomos no miden igual: el tercero no está
  // a dos lomos del primero, sino a lo que midan de verdad los dos de antes.
  let bayInUse = -1
  let cursor = 0

  return entries.map((entry, index) => {
    // Pasada la capacidad, los que sobran siguen en el último vano y se salen por
    // la derecha. Se ve, que es justo lo que hace falta: un tomo que desapareciera
    // en silencio sería mucho más difícil de echar en falta.
    const slot = Math.min(index, SHELF_CAPACITY - 1)
    const bayIndex = Math.floor(slot / volumesPerBay)
    const shelf = shelves[Math.floor(bayIndex / bays.length)]
    const bay = bays[bayIndex % bays.length]

    // Vano nuevo: el primero se apoya en la ménsula de la izquierda.
    if (bayIndex !== bayInUse) {
      bayInUse = bayIndex
      cursor = bay.from
    }

    const height = Math.min(nominalHeight, (shelf.baseY - shelf.ceilingY) * maxFill)
    // El alto va en fracción del alto de la escena y la x en fracción de su
    // ancho, así que el grosor del lomo hay que pasarlo de un lado al otro.
    const spine = (height * spineRatioOf(entry)) / sceneRatio
    // Se suma medio lomo porque la x es su centro y no su borde.
    const x = cursor + spine / 2
    cursor += spine * (1 + gap)

    return { ...entry, x, baseY: shelf.baseY, height }
  })
}
