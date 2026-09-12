// La única lista de pasillos que hay. Añadir uno es añadir una entrada aquí y su
// cartel en hall/aisleSignsConfig.ts: no hay componente ni ruta que registrar.

export interface Aisle {
  id: string
  label: string
  scene: string
}

export const AISLES = [
  { id: 'hiragana', label: 'Hiragana', scene: '/images/hallways/pasillo-hiragana.webp' },
] as const satisfies readonly Aisle[]

// La ruta se deriva del id en vez de escribirse en cada entrada: así no puede haber
// un cartel que apunte a una ruta que no case con su pasillo.
export function aisleRoute(id: string): string {
  return `/pasillo/${id}`
}

// `undefined` cuando el id no existe —una URL a mano, un enlace viejo—: es lo que
// deja al pasillo decidir adónde mandar al visitante.
export function findAisle(id: string | undefined): Aisle | undefined {
  return AISLES.find((aisle) => aisle.id === id)
}
