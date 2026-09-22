import { readAllSeals } from '../shared/seals'
import { announceApiChange } from './apiChanges'
import type { Account } from './contract'
import { mockServer } from './mockServer'

export { PASSWORD_MIN_LENGTH, type Account } from './contract'

// `loading` es distinto de «sin sesión»: sin él, la barra ofrecería «Crear cuenta»
// medio segundo a quien ya la tiene.
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

// Si el servidor no contesta, la sesión se da por cerrada en vez de esperar sin
// fin: así el tomo 1, que es gratis, se puede leer igual.
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

// La primera suscripción es la que dispara la pregunta al servidor.
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

// Las tres formas de entrar suben lo hecho sin cuenta en este navegador: la cuenta
// lo absorbe al abrirse. Ver CLAUDE.md.

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

// La sesión sigue abierta al cambiarla: quien la cambia está delante, y echarle sería
// castigarle por hacerlo bien.
export async function changePassword(input: { current: string; next: string }) {
  await mockServer.changePassword(input)
}

// Salir no borra nada del navegador: el tomo 1 sigue sellado sin cuenta abierta.
export async function signOut() {
  await mockServer.signOut()
  setSession(fromAccount(null))
}
