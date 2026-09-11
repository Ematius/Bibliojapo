// Tomos colocados sobre la estantería del pasillo.
// Todo valor artístico ajustable vive aquí — nunca hardcodeado en el componente.
//
// Dónde se posa cada tomo NO se decide aquí: sale de la rejilla del mueble, en
// `shelfGrid.ts`. Este archivo dice cómo ES un tomo —sus caras, su forma, cómo
// gira y cómo se adelanta— y cuáles hay; la estantería dice dónde caben.

import { BLOCK_PLAN } from '../../content/hiragana/blocks'
import { placeVolumes, type Placement } from './shelfGrid'
import { VOLUME_ART, type VolumeArt } from './volumeArt'

// El canto: el filo del bloque de hojas, la cara opuesta al lomo. Es lo que
// cierra el libro por detrás y lo que se asoma por el lado al girarlo, y sin él
// el tomo se lee como dos cartones sueltos en vez de como un objeto.
//
// Es el único que comparten todos los tomos: las hojas son papel y el papel es el
// mismo en toda la colección. Lomo y tapas son de cada uno — ver `volumeArt.ts`.
export const FORE_EDGE = '/images/hallways/books/libro-cerrado-100.webp'

// Un tomo antes de colocarse: qué es y qué trae dentro, sin dónde va.
export interface VolumeEntry {
  id: string
  // Qué puesto ocupa en la colección, empezando por 1. Es lo que se le dice a
  // quien lee: «se abre al sellar el tomo 3».
  number: number
  // Texto accesible, en español.
  label: string
  // Qué bloque del temario contiene, por su id en `content/hiragana/blocks.ts`.
  // Un tomo ES un bloque: aquí se dice cuál y de ahí sale todo lo que lleva.
  blockId: string
  // Sus caras y su forma.
  art: VolumeArt
}

// El mismo tomo ya posado en su balda.
export type ShelfVolume = VolumeEntry & Placement

// La colección, EN ORDEN: un tomo por cada bloque del temario, escrito o no. Doce
// bloques son doce tomos, y el día que el plan cambie la estantería cambia con él
// sin tocar nada aquí.
//
// Cada tomo se lleva las caras de su mismo puesto en `VOLUME_ART`. Si algún día
// hubiera más bloques que dibujos, los que falten repiten el último —se ve, que
// es lo que hace falta: un tomo sin tapas sería mucho peor que uno repetido—.
//
// El orden de esta lista ES el orden en la balda: se llena el vano izquierdo de
// la balda de arriba, luego el derecho, y de ahí se baja. No hay coordenadas que
// medir: la rejilla lo coloca sola.
const VOLUME_ORDER: readonly VolumeEntry[] = BLOCK_PLAN.map((blockId, index) => ({
  id: blockId,
  number: index + 1,
  label: `Tomo ${index + 1}`,
  blockId,
  art: VOLUME_ART[Math.min(index, VOLUME_ART.length - 1)],
}))

// Los mismos tomos, ya posados en su balda. `placeVolumes` les añade el centro
// del lomo, la balda y el alto a partir de la rejilla y del grosor de cada uno.
export const SHELF_VOLUMES: readonly ShelfVolume[] = placeVolumes(
  VOLUME_ORDER,
  (entry) => entry.art.shape.spineRatio,
)

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

// Lo que pasa al pulsar un tomo que todavía no se puede coger.
//
// No sale: da un tirón corto, como un libro encajado que no cede, y encima aparece
// una nota diciendo por qué. El tirón es lo que hace que no parezca roto — un tomo
// que no reacciona a nada se lee como un fallo; uno que se resiste, como algo que
// se abrirá.
export const VOLUME_LOCK = {
  // Cuánto cede al tirar, en grados de giro sobre su eje. Poco: es un libro que
  // no sale, no uno que se mueve.
  nudgeDeg: 7,
  nudgeSeconds: 0.12,
  // La vuelta a su sitio, con un pequeño rebote de algo que se suelta.
  settleSeconds: 0.7,
  settleEase: 'elastic.out(1, 0.4)',
  // Cuánto se queda la nota a la vista antes de irse sola. Da para leer una
  // frase corta dos veces.
  noteSeconds: 3.2,
  noteFadeSeconds: 0.35,
  // Si no se ha podido preguntar qué tomos están abiertos, cuánto se espera para
  // volver a intentarlo.
  retrySeconds: 4,
}

// El velo que separa el tomo del pasillo mientras está fuera de la balda.
export const VOLUME_SCRIM = {
  // Entra bastante antes de que el tomo termine de acercarse: para cuando
  // llega, el fondo ya está apagado y el libro es lo único que se mira.
  fadeSeconds: 0.5,
  ease: 'power2.out',
}
