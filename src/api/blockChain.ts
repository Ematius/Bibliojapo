import { AISLE_CONTENT, AISLE_ORDER, globalBlockId, type AisleId } from '../content/aisleContent'

export interface ChainedBlock {
  aisleId: AisleId
  localId: string
  blockId: string
  // Su puesto DENTRO del pasillo, empezando por 1: el mismo número que enseña la
  // balda, no su posición en esta lista conjunta.
  volumeNumber: number
}

// La cadena de desbloqueo entera, de un tirón: hiragana completo, luego katakana
// completo, luego kanji, luego vocabulario. Un tomo pide el ANTERIOR de esta lista,
// así que dentro de un pasillo es la cadena de siempre —cada bloque pide el de
// antes— y en la frontera entre dos pasillos es «termina el pasillo anterior».
//
// Solo CUÁNTOS tomos hay y en qué orden, que es el plan y no el temario. Cuáles están
// escritos lo dice el servidor con `published_volumes()`.
export const BLOCK_CHAIN: readonly ChainedBlock[] = AISLE_ORDER.flatMap((aisleId) =>
  AISLE_CONTENT[aisleId].blockPlan.map((localId, index) => ({
    aisleId,
    localId,
    blockId: globalBlockId(aisleId, localId),
    volumeNumber: index + 1,
  })),
)
