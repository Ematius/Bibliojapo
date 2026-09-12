import { useSyncExternalStore } from 'react'

// Si el panel de cuenta está abierto, y por qué.
//
// Lo abren dos sitios que no se conocen —el botón de la barra y un tomo que pide
// cuenta para abrirse—, y el panel está montado una sola vez, arriba del todo. Por
// eso el estado vive aquí y no en ninguno de los dos: cada uno llama a
// `openAccountPanel` y el panel se entera.
// Por cuál de las dos vías empieza el formulario. Las dos están siempre a un
// enlace de distancia dentro del panel; esto solo decide cuál se ve primero.
export type AccountMode = 'signUp' | 'signIn'

export interface AccountPanelState {
  open: boolean
  // Una línea sobre por qué se pide la cuenta, cuando la pide algo concreto. Sin
  // ella el panel se presenta solo; con ella, empieza por el motivo.
  reason: string | null
  // Quien llega desde «Crear cuenta» no tiene una, y quien llega desde «Entrar»
  // sí: abrir siempre por crear obligaba al segundo a buscar el enlace de cambiar
  // de vía antes de poder escribir nada.
  mode: AccountMode
}

let state: AccountPanelState = { open: false, reason: null, mode: 'signUp' }
const listeners = new Set<() => void>()

function setState(next: AccountPanelState): void {
  state = next
  listeners.forEach((listener) => listener())
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

export function openAccountPanel(
  reason: string | null = null,
  mode: AccountMode = 'signUp',
): void {
  setState({ open: true, reason, mode })
}

export function closeAccountPanel(): void {
  // El motivo se conserva al cerrar: el panel lo sigue enseñando mientras se
  // va, y vaciarlo de golpe cambiaría el texto a media salida.
  setState({ ...state, open: false })
}

export function useAccountPanel(): AccountPanelState {
  return useSyncExternalStore(subscribe, () => state)
}
