import { useSyncExternalStore } from 'react'

// Si el panel de cuenta está abierto, y por qué.
//
// Lo abren dos sitios que no se conocen —el botón de la barra y un tomo que pide
// cuenta para abrirse—, y el panel está montado una sola vez, arriba del todo. Por
// eso el estado vive aquí y no en ninguno de los dos: cada uno llama a
// `openAccountPanel` y el panel se entera.
export interface AccountPanelState {
  open: boolean
  // Una línea sobre por qué se pide la cuenta, cuando la pide algo concreto. Sin
  // ella el panel se presenta solo; con ella, empieza por el motivo.
  reason: string | null
}

let state: AccountPanelState = { open: false, reason: null }
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

export function openAccountPanel(reason: string | null = null): void {
  setState({ open: true, reason })
}

export function closeAccountPanel(): void {
  // El motivo se conserva al cerrar: el panel lo sigue enseñando mientras se
  // va, y vaciarlo de golpe cambiaría el texto a media salida.
  setState({ ...state, open: false })
}

export function useAccountPanel(): AccountPanelState {
  return useSyncExternalStore(subscribe, () => state)
}
