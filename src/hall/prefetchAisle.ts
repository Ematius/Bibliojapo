import { findAisle } from '../shared/aisles'

// Entrar en un pasillo son cuatro viajes seguidos: el HTML, el JS de la app, el trozo del
// pasillo —que no se pide hasta que el router cambia de ruta— y solo entonces sus imágenes.
// Desde el vestíbulo sobra tiempo para adelantar los dos del medio, y el barrido solo dura
// 1,05 s: lo que no esté pedido antes de pulsar, llega tarde.
//
// El `import()` es el MISMO que hace `App.tsx` con `lazy`, así que apunta al mismo trozo y
// no añade ninguno: escribirlo con otra ruta lo duplicaría.
let codeAsked = false

export function prefetchAisleCode(): void {
  if (codeAsked) return
  codeAsked = true

  void import('../aisle/LibraryAisle.tsx')
}

// La ilustración del pasillo se pide al pasar por encima de su cartel. No las cuatro al
// entrar: son 1,4 MB y tres de ellas no se van a abrir.
const scenesAsked = new Set<string>()

export function prefetchAisleScene(aisleId: string): void {
  if (scenesAsked.has(aisleId)) return
  scenesAsked.add(aisleId)

  const aisle = findAisle(aisleId)
  if (aisle) new Image().src = aisle.scene
}
