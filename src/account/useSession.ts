import { useSyncExternalStore } from 'react'
import { getSession, subscribeSession, type Session } from '../api/account'

// Quién hay en sesión, al día. Todas las pantallas que lo usan ven lo mismo en el
// mismo momento: la sesión vive en un solo sitio. Ver `api/account.ts`.
export function useSession(): Session {
  return useSyncExternalStore(subscribeSession, getSession)
}
