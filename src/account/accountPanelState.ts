import { useSyncExternalStore } from 'react'

// Si el panel de cuenta está abierto, y por qué.
//
// Lo abren dos sitios que no se conocen —el botón de la barra y un tomo que pide cuenta— y el
// panel está montado una sola vez, arriba del todo. Por eso el estado vive aquí.
// Por cuál de las dos vías empieza el formulario. Las dos están siempre a un enlace de
// distancia dentro del panel.
//
// `resetPassword` no lo elige quien abre el panel: lo pone `AccountPanel` al recibir el
// aviso de Supabase de que se ha vuelto del enlace de recuperar la contraseña.
export type AccountMode = 'signUp' | 'signIn' | 'resetPassword'

export interface AccountPanelState {
  open: boolean
  // Por qué se pide la cuenta, cuando lo pide algo concreto. Sin ella el panel se presenta
  // solo; con ella, empieza por el motivo.
  reason: string | null
  // Abrir siempre por «crear» obligaba a quien ya tiene cuenta a buscar el enlace de cambiar
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
  // El motivo se conserva al cerrar: el panel lo sigue enseñando mientras se va, y vaciarlo
  // de golpe cambiaría el texto a media salida.
  setState({ ...state, open: false })
}

export function useAccountPanel(): AccountPanelState {
  return useSyncExternalStore(subscribe, () => state)
}
