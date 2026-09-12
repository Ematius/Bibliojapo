// El aviso de que algo del usuario ha cambiado: ha entrado o salido, ha ganado un
// sello, se le ha abierto un tomo.
//
// No lleva QUÉ ha cambiado a propósito: quien escucha vuelve a pedir lo suyo, y así
// ninguna pantalla depende de que otra le cuente los detalles.

type Listener = () => void

const listeners = new Set<Listener>()

export function onApiChange(listener: Listener): () => void {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

export function announceApiChange(): void {
  listeners.forEach((listener) => listener())
}
