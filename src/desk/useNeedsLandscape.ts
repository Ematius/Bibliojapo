import { useSyncExternalStore } from 'react'

// Pantalla de pie y estrecha: un móvil en vertical. 48rem es el mismo corte que el resto del
// proyecto usa para «pantalla pequeña».
//
// La mesa cubre por altura y en vertical solo se vería una franja del medio, con los objetos
// cortados. Se pide girar en vez de recorrerla: sobre la mesa hay tres objetos, y obligar a
// arrastrar para descubrir que existe la caja de juegos es peor que pedir girar.
const PORTRAIT_PHONE = '(orientation: portrait) and (max-width: 48rem)'

function subscribe(onChange: () => void) {
  const query = window.matchMedia(PORTRAIT_PHONE)
  query.addEventListener('change', onChange)
  return () => query.removeEventListener('change', onChange)
}

export function useNeedsLandscape(): boolean {
  return useSyncExternalStore(
    subscribe,
    () => window.matchMedia(PORTRAIT_PHONE).matches,
    () => false,
  )
}
