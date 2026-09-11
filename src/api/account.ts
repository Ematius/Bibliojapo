// La cuenta: quién hay en sesión, entrar, salir y crearla.
//
// Es el lado de la APP del contrato: las pantallas llaman a estas funciones y no
// saben si detrás hay un servidor simulado, Firebase o Nest. El día que llegue el
// de verdad, se cambian las llamadas a `mockServer` por las suyas y nada más.
//
// ── La sesión, en un solo sitio ────────────────────────────────────────────
// La barra la enseña, la estantería decide con ella qué tomos abrir y el panel de
// cuenta la cambia. Si cada una la pidiera por su cuenta, tras entrar habría un
// rato en que la barra ya te saluda y la estantería todavía no se ha enterado. Por
// eso vive aquí, y quien la necesite se suscribe.
import { readAllSeals } from '../shared/seals'
import { announceApiChange } from './apiChanges'
import type { Account } from './contract'
import { mockServer } from './mockServer'

export { PASSWORD_MIN_LENGTH, type Account } from './contract'

// `loading` solo al principio, mientras se pregunta al servidor si ya había
// alguien dentro. Distinguirlo de «sin sesión» evita que la barra enseñe «Crear
// cuenta» medio segundo a alguien que ya la tiene.
export type Session =
  | { status: 'loading'; account: null }
  | { status: 'signedOut'; account: null }
  | { status: 'signedIn'; account: Account }

let session: Session = { status: 'loading', account: null }
let requested = false
const listeners = new Set<() => void>()

function setSession(next: Session): void {
  session = next
  listeners.forEach((listener) => listener())
  announceApiChange()
}

function fromAccount(account: Account | null): Session {
  return account ? { status: 'signedIn', account } : { status: 'signedOut', account: null }
}

// Pregunta al servidor quién hay en sesión. Si hay alguien, de paso sube lo que
// se haya ganado en este navegador desde la última vez —un sello conseguido sin
// conexión, por ejemplo—.
//
// Si el servidor no contesta se da por cerrada: es lo que deja leer el tomo 1, que
// es gratis, y un reintento al pulsar «Entrar» lo arregla. Lo contrario —esperar
// sin fin— dejaría la barra en blanco.
async function loadSession(): Promise<void> {
  try {
    const account = await mockServer.session()
    if (account) await mockServer.syncSeals(readAllSeals()).catch(() => undefined)
    setSession(fromAccount(account))
  } catch {
    setSession(fromAccount(null))
  }
}

export function getSession(): Session {
  return session
}

// Para `useSyncExternalStore`. La primera suscripción es la que dispara la
// pregunta al servidor: hasta que alguna pantalla necesita la sesión, no se pide.
export function subscribeSession(listener: () => void): () => void {
  listeners.add(listener)

  if (!requested) {
    requested = true
    void loadSession()
  }

  return () => {
    listeners.delete(listener)
  }
}

// Las tres formas de entrar llevan consigo lo hecho sin cuenta en este navegador:
// la cuenta lo absorbe al crearse o al abrirse. Ver «El progreso del tomo 1 se
// hará SIN cuenta y tiene que sobrevivir al registro» en CLAUDE.md.

export async function signUp(input: { name: string; email: string; password: string }) {
  const account = await mockServer.signUp({ ...input, seals: readAllSeals() })
  setSession(fromAccount(account))
  return account
}

export async function signIn(input: { email: string; password: string }) {
  const account = await mockServer.signIn({ ...input, seals: readAllSeals() })
  setSession(fromAccount(account))
  return account
}

export async function signInWithGoogle() {
  const account = await mockServer.signInWithGoogle({ seals: readAllSeals() })
  setSession(fromAccount(account))
  return account
}

// Salir no borra nada del navegador: los sellos hechos aquí siguen aquí, y el
// tomo 1 sigue sellado aunque ya no haya cuenta abierta.
export async function signOut() {
  await mockServer.signOut()
  setSession(fromAccount(null))
}
