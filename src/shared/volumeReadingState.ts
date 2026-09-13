import { useSyncExternalStore } from 'react'

// Cuántos tomos hay fuera de la balda a la vez. Un contador y no un booleano: aunque hoy solo
// se saca uno cada vez, dos que se cerraran a la vez pisarían un `false` que no les tocaba.
let count = 0
const listeners = new Set<() => void>()

function notify(): void {
  listeners.forEach((listener) => listener())
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

// Se llama al sacar un tomo y se guarda su cierre. El libro abierto pinta por encima de la
// barra de navegación —ver `SiteNav`—, así que mientras haya uno fuera, la barra se aparta.
export function markVolumeOpen(): () => void {
  count += 1
  notify()
  return () => {
    count -= 1
    notify()
  }
}

export function useAnyVolumeOpen(): boolean {
  return useSyncExternalStore(subscribe, () => count > 0)
}
