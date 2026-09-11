// Tomos colocados sobre la estantería del pasillo.
// Todo valor artístico ajustable vive aquí — nunca hardcodeado en el componente.
//
// Dónde se posa cada tomo NO se decide aquí: sale de la rejilla del mueble, en
// `shelfGrid.ts`. Este archivo dice cómo ES un tomo —sus caras, su forma, cómo
// gira y cómo se adelanta— y cuáles hay; la estantería dice dónde caben.

import { placeVolumes, type VolumeEntry } from './shelfGrid'

export type { ShelfVolume, VolumeEntry } from './shelfGrid'

// Las dos caras del tomo, renderizadas de frente y con cámara ortográfica. No
// son una ilustración del libro: son sus caras reales, que se montan en el
// espacio para formar la esquina. Por eso no valdría un render en tres cuartos,
// que trae la perspectiva ya pintada en el píxel.
export const VOLUME_FACES = {
  spine: '/images/hallways/books/tomo-lomo.webp',
  cover: '/images/hallways/books/tomo-tapa.webp',
  // La contratapa. Es la que asoma por la derecha con el tomo en la balda: la
  // portada de verdad cuelga del otro lado, mirando al fondo del estante, y solo
  // aparece cuando el tomo se gira hacia el lector. De momento reutiliza el
  // render de la tapa; cuando haya un dibujo propio de la contra, se cambia aquí.
  back: '/images/hallways/books/tomo-tapa.webp',
  // El canto: el filo del bloque de hojas, la cara opuesta al lomo. Es lo que
  // cierra el libro por detrás y lo que se asoma por el lado al girarlo, y sin
  // ella el tomo se lee como dos cartones sueltos en vez de como un objeto.
  foreEdge: '/images/hallways/books/libro-cerrado-100.webp',
  // La portada pintada de tres cuartos: la tapa con el bloque de hojas asomando
  // por la izquierda, con su perspectiva y su sombra ya resueltas en el píxel.
  //
  // Existe porque armar esa misma vista con planos quedaba pobre: por geometría
  // el canto sale de un par de píxeles y se lee como una raya, no como el filo
  // de un libro. En la pose de portada se pone encima y sustituye al montaje.
  coverTurned: '/images/hallways/books/tapa-degrado.webp',
}

// Proporciones del tomo, medidas sobre esos dos renders y expresadas respecto a
// su ALTO. De aquí sale la forma de la caja: el alto es la referencia, el ancho
// de la tapa y el grosor del lomo se derivan de él.
//
// Los dos archivos no tenían exactamente la misma altura (1441 y 1415 px), pero
// da igual: cada cara se dimensiona por su propia proporción a una altura común,
// así que la diferencia se normaliza sola.
export const VOLUME_SHAPE = {
  coverRatio: 905 / 1415, // ancho de la tapa ÷ alto
  spineRatio: 284 / 1441, // grosor del lomo ÷ alto
  // La tapa pintada de tres cuartos, medida sobre su archivo ya recortado a la
  // silueta. Es más ancha que la plana, y la diferencia entre las dos es
  // exactamente el bloque de hojas que asoma. De ahí sale su ancho en el CSS,
  // así que no hay ningún número puesto a ojo para encajarla.
  coverTurnedRatio: 938 / 1358,
}

// La colección, EN ORDEN. Es lo único que hay que tocar para poner un tomo más
// en la estantería: se añade su entrada al final y la rejilla lo coloca sola, en
// el primer hueco libre. No hay coordenadas que medir ni que revisar después.
//
// El orden de esta lista ES el orden en la balda: se llena el vano izquierdo de
// la balda de arriba, luego el derecho, y de ahí se baja. Reordenarla recoloca
// la estantería entera.
const VOLUME_ORDER: readonly VolumeEntry[] = [
  { id: 'nibanme', label: 'Tomo にばんめ', blockId: 'b1' },
]

// Los mismos tomos, ya posados en su balda. `placeVolumes` les añade el centro
// del lomo, la balda y el alto a partir de la rejilla y del grosor del render.
export const SHELF_VOLUMES = placeVolumes(VOLUME_ORDER, VOLUME_SHAPE.spineRatio)

