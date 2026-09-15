// Los valores ajustables del tomo en la estantería. Dónde se posa cada uno NO se decide
// aquí: sale de la rejilla de `shelfGrid.ts`. Este archivo dice cómo ES un tomo —sus
// caras, su forma, cómo gira y cómo se adelanta— y cuáles hay.

import { AISLE_CONTENT, globalBlockId, type AisleId } from '../../content/aisleContent'
import { placeVolumes, type Placement } from './shelfGrid'
import { VOLUME_ART, type VolumeArt } from './volumeArt'

// El filo del bloque de hojas, la cara opuesta al lomo: sin él el tomo se lee como dos
// cartones sueltos. Es el único que comparten todos, porque el papel es el mismo en toda
// la colección; lomo y tapas son de cada uno, en `volumeArt.ts`.
export const FORE_EDGE = '/images/hallways/books/libro-cerrado-100.webp'

export interface VolumeEntry {
  id: string
  // Su puesto en la colección, empezando por 1: es lo que se le dice a quien lee.
  number: number
  label: string
  // Un tomo ES un bloque: aquí se dice cuál, y de ahí sale todo lo que lleva.
  blockId: string
  art: VolumeArt
}

export type ShelfVolume = VolumeEntry & Placement

// La colección de UN pasillo, EN ORDEN: un tomo por cada bloque de su plan, escrito o
// no, así que el día que el plan cambie la estantería cambia con él. El orden de esta
// lista ES el orden en la balda; no hay coordenadas que medir.
//
// Un pasillo sin temario todavía da la lista vacía —ver `content/aisleContent.ts`—, así
// que la balda no saca ningún tomo hasta que exista su `content/<pasillo>/blocks.ts`.
//
// Cada tomo se lleva las caras de su mismo puesto en `VOLUME_ART`. Si hubiera más bloques
// que dibujos, los que falten repiten el último: se ve, y un tomo sin tapas sería peor.
export function buildShelfVolumes(aisleId: string): readonly ShelfVolume[] {
  const content = AISLE_CONTENT[aisleId as AisleId]
  if (!content) return []

  const volumeOrder: readonly VolumeEntry[] = content.blockPlan.map((localId, index) => {
    const id = globalBlockId(aisleId as AisleId, localId)
    return {
      id,
      number: index + 1,
      label: `Tomo ${index + 1}`,
      blockId: id,
      art: VOLUME_ART[Math.min(index, VOLUME_ART.length - 1)],
    }
  })

  return placeVolumes(volumeOrder, (entry) => entry.art.shape.spineRatio)
}

// Poses del tomo, en grados de giro sobre su eje vertical. El tomo es una caja cerrada de
// cuatro caras, así que el ángulo no elige qué imagen enseñar: enseña la que toque y las
// demás se esconden solas.
//
// Van de menos a más y el tomo NUNCA cambia de sentido: sale del estante y sigue rodando
// hacia el mismo lado. Es lo que hace que las cuatro paradas se lean como un solo gesto.
export const VOLUME_TURN = {
  // Grados que el tomo está girado en la balda. Negativo porque es el sentido que trae
  // hacia el pasillo el lado del que cuelga la contra: para enderezarlo hay que ACERCARSE
  // A CERO. En 0 se queda exactamente de canto y pierde el volumen.
  //
  // Si se cambia, hay que cambiar también el `rotateY` de ShelfVolume.scss: es el mismo
  // ángulo escrito como estado de partida, y el que queda fijo con «reducir movimiento».
  restDeg: -10,
  spineDeg: 0,
  // De lado, enseñando el canto. Es la última parada antes de abrirse, y no por orden: un
  // libro que tienes de frente se abre justo desde aquí, con el filo de las hojas hacia ti.
  // A media vuelta el canto cae sobre el eje del lomo, que es por donde está anclado.
  edgeDeg: 180,
  // La portada de frente. Exactamente 90: así las otras tres caras quedan de canto y
  // desaparecen solas, y la tapa pintada de tres cuartos aterriza sobre una tapa limpia.
  // Pasado de 90 el canto asomaba como una raya de un par de píxeles.
  coverDeg: 90,
  // Distancia de la cámara: cuanto más baja, más exagerada la fuga.
  perspectivePx: 20000,
}

// El destino —`focusX`, `focusY`— va en fracciones de la VENTANA: un libro que alguien
// acerca queda delante de quien mira, y eso no depende de por dónde esté recortada la
// escena. El tomo se mueve en fracciones del stage, así que el paso de un sistema a otro
// lo hace `useVolumePull`. Los tamaños sí van en fracciones del alto del STAGE: el tomo
// crece con la escena.
export const VOLUME_PULL = {
  durationSeconds: 1.05,
  // Sale con decisión y frena al llegar, como algo que alguien acerca a propósito.
  ease: 'power3.inOut',
  // Cuánto se adelanta el segundo giro de un par al primero. Cada pulsación encadena dos,
  // y esperar a que el primero acabe dejaba una pausa: `power3.inOut` frena tanto al final
  // que el giro PARECE terminado antes de estarlo. GSAP arranca desde donde esté el tomo,
  // así que no hay salto.
  //
  // Pasado el medio segundo empieza a comerse la pose intermedia y el tomo deja de llegar
  // a poner el lomo de frente.
  relayOverlapSeconds: 0.35,
  focusX: 0.5,
  focusY: 0.52,
  focusHeight: 0.66,
  // Alto del tomo de LADO, con el canto de frente. Necesita su propia medida: a media
  // vuelta el filo queda a un ancho de tapa de la cámara y la perspectiva lo agranda un
  // 30 %, así que con `focusHeight` se salía por arriba. El agrandamiento se descuenta en
  // el hook, de modo que este número es el alto que de verdad se ve.
  edgeHeight: 0.5,
}

// Entra al FINAL del giro y no durante: mientras el tomo rota se ve la tapa plana, y solo
// al asentarse aparece el bloque de hojas. Así se lee como el libro acabando de girar.
export const COVER_TURN_ART = {
  // Arranca pasada la mitad larga del giro y termina cuando el tomo se para. Si cambia
  // `VOLUME_PULL.durationSeconds`, hay que revisarlo para que sigan acabando a la vez.
  delaySeconds: 0.62,
  durationSeconds: 0.45,
  ease: 'power2.out',
  // No hace falta para pasar al canto —allí la esconde el propio giro—, sino para cuando
  // el tomo se guarda desde esta pose.
  hideSeconds: 0.18,
}

// Un tomo que todavía no se puede coger no sale: da un tirón corto, como un libro
// encajado. Uno que no reacciona a nada se lee como un fallo; uno que se resiste, no.
export const VOLUME_LOCK = {
  // Cuánto cede al tirar. Poco: es un libro que no sale, no uno que se mueve.
  nudgeDeg: 7,
  nudgeSeconds: 0.12,
  settleSeconds: 0.7,
  settleEase: 'elastic.out(1, 0.4)',
  // Cuánto se queda la nota a la vista. Da para leer una frase corta dos veces.
  noteSeconds: 3.2,
  noteFadeSeconds: 0.35,
}

export const VOLUME_SCRIM = {
  // Entra antes de que el tomo termine de acercarse: para cuando llega, el fondo ya está
  // apagado.
  fadeSeconds: 0.5,
  ease: 'power2.out',
}
