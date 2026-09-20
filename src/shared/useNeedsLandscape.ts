import { useSyncExternalStore } from 'react'

// Pantalla de pie y estrecha: un móvil en vertical. 48rem es el mismo corte que el resto del
// proyecto usa para «pantalla pequeña».
//
// Quien lo usa pide girar en vez de enseñar la escena cortada: Mi escritorio, donde
// obligar a recorrer la mesa es peor que pedir girar, y la intro, que es un solo video
// horizontal.
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
