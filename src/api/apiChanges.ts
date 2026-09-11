// El aviso de que algo ha cambiado del lado del usuario: ha entrado o salido de
// su cuenta, ha ganado un sello, se le ha abierto un tomo.
//
// No lleva QUÉ ha cambiado a propósito. Quien escucha vuelve a pedir lo suyo —la
// estantería, qué tomos se abren; la barra, quién hay en sesión—, y así ninguna
// pantalla depende de que otra le cuente los detalles. Con el servidor de verdad
// esto lo disparará la respuesta a cada escritura, o la suscripción en tiempo real
// si se elige Firebase; quien escucha no se entera de la diferencia.

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
