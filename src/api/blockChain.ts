import { AISLE_CONTENT, AISLE_ORDER, globalBlockId, type AisleId } from '../content/aisleContent'

export interface ChainedBlock {
  aisleId: AisleId
  localId: string
  blockId: string
  // Su puesto DENTRO del pasillo, empezando por 1: el mismo número que enseña la
  // balda, no su posición en esta lista conjunta.
  volumeNumber: number
  // Un id del plan sin bloque escrito es un tomo que se ve en la balda y se
  // desbloquea a su hora, pero al pulsarlo dice que todavía se está escribiendo.
  published: boolean
}

// La cadena de desbloqueo entera, de un tirón: hiragana completo, luego katakana
// completo, luego kanji, luego vocabulario. Un tomo pide el ANTERIOR de esta lista,
// así que dentro de un pasillo es la cadena de siempre —cada bloque pide el de
// antes— y en la frontera entre dos pasillos es «termina el pasillo anterior».
export const BLOCK_CHAIN: readonly ChainedBlock[] = AISLE_ORDER.flatMap((aisleId) =>
  AISLE_CONTENT[aisleId].blockPlan.map((localId, index) => ({
    aisleId,
    localId,
    blockId: globalBlockId(aisleId, localId),
    volumeNumber: index + 1,
    published: AISLE_CONTENT[aisleId].blocksById.has(localId),
  })),
)
