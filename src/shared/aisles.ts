// Registro de los pasillos de la biblioteca: Hiragana, Katakana, Kanji y
// Vocabulario. Es la única lista que hay de ellos, y de aquí salen tanto la
// ilustración de cada uno como su ruta.
//
// Vive fuera de los dominios porque lo necesitan dos: el pasillo se pinta a
// partir de él, y el vestíbulo lo usa para saber adónde lleva cada cartel y qué
// ilustración deslizar antes de cambiar de ruta.
//
// Añadir un pasillo nuevo es añadir una entrada aquí y su cartel en
// hall/aisleSignsConfig.ts. No hay componente que crear ni ruta que registrar:
// el pasillo es uno solo para todas las secciones y la ruta sale del id.

export interface Aisle {
  id: string
  // Nombre de la sección, en español. De él sale el texto accesible del cartel.
  label: string
  // Ilustración de la estantería, a pantalla completa.
  scene: string
}

export const AISLES = [
  { id: 'hiragana', label: 'Hiragana', scene: '/images/hallways/pasillo-hiragana.webp' },
] as const satisfies readonly Aisle[]

// La ruta se deriva del id en lugar de escribirse en cada entrada: así no puede
// existir un cartel que apunte a una ruta que no case con su pasillo.
export function aisleRoute(id: string): string {
  return `/pasillo/${id}`
}

// Devuelve undefined cuando el id no existe —una URL escrita a mano, un enlace
// viejo—, que es lo que deja al pasillo decidir adónde mandar al visitante.
export function findAisle(id: string | undefined): Aisle | undefined {
  return AISLES.find((aisle) => aisle.id === id)
}