// Poses del tomo, en grados de giro sobre su eje vertical.
//
// El tomo es una caja cerrada de cuatro caras —lomo, contratapa, portada y
// canto— así que el ángulo no elige qué imagen enseñar: enseña la que toque, y
// las demás se esconden solas. De ahí que estos tres números sean lo único que
// hay que tocar para recolocar el gesto entero.
//
// Los cuatro van de menos a más y el tomo NUNCA cambia de sentido: sale del
// estante y sigue rodando hacia el mismo lado hasta quedar abierto. Es lo que
// hace que las cuatro paradas se lean como un solo gesto —alguien girando un
// libro en la mano— y no como cuatro animaciones pegadas. Si se reordenan las
// poses, conviene que los grados sigan yendo en orden creciente.
export const VOLUME_TURN = {
  // ── AQUÍ SE AJUSTA LA INCLINACIÓN DEL TOMO EN LA BALDA ──────────────────
  // Grados que el tomo está girado mientras está colocado. Negativo porque es
  // el sentido que trae hacia el pasillo el lado del que cuelga la contra, así
  // que para enderezarlo hay que ACERCARSE A CERO, no alejarse.
  //
  //   -20   muy girado: se ve casi tanta contra como lomo
  //   -12   tres cuartos claro
  //   -10   apenas inclinado, con un hilo de contra que le da grosor  ← ahora
  //    -6   casi de frente
  //     0   completamente plano: el lomo de cara y la contra desaparecida,
  //         porque se queda exactamente de canto. El tomo pierde el volumen.
  //
  // Si se cambia, hay que cambiar también el `rotateY` de ShelfVolume.scss:
  // es el mismo ángulo escrito como estado de partida, antes de que GSAP tome
  // el control, y es el que queda fijo con «reducir movimiento».
  // ────────────────────────────────────────────────────────────────────────
  restDeg: -10,
  // Adelantado, con el lomo de frente y las dos tapas de perfil.
  spineDeg: 0,
  // De lado, enseñando el canto: el bloque de hojas cerrado, de cara. Es la
  // última parada antes de abrirse, y no es un capricho de orden — un libro que
  // tienes de frente se abre justo desde aquí, con el filo de las hojas hacia
  // ti. Por eso la apertura arranca de esta pose y no de la portada.
  //
  // Aquí no hace falta centrar nada: a media vuelta el canto cae justo sobre el
  // eje del lomo, que es por donde el tomo está anclado.
  edgeDeg: 180,
  // La portada mirando al lector. Exactamente 90, o sea de frente del todo: el
  // grosor ya no lo pone la geometría sino la tapa pintada de tres cuartos, que
  // entra encima al final del giro. Antes esto estaba pasado de 90 para que el
  // canto asomase, pero por geometría salía una raya de un par de píxeles.
  //
  // A 90 las otras tres caras quedan de canto y desaparecen solas, así que la
  // pintada aterriza sobre una tapa limpia y sin nada asomando por detrás.
  coverDeg: 90,
  // Distancia de la cámara. Cuanto más baja, más exagerada la fuga; a esta el
  // giro se lee como volumen sin que el tomo se deforme al acercarse.
  perspectivePx: 20000,
}

// El tomo adelantándose hasta quedar delante del lector.
//
// El destino va en fracciones del stage y no de la ventana porque el tomo vive
// dentro del stage: como el stage está centrado, su centro y el de la ventana
// son el mismo punto. En pantallas más anchas que 16:9 el tomo queda algo mayor
// de lo indicado, que es el único desajuste y no molesta.
export const VOLUME_PULL = {
  durationSeconds: 1.05,
  // Sale del estante con decisión y frena al llegar, como algo que alguien
  // acerca a propósito y no como algo que cae.
  ease: 'power3.inOut',
  // Cuánto se adelanta el segundo giro de un par al primero.
  //
  // Cada pulsación encadena dos giros, y esperar a que el primero acabe del todo
  // dejaba una pausa en medio. La culpa la tiene el `ease`: `power3.inOut` frena
  // tantísimo al final que el último cuarto de segundo casi no se mueve nada, así
  // que el giro PARECE terminado bastante antes de estarlo, y esa diferencia se
  // lee como una espera.
  //
  // Con esto el segundo giro entra mientras el primero remata: como GSAP arranca
  // desde donde esté el tomo en ese momento, no hay salto — el movimiento se
  // encadena en vez de reiniciarse.
  //
  // Es el número que hay que subir si la continuación sigue pareciendo lenta.
  // Pasado el medio segundo empieza a comerse la pose intermedia: el tomo dejaría
  // de llegar a poner el lomo de frente antes de seguir girando.
  relayOverlapSeconds: 0.35,
  focusX: 0.5,
  focusY: 0.52,
  focusHeight: 0.66,
  // Alto del tomo de LADO, con el canto de frente, en fracción del stage.
  //
  // Va aparte del resto porque esa pose necesita su propia medida: a media
  // vuelta el filo de las hojas queda a un ancho de tapa de la cámara, y la
  // perspectiva lo agranda alrededor de un 30% respecto a las demás. Con el
  // mismo número que `focusHeight` se salía por arriba de la pantalla.
  //
  // Ese agrandamiento se descuenta en el hook, así que este número es el alto
  // que de verdad se ve: 0.5 es medio stage. Es el valor a mover si el libro de
  // canto se ve grande o pequeño.
  edgeHeight: 0.5,
}

// El relevo entre la tapa plana y la tapa pintada de tres cuartos.
//
// Entra al FINAL del giro y no durante: mientras el tomo rota se ve la tapa
// plana, y solo al asentarse aparece el bloque de hojas. Así el cambio se lee
// como el libro acabando de girar, y no como una imagen sustituyendo a otra.
export const COVER_TURN_ART = {
  // Arranca pasada la mitad larga del giro y termina justo cuando el tomo se
  // para. Si se cambia `VOLUME_PULL.durationSeconds`, este es el número que hay
  // que revisar para que los dos sigan acabando a la vez.
  delaySeconds: 0.62,
  durationSeconds: 0.45,
  ease: 'power2.out',
  // Apagado. No hace falta para pasar al canto —allí la esconde el propio giro,
  // que la escorza hasta hacerla desaparecer—, sino para cuando el tomo se
  // guarda desde esta pose: entonces vuelve al estante y la tapa pintada ya no
  // se corresponde con lo que se ve.
  hideSeconds: 0.18,
}

// El velo que separa el tomo del pasillo mientras está fuera de la balda.
export const VOLUME_SCRIM = {
  // Entra bastante antes de que el tomo termine de acercarse: para cuando
  // llega, el fondo ya está apagado y el libro es lo único que se mira.
  fadeSeconds: 0.5,
  ease: 'power2.out',
}
