import type { User } from '@supabase/supabase-js'
import { announceApiChange } from './apiChanges'
import { ApiError } from './apiError'
import type { Account } from './contract'
import { supabase } from './supabase'
import { throwAuthError } from './supabaseError'

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

// El nombre vive en `profiles` y no en los metadatos del usuario: si se lee de los
// metadatos, cambiarlo en Mi escritorio deja las dos copias en desacuerdo.
async function accountFrom(user: User): Promise<Account> {
  const { data } = await supabase.from('profiles').select('name').eq('id', user.id).maybeSingle()
  const meta = user.user_metadata ?? {}

  return {
    id: user.id,
    name: data?.name || meta.name || meta.full_name || '',
    email: user.email ?? '',
    provider: user.app_metadata?.provider === 'google' ? 'google' : 'password',
  }
}

// Si el servidor no contesta, la sesión se da por cerrada en vez de esperar sin
// fin: así el tomo 1, que es gratis, se puede leer igual.
async function loadSession(user: User | null): Promise<void> {
  if (!user) return setSession(fromAccount(null))

  try {
    setSession(fromAccount(await accountFrom(user)))
  } catch {
    setSession(fromAccount(null))
  }
}

// `INITIAL_SESSION` llega sola al arrancar, así que esto sirve para las tres cosas:
// la sesión guardada, la vuelta del redirect de Google y el cierre desde otra pestaña.
//
// Dentro del callback NO se puede esperar a otra llamada de supabase: el cliente se
// queda bloqueado. Por eso el perfil se pide FUERA, en una tarea aparte.
supabase.auth.onAuthStateChange((_event, next) => {
  void Promise.resolve().then(() => loadSession(next?.user ?? null))
})

export function getSession(): Session {
  return session
}

// La primera suscripción es la que dispara la pregunta al servidor.
export function subscribeSession(listener: () => void): () => void {
  listeners.add(listener)

  if (!requested) {
    requested = true
    void supabase.auth.getUser().then(({ data }) => loadSession(data.user))
  }

  return () => {
    listeners.delete(listener)
  }
}

export async function signUp(input: { name: string; email: string; password: string }) {
  const name = input.name.trim()
  // Supabase no exige nombre y el carné sí. Se comprueba antes de llamar para no
  // dejar creada una cuenta que nazca sin nombre que enseñar.
  if (!name) throw new ApiError('missing-name')

  const { data, error } = await supabase.auth.signUp({
    email: input.email,
    password: input.password,
    // De aquí lo saca el disparador que crea la fila de `profiles`.
    options: { data: { name } },
  })
  if (error) throwAuthError(error)
  if (!data.user) throw new ApiError('unexpected')

  const account = await accountFrom(data.user)
  setSession(fromAccount(account))
  return account
}

export async function signIn(input: { email: string; password: string }) {
  const { data, error } = await supabase.auth.signInWithPassword(input)
  if (error) throwAuthError(error)

  const account = await accountFrom(data.user)
  setSession(fromAccount(account))
  return account
}

// No devuelve cuenta porque no vuelve: el navegador se va a Google. Quien recoge la
// vuelta es `onAuthStateChange`.
export async function signInWithGoogle(): Promise<void> {
  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    // Sin la query ni el hash: el que traiga la vuelta de Google los necesita libres.
    options: { redirectTo: window.location.origin + window.location.pathname },
  })
  if (error) throwAuthError(error)
}

// La sesión sigue abierta al cambiarla: quien la cambia está delante, y echarle sería
// castigarle por hacerlo bien.
export async function changePassword(input: { current: string; next: string }) {
  const { account } = getSession()
  if (!account) throw new ApiError('unauthorized')

  // Supabase deja cambiarla SIN pedir la actual. Se comprueba entrando otra vez con
  // ella: sin esto, un ordenador prestado un minuto basta para quedarse la cuenta.
  const check = await supabase.auth.signInWithPassword({
    email: account.email,
    password: input.current,
  })
  if (check.error) throw new ApiError('wrong-credentials')

  const { error } = await supabase.auth.updateUser({ password: input.next })
  if (error) throwAuthError(error)
}

// Salir no borra nada del navegador: el tomo 1 sigue sellado sin cuenta abierta.
export async function signOut() {
  const { error } = await supabase.auth.signOut()
  if (error) throwAuthError(error)
  setSession(fromAccount(null))
}
